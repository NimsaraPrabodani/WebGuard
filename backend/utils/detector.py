def check_url(url):
    if "google" in url:
        return {
            "status": "Safe Website",
            "risk_score": 0,
            "reasons": []
        }
    else:
        return {
            "status": "Phishing Website",
            "risk_score": 90,
            "reasons": ["Suspicious URL pattern"]
        }