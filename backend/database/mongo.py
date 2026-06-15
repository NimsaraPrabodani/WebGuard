from pymongo import MongoClient

MONGO_URI = "mongodb+srv://user_admin:6789@cluster0.zolsgcr.mongodb.net/?appName=Cluster0"

client = MongoClient(MONGO_URI)

db = client["phishing_db"]
collection = db["url_history"]

print("MongoDB Connected Successfully!")