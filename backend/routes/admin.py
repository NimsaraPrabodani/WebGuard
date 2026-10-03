from flask import Blueprint, request, jsonify, send_file
from database.mongo import admin_collection, url_collection
from werkzeug.security import check_password_hash
from datetime import datetime
from io import BytesIO
from reportlab.pdfgen import canvas


admin_bp = Blueprint("admin", __name__)


# =========================================================
# ADMIN LOGIN
# =========================================================

@admin_bp.route("/login", methods=["POST"])
def login_admin():

    data = request.json

    email = data.get("email")
    password = data.get("password")

    if not email or not password:

        return jsonify({
            "message": "Email and Password required"
        }), 400

    admin = admin_collection.find_one({
        "email": email
    })

    if not admin:

        return jsonify({
            "message": "Admin not found"
        }), 404

    if check_password_hash(
        admin["password"],
        password
    ):

        return jsonify({
            "message": "Login Success",
            "admin": {
                "name": admin["name"],
                "email": admin["email"]
            }
        }), 200

    else:

        return jsonify({
            "message": "Wrong Password"
        }), 401


# =========================================================
# ADMIN TEST
# =========================================================

@admin_bp.route("/test", methods=["GET"])
def test():
    return "Admin route is working"


# =========================================================
# MONTHLY REPORT
# =========================================================

