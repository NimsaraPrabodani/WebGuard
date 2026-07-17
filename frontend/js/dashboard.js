/* =========================================================
   dashboard.js — page-specific JS ONLY used on dashboard.html
   (stat counters, donut chart drawing, manual scan button).
   Load main.js first, then this file.
   ========================================================= */

// Count-up animation for stat values
document.querySelectorAll('[data-count]').forEach(el => {
  const target = parseInt(el.dataset.count, 10);
  const duration = 900;
  const start = performance.now();
  function tick(now){
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(target * eased).toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
});

// Donut chart segments (circumference for r=15.5 is ~97.4)
const CIRC = 2 * Math.PI * 15.5;
function setSegment(id, percent, offsetPercent){
  const el = document.getElementById(id);
  const len = (percent / 100) * CIRC;
  el.style.strokeDasharray = `${len} ${CIRC - len}`;
  el.style.strokeDashoffset = -(offsetPercent / 100) * CIRC;
}
setSegment('donutSafe', 75, 0);
setSegment('donutSuspicious', 18, 75);
setSegment('donutDangerous', 7, 93);

// Manual scan demo (frontend only — wire to backend /api/scan endpoint)
document.getElementById('scanBtn')?.addEventListener('click', () => {
  const val = document.getElementById('lookupInput').value.trim();
  if (!val) return;
  alert('Connect this button to your backend endpoint, e.g. POST /api/scan with { url: "' + val + '" }');
});