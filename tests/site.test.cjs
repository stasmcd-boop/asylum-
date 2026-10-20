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
  assert.equal(scripts.length, 4);
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

test('calculator, contact, LGBT and Green Card pages do not load session replay', () => {
  for (const path of ['/primer-podgotovki-kejsa/', '/primer-podgotovki-kejsa/index.html', '/uslugi/podgotovka-kejsa-na-ubezhishche/', '/stati/vyezd-pri-riske-mobilizatsii/', '/podgotovka-k-ssha/', '/podgotovka-k-ssha/index.html', '/stati/pereezd-v-ispaniyu-dokumenty-i-byudzhet/', '/stati/besplatnaya-konsultatsiya-po-pereezdu/index.html', '/', '/pomoshch-lgbt/', '/pomoshch-lgbt/ssha/', '/pomoshch-lgbt/braziliya/index.html', '/pomoshch-lgbt/ispaniya/', '/primery-raboty/', '/otzyvy/', '/stati/skolko-deneg-nuzhno-dlya-pereezda/', '/green-card-2027/', '/green-card-2027/index.html', '/en/', '/en/index.html']) {
    const scripts = [];
    const window = {location: {pathname: path, href: 'https://easy-asylum.com' + path}};
    const document = {createElement: () => ({}), head: {appendChild: s => scripts.push(s)}, addEventListener() {}};
    vm.runInNewContext(source('analytics.js'), {window, document, URL, Date});
    assert.equal(scripts.length, 3, path);
    assert.equal(scripts.some(s => s.src.includes('clarity')), false, path);
    assert.equal(window.ym.a[0][2].webvisor, false, path);
    assert.equal(window.ym.a[0][2].clickmap, false, path);
  }
});

test('simplified request accepts optional details and only counts confirmed delivery', async () => {
  const text = source('script.js');
  const part = text.slice(text.indexOf("const contactForm ="), text.indexOf('// Promotional overlays'));
  const run = async (ok, contact, language = 'ru') => {
    let submit, sent = 0, reset = 0;
    const button = {textContent: 'Отправить заявку', disabled: false};
    const form = {getAttribute: () => language, querySelector: () => button, addEventListener: (_, fn) => submit = fn,
      reset: () => reset++, style: {}};
    const status = {hidden: true, scrollIntoView() {}};
    const statusText = {textContent: ''};
    const errorText = {hidden: true, textContent: ''};
    const events = [];
    const nodes = {'contact-form': form, 'form-success': status, 'form-success-text': statusText,
      'contact-error': errorText, 'f-msg': {focus() {}}};
    const document = {getElementById: id => nodes[id] || null};
    const fields = contact ? [['email', 'demo@example.com'], ['message', 'Planning a move']] : [['message', 'Planning a move']];
    class FormData {
      [Symbol.iterator]() {return fields[Symbol.iterator]();}
      getAll() {return [];}
    }
    const context = vm.createContext({document, FormData, console: {warn() {}},
      window: {location: {protocol: 'https:'}, trackSiteEvent: (...event) => events.push(event)},
      navigator: {clipboard: {writeText: async () => {}}},
      fetch: async () => {sent++; return {ok, json: async () => ({ok})};}, setTimeout: () => {}});
    vm.runInContext(part, context);
    await submit({preventDefault() {}});
    return {sent, reset, button, events, statusText, errorText};
  };
  const success = await run(true, true);
  assert.equal(success.sent, 1); assert.equal(success.reset, 1);
  assert.deepEqual(success.events, [['generate_lead', 'contact_form']]);
  assert.equal(success.button.disabled, false);
  const failed = await run(false, true);
  assert.equal(failed.reset, 0);
  assert.deepEqual(failed.events, [['lead_submit_error', 'contact_form']]);
  const missing = await run(true, false);
  assert.equal(missing.sent, 0); assert.equal(missing.errorText.hidden, false);
  const englishSuccess = await run(true, true, 'en');
  assert.match(englishSuccess.statusText.textContent, /Your enquiry has been sent/);
  const englishFailed = await run(false, true, 'en');
  assert.match(englishFailed.statusText.textContent, /could not send your enquiry/);
  const englishMissing = await run(true, false, 'en');
  assert.match(englishMissing.errorText.textContent, /Please provide your Telegram or email/);
  assert.equal(englishMissing.sent, 0);
});

