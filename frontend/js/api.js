/* 
   api.js — shared API functions for all pages
   Base URL: http://10.103.26.203:5000
   */

const API_BASE = 'https://web-guard-qtkt-psi.vercel.app';

// ── 1. Scan a URL ──────────────────────────────────────────
async function scanURL(url) {
  const response = await fetch(`${API_BASE}/check-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: url })
  });
  return await response.json();
}

// ── 2. Get scan history ────────────────────────────────────
async function getHistory() {
  const response = await fetch(`${API_BASE}/history`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  return await response.json();
}

// ── 3. Get statistics ──────────────────────────────────────
async function getStats() {
  const response = await fetch(`${API_BASE}/stats`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  return await response.json();
}

// ── Admin login ─────────────────────────────────────────
async function adminLogin(email, password) {
  const response = await fetch(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email, password: password })
  });
  return await response.json();
}

// ── Admin: generate/download monthly report ────────────────
async function generateReport(month) {
  const response = await fetch(
    `${API_BASE}/admin/monthly-report?month=${encodeURIComponent(month)}`,
    {
      method: 'GET'
    }
  );

  if (!response.ok) {
    throw new Error('Report generation failed');
  }

  return await response.blob();
}