from sqlmodel import SQLModel, create_engine
'''sqlmodel library is used to intract with the database'''
from dotenv import load_dotenv
from supabase import create_client
import os

load_dotenv()
'''we use all these to retrieve the hidden data in our env file'''
S = os.getenv('DB_URI')

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Initialize Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
connection_str = S
''''''
engine = create_engine(connection_str)
''' engine acts as a source of connectivity to the database'''
'''when we need to conect with database then use engine variable'''

def create_table():
    SQLModel.metadata.create_all(engine)
'''above line is helping in creating the table in sql from the classes which we defined in the module.py''' 

