from sqlmodel import SQLModel, AutoString, Relationship
from pydantic import StringConstraints, EmailStr, model_validator
from sqlmodel import Field
import requests
from typing_extensions import Annotated
from fastapi import HTTPException, Path
from sqlalchemy import LargeBinary, Column
import phonenumbers


GenericType = Annotated[
    str,
    StringConstraints(strip_whitespace=True)
]

UsernameType = Annotated[
    str,
    StringConstraints(min_length=5, max_length=20, strip_whitespace=True),
]
PasswordType = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=5, max_length=15)
]
CodeType = Annotated[
    str,
    StringConstraints(strip_whitespace=True)
]
Mobile_no_type = Annotated[
    str,
    StringConstraints(strip_whitespace=True)
]
name_type = Annotated[
    str,
    StringConstraints(strip_whitespace=True)
]
author_type = Annotated[
    str,
    StringConstraints(strip_whitespace=True)
]
time_type = Annotated[
    str,
    StringConstraints(strip_whitespace=True)
]
image_type = Annotated[
    str,
    StringConstraints(strip_whitespace=True)
]


class UserBookLinkValidate(SQLModel):
    user_id: int | None = Field(default=None, foreign_key="users.id", primary_key=True)
    book_id: int | None = Field(default=None, foreign_key="books.book_id", primary_key=True)
    star: Annotated[float, Path(gt=0, le=5)]
    price: Annotated[int, Path(gt=0)]
    s_price: Annotated[int, Path(gt=0)]
    quantity: Annotated[int, Path(gt=0)]
    discount: Annotated[int, Path(gt=0)]
    time: Annotated[time_type, Field()]
    image: Annotated[image_type, Field()]

    @model_validator(mode="after")
    def validate_all_fields(self):
        if self.s_price < self.price:
            raise HTTPException(status_code=422, detail="list price should be greater than sale price")
        return self


class UserBookLink(UserBookLinkValidate,table=True):
    user: "Users" = Relationship(back_populates="book_links")
    book: "Books" = Relationship(back_populates="user_links")


class UserValidate(SQLModel):
    id: int | None = Field(default=None, primary_key=True)
    Username: Annotated[UsernameType, Field(unique=True)]
    Email_Address: EmailStr = Field(unique=True, sa_type=AutoString)
    Password: Annotated[PasswordType, Field()]
    Confirm_password: Annotated[PasswordType, Field()]
    Code: Annotated[CodeType, Field(default='+91')]
    Mobile_no: Annotated[Mobile_no_type, Field(min_length=5, max_length=15, unique=True)]
    @model_validator(mode="after")
    def validate_all_fields(self):
        count = [0, 0, 0, 0]
        all_codes = []
        if len(all_codes) == 0:
            resp = requests.get("https://countriesnow.space/api/v0.1/countries/codes")
            jsonData = resp.json()
            for i in jsonData["data"]:
                a = i['dial_code']
                all_codes.append(f"{a}")

        b = 'QWERTYUIOPASDFGHJKLZXCVBNM'
        a = 'qwertyuiopasdfghjklzxcvbnm'
        c = "1234567890"
        d = '''. , : ; ! ?  '" ( ) [ ] { } - _ … + - *  / ÷ = ≠ < > ≤ ≥ ± ∫ ∑ √ ∞ $ € £ ¥ ¢ & * @  / ^ | ~ # % ‰ § © 
        ® ™ °"\"'''
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

        if self.Mobile_no[0] == '0':
            self.Mobile_no = self.Mobile_no[1:]

        if self.Code not in all_codes:
            raise HTTPException(status_code=422, detail="Please enter the valid phone code")

        is_valid = phonenumbers.parse(self.Code + self.Mobile_no)
        if not phonenumbers.is_valid_number(is_valid):
            raise (HTTPException(status_code=402, detail='Please provide the valid phone number'))
        return self


'''we are joining Users and UserBookLink not via the third table but via foreign key which is defined on UserBookLink'''
'''if we use relationship attribute then we need to specify in case of via third table joining'''
'''relationship is established between Users and UserBookLink'''


class Users(UserValidate, table=True):
    book_links: list[UserBookLink] = Relationship(back_populates='user')


class Login(SQLModel):
    Email_Address: EmailStr = Field(unique=True, sa_type=AutoString)
    Password: Annotated[PasswordType, Field()]


class Forgot(SQLModel):
    Email_Address: EmailStr = Field(unique=True, sa_type=AutoString)


class Passwords(SQLModel):
    Password: Annotated[PasswordType, Field()]
    Confirm_password: Annotated[PasswordType, Field()]
    Email_Address: EmailStr = Field(unique=True, sa_type=AutoString)

    @model_validator(mode="after")
    def validate_all_fields(self):
        count = [0, 0, 0, 0]

        b = "QWERTYUIOPASDFGHJKLZXCVBNM"
        a = 'qwertyuiopasdfghjklzxcvbnm'
        c = "1234567890"
        d = '''. , : ; ! ?  '" ( ) [ ] { } - _ … + - *  / ÷ = ≠ < > ≤ ≥ ± ∫ ∑ √ ∞ $ € £ ¥ ¢ & * @  / ^ | ~ # % ‰ § © 
        ® ™ °"\"'''
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


class ProductValidate(SQLModel):
    id: int | None = Field(default=None, primary_key=True)
    name: Annotated[name_type, Field()]
    author: Annotated[author_type, Field()]
    star: Annotated[float, Path(gt=0, le=5)]
    price: Annotated[int, Path(gt=0)]
    s_price: Annotated[int, Path(gt=0)]
    quantity: Annotated[int, Path(gt=0)]
    discount: Annotated[int, Path(gt=0)]
    time: Annotated[time_type, Field()]
    image: Annotated[image_type, Field()]

    @model_validator(mode="after")
    def validate_all_fields(self):
        if self.s_price == self.price:
            raise HTTPException(status_code=422, detail="Price and del price values cannot be same")
        return self


class Products(ProductValidate, table=True):
    pass


class Books(SQLModel,table=True):
    book_id: int | None = Field(default=None, primary_key=True)
    name: Annotated[name_type, Field()]
    author: Annotated[author_type, Field()]
    google_id: Annotated[GenericType, Field(unique=True)]

    user_links: list[UserBookLink] = Relationship(back_populates='book')
