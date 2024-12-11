from .model.sign import Signs, Sign, Login, Forgot, Passwords, ProductInfo, ProductInfo2, ProductInfo2Validations
from .config.db import create_table, engine
from sqlalchemy import text, func, desc
from typing_extensions import Annotated
import requests
from fastapi import FastAPI, HTTPException, Request, status, Path, Form, UploadFile, File
from sqlalchemy.exc import IntegrityError
import uvicorn
import random
from pathlib import Path
from typing import Optional
import os
import yaml
import secrets
from io import BytesIO
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse,HTMLResponse
from collections import defaultdict
from pydantic import BaseModel, StringConstraints, EmailStr, model_validator
from sqlmodel import Field, Session, select
from aiohttp import ClientSession
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from passlib.context import CryptContext
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, Response
'''from fuzzywuzzy import fuzz
from fuzzywuzzy import process'''
load_dotenv()


app = FastAPI()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
otp = 0

frontend_path = Path(__file__).resolve().parent.parent.parent.parent / 'inter-frontend-folder'
app.mount("/static", StaticFiles(directory=frontend_path), name="static")

@app.get("/")
def read_index():
    # Access your HTML file
    with open(frontend_path / 'html_folder/index.html', 'r') as file:
        html_content = file.read()
    return HTMLResponse(content=html_content)

app.mount("/static/css", StaticFiles(directory="inter-frontend-folder/css_folder"), name="css")
app.mount("/static/js", StaticFiles(directory="inter-frontend-folder/javascript_folder"), name="js")
app.mount("/static/image", StaticFiles(directory="inter-frontend-folder/image"), name="image")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5501"],  # Update this with your frontend origin
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
        content=jsonable_encoder({"detail": str(exc.orig)[8:len(str(exc.orig))-2]})
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




@app.post('/uploading')
async def uploading(name: str = Form(...), author: str = Form(...), star: float = Form(...), price: int = Form(...), s_price: int = Form(...), quantity: int = Form(...), discount: int = Form(...), image: UploadFile = Form(...)):
    images = await image.read()
    FILEPATH = "C:/Users/spars/OneDrive/Desktop/Internship_project/inter-frontend-folder/static/"
    filename = image.filename
    extension = filename.split(".")[1]
    if extension not in ["png","jpeg","jpg"]:
        raise (HTTPException(status_code=423, detail='Please choose png,jpg or jpeg image format'))

    token_name = secrets.token_hex(10)+"."+extension
    generated_name = FILEPATH+token_name
    with open(generated_name,"wb") as file:
        file.write(images)
    file.close()
    products = ProductInfo(name=name, author=author, star=star, price=price, s_price=s_price, quantity=quantity, discount=discount, image=images)
    with Session(engine) as session:
        session.add(products)
        session.commit()
        session.refresh(products)
        return 'data added successfully'


@app.post('/uploading2')
async def uploading2(name: str = Form(...), author: str = Form(...), star: float = Form(...), price: int = Form(...), s_price: int = Form(...), quantity: int = Form(...), discount: int = Form(...), time: str = Form(...), image: UploadFile = Form(...)):
    images = await image.read()
    '''C:/Users/spars/OneDrive/Desktop/Internship_project/inter-frontend folder/'''
    FILEPATH = "static/"
    filename = image.filename
    extension = filename.split(".")[1]
    if extension not in ["png", "jpeg", "jpg"]:
        raise (HTTPException(status_code=423, detail='Please choose png,jpg or jpeg image format'))

    token_name = secrets.token_hex(10)+"."+extension
    generated_name = FILEPATH+token_name
    '''token_name describing the new file name'''
    '''generated_name describing also the filepath'''
    products = ProductInfo2Validations(name=name, author=author, star=star, price=price, s_price=s_price, quantity=quantity, discount=discount, time=time, image=generated_name)
    validate = ProductInfo2.model_validate(products)
    with Session(engine) as session:
        with open(generated_name, "wb") as file:
            file.write(images)
        file.close()
        '''we write above three line of code in database code because we want that basic validation(validate productInfo2.model_validate) is done before when the file is uploading in directory'''
        '''if we does not do this image will always be upload in directory irrespective of record is stored in database or nto'''
        FILEPATH = "C:/Users/spars/OneDrive/Desktop/Internship_project/inter-frontend-folder/static/"
        # filename = image.filename
        # extension = filename.split(".")[1]
        # if extension not in ["png", "jpeg", "jpg"]:
        #     raise (HTTPException(status_code=423, detail='Please choose png,jpg or jpeg image format'))
        #
        # token_name = secrets.token_hex(10) + "." + extension
        generated_name = FILEPATH + token_name
        with open(generated_name, "wb") as file:
            file.write(images)
        file.close()
        session.add(validate)
        session.commit()
        session.refresh(validate)
        return [generated_name, validate.product_id]
