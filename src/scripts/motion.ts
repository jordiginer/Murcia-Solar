const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const precisePointer = matchMedia('(hover: hover) and (pointer: fine)');
const root = document.documentElement;
const cursor = document.querySelector<HTMLElement>('.site-cursor');
const cursorLabel = cursor?.querySelector('span');
const panorama = document.querySelector<HTMLElement>('[data-parallax]');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      if (reducedMotion.matches) continue;
      entry.target.classList.add('is-revealed');
    }
  }, { threshold: 0.12 });

  document.querySelectorAll('[data-reveal]').forEach(element => {
    if (element.getBoundingClientRect().top >= innerHeight * 0.88) observer.observe(element);
    else element.classList.add('is-revealed');
  });
}

let scrollFrame = 0;
function updateScroll() {
  scrollFrame = 0;
  if (reducedMotion.matches) return;
  const range = root.scrollHeight - innerHeight;
  const progress = range > 0 ? Math.min(1, Math.max(0, scrollY / range)) : 0;
  root.style.setProperty('--reading-progress', String(progress));
  if (!panorama) return;

  const bounds = panorama.getBoundingClientRect();
  if (bounds.bottom <= 0 || bounds.top >= innerHeight) return;
  const center = (bounds.top + bounds.height / 2) / innerHeight;
  const offset = Math.max(-22, Math.min(22, (0.5 - center) * 44));
  panorama.style.setProperty('--panorama-offset', offset.toFixed(2) + 'px');
}

function scheduleScroll() {
  if (!scrollFrame && !reducedMotion.matches) scrollFrame = requestAnimationFrame(updateScroll);
}

window.addEventListener('scroll', scheduleScroll, { passive: true });
window.addEventListener('resize', scheduleScroll);
scheduleScroll();

let pointerFrame = 0;
let pointerX = 0;
let pointerY = 0;
let currentX = 0;
let currentY = 0;

function resetCursor() {
  root.classList.remove('has-site-cursor');
  if (pointerFrame) cancelAnimationFrame(pointerFrame);
  pointerFrame = 0;
}

function drawCursor() {
  pointerFrame = 0;
  if (!cursor) return;
  currentX += (pointerX - currentX) * 0.46;
  currentY += (pointerY - currentY) * 0.46;
  cursor.style.translate = currentX + 'px ' + currentY + 'px';
  if (Math.abs(pointerX - currentX) + Math.abs(pointerY - currentY) > 0.35) {
    pointerFrame = requestAnimationFrame(drawCursor);
  }
}

document.addEventListener('pointermove', event => {
  if (!cursor || !precisePointer.matches || reducedMotion.matches || event.pointerType !== 'mouse') {
    resetCursor();
    return;
  }
  const target = event.target;
  if (!(target instanceof Element) || target.closest('input, textarea, select, label, [contenteditable], dialog') || document.querySelector('dialog[open]')) {
    resetCursor();
    return;
  }

  const interactive = target.closest('a[href], button, summary');
  const overPhoto = Boolean(interactive?.matches('[data-photo]'));
  cursor.dataset.mode = overPhoto ? 'photo' : interactive ? 'link' : 'default';
  if (cursorLabel) cursorLabel.textContent = overPhoto ? 'Ampliar' : '';
  pointerX = event.clientX;
  pointerY = event.clientY;

  if (!root.classList.contains('has-site-cursor')) {
    currentX = pointerX;
    currentY = pointerY;
    drawCursor();
    root.classList.add('has-site-cursor');
  }
  if (!pointerFrame) pointerFrame = requestAnimationFrame(drawCursor);
}, { passive: true });

document.addEventListener('pointerdown', event => {
  if (event.target instanceof Element && event.target.closest('[data-photo]')) resetCursor();
});
document.documentElement.addEventListener('pointerleave', resetCursor);
window.addEventListener('blur', resetCursor);
window.addEventListener('keydown', resetCursor);
precisePointer.addEventListener('change', resetCursor);
reducedMotion.addEventListener('change', () => {
  resetCursor();
  if (reducedMotion.matches) {
    panorama?.style.removeProperty('--panorama-offset');
  } else {
    scheduleScroll();
  }
});
