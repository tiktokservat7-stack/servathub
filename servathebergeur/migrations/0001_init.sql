CREATE TABLE users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE sessions (
  token      TEXT PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);

CREATE TABLE deployments (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id      INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name          TEXT UNIQUE NOT NULL,
  type          TEXT NOT NULL DEFAULT 'site',
  runtime       TEXT,
  main_file     TEXT,
  status        TEXT NOT NULL DEFAULT 'stopped',
  custom_domain TEXT UNIQUE,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE files (
  deployment_id INTEGER NOT NULL REFERENCES deployments(id) ON DELETE CASCADE,
  path          TEXT NOT NULL,
  data          BLOB NOT NULL,
  PRIMARY KEY (deployment_id, path)
);
CREATE INDEX idx_files_deploy_path ON files (deployment_id, path);

INSERT INTO deployments (owner_id, name, type, status) VALUES (NULL, 'demo', 'site', 'running');
