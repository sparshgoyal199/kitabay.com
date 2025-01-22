from sqlmodel import SQLModel, AutoString
import requests
from pydantic import StringConstraints, EmailStr, model_validator
'''stringconostranint is used for validation purpose'''
from sqlmodel import Field
'''field is majorly used for defining database schema'''
'''defines additional metadata for the field.'''
from typing_extensions import Annotated
import requests
from fastapi import HTTPException, UploadFile, File, Path
from sqlalchemy import LargeBinary,Column
import phonenumbers
all_codes = []

'''this class is created for the validation purpose,we cant write here table = true 
and for reflecting the class into the database it is necessary to write table = true which we done through another class'''
class Signs(SQLModel):
    Username: Annotated[str, StringConstraints(min_length=5, max_length=20, strip_whitespace=True), Field(primary_key=True)]
    Email_Address: EmailStr = Field(unique=True, sa_type=AutoString)
    Password: Annotated[str, StringConstraints(strip_whitespace=True, min_length=5, max_length=15), Field()]
    Confirm_password: Annotated[str, StringConstraints(strip_whitespace=True), Field()]
    Code: Annotated[str, Field(default='+91'), StringConstraints(strip_whitespace=True)]
    Mobile_no: Annotated[str, Field(min_length=5, max_length=15, unique=True), StringConstraints(strip_whitespace=True)]

    @model_validator(mode="after")
    def validate_all_fields(self):
        '''self is representig whole object'''
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
            '''we use httpException as generating custom error message when client made the mistake while contacting to the backend server'''
            '''or mistakes while validating the data into backend'''
            raise(HTTPException(status_code=422, detail=f"Password must contain atleast one {aa}"))

        if len(all_codes) == 0:
            resp = requests.get("https://restcountries.com/v3.1/independent?status=true")
            '''api used as the to talk to the servers '''
            '''we use request to bring the third party data'''
            for i in resp.json():
                a = i["idd"]["root"][:]
                b = i["idd"]["suffixes"][0]
                '''a and b both representing the phone code of that country as a string format'''
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
'''we create(class sign) this additionally because it creates the actual table in our database(table= true is necessary)'''
'''we cant define the attribute in the class then in t hat validation will not be occur because of line (table = true)'''
class Login(SQLModel):
    Mobile_no: Annotated[str, Field(min_length=5, max_length=15), StringConstraints(strip_whitespace=True)]
    Password: Annotated[str, StringConstraints(strip_whitespace=True, min_length=5, max_length=15), Field()]
'''this table is created only for the purpose of validation'''

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

'''when the vendor uploading its products to the page'''
class ProductInfo2Validations(SQLModel):
    '''You can let the database automatically generate a value for product_id (if its set up as an auto-incrementing column)'''
    product_id: int|None = Field(default=None, primary_key=True)
    '''if we remove the default = NONE then this will not remain the autoincrement key,default = None this should be autoincrement key'''
    name: Annotated[str, StringConstraints(strip_whitespace=True)]
    author: Annotated[str, StringConstraints(strip_whitespace=True)]
    star: Annotated[float, Path(gt=0, le=5)]
    '''like stringconstraint for string validation path is for integer validation'''
    price: Annotated[int, Path(gt=0)]
    s_price: Annotated[int, Path(gt=0)]
    quantity: Annotated[int, Path(gt=0)]
    discount: Annotated[int, Path(gt=0)]
    time: Annotated[str, StringConstraints(strip_whitespace=True)]
    image: Annotated[str, StringConstraints(strip_whitespace=True)]
    '''as we are only storing the path of that image'''

    @model_validator(mode="after")
    def validate_all_fields(self):
        if self.s_price == self.price:
            raise HTTPException(status_code=422, detail="Price and del price values cannot be same")
        return self


class ProductInfo2(ProductInfo2Validations, table=True):
    pass