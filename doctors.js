const ITEMS_PER_PAGE = 10;
let currentPage = 1;

const first = ["Aarav","Liam","Noah","Oliver","Elijah","James","William","Benjamin","Lucas","Henry","Mason","Ethan","Logan","Alexander","Jacob","Michael","Daniel","Mateo","Owen","Wyatt","Jack","Luke","Jayden","Isaac","Levi","Sebastian","David","Joseph","Samuel","Carter","Ryan","Dylan","Nathan","Caleb","Hunter","Christian","Thomas","Andrew","Joshua","Nicholas","Julian","Leo","Hudson","Grayson","Ezra","Colton","Aaron","Adam","Aiden","Alan"];
const last = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez","Hernandez","Lopez","Gonzalez","Wilson","Anderson","Thomas","Taylor","Moore","Jackson","Martin","Lee","Perez","Thompson","White","Harris","Sanchez","Clark","Ramirez","Lewis","Robinson","Walker","Young","Allen","King","Wright","Scott","Torres","Nguyen","Hill"];
const specialties = ["General Medicine","Cardiology","Dermatology","Pediatrics","Orthopedics","ENT","Neurology","Gastroenterology","Gynecology","Psychiatry","Endocrinology","Pulmonology","Ophthalmology","Nephrology","Oncology","Urology","Rheumatology","Emergency Medicine","Family Medicine","Infectious Diseases"];
const countries = ["India","USA","UK","Canada","Germany","Japan","Australia","UAE","Spain","Italy","China","Nigeria","Brazil","France","Mexico","Egypt","Kenya","South Africa","Singapore","Sweden"];
const hospitals = ["City Medical Center","Central Hospital","St Marys Hospital","Global Health Clinic","Sunrise Medical","Royal Hospital","MetroCare","Unity Health","Hope Medical Center","Advance Med Clinic","CureWell Hospital","New Horizon Hospital","Pioneer Health","Lifecare Institute","Valley Health","Harbor Medical","Fortis Clinic","Apollo Medical","General Hospital","Mayo Medical"];

function generateSlotsForNextDays(days){
  const res = [];
  const now = new Date();
  for (let d = 0; d < days; d++) {
    const date = new Date(now);
    date.setDate(now.getDate() + d);
    for (let h = 9; h < 17; h++) {
      for (let m = 0; m < 60; m += 30) {
        const s = new Date(date);
        s.setHours(h, m, 0, 0);
        const status = (Math.random() < 0.25) ? 'busy' : 'available';
        res.push({ time: s.toISOString().slice(0,16), status });
      }
    }
  }
  return res;
}

const doctors = [];
for (let i = 0; i < 2000; i++) {
  const f = first[i % first.length];
  const l = last[(i * 7) % last.length];
  const specialty = specialties[i % specialties.length];
  const country = countries[i % countries.length];
  const hospital = hospitals[i % hospitals.length];
  const id = 'DR_' + String(100000 + i);
  const email = `${f.toLowerCase()}.${l.toLowerCase()}${i}@pulsecare.org`;
  const phone = `+91-${900000000 + (i % 1000000)}`.slice(0, 14);
  const experience = 3 + (i % 35);
  const bio = `Dr. ${f} ${l} is an experienced ${specialty} specialist at ${hospital}, ${country}.`;
  const slots = generateSlotsForNextDays(5);

  doctors.push({ id, name: `Dr. ${f} ${l}`, specialty, country, hospital, experience: `${experience} yrs`, email, phone, bio, slots });
}

