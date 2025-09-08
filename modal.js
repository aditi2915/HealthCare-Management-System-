// modal.js - generic modal open/close used by modules
document.addEventListener('DOMContentLoaded', () => {
  const viewModal = document.getElementById('viewModal');
  if(!viewModal) return;
  const closeBtn = viewModal.querySelector('.modal-close');
  closeBtn?.addEventListener('click', ()=> { viewModal.style.display='none'; document.body.style.overflow=''; });
  viewModal.addEventListener('click', (e)=> { if(e.target === viewModal){ viewModal.style.display='none'; document.body.style.overflow=''; } });
  // modules will inject HTML into #view-modal-body and set viewModal.style.display='flex';
});
