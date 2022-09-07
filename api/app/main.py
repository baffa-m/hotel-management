from http.client import NOT_FOUND
from urllib import request
from fastapi import FastAPI, Depends, HTTPException, status
#from .models import User
from database import SessionLocal, engine
from sqlalchemy.orm import Session
import models, schemas, JwtToken
from typing import List
from hashing import Hash
from oauth2 import get_current_user
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from routers import user, hotel, hall

app = FastAPI()

origins = [
    'http://localhost:8080',
    'http://localhost:5000'
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=engine)

app.include_router(hotel.router)
app.include_router(hall.router)
app.include_router(user.router)      




