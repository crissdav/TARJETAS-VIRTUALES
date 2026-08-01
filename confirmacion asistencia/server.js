const http = require('http');
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DB_PATH = path.join(ROOT, 'confirmaciones.db');

const db = new DatabaseSync(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS confirmaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invitado TEXT NOT NULL,
    acompanante TEXT DEFAULT '',
    fecha TEXT NOT NULL DEFAULT (datetime('now','localtime')),
    confirmado INTEGER NOT NULL DEFAULT 0,
    confirmado_en TEXT
  )
`);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

function send(res, status, body, type) {
  res.writeHead(status, {
    'Content-Type': type || 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(body);
}

function sendJson(res, status, data) {
  send(res, status, JSON.stringify(data), 'application/json; charset=utf-8');
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => {
      data += c;
      if (data.length > 1e6) {
        reject(new Error('cuerpo demasiado grande'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try { resolve(JSON.parse(data)); }
      catch (e) { reject(new Error('JSON inválido')); }
    });
    req.on('error', (e) => reject(e));
  });
}

function serveStatic(res, urlPath) {
  let filePath = path.normalize(path.join(ROOT, urlPath));
  if (urlPath === '/') filePath = path.join(ROOT, 'index.html');
  if (!filePath.startsWith(ROOT)) {
    send(res, 403, 'Prohibido', 'text/plain; charset=utf-8');
    return;
  }
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    send(res, 404, 'No encontrado', 'text/plain; charset=utf-8');
    return;
  }
  const ext = path.extname(filePath).toLowerCase();
  send(res, 200, fs.readFileSync(filePath), MIME[ext] || 'application/octet-stream');
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const p = url.pathname;

  if (req.method === 'OPTIONS') {
    send(res, 204, '');
    return;
  }

  try {
    /* ---------- API: listar ---------- */
    if (p === '/api/confirmaciones' && req.method === 'GET') {
      const rows = db.prepare('SELECT * FROM confirmaciones ORDER BY id DESC').all();
      sendJson(res, 200, rows);
      return;
    }

    /* ---------- API: crear (viene de la invitación) ---------- */
    if (p === '/api/confirmaciones' && req.method === 'POST') {
      const body = await readBody(req);
      const invitado = String(body.invitado || '').trim();
      const acompanante = String(body.acompanante || '').trim();
      if (!invitado) {
        sendJson(res, 400, { error: 'El campo invitado es obligatorio' });
        return;
      }
      const info = db.prepare('INSERT INTO confirmaciones (invitado, acompanante) VALUES (?, ?)')
        .run(invitado, acompanante);
      const row = db.prepare('SELECT * FROM confirmaciones WHERE id = ?').get(Number(info.lastInsertRowid));
      sendJson(res, 201, row);
      return;
    }

    /* ---------- API: marcar llegada ---------- */
    let m = p.match(/^\/api\/confirmaciones\/(\d+)\/confirmar$/);
    if (m && req.method === 'POST') {
      db.prepare("UPDATE confirmaciones SET confirmado = 1, confirmado_en = datetime('now','localtime') WHERE id = ?")
        .run(Number(m[1]));
      const row = db.prepare('SELECT * FROM confirmaciones WHERE id = ?').get(Number(m[1]));
      sendJson(res, 200, row || { error: 'no encontrado' });
      return;
    }

    /* ---------- API: deshacer llegada ---------- */
    m = p.match(/^\/api\/confirmaciones\/(\d+)\/desconfirmar$/);
    if (m && req.method === 'POST') {
      db.prepare('UPDATE confirmaciones SET confirmado = 0, confirmado_en = NULL WHERE id = ?')
        .run(Number(m[1]));
      const row = db.prepare('SELECT * FROM confirmaciones WHERE id = ?').get(Number(m[1]));
      sendJson(res, 200, row || { error: 'no encontrado' });
      return;
    }

    /* ---------- API: eliminar ---------- */
    m = p.match(/^\/api\/confirmaciones\/(\d+)$/);
    if (m && req.method === 'DELETE') {
      db.prepare('DELETE FROM confirmaciones WHERE id = ?').run(Number(m[1]));
      sendJson(res, 200, { ok: true });
      return;
    }

    /* ---------- 404 API ---------- */
    if (p.startsWith('/api/')) {
      sendJson(res, 404, { error: 'ruta no encontrada' });
      return;
    }

    /* ---------- Estáticos de la landing ---------- */
    serveStatic(res, p);
  } catch (err) {
    sendJson(res, 500, { error: String(err.message || err) });
  }
});

server.listen(PORT, () => {
  console.log('');
  console.log('  SISTEMA DE CONFIRMACION DE ASISTENCIA');
  console.log('  --------------------------------------');
  console.log('  Landing (recepcionista): http://localhost:' + PORT + '/');
  console.log('  API confirmaciones:      http://localhost:' + PORT + '/api/confirmaciones');
  console.log('');
});
