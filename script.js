// MODAL DATA
const modalData = {
  'solution-1': {
    title: 'Быстрый разбор',
    content: `
      <p>Бесплатная базовая консультация для понимания проблемы, первичных рисков и того, что с этим делать дальше.</p>
      <h3>Что входит:</h3>
      <ul>
        <li>первичная оценка ситуации;</li>
        <li>понимание срочности и основных рисков;</li>
        <li>ориентир по следующим шагам;</li>
        <li>понимание, какой формат помощи может понадобиться.</li>
      </ul>
      <p style="margin-top: 20px;"><strong>Ориентир:</strong> бесплатно</p>
    `
  },
  'solution-2': {
    title: 'Маршрут и билеты',
    content: `
      <p>Формат для тех, кому важно не ошибиться с транзитом, перелётами, сроками и первыми действиями после прибытия.</p>
      <h3>Что входит:</h3>
      <ul>
        <li>варианты маршрута и транзитных стран;</li>
        <li>помощь с поиском и покупкой билетов;</li>
        <li>контрольные точки перед выездом;</li>
        <li>чек-лист дороги и первых дней.</li>
      </ul>
      <p style="margin-top: 20px;"><strong>Ориентир:</strong> от 30 000 ₽</p>
    `
  },
  'solution-3': {
    title: 'Подготовка истории и материалов',
    content: `
      <p>Помогаем аккуратно структурировать историю, факты и подтверждения для дальнейшей работы с лицензированным юристом в стране подачи.</p>
      <h3>Что входит:</h3>
      <ul>
        <li>хронология событий;</li>
        <li>структура повествования без хаоса;</li>
        <li>карта доказательств и недостающих материалов;</li>
        <li>рекомендации, что передать юристу.</li>
      </ul>
      <p style="margin-top: 20px;"><strong>Ориентир:</strong> от 50 000 ₽</p>
    `
  },
  'solution-4': {
    title: 'Полное сопровождение',
    content: `
      <p>Формат для ситуаций, где нужно вести процесс по этапам: маршрут, билеты, документы, правки и поддержка до выезда.</p>
      <h3>Что входит:</h3>
      <ul>
        <li>персональный план выезда;</li>
        <li>маршрут, транзит, билеты;</li>
        <li>подготовка материалов и чек-листов;</li>
        <li>приоритетная связь по согласованным этапам;</li>
        <li>передача материалов для дальнейшей работы с юристом.</li>
      </ul>
      <p style="margin-top: 20px;"><strong>Ориентир:</strong> от 100 000 ₽</p>
    `
  },
  'scenario-1': {
    title: 'Нужно уехать в ближайшие дни',
    content: `
      <p>Когда сроки сжаты, важно быстро отделить реальные варианты от опасных или бесполезных действий.</p>
      <h3>Что разбираем:</h3>
      <ul>
        <li>сколько дней есть на решение;</li>
        <li>какие документы и маршруты доступны;</li>
        <li>где основные риски;</li>
        <li>что делать в первую очередь.</li>
      </ul>
    `
  },
  'scenario-2': {
    title: 'Едем не одни',
    content: `
      <p>Семейный переезд сложнее: нужно учитывать детей, багаж, жильё, школу, бюджет и стресс всех участников.</p>
      <h3>Что разбираем:</h3>
      <ul>
        <li>маршрут для всех членов семьи;</li>
        <li>первые недели проживания;</li>
        <li>документы и ограничения;</li>
        <li>порядок действий после прибытия.</li>
      </ul>
    `
  },
  'scenario-3': {
    title: 'Рассматриваю убежище',
    content: `
      <p>Здесь особенно важно не импровизировать: нужна хронология, факты, подтверждения и понимание, где подключается юрист.</p>
      <h3>Что разбираем:</h3>
      <ul>
        <li>основные обстоятельства и события;</li>
        <li>какие доказательства есть и чего не хватает;</li>
        <li>структуру материалов;</li>
        <li>следующий шаг с лицензированным юристом.</li>
      </ul>
    `
  },
  'scenario-4': {
    title: 'Хочу сменить страну без хаоса',
    content: `
      <p>Если нет срочного политического кейса, всё равно нужен план: страна, бюджет, легализация, работа и первые недели.</p>
      <h3>Что разбираем:</h3>
      <ul>
        <li>цели переезда и бюджет;</li>
        <li>реалистичные страны;</li>
        <li>маршрут и первичные документы;</li>
        <li>как не потратить деньги на хаотичные решения.</li>
      </ul>
    `
  }
};

