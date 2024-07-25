from .model.sign import Signs, Sign, Login, Forgot, Passwords
from .config.db import create_table, engine
from sqlalchemy import text
from typing_extensions import Annotated
import requests
from fastapi import FastAPI,HTTPException,Request,status,Path
from sqlalchemy.exc import IntegrityError
import uvicorn
import random
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from collections import defaultdict
from pydantic import BaseModel, StringConstraints, EmailStr, model_validator
from sqlmodel import Field, Session, select
from aiohttp import ClientSession
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from passlib.context import CryptContext
from fastapi.responses import JSONResponse
load_dotenv()


app = FastAPI()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
otp = 0

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500"],  # Update this with your frontend origin
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    a = exc.errors()
    b = f"{a[0]['loc'][1]} {a[0]['msg']}"
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=jsonable_encoder({"detail": b}),
    )


@app.exception_handler(IntegrityError)
async def validations_exception_handler(request: Request, exc: IntegrityError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=jsonable_encoder({"detail": exc.orig.diag.message_detail[exc.orig.diag.message_detail.rfind('=')+1:len(exc.orig.diag.message_detail)]})
    )


@app.post('/posting')
def posting(signs: Signs):
    validate = Sign.model_validate(signs)
    validate.Password = pwd_context.hash(validate.Password)
    validate.Confirm_password = validate.Password
    with Session(engine) as session:
        session.add(validate)
        session.commit()
        session.refresh(validate)
    return 'data added successfully'


@app.post('/logging')
def logging(login: Login):
    with Session(engine) as session:
        data = session.exec(select(Sign).where(Sign.Mobile_no == login.Mobile_no)).first()
        if data:
            if pwd_context.verify(login.Password, data.Password):
                return 'Login successfully'
            else:
                raise (HTTPException(status_code=422,
                                         detail="Enter correct password for your mobile number"))
        else:
            raise (HTTPException(status_code=422, detail="Mobile number not found"))
    return 'login successfully'


@app.post('/forgot')
def forgot(forgots:Forgot):
    global otp
    with Session(engine) as session:
        data = session.exec(select(Sign).where(Sign.Mobile_no == forgots.Mobile_no)).first()
        if data:
            otp = random.randint(111111, 999999)
            return otp
        else:
            raise (HTTPException(status_code=422, detail="Mobile number not exist"))


@app.put('/C_password')
def C_password(passwords: Passwords):
    with Session(engine) as session:
        data = session.exec(select(Sign).where(Sign.Mobile_no == passwords.Mobile_no)).first()
        if pwd_context.verify(passwords.Password, data.Password):
            raise (HTTPException(status_code=422, detail='Please choose a different password'))
        else:
            passwords.Password = pwd_context.hash(passwords.Password)
            passwords.Confirm_password = passwords.Password
            password_data = passwords.model_dump(exclude_unset=True)
            data.sqlmodel_update(password_data)
            session.commit()
            session.refresh(data)

            return 'password has been change'

def start():
    create_table()
    uvicorn.run('mains.main:app', host='127.0.0.1', port=8011, reload=True)