test('reduced motion keeps all content visible and installs no animations', () => {
  let added = false;
  const document = {body: {classList: {add() { added = true; }}}, querySelectorAll() {throw new Error('should not hide content');}};
  vm.runInNewContext(source('neon-motion.js'), {window: {matchMedia: () => ({matches: true})}, document});
  assert.equal(added, false);
});

test('scroll reveal is optional and releases content through its fail-safe', () => {
  const classes = new Set(); let callback, timeout;
  const item = {classList: {add: (...names) => names.forEach(n => classes.add(n)), remove: n => classes.delete(n)}, getBoundingClientRect: () => ({top: 2000})};
  class Observer {constructor(fn) {callback=fn;} observe() {} unobserve() {} disconnect() {}}
  const window = {matchMedia: () => ({matches:false, addEventListener() {}}), innerHeight: 900,
    IntersectionObserver: Observer, setTimeout: fn => timeout=fn};
  const document = {body: {classList: {add() {}}}, querySelectorAll: () => [item], querySelector: () => null};
  vm.runInNewContext(source('neon-motion.js'), {window, document, IntersectionObserver: Observer});
  assert.equal(classes.has('neon-pending'), true);
  timeout(); // If the browser never delivers observations, fail open.
  assert.equal(classes.has('neon-pending'), false);
  classes.add('neon-pending');
  callback([{isIntersecting:true, target:item}]);
  assert.equal(classes.has('neon-pending'), false);
});


test('enquiry funnel counts starts once, keeps clicks separate and omits entered values', () => {
  const handlers = {};
  const window = {location: {pathname: '/en/', origin: 'https://easy-asylum.com', href: 'https://easy-asylum.com/en/?email=private'}};
  const document = {documentElement: {lang: 'en'}, createElement: () => ({}), head: {appendChild() {}}, addEventListener: (name, fn) => handlers[name] = fn};
  vm.runInNewContext(source('analytics.js'), {window, document, URL, Date});
  const form = {id: 'contact-form'};
  handlers.focusin({target: {value: 'private message', closest: () => ({id: 'other'})}});
  handlers.focusin({target: {value: 'private message', closest: () => form}});
  handlers.focusin({target: {value: 'private email', closest: () => form}});
  for (const href of ['https://easy-asylum.com/primer-plana-pereezda/?name=private', 'https://easy-asylum.com/en/#contact-form-heading', 'https://other.example/#contact-form-heading']) {
    handlers.click({target: {closest: () => ({href, closest: () => null})}});
  }
  const events = window.dataLayer.slice(2).map(args => Array.from(args));
  assert.deepEqual(Array.from(events, e => e[1]), ['contact_form_start', 'plan_example_open', 'contact_cta_click']);
  assert.equal(events.every(e => e[2].language === 'en'), true);
  assert.equal(events.some(e => e[1] === 'generate_lead'), false);
  assert.doesNotMatch(JSON.stringify(events), /private|name=|email=/);
  assert.deepEqual(Array.from(window.ym.a.slice(1), args => args[2]), ['contact_form_start', 'plan_example_open', 'contact_cta_click']);
});


test('local checks and deployment previews never load production analytics', () => {
  for (const href of ['http://127.0.0.1:8765/', 'http://localhost:8765/', 'https://deploy-preview-8--asylumusa.netlify.app/']) {
    const scripts = [], handlers = [];
    const window = {location: {href, pathname: '/'}};
    const document = {createElement: () => ({}), head: {appendChild: script => scripts.push(script)}, addEventListener: (...args) => handlers.push(args)};
    vm.runInNewContext(source('analytics.js'), {window, document, URL, Date});
    assert.equal(scripts.length, 0, href);
    assert.equal(handlers.length, 0, href);
    assert.equal(window.trackSiteEvent, undefined, href);
  }
});