const header = document.getElementById('header');

function updateHeader() {
  if (!header) return;
  header.classList.toggle('scrolled', window.scrollY > 16);
}

window.addEventListener('scroll', updateHeader, { passive: true });
window.addEventListener('resize', updateHeader, { passive: true });
updateHeader();

// BURGER MENU
const burger = document.getElementById('burger');
const nav = document.querySelector('.nav');

burger?.addEventListener('click', () => {
  burger.setAttribute('aria-expanded', burger.getAttribute('aria-expanded') === 'false' ? 'true' : 'false');
  nav?.classList.toggle('mobile-open');
});

document.querySelectorAll('.nav a').forEach(link => {
  link.addEventListener('click', () => {
    burger?.setAttribute('aria-expanded', 'false');
    nav?.classList.remove('mobile-open');
  });
});

// MODAL MANAGEMENT
const modal = document.getElementById('modal');
const modalOverlay = document.querySelector('.modal-overlay');
const modalClose = document.querySelector('.modal-close');
const modalBody = document.getElementById('modal-body');

function openModal(dataKey) {
  const data = modalData[dataKey];
  if (!data || !modal || !modalBody) return;
  
  modalBody.innerHTML = `<h2>${data.title}</h2>${data.content}`;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// CLICKABLE CARDS
document.querySelectorAll('[data-modal]').forEach((card) => {
  card.addEventListener('click', (e) => {
    if (e.target.closest('.btn')) return;
    openModal(card.dataset.modal);
  });
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openModal(card.dataset.modal);
    }
  });
});

modalOverlay?.addEventListener('click', closeModal);
modalClose?.addEventListener('click', closeModal);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// FORM HANDLING
const contactForm = document.getElementById('contact-form');
const formSuccess = document.getElementById('form-success');
const promoField = document.getElementById('f-promo');

function escapeHtml(value) {
  return String(value || '-')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function toPlainText(value) {
  return String(value)
    .replace(/<b>/g, '')
    .replace(/<\/b>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

async function sendTelegramLead(message, meta = {}) {
  if (window.location.protocol === 'file:') {
    throw new Error('LOCAL_FILE_MODE');
  }

  const response = await fetch('/.netlify/functions/send-telegram', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message,
      company: meta.company || ''
    })
  });

  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.ok) {
    throw new Error(result?.error || 'Telegram function request failed');
  }

  return result;
}

contactForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const submitButton = contactForm.querySelector('button[type="submit"]');
  const initialButtonText = submitButton?.textContent || 'Отправить заявку';
  const formData = new FormData(contactForm);
  const data = Object.fromEntries(formData);
  const situations = formData.getAll('situation').map((item) => String(item).trim()).filter(Boolean);
  const urgencyMap = {
    critical: 'Критично, несколько дней',
    month: 'До месяца',
    planning: 'Планирую заранее'
  };

  const messenger = String(data.messenger || '').trim();
  const email = String(data.email || '').trim();
  const promo = String(data.promo || '').trim();
  const honeypot = String(data.company || '').trim();

  if (!messenger && !email) {
    const contactInput = document.getElementById('f-msg') || document.getElementById('f-email');
    contactInput?.focus();
    alert('Укажите Telegram или email, чтобы мы могли с вами связаться.');
    return;
  }

  const telegramMessage = [
    '<b>Новая заявка с сайта Safe Route</b>',
    '',
    '<b>Имя:</b> ' + escapeHtml(data.name),
    '<b>Telegram:</b> ' + escapeHtml(messenger),
    '<b>Email:</b> ' + escapeHtml(email),
    '<b>Где сейчас:</b> ' + escapeHtml(data.location),
    '<b>Срочность:</b> ' + escapeHtml(urgencyMap[data.urgency] || data.urgency || '-'),
    '<b>Ситуация:</b> ' + escapeHtml(situations.length ? situations.join(', ') : 'не выбрано'),
    '<b>Промокод:</b> ' + escapeHtml(promo || 'не указан'),
    '',
    '<b>Что нужно решить:</b>',
    escapeHtml(data.message)
  ].join('\n');

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Отправляем...';
  }

  try {
    await sendTelegramLead(telegramMessage, { company: honeypot });

    contactForm.reset();
    contactForm.style.display = 'none';
    if (formSuccess) formSuccess.hidden = false;

    const successText = document.getElementById('form-success-text');
    if (successText) {
      successText.textContent = 'Заявка отправлена. Мы свяжемся с вами по указанному каналу после разбора сообщения.';
    }

    setTimeout(() => {
      formSuccess?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 200);
  } catch (error) {
    console.warn('Telegram send failed:', error);

    const plainMessage = toPlainText(telegramMessage);

    try {
      await navigator.clipboard?.writeText(plainMessage);
    } catch (clipboardError) {
      console.warn('Could not copy Telegram message:', clipboardError);
    }

    const successText = document.getElementById('form-success-text');
    if (formSuccess) formSuccess.hidden = false;
    if (successText) {
      successText.textContent = error.message === 'LOCAL_FILE_MODE'
        ? 'Локально через file:// автоматическая отправка недоступна. На опубликованном сайте заявка уйдет через защищенную Netlify Function.'
        : 'Не удалось отправить заявку автоматически. Проверьте переменные TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID в Netlify. Текст заявки скопирован.';
    }
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = initialButtonText;
    }
  }
});

