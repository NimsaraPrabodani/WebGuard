document.addEventListener('DOMContentLoaded', () => {
  const urlTextEl = document.getElementById('urlText');
  const checkBtn = document.getElementById('checkBtn');
  const checkScreen = document.getElementById('checkScreen');
  const resultScreen = document.getElementById('resultScreen');
  const resultBox = document.getElementById('resultBox');
  const viewScoreBtn = document.getElementById('viewScoreBtn');
  const detailsEl = document.getElementById('details');

let currentUrl = '';
let lastAnalysis = null;

// Get Current Tab URL
chrome.tabs.query(
  { active: true, currentWindow: true },
  (tabs) => {

    const tab = tabs[0];

    if(tab && tab.url){

      currentUrl = tab.url;

      urlTextEl.textContent = currentUrl;

      checkBtn.disabled = false;

      // Load previous scan
      loadLastScan();

    }
    else{

      urlTextEl.textContent =
      "Unable to read current tab";

      checkBtn.disabled = true;

    }

});
// Connect Flask Backend

async function checkUrlWithBackend(url){


  const response = await fetch(
    
    "http://localhost:5000/check-url",
    {

      method:"POST",

      headers:{
        "Content-Type":"application/json"
      },

      body:JSON.stringify({

        url:url

      })

    }
  );


  if(!response.ok){

    throw new Error("Backend Error");

  }


  const result = await response.json();

return {

    url: result.url,

    host: new URL(result.url).hostname,

    score: result.score,

    verdict: result.status.toLowerCase(),

    reasons: result.reasons,

    checks:{

        https: !result.reasons.includes("URL is not using HTTPS"),

        ipAddress: !result.reasons.includes("IP address used instead of domain name"),

        longUrl: !result.reasons.includes("URL is very long"),

        keyword: !result.reasons.includes("Suspicious keyword found"),

        specialChar: !result.reasons.includes("Suspicious special characters found"),

        domainPattern: !result.reasons.includes("Suspicious domain pattern detected")

    }

};

  };
// Switch Screens

function goToResultScreen(){


  checkScreen.classList.add("hidden");

  resultScreen.classList.remove("hidden");


  resultBox.className="result-box";


  resultBox.innerHTML=
  `
  <div class="spinner"></div>
  `;


  viewScoreBtn.disabled=true;

  detailsEl.classList.add("hidden");

  detailsEl.innerHTML="";

}
// Show Score


function renderScore(analysis){


let cls = "safe";

if(analysis.verdict==="dangerous")
    cls="danger";

if(analysis.verdict==="suspicious")
    cls="warning";


const labelMap = {
    safe: "✓ Website looks safe",
    suspicious: "⚠ Suspicious website",
    dangerous: "❌ Dangerous website"
};


resultBox.className =
"result-box "+cls;



resultBox.innerHTML=

`

<div class="score-number ${cls}">
${analysis.score}
<span style="font-size:16px">/100</span>
</div>


<div class="score-label">
    ${labelMap[analysis.verdict]}
</div>


<div class="score-url">

${analysis.host}

</div>

`;



viewScoreBtn.disabled=false;


}
// Error Display

function renderError(message){


resultBox.className="result-box danger";


resultBox.innerHTML=

`

<div class="score-label">

${message}

</div>

`;

}
// Show Details

function renderDetails(analysis){


const rows=[

    ["Uses HTTPS", analysis.checks.https],

    ["Uses Domain Name", analysis.checks.ipAddress],

    ["URL Length Normal", analysis.checks.longUrl],

    ["No Suspicious Keywords", analysis.checks.keyword],

    ["No Suspicious Characters", analysis.checks.specialChar],

    ["Normal Domain Pattern", analysis.checks.domainPattern]

];


detailsEl.innerHTML=

rows.map(([name,value])=>


`

<div class="detail-row">

<span class="label">

${name}

</span>


<span class="value ${value?"pass":"fail"}">

${value?"Pass":"Fail"}

</span>


</div>

`

).join("");



detailsEl.classList.remove("hidden");


}

// Scan Button

if(checkBtn){
checkBtn.addEventListener(
"click",
async()=>{


if(!currentUrl)
return;



goToResultScreen();



try{


const analysis =
await checkUrlWithBackend(currentUrl);



lastAnalysis=analysis;


renderScore(analysis);



saveScan(
currentUrl,
analysis
);



}

catch(error){


console.error(error);


renderError(
"Backend Connection Failed"
);


}


});

}
// View Details Button


// View Details Button

if(viewScoreBtn){

viewScoreBtn.addEventListener(
"click",
()=>{


if(!lastAnalysis)
return;


if(detailsEl.classList.contains("hidden")){


renderDetails(lastAnalysis);


viewScoreBtn.textContent =
"Hide Details";


}

else{


detailsEl.classList.add("hidden");


viewScoreBtn.textContent =
"View Score";


}


});

}

// Save Last Scan


function saveScan(url,result){


const scanData={


url:url,


prediction:
result.verdict,


risk_score:
result.score,


time:
new Date().toLocaleString()


};



chrome.storage.local.set({

lastScan:scanData

});


}


// Load Previous Scan


function loadLastScan(){


chrome.storage.local.get(
["lastScan"],
(data)=>{


if(data.lastScan){


const scan=data.lastScan;



urlTextEl.textContent=
scan.url;



lastAnalysis={

host:new URL(scan.url).hostname,

score:scan.risk_score,

verdict:scan.prediction,

checks:{}

};



renderScore(lastAnalysis);



}


});

}
});