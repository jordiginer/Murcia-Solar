const menu = document.querySelector('#toggle');
const navigation = document.querySelector('#navigation');
const mobile = matchMedia('(max-width: 740px)');
const setMenu = (open) => {
  menu.setAttribute('aria-expanded', String(open));
  navigation.hidden = mobile.matches && !open;
};
document.documentElement.classList.add('js');
setMenu(false);
mobile.addEventListener('change', () => setMenu(false));
menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
navigation.addEventListener('click', (event) => {
  if (mobile.matches && event.target.closest('a')) setMenu(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menu.focus();
  }
});

const form = document.querySelector('#quote-form');
form.hidden = false;
const service = document.querySelector('#service');
const status = document.querySelector('#feedback');
const nextStep = document.querySelector('#next-step');
const preparedLink = document.querySelector('#prepared-link');
const clearPreview = () => {
  status.hidden = true;
  nextStep.hidden = true;
  preparedLink.href = 'https://wa.me/34635570836';
};
form.addEventListener('input', (event) => {
  event.target.setCustomValidity('');
  clearPreview();
});
document.querySelectorAll('[data-service]').forEach((link) => {
  link.addEventListener('click', () => {
    service.value = link.dataset.service;
    clearPreview();
  });
});
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const fields = new FormData(form);
  const name = fields.get('name').trim();
  const town = fields.get('town').trim();
  const details = fields.get('details').trim();
  if (!name || !town) {
    const field = form.elements.namedItem(!name ? 'name' : 'town');
    field.setCustomValidity('Introduce un valor válido.');
    field.reportValidity();
    return;
  }
  const message = [
    `Hola, soy ${name}, de ${town}.`,
    `Me interesa recibir información sobre ${fields.get('service').toLowerCase()}.`,
    details,
  ].filter(Boolean).join('\n');
  preparedLink.href = `https://wa.me/34635570836?text=${encodeURIComponent(message)}`;
  status.textContent = 'Mensaje preparado. Revísalo en WhatsApp antes de enviarlo.';
  status.hidden = false;
  nextStep.hidden = false;
  status.focus();
});
