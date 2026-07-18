/* =========================================================
   result.js — Scan Result page
   Reads result from localStorage and fills the page
   Backend response format:
   {
     url, score, status, reasons, date
   }
   ========================================================= */

const data = JSON.parse(localStorage.getItem('scanResult'));

if (!data) {
  // No result found — redirect back to checker
  window.location.href = 'checker.html';
}

// ── Fill scanned URL ──────────────────────────────────────
document.getElementById('scannedUrl').textContent = data.url;

// ── Fill risk score ───────────────────────────────────────
const scoreEl = document.querySelector('.risk-score-num');
if (scoreEl) {
  scoreEl.innerHTML = `${data.score}<sub>/100</sub>`;
}

// ── Fill risk bar ─────────────────────────────────────────
const barFill = document.querySelector('.risk-bar-fill');
if (barFill) barFill.style.width = data.score + '%';

// ── Fill detection result + risk level ────────────────────
const detectionLabel = document.querySelector('.detection-label strong');
const detectionDesc  = document.querySelector('.detection-label span');
const riskLevel      = document.querySelector('.risk-level');
const detectionIcon  = document.querySelector('.detection-icon');

// Map status to colors and messages
const statusMap = {
  'Safe': {
    color: 'var(--accent)',
    glow:  'var(--accent-glow)',
    desc:  'This website appears to be safe.',
    level: 'Low Risk'
  },
  'Suspicious': {
    color: 'var(--warn)',
    glow:  'var(--warn-glow)',
    desc:  'This website has some suspicious characteristics.',
    level: 'Medium Risk'
  },
  'Dangerous': {
    color: 'var(--danger)',
    glow:  'var(--danger-glow)',
    desc:  'This website is potentially harmful or suspicious.',
    level: 'High Risk'
  }
};

const statusInfo = statusMap[data.status] || statusMap['Suspicious'];

if (detectionLabel) {
  detectionLabel.textContent = data.status;
  detectionLabel.style.color = statusInfo.color;
}
if (detectionDesc)  detectionDesc.textContent  = statusInfo.desc;
if (riskLevel)      riskLevel.textContent       = statusInfo.level;
if (riskLevel)      riskLevel.style.color       = statusInfo.color;
if (barFill)        barFill.style.background    = statusInfo.color;

// Update detection icon border color
if (detectionIcon) {
  detectionIcon.style.borderColor = statusInfo.color;
  detectionIcon.style.boxShadow   = `0 0 20px -6px ${statusInfo.glow}`;
  detectionIcon.querySelector('svg').style.color = statusInfo.color;
}

// ── Fill detection reasons ────────────────────────────────
const reasonsList = document.querySelector('.reasons-list');
if (reasonsList) {
  reasonsList.innerHTML = '';
  if (data.reasons && data.reasons.length > 0) {
    data.reasons.forEach(reason => {
      const li = document.createElement('li');
      li.textContent = reason;
      reasonsList.appendChild(li);
    });
  } else {
    const li = document.createElement('li');
    li.textContent = 'No suspicious indicators found.';
    reasonsList.appendChild(li);
  }
}

// ── Fill summary panel ────────────────────────────────────
const domainEl    = document.querySelector('.summary-items .summary-item:nth-child(1) strong');
const scannedAtEl = document.querySelector('.summary-items .summary-item:nth-child(3) strong');

// Extract domain from URL
try {
  const urlObj = new URL(data.url);
  if (domainEl) domainEl.textContent = urlObj.hostname;
} catch {
  if (domainEl) domainEl.textContent = data.url;
}

if (scannedAtEl) scannedAtEl.textContent = data.date;