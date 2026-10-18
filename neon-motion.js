(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches) return;
  document.body.classList.add('motion-ready');

  // Only enhance content after it is in the document; failures leave it readable.
  if ('IntersectionObserver' in window) {
    var items = document.querySelectorAll('.country-compare-card, .deliverable-panel, .review-card, .reviews-heading, .result-preview, .team-preview, .dv-home-panel, .section-heading, .card, .price-card, .audience-feature, .audience-list > div, .guide-section, .guide-links > a, .page-card > h2, .legal-section');
    var observationReceived = false;
    var observer = new IntersectionObserver(function (entries) {
      observationReceived = true;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove('neon-pending');
        entry.target.classList.add('neon-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.06, rootMargin: '0px 0px 25px 0px' });
    items.forEach(function (item) {
      if (item.getBoundingClientRect().top < window.innerHeight) return;
      item.classList.add('neon-reveal', 'neon-pending');
      observer.observe(item);
    });
    // Never leave hidden content after a browser or observer failure.
    window.setTimeout(function () {
      if (observationReceived) return;
      items.forEach(function (item) { item.classList.remove('neon-pending'); });
      observer.disconnect();
    }, 7000);
    reduce.addEventListener('change', function (event) {
      if (!event.matches) return;
      items.forEach(function (item) { item.classList.remove('neon-pending'); });
      observer.disconnect();
    });
  }

  var supportRoute = document.querySelector('.support-route');
  if (supportRoute && 'IntersectionObserver' in window) {
    var supportObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        supportRoute.classList.toggle('is-active', entry.isIntersecting && !reduce.matches);
      });
    }, { threshold: 0.1 });
    supportObserver.observe(supportRoute);
    reduce.addEventListener('change', function (event) {
      if (event.matches) supportRoute.classList.remove('is-active');
    });
  }

  var route = document.querySelector('.neon-route');
  if (!route || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  var frame = 0;
  route.addEventListener('pointermove', function (event) {
    if (reduce.matches) return;
    var rect = route.getBoundingClientRect();
    var x = (event.clientX - rect.left) / rect.width - 0.5;
    var y = (event.clientY - rect.top) / rect.height - 0.5;
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(function () {
      route.classList.add('is-tilting');
      route.style.setProperty('--tilt-x', (-y * 5).toFixed(2) + 'deg');
      route.style.setProperty('--tilt-y', (x * 5).toFixed(2) + 'deg');
    });
  });
  function resetTilt() {
    window.cancelAnimationFrame(frame);
    route.classList.remove('is-tilting');
    route.style.removeProperty('--tilt-x');
    route.style.removeProperty('--tilt-y');
  }
  route.addEventListener('pointerleave', resetTilt);
  reduce.addEventListener('change', function (event) { if (event.matches) resetTilt(); });
})();
