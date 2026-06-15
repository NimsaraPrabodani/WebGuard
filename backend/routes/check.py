from flask import Blueprint, request,jsonify
from utils.detector import analyze_url
from database.mongo import collection
from datetime import datetime


check_bp = Blueprint("check_bp", __name__)

@check_bp.route("/check-url", methods=["POST"])
def check():
    data = request.get_json()
    url = data.get("url")

    if not url:
        return jsonify({"error":"URL is required"}), 400
    
    existing = collection.find_one({"url":url})

    if existing:
        return jsonify({
            "url": existing["url"],
            "score": existing["score"],
            "status": existing["status"],
            
    })

    score, status = analyze_url(url)

    record = {
        "url" : url,
        "score" : score,
        "status": status,
        "date":datetime.now()
    }

    collection.insert_one(record)

    return jsonify({
    "url":url,
    "score": score,
    "status": status
})
