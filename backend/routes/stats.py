from flask import Blueprint, jsonify
from database.mongo import collection

stats_bp = Blueprint("stats_bp", __name__)

@stats_bp.route("/stats", methods=["GET"])
def stats():
    total = collection.count_documents({})
    safe = collection.count_documents({"result.status": "Safe Website"})
    phishing = collection.count_documents({"result.status": "Phishing Website"})


    return jsonify({
        "total": total,
        "safe": safe,
        "phishing": phishing
    })