/*function analyzeURL(url){

    let score = 0;
    let reasons = [];

    if(url.includes("@")){
        score += 40;
        reasons.push("@ symbol detected");
    }

    if(url.startsWith("http://")){
        score += 25;
        reasons.push("Not HTTPS");
    }

    if(url.length > 60){
        score += 20;
        reasons.push("Long URL");
    }

    return {
        status: score >= 50 ? "Phishing" : "Safe",
        score: score,
        reasons: reasons
    };
}*/