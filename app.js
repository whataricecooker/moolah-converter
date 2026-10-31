const DEFAULTS = { MYR: 3.175, JPY: 123.3, TWD: 25.5 }; // 1 SGD = x
const SYMBOLS = { MYR: 'RM', JPY: '¥', TWD: 'NT$' };
const KEY = 'sgd-converter-v1';
const $ = id => document.getElementById(id);
const parse = text => parseFloat(String(text).replace(/,/g, ''));

const store = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch {} },
};

// Load saved state, ignoring anything invalid
const state = { cur: 'MYR', rates: { ...DEFAULTS } };
try {
  const saved = JSON.parse(store.get(KEY));
  if (SYMBOLS[saved.cur]) state.cur = saved.cur;
  for (const k in DEFAULTS) {
    const v = parseFloat(saved.rates[k]);
    if (v > 0) state.rates[k] = v;
  }
} catch {}

const save = () => store.set(KEY, JSON.stringify(state));

function render() {
  document.querySelectorAll('.chip').forEach(b =>
    b.setAttribute('aria-pressed', b.dataset.c === state.cur));
  const rate = state.rates[state.cur];
  const amount = Math.max(parse($('amt').value) || 0, 0);
  $('sym').textContent = SYMBOLS[state.cur];
  $('out').textContent = (amount / rate).toLocaleString('en-SG',
    { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  $('rate').textContent = `1 ${state.cur} = ${(1 / rate).toFixed(rate > 50 ? 5 : 4)} SGD`;
}

function fillRates() {
  for (const k in DEFAULTS) $('r-' + k).value = state.rates[k];
}

document.querySelectorAll('.chip').forEach(b => b.addEventListener('click', () => {
  state.cur = b.dataset.c;
  save();
  render();
}));

$('amt').addEventListener('input', render);

for (const k in DEFAULTS) {
  $('r-' + k).addEventListener('input', e => {
    const v = parse(e.target.value);
    if (v > 0) { state.rates[k] = v; save(); render(); }
  });
}

$('reset').addEventListener('click', () => {
  state.rates = { ...DEFAULTS };
  save();
  fillRates();
  render();
});

fillRates();
render();

// Offline support
if ('serviceWorker' in navigator) {
  addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

// Optional install button (Chrome's automatic prompt is suppressed)
const installBar = $('installBar');
let installEvent;

addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  installEvent = e;
  if (!store.get('installDismissed')) installBar.hidden = false;
});

$('installBtn').addEventListener('click', () => {
  installBar.hidden = true;
  installEvent?.prompt();
});

$('installDismiss').addEventListener('click', () => {
  installBar.hidden = true;
  store.set('installDismissed', '1');
});

addEventListener('appinstalled', () => { installBar.hidden = true; });
