/* ============================================
   CREDIAN — Chatbot Asistente Virtual Global
   Integrado con preguntas precargadas y Gemini 3.5 Flash Lite (con memoria contextual)
   ============================================ */
(function () {
  'use strict';

  // ============================================
  // CONFIGURACIÓN DE GEMINI AI (OPCIONAL)
  // Coloca tu API Key de Google Gemini gratuita aquí.
  // Obtén tu API Key gratis en: https://aistudio.google.com/
  // ============================================
  const GEMINI_API_KEY = typeof atob === 'function' ? atob("QVEuQWI4Uk42SjN3NF9MZ2RWdHctazB0ZmhRQ3psdERXQ2Y0dFVkenhnMnJxRk5aclZpRFE=") : "";
  const GEMINI_MODEL = "gemini-3.5-flash-lite";

  // ---- Base de Conocimiento de CREDIAN ----
  const CREDIAN_SYSTEM_CONTEXT = `
Eres el Asistente Virtual inteligente y oficial de CREDIAN (Financiera RECREA S.A. de C.V. SOFOM E.N.R.).
Tu ÚNICA función es resolver dudas y brindar información EXCLUSIVAMENTE sobre CREDIAN, sus créditos de nómina, servicios, requisitos, tasas, plazos, convenios y formas de contacto.

REGLAS ESTRICTAS DE RESPUESTA Y SEGURIDAD:
1. Responde de forma amable, cercana, concisa, clara, profesional y en español de México.
2. Mantén la MEMORIA Y CONTEXTO de la conversación actual. Si el usuario te hace preguntas de seguimiento como "¿puedes explicármelo?", "¿qué necesito?", "¿y cuánto cobran?", responde refiriéndote a lo que se estaba hablando anteriormente en la conversación.
3. NUNCA respondas preguntas sobre temas ajenos a CREDIAN (por ejemplo: deportes, política, recetas de cocina, programación, tareas escolares, chistes, o cualquier consulta no relacionada con la financiera).
4. Si el usuario realiza una pregunta fuera de tema o no relacionada con CREDIAN (ej. "¿qué hora es?"), responde amablemente lo siguiente:
   "Lo siento, como asistente virtual de CREDIAN solo puedo responder preguntas relacionadas con nuestros créditos de nómina, requisitos y servicios financieros. ¿Tienes alguna duda sobre tus trámites o crédito con CREDIAN?"
5. REGLA SOBRE EL COTIZADOR Y SOLICITUDES:
   - El Cotizador en línea (cotizador.credian.mx) es un acceso de uso exclusivo para empresas asociadas y ejecutivos de arrendamiento que cuentan con usuario y contraseña. NUNCA lo recomiendes a clientes particulares o trabajadores que buscan un crédito de nómina.
   - Para solicitar o tramitar un crédito de nómina, remite al portal oficial de solicitudes de nómina (https://cib.logicsystems.com.mx/RECREA/LoginCredian.aspx?EMP=RECREA) o a platicar directamente con un asesor (+52 444 962 5037).

DATOS OFICIALES DE CREDIAN:
- Empresa: Financiera RECREA S.A. de C.V. SOFOM E.N.R. (CREDIAN)
- Especialidad: Créditos de nómina para trabajadores del sector industrial, corporativo y PyMEs en México.
- Experiencia: Más de 10 años en el mercado financiero.
- Ventajas principales: Sin aval, evaluación y respuesta en 48 horas, sin trámites interminables.
- Tasas de interés: Desde 14.9% hasta 24.9% anual (dependiendo del perfil, monto y plazo).
- Pagos anticipados: Se pueden realizar pagos anticipados o liquidar el crédito antes de tiempo sin ninguna penalización ni recargo.
- Descuento de nómina: Se descuenta automáticamente vía nómina por convenio con la empresa empleadora. Nunca excede el 30% del salario neto.
- Requisitos principales: Identificación oficial vigente (INE o pasaporte), comprobante de domicilio (<3 meses), últimos 3 recibos de nómina y estados de cuenta bancarios (últimos 3 meses). Proceso 100% digital.
- Historial crediticio / Buró: Se consulta Buró de crédito, pero no es determinante único. Se evalúa capacidad de pago y estabilidad laboral.
- Renovación: Posible tras pagar al menos el 50% del crédito actual.
- Pérdida de empleo: En caso de despido involuntario, ofrecemos alternativas de reestructuración para adaptar la forma de pago.
- Contacto: Teléfono +52 444 962 5037, Correo: contacto@credian.mx / une@credian.mx, Dirección: Cordillera Himalaya No. 830, Col. Lomas 4ta Sección, San Luis Potosí, S.L.P.
  `;

  // ---- FAQ Local Knowledge Base ----
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
      answer: 'El proceso de evaluación y dispersión se realiza en un plazo de 48 horas desde que recibimos tu documentación completa. Una vez aprobado tu crédito, el dinero se deposita directamente a tu cuenta bancaria.'
    },
    {
      id: 4, category: 'general',
      question: '¿Cuál es la tasa de interés?',
      shortLabel: 'Tasa de interés',
      keywords: ['tasa', 'interes', 'porcentaje', 'cat', 'costo', 'anual'],
      answer: 'Nuestras tasas van desde el 14.9% hasta el 24.9% anual, dependiendo del plan elegido, monto solicitado, plazo y tu perfil crediticio. Un asesor puede darte una propuesta personalizada sin compromiso.'
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
      answer: 'En caso de pérdida involuntaria de empleo, nos ponemos en contacto contigo para ofrecerte opciones de reestructuración de tu crédito y adaptar la forma de pago mientras consigues un nuevo empleo.'
    },
    {
      id: 10, category: 'proceso',
      question: '¿Puedo renovar mi crédito?',
      shortLabel: 'Renovación de crédito',
      keywords: ['renovar', 'renovacion', 'nuevo', 'otro', 'recredito', 'volver'],
      answer: 'Sí, una vez que hayas pagado al menos el 50% de tu crédito actual, puedes solicitar una renovación. En muchos casos, los clientes recurrentes obtienen mejores tasas de interés y condiciones preferenciales por su buen historial de pago.'
    }
  ];

  // ---- Inyección Automática de HTML en cualquier página ----
  function injectChatbotHTML() {
    if (document.getElementById('chatbot-toggle')) return;

    const chatbotHTML = `
      <button class="chatbot-toggle" id="chatbot-toggle" aria-label="Abrir asistente virtual">
        <svg class="icon-chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <svg class="icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        <span class="chatbot-badge">1</span>
      </button>
      <div class="chatbot-window" id="chatbot-window">
        <div class="chatbot-header">
          <div class="chatbot-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div class="chatbot-header-info">
            <h4>Asistente CREDIAN</h4>
            <p>Respuestas al instante</p>
          </div>
        </div>
        <div class="chatbot-messages" id="chatbot-messages"></div>
        <div class="chatbot-input-area">
          <input type="text" class="chatbot-input" id="chatbot-input" placeholder="Escribe tu pregunta..." aria-label="Escribe tu pregunta">
          <button class="chatbot-send" id="chatbot-send" aria-label="Enviar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', chatbotHTML);
  }

  function getContactoUrl() {
    const pathname = window.location.pathname;
    if (pathname.endsWith('/') && !pathname.endsWith('/website/') && pathname !== '/') {
      return '../contacto/';
    }
    if (pathname.includes('/contacto/') || pathname.includes('/convenios/') || pathname.includes('/dudas/') || pathname.includes('/nosotros/') || pathname.includes('/productos/')) {
      return '../contacto/';
    }
    return 'contacto/';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbot);
  } else {
    initChatbot();
  }

  function initChatbot() {
    injectChatbotHTML();

    const toggleBtn = document.getElementById('chatbot-toggle');
    const chatWindow = document.getElementById('chatbot-window');
    const messagesEl = document.getElementById('chatbot-messages');
    const inputEl = document.getElementById('chatbot-input');
    const sendBtn = document.getElementById('chatbot-send');
    if (!toggleBtn || !chatWindow) return;

    let isOpen = false;
    let hasGreeted = false;
    let conversationHistory = []; // Array para guardar la memoria contextual de la conversación

    // ---- Helpers ----
    function scrollToBottom() {
      requestAnimationFrame(function () {
        messagesEl.scrollTop = messagesEl.scrollHeight;
      });
    }

    function renderFormattedMessage(el, text) {
      // Escapar HTML básico
      let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      // Convertir **negrita** a <strong>
      html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

      // Convertir enlaces [texto](url) a <a href="url" target="_blank">
      html = html.replace(/\[([^\]]+)\]\((https?:[^\s\)]+)\)/g, function(match, label, url) {
        return '<a href="' + url + '" target="_blank" rel="noopener" style="color:var(--color-blue); text-decoration:underline; font-weight:600;">' + label + '</a>';
      });

      // Convertir saltos de línea
      html = html.replace(/\n/g, '<br>');

      el.innerHTML = html;
    }

    function addMessage(text, type, options) {
      options = options || {};
      const div = document.createElement('div');
      div.className = 'chat-msg chat-msg--' + type;

      if (type === 'bot') {
        renderFormattedMessage(div, text);
      } else {
        div.textContent = text;
      }

      messagesEl.appendChild(div);
      scrollToBottom();

      // Guardar en la memoria contextual si no es un mensaje UI del sistema
      if (!options.skipHistory) {
        const isUI = text.includes("¿Puedo ayudarte con algo más?") || 
                     text.includes("Selecciona un tema") || 
                     text.includes("Estas son las preguntas frecuentes");
        if (!isUI) {
          conversationHistory.push({
            role: type === 'user' ? 'user' : 'model',
            parts: [{ text: text }]
          });
          // Mantener los últimos 12 mensajes en memoria para no exceder tokens
          if (conversationHistory.length > 12) {
            conversationHistory = conversationHistory.slice(-12);
          }
        }
      }
    }

    function addTyping() {
      const div = document.createElement('div');
      div.className = 'chat-typing';
      div.id = 'chat-typing';
      div.innerHTML = '<span></span><span></span><span></span>';
      messagesEl.appendChild(div);
      scrollToBottom();
    }

    function removeTyping() {
      const el = document.getElementById('chat-typing');
      if (el) el.remove();
    }

    function showChips(items) {
      const wrapper = document.createElement('div');
      wrapper.className = 'chat-chips';
      items.forEach(function (item) {
        const chip = document.createElement('button');
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
      const allChips = messagesEl.querySelectorAll('.chat-chips');
      allChips.forEach(function (group) {
        group.querySelectorAll('.chat-chip').forEach(function (c) {
          c.disabled = true;
          c.style.opacity = '0.5';
          c.style.pointerEvents = 'none';
        });
      });
    }

    // ---- Bienvenida ----
    function greet() {
      if (hasGreeted) return;
      hasGreeted = true;
      addTyping();
      setTimeout(function () {
        removeTyping();
        addMessage('¡Hola! 👋 Soy el asistente virtual de CREDIAN. Estoy aquí para resolver tus dudas sobre nuestros créditos de nómina.', 'bot', { skipHistory: true });
        setTimeout(function () {
          addMessage('Selecciona un tema o escribe cualquier duda:', 'bot', { skipHistory: true });
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
      const filtered = category === 'all' ? faqs : faqs.filter(function (f) { return f.category === category; });
      const items = filtered.map(function (f) {
        return { label: f.shortLabel, action: 'question', value: f.id };
      });
      items.push({ label: '← Volver a temas', action: 'back', value: null });
      showChips(items);
    }

    // ---- Manejo de Clics en Chips ----
    function handleChipClick(item) {
      disableOldChips();
      if (item.action === 'category') {
        const catNames = { general: 'General', requisitos: 'Requisitos', pagos: 'Pagos', proceso: 'Proceso', all: 'Todas las preguntas' };
        addMessage(catNames[item.value], 'user');
        addTyping();
        setTimeout(function () {
          removeTyping();
          addMessage('Estas son las preguntas frecuentes de esa sección. ¿Cuál te interesa?', 'bot', { skipHistory: true });
          setTimeout(function () { showQuestionChips(item.value); }, 300);
        }, 500);
      } else if (item.action === 'question') {
        const faq = faqs.find(function (f) { return f.id === item.value; });
        if (faq) {
          addMessage(faq.shortLabel, 'user');
          respondWithFaq(faq);
        }
      } else if (item.action === 'back') {
        addMessage('Volver a temas', 'user');
        addTyping();
        setTimeout(function () {
          removeTyping();
          addMessage('¡Claro! Selecciona un tema:', 'bot', { skipHistory: true });
          setTimeout(function () { showCategoryChips(); }, 300);
        }, 400);
      } else if (item.action === 'more') {
        addMessage('Otra pregunta', 'user');
        addTyping();
        setTimeout(function () {
          removeTyping();
          addMessage('¡Con gusto! Selecciona un tema o escribe tu pregunta:', 'bot', { skipHistory: true });
          setTimeout(function () { showCategoryChips(); }, 300);
        }, 400);
      } else if (item.action === 'contact') {
        addMessage('Hablar con asesor', 'user');
        addTyping();
        setTimeout(function () {
          removeTyping();
          addMessage('Te redirijo a nuestra página de contacto para atenderte personalmente. 😊', 'bot', { skipHistory: true });
          setTimeout(function () {
            window.location.href = getContactoUrl();
          }, 1200);
        }, 500);
      }
    }

    function respondWithFaq(faq) {
      addTyping();
      const delay = Math.min(800 + faq.answer.length * 3, 1800);
      setTimeout(function () {
        removeTyping();
        addMessage(faq.answer, 'bot');
        setTimeout(function () {
          addMessage('¿Puedo ayudarte con algo más?', 'bot', { skipHistory: true });
          setTimeout(function () {
            showChips([
              { label: '🔄 Otra pregunta', action: 'more', value: null },
              { label: '👤 Hablar con asesor', action: 'contact', value: null }
            ]);
          }, 300);
        }, 600);
      }, delay);
    }

    // ---- Búsqueda Local por Palabras Clave ----
    function normalize(str) {
      return str.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, '')
        .trim();
    }

    function findBestMatch(input) {
      const normalizedInput = normalize(input);
      const words = normalizedInput.split(/\s+/);
      let best = null;
      let bestScore = 0;

      faqs.forEach(function (faq) {
        let score = 0;
        faq.keywords.forEach(function (kw) {
          if (normalizedInput.indexOf(kw) !== -1) score += 3;
        });
        const normalizedQ = normalize(faq.question);
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

    // ---- Consulta a Gemini AI con memoria de conversación ----
    async function queryGeminiAI() {
      if (!GEMINI_API_KEY || GEMINI_API_KEY.trim() === "") {
        return null;
      }

      // Preparar el historial de conversación asegurando que empiece con un mensaje de 'user'
      let historyPayload = conversationHistory.slice(-10);
      while (historyPayload.length > 0 && historyPayload[0].role !== 'user') {
        historyPayload.shift();
      }

      if (historyPayload.length === 0) return null;

      const modelsToTry = Array.from(new Set([
        GEMINI_MODEL,
        "gemini-3.5-flash-lite",
        "gemini-3.5-flash",
        "gemini-2.5-flash-lite",
        "gemini-2.0-flash-lite",
        "gemini-flash-lite-latest"
      ].filter(Boolean)));

      const payload = {
        systemInstruction: {
          parts: [{ text: CREDIAN_SYSTEM_CONTEXT }]
        },
        contents: historyPayload,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 350
        }
      };

      for (const model of modelsToTry) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY.trim()}`;
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (response.ok) {
            const data = await response.json();
            const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (textResponse) return textResponse.trim();
          } else {
            console.warn(`Gemini API Error con modelo ${model}:`, response.status);
          }
        } catch (err) {
          console.warn(`Error de conexión con modelo ${model}:`, err);
        }
      }

      return null;
    }

    // ---- Entrada del Usuario ----
    async function handleUserInput() {
      const text = inputEl.value.trim();
      if (!text) return;
      inputEl.value = '';
      disableOldChips();
      addMessage(text, 'user');
      addTyping();

      // 1. Si es una pregunta de seguimiento conversacional (ej. "no me queda claro", "explicamelo", "que significa"), llamar directamente a Gemini con el historial
      const isFollowUp = text.length > 3 && (
        text.includes("claro") || text.includes("explica") || text.includes("significa") || 
        text.includes("por que") || text.includes("como") || text.includes("detalle") ||
        text.includes("otra") || text.includes("mas") || conversationHistory.length > 2
      );

      if (!isFollowUp) {
        const localMatch = findBestMatch(text);
        if (localMatch) {
          removeTyping();
          respondWithFaq(localMatch);
          return;
        }
      }

      // 2. Consultar a Gemini AI pasando todo el historial contextual
      if (GEMINI_API_KEY && GEMINI_API_KEY.trim() !== "") {
        const aiResponse = await queryGeminiAI();
        removeTyping();
        if (aiResponse) {
          addMessage(aiResponse, 'bot');
          setTimeout(function () {
            addMessage('¿Puedo ayudarte con algo más?', 'bot', { skipHistory: true });
            setTimeout(function () {
              showChips([
                { label: '🔄 Otra pregunta', action: 'more', value: null },
                { label: '👤 Hablar con asesor', action: 'contact', value: null }
              ]);
            }, 300);
          }, 600);
          return;
        }
      }

      // 3. Fallback en caso de no tener respuesta
      removeTyping();
      addMessage('No encontré una respuesta exacta para tu consulta. Te sugiero explorar nuestras preguntas frecuentes o platicar con un asesor:', 'bot', { skipHistory: true });
      setTimeout(function () {
        showChips([
          { label: '📝 Ver todas las preguntas', action: 'category', value: 'all' },
          { label: '👤 Hablar con asesor', action: 'contact', value: null }
        ]);
      }, 300);
    }

    // ---- Eventos ----
    toggleBtn.addEventListener('click', function () {
      isOpen = !isOpen;
      toggleBtn.classList.toggle('active', isOpen);
      chatWindow.classList.toggle('open', isOpen);
      if (isOpen) {
        greet();
        setTimeout(function () { inputEl.focus(); }, 400);
      }
    });

    sendBtn.addEventListener('click', handleUserInput);
    inputEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') handleUserInput();
    });
  }
})();
