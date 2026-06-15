let currentURL = "";

chrome.tabs.query(
    {
        active:true,
        currentWindow:true
    },
    function(tabs){

        currentURL = tabs[0].url;

        document.getElementById("url").innerText =
            currentURL;
    }
);

document
.getElementById("checkBtn")
.addEventListener("click", function(){

    const result = analyzeURL(currentURL);

    if(result.status === "Safe"){

        document.getElementById("status").innerHTML =
            "SAFE";

    }else{

        document.getElementById("status").innerHTML =
            "PHISHING";

    }

    document.getElementById("score").innerHTML =
        "Risk Score: " + result.score + "%";

    document.getElementById("reason").innerHTML =
        result.reasons.join("<br>");
});