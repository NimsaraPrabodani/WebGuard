from flask import Blueprint, request, jsonify
from utils.detector import analyze_url
from database.mongo import collection
from datetime import datetime

check_bp = Blueprint("check_bp", __name__)

@check_bp.route("/check-url", methods=["POST"])
def check():
    try:
        data = request.get_json()

        url = data.get("url")

        if not url:
            return jsonify({"error": "URL is required"}), 400

        score, status, reasons = analyze_url(url)

        record = {
            "url": url,
            "score": score,
            "status": status,
            "reasons": reasons,
            "date": str(datetime.now())
        }

        collection.update_one(
            {"url": url},
            {"$set": record},
            upsert=True
        )


        
        record.pop("_id", None)

        return jsonify(record)

    except Exception as e:
        return jsonify({"error": str(e)}), 500