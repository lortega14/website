/* ============================================
   CREDIAN — Navigation Controller
   Hamburger menu & page transitions
   ============================================ */

(function() {
  'use strict';

  // ---- DOM Elements ----
  const navbar = document.querySelector('.navbar');
  const hamburger = document.querySelector('.navbar__hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-menu__link');
  const transitionOverlay = document.querySelector('.page-transition-overlay');

  // ---- Hamburger Toggle ----
  if (hamburger && mobileMenu) {
    // Mantiene sincronizados los estados visuales y los atributos ARIA
    const setMenu = (open) => {
      hamburger.classList.toggle('active', open);
      mobileMenu.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', String(open));
      hamburger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      mobileMenu.setAttribute('aria-hidden', String(!open));
      document.body.style.overflow = open ? 'hidden' : '';
    };

    hamburger.addEventListener('click', () => {
      setMenu(!mobileMenu.classList.contains('open'));
    });

    // Close on link click
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => setMenu(false));
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        setMenu(false);
        hamburger.focus();
      }
    });
  }

  // ---- Page Transitions ----
  // Eliminadas: la navegación entre páginas es inmediata.
  if (transitionOverlay) transitionOverlay.remove();

  // ---- Mark Active Navigation Link ----
  function setActiveNav() {
    const path = window.location.pathname;
    // Extract the directory name: "/nosotros/" → "nosotros", "/" → ""
    const segments = path.replace(/\/+$/, '').split('/');
    const currentSection = segments.pop() || '';
    const navLinks = document.querySelectorAll('.navbar__link');
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      // Extract section from href: "nosotros/", "../nosotros/", "./" → compare
      const hrefSection = href.replace(/^\.\.\//, '').replace(/^\.\//, '').replace(/\/+$/, '').replace(/index\.html$/, '') || '';
      if (hrefSection === currentSection || 
          (currentSection === '' && (href === './' || href === '../' || href === '/' || href === 'index.html'))) {
        link.classList.add('active');
      }
    });

    // Also for mobile
    mobileLinks.forEach(link => {
      const href = link.getAttribute('href');
      const hrefSection = href.replace(/^\.\.\//, '').replace(/^\.\//, '').replace(/\/+$/, '').replace(/index\.html$/, '') || '';
      if (hrefSection === currentSection || 
          (currentSection === '' && (href === './' || href === '../' || href === '/' || href === 'index.html'))) {
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  setActiveNav();

})();
