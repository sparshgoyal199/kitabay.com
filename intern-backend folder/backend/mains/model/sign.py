from sqlmodel import SQLModel, AutoString
import requests
from pydantic import StringConstraints, EmailStr, model_validator
from sqlmodel import Field
from typing_extensions import Annotated
import requests
from fastapi import HTTPException, UploadFile, File
from sqlalchemy import LargeBinary,Column
import phonenumbers
all_codes = []


class Signs(SQLModel):
    Username: Annotated[str, StringConstraints(min_length=5, max_length=20, strip_whitespace=True), Field(primary_key=True)]
    Email_Address: EmailStr = Field(unique=True, sa_type=AutoString)
    Password: Annotated[str, StringConstraints(strip_whitespace=True, min_length=5, max_length=15), Field()]
    Confirm_password: Annotated[str, StringConstraints(strip_whitespace=True), Field()]
    Code: Annotated[str, Field(default='+91'), StringConstraints(strip_whitespace=True)]
    Mobile_no: Annotated[str, Field(min_length=5, max_length=15, unique=True), StringConstraints(strip_whitespace=True)]

    @model_validator(mode="after")
    def validate_all_fields(self):
        count = [0, 0, 0, 0]

        b = "QWERTYUIOPASDFGHJKLZXCVBNM"
        a = 'qwertyuiopasdfghjklzxcvbnm'
        c = "1234567890"
        d = '''. , : ; ! ?  '" ( ) [ ] { } - _ … + - *  / ÷ = ≠ < > ≤ ≥ ± ∫ ∑ √ ∞ $ € £ ¥ ¢ & * @  / ^ | ~ # % ‰ § © ® ™ °"\"'''
        e = ['uppercase ', 'lowercase ', 'digit ', 'special character ']

        for i in self.Password:
            match i:
                case _ if count[0] == 0 and i in b:
                    count[0] = 1
                    e.remove('uppercase ')

                case _ if count[1] == 0 and i in a:
                    count[1] = 1
                    e.remove('lowercase ')

                case _ if count[2] == 0 and i in c:
                    count[2] = 1
                    e.remove('digit ')

                case _ if count[3] == 0 and i in d:
                    count[3] = 1
                    e.remove('special character ')

        aa = ",".join(e)
        if sum(count) != 4:
            raise (HTTPException(status_code=422, detail=f"Password must contain atleast one {aa}"))

        if len(all_codes) == 0:
            resp = requests.get("https://restcountries.com/v3.1/independent?status=true")
            for i in resp.json():
                a = i["idd"]["root"][:]
                b = i["idd"]["suffixes"][0]
                all_codes.append(f"{a}{b}")

        if self.Code not in all_codes:
            raise HTTPException(status_code=422, detail="Please enter the valid phone code")

        if self.Password != self.Confirm_password:
            raise HTTPException(status_code=422, detail="Please enter same password in both the field")

        is_valid = phonenumbers.parse(self.Code+self.Mobile_no)
        if not phonenumbers.is_valid_number(is_valid):
            raise(HTTPException(status_code=402, detail='Please provide the valid phone number'))
        return self


class Sign(Signs, table=True):
    pass


class Login(SQLModel):
    Mobile_no: Annotated[str, Field(min_length=5, max_length=15), StringConstraints(strip_whitespace=True)]
    Password: Annotated[str, StringConstraints(strip_whitespace=True, min_length=5, max_length=15), Field()]


class Forgot(SQLModel):
    Mobile_no: Annotated[str, Field(min_length=5, max_length=15), StringConstraints(strip_whitespace=True)]


class Passwords(SQLModel):
    Password: Annotated[str, StringConstraints(strip_whitespace=True, min_length=5, max_length=15), Field()]
    Confirm_password: Annotated[str, StringConstraints(strip_whitespace=True), Field()]
    Mobile_no: Annotated[str, Field(min_length=5, max_length=15), StringConstraints(strip_whitespace=True)]

    @model_validator(mode="after")
    def validate_all_fields(self):
        count = [0, 0, 0, 0]

        b = "QWERTYUIOPASDFGHJKLZXCVBNM"
        a = 'qwertyuiopasdfghjklzxcvbnm'
        c = "1234567890"
        d = '''. , : ; ! ?  '" ( ) [ ] { } - _ … + - *  / ÷ = ≠ < > ≤ ≥ ± ∫ ∑ √ ∞ $ € £ ¥ ¢ & * @  / ^ | ~ # % ‰ § © ® ™ °"\"'''
        e = ['uppercase ', 'lowercase ', 'digit ', 'special character ']

        for i in self.Password:
            match i:
                case _ if count[0] == 0 and i in b:
                    count[0] = 1
                    e.remove('uppercase ')

                case _ if count[1] == 0 and i in a:
                    count[1] = 1
                    e.remove('lowercase ')

                case _ if count[2] == 0 and i in c:
                    count[2] = 1
                    e.remove('digit ')

                case _ if count[3] == 0 and i in d:
                    count[3] = 1
                    e.remove('special character ')

        aa = ",".join(e)
        if sum(count) != 4:
            raise (HTTPException(status_code=422, detail=f"Password must contain atleast one {aa}"))

        if self.Password != self.Confirm_password:
            raise HTTPException(status_code=422, detail="Please enter same password in both the field")

        return self



class ProductInfo(SQLModel, table=True):
    product_id: int | None = Field(default=None, primary_key=True)
    name: str
    author: str
    star: float
    price: int
    s_price: int
    quantity: int
    discount: int
    image: bytes = Field(sa_column=Column(LargeBinary(length=(2**32)-1)))


class ProductInfo2(SQLModel, table=True):
    product_id: int | None = Field(default=None, primary_key=True)
    name: str
    author: str
    star: float
    price: int
    s_price: int
    quantity: int
    discount: int
    time:str
    image: str