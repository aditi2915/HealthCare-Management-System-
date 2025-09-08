// appointments.js - uses doctors list in localStorage? For demo it reads doctors from doctors.js in memory if available
document.addEventListener('DOMContentLoaded', ()=>{
  const form = document.getElementById('ap-form');
  const doctorSel = document.getElementById('ap-doctor');
  const tbody = document.querySelector('#ap-table tbody');
  const sound = document.getElementById('appt-sound');

  // get doctors list: either from window (doctors generated in doctors.js) or basic fallback
  const doctorsList = (window.doctors || window.DoctorsModule || null);
  // If doctors were generated into a global array earlier (in our doctors.js we created 'doctors' inside scope).
  // For this demo, we'll produce a small list if not available.
  let doctorNames = [];
  if(window.DoctorsModule && typeof DoctorsModule !== 'undefined' && DoctorsModule.getDoctors){
    try { doctorNames = DoctorsModule.getDoctors().slice(0,200).map(d=> d.name); }
    catch(e){}
  }
  if(!doctorNames.length){
    doctorNames = ["Dr. Alice Johnson","Dr. Raj Mehta","Dr. Sunita Rao","Dr. Karan Singh"];
  }
  doctorNames.forEach(n=> doctorSel.add(new Option(n,n)));

  function load() { return JSON.parse(localStorage.getItem('pc_appointments')||'[]'); }
  function save(list){ localStorage.setItem('pc_appointments', JSON.stringify(list)); }

  function render(){
    const list = load();
    tbody.innerHTML = '';
    list.forEach(a=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${a.id}</td><td>${a.patient}</td><td>${a.doctor}</td><td>${a.datetime}</td><td>${a.status}</td>`;
      tbody.appendChild(tr);
    });
  }

  function isSlotAvailable(doctor, datetime){
    const list = load();
    return !list.some(a=> a.doctor===doctor && a.datetime===datetime);
  }

  form.addEventListener('submit', e=>{
    e.preventDefault();
    const patient = document.getElementById('ap-name').value.trim();
    const doctor = doctorSel.value;
    const datetime = document.getElementById('ap-datetime').value;
    if(!isSlotAvailable(doctor, datetime)){ alert('Selected slot is busy. Choose another.'); return; }
    const appt = { id:'APPT_'+Math.random().toString(36).slice(2,8).toUpperCase(), patient, doctor, datetime, status:'CONFIRMED' };
    const list = load(); list.unshift(appt); save(list);
    // create bill entry (simple)
    const bills = JSON.parse(localStorage.getItem('pc_bills')||'[]');
    bills.push({ id:'BILL_'+Math.random().toString(36).slice(2,7).toUpperCase(), patient, doctor, date:datetime, amount:500, status:'Unpaid' });
    localStorage.setItem('pc_bills', JSON.stringify(bills));
    render(); showToast('Appointment booked — bill generated.');
    form.reset();
  });

  // reminder checker: plays sound and shows Notification if within 1 hour
  setInterval(()=>{
    const now = Date.now();
    load().forEach(a=>{
      const t = Date.parse(a.datetime);
      if(!t) return;
      const diff = t - now;
      if(diff > 0 && diff <= 60*60*1000 && !a._reminded){
        // show
        try{
          if(Notification && Notification.permission === 'granted'){ new Notification('Appointment Reminder', { body:`${a.patient} — ${a.doctor} at ${a.datetime}` }); }
          else if(Notification && Notification.permission !== 'denied'){ Notification.requestPermission().then(p=>{ if(p==='granted') new Notification('Appointment Reminder', { body:`${a.patient} — ${a.doctor} at ${a.datetime}` }); }); }
        }catch(e){}
        try{ sound.play(); }catch(e){}
        // mark reminded (persist)
        const list = load(); const item = list.find(x=>x.id===a.id); if(item) { item._reminded = true; save(list); }
      }
    });
  }, 30*1000);

  render();
});
