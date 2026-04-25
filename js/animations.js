/* ============================================
   CREDIAN — Animations Controller
   Intersection Observer, counters, accordions
   ============================================ */

(function () {
  'use strict';

  // ---- Intersection Observer for Scroll Reveal ----
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .timeline-item');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          // Don't unobserve — keeps the animation visible
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -60px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback: show everything
    revealElements.forEach(el => el.classList.add('revealed'));
  }

  // ---- Animated Counters ----
  const counters = document.querySelectorAll('[data-counter]');

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-counter'), 10);
    const duration = 2000;
    const start = 0;
    const startTime = performance.now();
    const suffix = el.getAttribute('data-suffix') || '';
    const prefix = el.getAttribute('data-prefix') || '';

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (target - start) * eased);

      el.textContent = prefix + current.toLocaleString('es-MX') + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = prefix + target.toLocaleString('es-MX') + suffix;
      }
    }

    requestAnimationFrame(update);
  }

  if (counters.length > 0 && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => counterObserver.observe(el));
  }

  // ---- Steps Line Animation ----
  const stepsLine = document.querySelector('.steps-line');
  if (stepsLine && 'IntersectionObserver' in window) {
    const lineObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          stepsLine.classList.add('animate');
          lineObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    lineObserver.observe(stepsLine);
  }

  // ---- Timeline Line Animation ----
  const timelineLine = document.querySelector('.timeline-line');
  if (timelineLine && 'IntersectionObserver' in window) {
    const tlObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          timelineLine.classList.add('animate');
          tlObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    tlObserver.observe(timelineLine);
  }

  // ---- Accordion ----
  const accordionItems = document.querySelectorAll('.accordion-item');

  accordionItems.forEach(item => {
    const trigger = item.querySelector('.accordion-trigger');
    if (!trigger) return;

    trigger.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all
      accordionItems.forEach(i => {
        i.classList.remove('active');
        const content = i.querySelector('.accordion-content');
        if (content) content.style.maxHeight = null;
      });

      // Open clicked (if wasn't already open)
      if (!isActive) {
        item.classList.add('active');
        const content = item.querySelector('.accordion-content');
        if (content) {
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      }
    });

    // Keyboard accessibility
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        trigger.click();
      }
    });
  });

  // ---- FAQ Search/Filter ----
  const faqSearch = document.getElementById('faq-search');
  const faqCategories = document.querySelectorAll('[data-faq-category]');
  const faqItems = document.querySelectorAll('.faq-item');

  if (faqSearch) {
    faqSearch.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();

      faqItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(query) ? '' : 'none';
      });
    });
  }

  if (faqCategories.length > 0) {
    faqCategories.forEach(btn => {
      btn.addEventListener('click', () => {
        const category = btn.getAttribute('data-faq-category');

        // Toggle active state
        faqCategories.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        faqItems.forEach(item => {
          if (category === 'all') {
            item.style.display = '';
          } else {
            item.style.display = item.getAttribute('data-category') === category ? '' : 'none';
          }
        });
      });
    });
  }

  // ---- Contact Form — Backend URL ----
  // Cambia esta URL al dominio de Vercel después del despliegue
  // LOCAL: http://localhost:3000/api/contact
  // PRODUCCIÓN: Cambia esta URL al dominio que te dé Vercel después del despliegue
  const CONTACT_API_URL = 'https://credian-backend-rqvo.vercel.app/api/contact';

  const contactForm = document.getElementById('contact-form');

  if (contactForm) {
    const inputs = contactForm.querySelectorAll('.form-input, .form-textarea, .form-select');

    inputs.forEach(input => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        if (input.classList.contains('error')) {
          validateField(input);
        }
      });
    });

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      let valid = true;

      inputs.forEach(input => {
        if (!validateField(input)) valid = false;
      });

      if (valid) {
        const btn = contactForm.querySelector('.btn');
        const originalText = btn.innerHTML;

        // --- Loading state ---
        btn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="animation:spin 1s linear infinite">
            <circle cx="12" cy="12" r="10" stroke-dasharray="31.4 31.4" />
          </svg>
          Enviando...
        `;
        btn.style.pointerEvents = 'none';
        btn.style.opacity = '0.85';

        try {
          const res = await fetch(CONTACT_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nombre: document.getElementById('nombre').value,
              email: document.getElementById('email').value,
              telefono: document.getElementById('telefono').value,
              asunto: document.getElementById('asunto').value,
              mensaje: document.getElementById('mensaje').value,
            }),
          });

          const data = await res.json();

          if (res.ok && data.success) {
            // --- Success state ---
            btn.innerHTML = `
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              ¡Mensaje enviado!
            `;
            btn.style.background = 'var(--color-green)';
            btn.style.opacity = '1';

            setTimeout(() => {
              btn.innerHTML = originalText;
              btn.style.background = '';
              btn.style.pointerEvents = '';
              btn.style.opacity = '';
              contactForm.reset();
              inputs.forEach(i => i.classList.remove('error', 'success'));
            }, 4000);
          } else {
            // --- Server validation error ---
            const errorMsg = data.errors ? data.errors.join('. ') : 'Error al enviar el mensaje.';
            btn.innerHTML = `
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              ${errorMsg}
            `;
            btn.style.background = '#e74c3c';
            btn.style.opacity = '1';

            setTimeout(() => {
              btn.innerHTML = originalText;
              btn.style.background = '';
              btn.style.pointerEvents = '';
              btn.style.opacity = '';
            }, 4000);
          }
        } catch (err) {
          // --- Network error ---
          console.error('Contact form error:', err);
          btn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Error de conexión. Intenta de nuevo.
          `;
          btn.style.background = '#e74c3c';
          btn.style.opacity = '1';

          setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
            btn.style.pointerEvents = '';
            btn.style.opacity = '';
          }, 4000);
        }
      }
    });
  }

  function validateField(input) {
    const value = input.value.trim();
    const type = input.type;
    const errorEl = input.parentElement.querySelector('.form-error');
    let valid = true;

    if (input.hasAttribute('required') && !value) {
      valid = false;
      if (errorEl) errorEl.textContent = 'Este campo es obligatorio';
    } else if (type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      valid = false;
      if (errorEl) errorEl.textContent = 'Ingresa un email válido';
    } else if (type === 'tel' && value && !/^[\d\s\-\+\(\)]{8,15}$/.test(value)) {
      valid = false;
      if (errorEl) errorEl.textContent = 'Ingresa un teléfono válido';
    }

    if (valid) {
      input.classList.remove('error');
      input.classList.add('success');
      if (errorEl) errorEl.style.display = 'none';
    } else {
      input.classList.add('error');
      input.classList.remove('success');
      if (errorEl) errorEl.style.display = 'block';
    }

    return valid;
  }

})();
