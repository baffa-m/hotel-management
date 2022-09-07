from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from typing import Optional
from schemas import TokenData

SECRET_KEY = "e67235563f5106ae27e6fccc66641faac4e0ae3fec5d7abf6a0863b34db6ac0e"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encorded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encorded_jwt

def verify_token(token: str, credentials_exception):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username = username)
    except JWTError:
        raise credentials_exception