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
  const internalLinks = document.querySelectorAll('a[data-internal]');

  // ---- Hamburger Toggle ----
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });

    // Close on link click
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  // ---- Page Transitions ----
  function navigateTo(url) {
    if (!transitionOverlay) {
      window.location.href = url;
      return;
    }

    transitionOverlay.classList.remove('active-leave');
    transitionOverlay.classList.add('active-enter');

    setTimeout(() => {
      window.location.href = url;
    }, 350);
  }

  // Attach to internal links
  internalLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      // Don't transition for same page or anchors
      if (href === '#' || href.startsWith('#') || href === window.location.pathname) return;
      
      e.preventDefault();
      navigateTo(href);
    });
  });

  // On page load: reverse the transition
  window.addEventListener('load', () => {
    if (transitionOverlay) {
      transitionOverlay.classList.add('active-leave');
      setTimeout(() => {
        transitionOverlay.classList.remove('active-enter', 'active-leave');
      }, 400);
    }
  });

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
        link.style.color = '#3AAA6E';
      }
    });
  }

  setActiveNav();

})();
