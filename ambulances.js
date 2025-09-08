const ambulances = (() => {
  const types = ["Basic Life Support", "Advanced Life Support", "Patient Transport", "Neonatal", "ICU"];
  const locations = ["Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata", "Hyderabad"];
  
  const out = [];
  for (let i = 0; i < 200; i++) {
    const type = types[i % types.length];
    const loc = locations[i % locations.length];
    const available = i % 4 !== 0;
    out.push({
      id: "AMB_" + (1000 + i),
      name: `Ambulance ${1000 + i}`,
      type,
      driver: `Driver ${i + 1}`,
      contact: "+91 9" + (100000000 + i),
      location: loc,
      available
    });
  }
  return out;
})();

let currentPage = 1;
const perPage = 20;

function renderAmbulances() {
  const list = document.getElementById("ambulance-list");
  list.innerHTML = "";

  const start = (currentPage - 1) * perPage;
  const end = start + perPage;
  const pageAmbs = ambulances.slice(start, end);

  pageAmbs.forEach(amb => {
    const card = document.createElement("div");
    card.className = "doctor-card"; 
    card.innerHTML = `
      <h3>${amb.name}</h3>
      <p>${amb.type} — ${amb.location}</p>
      <p>Driver: ${amb.driver}</p>
      <span class="dot ${amb.available ? "green" : "red"}"></span>
      ${amb.available ? "Available" : "Busy"}
      <br><button class="btn btn-red view-amb-btn" data-id="${amb.id}">View</button>
    `;
    list.appendChild(card);
  });

  document.getElementById("pageInfo").innerText = `Page ${currentPage} of ${Math.ceil(ambulances.length / perPage)}`;
}

document.getElementById("prevPage").onclick = () => {
  if (currentPage > 1) {
    currentPage--;
    renderAmbulances();
  }
};
document.getElementById("nextPage").onclick = () => {
  if (currentPage < ambulances.length / perPage) {
    currentPage++;
    renderAmbulances();
  }
};

const ambModal = document.getElementById("ambulanceModal");
const closeAmbModal = document.getElementById("closeAmbModal");

document.addEventListener("click", e => {
  if (e.target.classList.contains("view-amb-btn")) {
    const id = e.target.dataset.id;
    const amb = ambulances.find(a => a.id === id);
    if (amb) openAmbModal(amb);
  }
});

closeAmbModal.onclick = () => (ambModal.style.display = "none");
window.onclick = e => {
  if (e.target === ambModal) ambModal.style.display = "none";
};

function openAmbModal(amb) {
  document.getElementById("modalAmbName").innerText = amb.name;
  document.getElementById("modalAmbType").innerText = amb.type;
  document.getElementById("modalAmbDriver").innerText = amb.driver;
  document.getElementById("modalAmbContact").innerText = amb.contact;
  document.getElementById("modalAmbLocation").innerText = amb.location;

  const dates = ["Today", "Tomorrow", "Day After"];
  const times = ["9:00 AM", "12:00 PM", "3:00 PM", "6:00 PM"];
  const dateDiv = document.getElementById("ambSlotDates");
  const timeDiv = document.getElementById("ambSlotTimes");

  dateDiv.innerHTML = "";
  timeDiv.innerHTML = "";

  dates.forEach((d, idx) => {
    const btn = document.createElement("button");
    btn.className = "btn btn-outline slot-date-btn";
    btn.innerText = d;
    btn.onclick = () => {
      timeDiv.innerHTML = "";
      times.forEach(t => {
        const tBtn = document.createElement("button");
        tBtn.className = "btn btn-red slot-btn";
        tBtn.innerText = `${d} — ${t}`;
        tBtn.onclick = () => {
          const session = JSON.parse(localStorage.getItem('pc_session') || 'null');
          const patient = session?.name || session?.user || prompt('Enter patient name') || 'Guest';
          const appts = JSON.parse(localStorage.getItem('pc_appointments') || '[]');
          const appt = {
            id: 'APPT_' + Math.random().toString(36).slice(2,8).toUpperCase(),
            patient,
            ambulance: amb.name,
            ambulanceId: amb.id,
            datetime: `${d} at ${t}`,
            status: 'CONFIRMED'
          };
          appts.unshift(appt);
          localStorage.setItem('pc_appointments', JSON.stringify(appts));
          showToast(`Booked ambulance slot: ${d} at ${t}`);
          ambModal.style.display = "none";
          document.body.style.overflow = "";
        };
        timeDiv.appendChild(tBtn);
      });
    };
    dateDiv.appendChild(btn);
    if (idx === 0) btn.click();
  });

  ambModal.style.display = "block";
}

renderAmbulances();
window.ambulances = ambulances;
