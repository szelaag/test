const qs = sel => document.querySelector(sel);
const tBody = () => qs('#projects-table tbody');
let editingId = null;

async function checkAuth(){
  try {
    const r = await fetch('/api/admin/me', { method: 'GET' });
    const authed = r.ok;
    qs('#login-card').style.display    = authed ? 'none'  : 'block';
    qs('#projects-card').style.display = authed ? 'block' : 'none';
    qs('#edit-card').style.display     = 'none';
    if (authed) loadList();
  } catch { qs('#login-card').style.display = 'block'; }
}

async function login(){
  const username = qs('#username')?.value.trim() || '';
  const password = qs('#password')?.value || '';
  qs('#login-status').textContent = 'Logowanie...';
  const r = await fetch('/api/admin/login', {
    method:'POST', headers:{ 'Content-Type':'application/json' },
    body: JSON.stringify({ username, password })
  });
  qs('#login-status').textContent = r.ok ? 'Zalogowano.' : 'Błędny login lub hasło.';
  if (r.ok) checkAuth();
}

async function logout(){ await fetch('/api/admin/logout', { method:'POST' }); location.reload(); }

async function loadList(){
  const r = await fetch('/api/projects');
  const data = await r.json();
  const body = tBody(); if (!body) return;
  body.innerHTML = '';
  (data.projects||[]).sort((a,b)=>(a.order_num??0)-(b.order_num??0)).forEach(p=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.title||''}</td>
      <td><div class="muted" style="max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.imageUrl||''}</div></td>
      <td><div class="muted" style="max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.linkUrl||''}</div></td>
      <td>${p.order_num??0}</td>
      <td>
        <button data-id="${p.id}" class="editBtn secondary">Edytuj</button>
        <button data-id="${p.id}" class="delBtn danger">Usuń</button>
      </td>`;
    body.appendChild(tr);
  });

  body.onclick = async (e)=>{
    const btn = e.target.closest('button'); if(!btn) return;
    const id = btn.dataset.id;
    if (btn.classList.contains('editBtn')) {
      const r = await fetch('/api/projects/' + id);
      const p = await r.json(); openEditor(p);
    }
    if (btn.classList.contains('delBtn')) {
      if (confirm('Na pewno usunąć projekt #' + id + '?')) {
        const r = await fetch('/api/projects/' + id, { method:'DELETE' });
        if (r.ok) loadList(); else alert('Błąd usuwania: ' + r.status);
      }
    }
  };
}

function openEditor(p){
  editingId = p?.id ?? null;
  qs('#edit-title').textContent = editingId ? 'Edytuj projekt' : 'Nowy projekt';
  qs('#p-title').value = p?.title || '';
  qs('#p-link').value = p?.linkUrl || '';
  qs('#p-image').value = p?.imageUrl || '';
  qs('#p-desc').value = p?.description || '';
  qs('#p-order').value = p?.order_num ?? 0;
  qs('#edit-card').style.display = 'block';
}

async function save(){
  const payload = {
    title: qs('#p-title').value.trim(),
    linkUrl: qs('#p-link').value.trim(),
    imageUrl: qs('#p-image').value.trim(),
    description: qs('#p-desc').value.trim(),
    order_num: parseInt(qs('#p-order').value || '0', 10)
  };
  const url = editingId ? `/api/projects/${editingId}` : '/api/projects';
  const method = editingId ? 'PUT' : 'POST';

  const r = await fetch(url, {
    method, headers:{ 'Content-Type':'application/json' },
    body: JSON.stringify(payload)
  });

  if (r.ok) {
    qs('#edit-card').style.display = 'none';
    loadList();
  } else {
    let msg = 'Błąd zapisu: ' + r.status;
    try { msg += ' — ' + (await r.text()); } catch {}
    alert(msg);
  }
}

function init(){
  qs('#loginBtn')?.addEventListener('click', login);
  qs('#logoutBtn')?.addEventListener('click', logout);
  qs('#reloadBtn')?.addEventListener('click', loadList);
  qs('#newBtn')?.addEventListener('click', ()=>openEditor(null));
  qs('#saveBtn')?.addEventListener('click', save);
  qs('#cancelBtn')?.addEventListener('click', ()=>{ qs('#edit-card').style.display='none'; });
  checkAuth();
}
init();
