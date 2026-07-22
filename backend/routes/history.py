from flask import Blueprint, jsonify
from database.mongo import url_collection

history_bp = Blueprint("history_bp", __name__)

@history_bp.route("/history", methods=["GET"])
def history():
    try:
        data = url_collection.find().sort("date", -1)

        result = []

        for i in data:

             url = i.get("url","")

             if len(url) > 20:
                masked_url = url[:15] + "********" + url[-10:]
             else:
                masked_url = url




             result.append({
                "url": masked_url,
                "score": i.get("score"),
                "status": i.get("status"),
                "reasons": i.get("reasons", []),
                "date": str(i.get("date"))
            })

        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500