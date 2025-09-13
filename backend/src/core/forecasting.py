import pandas as pd
from prophet import Prophet
import xgboost as xgb
from sklearn.model_selection import train_test_split
import numpy as np

# --- Feature Engineering ---
# This is a helper function for the XGBoost model
def create_time_series_features(df):
    """Creates time-series features from a date index."""
    df = df.copy()
    df['date'] = pd.to_datetime(df['date'])
    df['dayofweek'] = df['date'].dt.dayofweek
    df['quarter'] = df['date'].dt.quarter
    df['month'] = df['date'].dt.month
    df['year'] = df['date'].dt.year
    df['dayofyear'] = df['date'].dt.dayofyear
    df['weekofyear'] = df['date'].dt.isocalendar().week.astype(int)
    return df

# --- Base Forecaster Class ---
class Forecaster:
    def __init__(self, df: pd.DataFrame, horizon_weeks: int, promotion_dates: list = None):
        self.df = df.copy()
        self.horizon_weeks = horizon_weeks
        self.promotion_dates = pd.to_datetime(promotion_dates) if promotion_dates else pd.DatetimeIndex([])
        self.model = None

    def train_and_forecast(self):
        raise NotImplementedError

# --- Prophet Forecaster ---
class ProphetForecaster(Forecaster):
    def train_and_forecast(self):
        # Prepare data for Prophet
        df_prophet = self.df.rename(columns={'date': 'ds', 'value': 'y'})
        
        # Create a dataframe for promotion events if they exist
        holidays = None
        if not self.promotion_dates.empty:
            holidays = pd.DataFrame({
                'holiday': 'promotion',
                'ds': self.promotion_dates,
                'lower_window': 0,
                'upper_window': 1, # Event impacts the day of and day after
            })

        self.model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False,
            holidays=holidays
        )
        self.model.fit(df_prophet)

        # Create future dataframe and predict
        future = self.model.make_future_dataframe(periods=self.horizon_weeks * 7)
        forecast = self.model.predict(future)

        # Return only future predictions, resampled to weekly
        forecast_future = forecast[forecast['ds'] > df_prophet['ds'].max()]
        forecast_weekly = forecast_future[['ds', 'yhat']].resample('W-FRI', on='ds').mean().reset_index()
        
        return forecast_weekly.tail(self.horizon_weeks)


# --- XGBoost Forecaster ---
class XGBoostForecaster(Forecaster):
    def train_and_forecast(self):
        # 1. Feature Engineering
        df_featured = create_time_series_features(self.df)
        df_featured['is_promotion'] = df_featured['date'].isin(self.promotion_dates).astype(int)
        
        features = ['dayofweek', 'quarter', 'month', 'year', 'dayofyear', 'weekofyear']
        target = 'value'
        
        X = df_featured[features]
        y = df_featured[target]
        
        # 2. Train the XGBoost model
        # Using all historical data for training in this example
        self.model = xgb.XGBRegressor(
            objective='reg:squarederror',
            n_estimators=500,
            learning_rate=0.01,
            max_depth=4,
            subsample=0.8,
            colsample_bytree=0.8,
            early_stopping_rounds=50,
            eval_metric='rmse'
        )
        self.model.fit(X, y, eval_set=[(X, y)], verbose=False)

        # 3. Create future dataframe and features for prediction
        last_date = self.df['date'].max()
        future_dates = pd.date_range(start=last_date + pd.Timedelta(days=1), periods=self.horizon_weeks * 7, freq='D')
        future_df = pd.DataFrame({'date': future_dates})
        
        future_df_featured = create_time_series_features(future_df)
        future_df_featured['is_promotion'] = future_df_featured['date'].isin(self.promotion_dates).astype(int)
        
        X_future = future_df_featured[features]
        
        # 4. Make predictions
        predictions = self.model.predict(X_future)

        # Apply an extra boost for promotion days, as the model may under-represent one-off events
        promo_boost_multiplier = np.where(future_df_featured['is_promotion'] == 1, 1.25, 1) # 25% boost
        boosted_predictions = predictions * promo_boost_multiplier
        
        future_df['yhat'] = boosted_predictions
        future_df = future_df.rename(columns={'date': 'ds'})

        # 5. Resample daily predictions to weekly
        future_weekly = future_df.resample('W-FRI', on='ds').mean().reset_index()
        
        return future_weekly