from flask import Blueprint, request,jsonify
from utils.detector import check_url

check_bp = Blueprint("check_bp", __name__)

@check_bp.route("/check-url", methods=["POST"])
def check():
    data = request.get_json()

    url = data.get("url")

    if not url:
        return jsonify({"error":"URL is required"}), 400
    
    result = check_url(url)

    return jsonify({
        "url" : url,
        "result": result
    })