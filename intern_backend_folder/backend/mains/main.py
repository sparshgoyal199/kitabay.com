from sqlalchemy import func, desc
from fastapi import FastAPI, HTTPException, Request, status, Path, Form, UploadFile, Depends
from sqlalchemy.exc import IntegrityError
import os
import uvicorn
import random
import secrets
import asyncio
import smtplib
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse, HTMLResponse
from sqlmodel import Session, select
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from passlib.context import CryptContext
import warnings
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, Response
from pathlib import Path
from email.message import EmailMessage
from .model.db_models import UserValidate, Users, Login, Forgot, Passwords, Products, ProductValidate, Books, UserBookLink, UserBookLinkValidate
from .config.db import create_table, engine, supabase, SUPABASE_URL
from .utils.utils_helper import create_access_token, verify_token

load_dotenv()
app = FastAPI()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

otp = 0
BUCKET_NAME = os.getenv("BUCKET_NAME")
frontend_path = Path(__file__).resolve().parent.parent.parent.parent / 'static'
app.mount("/static", StaticFiles(directory=frontend_path), name="static")


@app.get("/")
def read_index():
    with open(frontend_path / 'html_folder/sign.html', 'r') as file:
        #above is the absoulte path of that system
        html_content = file.read()
    return HTMLResponse(content=html_content)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
        content=jsonable_encoder({"detail": str(exc.orig)[82:len(str(exc.orig)) - 2]})
    )


def sendingOtp(email, signup_otp):
    FROM_EMAIL = 'sparshgoyal199@gmail.com'
    TO_EMAIL = email
    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()

    server.login(FROM_EMAIL, 'eugz tsxr alge hzyb')
    msg = EmailMessage()
    msg['Subject'] = 'OTP Verification'
    msg['From'] = FROM_EMAIL
    msg['To'] = TO_EMAIL
    msg.set_content('YOUR OTP is: ' + signup_otp)
    server.send_message(msg)


@app.post('/posting')
async def posting(user: UserValidate):
    try:
        validate = Users.model_validate(user)
        validate.Password = pwd_context.hash(validate.Password)
        validate.Confirm_password = validate.Password
        signup_otp = ""
        for i in range(6):
            signup_otp += str(random.randint(0, 9))
        sendingOtp(validate.Email_Address, signup_otp)
        return [validate, signup_otp]
    except Exception as e:
        print("An exception occurred")
        print(e)
        raise (HTTPException(status_code=422, detail=f'{e}'))



@app.post('/postingData')
def postingData(validate: Users):
    try:
        with Session(engine) as session:
            session.add(validate)
            session.commit()
            session.refresh(validate)
        return 'sign up successfully'
    except Exception as e:
        print("An exception occurred")
        print(e)
        raise (HTTPException(status_code=422, detail=f'{e}'))

@app.post('/logging')
def logging(login: Login):
    try:
        with Session(engine) as session:
            data = session.exec(select(Users).where(Users.Email_Address == login.Email_Address)).first()
            if data:
                if pwd_context.verify(login.Password, data.Password):
                    token = create_access_token(data={"id": data.id})
                    return token
                else:
                    raise (HTTPException(status_code=422,
                                         detail="Enter correct password for your Email Address"))
            else:
                raise (HTTPException(status_code=422, detail="Email Address not found"))
    except Exception as e:
        print("An exception occurred")
        print(e)
        raise (HTTPException(status_code=422, detail=f'{e}'))


@app.post('/forgot')
def forgot(forgots: Forgot):
    try:
        forgot_otp = ""
        for i in range(6):
            forgot_otp += str(random.randint(0, 9))
        sendingOtp(forgots.Email_Address, forgot_otp)
        return forgot_otp
    except Exception as e:
        print("An exception occurred")
        print(e)
        raise (HTTPException(status_code=422, detail=f'{e}'))


@app.put('/C_password')
def C_password(passwords: Passwords):
    try:
        with Session(engine) as session:
            data = session.exec(select(Users).where(Users.Email_Address == passwords.Email_Address)).first()
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
    except Exception as e:
        print("An exception occurred")
        print(e)
        raise (HTTPException(status_code=422, detail=f'{e}'))


