const {test} = require('node:test');
const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const vm = require('node:vm');
const source = name => readFileSync(name, 'utf8');

test('analytics queues both counters, initializes once, and labels contacts without personal data', () => {
  const scripts = [], handlers = {};
  const window = {location: {pathname: '/test/', href: 'https://easy-asylum.com/test/?email=private'}};
  const document = {createElement: () => ({}), head: {appendChild: s => scripts.push(s)},
    addEventListener: (name, fn) => handlers[name] = fn};
  const context = vm.createContext({window, document, URL, Date});
  vm.runInContext(source('analytics.js'), context);
  vm.runInContext(source('analytics.js'), context);
  assert.equal(scripts.length, 3);
  assert.equal(window.dataLayer.length, 2);
  assert.equal(window.ym.a[0][1], 'init');
  function click(href, hero) {
    const link = {href, closest: selector => hero && selector === '.hero'};
    handlers.click({target: {closest: () => link}});
  }
  click('https://t.me/easy_asylum', true);
  click('mailto:person@example.com', false);
  click('https://t.me/other_account', false);
  const events = Array.from(window.dataLayer).slice(2).map(args => Array.from(args));
  assert.deepEqual(events.map(e => e[1]), ['telegram_click', 'email_click']);
  assert.equal(events[0][2].placement, 'hero');
  assert.equal(events[0][2].page_path, '/test/');
  assert.doesNotMatch(JSON.stringify(events), /private|person@example/);
  window.gtag = () => {throw new Error('blocked')};
  assert.doesNotThrow(() => window.trackSiteEvent('telegram_click', 'content'));
});

test('budget counts deposits once and living costs for the selected months', () => {
  let submit, valid = true;
  const values = {travel: 100, deposit: 200, documents: 50, rent: 300, living: 150, reserve: 75, months: 3, currency: 'USD'};
  const output = {hidden: true, textContent: ''};
  const events = [];
  const form = {addEventListener: (_, fn) => submit = fn, reportValidity: () => valid,
    elements: {namedItem: name => ({value: String(values[name])})}};
  const document = {getElementById: id => id === 'moving-budget' ? form : output};
  const window = {trackSiteEvent: (...args) => events.push(args)};
  vm.runInNewContext(source('budget-calculator.js'), {document, window, Intl, Number});
  submit({preventDefault() {}});
  const expected = new Intl.NumberFormat('ru-RU', {style: 'currency', currency: 'USD', maximumFractionDigits: 0}).format(1775);
  assert.ok(output.textContent.includes(expected));
  assert.equal(output.hidden, false);
  assert.deepEqual(events, [['budget_calculate', 'budget_article']]);
  valid = false;
  submit({preventDefault() {}});
  assert.equal(events.length, 1);
  valid = true; values.travel = Infinity;
  submit({preventDefault() {}});
  assert.equal(events.length, 1);
});

test('calculator safely skips pages without its form', () => {
  assert.doesNotThrow(() => vm.runInNewContext(source('budget-calculator.js'), {document: {getElementById: () => null}}));
});

test('budget page does not load session replay or record entered amounts', () => {
  const scripts = [];
  const window = {location: {pathname: '/stati/skolko-deneg-nuzhno-dlya-pereezda/', href: 'https://easy-asylum.com/stati/skolko-deneg-nuzhno-dlya-pereezda/'}};
  const document = {createElement: () => ({}), head: {appendChild: s => scripts.push(s)}, addEventListener() {}};
  vm.runInNewContext(source('analytics.js'), {window, document, URL, Date});
  assert.equal(scripts.length, 2);
  assert.equal(scripts.some(s => s.src.includes('clarity')), false);
  assert.equal(window.ym.a[0][2].webvisor, false);
  assert.equal(window.ym.a[0][2].clickmap, false);
});
