INSERT OR REPLACE INTO files (deployment_id, path, data) VALUES ((SELECT id FROM deployments WHERE name='demo'), 'index.html', '<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>demo â€” Ã§a marche !</title>
<style>
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#05060a;color:#f4f6fb;font-family:"Segoe UI",system-ui,sans-serif}
  .card{max-width:520px;text-align:center;padding:48px 32px;border:1px solid #1e2434;border-radius:18px;background:#0b0d14;box-shadow:0 0 60px rgba(59,130,246,.18)}
  .badge{display:inline-block;font-size:12px;font-weight:700;color:#60a5fa;background:rgba(59,130,246,.12);border:1px solid rgba(59,130,246,.3);padding:6px 14px;border-radius:99px;letter-spacing:.4px}
  h1{font-size:28px;margin:18px 0 10px}
  p{color:#9aa3b5;line-height:1.6;margin:0 0 8px}
  code{background:#10131c;border:1px solid #1e2434;padding:2px 8px;border-radius:6px;color:#60a5fa;font-size:14px}
  a{display:inline-block;margin-top:18px;color:#fff;background:linear-gradient(135deg,#3b82f6,#1d4ed8);text-decoration:none;padding:11px 22px;border-radius:10px;font-weight:600}
  a:hover{filter:brightness(1.1)}
</style>
</head>
<body>
<div class="card">
  <span class="badge">âœ“ HÃ‰BERGÃ‰ SUR SERVATHUB</span>
  <h1>Ce site est en ligne ! ðŸŽ‰</h1>
  <p>Ceci est le site de dÃ©monstration de <code>servathub</code>.<br>
  Chaque site est servi publiquement sur son adresse.</p>
  <a href="/signup">CrÃ©er le tien gratuitement</a>
</div>
</body>
</html>');

