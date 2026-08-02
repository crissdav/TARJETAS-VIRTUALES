const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');
const { DatabaseSync } = require('node:sqlite');
const qrcode = require('./qrcode-generator.js');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DB_PATH = path.join(ROOT, 'confirmaciones.db');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'xv2026vianca';
const SESSION_IDLE_MS = 3 * 60 * 60 * 1000;
const sessions = new Map();

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

const cols = db.prepare('PRAGMA table_info(confirmaciones)').all().map(c => c.name);
if (!cols.includes('invitado_confirmado')) {
  db.exec('ALTER TABLE confirmaciones ADD COLUMN invitado_confirmado INTEGER NOT NULL DEFAULT 0');
}
if (!cols.includes('acompanante_confirmado')) {
  db.exec('ALTER TABLE confirmaciones ADD COLUMN acompanante_confirmado INTEGER NOT NULL DEFAULT 0');
}
db.exec(`
  UPDATE confirmaciones
  SET invitado_confirmado = confirmado, acompanante_confirmado = confirmado
  WHERE invitado_confirmado = 0 AND acompanante_confirmado = 0 AND confirmado = 1
`);

function normalizeName(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function findDuplicate(invitado) {
  const target = normalizeName(invitado);
  const rows = db.prepare('SELECT invitado FROM confirmaciones').all();
  for (const r of rows) {
    if (r.invitado && normalizeName(r.invitado) === target) return r.invitado;
  }
  return null;
}

function qrContent(invitado, acompanante) {
  let s = 'INVITADO: ' + invitado;
  if (acompanante && String(acompanante).trim()) s += '\nACOMPAÑANTE: ' + acompanante;
  return s;
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(zlib.crc32(Buffer.concat([typeBuf, data])) >>> 0, 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function qrPngBytes(invitado, acompanante) {
  qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];
  const q = qrcode(0, 'M');
  q.addData(qrContent(invitado, acompanante));
  q.make();
  const n = q.getModuleCount();
  const cell = 8;
  const margin = 4 * cell;
  const px = n * cell + margin * 2;
  const raw = Buffer.alloc(px * (px * 3 + 1));
  for (let y = 0; y < px; y++) {
    const rowStart = y * (px * 3 + 1);
    raw[rowStart] = 0;
    for (let x = 0; x < px; x++) {
      const mx = x - margin, my = y - margin;
      const dark = mx >= 0 && my >= 0 && mx < n * cell && my < n * cell &&
        q.isDark(Math.floor(my / cell), Math.floor(mx / cell));
      const i = rowStart + 1 + x * 3;
      raw[i] = dark ? 0 : 255;
      raw[i + 1] = dark ? 0 : 255;
      raw[i + 2] = dark ? 0 : 255;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(px, 0);
  ihdr.writeUInt32BE(px, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', zlib.deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0))
  ]);
}

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
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(body);
}

function sendJson(res, status, data) {
  send(res, status, JSON.stringify(data), 'application/json; charset=utf-8');
}

function passwordMatches(input, expected) {
  const a = Buffer.from(String(input || ''));
  const b = Buffer.from(String(expected));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function issueToken() {
  const token = crypto.randomBytes(24).toString('hex');
  sessions.set(token, Date.now() + SESSION_IDLE_MS);
  return token;
}

function getToken(req) {
  const auth = req.headers.authorization || '';
  return auth.startsWith('Bearer ') ? auth.slice(7) : '';
}

function requireAuth(req, res) {
  const token = getToken(req);
  const exp = sessions.get(token);
  if (!exp) {
    sendJson(res, 401, { error: 'No autorizado. Inicia sesión.' });
    return false;
  }
  if (exp < Date.now()) {
    sessions.delete(token);
    sendJson(res, 401, { error: 'Sesión expirada. Vuelve a iniciar sesión.' });
    return false;
  }
  sessions.set(token, Date.now() + SESSION_IDLE_MS);
  return true;
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
    /* ---------- API: login ---------- */
    if (p === '/api/login' && req.method === 'POST') {
      const body = await readBody(req);
      if (passwordMatches(body.password, ADMIN_PASSWORD)) {
        sendJson(res, 200, { token: issueToken() });
      } else {
        sendJson(res, 401, { error: 'Contraseña incorrecta' });
      }
      return;
    }

    /* ---------- API: logout ---------- */
    if (p === '/api/logout' && req.method === 'POST') {
      sessions.delete(getToken(req));
      sendJson(res, 200, { ok: true });
      return;
    }

    /* ---------- API: listar (solo con sesión) ---------- */
    if (p === '/api/confirmaciones' && req.method === 'GET') {
      if (!requireAuth(req, res)) return;
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
      const duplicate = findDuplicate(invitado);
      if (duplicate) {
        sendJson(res, 409, { error: `Ya existe una confirmación para "${duplicate}". Verifica el nombre.` });
        return;
      }
      const info = db.prepare('INSERT INTO confirmaciones (invitado, acompanante) VALUES (?, ?)')
        .run(invitado, acompanante);
      const row = db.prepare('SELECT * FROM confirmaciones WHERE id = ?').get(Number(info.lastInsertRowid));
      sendJson(res, 201, row);
      return;
    }

    /* ---------- API: confirmar llegada ---------- */
    let m = p.match(/^\/api\/confirmaciones\/(\d+)\/confirmar-invitado$/);
    if (m && req.method === 'POST') {
      if (!requireAuth(req, res)) return;
      db.prepare("UPDATE confirmaciones SET invitado_confirmado = 1, confirmado_en = datetime('now','localtime') WHERE id = ?")
        .run(Number(m[1]));
      const row = db.prepare('SELECT * FROM confirmaciones WHERE id = ?').get(Number(m[1]));
      sendJson(res, 200, row || { error: 'no encontrado' });
      return;
    }

    m = p.match(/^\/api\/confirmaciones\/(\d+)\/confirmar-acompanante$/);
    if (m && req.method === 'POST') {
      if (!requireAuth(req, res)) return;
      db.prepare("UPDATE confirmaciones SET acompanante_confirmado = 1, confirmado_en = datetime('now','localtime') WHERE id = ?")
        .run(Number(m[1]));
      const row = db.prepare('SELECT * FROM confirmaciones WHERE id = ?').get(Number(m[1]));
      sendJson(res, 200, row || { error: 'no encontrado' });
      return;
    }

    /* ---------- API: confirmar general (ambos) ---------- */
    m = p.match(/^\/api\/confirmaciones\/(\d+)\/confirmar$/);
    if (m && req.method === 'POST') {
      if (!requireAuth(req, res)) return;
      db.prepare(`
        UPDATE confirmaciones
        SET invitado_confirmado = 1, acompanante_confirmado = 1, confirmado = 1,
            confirmado_en = datetime('now','localtime')
        WHERE id = ?
      `).run(Number(m[1]));
      const row = db.prepare('SELECT * FROM confirmaciones WHERE id = ?').get(Number(m[1]));
      sendJson(res, 200, row || { error: 'no encontrado' });
      return;
    }

    /* ---------- API: QR del registro (imagen) ---------- */
    m = p.match(/^\/api\/confirmaciones\/(\d+)\/qr$/);
    if (m && req.method === 'GET') {
      const row = db.prepare('SELECT * FROM confirmaciones WHERE id = ?').get(Number(m[1]));
      if (!row) {
        sendJson(res, 404, { error: 'no encontrado' });
        return;
      }
      const img = qrPngBytes(row.invitado, row.acompanante);
      send(res, 200, img, 'image/png');
      return;
    }

    /* ---------- API: eliminar ---------- */
    m = p.match(/^\/api\/confirmaciones\/(\d+)$/);
    if (m && req.method === 'DELETE') {
      if (!requireAuth(req, res)) return;
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
