document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year'); 
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const toastEl = document.getElementById('toast');
  window.showToast = (msg, duration = 2200) => {
    if (!toastEl) { alert(msg); return; }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), duration);
  };

  const DEMO = {
    PATIENT: { email: 'patient@demo.com', pass: 'demo123', name: 'Demo Patient' },
    DOCTOR:  { email: 'doctor@demo.com', pass: 'demo123', name: 'Demo Doctor' },
    ADMIN:   { email: 'admin@demo.com', pass: 'demo123', name: 'Demo Admin' }
  };

  const loadUsers = () => JSON.parse(localStorage.getItem('pc_users') || '{}');
  const saveUsers = (u) => localStorage.setItem('pc_users', JSON.stringify(u));

  function getSession() { return JSON.parse(localStorage.getItem('pc_session') || 'null'); }
  function setSession(obj) { localStorage.setItem('pc_session', JSON.stringify(obj)); updateHeader(); }
  function clearSession() { localStorage.removeItem('pc_session'); updateHeader(); }

  function updateHeader() {
    const sess = getSession();
    const label = document.getElementById('user-label');
    const logout = document.getElementById('logout-btn');
    if (sess) {
      label.textContent = `${sess.role} (${sess.name || sess.email})`;
      if (logout) logout.style.display = 'block';
    } else {
      label.textContent = 'Login';
      if (logout) logout.style.display = 'none';
    }
  }
  updateHeader();

  const dropdown = document.querySelector('.dropdown.stay-open');
  if (dropdown) {
    const btn = dropdown.querySelector('.dropbtn');
    btn.addEventListener('click', (e) => { e.stopPropagation(); dropdown.classList.toggle('show'); });
    document.addEventListener('click', (e) => { if (!dropdown.contains(e.target)) dropdown.classList.remove('show'); });
  }

  function buildAuthModal() {
    if (document.getElementById('authModal')) return;

    const modal = document.createElement('div');
    modal.id = 'authModal';
    modal.className = 'modal hidden';
    modal.innerHTML = `
      <div class="modal-content">
        <button class="modal-close">&times;</button>
        <h3 id="auth-title">Sign In</h3>
        <div style="display:flex;gap:.4rem;margin:.6rem 0">
          <button id="tab-signin" class="btn btn-outline">Sign In</button>
          <button id="tab-register" class="btn btn-outline">Register</button>
        </div>
        <form id="signin-form" class="form">
          <label>Email<input id="si-email" type="email" required></label>
          <label>Password<input id="si-pass" type="password" required></label>
          <div class="form-actions"><button class="btn btn-red" type="submit">Sign In</button></div>
          <div style="font-size:12px;color:var(--muted);margin-top:.5rem">Demo: patient@demo.com/demo123 • doctor@demo.com/demo123 • admin@demo.com/demo123</div>
        </form>
        <form id="register-form" class="form" style="display:none">
          <label>Name<input id="rg-name" type="text" required></label>
          <label>Email<input id="rg-email" type="email" required></label>
          <label>Password<input id="rg-pass" type="password" required></label>
          <div class="form-actions"><button class="btn btn-red" type="submit">Register</button></div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('.modal-close').addEventListener('click', () => {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    });

    document.getElementById('tab-signin').addEventListener('click', () => {
      modal.querySelector('#auth-title').textContent = 'Sign In';
      modal.querySelector('#signin-form').style.display = 'block';
      modal.querySelector('#register-form').style.display = 'none';
    });
    document.getElementById('tab-register').addEventListener('click', () => {
      modal.querySelector('#auth-title').textContent = 'Register';
      modal.querySelector('#signin-form').style.display = 'none';
      modal.querySelector('#register-form').style.display = 'block';
    });

    modal.querySelector('#signin-form').addEventListener('submit', (ev) => {
      ev.preventDefault();
      const email = document.getElementById('si-email').value.trim();
      const pass = document.getElementById('si-pass').value.trim();

      for (const r of ['PATIENT', 'DOCTOR', 'ADMIN']) {
        if (DEMO[r] && DEMO[r].email === email && DEMO[r].pass === pass) {
          setSession({ role: r, email, name: DEMO[r].name, loggedAt: new Date().toISOString() });
          modal.classList.add('hidden');
          document.body.style.overflow = '';
          showToast(`Signed in as ${r}`);
          return;
        }
      }

      const users = loadUsers();
      if (users[email] && users[email].pass === pass) {
        setSession({ role: users[email].role, email, name: users[email].name, loggedAt: new Date().toISOString() });
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        showToast(`Signed in as ${users[email].role}`);
        return;
      }

      alert('Invalid credentials for demo. Use demo credentials or register.');
    });

    modal.querySelector('#register-form').addEventListener('submit', (ev) => {
      ev.preventDefault();
      const name = document.getElementById('rg-name').value.trim();
      const email = document.getElementById('rg-email').value.trim();
      const pass = document.getElementById('rg-pass').value.trim();
      const users = loadUsers();
      if (users[email]) { alert('User already exists. Sign in.'); return; }
      users[email] = { role: 'PATIENT', name, pass };
      saveUsers(users);
      showToast('Registered. Now sign in.');
      modal.querySelector('#auth-title').textContent = 'Sign In';
      modal.querySelector('#signin-form').style.display = 'block';
      modal.querySelector('#register-form').style.display = 'none';
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
      }
    });
  }

  buildAuthModal();

  document.querySelectorAll('.drop-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const role = btn.dataset.role || 'PATIENT';
      const modal = document.getElementById('authModal');
      modal.querySelector('#auth-title').textContent = 'Sign In';
      modal.querySelector('#signin-form').style.display = 'block';
      modal.querySelector('#register-form').style.display = 'none';
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    });
  });

  document.getElementById('logout-btn').addEventListener('click', () => {
    clearSession();
    showToast('Logged out');
  });
});
