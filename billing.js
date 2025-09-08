document.addEventListener('DOMContentLoaded', () => {
  const billingInfo = document.getElementById('billing-info');
  billingInfo.innerHTML = `
    <p>Patient: John Doe</p>
    <p>Doctor Fee: $100</p>
    <p>Medicines Cost: $50</p>
    <p>Total Bill: $150</p>
  `;
});
