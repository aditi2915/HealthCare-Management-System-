// medicines.js - generate 3000 medicines (lightweight generator)
(function(){
  const base = [
    "Paracetamol","Ibuprofen","Amoxicillin","Azithromycin","Ciprofloxacin","Metformin","Atorvastatin","Amlodipine",
    "Omeprazole","Levothyroxine","Simvastatin","Cefixime","Doxycycline","Ceftriaxone","Losartan","Salbutamol",
    "Ranitidine","Cetirizine","Clopidogrel","Pantoprazole","Prednisolone","Fluconazole","Metronidazole","Tramadol",
    "Gabapentin","Sertraline","Fluoxetine","Warfarin","Aspirin","Furosemide","Spironolactone"
  ];
  const forms = ["Tablet","Capsule","Syrup","Injection","Inhaler","Drop","Ointment"];
  const strengths = ["50mg","100mg","250mg","500mg","5mg","10mg","20mg","2mg/ml"];
  const makers = ["PulsePharma","MediCore","GlobalCure","LifeWell","PharmaTech","HealthFirst","BioGenix","Sun Pharma","Cipla","Pfizer","Novartis","Sanofi","GSK","AstraZeneca"];
  const categories = ["Antibiotic","Analgesic","Antipyretic","Antiviral","Diabetes","Cardiac","Respiratory","Dermatology","Gastro","Antidepressant"];

  const total = 3000;
  const meds = [];
  for(let i=0;i<total;i++){
    const b = base[i % base.length];
    const form = forms[i % forms.length];
    const strength = strengths[i % strengths.length];
    const maker = makers[i % makers.length];
    const cat = categories[i % categories.length];
    const name = `${b} ${strength} ${form}`;
    const price = (20 + (i % 480)) + ' INR';
    meds.push({ id:'MED_'+(100000+i), name, form, strength, manufacturer: maker, category: cat, price, description: `${name} by ${maker}.` });
  }

  // render
  document.addEventListener('DOMContentLoaded', ()=>{
    const list = document.getElementById('med-list');
    const search = document.getElementById('med-search');
    const filter = document.getElementById('med-filter-cat');
    // populate categories
    const uniqCats = [...new Set(meds.map(m=>m.category))];
    uniqCats.forEach(c=> filter.insertAdjacentHTML('beforeend', `<option value="${c}">${c}</option>`));
    function render(arr){
      list.innerHTML = '';
      arr.slice(0,500).forEach(m=>{
        const card = document.createElement('div'); card.className='card';
        card.innerHTML = `<h3>${m.name}</h3><p class="muted">${m.manufacturer} • ${m.category}</p><p><strong>${m.price}</strong></p><div style="margin-top:.4rem"><button class="btn btn-outline view-med" data-id="${m.id}">View</button></div>`;
        list.appendChild(card);
      });
    }
    render(meds);

    search.addEventListener('input', ()=>{
      const q = search.value.toLowerCase();
      const cat = filter.value;
      const filtered = meds.filter(m => (!q || m.name.toLowerCase().includes(q) || m.manufacturer.toLowerCase().includes(q)) && (!cat || m.category===cat));
      render(filtered);
    });
    filter.addEventListener('change', ()=> search.dispatchEvent(new Event('input')));

    // view modal
    list.addEventListener('click', (e)=>{
      const btn = e.target.closest('.view-med');
      if(!btn) return;
      const id = btn.dataset.id;
      const med = meds.find(x=>x.id===id);
      if(!med) return;
      const viewBody = document.getElementById('view-modal-body');
      viewBody.innerHTML = `<h2>${med.name}</h2><p><strong>Manufacturer:</strong> ${med.manufacturer}</p><p><strong>Category:</strong> ${med.category}</p><p><strong>Price:</strong> ${med.price}</p><p>${med.description}</p>`;
      const mod = document.getElementById('viewModal'); mod.style.display='flex'; document.body.style.overflow='hidden';
    });
    // modal close
    document.querySelector('#viewModal .modal-close')?.addEventListener('click', ()=> { document.getElementById('viewModal').style.display='none'; document.body.style.overflow=''; });
    document.getElementById('viewModal')?.addEventListener('click', e=>{ if(e.target.id==='viewModal'){ e.target.style.display='none'; document.body.style.overflow=''; }});
  });
})();
