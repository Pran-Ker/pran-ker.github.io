function ready() {
  const navToggle = document.getElementById('nav-active');
  const navUnderlay = document.querySelector('.nav-underlay');
  const navMenu = document.querySelector('.nav__options');
  if (!navToggle || !navUnderlay) return;

  const closeNav = () => { navToggle.checked = false; };
  navUnderlay.addEventListener('click', closeNav);
  navMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeNav));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navToggle.checked) closeNav();
  });

  // lock scroll while open
  navToggle.addEventListener('change', () => {
    document.body.style.overflow = navToggle.checked ? 'hidden' : '';
  });
}

export { ready };
