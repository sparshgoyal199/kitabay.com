from sqlmodel import SQLModel, create_engine
'''sqlmodel library is used to intract with the database'''
from dotenv import load_dotenv
import os

load_dotenv()
'''we use all these to retrieve the hidden data in our env file'''
S = os.getenv('DB_URI')
connection_str = S
''''''
engine = create_engine(connection_str)
print(engine)
''' engine acts as a source of connectivity to the database'''
'''when we need to conect with database then use engine variable'''

def create_table():
    SQLModel.metadata.create_all(engine)
'''above line is helping in creating the table in sql from the classes which we defined in the module.py''' 

