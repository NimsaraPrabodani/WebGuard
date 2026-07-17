from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(MONGO_URI)

db = client["phishing_db"]

url_collection = db["url_history"]
admin_collection = db["admin"]


print("MongoDB Connected Successfully!")