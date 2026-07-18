/* =========================================================
   login.js — Admin Login page
   Calls POST /admin/login via adminLogin() in api.js
   ========================================================= */

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!email || !password) {
    alert('Please enter both email and password.');
    return;
  }

  const btn = document.getElementById('loginBtn');
  btn.textContent = 'Logging in...';
  btn.disabled = true;

  try {
    const response = await adminLogin(email, password);

    if (response.message === 'Login Success') {
      // Backend has no token — store the admin object as the session marker
      localStorage.setItem('admin', JSON.stringify(response.admin));
      window.location.href = 'dashboard.html';
    } else {
      // "Admin not found" (404) / "Wrong Password" (401) / validation (400)
      alert(response.message || 'Login failed. Please check your credentials.');
    }

  } catch (error) {
    alert('Could not connect to the server. Make sure the backend is running.');
    console.error(error);
  } finally {
    btn.textContent = 'Login';
    btn.disabled = false;
  }
});