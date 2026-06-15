from flask import Blueprint, jsonify
from database.mongo import collection

history_bp = Blueprint("history_bp", __name__)

@history_bp.route("/history", methods=["GET"])
def history():
    data = collection.find().sort("date", -1)

    result = []

    for i in data:
        result.append({
            "url": i["url"],
            "score" :i["score"],
            "status":i["status"],
            "date":str(i["date"])
        })

        return jsonify(result)