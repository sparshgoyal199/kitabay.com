from sqlmodel import SQLModel, create_engine
from dotenv import load_dotenv
import os
load_dotenv()
connection_str = os.getenv('DB_URI')
engine = create_engine(connection_str)


def create_table():
    SQLModel.metadata.create_all(engine)

