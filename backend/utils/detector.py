import re
from urllib.parse import urlparse


def analyze_url(url):

    score = 0
    reasons = []

    # Convert URL to lowercase
    url = url.lower().strip()


    # Add protocol if missing for analysis
    if not url.startswith(("http://", "https://")):
        test_url = "http://" + url
    else:
        test_url = url


    parsed = urlparse(test_url)

    domain = parsed.netloc
    path = parsed.path
    query = parsed.query



    # 1. Check HTTPS
    if not url.startswith("https://"):
        score += 10
        reasons.append("URL is not using HTTPS")


    # 2. Very long URL
    if len(url) > 75:
        score += 15
        reasons.append("URL is very long")


    # 3. IP address instead of domain
    ip_pattern = r"^(?:\d{1,3}\.){3}\d{1,3}$"

    if re.search(ip_pattern, domain):
        score += 30
        reasons.append("IP address used instead of domain name")


    # 4. Suspicious keywords
    keywords = [
        "login",
        "signin",
        "verify",
        "verification",
        "update",
        "secure",
        "account",
        "bank",
        "password",
        "confirm",
        "wallet",
        "payment",
        "free",
        "bonus"
    ]

    found_keywords = []

    for word in keywords:
        if word in url:
            found_keywords.append(word)


    if found_keywords:
        score += min(len(found_keywords) * 5, 20)
        reasons.append(
            "Suspicious keywords found: " + ", ".join(found_keywords)
        )



    # 5. Suspicious special characters

    special_characters = [
        "@",
        "%",
        "$",
        "^",
        "*",
        "!",
        "|",
        "\\",
        "<",
        ">",
        "{",
        "}",
        "[",
        "]",
        "`",
        "~"
    ]


    found_special = []

    for char in special_characters:
        if char in url:
            found_special.append(char)


    if found_special:
        score += 10
        reasons.append(
            "Suspicious special characters found: "
            + ", ".join(found_special)
        )



    # 6. Many subdomains

    dot_count = domain.count(".")

    if dot_count >= 4:
        score += 15
        reasons.append("Too many subdomains detected")



    # 7. Suspicious hyphen usage

    if domain.count("-") >= 2:
        score += 15
        reasons.append("Suspicious hyphen pattern in domain")



    # 8. Suspicious TLD

    suspicious_tlds = [
        ".xyz",
        ".top",
        ".click",
        ".loan",
        ".online",
        ".site",
        ".live",
        ".support"
    ]


    for tld in suspicious_tlds:
        if domain.endswith(tld):
            score += 20
            reasons.append("Suspicious domain extension: " + tld)
            break



    # 9. Domain impersonation words

    brands = [
        "paypal",
        "amazon",
        "google",
        "microsoft",
        "apple",
        "facebook",
        "instagram",
        "netflix",
        "bank"
    ]


    for brand in brands:

        if brand in domain:

            # Check if extra suspicious words exist
            if any(word in domain for word in 
                   ["secure", "update", "login", "verify"]):

                score += 25
                reasons.append(
                    "Possible brand impersonation detected"
                )

            break



    # 10. Too many numbers

    number_count = sum(char.isdigit() for char in domain)

    if number_count >= 5:
        score += 10
        reasons.append("Too many numbers in domain")



    # 11. Long domain name

    if len(domain) > 30:
        score += 10
        reasons.append("Domain name is unusually long")



    # 12. Deep URL path

    if path.count("/") >= 4:
        score += 10
        reasons.append("Unusual URL path depth")



    # 13. Many query parameters

    if query.count("&") >= 3:
        score += 10
        reasons.append("Too many URL parameters")



    # Maximum score

    if score > 100:
        score = 100



    # Final classification

    if score <= 20:
        status = "Safe"

    elif score <= 60:
        status = "Suspicious"

    else:
        status = "Dangerous"



    return score, status, reasons