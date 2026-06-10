// Showcase carousel affordances (dots, edge fade, card count) and the
// homepage scroll cue. All elements are optional; bails quietly if absent.

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function initCue() {
  const cue = document.querySelector('.scroll-cue');
  if (!cue) return;

  const hide = () => document.documentElement.classList.add('is-scrolled');
  if (window.scrollY > 4) {
    hide();
    return;
  }
  window.addEventListener('scroll', hide, { once: true, passive: true });
}

function initTrack() {
  const track = document.querySelector('.showcase-track');
  if (!track) return;

  const clip = track.closest('.showcase-clip');
  const dots = document.querySelector('.showcase-dots');
  const count = document.querySelector('.showcase-rule__count');
  const cards = Array.from(track.children);

  if (count) count.textContent = String(cards.length).padStart(2, '0');
  if (!dots || cards.length === 0) return;

  const buttons = cards.map((card, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', `Go to project ${i + 1}`);
    button.addEventListener('click', () => {
      track.scrollTo({
        left: card.offsetLeft,
        behavior: reducedMotion.matches ? 'auto' : 'smooth',
      });
    });
    dots.appendChild(button);
    return button;
  });

  const update = () => {
    const overflow = track.scrollWidth - track.clientWidth;
    const scrollable = overflow > 1;

    dots.classList.toggle('is-visible', scrollable);
    if (clip) {
      clip.classList.toggle('has-more', scrollable && track.scrollLeft < overflow - 8);
    }

    let active = 0;
    let min = Infinity;
    cards.forEach((card, i) => {
      const distance = Math.abs(card.offsetLeft - track.scrollLeft);
      if (distance < min) {
        min = distance;
        active = i;
      }
    });
    if (scrollable && track.scrollLeft >= overflow - 2) active = cards.length - 1;

    buttons.forEach((button, i) => button.classList.toggle('is-active', i === active));
  };

  track.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
}

export function ready() {
  initCue();
  initTrack();
}
