from datetime import datetime, timedelta
from typing import Optional
import jwt
import os
from dotenv import load_dotenv
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer

load_dotenv()

Oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_HOURS = os.getenv("ACCESS_TOKEN_EXPIRE_HOURS")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    try:
        to_encode = data.copy()
        expire = datetime.utcnow() + (expires_delta or timedelta(hours=int(ACCESS_TOKEN_EXPIRE_HOURS)))
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    except Exception as e:
        print("An exception occurred")
        print(e)
        raise (HTTPException(status_code=422, detail=f'{e}'))


# def verify_token(token: str = Depends(Oauth2_scheme)):
# #     try:
# #         decoded_token = jwt.decode(token, SECRET_KEY, algorithms=ALGORITHM)
# #         if decoded_token:
# #             return decoded_token
# #         else:
# #             raise (HTTPException(status_code=422, detail='Invalid token'))
# #     except Exception as e:
# #         print('An exception occurred')
# #         print(e)
# #         raise (HTTPException(status_code=422, detail=f'{e}'))

def verify_token(token: str = Depends(Oauth2_scheme)):
    try:
        decoded_token = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if decoded_token:
            return decoded_token
        else:
            raise HTTPException(status_code=422, detail='Invalid token')
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail='Token has expired')
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail='Invalid token')
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Internal Server Error: {str(e)}')