test('PostHog strips personal and automatic properties and keeps only an anonymous funnel', () => {
  const scripts = [];
  const window = {location: {pathname: '/en/', href: 'https://easy-asylum.com/en/?email=secret#private'}};
  const document = {documentElement: {lang: 'en'}, referrer: 'https://google.com/search?q=private',
    createElement: () => ({}), head: {appendChild: s => scripts.push(s)}, addEventListener() {}};
  vm.runInNewContext(source('analytics.js'), {window, document, URL, Date});
  const config = window.posthog._i[0][1];
  assert.equal(config.api_host, 'https://eu.i.posthog.com');
  assert.equal(config.person_profiles, 'never');
  for (const key of ['autocapture', 'capture_pageview', 'capture_exceptions', 'capture_performance', 'capture_heatmaps']) assert.equal(config[key], false);
  assert.equal(config.disable_session_recording, true);
  const event = config.before_send({event: 'generate_lead', properties: {token: 'public-token', distinct_id: 'anonymous-id',
    '$session_id': 'session-id', '$current_url': window.location.href, '$set': {email: 'secret'},
    email: 'secret', message: 'private history', '$initial_referrer': document.referrer,
    site_section: 'home', language: 'en', internal_traffic: false}});
  assert.equal(event.properties.token, window.posthog._i[0][0]);
  assert.equal(event.properties.distinct_id, 'anonymous-id');
  assert.equal(event.properties.$session_id, 'session-id');
  assert.equal(event.properties.$current_url, 'https://easy-asylum.com/en/');
  assert.equal(event.properties.$referrer, 'https://google.com/');
  assert.equal(event.properties.$process_person_profile, false);
  assert.doesNotMatch(JSON.stringify(event), /secret|private|email|message|\$set|search\?/);
  assert.equal(config.before_send({event: '$autocapture', properties: {text: 'private'}}), null);
  const queued = Array.from(window.posthog, entry => entry[1]);
  assert.deepEqual(queued, ['$pageview']);
  window.trackSiteEvent('unapproved_event', 'private text');
  assert.equal(window.posthog.length, 1);
});

test('owner opt-out and privacy signals prevent every analytics request', () => {
  for (const mode of ['off', 'stored', 'dnt', 'gpc']) {
    const scripts = [], values = new Map(mode === 'stored' ? [['easy_asylum_analytics', 'off']] : []);
    const window = {location: {pathname: '/', href: 'https://easy-asylum.com/' + (mode === 'off' ? '?analytics=off' : '')},
      localStorage: {getItem: key => values.get(key), setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key)}};
    const document = {createElement: () => ({}), head: {appendChild: s => scripts.push(s)}, addEventListener() {}};
    vm.runInNewContext(source('analytics.js'), {window, document, URL, Date, navigator: {doNotTrack: mode === 'dnt' ? '1' : '0', globalPrivacyControl: mode === 'gpc'}});
    assert.equal(scripts.length, 0, mode);
    assert.equal(window.trackSiteEvent, undefined, mode);
  }
});

test('tagged QA only sends PostHog test events; PDF actions remain distinct from leads', () => {
  const scripts = [], handlers = {};
  const window = {location: {pathname: '/primer-podgotovki-kejsa/', origin: 'https://easy-asylum.com', href: 'https://easy-asylum.com/primer-podgotovki-kejsa/?analytics=qa'}};
  const document = {createElement: () => ({}), head: {appendChild: s => scripts.push(s)}, addEventListener: (type, fn) => handlers[type] = fn};
  vm.runInNewContext(source('analytics.js'), {window, document, URL, Date});
  assert.equal(scripts.length, 1);
  assert.match(scripts[0].src, /eu-assets.i.posthog.com/);
  const href = 'https://easy-asylum.com/assets/case-preparation-workbook-20261019-v2.pdf';
  for (const download of [true, false]) handlers.click({target: {closest: () => ({href, hasAttribute: () => download, closest: () => null})}});
  const events = Array.from(window.posthog, entry => entry[1]);
  assert.deepEqual(events, ['$pageview', 'workbook_download', 'workbook_preview']);
  assert.equal(window.posthog.every(entry => entry[2].internal_traffic), true);
  assert.equal(events.includes('generate_lead'), false);
});
