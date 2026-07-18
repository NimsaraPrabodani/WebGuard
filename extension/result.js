document.addEventListener('DOMContentLoaded', () => {
  const resultBox = document.getElementById('resultBox');
  const viewScoreBtn = document.getElementById('viewScoreBtn');
  const detailsEl = document.getElementById('details');
  const recheckBtn = document.getElementById('recheckBtn');

  let currentUrl = '';
  let lastAnalysis = null;

  // Get the URL passed in from popup.js via the query string
  const params = new URLSearchParams(window.location.search);
  currentUrl = params.get('url') || '';

  console.log("URL received:", currentUrl);

  if (!currentUrl) {
    renderError("No URL provided.");
    return;
  }

  // Connect Flask Backend
  async function checkUrlWithBackend(url) {

    console.log("Sending to Flask:", url);
    const response = await fetch("http://localhost:5000/check-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url: url })
    });

    if (!response.ok) {
      throw new Error("Backend Error");
    }

    const result = await response.json();

    console.log("Backend result:", result);

    if(result.error){
    throw new Error(result.error);
}

    return {
      url: result.url,
      host: new URL(result.url).hostname,
      score: result.score,
      verdict: result.status.toLowerCase(),
      reasons: result.reasons,
      checks: {
        https: !result.reasons.includes("URL is not using HTTPS"),
        ipAddress: !result.reasons.includes("IP address used instead of domain name"),
        longUrl: !result.reasons.includes("URL is very long"),
        keyword: !result.reasons.includes("Suspicious keyword found"),
        specialChar: !result.reasons.includes("Suspicious special characters found"),
        domainPattern: !result.reasons.includes("Suspicious domain pattern detected")
      }
    };
  }
  
  
  // Reset to loading state
  function showLoading() {
    resultBox.className = "result-box";
    resultBox.innerHTML = `<div class="spinner"></div>`;
    viewScoreBtn.disabled = true;
    viewScoreBtn.textContent = "View Score";
    detailsEl.classList.add("hidden");
    detailsEl.innerHTML = "";
  }

  // Show Score
  function renderScore(analysis) {
    let cls = "safe";
    if (analysis.verdict === "dangerous") cls = "danger";
    if (analysis.verdict === "suspicious") cls = "warning";

    const labelMap = {
      safe: "Website looks safe",
      suspicious: "Suspicious website",
      dangerous: "Dangerous website"
    };

    const iconMap = {
      safe: '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/><path d="M8.5 12L11 14.5L15.5 9.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
      warning: '<path d="M12 3L21.5 20H2.5L12 3Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 9.5V14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="12" cy="17" r="0.9" fill="currentColor"/>',
      danger: '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/><path d="M9 9L15 15M15 9L9 15" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>'
    };

    resultBox.className = "result-box " + cls;

    resultBox.innerHTML = `
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" class="score-icon ${cls}">
        ${iconMap[cls]}
      </svg>
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

    viewScoreBtn.disabled = false;
  }

  // Error Display
  function renderError(message) {
    resultBox.className = "result-box danger";
    resultBox.innerHTML = `<div class="score-label">${message}</div>`;
    viewScoreBtn.disabled = true;
  }

  // Show Details
  function renderDetails(analysis) {
    const rows = [
      ["Uses HTTPS", analysis.checks.https],
      ["Uses Domain Name", analysis.checks.ipAddress],
      ["URL Length Normal", analysis.checks.longUrl],
      ["No Suspicious Keywords", analysis.checks.keyword],
      ["No Suspicious Characters", analysis.checks.specialChar],
      ["Normal Domain Pattern", analysis.checks.domainPattern]
    ];

    detailsEl.innerHTML = rows.map(([name, value]) => `
      <div class="detail-row">
        <span class="label">${name}</span>
        <span class="value-badge ${value ? "pass" : "fail"}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            ${value
              ? '<path d="M4 12L9.5 17.5L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>'
              : '<path d="M6 6L18 18M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>'}
          </svg>
          ${value ? "Pass" : "Fail"}
        </span>
      </div>
    `).join("");

    detailsEl.classList.remove("hidden");
  }

  // Save Last Scan
  function saveScan(url, result) {
    const scanData = {
      url: url,
      prediction: result.verdict,
      risk_score: result.score,
      checks: result.checks,
      time: new Date().toLocaleString()
    };

    chrome.storage.local.set({ lastScan: scanData });
  }

  // Run the check against the backend and render the outcome
  async function runCheck(url) {
    showLoading();
    try {
      const analysis = await checkUrlWithBackend(url);
      lastAnalysis = analysis;
      renderScore(lastAnalysis);
      saveScan(url, analysis);
    } catch (error) {
      console.error(error);
      renderError("Backend Connection Failed");
    }
  }

  // View Details Button
  if (viewScoreBtn) {
    viewScoreBtn.addEventListener('click', () => {
      if (!lastAnalysis) return;

      if (detailsEl.classList.contains("hidden")) {
        renderDetails(lastAnalysis);
        viewScoreBtn.textContent = "Hide Details";
      } else {
        detailsEl.classList.add("hidden");
        viewScoreBtn.textContent = "View Score";
      }
    });
  }

  // Re-run the check on the same URL
  if (recheckBtn) {
    recheckBtn.addEventListener('click', () => {
      runCheck(currentUrl);
    });
  }

  // Kick off the check automatically as soon as this popup opens
  runCheck(currentUrl);
});