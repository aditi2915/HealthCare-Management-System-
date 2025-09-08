// dashboard.js — role-based dashboard; uses pc_doctors / pc_meds / pc_ambulances in localStorage
(function(){
  const $ = (s,r=document)=>r.querySelector(s);
  const $$ = (s,r=document)=>Array.from((r||document).querySelectorAll(s));
  const load = (k,def=[])=>{ try{ return JSON.parse(localStorage.getItem(k)) || def; }catch{ return def; } };
  const save = (k,v)=>localStorage.setItem(k, JSON.stringify(v));
  const uid = (p='ID')=>p+'_'+Math.random().toString(36).slice(2,9).toUpperCase();

  const session = load('pc_session', null);
  if(!session){ location.href='index.html'; return; }
  $('#sessionInfo').textContent = `${session.role} • ${new Date(session.loggedAt).toLocaleString()}`;
  $('#logoutBtn').addEventListener('click', ()=>{ localStorage.removeItem('pc_session'); location.href='index.html'; });

  // Seed big arrays to localStorage if present as window variables
  if(window.doctors && !localStorage.getItem('pc_doctors')) save('pc_doctors', window.doctors);
  if(window.medicines && !localStorage.getItem('pc_meds')) save('pc_meds', window.medicines);
  if(!localStorage.getItem('pc_ambulances')) save('pc_ambulances', [
    { id:'AMB_001', name:'Ambulance A1', type:'BLS', status:'Available' },
    { id:'AMB_002', name:'Ambulance A2', type:'ALS', status:'Busy' },
    { id:'AMB_003', name:'Ambulance A3', type:'ICU', status:'On Duty' }
  ]);

  const MODULES = [
    {id:'home',label:'Home'}, {id:'profile',label:'Profile'}, {id:'appointments',label:'Appointments'},
    {id:'doctors',label:'Doctors'}, {id:'medicines',label:'Medicines'}, {id:'ambulance',label:'Ambulance'},
    {id:'billing',label:'Billing'}, {id:'clinic',label:'Clinic'}, {id:'ipd',label:'IPD'}, {id:'reports',label:'Reports'},
  ];

  function allowed(m){
    if(session.role==='ADMIN') return true;
    if(session.role==='DOCTOR') return !['billing'].includes(m.id);
    return !['billing','clinic','ipd'].includes(m.id);
  }

  const navRoot = $('#dashNav');
  MODULES.filter(allowed).forEach((m,i)=>{
    const b = document.createElement('button');
    b.textContent = m.label;
    b.dataset.panel = m.id;
    if(i===0) b.classList.add('active');
    b.addEventListener('click', ()=> openPanel(m.id));
    navRoot.appendChild(b);
  });

  openPanel(location.hash?.replace('#','') || 'home');

  function setActive(id){ $$('#dashNav button').forEach(b => b.classList.toggle('active', b.dataset.panel===id)); }

  function openPanel(id){
    setActive(id);
    switch(id){
      case 'home': renderHome(); break;
      case 'profile': renderProfile(); break;
      case 'appointments': renderAppointments(); break;
      case 'doctors': renderDoctors(); break;
      case 'medicines': renderMedicines(); break;
      case 'ambulance': renderAmbulance(); break;
      case 'billing': renderBilling(); break;
      case 'clinic': renderClinic(); break;
      case 'ipd': renderIPD(); break;
      case 'reports': renderReports(); break;
      default: $('#dashMain').innerHTML = `<div class="card"><h3>${id}</h3></div>`;
    }
  }

  function renderHome(){
    const dcount = load('pc_doctors', []).length;
    const mcount = load('pc_meds', []).length;
    const apcount = load('pc_appts', []).length;
    $('#dashMain').innerHTML = `
      <div class="card">
        <h2 style="margin-top:0">Welcome to PulseCare Dashboard</h2>
        <div class="muted">Signed in as <b>${session.role}</b></div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-top:1rem">
          <div class="card"><h3>Doctors</h3><div class="muted">${dcount} experts</div></div>
          <div class="card"><h3>Medicines</h3><div class="muted">${mcount} items</div></div>
          <div class="card"><h3>Appointments</h3><div class="muted">${apcount} booked</div></div>
        </div>
      </div>
    `;
  }

  function renderProfile(){
    const key = 'pc_profile_'+session.role.toLowerCase();
    const data = load(key, {name:'',email:'',phone:'',dept:'',about:''});
    $('#dashMain').innerHTML = `
      <div class="card"><h3>Profile</h3>
        <form id="pf" class="form grid grid-2">
          <label>Name <input name="name" value="${data.name||''}"></label>
          <label>Email <input name="email" value="${data.email||''}"></label>
          <label>Phone <input name="phone" value="${data.phone||''}"></label>
          <label>Department <input name="dept" value="${data.dept||''}"></label>
          <label style="grid-column:1/-1">About <textarea name="about">${data.about||''}</textarea></label>
          <div class="form-actions" style="grid-column:1/-1"><button class="btn btn-red">Save</button></div>
        </form>
      </div>`;
    $('#pf').addEventListener('submit', e=>{
      e.preventDefault();
      const form = new FormData(e.target); save(key, Object.fromEntries(form.entries())); alert('Saved');
    });
  }

  function renderAppointments(){
    const appts = load('pc_appts', []);
    $('#dashMain').innerHTML = `
      <div class="card"><h3>Appointments</h3>
        <div class="table-wrap"><table class="table"><thead><tr><th>ID</th><th>Patient</th><th>Doctor/Specialty</th><th>Date/Time</th><th>Status</th></tr></thead><tbody>${appts.map(a=>`<tr><td>${a.id}</td><td>${a.patientName}</td><td>${a.doctorName||a.specialty||''}</td><td>${new Date(a.datetime).toLocaleString()}</td><td>${a.status}</td></tr>`).join('')}</tbody></table></div>
      </div>
      <div class="card" style="margin-top:1rem"><h3>Create Appointment</h3>
        <form id="apForm" class="form grid grid-2">
          <label>Patient <input name="patientName" required></label>
          <label>Contact <input name="contact" required></label>
          <label>Doctor/Specialty <input name="specialty" required></label>
          <label>Date & Time <input name="datetime" type="datetime-local" required></label>
          <div class="form-actions" style="grid-column:1/-1"><button class="btn btn-red">Save</button></div>
        </form>
      </div>`;
    $('#apForm').addEventListener('submit', e=>{
      e.preventDefault();
      const obj = Object.fromEntries(new FormData(e.target).entries());
      const arr = load('pc_appts', []);
      arr.unshift({ id: uid('APPT'), ...obj, status:'CONFIRMED' });
      save('pc_appts', arr); alert('Saved'); renderAppointments();
    });
  }

  function renderDoctors(){
    const all = load('pc_doctors', []);
    let page = 1, pageSize = 24;
    const specs = Array.from(new Set(all.map(d=>d.specialty))).sort();
    $('#dashMain').innerHTML = `
      <div class="card"><h3>Doctors</h3>
        <div style="display:flex;gap:.6rem;margin:.6rem 0">
          <input id="doc_q" placeholder="Search name/specialty/country">
          <select id="doc_spec"><option value="">All specialties</option>${specs.map(s=>`<option>${s}</option>`).join('')}</select>
          <button id="doc_reload" class="btn btn-outline">Reload</button>
        </div>
        <div id="doc_grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:.8rem"></div>
        <div class="pager-bar"><button id="doc_prev" class="pager-btn">&laquo; Back</button><span id="doc_info" class="pager-info"></span><button id="doc_next" class="pager-btn">Next &raquo;</button></div>
      </div>`;
    function render(){
      const q = ($('#doc_q').value||'').toLowerCase(), f = $('#doc_spec').value||'';
      let filtered = all.filter(d => (!f || d.specialty===f) && (d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q) || (d.country||'').toLowerCase().includes(q)));
      const total = filtered.length, pages = Math.max(1, Math.ceil(total/pageSize));
      if(page>pages) page=pages;
      const slice = filtered.slice((page-1)*pageSize, page*pageSize);
      $('#doc_grid').innerHTML = slice.map(d=>`<article class="card"><div class="muted">${d.country}</div><h4>${d.name}</h4><div class="muted">${d.specialty} • ${d.experience}</div><div style="margin-top:.6rem">${d.hospital}</div><div style="margin-top:.6rem;display:flex;gap:.5rem"><button class="btn btn-outline view-doc" data-id="${d.id}">Profile</button><button class="btn btn-red book-doc" data-id="${d.id}">Book</button></div></article>`).join('');
      $('#doc_info').textContent = `Page ${page} of ${pages} • ${total} doctors`;
      $$('.view-doc').forEach(b=>b.addEventListener('click', ()=>{ const x = all.find(z=>z.id===b.dataset.id); alert(`${x.name}\n${x.specialty}\n${x.hospital}\n${x.country}`); }));
      $$('.book-doc').forEach(b=>b.addEventListener('click', ()=>{ const x = all.find(z=>z.id===b.dataset.id); const arr = load('pc_appts', []); arr.unshift({ id: uid('APPT'), patientName:'(You)', doctorName:x.name, specialty:x.specialty, datetime:new Date(Date.now()+86400000).toISOString(), status:'PENDING' }); save('pc_appts', arr); alert('Appointment request created'); }));
    }
    $('#doc_q').addEventListener('input', ()=>{page=1;render();});
    $('#doc_spec').addEventListener('change', ()=>{page=1;render();});
    $('#doc_prev').addEventListener('click', ()=>{ if(page>1){ page--; render(); }});
    $('#doc_next').addEventListener('click', ()=>{ page++; render(); });
    $('#doc_reload').addEventListener('click', ()=>{ save('pc_doctors', window.doctors || all); location.reload(); });
    render();
  }

  function renderMedicines(){
    const all = load('pc_meds', []);
    let page=1, pageSize=24;
    $('#dashMain').innerHTML = `
      <div class="card"><h3>Medicines</h3>
        <div style="display:flex;gap:.6rem;margin:.6rem 0">
          <input id="med_q" placeholder="Search name/brand/strength">
          <button id="med_reload" class="btn btn-outline">Reload</button>
        </div>
        <div id="med_grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:.8rem"></div>
        <div class="pager-bar"><button id="med_prev" class="pager-btn">&laquo; Back</button><span id="med_info" class="pager-info"></span><button id="med_next" class="pager-btn">Next &raquo;</button></div>
      </div>`;
    function render(){
      const q = ($('#med_q').value||'').toLowerCase();
      let filtered = all.filter(m => (!q) || m.name.toLowerCase().includes(q) || (m.brand||'').toLowerCase().includes(q) || (m.strength||'').toLowerCase().includes(q));
      const total = filtered.length, pages = Math.max(1, Math.ceil(total/pageSize));
      if(page>pages) page=pages;
      const slice = filtered.slice((page-1)*pageSize, page*pageSize);
      $('#med_grid').innerHTML = slice.map(m=>`<article class="card"><h4>${m.name}</h4><div class="muted">${m.form} • ${m.strength}</div><div class="muted">${m.brand}</div><div style="margin-top:.6rem;display:flex;gap:.5rem;align-items:center">${m.recommended?'<span style="color:var(--success);font-weight:700">Recommended</span>':''}${(session.role==='ADMIN'||session.role==='DOCTOR')?`<button class="btn btn-outline rec" data-id="${m.id}">${m.recommended?'Unrecommend':'Recommend'}</button>`:''}<button class="btn btn-red view-med" data-id="${m.id}">View</button></div></article>`).join('');
      $('#med_info').textContent = `Page ${page} of ${pages} • ${total} meds`;
      $$('.view-med').forEach(b=>b.addEventListener('click', ()=>{ const x = all.find(z=>z.id===b.dataset.id); alert(`${x.name}\n${x.form} • ${x.strength}\n${x.brand}`); }));
      $$('.rec').forEach(b=>b.addEventListener('click', ()=>{ const id=b.dataset.id; const arr = load('pc_meds', []); const x = arr.find(z=>z.id===id); if(x){ x.recommended = !x.recommended; save('pc_meds', arr); render(); } }));
    }
    $('#med_q').addEventListener('input', ()=>{ page=1; render(); });
    $('#med_prev').addEventListener('click', ()=>{ if(page>1){ page--; render(); }});
    $('#med_next').addEventListener('click', ()=>{ page++; render(); });
    $('#med_reload').addEventListener('click', ()=>{ save('pc_meds', window.medicines || all); location.reload(); });
    render();
  }

  function renderAmbulance(){
    const arr = load('pc_ambulances', []);
    $('#dashMain').innerHTML = `
      <div class="card"><h3>Ambulance Fleet</h3>
        ${(session.role==='ADMIN'||session.role==='DOCTOR')?`<div style="display:flex;gap:.6rem;margin:.6rem 0"><input id="amb_name" placeholder="Name"><input id="amb_type" placeholder="Type"><select id="amb_status"><option>Available</option><option>Busy</option><option>On Duty</option></select><button id="amb_add" class="btn btn-red">Add</button></div>`:''}
        <div class="table-wrap"><table class="table"><thead><tr><th>Name</th><th>Type</th><th>Status</th><th>Action</th></tr></thead><tbody id="amb_tbody">${arr.map(a=>`<tr><td>${a.name}</td><td>${a.type}</td><td class="${a.status==='Available'?'status-available':a.status==='Busy'?'status-busy':'status-duty'}">${a.status}</td><td>${(session.role==='ADMIN'||session.role==='DOCTOR')?`<select class="amb-change" data-id="${a.id}"><option ${a.status==='Available'?'selected':''}>Available</option><option ${a.status==='Busy'?'selected':''}>Busy</option><option ${a.status==='On Duty'?'selected':''}>On Duty</option></select><button class="btn btn-outline amb-del" data-id="${a.id}">Delete</button>`:'<button class="btn btn-outline" disabled>View</button>'}</td></tr>`).join('')}</tbody></table></div>
      </div>`;
    if(session.role==='ADMIN'||session.role==='DOCTOR'){
      $('#amb_add').addEventListener('click', ()=>{ const name=$('#amb_name').value.trim(); const type=$('#amb_type').value.trim()||'General'; const status=$('#amb_status').value; if(!name){ alert('Name required'); return;} const a=load('pc_ambulances',[]); a.unshift({id:uid('AMB'),name,type,status}); save('pc_ambulances', a); renderAmbulance(); });
      $$('.amb-change').forEach(s=>s.addEventListener('change', e=>{ const id=e.target.dataset.id; const val=e.target.value; const a=load('pc_ambulances',[]); const x=a.find(z=>z.id===id); if(x){ x.status=val; save('pc_ambulances', a); renderAmbulance(); } }));
      $$('.amb-del').forEach(b=>b.addEventListener('click', e=>{ const id=b.dataset.id; let a=load('pc_ambulances',[]); a=a.filter(z=>z.id!==id); save('pc_ambulances', a); renderAmbulance(); }));
    }
  }

  function renderBilling(){
    const bills = load('pc_bills', []);
    $('#dashMain').innerHTML = `
      <div class="card"><h3>Billing</h3>
        <form id="billForm" class="form grid grid-2">
          <label>Patient <input name="patient" required></label>
          <label>Amount <input name="amount" type="number" step="0.01" required></label>
          <label>Service <input name="service"></label>
          <label>Mode <input name="mode"></label>
          <div class="form-actions" style="grid-column:1/-1"><button class="btn btn-red">Create</button></div>
        </form>
        <div class="table-wrap" style="margin-top:1rem"><table class="table"><thead><tr><th>Receipt</th><th>Patient</th><th>Service</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead><tbody>${bills.map(b=>`<tr><td>${b.id}</td><td>${b.patient}</td><td>${b.service}</td><td>${b.amount}</td><td>${b.status}</td><td>${b.status==='ACTIVE'?`<button class="btn btn-outline refund" data-id="${b.id}">Refund</button>`:''}<button class="btn btn-outline cancel" data-id="${b.id}">Cancel</button></td></tr>`).join('')}</tbody></table></div>
      </div>`;
    $('#billForm').addEventListener('submit', e=>{ e.preventDefault(); const obj=Object.fromEntries(new FormData(e.target).entries()); const arr=load('pc_bills',[]); arr.unshift({ id: uid('REC'), ...obj, status:'ACTIVE' }); save('pc_bills', arr); renderBilling(); });
    $$('.refund').forEach(b=>b.addEventListener('click', ()=>{ const arr=load('pc_bills',[]); const x=arr.find(z=>z.id===b.dataset.id); if(x){ x.status='REFUNDED'; save('pc_bills', arr); renderBilling(); }}));
    $$('.cancel').forEach(b=>b.addEventListener('click', ()=>{ let arr=load('pc_bills',[]); arr = arr.filter(z=>z.id!==b.dataset.id); save('pc_bills', arr); renderBilling(); }));
  }

  function renderClinic(){
    const notes = load('pc_clinic', []);
    $('#dashMain').innerHTML = `
      <div class="card"><h3>Clinic (OPD / IPD)</h3>
        <form id="clForm" class="form grid grid-2">
          <label>Patient <input name="patient" required></label>
          <label>Doctor <input name="doctor" required></label>
          <label style="grid-column:1/-1">Findings <textarea name="findings" rows="3"></textarea></label>
          <label style="grid-column:1/-1">Plan / Rx <textarea name="plan" rows="3"></textarea></label>
          <div class="form-actions" style="grid-column:1/-1"><button class="btn btn-red">Save</button></div>
        </form>
        <div class="table-wrap" style="margin-top:1rem"><table class="table"><thead><tr><th>ID</th><th>Patient</th><th>Doctor</th><th>Date</th></tr></thead><tbody>${notes.map(n=>`<tr><td>${n.id}</td><td>${n.patient}</td><td>${n.doctor}</td><td>${new Date(n.date).toLocaleString()}</td></tr>`).join('')}</tbody></table></div>
      </div>`;
    $('#clForm').addEventListener('submit', e=>{ e.preventDefault(); const o=Object.fromEntries(new FormData(e.target).entries()); const arr=load('pc_clinic',[]); arr.unshift({ id:uid('CLN'), ...o, date:new Date().toISOString() }); save('pc_clinic', arr); renderClinic(); });
  }

  function renderIPD(){
    const ipd = load('pc_ipd', []);
    $('#dashMain').innerHTML = `
      <div class="card"><h3>IPD</h3>
        <form id="ipdForm" class="form grid grid-2">
          <label>Patient <input name="patient" required></label>
          <label>Ward/Bed <input name="bed" required></label>
          <label>Action <select name="action"><option>Admission</option><option>Transfer</option><option>Discharge</option></select></label>
          <label>Notes <input name="notes"></label>
          <div class="form-actions" style="grid-column:1/-1"><button class="btn btn-red">Record</button></div>
        </form>
        <div class="table-wrap" style="margin-top:1rem"><table class="table"><thead><tr><th>ID</th><th>Patient</th><th>Bed</th><th>Action</th><th>Date</th></tr></thead><tbody>${ipd.map(x=>`<tr><td>${x.id}</td><td>${x.patient}</td><td>${x.bed}</td><td>${x.action}</td><td>${new Date(x.date).toLocaleString()}</td></tr>`).join('')}</tbody></table></div>
      </div>`;
    $('#ipdForm').addEventListener('submit', e=>{ e.preventDefault(); const o=Object.fromEntries(new FormData(e.target).entries()); const arr=load('pc_ipd',[]); arr.unshift({ id:uid('IPD'), ...o, date:new Date().toISOString() }); save('pc_ipd', arr); renderIPD(); });
  }

  function renderReports(){
    $('#dashMain').innerHTML = `<div class="card"><h3>Reports</h3><p class="muted">Generate, preview and download patient health reports (HTML/Print/CSV) — sample report generation available on index page.</p></div>`;
  }

})();
