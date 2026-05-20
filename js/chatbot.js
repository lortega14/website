/* ============================================
   CREDIAN — Chatbot Asistente Virtual
   FAQ-based conversational widget
   ============================================ */
(function () {
  'use strict';

  // ---- FAQ Knowledge Base ----
  const faqs = [
    {
      id: 1, category: 'general',
      question: '¿Qué es un crédito de nómina?',
      shortLabel: 'Crédito de nómina',
      keywords: ['credito', 'nomina', 'que es', 'prestamo', 'personal'],
      answer: 'Un crédito de nómina es un préstamo personal que se descuenta directamente de tu salario quincenal o mensual. Al estar respaldado por tu nómina, ofrece tasas de interés más bajas que otros tipos de crédito personal, ya que el riesgo para la institución financiera es menor.'
    },
    {
      id: 2, category: 'requisitos',
      question: '¿Necesito tener buen historial crediticio?',
      shortLabel: 'Historial crediticio',
      keywords: ['historial', 'crediticio', 'buro', 'credito', 'buró', 'score'],
      answer: 'Consultamos el buró de crédito como parte de nuestro análisis, pero no es el único factor determinante. Evaluamos tu capacidad de pago basándonos en tu ingreso neto, antigüedad laboral y estabilidad en el empleo. Incluso personas con historial crediticio limitado pueden ser aprobadas.'
    },
    {
      id: 3, category: 'proceso',
      question: '¿Cuánto tiempo tarda la aprobación?',
      shortLabel: 'Tiempo de aprobación',
      keywords: ['tiempo', 'tarda', 'aprobacion', 'rapido', 'cuanto', 'demora', 'dias', 'horas'],
      answer: 'El proceso de evaluación tarda un máximo de 24 horas hábiles desde que recibimos tu documentación completa. Una vez aprobado, la dispersión del dinero se realiza en 24 a 48 horas adicionales directamente a tu cuenta bancaria.'
    },
    {
      id: 4, category: 'general',
      question: '¿Cuál es la tasa de interés?',
      shortLabel: 'Tasa de interés',
      keywords: ['tasa', 'interes', 'porcentaje', 'cat', 'costo', 'anual'],
      answer: 'Nuestras tasas van desde el 14.9% hasta el 24.9% anual, dependiendo del plan elegido, monto solicitado, plazo y tu perfil crediticio. Utiliza nuestro cotizador en línea para obtener una estimación personalizada de tu tasa.'
    },
    {
      id: 5, category: 'pagos',
      question: '¿Puedo liquidar mi crédito antes del plazo?',
      shortLabel: 'Liquidación anticipada',
      keywords: ['liquidar', 'anticipado', 'antes', 'plazo', 'adelantar', 'pagar', 'terminar'],
      answer: 'Sí, puedes realizar pagos anticipados o liquidar tu crédito en cualquier momento sin penalización alguna. Al hacerlo, solo pagarás los intereses generados hasta la fecha de liquidación, lo que te genera un ahorro significativo.'
    },
    {
      id: 6, category: 'requisitos',
      question: '¿Qué documentos necesito para solicitar?',
      shortLabel: 'Documentos necesarios',
      keywords: ['documentos', 'requisitos', 'necesito', 'papeles', 'ine', 'identificacion', 'comprobante'],
      answer: 'Necesitas: identificación oficial vigente (INE o pasaporte), comprobante de domicilio no mayor a 3 meses, últimos 3 recibos de nómina y estados de cuenta bancarios de los últimos 3 meses. Todo puede enviarse en formato digital.'
    },
    {
      id: 7, category: 'pagos',
      question: '¿Cómo se descuenta de mi nómina?',
      shortLabel: 'Descuento de nómina',
      keywords: ['descuento', 'descuenta', 'nomina', 'pago', 'automatico', 'quincena', 'salario'],
      answer: 'El pago se descuenta automáticamente de tu nómina a través de un convenio con tu empresa empleadora. El monto de la cuota nunca excederá el 30% de tu salario neto, garantizando que mantengas una capacidad financiera saludable.'
    },
    {
      id: 8, category: 'proceso',
      question: '¿Puedo solicitar en línea o debo ir a una sucursal?',
      shortLabel: 'Solicitud en línea',
      keywords: ['linea', 'online', 'sucursal', 'internet', 'presencial', 'oficina', 'solicitar'],
      answer: 'Todo el proceso es 100% en línea. Desde la solicitud, envío de documentos, hasta la firma del contrato. No necesitas visitar ninguna sucursal. Tu asesor te acompañará por teléfono, WhatsApp o videollamada.'
    },
    {
      id: 9, category: 'general',
      question: '¿Qué pasa si pierdo mi empleo?',
      shortLabel: 'Pérdida de empleo',
      keywords: ['pierdo', 'empleo', 'trabajo', 'despido', 'desempleo', 'perder'],
      answer: 'En caso de pérdida involuntaria de empleo, si cuentas con el plan Premium, el seguro de desempleo cubre hasta 3 mensualidades. Para los demás planes, podemos reestructurar tu crédito y cambiar la forma de pago a domiciliación bancaria mientras consigues un nuevo empleo.'
    },
    {
      id: 10, category: 'proceso',
      question: '¿Puedo renovar mi crédito?',
      shortLabel: 'Renovación de crédito',
      keywords: ['renovar', 'renovacion', 'nuevo', 'otro', 'recredito', 'volver'],
      answer: 'Sí, una vez que hayas pagado al menos el 50% de tu crédito actual, puedes solicitar una renovación. En muchos casos, los clientes recurrentes obtienen mejores tasas de interés y condiciones preferenciales por su buen historial de pago.'
    }
  ];

  // ---- DOM Elements ----
  const toggleBtn = document.getElementById('chatbot-toggle');
  const chatWindow = document.getElementById('chatbot-window');
  const messagesEl = document.getElementById('chatbot-messages');
  const inputEl = document.getElementById('chatbot-input');
  const sendBtn = document.getElementById('chatbot-send');
  if (!toggleBtn || !chatWindow) return;

  let isOpen = false;
  let hasGreeted = false;

  // ---- Helpers ----
  function scrollToBottom() {
    requestAnimationFrame(function () {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    });
  }

  function addMessage(text, type) {
    var div = document.createElement('div');
    div.className = 'chat-msg chat-msg--' + type;
    div.textContent = text;
    messagesEl.appendChild(div);
    scrollToBottom();
  }

  function addTyping() {
    var div = document.createElement('div');
    div.className = 'chat-typing';
    div.id = 'chat-typing';
    div.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(div);
    scrollToBottom();
  }

  function removeTyping() {
    var el = document.getElementById('chat-typing');
    if (el) el.remove();
  }

  function showChips(items) {
    var wrapper = document.createElement('div');
    wrapper.className = 'chat-chips';
    items.forEach(function (item) {
      var chip = document.createElement('button');
      chip.className = 'chat-chip';
      chip.textContent = item.label;
      chip.addEventListener('click', function () {
        handleChipClick(item);
      });
      wrapper.appendChild(chip);
    });
    messagesEl.appendChild(wrapper);
    scrollToBottom();
  }

  function disableOldChips() {
    var allChips = messagesEl.querySelectorAll('.chat-chips');
    allChips.forEach(function (group) {
      group.querySelectorAll('.chat-chip').forEach(function (c) {
        c.disabled = true;
        c.style.opacity = '0.5';
        c.style.pointerEvents = 'none';
      });
    });
  }

  // ---- Greeting ----
  function greet() {
    if (hasGreeted) return;
    hasGreeted = true;
    addTyping();
    setTimeout(function () {
      removeTyping();
      addMessage('¡Hola! 👋 Soy el asistente virtual de CREDIAN. Estoy aquí para resolver tus dudas sobre créditos de nómina.', 'bot');
      setTimeout(function () {
        addMessage('Selecciona un tema o escribe tu pregunta:', 'bot');
        setTimeout(function () {
          showCategoryChips();
        }, 300);
      }, 600);
    }, 800);
  }

  function showCategoryChips() {
    showChips([
      { label: '📋 General', action: 'category', value: 'general' },
      { label: '📄 Requisitos', action: 'category', value: 'requisitos' },
      { label: '💳 Pagos', action: 'category', value: 'pagos' },
      { label: '⚙️ Proceso', action: 'category', value: 'proceso' },
      { label: '📝 Ver todas', action: 'category', value: 'all' }
    ]);
  }

  function showQuestionChips(category) {
    var filtered = category === 'all' ? faqs : faqs.filter(function (f) { return f.category === category; });
    var items = filtered.map(function (f) {
      return { label: f.shortLabel, action: 'question', value: f.id };
    });
    items.push({ label: '← Volver a temas', action: 'back', value: null });
    showChips(items);
  }

  // ---- Chip Click Handler ----
  function handleChipClick(item) {
    disableOldChips();
    if (item.action === 'category') {
      var catNames = { general: 'General', requisitos: 'Requisitos', pagos: 'Pagos', proceso: 'Proceso', all: 'Todas las preguntas' };
      addMessage(catNames[item.value], 'user');
      addTyping();
      setTimeout(function () {
        removeTyping();
        addMessage('Estas son las preguntas de esa categoría. ¿Cuál te interesa?', 'bot');
        setTimeout(function () { showQuestionChips(item.value); }, 300);
      }, 500);
    } else if (item.action === 'question') {
      var faq = faqs.find(function (f) { return f.id === item.value; });
      if (faq) {
        addMessage(faq.shortLabel, 'user');
        respondWithFaq(faq);
      }
    } else if (item.action === 'back') {
      addMessage('Volver a temas', 'user');
      addTyping();
      setTimeout(function () {
        removeTyping();
        addMessage('¡Claro! Selecciona un tema:', 'bot');
        setTimeout(function () { showCategoryChips(); }, 300);
      }, 400);
    } else if (item.action === 'more') {
      addMessage('Otra pregunta', 'user');
      addTyping();
      setTimeout(function () {
        removeTyping();
        addMessage('¡Con gusto! Selecciona un tema o escribe tu pregunta:', 'bot');
        setTimeout(function () { showCategoryChips(); }, 300);
      }, 400);
    } else if (item.action === 'contact') {
      addMessage('Hablar con asesor', 'user');
      addTyping();
      setTimeout(function () {
        removeTyping();
        addMessage('Te redirijo a nuestra página de contacto para que un asesor te atienda personalmente. 😊', 'bot');
        setTimeout(function () {
          window.location.href = '../contacto/';
        }, 1200);
      }, 500);
    }
  }

  function respondWithFaq(faq) {
    addTyping();
    var delay = Math.min(800 + faq.answer.length * 3, 1800);
    setTimeout(function () {
      removeTyping();
      addMessage(faq.answer, 'bot');
      setTimeout(function () {
        addMessage('¿Puedo ayudarte con algo más?', 'bot');
        setTimeout(function () {
          showChips([
            { label: '🔄 Otra pregunta', action: 'more', value: null },
            { label: '👤 Hablar con asesor', action: 'contact', value: null }
          ]);
        }, 300);
      }, 600);
    }, delay);
  }

  // ---- Free Text Search ----
  function normalize(str) {
    return str.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .trim();
  }

  function findBestMatch(input) {
    var normalizedInput = normalize(input);
    var words = normalizedInput.split(/\s+/);
    var best = null;
    var bestScore = 0;

    faqs.forEach(function (faq) {
      var score = 0;
      // Check keywords
      faq.keywords.forEach(function (kw) {
        if (normalizedInput.indexOf(kw) !== -1) score += 3;
      });
      // Check individual words against question text
      var normalizedQ = normalize(faq.question);
      words.forEach(function (w) {
        if (w.length > 2 && normalizedQ.indexOf(w) !== -1) score += 1;
      });
      if (score > bestScore) {
        bestScore = score;
        best = faq;
      }
    });
    return bestScore >= 2 ? best : null;
  }

  function handleUserInput() {
    var text = inputEl.value.trim();
    if (!text) return;
    inputEl.value = '';
    disableOldChips();
    addMessage(text, 'user');

    var match = findBestMatch(text);
    if (match) {
      respondWithFaq(match);
    } else {
      addTyping();
      setTimeout(function () {
        removeTyping();
        addMessage('No encontré una respuesta exacta a tu pregunta. Te sugiero explorar estos temas o contactar a un asesor:', 'bot');
        setTimeout(function () {
          showChips([
            { label: '📝 Ver todas las preguntas', action: 'category', value: 'all' },
            { label: '👤 Hablar con asesor', action: 'contact', value: null }
          ]);
        }, 300);
      }, 700);
    }
  }

  // ---- Toggle ----
  toggleBtn.addEventListener('click', function () {
    isOpen = !isOpen;
    toggleBtn.classList.toggle('active', isOpen);
    chatWindow.classList.toggle('open', isOpen);
    if (isOpen) {
      greet();
      setTimeout(function () { inputEl.focus(); }, 400);
    }
  });

  // ---- Input Events ----
  sendBtn.addEventListener('click', handleUserInput);
  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') handleUserInput();
  });

})();
