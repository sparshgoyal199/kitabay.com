from .model.sign import Signs, Sign, Login, Forgot, Passwords, ProductInfo, ProductInfo2, ProductInfo2Validations
from .config.db import create_table, engine
from sqlalchemy import func, desc
from fastapi import FastAPI, HTTPException, Request, status, Path, Form, UploadFile
from sqlalchemy.exc import IntegrityError
import os
import uvicorn
import random
import secrets
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse,HTMLResponse
from sqlmodel import Session, select
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from passlib.context import CryptContext
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, Response
from pathlib import Path

load_dotenv()
PORT = os.getenv("PORT" , 3000)
 
app = FastAPI()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
'''that means creating the object of CryptContext class and then use .hash to hash passwords'''
otp = 0

frontend_path = Path(__file__).resolve().parent.parent.parent.parent / 'static'
app.mount("/static", StaticFiles(directory=frontend_path), name="static")

@app.get("/")
def read_index():
    # Access your HTML file
    with open(frontend_path / 'html_folder/sign.html', 'r') as file:
        #above is the absoulte path of that system
        html_content = file.read()
    return HTMLResponse(content=html_content)

# app.mount("/static/css", StaticFiles(directory="inter-frontend-folder/css_folder"), name="css")
# app.mount("/static/js", StaticFiles(directory="inter-frontend-folder/javascript_folder"), name="js")
# app.mount("/static/image", StaticFiles(directory="inter-frontend-folder/image"), name="image")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  #http://0.0.0.0:8000
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
'''through we can restrict the access of backend server-we can also restrict that only these http verbs can be accessed'''

'''to cutomise the error message and format we use exception handler'''
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    a = exc.errors()
    b = f"{a[0]['loc'][1]} {a[0]['msg']}"
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=jsonable_encoder({"detail": b}),
)

'''databse schema related error - Occurs when you try to insert a row with a primary key value that already exists in the table,unique key error,not null constraint'''
@app.exception_handler(IntegrityError)
async def validations_exception_handler(request: Request, exc: IntegrityError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=jsonable_encoder({"detail": str(exc.orig)[8:len(str(exc.orig))-2]})
    )
'''customise the message and format of the error'''


@app.post('/posting')
def posting(signs: Signs):
    validate = Sign.model_validate(signs)
    '''vaidate representing the instance of class Sign,which is being converted of the signs class'''
    validate.Password = pwd_context.hash(validate.Password)
    validate.Confirm_password = validate.Password
    with Session(engine) as session:
        session.add(validate)
        '''it matches automatically - instance/object of which table'''
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
    '''that means use the global otp variable'''
    if forgots.Mobile_no[0] == '0':
        forgots.Mobile_no = forgots.Mobile_no[1:]
        print(forgots.Mobile_no)
    with Session(engine) as session:
        data = session.exec(select(Sign).where(Sign.Mobile_no == forgots.Mobile_no)).first()
        if data:
            otp = random.randint(111111, 999999)
            return otp
        else:
            raise (HTTPException(status_code=422, detail="Mobile number does not exist"))


@app.put('/C_password')
def C_password(passwords: Passwords):
    if passwords.Mobile_no[0] == '0':
        passwords.Mobile_no = passwords.Mobile_no[1:]
    '''in javascript of forgotpassword with use of localstorage stored the user enter mobile number,so that we can use it in password.js page'''
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

'''@app.post('/uploading')
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
'''

