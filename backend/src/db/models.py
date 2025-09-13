from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

class SearchTerm(Base):
    __tablename__ = "search_terms"
    id = Column(Integer, primary_key=True, index=True)
    keyword = Column(String, unique=True, index=True)
    trend_data = relationship("TrendData", back_populates="search_term")

class TrendData(Base):
    __tablename__ = "trend_data"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date)
    value = Column(Integer)
    search_term_id = Column(Integer, ForeignKey("search_terms.id"))
    search_term = relationship("SearchTerm", back_populates="trend_data")