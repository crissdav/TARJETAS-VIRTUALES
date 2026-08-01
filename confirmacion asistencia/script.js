const API = '/api/confirmaciones';

let list = [];
let filter = '';

async function load() {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    list = await res.json();
    setStatus('Actualizado ' + new Date().toLocaleTimeString('es-PE') + ' · ' + list.length + ' registros');
    render();
  } catch (e) {
    setStatus('No se pudo conectar con el servidor: ' + e.message);
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
    if (e.confirmado) tr.classList.add('row-arrived');

    const tdNum = document.createElement('td');
    tdNum.textContent = i + 1;

    const tdInv = document.createElement('td');
    tdInv.textContent = e.invitado || '';

    const tdAcc = document.createElement('td');
    tdAcc.textContent = e.acompanante || '—';

    const tdFecha = document.createElement('td');
    tdFecha.className = 'td-date';
    tdFecha.textContent = formatDate(e.fecha);

    const tdEstado = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = 'badge ' + (e.confirmado ? 'badge-ok' : 'badge-pend');
    badge.textContent = e.confirmado ? 'Llegó' : 'Pendiente';
    tdEstado.appendChild(badge);

    const tdActions = document.createElement('td');
    const btnConfirm = document.createElement('button');
    btnConfirm.className = 'btn-action ' + (e.confirmado ? 'btn-undo' : 'btn-arrive');
    btnConfirm.textContent = e.confirmado ? 'Deshacer' : 'Confirmar llegada';
    btnConfirm.addEventListener('click', () => toggleArrive(e.id, !!e.confirmado));
    const btnDel = document.createElement('button');
    btnDel.className = 'btn-action btn-del';
    btnDel.textContent = 'Eliminar';
    btnDel.addEventListener('click', () => remove(e.id));
    tdActions.append(btnConfirm, btnDel);

    tr.append(tdNum, tdInv, tdAcc, tdFecha, tdEstado, tdActions);
    tbody.appendChild(tr);
  });

  document.getElementById('statTotal').textContent = list.length;
  document.getElementById('statPeople').textContent =
    list.reduce((s, e) => s + 1 + (e.acompanante ? 1 : 0), 0);
  document.getElementById('statArrived').textContent = list.filter(e => e.confirmado).length;
  document.getElementById('statPending').textContent =
    list.length - list.filter(e => e.confirmado).length;
}

async function toggleArrive(id, isConfirmed) {
  const url = API + '/' + id + '/' + (isConfirmed ? 'desconfirmar' : 'confirmar');
  await fetch(url, { method: 'POST' });
  load();
}

async function remove(id) {
  if (!confirm('¿Eliminar esta confirmación?')) return;
  await fetch(API + '/' + id, { method: 'DELETE' });
  load();
}

function exportCsv() {
  if (!list.length) { alert('No hay confirmaciones para exportar.'); return; }
  const rows = [['#', 'Invitado', 'Acompañante', 'Confirmó', 'Estado']];
  list.slice().reverse().forEach((e, i) => {
    rows.push([i + 1, e.invitado || '', e.acompanante || '', formatDate(e.fecha), e.confirmado ? 'Llegó' : 'Pendiente']);
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

load();
setInterval(load, 5000);
window.addEventListener('focus', load);
