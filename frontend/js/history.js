/* =========================================================
   history.js — Scan History page
   Calls GET /history and fills the table with real data
   ========================================================= */

async function loadHistory() {
  const tbody = document.getElementById('historyBody');

  try {
    const data = await getHistory();

    if (!data || data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center;color:var(--text-muted);padding:30px;">
            No scan history yet. Scan a URL to get started.
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = '';

    // Show only 5 most recent
    const recent = data.slice(0, 5);

    recent.forEach(item => {
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
        <td>
          <div class="action-cell">
            <button class="view-btn" data-result='${JSON.stringify(item)}'>View</button>
            <span class="row-more">……</span>
          </div>
        </td>`;
      tbody.appendChild(tr);
    });

    // View button → store result and go to result page
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const result = btn.getAttribute('data-result');
        localStorage.setItem('scanResult', result);
        window.location.href = 'result.html';
      });
    });

  } catch (error) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center;color:var(--danger);padding:30px;">
          Could not load history. Make sure the backend is running.
        </td>
      </tr>`;
    console.error(error);
  }
}

// ── Load stats into the stat cards ───────────────────────
async function loadStats() {
  try {
    const stats = await getStats();

    // Stat cards at top
    const statValues = document.querySelectorAll('.stat-value');
    if (statValues[0]) statValues[0].textContent = stats.total;
    if (statValues[1]) statValues[1].textContent = stats.safe;
    if (statValues[2]) statValues[2].textContent = stats.suspicious;
    if (statValues[3]) statValues[3].textContent = stats.dangerous;

    // Right sidebar statistics panel
    const totalRow = document.querySelector('.total-row span');
    if (totalRow) totalRow.textContent = stats.total;

    const statNums = document.querySelectorAll('.stat-num');
    if (statNums[0]) statNums[0].textContent = stats.safe;
    if (statNums[1]) statNums[1].textContent = stats.suspicious;
    if (statNums[2]) statNums[2].textContent = stats.dangerous;

    // Update delta percentages
    const deltas = document.querySelectorAll('.stat-delta b');
    if (deltas[1]) deltas[1].textContent = stats.safe_percentage + '%';
    if (deltas[2]) deltas[2].textContent = stats.suspicious_percentage + '%';
    if (deltas[3]) deltas[3].textContent = stats.dangerous_percentage + '%';

  } catch (error) {
    console.error('Could not load stats:', error);
  }
}

// ── Filter buttons ────────────────────────────────────────
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('#historyBody tr').forEach(row => {
      const badge = row.querySelector('.badge');
      row.style.display = (filter === 'all' || badge?.classList.contains(filter)) ? '' : 'none';
    });
  });
});

// ── Search ────────────────────────────────────────────────
document.getElementById('searchInput')?.addEventListener('input', function () {
  const q = this.value.toLowerCase();
  document.querySelectorAll('#historyBody tr').forEach(row => {
    const url = row.querySelector('.url-cell')?.textContent.toLowerCase();
    row.style.display = url?.includes(q) ? '' : 'none';
  });
});

// ── Pagination buttons ────────────────────────────────────
document.querySelectorAll('.page-btn:not(.arrow)').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.page-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// ── Run on page load ──────────────────────────────────────
loadStats();
loadHistory();