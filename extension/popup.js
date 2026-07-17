let currentURL = "";

// Get active tab URL
chrome.tabs.query(
  { active: true, currentWindow: true },
  function (tabs) {

    currentURL = tabs[0].url;

    document.getElementById("url").innerText = currentURL;

    // Auto-load last scan
    loadLastScan();
  }
);


// Button click → send URL to Flask backend
document.getElementById("checkBtn")
.addEventListener("click", async function () {

  try {

    const response = await fetch(
      "http://127.0.0.1:5000/check-url",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          url: currentURL
        })
      }
    );


    const result = await response.json();


    // Show result
    document.getElementById("status").innerText =
      result.status;


    document.getElementById("score").innerText =
      "Risk Score: " + result.score;


    if (result.status === "Safe") {

      document.getElementById("status").style.color =
        "green";

    } else {

      document.getElementById("status").style.color =
        "red";
    }


    // Save backend result
    saveScan(currentURL, result);


  } catch(error) {

    console.error("Backend Error:", error);

    document.getElementById("status").innerText =
      "Backend Connection Failed";

    document.getElementById("status").style.color =
      "red";
  }

});



// ---------------------------
// Save scan result
// ---------------------------
function saveScan(url, result) {


  const scanData = {

    url: url,

    status: result.status,

    score: result.score,

    time: new Date().toLocaleString()

  };


  chrome.storage.local.set({
    lastScan: scanData
  });

}



// ---------------------------
// Load previous scan
// ---------------------------
function loadLastScan() {


  chrome.storage.local.get(
    ["lastScan"],

    function(data) {


      if (data.lastScan) {


        const scan = data.lastScan;


        document.getElementById("status").innerText =
          scan.status;


        document.getElementById("url").innerText =
          scan.url;


        document.getElementById("score").innerText =
          "Risk Score: " + scan.score;



        if (scan.status === "Safe") {

          document.getElementById("status").style.color =
            "green";

        } else {

          document.getElementById("status").style.color =
            "red";

        }

      }

    }
  );

}