/* =========================================================
   checker.js — URL Scanner page
   Calls POST /check-url and redirects to result.html
   ========================================================= */

document.getElementById('scanBtn').addEventListener('click', async () => {
  const url = document.getElementById('urlInput').value.trim();

  if (!url) {
    alert('Please enter a URL to scan.');
    return;
  }

  // Show loading state
  const btn = document.getElementById('scanBtn');
  btn.textContent = 'Scanning...';
  btn.disabled = true;

  try {
    const data = await scanURL(url);

    // Store result in localStorage so result.html can read it
    localStorage.setItem('scanResult', JSON.stringify(data));

    // Go to result page
    window.location.href = 'result.html';

  } catch (error) {
    alert('Could not connect to the server. Make sure the backend is running.');
    console.error(error);
  } finally {
    btn.textContent = 'Scan Now →';
    btn.disabled = false;
  }
});

// Allow pressing Enter to scan
document.getElementById('urlInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') document.getElementById('scanBtn').click();
});

// ── Info cards carousel ──────────────────────────────────
const carousel = document.getElementById('infoCarousel');
const dots = document.querySelectorAll('#infoDots .dot');
const prevBtn = document.getElementById('infoPrev');
const nextBtn = document.getElementById('infoNext');

function scrollToCard(index) {
  const card = carousel.children[index];
  if (card) carousel.scrollTo({ left: card.offsetLeft, behavior: 'smooth' });
}

function getActiveIndex() {
  const cardWidth = carousel.children[0]?.offsetWidth + 12 || 1;
  return Math.round(carousel.scrollLeft / cardWidth);
}

function updateDots() {
  const active = getActiveIndex();
  dots.forEach((d, i) => d.classList.toggle('active', i === active));
}

prevBtn?.addEventListener('click', () => scrollToCard(Math.max(getActiveIndex() - 1, 0)));
nextBtn?.addEventListener('click', () => scrollToCard(Math.min(getActiveIndex() + 1, carousel.children.length - 1)));

dots.forEach((dot, i) => dot.addEventListener('click', () => scrollToCard(i)));

carousel?.addEventListener('scroll', () => {
  clearTimeout(carousel._scrollTimer);
  carousel._scrollTimer = setTimeout(updateDots, 100);
});