/* =========================================================
   admin.js — Admin Dashboard page
   Calls GET /stats and GET /history
   ========================================================= */

async function loadAdminStats() {
  try {
    const stats = await getStats();

    const statValues = document.querySelectorAll('[data-count]');
    statValues.forEach(el => {
      const type = el.dataset.count;
      if (type === 'total')       el.textContent = stats.total.toLocaleString();
      if (type === 'safe')        el.textContent = stats.safe.toLocaleString();
      if (type === 'suspicious')  el.textContent = stats.suspicious.toLocaleString();
      if (type === 'dangerous')   el.textContent = stats.dangerous.toLocaleString();
    });

  } catch (error) {
    console.error('Could not load stats:', error);
  }
}

async function loadAdminHistory() {
  const tbody = document.querySelector('.scan-table tbody');
  if (!tbody) return;

  try {
    const data = await getHistory();
    if (!data || data.length === 0) return;

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
  }
}

loadAdminStats();
loadAdminHistory();