@app.post('/uploading2')
async def uploading2(name: str = Form(...), author: str = Form(...), star: float = Form(...), price: int = Form(...), s_price: int = Form(...), quantity: int = Form(...), discount: int = Form(...), time: str = Form(...), image: UploadFile = Form(...)):
    '''we need to write down seperately the datatype of each variable in that formObject as image is included'''
    images = await image.read()
    '''we are reading in fastapi'''
    '''C:/Users/spars/OneDrive/Desktop/Internship_project/intern-backend-folder/backend/static/'''
    '''FILEPATH = Path(__file__).resolve().parent.parent / "static/"'''
    '''above filepath will also give you the absolute path but with backwad slash'''
    filename = image.filename
    extension = filename.split(".")[1]
    if extension not in ["png", "jpeg", "jpg"]:
        raise (HTTPException(status_code=423, detail='Please choose png,jpg or jpeg image format'))
    '''token_name represents name of the image'''
    token_name = secrets.token_hex(10)+"."+extension
    FILEPATH = Path(Path(__file__).resolve().parent.parent / "static/")
    generated_name = os.path.join(FILEPATH,token_name)
    with open(generated_name, "wb") as file:
        file.write(images)
    file.close()
    FILEPATH = Path(Path(__file__).resolve().parent.parent.parent.parent/"static/static/")
    generated_name = os.path.join(FILEPATH,token_name)
    with open(generated_name, "wb") as file:
        file.write(images)
        file.close()
    '''FILEPATH + token_name'''
    '''token_name describing the new file name'''
    '''generated_name describing also the filepath'''
    products = ProductInfo2Validations(name=name, author=author, star=star, price=price, s_price=s_price, quantity=quantity, discount=discount, time=time, image=generated_name)
    validate = ProductInfo2.model_validate(products)
    with Session(engine) as session:
        '''we are first adding the file backend directory folder'''
        '''if we does not do this image will always be upload in directory irrespective of record is stored in database or nto'''
        '''then adding the file in frontend directory folder'''
        session.add(validate)
        session.commit()
        session.refresh(validate)
        return [generated_name, validate.product_id]
    '''generated_name returns bacause to show the file in ui'''
'''Get-Process | Where-Object { $_.ProcessName -eq "python" } | Stop-Process -Force
'''
'''for killing the background process'''

'''@app.get('/card_details')
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

'''
'''@app.get('/get_image/{image_id}')
def get_image(image_id: int):
    with Session(engine) as session:
        w = session.exec(select(ProductInfo).where(ProductInfo.product_id == image_id)).first()
        image_stream = BytesIO(w.image)
        pic = StreamingResponse(image_stream, media_type="image/png")
        pic = Response(content=w.image, media_type="image/png")
        return pic
'''

'''@app.put('/updating')
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
'''
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
        '''model_dump convert the object into python dictionary'''
        peices.sqlmodel_update(form_data)
        session.commit()
        session.refresh(peices)
        return "no editing in image"
'''updating20 will run when editing the data user does not the provide the image'''

@app.put('/updating21')
async def updating2(old: int = Form(...), name: str = Form(...), author: str = Form(...), star: str = Form(...), price: str = Form(...), s_price: str = Form(...), quantity: str = Form(...), discount: str = Form(...), image: UploadFile = Form(...), time: str = Form(...)):
    '''as user provided the new image to be edited'''
    with Session(engine) as session:
        if image:
            images = await image.read()
        filename = image.filename
        extension = filename.split(".")[1]
        if extension not in ["png", "jpeg", "jpg"]:
            raise (HTTPException(status_code=423, detail='Please choose png,jpg or jpeg image format'))

        token_name = secrets.token_hex(10) + "." + extension
        FILEPATH = Path(Path(__file__).resolve().parent.parent/"static/")
        generated_name = os.path.join(FILEPATH,token_name)
        with open(generated_name, "wb") as file:
            file.write(images)
        file.close()
        FILEPATH = Path(Path(__file__).resolve().parent.parent.parent.parent/"static/static/")
        generated_name = os.path.join(FILEPATH,token_name)
        with open(generated_name, "wb") as file:
            file.write(images)
        file.close()
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
        # filename = image.filename
        # extension = filename.split(".")[1]
        # if extension not in ["png", "jpeg", "jpg"]:
        #     raise (HTTPException(status_code=423, detail='Please choose png,jpg or jpeg image format'))
        #
        # token_name = secrets.token_hex(10) + "." + extension
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

        y = session.exec(select(func.count(ProductInfo2.product_id))).one()
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
    uvicorn.run('intern-backend-folder.backend.mains.main:app', host='0.0.0.0', port=int(PORT), reload=True)
