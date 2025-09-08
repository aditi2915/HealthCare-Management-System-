// reports.js - create PDF and export XLSX of report history
document.addEventListener('DOMContentLoaded', ()=>{
  const form = document.getElementById('rep-form');
  const tableBody = document.querySelector('#reports-table tbody');
  function load(){ return JSON.parse(localStorage.getItem('pc_reports')||'[]'); }
  function save(list){ localStorage.setItem('pc_reports', JSON.stringify(list)); }
  function render(){
    const rows = load();
    tableBody.innerHTML = rows.map((r,i)=>`<tr><td>${r.id}</td><td>${r.patient}</td><td>${r.doctor}</td><td>${r.date}</td><td><button class="btn btn-outline pdf-btn" data-i="${i}">PDF</button></td></tr>`).join('');
  }
  form.addEventListener('submit', e=>{
    e.preventDefault();
    const rep = { id:'RPT_'+Math.random().toString(36).slice(2,8).toUpperCase(), patient:document.getElementById('rep-patient').value, doctor:document.getElementById('rep-doctor').value, notes:document.getElementById('rep-notes').value, date:new Date().toLocaleString() };
    const arr = load(); arr.unshift(rep); save(arr); render(); form.reset(); showToast('Report saved');
  });
  tableBody.addEventListener('click', (e)=>{
    if(e.target.classList.contains('pdf-btn')){
      const idx = e.target.dataset.i; const r = load()[idx];
      if(!r) return;
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      doc.setFontSize(14); doc.text('PulseCare Report', 14, 20);
      doc.setFontSize(11); doc.text(`Report ID: ${r.id}`, 14, 30); doc.text(`Patient: ${r.patient}`, 14, 38); doc.text(`Doctor: ${r.doctor}`, 14, 46);
      doc.text(`Date: ${r.date}`, 14, 54); doc.text('Notes:', 14, 64); doc.text(r.notes||'-', 14, 74, { maxWidth: 180 });
      doc.save(`${r.id}.pdf`);
    }
  });
  document.getElementById('export-reports-xlsx').addEventListener('click', ()=>{
    const arr = load();
    const ws = XLSX.utils.json_to_sheet(arr);
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Reports'); XLSX.writeFile(wb, 'reports_history.xlsx');
  });

  render();
});
