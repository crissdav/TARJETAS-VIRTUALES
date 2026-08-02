const SUPABASE_URL = 'https://dgogtngftdqibxrwmgzs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnb2d0bmdmdGRxaWJ4cndtZ3pzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2Njg0NDEsImV4cCI6MjEwMTI0NDQ0MX0.uPAoAVgW13JwzaGoKX3k8CNYGZSvjroB29PGaP6frhA';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let list = [];
let filter = '';

function showLogin(msg) {
  document.getElementById('loginScreen').hidden = false;
  document.getElementById('btnLogout').hidden = true;
  const err = document.getElementById('loginError');
  err.hidden = !msg;
  err.textContent = msg || '';
}

function hideLogin() {
  document.getElementById('loginScreen').hidden = true;
  document.getElementById('btnLogout').hidden = false;
}

async function load() {
  try {
    const { data, error } = await supabaseClient
      .from('confirmaciones')
      .select('*')
      .order('id', { ascending: false });
    if (error) throw error;
    list = data || [];
    setStatus('Actualizado ' + new Date().toLocaleTimeString('es-PE') + ' · ' + list.length + ' registros');
    render();
  } catch (e) {
    setStatus('No se pudo conectar con Supabase: ' + e.message);
  }
}

function setStatus(msg) {
  const el = document.getElementById('statusLine');
  if (el) el.textContent = msg;
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return String(iso);
  return d.toLocaleString('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function render() {
  const q = filter.trim().toLowerCase();
  const filtered = list.filter(e =>
    !q ||
    (e.invitado || '').toLowerCase().includes(q) ||
    (e.acompanante || '').toLowerCase().includes(q)
  );

  const tbody = document.getElementById('tableBody');
  const empty = document.getElementById('emptyState');
  tbody.innerHTML = '';
  empty.hidden = filtered.length !== 0;

  filtered.forEach((e, i) => {
    const tr = document.createElement('tr');
    const invDone = !!e.invitado_confirmado;
    const accDone = !!e.acompanante_confirmado;
    const hasComp = !!(e.acompanante || '').trim();
    if (invDone && (!hasComp || accDone)) tr.classList.add('row-arrived');

    const tdNum = document.createElement('td');
    tdNum.textContent = i + 1;
    tdNum.dataset.label = '#';

    const tdInv = document.createElement('td');
    tdInv.textContent = e.invitado || '';
    tdInv.dataset.label = 'Invitado';
    if (invDone) tdInv.classList.add('name-done');

    const tdAcc = document.createElement('td');
    tdAcc.textContent = hasComp ? e.acompanante : '—';
    tdAcc.dataset.label = 'Acompañante';
    if (hasComp && accDone) tdAcc.classList.add('name-done');

    const tdFecha = document.createElement('td');
    tdFecha.className = 'td-date';
    tdFecha.textContent = formatDate(e.confirmado_en || e.fecha);
    tdFecha.dataset.label = 'Confirmó';

    const tdEstado = document.createElement('td');
    const badge = document.createElement('span');
    let estado, badgeCls;
    if (invDone && (!hasComp || accDone)) { estado = 'Llegaron'; badgeCls = 'badge-ok'; }
    else if (invDone) { estado = 'Invitado llegó'; badgeCls = 'badge-ok'; }
    else if (accDone) { estado = 'Acompañante llegó'; badgeCls = 'badge-ok'; }
    else { estado = 'Pendiente'; badgeCls = 'badge-pend'; }
    badge.className = 'badge ' + badgeCls;
    badge.textContent = estado;
    tdEstado.appendChild(badge);
    tdEstado.dataset.label = 'Estado';

    const tdActions = document.createElement('td');
    tdActions.dataset.label = 'Acciones';
    if (!invDone || (hasComp && !accDone)) {
      const btnAll = document.createElement('button');
      btnAll.className = 'btn-action btn-arrive';
      btnAll.textContent = 'Confirmar general';
      btnAll.addEventListener('click', () => doConfirm(e.id, 'confirmar'));
      tdActions.appendChild(btnAll);
    }
    if (!invDone) {
      const btnInv = document.createElement('button');
      btnInv.className = 'btn-action btn-arrive';
      btnInv.textContent = 'Confirmar invitado';
      btnInv.addEventListener('click', () => doConfirm(e.id, 'confirmar-invitado'));
      tdActions.appendChild(btnInv);
    }
    if (hasComp && !accDone) {
      const btnAcc = document.createElement('button');
      btnAcc.className = 'btn-action btn-arrive';
      btnAcc.textContent = 'Confirmar acompañante';
      btnAcc.addEventListener('click', () => doConfirm(e.id, 'confirmar-acompanante'));
      tdActions.appendChild(btnAcc);
    }
    const btnDel = document.createElement('button');
    btnDel.className = 'btn-action btn-del';
    btnDel.textContent = 'Eliminar';
    btnDel.addEventListener('click', () => remove(e.id));
    tdActions.appendChild(btnDel);

    tr.append(tdNum, tdInv, tdAcc, tdFecha, tdEstado, tdActions);
    tbody.appendChild(tr);
  });

  document.getElementById('statTotal').textContent = list.length;
  document.getElementById('statPeople').textContent =
    list.reduce((s, e) => s + 1 + ((e.acompanante || '').trim() ? 1 : 0), 0);
  document.getElementById('statArrived').textContent =
    list.reduce((s, e) => s + (e.invitado_confirmado ? 1 : 0) + (e.acompanante_confirmado ? 1 : 0), 0);
  document.getElementById('statPending').textContent =
    document.getElementById('statPeople').textContent -
    document.getElementById('statArrived').textContent;
}

async function doConfirm(id, action) {
  const patch = { confirmado_en: new Date().toISOString() };
  if (action === 'confirmar') {
    patch.confirmado = true;
    patch.invitado_confirmado = true;
    patch.acompanante_confirmado = true;
  } else if (action === 'confirmar-invitado') {
    patch.invitado_confirmado = true;
  } else if (action === 'confirmar-acompanante') {
    patch.acompanante_confirmado = true;
  }
  await supabaseClient.from('confirmaciones').update(patch).eq('id', id);
  load();
}

async function remove(id) {
  if (!confirm('¿Eliminar esta confirmación?')) return;
  await supabaseClient.from('confirmaciones').delete().eq('id', id);
  load();
}

function estadoCsv(e) {
  const inv = !!e.invitado_confirmado;
  const acc = !!e.acompanante_confirmado;
  const hasComp = !!(e.acompanante || '').trim();
  if (inv && (!hasComp || acc)) return 'Llegaron';
  if (inv) return 'Invitado llegó';
  if (acc) return 'Acompañante llegó';
  return 'Pendiente';
}

function exportCsv() {
  if (!list.length) { alert('No hay confirmaciones para exportar.'); return; }
  const rows = [['#', 'Invitado', 'Acompañante', 'Confirmó', 'Estado']];
  list.slice().reverse().forEach((e, i) => {
    rows.push([i + 1, e.invitado || '', e.acompanante || '', formatDate(e.confirmado_en || e.fecha), estadoCsv(e)]);
  });
  const csv = rows.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\r\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'confirmaciones_xv_vianca.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
}

document.getElementById('searchInput').addEventListener('input', (e) => {
  filter = e.target.value;
  render();
});
document.getElementById('btnRefresh').addEventListener('click', load);
document.getElementById('btnExport').addEventListener('click', exportCsv);

/* ---------- Escáner QR ---------- */
let scanStream = null;
let scanTimer = null;
const scanVideo = document.getElementById('scannerVideo');
const scanCanvas = document.getElementById('scannerCanvas');
const scanCtx = scanCanvas.getContext('2d', { willReadFrequently: true });

function parseQrName(text) {
  const m = /INVITADO:\s*(.+)/i.exec(text || '');
  return m ? m[1].trim() : '';
}

function scanTick() {
  if (!scanVideo.videoWidth) return;
  scanCanvas.width = scanVideo.videoWidth;
  scanCanvas.height = scanVideo.videoHeight;
  scanCtx.drawImage(scanVideo, 0, 0);
  const img = scanCtx.getImageData(0, 0, scanCanvas.width, scanCanvas.height);
  const code = jsQR(img.data, img.width, img.height, { inversionAttempts: 'attemptBoth' });
  if (!code || !code.data) return;
  stopScanner();
  const name = parseQrName(code.data);
  if (!name) {
    setStatus('QR no válido: no contiene un invitado');
    return;
  }
  const input = document.getElementById('searchInput');
  input.value = name;
  filter = name;
  render();
  setStatus('QR detectado: ' + name);
  const firstRow = document.querySelector('#tableBody tr');
  if (firstRow) {
    firstRow.classList.add('row-flash');
    setTimeout(() => firstRow.classList.remove('row-flash'), 1600);
    firstRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

async function openScanner() {
  document.getElementById('scannerOverlay').hidden = false;
  document.getElementById('scannerStatus').textContent = 'Solicitando acceso a la cámara…';
  try {
    scanStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    });
    scanVideo.srcObject = scanStream;
    await scanVideo.play();
    document.getElementById('scannerStatus').textContent = 'Apunta al QR del invitado…';
    scanTimer = setInterval(scanTick, 120);
  } catch (e) {
    document.getElementById('scannerStatus').textContent =
      'No se pudo acceder a la cámara: ' + (e && e.message ? e.message : e);
  }
}

function stopScanner() {
  clearInterval(scanTimer);
  scanTimer = null;
  if (scanStream) {
    scanStream.getTracks().forEach((t) => t.stop());
    scanStream = null;
  }
  scanVideo.srcObject = null;
  document.getElementById('scannerOverlay').hidden = true;
}

document.getElementById('btnScan').addEventListener('click', openScanner);
document.getElementById('btnScanClose').addEventListener('click', stopScanner);

/* ---------- Login con Supabase Auth ---------- */
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const err = document.getElementById('loginError');
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) {
    err.hidden = false;
    err.textContent = 'Correo o contraseña incorrectos';
    return;
  }
  err.hidden = true;
});

document.getElementById('btnLogout').addEventListener('click', async () => {
  await supabaseClient.auth.signOut();
  showLogin();
});

supabaseClient.auth.onAuthStateChange((event, session) => {
  if (session) {
    hideLogin();
    load();
  } else {
    showLogin();
  }
});

supabaseClient.auth.getSession().then(({ data }) => {
  if (data.session) {
    hideLogin();
    load();
  } else {
    showLogin();
  }
});

async function refreshIfAuthed() {
  const { data } = await supabaseClient.auth.getSession();
  if (data.session) load();
}

setInterval(refreshIfAuthed, 5000);
window.addEventListener('focus', refreshIfAuthed);
