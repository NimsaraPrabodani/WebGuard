/* =========================================================
   home.js — interactions for home.html only
   ========================================================= */

// Highlight active nav link on scroll
const sections = document.querySelectorAll('section[id], footer[id]');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) link.classList.add('active');
  });
  // Keep Home active when at top
  if (window.scrollY < 100) {
    navLinks.forEach(l => l.classList.remove('active'));
    document.querySelector('.nav-links a[href="home.html"]')?.classList.add('active');
  }
});

// Scroll-triggered fade-in for feature cards
const cards = document.querySelectorAll('.feature-card');
const observer = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }, i * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

cards.forEach(card => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(24px)';
  card.style.transition = 'opacity 0.45s ease, transform 0.45s ease, box-shadow 0.2s, border-color 0.2s';
  observer.observe(card);
});