// DISCOUNT POPUP
(function initDiscountPopup() {
  const PROMO_CODE = 'SKIDKA10';
  const HIDE_DAYS = 7;
  const SHOW_DELAY = 6000;
  const VISITED_KEY = 'easy_asylum_visited';
  const HIDDEN_UNTIL_KEY = 'easy_asylum_discount_popup_hidden_until';
  const PROMO_KEY = 'easy_asylum_promo_code';

  const now = Date.now();
  const params = new URLSearchParams(window.location.search);
  const promoFromUrl = params.get('promo');
  const savedPromo = localStorage.getItem(PROMO_KEY);
  const currentPromo = promoFromUrl || savedPromo;

  function setPromoField(value) {
    if (!value) return;
    const fields = document.querySelectorAll('input[name="promo"], input[name="promocode"], input[name="coupon"], #f-promo');
    fields.forEach((field) => {
      field.value = value;
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  function hidePopupForSevenDays() {
    const hiddenUntil = Date.now() + HIDE_DAYS * 24 * 60 * 60 * 1000;
    localStorage.setItem(HIDDEN_UNTIL_KEY, String(hiddenUntil));
  }

  function closePopup(popup) {
    popup.classList.remove('is-visible');
    document.body.classList.remove('discount-popup-open');
    popup.setAttribute('aria-hidden', 'true');
    setTimeout(() => popup.remove(), 260);
  }

  function goToFormWithPromo(popup) {
    localStorage.setItem(PROMO_KEY, PROMO_CODE);
    hidePopupForSevenDays();
    setPromoField(PROMO_CODE);
    closePopup(popup);

    const form = document.getElementById('contact-form');
    const heading = document.getElementById('contact-form-heading');
    if (form) {
      (heading || form).scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        const field = document.getElementById('f-promo') || form.querySelector('input[name="promo"]');
        field?.focus({ preventScroll: true });
      }, 650);
      return;
    }

    window.location.href = `/?promo=${encodeURIComponent(PROMO_CODE)}#contact`;
  }

  function createPopup() {
    if (document.querySelector('.discount-popup')) return;

    const popup = document.createElement('aside');
    popup.className = 'discount-popup';
    popup.setAttribute('role', 'dialog');
    popup.setAttribute('aria-modal', 'false');
    popup.setAttribute('aria-labelledby', 'discount-popup-title');
    popup.setAttribute('aria-hidden', 'true');
    popup.innerHTML = `
      <button class="discount-popup-x" type="button" aria-label="Закрыть">×</button>
      <p class="discount-popup-eyebrow">Для повторного визита</p>
      <h2 id="discount-popup-title">Похоже, тема всё ещё актуальна</h2>
      <p>Получите скидку 10% на наши услуги. Поможем спокойно понять, куда двигаться дальше.</p>
      <div class="discount-coupon" aria-label="Промокод SKIDKA10">
        <span>Ваш купон</span>
        <strong>${PROMO_CODE}</strong>
      </div>
      <small>Введите этот код в поле заявки на разбор</small>
      <div class="discount-popup-actions">
        <button class="discount-accept" type="button">Получить скидку</button>
        <button class="discount-close" type="button">Закрыть</button>
      </div>
    `;

    popup.querySelector('.discount-accept')?.addEventListener('click', () => goToFormWithPromo(popup));
    popup.querySelector('.discount-close')?.addEventListener('click', () => {
      hidePopupForSevenDays();
      closePopup(popup);
    });
    popup.querySelector('.discount-popup-x')?.addEventListener('click', () => {
      hidePopupForSevenDays();
      closePopup(popup);
    });

    document.body.appendChild(popup);
    requestAnimationFrame(() => {
      document.body.classList.add('discount-popup-open');
      popup.classList.add('is-visible');
      popup.setAttribute('aria-hidden', 'false');
    });
  }

  if (currentPromo) {
    localStorage.setItem(PROMO_KEY, currentPromo);
    setPromoField(currentPromo);
    const hashTarget = window.location.hash ? document.querySelector(window.location.hash) : null;
    hashTarget?.classList.add('reveal-visible');
    hashTarget?.classList.remove('reveal-init');
  }

  const wasVisited = localStorage.getItem(VISITED_KEY) === 'true';
  if (!wasVisited) {
    localStorage.setItem(VISITED_KEY, 'true');
    return;
  }

  const hiddenUntil = Number(localStorage.getItem(HIDDEN_UNTIL_KEY) || 0);
  if (hiddenUntil > now || currentPromo) return;

  window.setTimeout(createPopup, SHOW_DELAY);
})();

// SMOOTH SCROLL
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (!href || href === '#' || !href.startsWith('#')) return;
    
    e.preventDefault();
    const target = document.querySelector(href);
    if (!target) return;
    
    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  });
});

// YEAR UPDATE
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

document.getElementById('scroll-to-form')?.addEventListener('click', () => {
  document.getElementById('contact-form-heading')?.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
});

(function initScrollReveal() {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mq.matches) return;

  const sections = document.querySelectorAll('section.reveal');
  if (!sections.length) return;
  const hashTarget = window.location.hash ? document.querySelector(window.location.hash) : null;

  sections.forEach((el) => {
    if (el === hashTarget) {
      el.classList.add('reveal-visible');
      return;
    }
    el.classList.add('reveal-init');
  });
  sections.forEach((section) => {
    const animatedItems = section.querySelectorAll('.outcome-card, .service-card, .scenario-card, .case-card, .price-card, .fit-card');
    animatedItems.forEach((item, index) => {
      item.style.setProperty('--stagger', `${Math.min(index * 90, 420)}ms`);
    });
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -8% 0px' }
  );

  sections.forEach((el) => {
    if (el !== hashTarget) io.observe(el);
  });

  setTimeout(() => {
    sections.forEach((el) => {
      if (!el.classList.contains('reveal-visible')) {
        el.classList.add('reveal-visible');
      }
    });
  }, 2800);
})();


