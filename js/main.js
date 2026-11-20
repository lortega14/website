/* ============================================
   CREDIAN — Main Controller
   Navbar scroll, parallax
   ============================================ */

(function() {
  'use strict';

  // ---- Navbar Scroll Effect ----
  const navbar = document.querySelector('.navbar');
  let lastScrollY = 0;
  let ticking = false;

  function updateNavbar() {
    const scrollY = window.scrollY;
    
    navbar.classList.toggle('scrolled', scrollY > 10);

    // Se oculta al bajar y reaparece al subir (nunca con el menú móvil abierto)
    const menuOpen = document.querySelector('.mobile-menu.open');
    const delta = scrollY - lastScrollY;
    if (!menuOpen && scrollY > 320 && delta > 6) {
      navbar.classList.add('is-hidden');
    } else if (delta < -6 || scrollY <= 320 || menuOpen) {
      navbar.classList.remove('is-hidden');
    }
    
    if (Math.abs(delta) > 6) lastScrollY = scrollY;
    ticking = false;
  }

  // Si se navega con teclado dentro del menú, siempre visible
  navbar.addEventListener('focusin', () => navbar.classList.remove('is-hidden'));

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

  // ---- Brand Font Replacer ----
  function wrapBrandName() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    const nodesToReplace = [];
    
    let node;
    while ((node = walker.nextNode())) {
      if (node.parentElement && 
         (node.parentElement.classList.contains('font-brand') || 
          node.parentElement.tagName === 'SCRIPT' || 
          node.parentElement.tagName === 'STYLE' ||
          node.parentElement.tagName === 'TITLE')) {
        continue;
      }
      
      if (node.nodeValue.includes('CREDIAN')) {
        nodesToReplace.push(node);
      }
    }
    
    nodesToReplace.forEach(textNode => {
      const parts = textNode.nodeValue.split('CREDIAN');
      if (parts.length > 1) {
        const spanFragment = document.createDocumentFragment();
        parts.forEach((part, i) => {
          if (part.length > 0) {
            spanFragment.appendChild(document.createTextNode(part));
          }
          if (i < parts.length - 1) {
            const brandSpan = document.createElement('span');
            brandSpan.className = 'font-brand';
            brandSpan.textContent = 'CREDIAN';
            spanFragment.appendChild(brandSpan);
          }
        });
        textNode.parentNode.replaceChild(spanFragment, textNode);
      }
    });
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wrapBrandName);
  } else {
    wrapBrandName();
  }

})();
