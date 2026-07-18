import re



def analyze_url(url):
    score = 0
    reasons = []
    

    if len(url) > 75:
        score += 20
        reasons.append("URL is very long")
       

      
    if re.search(r"\d+\.\d+\.\d+\.\d+", url): 
        score += 30
        reasons.append("IP address used instead of domain name")
        

    keywords = ["login", "verify", "update", "secure", "free", "bank"]
    if any(word in url for word in keywords):
        score += 10
        reasons.append("Suspicious keyword found")


    special_chars = ["@" , "%", "$","&"]
    if any(char in url for char in special_chars):
        score += 10
        reasons.append("Suspicious special characters found")

        
    if not url.startswith("https"):
        score += 15
        reasons.append("URL is not using HTTPS")

    if "-" in url and any(word in url for word in keywords):
        score += 20
        reasons.append("Suspicious domain pattern detected")

                

    if score <= 30:
        status = "Safe"
    elif score <=60:
        status = "Suspicious"
    else:
        status = "Dangerous"

    

    return score, status, reasons
