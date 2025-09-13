import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from src.db.database import SessionLocal, engine
from src.db.models import Base, SalesData
from datetime import timedelta

def load_mock_data():
    db = SessionLocal()
    if db.query(SalesData).first():
        print("Data already exists. Skipping load.")
        db.close()
        return

    print("Generating and loading mock Walmart-style data...")
    dates = pd.date_range(start='2020-01-01', end='2024-12-31', freq='W-FRI')
    stores = range(1, 11)  # 10 stores
    depts = range(1, 6)   # 5 departments

    data = []
    for store in stores:
        for dept in depts:
            base_sales = 10000 + (store * 1000) + (dept * 500)
            for date in dates:
                seasonal_effect = 1 + 0.5 * np.sin(2 * np.pi * date.dayofyear / 365.25)
                trend_effect = 1 + (date - dates[0]).days / (365 * 4 * 2) # 50% growth over 4 years
                noise = np.random.normal(1, 0.1)
                
                sales = base_sales * seasonal_effect * trend_effect * noise
                
                is_holiday = date.month in [11, 12] and date.day > 15
                if is_holiday:
                    sales *= 1.4

                data.append({
                    "store_id": store,
                    "dept_id": dept,
                    "date": date.date(),
                    "weekly_sales": round(sales, 2),
                    "is_holiday": is_holiday,
                    "temperature": np.random.uniform(20, 90),
                    "fuel_price": np.random.uniform(2.5, 4.5)
                })

    df = pd.DataFrame(data)
    try:
        Base.metadata.create_all(bind=engine)
        db.bulk_insert_mappings(SalesData, df.to_dict(orient="records"))
        db.commit()
        print(f"Successfully loaded {len(df)} records.")
    finally:
        db.close()