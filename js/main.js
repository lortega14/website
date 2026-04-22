/* ============================================
   CREDIAN — Main Controller
   Navbar scroll, parallax, custom cursor
   ============================================ */

(function() {
  'use strict';

  // ---- Navbar Scroll Effect ----
  const navbar = document.querySelector('.navbar');
  let lastScrollY = 0;
  let ticking = false;

  function updateNavbar() {
    const scrollY = window.scrollY;
    
    if (scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    
    lastScrollY = scrollY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  }, { passive: true });

  // ---- Parallax Effect ----
  const parallaxBg = document.querySelector('.hero__bg[data-parallax]');
  const parallaxElements = document.querySelectorAll('[data-parallax-speed]');

  if (parallaxBg || parallaxElements.length > 0) {
    window.addEventListener('scroll', () => {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;

        if (parallaxBg && scrollY < window.innerHeight) {
          parallaxBg.style.transform = `translateY(${scrollY * 0.35}px)`;
        }

        parallaxElements.forEach(el => {
          const speed = parseFloat(el.getAttribute('data-parallax-speed')) || 0.1;
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            const offset = (window.innerHeight - rect.top) * speed;
            el.style.transform = `translateY(${offset}px)`;
          }
        });
      });
    }, { passive: true });
  }

  // ---- Custom Cursor ----
  const cursor = document.querySelector('.custom-cursor');
  
  if (cursor && window.matchMedia('(pointer: fine)').matches) {
    let cursorX = 0, cursorY = 0;
    let currentX = 0, currentY = 0;

    document.addEventListener('mousemove', (e) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
    });

    function updateCursor() {
      currentX += (cursorX - currentX) * 0.15;
      currentY += (cursorY - currentY) * 0.15;
      cursor.style.left = currentX + 'px';
      cursor.style.top = currentY + 'px';
      requestAnimationFrame(updateCursor);
    }
    
    updateCursor();

    // Enlarge on interactive elements
    const interactives = document.querySelectorAll('a, button, .card, input, textarea, select, .accordion-trigger');
    
    interactives.forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('active'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
    });
  }

  // ---- Smooth Scroll for Anchor Links ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ---- Lazy Image Loading ----
  const lazyImages = document.querySelectorAll('img[data-src]');
  
  if (lazyImages.length > 0 && 'IntersectionObserver' in window) {
    const imgObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.getAttribute('data-src');
          img.removeAttribute('data-src');
          imgObserver.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });

    lazyImages.forEach(img => imgObserver.observe(img));
  }

  // ---- Year in footer ----
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

})();
