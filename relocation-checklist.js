/* Organisational checks only: no network, persistence or analytics payload. */
(function () {
  'use strict';
  var root = document.getElementById('move-checklist');
  if (!root) return;
  var checks = Array.from(root.querySelectorAll('[data-move-check]'));
  var count = document.getElementById('move-count');
  var progress = document.getElementById('move-progress');
  function update() {
    var done = checks.filter(function (input) { return input.checked; }).length;
    count.textContent = 'Отмечено ' + done + ' из ' + checks.length + ' пунктов';
    progress.max = checks.length;
    progress.value = done;
  }
  checks.forEach(function (input) { input.addEventListener('change', update); });
  document.getElementById('move-print').addEventListener('click', function () { window.print(); });
  document.getElementById('move-reset').addEventListener('click', function () {
    checks.forEach(function (input) { input.checked = false; });
    update();
  });
  document.getElementById('move-actions').hidden = false;
  update();
}());
