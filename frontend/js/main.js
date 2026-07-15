/* =========================================================
   main.js — SHARED across every page: mobile sidebar
   toggle + nav active-state highlighting. Include this on
   checker.html, history.html, and about.html too.
   ========================================================= */

const sidebar = document.getElementById('sidebar');

document.getElementById('menuToggle')?.addEventListener('click', () => {
  sidebar.classList.toggle('open');
});

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', e => {
    // Remove this guard once each page has its own real <a href="">
    // links instead of placeholder "#" links.
    if (item.getAttribute('href') === '#') e.preventDefault();
    document.querySelector('.nav-item.active')?.classList.remove('active');
    item.classList.add('active');
    sidebar.classList.remove('open');
  });
});