(function initHeroVisualTilt() {
  const visual = document.querySelector('.hero-visual');
  const card = document.querySelector('.main-route-card');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!visual || !card || reduce) return;

  visual.addEventListener('pointermove', (event) => {
    const rect = visual.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.setProperty('--tilt-x', (y * -6) + 'deg');
    card.style.setProperty('--tilt-y', (x * 8) + 'deg');
    card.style.transform = 'rotateX(calc(8deg + var(--tilt-x))) rotateY(calc(-10deg + var(--tilt-y))) translateY(-8px)';
  });

  visual.addEventListener('pointerleave', () => {
    card.style.removeProperty('--tilt-x');
    card.style.removeProperty('--tilt-y');
    card.style.transform = '';
  });
})();


document.querySelectorAll('[data-back-link]').forEach((link) => {
  link.addEventListener('click', (event) => {
    if (window.history.length > 1 && document.referrer) {
      event.preventDefault();
      window.history.back();
    }
  });
});


(function initFloatingContact() {
  if (document.querySelector('.floating-contact')) return;

  const link = document.createElement('a');
  link.className = 'floating-contact';
  link.href = 'https://t.me/easy_asylum';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.dataset.telegramIntent = 'Помогите разобрать ситуацию';
  link.setAttribute('aria-label', 'Связаться в Telegram');
  link.innerHTML = '<span class="floating-contact-icon">↗</span><span class="floating-contact-text"><strong>Связаться</strong><small>Telegram</small></span>';

  document.body.appendChild(link);
})();

(function initTelegramIntentButtons() {
  const TELEGRAM_URL = 'https://t.me/easy_asylum';
  const intentRules = [
    {
      match: /получить\s+план/i,
      message: 'Получить план',
      label: 'Открыть Telegram и отправить запрос: Получить план'
    },
    {
      match: /разобра(?:ть|ться)\s+ситуаци[юи]/i,
      message: 'Помогите разобрать ситуацию',
      label: 'Открыть Telegram и отправить сообщение: Помогите разобрать ситуацию'
    },
    {
      match: /разобрать\s+(?:мой\s+)?(?:кейс|маршрут)|подготовк[ау]\s+к\s+сша|убежищ[еу]\s+в\s+сша/i,
      message: 'Здравствуйте. Хочу разобрать подготовку к убежищу в США: история, документы, маршрут и билеты.',
      label: 'Открыть Telegram для разбора подготовки к убежищу в США'
    },
    {
      match: /написать\s+в\s+telegram|связаться|telegram\s*@easy_asylum/i,
      message: 'Помогите разобрать ситуацию',
      label: 'Открыть Telegram'
    }
  ];

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    }
    return fallbackCopy(text);
  }

  function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '0';
    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand('copy');
    } catch (error) {
      console.warn('Telegram message copy failed:', error);
    } finally {
      textarea.remove();
    }

    return Promise.resolve();
  }

  function showTelegramToast(message) {
    let toast = document.querySelector('.telegram-toast');

    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'telegram-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(showTelegramToast.timer);
    showTelegramToast.timer = setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 3600);
  }

  function openTelegramWithMessage(event, message) {
    event.preventDefault();
    const opened = window.open(TELEGRAM_URL, '_blank', 'noopener,noreferrer');

    copyText(message).finally(() => {
      showTelegramToast('Текст для Telegram скопирован. Вставьте его в открывшемся чате и отправьте.');
      if (!opened) {
        window.location.href = TELEGRAM_URL;
      }
    });
  }

  document.querySelectorAll('a, button').forEach((element) => {
    const text = (element.textContent || '').replace(/\s+/g, ' ').trim();
    const explicitMessage = element.dataset.telegramIntent;
    const rule = explicitMessage
      ? { message: explicitMessage, label: `Открыть Telegram: ${explicitMessage}` }
      : intentRules.find((item) => item.match.test(text));
    if (!rule) return;
    if (element.closest('form')) return;

    element.dataset.telegramIntent = rule.message;
    element.setAttribute('aria-label', rule.label);
    element.setAttribute('title', rule.label);

    if (element.tagName === 'A') {
      element.setAttribute('href', TELEGRAM_URL);
      element.setAttribute('target', '_blank');
      element.setAttribute('rel', 'noopener noreferrer');
    }

    element.addEventListener('click', (event) => {
      openTelegramWithMessage(event, rule.message);
    });
  });
})();
