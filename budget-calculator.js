(function () {
  var form = document.getElementById('moving-budget');
  if (!form) return;
  var output = document.getElementById('budget-result');
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;
    var value = function (name) { return Number(form.elements.namedItem(name).value); };
    var once = value('travel') + value('deposit') + value('documents');
    var monthly = value('rent') + value('living');
    var total = once + monthly * value('months') + value('reserve');
    if (!Number.isFinite(total)) return;
    var currency = form.elements.namedItem('currency').value;
    var money = function (amount) {
      return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: currency, maximumFractionDigits: 0 }).format(amount);
    };
    output.textContent = 'Всего подготовить: ' + money(total) + '. Разовые расходы: ' + money(once)
      + '. На жизнь в месяц: ' + money(monthly) + '. Отдельный резерв: ' + money(value('reserve')) + '.';
    output.hidden = false;
    if (window.trackSiteEvent) window.trackSiteEvent('budget_calculate', 'budget_article');
  });
})();
