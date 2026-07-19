/* =========================================================
   admin.js — Admin Dashboard
   Connects to:
     GET  /stats       → stat cards + donut chart
     GET  /history     → recent scans table
     POST /check-url   → manual scan button
   ========================================================= */

// ── 1. Load stats into stat cards + donut chart ───────────
async function loadAdminStats() {
  try {
    const stats = await getStats();

    // Stat cards — match data-count attributes
    document.querySelectorAll('[data-count]').forEach(el => {
      const type = el.dataset.count;
      if (type === '4386' || el.closest('.stat-card.total'))
        el.textContent = stats.total.toLocaleString();
      if (type === '3289' || el.closest('.stat-card.safe'))
        el.textContent = stats.safe.toLocaleString();
      if (type === '789'  || el.closest('.stat-card.suspicious'))
        el.textContent = stats.suspicious.toLocaleString();
      if (type === '308'  || el.closest('.stat-card.dangerous'))
        el.textContent = stats.dangerous.toLocaleString();
    });

    // Stat delta percentages
    const deltas = document.querySelectorAll('.stat-delta b');
    if (deltas[1]) deltas[1].textContent = stats.safe_percentage + '%';
    if (deltas[2]) deltas[2].textContent = stats.suspicious_percentage + '%';
    if (deltas[3]) deltas[3].textContent = stats.dangerous_percentage + '%';

    // Donut chart
    const CIRC = 2 * Math.PI * 15.5;
    function setSegment(id, percent, offsetPercent) {
      const el = document.getElementById(id);
      if (!el) return;
      const len = (percent / 100) * CIRC;
      el.style.strokeDasharray = `${len} ${CIRC - len}`;
      el.style.strokeDashoffset = -(offsetPercent / 100) * CIRC;
    }
    const safe        = stats.safe_percentage || 75;
    const suspicious  = stats.suspicious_percentage || 18;
    const dangerous   = stats.dangerous_percentage || 7;
    setSegment('donutSafe',        safe,       0);
    setSegment('donutSuspicious',  suspicious, safe);
    setSegment('donutDangerous',   dangerous,  safe + suspicious);

    // Update donut center total
    const donutCenter = document.querySelector('.donut-center strong');
    if (donutCenter) donutCenter.textContent = stats.total.toLocaleString();

    // Update legend percentages
    const legendItems = document.querySelectorAll('.legend li');
    if (legendItems[0]) legendItems[0].textContent = '';
    const legendTexts = document.querySelectorAll('.legend .sw');
    const legendLabels = [
      `Safe (${safe}%)`,
      `Suspicious (${suspicious}%)`,
      `Dangerous (${dangerous}%)`
    ];
    document.querySelectorAll('.legend li').forEach((li, i) => {
      const sw = li.querySelector('.sw');
      if (sw && legendLabels[i]) {
        li.textContent = '';
        li.appendChild(sw);
        li.append(legendLabels[i]);
      }
    });

  } catch (error) {
    console.error('Could not load stats:', error);
  }
}

// ── 2. Load recent scans table ────────────────────────────
async function loadAdminHistory() {
  const tbody = document.querySelector('.scan-table tbody');
  if (!tbody) return;

  try {
    const data = await getHistory();
    if (!data || data.length === 0) {
      tbody.innerHTML = `
        <tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:24px;">
          No scan history yet.
        </td></tr>`;
      return;
    }

    // Show latest 5 only
    const latest = data.slice(0, 5);
    tbody.innerHTML = '';

    latest.forEach(item => {
      const statusClass = item.status.toLowerCase();
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div class="url-cell">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
              <circle cx="12" cy="12" r="9"/>
              <path d="M3 12h18M12 3a13 13 0 010 18 13 13 0 010-18z"/>
            </svg>
            ${item.url}
          </div>
        </td>
        <td><span class="badge ${statusClass}">${item.status}</span></td>
        <td class="mono">${item.score}/100</td>
        <td class="mono">${item.date}</td>
        <td><a href="#" class="row-link">···</a></td>`;
      tbody.appendChild(tr);
    });

  } catch (error) {
    console.error('Could not load history:', error);
    if (tbody) tbody.innerHTML = `
      <tr><td colspan="5" style="text-align:center;color:var(--danger);padding:24px;">
        Could not load history. Make sure the backend is running.
      </td></tr>`;
  }
}

// ── 3. Manual scan button ─────────────────────────────────
const scanBtn   = document.getElementById('scanBtn');
const scanInput = document.getElementById('lookupInput');

if (scanBtn && scanInput) {
  scanBtn.addEventListener('click', async () => {
    const url = scanInput.value.trim();
    if (!url) {
      alert('Please enter a URL to scan.');
      return;
    }

    scanBtn.textContent = 'Scanning...';
    scanBtn.disabled = true;

    try {
      const result = await scanURL(url);

      // Show result in an alert for now
      // (admin stays on dashboard, doesn't redirect to result.html)
      alert(
        `URL: ${result.url}\n` +
        `Status: ${result.status}\n` +
        `Risk Score: ${result.score}/100\n` +
        `Reasons: ${result.reasons?.join(', ') || 'None'}`
      );

      // Reload table to show the new scan
      loadAdminHistory();
      loadAdminStats();

      scanInput.value = '';

    } catch (error) {
      alert('Could not connect to the server. Make sure the backend is running.');
      console.error(error);
    } finally {
      scanBtn.textContent = 'Scan Now';
      scanBtn.disabled = false;
    }
  });

  // Enter key support
  scanInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') scanBtn.click();
  });
}

// ── 4. Run on page load ───────────────────────────────────
loadAdminStats();
loadAdminHistory();