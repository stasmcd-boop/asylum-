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
  if (!data) return;
  
  modalBody.innerHTML = `<h2>${data.title}</h2>${data.content}`;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
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

contactForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(contactForm);
  const data = Object.fromEntries(formData);
  const urgencyMap = {
    critical: 'Критично, несколько дней',
    month: 'До месяца',
    planning: 'Планирую заранее'
  };

  const telegramMessage = [
    'Новая заявка с сайта Safe Route',
    '',
    'Имя: ' + (data.name || '-'),
    'Telegram: ' + (data.messenger || '-'),
    'Где сейчас: ' + (data.location || '-'),
    'Срочность: ' + (urgencyMap[data.urgency] || data.urgency || '-'),
    '',
    'Что нужно решить:',
    data.message || '-'
  ].join('\n');

  console.log('Form data:', data);

  try {
    await navigator.clipboard?.writeText(telegramMessage);
  } catch (error) {
    console.warn('Could not copy Telegram message:', error);
  }

  contactForm.style.display = 'none';
  formSuccess.hidden = false;

  const successText = document.getElementById('form-success-text');
  if (successText) {
    successText.textContent = 'Данные заявки скопированы. Сейчас откроется Telegram @easy_asylum — вставьте сообщение в чат и отправьте.';
  }

  setTimeout(() => {
    formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 200);

  setTimeout(() => {
    window.open('https://t.me/easy_asylum', '_blank', 'noopener');
  }, 450);
});

// SMOOTH SCROLL
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (href === '#') return;
    
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

  sections.forEach((el) => el.classList.add('reveal-init'));
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

  sections.forEach((el) => io.observe(el));

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