@app.post('/upload')
async def upload(name: str = Form(...), author: str = Form(...), star: float = Form(...), price: int = Form(...),
                 s_price: int = Form(...), quantity: int = Form(...), discount: int = Form(...),
                 time: str = Form(...), image: UploadFile = Form(...), google_id: str = Form(), user=Depends(verify_token)):
    try:
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")
        token_id = user.get('id')
        images = await image.read()

        filename = image.filename
        extension = filename.split(".")[1]
        if extension not in ["png", "jpeg", "jpg"]:
            raise (HTTPException(status_code=423, detail='Please choose png,jpg or jpeg image format'))
        token_name = secrets.token_hex(10) + "." + extension
        response = supabase.storage.from_(BUCKET_NAME).upload(token_name, images,
                                                              file_options={"content-type": image.content_type})

        # Get the public URL (if bucket is public)
        generated_name = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{token_name}"
        book = Books(name=name, author=author, google_id=google_id)
        with Session(engine) as session:
            book_exist = session.exec(select(Books).where(Books.google_id == google_id)).first()
            if not book_exist:
                BookUserInstance = UserBookLink(user_id=token_id, book=book, star=star, price=price, s_price=s_price,
                                                quantity=quantity, discount=discount, time=time, image=generated_name)
            else:
                BookUserInstance = UserBookLink(user_id=token_id, book_id=book_exist.book_id, star=star, price=price, s_price=s_price,
                                                quantity=quantity, discount=discount, time=time, image=generated_name)
            session.add(BookUserInstance)
            session.commit()
            session.refresh(BookUserInstance)
        '''products = ProductValidate(name=name, author=author, star=star, price=price, s_price=s_price,
                                    quantity=quantity, discount=discount, time=time, image=generated_name)
        validate = Products.model_validate(products)
        with Session(engine) as session:
            login_user = session.exec(select(Users).where(Users.id == token_id)).first()
            login_user.products.append(validate)
            session.add(login_user)
            session.commit()
            session.refresh(login_user)
            return [generated_name, validate.id]'''

    except Exception as e:
        print("An exception occurred")
        print(e)
        raise (HTTPException(status_code=422, detail=f'{e}'))


'''Get-Process | Where-Object { $_.ProcessName -eq "python" } | Stop-Process -Force
'''
'''for killing the background process'''


@app.put('/update0')
async def update0(book_id: int = Form(...), name: str = Form(...), author: str = Form(...), star: str = Form(...),
                  price: str = Form(...), s_price: str = Form(...), quantity: str = Form(...),
                  discount: str = Form(...), time: str = Form(...), user=Depends(verify_token)):
    try:
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")
        token_id = user.get('id')
        with Session(engine) as session:
            peices = session.exec(select(UserBookLink).where(UserBookLink.book_id == book_id) and UserBookLink.user_id == token_id).first()
            if not star:
                star = peices.star
            if not quantity:
                quantity = peices.quantity
            edited_books = UserBookLinkValidate(book_id=peices.book_id, user_id=peices.id, name=name, author=author, star=star, price=price,
                                s_price=s_price, quantity=quantity, discount=discount, time=time,
                                image=peices.image)
            edited_book = UserBookLink.model_validate(edited_books)
            form_data = UserBookLink.model_dump(exclude_unset=True)
            peices.sqlmodel_update(form_data)
            session.commit()
            session.refresh(peices)
            return "no editing in image"
    except Exception as e:
        print("An exception occurred")
        print(e)
        raise (HTTPException(status_code=422, detail=f'{e}'))


@app.put('/update1')
async def update1(old: int = Form(...), name: str = Form(...), author: str = Form(...), star: str = Form(...),
                  price: str = Form(...), s_price: str = Form(...), quantity: str = Form(...),
                  discount: str = Form(...), image: UploadFile = Form(...), time: str = Form(...),
                  user=Depends(verify_token)):
    try:
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")
        with Session(engine) as session:
            if image:
                images = await image.read()
            filename = image.filename
            extension = filename.split(".")[1]
            if extension not in ["png", "jpeg", "jpg"]:
                raise (HTTPException(status_code=423, detail='Please choose png,jpg or jpeg image format'))

            token_name = secrets.token_hex(10) + "." + extension
            response = supabase.storage.from_(BUCKET_NAME).upload(token_name, images,
                                                                  file_options={"content-type": image.content_type})

            # Get the public URL (if bucket is public)
            generated_name = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{token_name}"
            peices = session.exec(select(Products).where(Products.id == old)).first()
            if not star:
                star = peices.star
            if not quantity:
                quantity = peices.quantity
            products = ProductValidate(id=peices.id, name=name, author=author, star=star,
                                        price=price, s_price=s_price, quantity=quantity, discount=discount,
                                        image=generated_name, time=time)
            products = Products.model_validate(products)
            form_data = products.model_dump(exclude_unset=True)
            peices.sqlmodel_update(form_data)
            session.commit()
            session.refresh(peices)
            return generated_name
    except Exception as e:
        print("An exception occurred")
        print(e)
        raise (HTTPException(status_code=422, detail=f'{e}'))


