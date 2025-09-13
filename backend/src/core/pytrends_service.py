import pandas as pd
from pytrends.request import TrendReq
from fastapi import HTTPException

def get_interest_over_time(keyword: str, timeframe: str = 'today 5-y', geo: str = ''):
    try:
        pytrends = TrendReq(hl='en-US', tz=360)
        pytrends.build_payload([keyword], cat=0, timeframe=timeframe, geo=geo, gprop='')
        df = pytrends.interest_over_time()
        if df.empty or keyword not in df.columns:
            raise HTTPException(status_code=404, detail=f"No data found for the keyword: '{keyword}'")
        return df[[keyword]].reset_index().rename(columns={'date': 'date', keyword: 'value'})
    except Exception as e:
        # Pytrends can sometimes fail with a ResponseError for various reasons (e.g., rate limiting)
        raise HTTPException(status_code=503, detail=f"Failed to fetch data from Google Trends: {e}")

def get_related_queries(keyword: str, timeframe: str = 'today 5-y', geo: str = ''):
    try:
        pytrends = TrendReq(hl='en-US', tz=360)
        pytrends.build_payload([keyword], cat=0, timeframe=timeframe, geo=geo, gprop='')
        related_queries = pytrends.related_queries()
        
        top_queries = pd.DataFrame()
        rising_queries = pd.DataFrame()

        if related_queries[keyword]['top'] is not None:
            top_queries = related_queries[keyword]['top'].rename(columns={'query': 'query', 'value': 'value'})

        if related_queries[keyword]['rising'] is not None:
            rising_queries = related_queries[keyword]['rising'].rename(columns={'query': 'query', 'value': 'value'})
            
        return {
            "top": top_queries.to_dict(orient='records'),
            "rising": rising_queries.to_dict(orient='records')
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Failed to fetch related queries from Google Trends: {e}")