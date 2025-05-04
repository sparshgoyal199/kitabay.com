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
            existing_book = session.exec(select(UserBookLink).where(UserBookLink.book_id == book_id and UserBookLink.user_id == token_id)).first()
            if not star:
                star = existing_book.star
            if not quantity:
                quantity = existing_book.quantity
            edited_book = UserBookLinkValidate(book_id=existing_book.book_id, user_id=existing_book.user_id, name=name, author=author, star=star, price=price,
                                s_price=s_price, quantity=quantity, discount=discount, time=time,
                                image=existing_book.image)
            edited_book = UserBookLink.model_validate(edited_book)
            form_data = UserBookLink.model_dump(exclude_unset=True, self=edited_book)
            existing_book.sqlmodel_update(form_data)
            session.commit()
            session.refresh(existing_book)
            return "no editing in image"
    except Exception as e:
        print("An exception occurred")
        print(e)
        raise (HTTPException(status_code=422, detail=f'{e}'))


@app.put('/update1')
async def update1(book_id: int = Form(...), name: str = Form(...), author: str = Form(...), star: str = Form(...),
                  price: str = Form(...), s_price: str = Form(...), quantity: str = Form(...),
                  discount: str = Form(...), image: UploadFile = Form(...), time: str = Form(...),
                  user=Depends(verify_token)):
    global images
    try:
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")
        token_id = user.get('id')
        if image:
            images = await image.read()
        filename = image.filename
        extension = filename.split(".")[1]
        if extension not in ["png", "jpeg", "jpg"]:
            raise (HTTPException(status_code=423, detail='Please choose png,jpg or jpeg image format'))
        with Session(engine) as session:
            existing_book = session.exec(select(UserBookLink).where(
                UserBookLink.book_id == book_id and UserBookLink.user_id == token_id)).first()
            generated_name = existing_book.image[86:]
            response = supabase.storage.from_(BUCKET_NAME).upload(generated_name, images,
                                                                  file_options={"content-type": image.content_type, "upsert": "true"})

            # Get the public URL (if bucket is public)
            if not star:
                star = existing_book.star
            if not quantity:
                quantity = existing_book.quantity
            edited_books = UserBookLinkValidate(book_id=existing_book.book_id, user_id=existing_book.user_id, name=name,
                                                author=author, star=star, price=price,
                                                s_price=s_price, quantity=quantity, discount=discount, time=time,
                                                image=existing_book.image)
            edited_book = UserBookLink.model_validate(edited_books)
            form_data = UserBookLink.model_dump(exclude_unset=True, self=edited_book)
            existing_book.sqlmodel_update(form_data)
            session.commit()
            session.refresh(existing_book)
            return generated_name
    except Exception as e:
        print("An exception occurred")
        print(e)
        raise (HTTPException(status_code=422, detail=f'{e}'))


@app.delete('/deleting/{book_id}')
def deleting(book_id: str, user=Depends(verify_token)):
    try:
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")
        token_id = user.get('id')
        with Session(engine) as session:
            delete_to_delete = session.exec(select(UserBookLink).where(
                UserBookLink.book_id == book_id and UserBookLink.user_id == token_id)).first()
            session.delete(delete_to_delete)
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
        specified_userBooks = ''
        with Session(engine) as session:
            if filters == "sort by":
                specified_userBooks = session.exec(select(UserBookLink).where(UserBookLink.user_id == token_id).offset(skip).limit(limits)).all()
            elif filters == "sort by: Featured":
                specified_userBooks = session.exec(
                    select(UserBookLink).where(UserBookLink.user_id == token_id).offset(skip).limit(limits)).all()
            elif filters == "sort by: Prices: Low to High":
                specified_userBooks = session.exec(
                    select(UserBookLink).where(UserBookLink.user_id == token_id).order_by(UserBookLink.price).offset(skip).limit(limits)).all()
            elif filters == "sort by: Prices: High to Low":
                specified_userBooks = session.exec(
                    select(UserBookLink).where(UserBookLink.user_id == token_id).order_by(UserBookLink.price.desc()).offset(
                        skip).limit(limits)).all()
            elif filters == "sort by: Ratings":
                specified_userBooks = session.exec(
                    select(UserBookLink).where(UserBookLink.user_id == token_id).order_by(
                        UserBookLink.star.desc()).offset(
                        skip).limit(limits)).all()
            else:
                specified_userBooks = session.exec(
                    select(UserBookLink).where(UserBookLink.user_id == token_id).order_by(
                        UserBookLink.quantity.desc()).offset(
                        skip).limit(limits)).all()
            for each_record in specified_userBooks:
                count += 1
                each_book = session.exec(select(Books).where(Books.book_id == each_record.book_id)).first()
                b = {"id": each_record.book_id, "name": each_book.name, "author": each_book.author, "price": each_record.price,
                     "s_price": each_record.s_price,
                     "star": each_record.star, "quantity": each_record.quantity, "discount": each_record.discount, "time": each_record.time, "image": each_record.image}
                total_books.append(b)
            return [total_books, count]
    except Exception as e:
        print("An exception occurred")
        print(e)
        raise (HTTPException(status_code=422, detail=f'{e}'))


@app.get('/searching/{keyword}')
def searching(keyword: str, user=Depends(verify_token)):
    try:
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")
        token_id = user.get("id")
        k = []
        with Session(engine) as session:
            filters2 = session.exec(select(Books).where(Books.author.ilike('%' + keyword + '%') | Books.name.ilike('%' + keyword + '%'))).all()
            print(filters2)
            filters1 = session.exec(select(Books, UserBookLink).join(UserBookLink).where(UserBookLink.user_id == token_id and UserBookLink.book_id == Books.book_id
                )).all()
            for book, usersbook in filters1:
                bb = {"id": book.book_id, "name": book.name, "author": book.author, "price": usersbook.price,
                      "s_price": usersbook.s_price,
                      "star": usersbook.star, "quantity": usersbook.quantity, "discount": usersbook.discount,
                      "time": usersbook.time, "image": usersbook.image}
                k.append(bb)
            return k
    except Exception as e:
        print("An exception occurred")
        print(e)
        raise (HTTPException(status_code=422, detail=f'{e}'))


@app.get('/gettingImage/{book_id}')
def gettingImage(book_id: int, user=Depends(verify_token)):
    try:
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")
        token_id = user.get('id')
        with Session(engine) as session:
            image = session.exec(select(UserBookLink.image).where(
                UserBookLink.book_id == book_id and UserBookLink.user_id == token_id)).first()
            print(image)
            return image
    except Exception as e:
        print("An exception occurred")
        print(e)
        raise (HTTPException(status_code=422, detail=f'{e}'))


def start():
    create_table()
    uvicorn.run('intern_backend_folder.backend.mains.main:app', host='0.0.0.0', port=80, reload=True)