window.doctors = doctors;

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('doctors-grid');
  const search = document.getElementById('doc-search');
  const filterSpec = document.getElementById('doc-filter-specialty');
  const pagination = document.getElementById('pagination');

  const uniqSpecs = [...new Set(doctors.map(d => d.specialty))].sort();
  uniqSpecs.forEach(s => filterSpec.insertAdjacentHTML('beforeend', `<option value="${s}">${s}</option>`));

  let filteredDoctors = [...doctors];

  function renderList(list) {
    grid.innerHTML = '';

    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const pageItems = list.slice(start, end);

    pageItems.forEach(doc => {
      const card = document.createElement('div');
      card.className = 'doctor-card';
      card.innerHTML = `
        <h3>${doc.name}</h3>
        <p class="muted">${doc.specialty} • ${doc.experience}</p>
        <p><i class="fa-solid fa-hospital"></i> ${doc.hospital}</p>
        <div style="display:flex;gap:.5rem;margin-top:.6rem">
          <button class="btn btn-outline view-doctor" data-id="${doc.id}">View</button>
          <button class="btn btn-red book-now" data-id="${doc.id}">Book</button>
        </div>
      `;
      grid.appendChild(card);
    });

    pagination.innerText = `Page ${currentPage} of ${Math.ceil(list.length / ITEMS_PER_PAGE)}`;
  }

  function applyFilters() {
    const q = (search.value || '').toLowerCase();
    const fs = filterSpec.value;
    filteredDoctors = doctors.filter(d => {
      const matchesQ = !q || d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q) || d.hospital.toLowerCase().includes(q);
      const matchesS = !fs || d.specialty === fs;
      return matchesQ && matchesS;
    });
    currentPage = 1;
    renderList(filteredDoctors);
  }

  search.addEventListener('input', applyFilters);
  filterSpec.addEventListener('change', applyFilters);

  document.getElementById('nextPage').addEventListener('click', () => {
    if (currentPage < Math.ceil(filteredDoctors.length / ITEMS_PER_PAGE)) {
      currentPage++;
      renderList(filteredDoctors);
    }
  });

  document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderList(filteredDoctors);
    }
  });

  grid.addEventListener('click', (e) => {
    const btnView = e.target.closest('.view-doctor');
    if (btnView) {
      const id = btnView.dataset.id;
      const doc = doctors.find(d => d.id === id);
      if (!doc) return alert('Doctor not found');

      const slotsByDay = {};
      (doc.slots || []).forEach((s, idx) => {
        const date = s.time.slice(0,10);
        slotsByDay[date] = slotsByDay[date] || [];
        slotsByDay[date].push({ ...s, idx });
      });

      const html = [];
      html.push(`<h2>${doc.name}</h2><p><strong>${doc.specialty}</strong> • ${doc.experience}</p><p>${doc.hospital} — ${doc.country}</p><p>Email: <a href="mailto:${doc.email}">${doc.email}</a> | Phone: <a href="tel:${doc.phone}">${doc.phone}</a></p><p>${doc.bio}</p><hr>`);
      html.push(`<h3>Slots (click to book)</h3>`);
      for (const day of Object.keys(slotsByDay).slice(0,6)) {
        html.push(`<div style="margin-bottom:.5rem"><strong>${day}</strong><div style="display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.3rem">`);
        slotsByDay[day].forEach(s => {
          html.push(`<button class="btn btn-outline slot-btn" data-doc="${doc.id}" data-time="${s.time}" data-slot-index="${s.idx}" ${s.status !== 'available' ? 'disabled' : ''}>${s.time.slice(11)}</button>`);
        });
        html.push(`</div></div>`);
      }

      document.getElementById('view-modal-body').innerHTML = html.join('');
      document.getElementById('viewModal').style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }

    const slotBtn = e.target.closest('.slot-btn');
    if (slotBtn) {
      const docId = slotBtn.dataset.doc;
      const time = slotBtn.dataset.time;
      const slotIdx = parseInt(slotBtn.dataset.slotIndex);

      const doc = doctors.find(d => d.id === docId);
      if (!doc) return;

      const slotObj = doc.slots[slotIdx];
      if (!slotObj || slotObj.status !== 'available') {
        showToast('Slot no longer available');
        return;
      }

      const session = JSON.parse(localStorage.getItem('pc_session') || 'null');
      const patient = session?.name || session?.user || prompt('Enter patient name') || 'Guest';

      const appts = JSON.parse(localStorage.getItem('pc_appointments') || '[]');
      const apptObj = {
        id: 'APPT_' + Math.random().toString(36).slice(2,8).toUpperCase(),
        patient,
        doctor: doc.name,
        doctorId: doc.id,
        datetime: time,
        status: 'CONFIRMED'
      };

      appts.unshift(apptObj);
      localStorage.setItem('pc_appointments', JSON.stringify(appts));

      slotObj.status = 'busy';
      localStorage.setItem('pc_doctors', JSON.stringify(doctors));

      showToast('Slot booked successfully');

      // Disable the booked slot immediately in UI
      document.querySelector(`.slot-btn[data-doc="${docId}"][data-slot-index="${slotIdx}"]`).disabled = true;
    }
  });

  document.querySelector('#viewModal .modal-close').addEventListener('click', () => {
    document.getElementById('viewModal').style.display = 'none';
    document.body.style.overflow = '';
  });

  document.getElementById('viewModal').addEventListener('click', e => {
    if (e.target.id === 'viewModal') {
      document.getElementById('viewModal').style.display = 'none';
      document.body.style.overflow = '';
    }
  });

  renderList(filteredDoctors);
});                     