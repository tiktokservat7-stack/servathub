// ---------- Helpers partagés ----------
async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    ...options,
  });
  let data = {};
  try { data = await res.json(); } catch { /* corps vide */ }
  if (!res.ok) {
    const err = new Error(data.error || 'Erreur serveur.');
    err.status = res.status;
    throw err;
  }
  return data;
}

function toast(msg) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2600);
}

function showError(elm, msg) {
  elm.textContent = msg;
  elm.classList.add('show');
}

function clearError(elm) {
  elm.classList.remove('show');
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function copyText(text, msg) {
  navigator.clipboard?.writeText(text).then(() => toast(msg || 'Copié !'), () => toast(msg || 'Copié !'));
}

async function logout() {
  try { await api('/api/auth/logout', { method: 'POST' }); } catch { /* ignore */ }
  location.href = '/';
}
