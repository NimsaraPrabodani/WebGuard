from flask import Blueprint, jsonify
from database.mongo import collection

stats_bp = Blueprint("stats_bp", __name__)

@stats_bp.route("/stats", methods=["GET"])
def stats():
    data =  collection.find()

    safe = 0
    suspicious = 0
    dangerous = 0
    total = 0

    for i in data:
        total += 1

        status = i.get("status", "")

        if status == "Safe":
            safe += 1
        elif status == "Suspicious":
            suspicious += 1
        elif status == "Dangerous":
            dangerous+= 1

    safe_pct = (safe / total) * 100 if total > 0 else 0
    suspicious_pct = (suspicious / total) * 100 if total > 0 else 0
    dangerous_pct = (dangerous/ total) * 100 if total > 0 else 0


    return jsonify({
        "total": total,
        "safe": safe,
        "suspicious": suspicious,
        "dangerous": dangerous,
        "safe_percentage" : round(safe_pct,2),
        "suspicious_percentage" : round(suspicious_pct, 2),
        "dangerous_percentage" : round(dangerous_pct, 2)
    })