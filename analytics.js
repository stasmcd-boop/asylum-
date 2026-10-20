(function () {
  // Local development and deployment previews must not pollute production reports.
  var host;
  try { host = new URL(window.location.href).hostname; } catch (_) { return; }
  if (!['easy-asylum.com', 'www.easy-asylum.com'].includes(host)) return;
  // An explicit browser preference excludes owner visits from every counter.
  var mode = '', preference = '';
  try {
    mode = new URL(window.location.href).searchParams.get('analytics') || '';
    if (['off', 'qa', 'on'].includes(mode)) {
      if (mode === 'on') window.localStorage.removeItem('easy_asylum_analytics');
      else window.localStorage.setItem('easy_asylum_analytics', mode);
    }
    preference = window.localStorage.getItem('easy_asylum_analytics') || '';
  } catch (_) { preference = mode; }
  var privacySignal = typeof navigator !== 'undefined' && (navigator.globalPrivacyControl || navigator.doNotTrack === '1');
  var status = document.getElementById?.('analytics-preference');
  if (status) status.textContent = (preference === 'off' || privacySignal) ? 'Аналитика отключена в этом браузере.' : 'Аналитика включена. Вы можете отключить её для этого браузера.';
  if (preference === 'off') return;
  if (privacySignal) return;
  if (window.safeRouteAnalyticsLoaded) return;
  window.safeRouteAnalyticsLoaded = true;

  function load(src) {
    var script = document.createElement('script');
    script.async = true;
    script.src = src;
    document.head.appendChild(script);
  }

  var internal = preference === 'qa';
  var eventNames = ['$pageview', 'contact_cta_click', 'contact_form_start', 'generate_lead',
    'lead_submit_error', 'lead_validation_error', 'telegram_click', 'email_click',
    'plan_example_open', 'workbook_download', 'workbook_preview', 'budget_calculate'];
  var pagePath = window.location.pathname.replace(/index\.html$/, '');
  var section = pagePath === '/' || pagePath === '/en/' ? 'home'
    : pagePath.startsWith('/pomoshch-lgbt/') ? 'lgbt_support'
    : pagePath.startsWith('/podgotovka-k-ssha/') ? 'usa'
    : pagePath.startsWith('/green-card-2027/') ? 'green_card'
    : pagePath.includes('mobilizatsii') ? 'urgent_departure'
    : pagePath.includes('kejsa') || pagePath.includes('keysa') ? 'case_materials'
    : pagePath.startsWith('/uslugi/') ? 'services'
    : pagePath.startsWith('/stati/') ? 'articles' : 'other';

  // The official HTML bootstrap queue, limited to the sole SDK method we use.
  var ph = window.posthog = window.posthog || [];
  if (!ph.__SV) {
    ph.__SV = 1;
    ph._i = [];
    ph.capture = function () { ph.push(['capture'].concat(Array.prototype.slice.call(arguments))); };
    ph._i.push(['phc_op5QexGDnW9CaEFEd2QMBM6AVokPXcMnTXhkLCE7ShDL', {
      api_host: 'https://eu.i.posthog.com', ui_host: 'https://eu.posthog.com',
      defaults: '2026-05-30', persistence: 'localStorage', person_profiles: 'never',
      autocapture: false, capture_pageview: false, capture_pageleave: false,
      disable_session_recording: true, disable_surveys: true, disable_conversations: true,
      capture_exceptions: false, capture_performance: false, capture_heatmaps: false,
      capture_dead_clicks: false, rageclick: false, advanced_disable_flags: true,
      // Fail closed: unknown events and all free-form properties are discarded.
      before_send: function (event) {
        if (!event || !eventNames.includes(event.event)) return null;
        var properties = event.properties || {}, clean = {};
        ['distinct_id', '$device_id', '$session_id', '$window_id', '$lib', '$lib_version',
          '$browser', '$browser_version', '$os', '$os_version', '$device_type',
          '$screen_height', '$screen_width', '$viewport_height', '$viewport_width',
          'page_path', 'site_section', 'placement', 'language', 'internal_traffic'].forEach(function (key) {
          if (Object.prototype.hasOwnProperty.call(properties, key)) clean[key] = properties[key];
        });
        clean.token = 'phc_op5QexGDnW9CaEFEd2QMBM6AVokPXcMnTXhkLCE7ShDL';
        clean.$current_url = 'https://easy-asylum.com' + pagePath;
        clean.$pathname = pagePath;
        clean.$host = 'easy-asylum.com';
        clean.$process_person_profile = false;
        clean.$is_identified = false;
        try {
          var ref = new URL(document.referrer);
          clean.$referrer = ref.origin + '/';
          clean.$referring_domain = ref.hostname;
        } catch (_) { clean.$referrer = '$direct'; clean.$referring_domain = '$direct'; }
        event.properties = clean;
        return event;
      }
    }, 'posthog']);
    load('https://eu-assets.i.posthog.com/static/array.js');
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', 'G-Y034LBNTZW');
  if (!internal) load('https://www.googletagmanager.com/gtag/js?id=G-Y034LBNTZW');

  var isBudgetPage = window.location.pathname.replace(/index\.html$/, '').replace(/\/$/, '') === '/stati/skolko-deneg-nuzhno-dlya-pereezda';
  // Do not replay contact forms or pages about sensitive personal circumstances.
  var replayDisabled = ['/primer-podgotovki-kejsa/', '/uslugi/podgotovka-kejsa-na-ubezhishche/', '/stati/vyezd-pri-riske-mobilizatsii/'].some(function (path) { return window.location.pathname === path || window.location.pathname === path + 'index.html'; }) || window.location.pathname.startsWith('/podgotovka-k-ssha/') || ['/stati/pereezd-v-ispaniyu-dokumenty-i-byudzhet/', '/stati/besplatnaya-konsultatsiya-po-pereezdu/'].some(function (path) { return window.location.pathname === path || window.location.pathname === path + 'index.html'; }) || window.location.pathname.startsWith('/otzyvy/') || window.location.pathname.startsWith('/primery-raboty/') || window.location.pathname.startsWith('/pomoshch-lgbt/') || isBudgetPage || ['/', '/index.html', '/en/', '/en/index.html', '/pomoshch-lgbt/', '/pomoshch-lgbt/index.html', '/green-card-2027/', '/green-card-2027/index.html'].includes(window.location.pathname);
  window.clarity = window.clarity || function () {
    (window.clarity.q = window.clarity.q || []).push(arguments);
  };
  if (!internal && !replayDisabled) load('https://www.clarity.ms/tag/wqtbbqnnob');

  window.ym = window.ym || function () {
    (window.ym.a = window.ym.a || []).push(arguments);
  };
  window.ym.l = Date.now();
  window.ym(109195796, 'init', {
    clickmap: !replayDisabled, trackLinks: true, accurateTrackBounce: true, webvisor: !replayDisabled
  });
  if (!internal) load('https://mc.yandex.ru/metrika/tag.js');

  // Only fixed labels are sent: never form values, message text or URL queries.
  window.trackSiteEvent = function (name, placement) {
    if (!eventNames.includes(name)) return;
    var params = { page_path: pagePath, site_section: section,
      placement: ['hero', 'floating', 'header', 'footer', 'sidebar', 'content', 'contact_form', 'budget_article'].includes(placement) ? placement : 'content',
      language: document.documentElement?.lang === 'en' ? 'en' : 'ru', internal_traffic: internal };
    // A blocked vendor must not prevent other counters or the contact action.
    try { window.posthog.capture(name, params); } catch (_) {}
    if (internal || name === '$pageview') return;
    try { window.gtag('event', name, params); } catch (_) {}
    try { window.ym(109195796, 'reachGoal', name, params); } catch (_) {}
  };
  window.trackSiteEvent('$pageview', 'content');

  // The first interaction is a funnel step, never a confirmed enquiry.
  var formStarted = false;
  document.addEventListener('focusin', function (event) {
    var form = event.target.closest('form');
    if (!form || form.id !== 'contact-form' || formStarted) return;
    formStarted = true;
    window.trackSiteEvent('contact_form_start', 'contact_form');
  }, true);

  var lastInvalid = 0;
  document.addEventListener('invalid', function (event) {
    if (event.target.closest('form')?.id !== 'contact-form' || Date.now() - lastInvalid < 2000) return;
    lastInvalid = Date.now();
    window.trackSiteEvent('lead_validation_error', 'contact_form');
  }, true);

  document.addEventListener('click', function (event) {
    var link = event.target.closest('a');
    if (!link) return;
    var url;
    try { url = new URL(link.href, window.location.href); } catch (_) { return; }
    var placement = link.closest('.hero') ? 'hero'
      : link.closest('.floating-contact') ? 'floating'
      : link.closest('header') ? 'header'
      : link.closest('footer') ? 'footer'
      : link.closest('aside') ? 'sidebar' : 'content';
    if (url.origin === window.location.origin && /^\/assets\/case-preparation-workbook-[\w-]+\.pdf$/.test(url.pathname)) {
      window.trackSiteEvent(link.hasAttribute('download') ? 'workbook_download' : 'workbook_preview', placement);
    } else if (url.origin === window.location.origin && url.pathname === '/primer-plana-pereezda/') {
      window.trackSiteEvent('plan_example_open', placement);
    } else if (url.origin === window.location.origin && ['#contact-form-heading', '#dv-request', '#contact'].includes(url.hash)) {
      window.trackSiteEvent('contact_cta_click', placement);
    } else if (url.hostname === 't.me' && url.pathname.replace(/\/$/, '') === '/easy_asylum') {
      window.trackSiteEvent('telegram_click', placement);
    } else if (url.protocol === 'mailto:') {
      window.trackSiteEvent('email_click', placement);
    }
  }, true);
})();
