from flask import Blueprint, request, jsonify
from database.mongo import admin_collection
from werkzeug.security import check_password_hash

admin_bp = Blueprint("admin",__name__)

@admin_bp.route("/login", methods=["POST"])
def login_admin():
    
    data = request.json

    email = data.get("email")
    password = data.get("password")

    if not email or not password:

        return jsonify({
            "message" : "Email and Password required"
        }),400
    
    
    admin = admin_collection.find_one({
        "email" : email
    })

    if not admin:

        return jsonify({
            "message" : "Admin not found"
        }),404
    
    if check_password_hash(
        admin["password"],
        password
    ):
        return jsonify({
            "message" : "Login Success",
            "admin":{
                "name" : admin["name"],
                "email":admin["email"]
            }
        }),200
    
    else: 

        return jsonify({
            "message" : "Wrong Password"
        }),401
    
@admin_bp.route("/test", methods=["GET"])
def test():
    return "Admin route is working"