@admin_bp.route("/monthly-report", methods=["GET"])
def monthly_report():

    month = request.args.get("month")

    # -----------------------------------------------------
    # Check month
    # -----------------------------------------------------

    if not month:
        return jsonify({
            "error": "Please provide month in YYYY-MM format"
        }), 400

    try:

        start_date = datetime.strptime(
            month + "-01",
            "%Y-%m-%d"
        )

    except ValueError:

        return jsonify({
            "error": "Invalid month. Use YYYY-MM"
        }), 400


    # -----------------------------------------------------
    # Get records for selected month
    #
    # IMPORTANT:
    # Database stores date as STRING.
    # Example:
    # 2026-10-03 13:40:07.216796
    #
    # Therefore we use regex instead of datetime range.
    # -----------------------------------------------------

    records = list(
        url_collection.find({
            "date": {
                "$regex": f"^{month}"
            }
        }).sort("date", 1)
    )


    # -----------------------------------------------------
    # Calculate summary
    # -----------------------------------------------------

    total = len(records)

    safe = 0
    suspicious = 0
    phishing = 0

    for record in records:

        status = str(
            record.get("status", "")
        ).lower().strip()

        if status == "safe":

            safe += 1

        elif status == "suspicious":

            suspicious += 1

        # Database uses "Dangerous"
        # PDF displays it as "Phishing"
        elif status in ["dangerous", "phishing"]:

            phishing += 1


    # -----------------------------------------------------
    # Calculate percentages
    # -----------------------------------------------------

    if total > 0:

        safe_percentage = (safe / total) * 100
        suspicious_percentage = (suspicious / total) * 100
        phishing_percentage = (phishing / total) * 100
        total_percentage = 100

    else:

        safe_percentage = 0
        suspicious_percentage = 0
        phishing_percentage = 0
        total_percentage = 0


    # =====================================================
    # CREATE PDF
    # =====================================================

    pdf = BytesIO()

    c = canvas.Canvas(pdf)

    width, height = 595, 842


    # =====================================================
    # HEADER
    # =====================================================

    c.setFont("Helvetica-Bold", 20)

    c.drawCentredString(
        width / 2,
        height - 50,
        "WEBGUARD"
    )

    c.setFont("Helvetica-Bold", 14)

    c.drawCentredString(
        width / 2,
        height - 75,
        "MONTHLY SECURITY REPORT"
    )

    c.setFont("Helvetica", 10)

    c.drawString(
        50,
        height - 110,
        f"Report Month : {month}"
    )

    c.drawString(
        50,
        height - 128,
        f"Generated On : {datetime.now().strftime('%d/%m/%Y')}"
    )


    # =====================================================
    # MONTHLY SUMMARY
    # =====================================================

    y = height - 170

    c.setFont("Helvetica-Bold", 12)

    c.drawString(
        50,
        y,
        "MONTHLY SUMMARY"
    )

    y -= 25

    c.setFont("Helvetica", 10)

    c.drawString(
        60,
        y,
        f"Total Scans     : {total}"
    )

    y -= 18

    c.drawString(
        60,
        y,
        f"Safe URLs       : {safe}"
    )

    y -= 18

    c.drawString(
        60,
        y,
        f"Suspicious URLs : {suspicious}"
    )

    y -= 18

    c.drawString(
        60,
        y,
        f"Phishing URLs   : {phishing}"
    )


    # =====================================================
    # DETECTION SUMMARY
    # =====================================================

    y -= 40

    c.setFont("Helvetica-Bold", 12)

    c.drawString(
        50,
        y,
        "DETECTION SUMMARY"
    )

    y -= 25

    c.setFont("Helvetica-Bold", 9)

    c.drawString(
        60,
        y,
        "Status"
    )

    c.drawString(
        230,
        y,
        "Count"
    )

    c.drawString(
        330,
        y,
        "Percentage"
    )

    y -= 18

    c.setFont("Helvetica", 9)

    # Safe

    c.drawString(
        60,
        y,
        "Safe"
    )

    c.drawString(
        230,
        y,
        str(safe)
    )

    c.drawString(
        330,
        y,
        f"{safe_percentage:.2f}%"
    )

    y -= 18

    # Suspicious

    c.drawString(
        60,
        y,
        "Suspicious"
    )

    c.drawString(
        230,
        y,
        str(suspicious)
    )

    c.drawString(
        330,
        y,
        f"{suspicious_percentage:.2f}%"
    )

    y -= 18

    # Phishing

    c.drawString(
        60,
        y,
        "Phishing"
    )

    c.drawString(
        230,
        y,
        str(phishing)
    )

    c.drawString(
        330,
        y,
        f"{phishing_percentage:.2f}%"
    )

    y -= 18

    # Total

    c.drawString(
        60,
        y,
        "Total"
    )

    c.drawString(
        230,
        y,
        str(total)
    )

    c.drawString(
        330,
        y,
        f"{total_percentage:.2f}%"
    )


    # =====================================================
    # SCAN DETAILS
    # =====================================================

    y -= 40

    c.setFont(
        "Helvetica-Bold",
        12
    )

    c.drawString(
        50,
        y,
        "SCAN DETAILS"
    )

    y -= 25


    # Table header

    c.setFont(
        "Helvetica-Bold",
        8
    )

    c.drawString(
        50,
        y,
        "Date"
    )

    c.drawString(
        120,
        y,
        "URL"
    )

    c.drawString(
        390,
        y,
        "Score"
    )

    c.drawString(
        440,
        y,
        "Status"
    )

    y -= 15

    c.setFont(
        "Helvetica",
        7
    )


    # =====================================================
    # SCAN RECORDS
    # =====================================================

    for record in records:

        # New page when necessary

        if y < 50:

            c.setFont(
                "Helvetica",
                8
            )

            c.drawString(
                50,
                30,
                "Generated by WebGuard Admin"
            )

            c.showPage()

            y = height - 50

            c.setFont(
                "Helvetica-Bold",
                12
            )

            c.drawString(
                50,
                y,
                "SCAN DETAILS (CONTINUED)"
            )

            y -= 25

            c.setFont(
                "Helvetica-Bold",
                8
            )

            c.drawString(
                50,
                y,
                "Date"
            )

            c.drawString(
                120,
                y,
                "URL"
            )

            c.drawString(
                390,
                y,
                "Score"
            )

            c.drawString(
                440,
                y,
                "Status"
            )

            y -= 15

            c.setFont(
                "Helvetica",
                7
            )


        # -------------------------------------------------
        # DATE
        # -------------------------------------------------

        date_value = record.get("date")

        if date_value:

            try:

                parsed_date = datetime.strptime(
                    str(date_value),
                    "%Y-%m-%d %H:%M:%S.%f"
                )

                date_text = parsed_date.strftime(
                    "%d/%m/%Y"
                )

            except ValueError:

                try:

                    parsed_date = datetime.strptime(
                        str(date_value),
                        "%Y-%m-%d %H:%M:%S"
                    )

                    date_text = parsed_date.strftime(
                        "%d/%m/%Y"
                    )

                except ValueError:

                    date_text = str(date_value)

        else:

            date_text = "-"


        # -------------------------------------------------
        # URL
        # -------------------------------------------------

        url = str(
            record.get("url", "-")
        )

        # Shorten long URLs

        if len(url) > 40:

            url = url[:37] + "..."


        # -------------------------------------------------
        # SCORE
        # -------------------------------------------------

        score = str(
            record.get("score", "-")
        )


        # -------------------------------------------------
        # STATUS
        # -------------------------------------------------

        status = str(
            record.get("status", "-")
        )


        # -------------------------------------------------
        # DRAW DATA
        # -------------------------------------------------

        c.drawString(
            50,
            y,
            date_text
        )

        c.drawString(
            120,
            y,
            url
        )

        c.drawString(
            390,
            y,
            score
        )

        c.drawString(
            440,
            y,
            status
        )

        y -= 15


    # =====================================================
    # FOOTER
    # =====================================================

    c.setFont(
        "Helvetica",
        8
    )

    c.drawString(
        50,
        30,
        "Generated by WebGuard Admin"
    )


    # =====================================================
    # FINISH PDF
    # =====================================================

    c.save()

    pdf.seek(0)


    # =====================================================
    # DOWNLOAD PDF
    # =====================================================

    return send_file(
        pdf,
        mimetype="application/pdf",
        as_attachment=True,
        download_name=f"WebGuard_Monthly_Report_{month}.pdf"
    )