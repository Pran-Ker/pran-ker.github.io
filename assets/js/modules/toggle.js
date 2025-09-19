// Mobile navigation toggle functionality
function ready() {
  const navToggle = document.getElementById('nav-active');
  const navUnderlay = document.querySelector('.nav-underlay');
  const navMenu = document.querySelector('.nav__options');
  
  if (!navToggle || !navUnderlay) return;
  
  // Close nav when clicking on underlay
  navUnderlay.addEventListener('click', () => {
    navToggle.checked = false;
  });
  
  // Close nav when clicking on nav links (mobile)
  if (navMenu) {
    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navToggle.checked = false;
      });
    });
  }
  
  // Handle escape key to close nav
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navToggle.checked) {
      navToggle.checked = false;
    }
  });
  
  // Prevent scrolling when nav is open
  navToggle.addEventListener('change', () => {
    if (navToggle.checked) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  });
}

export { ready };