'''Get-Process | Where-Object { $_.ProcessName -eq "python" } | Stop-Process -Force
'''
'''for killing the background process'''

@app.get('/card_details')
def card_details():
    c = 1
    details = {}
    with Session(engine) as session:
        a = session.exec(select(ProductInfo))
        if a:
            for i in a:
                details[c] = []
                details[c].append(i.product_id)
                details[c].append(i.name)
                details[c].append(i.author)
                details[c].append(i.star)
                details[c].append(i.price)
                details[c].append(i.s_price)
                details[c].append(i.quantity)
                details[c].append(i.discount)
                c += 1
            return details


@app.get('/get_image/{image_id}')
def get_image(image_id: int):
    with Session(engine) as session:
        w = session.exec(select(ProductInfo).where(ProductInfo.product_id == image_id)).first()
        '''image_stream = BytesIO(w.image)
        pic = StreamingResponse(image_stream, media_type="image/png")'''
        pic = Response(content=w.image, media_type="image/png")
        return pic


@app.put('/updating')
async def updating(old: str = Form(...), name: str = Form(...), author: str = Form(...), star: str = Form(...), price: str = Form(...), s_price: str = Form(...), quantity: str = Form(...), discount: str = Form(...), image: UploadFile = Form(...)):
    image = await image.read()
    with Session(engine) as session:
        peices = session.exec(select(ProductInfo).where(ProductInfo.name == old)).first()
        if not star:
            star = peices.star
        if not quantity:
            quantity = peices.quantity
        products = ProductInfo(name=name, author=author, star=star, price=price, s_price=s_price, quantity=quantity,
                               discount=discount, image=image)
        form_data = products.model_dump(exclude_unset=True)
        peices.sqlmodel_update(form_data)
        session.commit()
        session.refresh(peices)
        print("unsure")
        return 'data added successfully'

@app.put('/updating20')
async def updating2(old: int = Form(...), name: str = Form(...), author: str = Form(...), star: str = Form(...), price: str = Form(...), s_price: str = Form(...), quantity: str = Form(...), discount: str = Form(...), time: str = Form(...)):
    with Session(engine) as session:
        peices = session.exec(select(ProductInfo2).where(ProductInfo2.product_id == old)).first()
        if not star:
            star = peices.star
        if not quantity:
            quantity = peices.quantity
        products = ProductInfo2(product_id=peices.product_id, name=name, author=author, star=star, price=price, s_price=s_price, quantity=quantity,discount=discount, time=time, image=peices.image)
        products = ProductInfo2.model_validate(products)
        '''this is basically for the validation purpose that's why create the whole object of class so that it can validate'''
        form_data = products.model_dump(exclude_unset=True)
        peices.sqlmodel_update(form_data)
        session.commit()
        session.refresh(peices)
        return "hello moto"


@app.put('/updating21')
async def updating2(old: int = Form(...), name: str = Form(...), author: str = Form(...), star: str = Form(...), price: str = Form(...), s_price: str = Form(...), quantity: str = Form(...), discount: str = Form(...), image: UploadFile = Form(...), time: str = Form(...)):
    with Session(engine) as session:
        if image:
            images = await image.read()
        FILEPATH = "static/"
        filename = image.filename
        extension = filename.split(".")[1]
        if extension not in ["png", "jpeg", "jpg"]:
            raise (HTTPException(status_code=423, detail='Please choose png,jpg or jpeg image format'))

        token_name = secrets.token_hex(10) + "." + extension
        generated_name = FILEPATH + token_name
        peices = session.exec(select(ProductInfo2).where(ProductInfo2.product_id == old)).first()
        if not star:
            star = peices.star
        if not quantity:
            quantity = peices.quantity
        products = ProductInfo2Validations(product_id=peices.product_id, name=name, author=author, star=star, price=price, s_price=s_price, quantity=quantity, discount=discount, image=generated_name, time=time)
        products = ProductInfo2.model_validate(products)
        form_data = products.model_dump(exclude_unset=True)
        peices.sqlmodel_update(form_data)
        session.commit()
        session.refresh(peices)
        with open(generated_name, "wb") as file:
            file.write(images)
        file.close()
        FILEPATH = "C:/Users/spars/OneDrive/Desktop/Internship_project/inter-frontend folder/static/"
        # filename = image.filename
        # extension = filename.split(".")[1]
        # if extension not in ["png", "jpeg", "jpg"]:
        #     raise (HTTPException(status_code=423, detail='Please choose png,jpg or jpeg image format'))
        #
        # token_name = secrets.token_hex(10) + "." + extension
        generated_name = FILEPATH + token_name
        with open(generated_name, "wb") as file:
            file.write(images)
        file.close()
        return generated_name


