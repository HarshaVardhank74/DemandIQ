from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.db.database import engine
from src.db import models
from src.api import auth, trends
models.Base.metadata.create_all(bind=engine)
app = FastAPI(title="DemandIQ Pro API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(trends.router, prefix="/trends", tags=["Trends & Forecasting"])
@app.get("/")
def read_root():
 return {"message": "Welcome to the DemandIQ Pro API"}