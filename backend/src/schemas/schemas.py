# NEW, FULLY CORRECTED backend/src/schemas/schemas.py

from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import date

# User Schemas
class UserCreate(BaseModel):
    email: str
    password: str

class User(BaseModel):
    id: int
    email: str
    model_config = ConfigDict(from_attributes=True)


# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Trend & Forecast Schemas
class TrendRequest(BaseModel):
    keyword: str
    timeframe: str = Field(default='today 5-y')
    geo: str = Field(default='')
    model: str = Field(default='prophet')
    promotion_dates: Optional[List[date]] = Field(default=None)

# All other schema classes are below and correct
class TrendDataPoint(BaseModel):
    date: date
    value: int

class ForecastDataPoint(BaseModel):
    ds: date
    yhat: float

class RelatedQuery(BaseModel):
    query: str
    value: int

class RelatedQueriesResponse(BaseModel):
    top: List[RelatedQuery]
    rising: List[RelatedQuery]

class DashboardKPIs(BaseModel):
    total_keywords_tracked: int
    highest_interest_keyword: Optional[str]
    highest_interest_value: Optional[int]
    most_recent_peak_date: Optional[date]