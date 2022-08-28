from fastapi import APIRouter, Depends, HTTPException, status
from http.client import NOT_FOUND
from sqlalchemy.orm import Session
import schemas, models, JwtToken
from database import get_db
from datetime import timedelta
from typing import List
from hashing import Hash
from oauth2 import get_current_user
from fastapi.security import OAuth2PasswordRequestForm


router = APIRouter()


@router.post("/login", tags=['Authentication'])
def login(request: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == request.username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail = "Invalid Credentials")

    if not Hash.verify(request.password, user.password):
        raise HTTPException(status_code=NOT_FOUND, detail="Invalid Credentials")
    access_token = JwtToken.create_access_token(data={"sub": user.username}, expires_delta=timedelta(30))
    return {"access_token": access_token, "token_type":"bearer"}