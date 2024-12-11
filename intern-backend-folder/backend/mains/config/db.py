from sqlmodel import SQLModel, create_engine
from dotenv import load_dotenv
import os

load_dotenv()
S = os.getenv('DB_URI')
connection_str = S
print(S)
engine = create_engine(connection_str)


def create_table():
    SQLModel.metadata.create_all(engine)

