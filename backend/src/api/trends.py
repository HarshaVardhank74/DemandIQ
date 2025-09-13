from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
# NEW CODE
from src.db import database, models
from src.schemas import schemas
from src.core.security import get_current_user
from src.core import pytrends_service, forecasting
from ..core.forecasting import ProphetForecaster, XGBoostForecaster

router = APIRouter()

def get_and_cache_trend_data(db: Session, keyword: str, timeframe: str, geo: str):
    # Check if keyword exists
    search_term = db.query(models.SearchTerm).filter(models.SearchTerm.keyword == keyword.lower()).first()
    
    # For this example, we re-fetch data every time for simplicity.
    # A real-world app would add a timestamp and only re-fetch if data is stale (e.g., > 24 hours old).
    
    df = pytrends_service.get_interest_over_time(keyword, timeframe, geo)
    
    if not search_term:
        search_term = models.SearchTerm(keyword=keyword.lower())
        db.add(search_term)
        db.commit()
        db.refresh(search_term)
    
    # Clear old data for this term
    db.query(models.TrendData).filter(models.TrendData.search_term_id == search_term.id).delete()
    
    # Add new data
    data_to_add = [models.TrendData(date=row['date'], value=row['value'], search_term_id=search_term.id) for index, row in df.iterrows()]
    db.bulk_save_objects(data_to_add)
    db.commit()
    
    return df

@router.post("/interest-over-time", response_model=List[schemas.TrendDataPoint])
def get_interest_data(request: schemas.TrendRequest, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    df = get_and_cache_trend_data(db, request.keyword, request.timeframe, request.geo)
    return df.to_dict(orient='records')

@router.post("/forecast", response_model=List[schemas.ForecastDataPoint])
def get_forecast(request: schemas.TrendRequest, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    # This function for fetching and caching data is unchanged
    df = get_and_cache_trend_data(db, request.keyword, request.timeframe, request.geo)
    
    horizon_weeks = 52 # Default forecast horizon
    
    # --- MODEL SELECTION LOGIC ---
    if request.model.lower() == 'xgboost':
        forecaster = XGBoostForecaster(df, horizon_weeks, request.promotion_dates)
    elif request.model.lower() == 'prophet':
        forecaster = ProphetForecaster(df, horizon_weeks, request.promotion_dates)
    else:
        raise HTTPException(status_code=400, detail="Invalid model type specified. Choose 'prophet' or 'xgboost'.")

    try:
        forecast_df = forecaster.train_and_forecast()
        return forecast_df.to_dict(orient='records')
    except Exception as e:
        # Provide more detail in the error message for debugging
        raise HTTPException(status_code=500, detail=f"An error occurred during forecasting: {str(e)}")

@router.post("/related-queries", response_model=schemas.RelatedQueriesResponse)
def get_related_queries_data(request: schemas.TrendRequest, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    return pytrends_service.get_related_queries(request.keyword, request.timeframe, request.geo)

@router.get("/dashboard-kpis", response_model=schemas.DashboardKPIs)
def get_dashboard_kpis(db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    total_keywords = db.query(models.SearchTerm).count()
    
    highest_interest_keyword = None
    highest_interest_value = None
    most_recent_peak_date = None

    # This is a simple query; could be optimized
    all_data = db.query(models.TrendData, models.SearchTerm).join(models.SearchTerm).all()
    if all_data:
        max_entry = max(all_data, key=lambda item: item.TrendData.value)
        highest_interest_keyword = max_entry.SearchTerm.keyword
        highest_interest_value = max_entry.TrendData.value
        most_recent_peak_date = max_entry.TrendData.date

    return {
        "total_keywords_tracked": total_keywords,
        "highest_interest_keyword": highest_interest_keyword,
        "highest_interest_value": highest_interest_value,
        "most_recent_peak_date": most_recent_peak_date,
    }