import { unzipSync } from 'fflate';

/* ---------------------------------------------------------------- */
/*  Constantes & helpers de base                                     */
/* ---------------------------------------------------------------- */

const SESSION_COOKIE = 'sv_session';
const SESSION_DAYS = 36500; // ~100 ans : sessions quasi illimitées, jamais expirées en pratique
const MAX_SESSIONS_PER_DAY = 100; // limite de nouvelles sessions par jour et par compte
const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/;
const DOMAIN_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/;
const PAGES = ['dashboard', 'panel', 'login', 'signup'];

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.eot': 'application/vnd.ms-fontobject',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.pdf': 'application/pdf',
  '.zip': 'application/zip',
  '.wasm': 'application/wasm',
  '.webmanifest': 'application/manifest+json',
};

function contentType(name) {
  const i = name.lastIndexOf('.');
  const ext = i > -1 ? name.slice(i).toLowerCase() : '';
  return CONTENT_TYPES[ext] || 'application/octet-stream';
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function errJson(msg, status = 400) {
  return json({ error: msg }, status);
}

function withCookie(resp, token) {
  const headers = new Headers(resp.headers);
  const cookie = token
    ? `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}`
    : `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
  headers.set('Set-Cookie', cookie);
  return new Response(resp.body, { status: resp.status, headers });
}

const toHex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const randHex = (n) => toHex(crypto.getRandomValues(new Uint8Array(n)));

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > -1) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

async function getUser(env, token) {
  if (!token) return null;
  const row = await env.DB.prepare(
    `SELECT u.id, u.email, u.created_at
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token = ? AND s.expires_at > datetime('now')`
  )
    .bind(token)
    .first();
  return row || null;
}

/* ---------------- Mots de passe (PBKDF2, Web Crypto) ---------------- */
const enc = new TextEncoder();
const hexToBuf = (hex) => {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
};

async function hashPassword(password, salt) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: hexToBuf(salt), iterations: 100000, hash: 'SHA-256' },
    key,
    512
  );
  return toHex(bits);
}

async function createPasswordHash(password) {
  const salt = randHex(16);
  return salt + ':' + (await hashPassword(password, salt));
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, hash] = stored.split(':');
  const test = await hashPassword(password, salt);
  return timingSafeEqual(hash, test);
}

async function sessionQuotaExceeded(env, userId) {
  const today = new Date().toISOString().slice(0, 10); // UTC, au format YYYY-MM-DD
  const row = await env.DB.prepare(
    'SELECT COUNT(*) AS n FROM sessions WHERE user_id = ? AND substr(created_at, 1, 10) = ?'
  )
    .bind(Number(userId), today)
    .first();
  return row && Number(row.n) >= MAX_SESSIONS_PER_DAY;
}

async function createSession(env, userId) {
  const token = randHex(32);
  const expires = new Date(Date.now() + SESSION_DAYS * 86400e3).toISOString();
  await env.DB.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)')
    .bind(token, Number(userId), expires)
    .run();
  return token;
}

/* ---------------- Chemins & slug ---------------- */
function cleanRel(rel) {
  return String(rel || '')
    .replace(/\\/g, '/')
    .replace(/^\.\//, '')
    .split('/')
    .filter((p) => p && p !== '.')
    .join('/');
}

function safeRelPath(rel) {
  if (typeof rel !== 'string' || !rel) return false;
  const r = rel.replace(/\\/g, '/');
  if (r.includes('\0') || r.startsWith('/') || /^[a-zA-Z]:/.test(r)) return false;
  const parts = r.split('/');
  if (parts.some((p) => p === '..' || p === '')) return false;
  return true;
}

function slugOk(name) {
  return typeof name === 'string' && name.length >= 3 && name.length <= 30 && SLUG_RE.test(name);
}

function stripCommonRoot(rels) {
  const valid = rels.filter(Boolean);
  if (valid.length >= 1 && valid.every((r) => r.includes('/'))) {
    const tops = new Set(valid.map((r) => r.split('/')[0]));
    if (tops.size === 1) {
      const top = [...tops][0];
      return rels.map((r) => (r ? r.slice(top.length + 1) : null));
    }
  }
  return rels;
}

function decodePath(p) {
  try {
    return decodeURIComponent(p);
  } catch {
    return '/';
  }
}

async function runBatches(db, batch) {
  for (let i = 0; i < batch.length; i += 100) await db.batch(batch.slice(i, i + 100));
}

const withStatus = (d) => ({ ...d, status: d.type === 'bot' ? 'stopped' : 'running' });

const notFoundHtml = (host) =>
  `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>404</title><style>body{margin:0;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;background:#05060a;color:#f4f6fb;font-family:"Segoe UI",system-ui,sans-serif;text-align:center;padding:24px}
h1{margin:0;font-size:64px;background:linear-gradient(135deg,#60a5fa,#1d4ed8);-webkit-background-clip:text;background-clip:text;color:transparent}
p{color:#9aa3b5;margin:0}a{color:#60a5fa}</style></head><body><h1>404</h1><p>Page introuvable.</p></body></html>`;

/* ---------------------------------------------------------------- */
/*  Moteur d'hébergement (sites stockés dans D1)                     */
/* ---------------------------------------------------------------- */

async function serveSiteFiles(env, dep, rel) {
  rel = cleanRel(rel);
  const candidates = [];
  if (!rel || rel === '') candidates.push('index.html');
  else if (rel.endsWith('/')) candidates.push(rel + 'index.html');
  else {
    candidates.push(rel);
    candidates.push(rel + '/index.html');
  }
  for (const c of candidates) {
    if (!safeRelPath(c)) continue;
    const row = await env.DB.prepare('SELECT data FROM files WHERE deployment_id = ? AND path = ?')
      .bind(dep.id, c)
      .first();
    if (row) {
      return new Response(row.data, {
        headers: { 'Content-Type': contentType(c), 'Cache-Control': 'public, max-age=300' },
      });
    }
  }
  return null;
}

async function serveSite(env, name, rel, url) {
  const dep = await env.DB.prepare("SELECT * FROM deployments WHERE name = ? AND type = 'site'")
    .bind(name)
    .first();
  if (!dep) return null;
  if (!rel && !url.pathname.endsWith('/')) {
    return Response.redirect(new URL(url.pathname + '/', url).toString(), 301);
  }
  return (await serveSiteFiles(env, dep, rel)) || null;
}

async function serveCustomDomain(env, host, pathname) {
  const dep = await env.DB.prepare("SELECT * FROM deployments WHERE custom_domain = ? AND type = 'site'")
    .bind(host)
    .first();
  if (!dep) return null;
  return (await serveSiteFiles(env, dep, pathname.slice(1))) || null;
}

/* ---------------------------------------------------------------- */
/*  API                                                              */
/* ---------------------------------------------------------------- */

async function loadDep(env, user, id) {
  if (!Number.isInteger(id) || id <= 0) return null;
  return (
    (await env.DB.prepare('SELECT * FROM deployments WHERE id = ? AND owner_id = ?')
      .bind(id, user.id)
      .first()) || null
  );
}

async function handleApi(request, env, url) {
  const method = request.method;
  const path = url.pathname;
  const segments = path.split('/').filter(Boolean);

  const cookies = parseCookies(request.headers.get('cookie'));
  const user = await getUser(env, cookies[SESSION_COOKIE]);

  /* ---------- Auth ---------- */
  if (path === '/api/auth/signup' && method === 'POST') {
    const body = await readJson(request);
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return errJson('Adresse e-mail invalide.');
    if (password.length < 6) return errJson('Le mot de passe doit faire au moins 6 caractères.');
    try {
      const result = await env.DB.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)')
        .bind(email, await createPasswordHash(password))
        .run();
      const id = Number(result.meta.last_row_id);
      if (await sessionQuotaExceeded(env, id)) {
        return errJson(`Limite de ${MAX_SESSIONS_PER_DAY} sessions par jour atteinte. Réessayez demain.`);
      }
      const token = await createSession(env, id);
      return withCookie(json({ ok: true, user: { id, email } }, 201), token);
    } catch (e) {
      if (String(e.message).includes('UNIQUE')) return errJson('Un compte existe déjà avec cet e-mail.');
      throw e;
    }
  }

  if (path === '/api/auth/login' && method === 'POST') {
    const body = await readJson(request);
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const row = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
    if (!row || !(await verifyPassword(password, row.password_hash))) {
      return errJson('E-mail ou mot de passe incorrect.');
    }
    if (await sessionQuotaExceeded(env, row.id)) {
      return errJson(`Limite de ${MAX_SESSIONS_PER_DAY} sessions par jour atteinte. Réessayez demain.`);
    }
    const token = await createSession(env, row.id);
    return withCookie(json({ ok: true, user: { id: row.id, email: row.email } }), token);
  }

  if (path === '/api/auth/logout' && method === 'POST') {
    if (cookies[SESSION_COOKIE]) {
      await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(cookies[SESSION_COOKIE]).run();
    }
    return withCookie(json({ ok: true }), null);
  }

  if (path === '/api/me' && method === 'GET') {
    return json({ user: user ? { id: user.id, email: user.email } : null });
  }

  /* ---------- Le reste exige un compte ---------- */
  if (!user) return errJson('Non connecté.', 401);

  if (segments.length >= 2 && segments[0] === 'api' && segments[1] === 'deployments') {
    /* ---- liste / création ---- */
    if (segments.length === 2 && method === 'GET') {
      const list = await env.DB.prepare('SELECT * FROM deployments WHERE owner_id = ? ORDER BY updated_at DESC')
        .bind(user.id)
        .all();
      return json({ deployments: list.results.map(withStatus) });
    }

    if (segments.length === 2 && method === 'POST') {
      const body = await readJson(request);
      const name = String(body.name || '').toLowerCase().trim();
      if (!slugOk(name)) return errJson('Nom invalide : 3 à 30 caractères (lettres minuscules, chiffres, tirets).');
      if (body.type === 'bot') return errJson('Les bots Discord ne sont pas disponibles sur cette version (Cloudflare Workers).', 400);
      try {
        const result = await env.DB.prepare('INSERT INTO deployments (owner_id, name, type) VALUES (?, ?, ?)')
          .bind(user.id, name, 'site')
          .run();
        const dep = await env.DB.prepare('SELECT * FROM deployments WHERE id = ?').bind(Number(result.meta.last_row_id)).first();
        return json({ deployment: withStatus(dep) }, 201);
      } catch (e) {
        if (String(e.message).includes('UNIQUE')) return errJson('Ce nom est déjà pris.');
        throw e;
      }
    }

    const id = Number(segments[2]);
    const dep = await loadDep(env, user, id);
    if (!dep) return errJson('Déploiement introuvable.', 404);

    /* ---- déploiement seul ---- */
    if (segments.length === 3) {
      if (method === 'GET') return json({ deployment: withStatus(dep) });
      if (method === 'PATCH') return json({ deployment: withStatus(dep) }); // bots désactivés : rien à modifier
      if (method === 'DELETE') {
        await env.DB.prepare('DELETE FROM files WHERE deployment_id = ?').bind(dep.id).run();
        await env.DB.prepare('DELETE FROM deployments WHERE id = ?').bind(dep.id).run();
        return json({ ok: true });
      }
    }

    const sub = segments[3];

    /* ---- upload zip ---- */
    if (sub === 'upload' && method === 'POST') {
      const form = await request.formData();
      const file = form.get('zip');
      if (!file) return errJson('Aucun fichier .zip reçu.');
      let entries;
      try {
        entries = unzipSync(new Uint8Array(await file.arrayBuffer()));
      } catch {
        return errJson('Zip invalide ou illisible.');
      }
      const names = Object.keys(entries).filter((k) => !k.endsWith('/'));
      const rels = stripCommonRoot(names.map((n) => cleanRel(n)));
      await env.DB.prepare('DELETE FROM files WHERE deployment_id = ?').bind(dep.id).run();
      const stmt = env.DB.prepare('INSERT INTO files (deployment_id, path, data) VALUES (?, ?, ?)');
      const batch = [];
      for (let i = 0; i < names.length; i++) {
        const rel = rels[i];
        if (!rel || !safeRelPath(rel)) continue;
        batch.push(stmt.bind(dep.id, rel, entries[names[i]]));
      }
      await runBatches(env.DB, batch);
      await env.DB.prepare("UPDATE deployments SET updated_at = datetime('now') WHERE id = ?").bind(dep.id).run();
      const hasIndex = !!(await env.DB.prepare('SELECT 1 FROM files WHERE deployment_id = ? AND path = ?')
        .bind(dep.id, 'index.html')
        .first());
      return json({
        ok: true,
        hasIndex,
        message: hasIndex
          ? 'Fichiers déployés avec succès !'
          : "Déployé, mais aucun index.html à la racine — la page d'accueil ne sera pas servie.",
      });
    }

    /* ---- upload dossier ---- */
    if (sub === 'upload-folder' && method === 'POST') {
      const form = await request.formData();
      const files = form.getAll('files');
      const paths = form.getAll('paths');
      if (!files.length) return errJson('Aucun fichier reçu.');
      const rels = stripCommonRoot(files.map((_, i) => cleanRel(String(paths[i] ?? files[i].name))));
      const stmt = env.DB.prepare('INSERT INTO files (deployment_id, path, data) VALUES (?, ?, ?)');
      const batch = [];
      let count = 0;
      for (let i = 0; i < files.length; i++) {
        const rel = rels[i];
        if (!rel || !safeRelPath(rel)) continue;
        batch.push(stmt.bind(dep.id, rel, new Uint8Array(await files[i].arrayBuffer())));
        count++;
      }
      await runBatches(env.DB, batch);
      await env.DB.prepare("UPDATE deployments SET updated_at = datetime('now') WHERE id = ?").bind(dep.id).run();
      return json({ ok: true, message: count + ' fichier(s) importé(s).' });
    }

    /* ---- liste des fichiers ---- */
    if (sub === 'files' && method === 'GET') {
      const relDir = cleanRel(String(url.searchParams.get('dir') || ''));
      if (relDir && !safeRelPath(relDir)) return errJson('Dossier invalide.');
      const prefix = relDir ? relDir + '/' : '';
      const rows = await env.DB.prepare(
        'SELECT path, length(data) AS size FROM files WHERE deployment_id = ? AND substr(path, 1, ?) = ? ORDER BY path'
      )
        .bind(dep.id, prefix.length, prefix)
        .all();
      const map = new Map();
      for (const r of rows.results) {
        const rel = r.path.slice(prefix.length);
        if (!rel) continue;
        const seg = rel.split('/')[0];
        if (rel.includes('/')) {
          if (!map.has(seg)) map.set(seg, { name: seg, isDir: true, size: null });
        } else {
          map.set(seg, { name: seg, isDir: false, size: r.size });
        }
      }
      const entries = [...map.values()].sort((a, b) =>
        a.isDir === b.isDir ? a.name.localeCompare(b.name) : a.isDir ? -1 : 1
      );
      return json({ listing: { currentDir: relDir, entries } });
    }

    /* ---- télécharger / supprimer un fichier ---- */
    if (sub === 'file' && method === 'GET') {
      const rel = cleanRel(String(url.searchParams.get('path') || ''));
      if (!rel || !safeRelPath(rel)) return errJson('Fichier introuvable.', 404);
      const row = await env.DB.prepare('SELECT data FROM files WHERE deployment_id = ? AND path = ?')
        .bind(dep.id, rel)
        .first();
      if (!row) return errJson('Fichier introuvable.', 404);
      const name = rel.split('/').pop();
      return new Response(row.data, {
        headers: {
          'Content-Type': contentType(rel),
          'Content-Disposition': `attachment; filename="${name}"`,
        },
      });
    }

    if (sub === 'file' && method === 'DELETE') {
      const rel = cleanRel(String(url.searchParams.get('path') || ''));
      if (!rel || !safeRelPath(rel)) return errJson('Chemin invalide.');
      await env.DB.prepare('DELETE FROM files WHERE deployment_id = ? AND (path = ? OR substr(path, 1, ?) = ?)')
        .bind(dep.id, rel, rel.length + 1, rel + '/')
        .run();
      await env.DB.prepare("UPDATE deployments SET updated_at = datetime('now') WHERE id = ?").bind(dep.id).run();
      return json({ ok: true });
    }

    /* ---- domaine personnalisé ---- */
    if (sub === 'domain' && method === 'POST') {
      const body = await readJson(request);
      const domain = String(body.domain || '').toLowerCase().trim();
      if (!DOMAIN_RE.test(domain) || domain.length > 253) {
        return errJson('Domaine invalide. Exemple : mon-site.fr ou www.exemple.com');
      }
      try {
        await env.DB.prepare('UPDATE deployments SET custom_domain = ?, updated_at = datetime(\'now\') WHERE id = ?')
          .bind(domain, dep.id)
          .run();
        const updated = await env.DB.prepare('SELECT * FROM deployments WHERE id = ?').bind(dep.id).first();
        return json({ ok: true, deployment: withStatus(updated) });
      } catch (e) {
        if (String(e.message).includes('UNIQUE')) return errJson('Ce domaine est déjà utilisé par un autre site.');
        throw e;
      }
    }

    if (sub === 'domain' && method === 'DELETE') {
      await env.DB.prepare("UPDATE deployments SET custom_domain = NULL, updated_at = datetime('now') WHERE id = ?")
        .bind(dep.id)
        .run();
      return json({ ok: true });
    }

    /* ---- processus (bots) : non supportés sur Workers ---- */
    if (['start', 'stop', 'restart', 'stdin', 'clear-logs', 'logs'].includes(sub)) {
      return errJson('Les bots Discord ne sont pas disponibles sur cette version (Cloudflare Workers).', 400);
    }
  }

  return errJson('Route inconnue.', 404);
}

/* ---------------------------------------------------------------- */
/*  Entrée principale                                                */
/* ---------------------------------------------------------------- */

export default {
  async fetch(request, env) {
    try {
      return await route(request, env);
    } catch (err) {
      console.error('[servathebergeur]', err);
      return json({ error: 'Erreur serveur.' }, 500);
    }
  },
};

async function route(request, env) {
    const url = new URL(request.url);
    const host = String(request.headers.get('host') || '').toLowerCase().replace(/:\d+$/, '');
    const pathname = decodePath(url.pathname);

    if (pathname === '/api' || pathname.startsWith('/api/')) {
      return handleApi(request, env, url);
    }

    // Domaine personnalisé : tout l'hôte appartient au site
    if (!host.endsWith('.workers.dev')) {
      const site = await serveCustomDomain(env, host, pathname);
      if (site) return site;
      return new Response(notFoundHtml(host), { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    // Pages de l'app
    const page = pathname.slice(1);
    if (PAGES.includes(page)) {
      return env.ASSETS.fetch(new Request('https://assets.local/' + page + '.html'));
    }

    // Sites servis sur <nom>.servathebergeur.<sub>.workers.dev/…
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length) {
      const site = await serveSite(env, segments[0], segments.slice(1).join('/'), url);
      if (site) return site;
    }

    // Racine & autres : laisse les assets répondre (index.html…)
    return env.ASSETS.fetch(request);
}
