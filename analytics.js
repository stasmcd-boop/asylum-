(function () {
  if (window.safeRouteAnalyticsLoaded) return;
  window.safeRouteAnalyticsLoaded = true;

  function load(src) {
    var script = document.createElement('script');
    script.async = true;
    script.src = src;
    document.head.appendChild(script);
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', 'G-Y034LBNTZW');
  load('https://www.googletagmanager.com/gtag/js?id=G-Y034LBNTZW');

  var isBudgetPage = window.location.pathname.replace(/index\.html$/, '').replace(/\/$/, '') === '/stati/skolko-deneg-nuzhno-dlya-pereezda';
  // Do not replay contact forms or pages about sensitive personal circumstances.
  var replayDisabled = isBudgetPage || ['/', '/index.html', '/pomoshch-lgbt/', '/pomoshch-lgbt/index.html', '/green-card-2027/', '/green-card-2027/index.html'].includes(window.location.pathname);
  window.clarity = window.clarity || function () {
    (window.clarity.q = window.clarity.q || []).push(arguments);
  };
  if (!replayDisabled) load('https://www.clarity.ms/tag/wqtbbqnnob');

  window.ym = window.ym || function () {
    (window.ym.a = window.ym.a || []).push(arguments);
  };
  window.ym.l = Date.now();
  window.ym(109195796, 'init', {
    clickmap: !replayDisabled, trackLinks: true, accurateTrackBounce: true, webvisor: !replayDisabled
  });
  load('https://mc.yandex.ru/metrika/tag.js');

  // Only fixed labels are sent: never form values, message text or URL queries.
  window.trackSiteEvent = function (name, placement) {
    try {
      var params = { page_path: window.location.pathname, placement: placement };
      window.gtag('event', name, params);
      window.ym(109195796, 'reachGoal', name, params);
    } catch (_) { /* Analytics must never interrupt a contact action. */ }
  };

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
    if (url.hostname === 't.me' && url.pathname.replace(/\/$/, '') === '/easy_asylum') {
      window.trackSiteEvent('telegram_click', placement);
    } else if (url.protocol === 'mailto:') {
      window.trackSiteEvent('email_click', placement);
    }
  }, true);
})();
