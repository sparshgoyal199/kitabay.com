from sqlmodel import SQLModel, create_engine
from dotenv import load_dotenv
from supabase import create_client
import os

load_dotenv()
S = os.getenv('DB_URI')

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
connection_str = S
engine = create_engine(connection_str)


def create_table():
    try:
        SQLModel.metadata.create_all(engine)
    except Exception as e:
        print("An exception occurred")
        print(e)
        return None


