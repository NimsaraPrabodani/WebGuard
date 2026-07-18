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