@app.delete('/deleting/{product_id}')
def deleting(product_id: str):
    with Session(engine) as session:
        peices = session.exec(select(ProductInfo2).where(ProductInfo2.product_id == product_id)).first()
        session.delete(peices)
        session.commit()
        return "delete successfully"


'''@app.get('/table_data/{n}/{m}')
def table_data(n: int, m: int):
    a = []
    count = m + 1
    with Session(engine) as session:
        y = session.exec(select(ProductInfo2).offset(m).limit(n)).all()
        for i in y:
            b = {"product_id": i.product_id, "name": i.name, "author": i.author, "price": i.price, "s_price": i.s_price,
                 "star": i.star, "quantity": i.quantity, "discount": i.discount, "time": i.time, "image": i.image}
            a.append(b)
    return a'''


@app.get('/table_data/{limits}/{skip}/{filters}')
def table_data(limits: int, skip: int, filters: str):
    a = []
    v = 0
    skip = (skip-1)*limits
    with Session(engine) as session:
        if filters == "sort by":
            v = session.exec(select(ProductInfo2).offset(skip).limit(limits)).all()
        elif filters == "sort by: Featured":
            v = session.exec(select(ProductInfo2).offset(skip).limit(limits)).all()
        elif filters == "sort by: Prices: Low to High":
            v = session.exec(select(ProductInfo2).offset(skip).limit(limits).order_by(ProductInfo2.price)).all()
        elif filters == "sort by: Prices: High to Low":
            v = session.exec(select(ProductInfo2).offset(skip).limit(limits).order_by(desc(ProductInfo2.price))).all()
        elif filters == "sort by: Ratings":
            v = session.exec(select(ProductInfo2).offset(skip).limit(limits).order_by(desc(ProductInfo2.star))).all()
        else:
            v = session.exec(select(ProductInfo2).offset(skip).limit(limits).order_by(desc(ProductInfo2.quantity))).all()

        y = session.exec(select(func.count(ProductInfo2.name))).one()
        for i in v:
            b = {"product_id": i.product_id, "name": i.name, "author": i.author, "price": i.price, "s_price": i.s_price,
                 "star": i.star, "quantity": i.quantity, "discount": i.discount, "time": i.time, "image": i.image}
            a.append(b)
    return [a, y]

'''Get-Process | Where-Object { $_.ProcessName -eq "python" } | Stop-Process -Force'''
@app.get('/searching/{keyword}')
def searching(keyword: str):
    k = []
    with Session(engine) as session:
        filters1 = session.exec(select(ProductInfo2).where(ProductInfo2.author.like('%'+keyword+'%') | ProductInfo2.name.like('%'+keyword+'%'))).all()
        '''above lines are for fuzzy-wuzzy'''
        '''choices_name = session.exec(select(ProductInfo2.name)).all()
        choices_author = session.exec(select(ProductInfo2.author)).all()
        selects_name = process.extract(keyword, choices_name, limit=5)
        selects_author = process.extract(keyword, choices_author, limit=5)
        selected = []
        for i in range(5):
            selected.append(selects_name[i][0])
            selected.append(selects_author[i][0])

        filters1 = session.exec(select(ProductInfo2).where(ProductInfo2.name.in_(selected) | ProductInfo2.author.in_(selected))).all()'''

        for i in filters1:
            bb = {"product_id": i.product_id, "name": i.name, "author": i.author, "price": i.price, "s_price": i.s_price,
                 "star": i.star, "quantity": i.quantity, "discount": i.discount, "time": i.time, "image": i.image}
            if bb not in k:
                k.append(bb)
        return k


@app.get('/gettingImage/{product_id}')
def gettingImage(product_id: int):
    with Session(engine) as session:
        image = session.exec(select(ProductInfo2.image).where(ProductInfo2.product_id == product_id)).first()
        return image

def start():
    create_table()
    uvicorn.run('intern-backend-folder.backend.mains.main:app', host='127.0.0.1', port=8011, reload=True)
