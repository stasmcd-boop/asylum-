(function () {
  function load(src, onload) {
    var s = document.createElement('script');
    s.async = true;
    s.src = src;
    if (onload) s.onload = onload;
    document.head.appendChild(s);
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };

  load('https://www.googletagmanager.com/gtag/js?id=G-Y034LBNTZW', function () {
    gtag('js', new Date());
    gtag('config', 'G-Y034LBNTZW');
  });

  load('https://www.clarity.ms/tag/wqtbbqnnob');

  load('https://mc.yandex.ru/metrika/tag.js?id=109195796', function () {
    if (typeof ym === 'function') {
      ym(109195796, 'init', {
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: true
      });
    }
  });
})();
