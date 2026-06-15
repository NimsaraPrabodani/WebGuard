import re

def analyze_url(url):
    score = 0
    

    if len(url) > 75:
        score += 20
       

      
    if re.search(r"\d+\.\d+\.\d+\.\d+", url): 
        score += 30
        

    keywords = ["login", "verify", "update", "secure", "free", "bank"]
    for word in keywords:
        if word in url.lower():
            score += 10
             
    if not url.startswith("https"):
        score += 15
                   

    if score <= 30:
        status = "Safe"
    elif score <=60:
        status = "Suspicious"
    else:
        status = "Phishing"

    return score, status
