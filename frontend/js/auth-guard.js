// auth-guard.js
// Include this at the top of admin/dashboard.html (right after <body>, before other scripts)
// Backend has no token — login.js stores the returned admin object in localStorage,
// so this checks for that instead of a token.

(function () {
  const admin = localStorage.getItem('admin');
  if (!admin) {
    window.location.href = 'login.html';
  }
})();