@app.delete('/deleting/{id}')
def deleting(id: str, user=Depends(verify_token)):
    try:
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")
        with Session(engine) as session:
            peices = session.exec(select(Products).where(Products.id == id)).first()
            session.delete(peices)
            session.commit()
            return "delete successfully"
    except Exception as e:
        print("An exception occurred")
        print(e)
        raise (HTTPException(status_code=422, detail=f'{e}'))


@app.get('/table_data/{limits}/{skip}/{filters}')
def table_data(limits: int, skip: int, filters: str, user=Depends(verify_token)):
    try:
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")
        token_id = user.get('id')
        total_books = []
        v = 0
        skip = (skip - 1) * limits
        count = 0
        with Session(engine) as session:
            user = session.exec(select(Users).where(Users.id == token_id)).first()
            specified_userBooks = user.book_links
            for each_record in specified_userBooks:
                count += 1
                each_book = session.exec(select(Books).where(Books.book_id == each_record.book_id)).first()
                b = {"id": each_record.book_id, "name": each_book.name, "author": each_book.author, "price": each_record.price,
                     "s_price": each_record.s_price,
                     "star": each_record.star, "quantity": each_record.quantity, "discount": each_record.discount, "time": each_record.time, "image": each_record.image}
                total_books.append(b)
            return [total_books, count]
            '''if filters == "sort by":
                v = session.exec(select(Products).offset(skip).limit(limits)).all()
            elif filters == "sort by: Featured":
                v = session.exec(select(Products).offset(skip).limit(limits)).all()
            elif filters == "sort by: Prices: Low to High":
                v = session.exec(select(Products).offset(skip).limit(limits).order_by(Products.price)).all()
            elif filters == "sort by: Prices: High to Low":
                v = session.exec(
                    select(Products).offset(skip).limit(limits).order_by(desc(Products.price))).all()
            elif filters == "sort by: Ratings":
                v = session.exec(
                    select(Products).offset(skip).limit(limits).order_by(desc(Products.star))).all()
            else:
                v = session.exec(
                    select(Products).offset(skip).limit(limits).order_by(desc(Products.quantity))).all()

            y = session.exec(select(func.count(Products.id))).one()
            for i in v:
                b = {"id": i.id, "name": i.name, "author": i.author, "price": i.price,
                     "s_price": i.s_price,
                     "star": i.star, "quantity": i.quantity, "discount": i.discount, "time": i.time, "image": i.image}
                a.append(b)
        return [a, y]'''
    except Exception as e:
        print("An exception occurred")
        print(e)
        raise (HTTPException(status_code=422, detail=f'{e}'))


@app.get('/searching/{keyword}')
def searching(keyword: str, user=Depends(verify_token)):
    try:
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")
        k = []
        with Session(engine) as session:
            filters1 = session.exec(select(Products).where(
                Products.author.like('%' + keyword + '%') | Products.name.like('%' + keyword + '%'))).all()

            for i in filters1:
                bb = {"id": i.id, "name": i.name, "author": i.author, "price": i.price,
                      "s_price": i.s_price,
                      "star": i.star, "quantity": i.quantity, "discount": i.discount, "time": i.time, "image": i.image}
                if bb not in k:
                    k.append(bb)
            return k
    except Exception as e:
        print("An exception occurred")
        print(e)
        raise (HTTPException(status_code=422, detail=f'{e}'))


@app.get('/gettingImage/{id}')
def gettingImage(id: int, user=Depends(verify_token)):
    try:
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")
        with Session(engine) as session:
            image = session.exec(select(Products.image).where(Products.id == id)).first()
            return image
    except Exception as e:
        print("An exception occurred")
        print(e)
        raise (HTTPException(status_code=422, detail=f'{e}'))


def start():
    create_table()
    uvicorn.run('intern_backend_folder.backend.mains.main:app', host='0.0.0.0', port=80, reload=True)
