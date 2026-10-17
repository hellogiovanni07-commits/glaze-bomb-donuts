// Glaze Bomb - home page
import { initChat } from './chat.js?v=46';
import {
  gsap, ScrollTrigger, $, $$, reduce, fine, money, FLAVORS, DRINKS, PREMIUM, CLASSIC, COMBOS, FREE_DRINKS, drinkByName,
  donutArt, cupArt, setBoxFreeDrink, SOCIAL, scrollToTarget, splitWords, toast, addToCart, openDrawer, initOrderUI,
  openStatus, initReveals, reveal, once, runLoader, navHighlight, afterIntro, initBand,
} from './common.js?v=46';

// the six signatures + ten more from the menu (four rows of four, the height of the open box); every one is on the menu page
const TRAY = [...FLAVORS, ...['Ube Cheese Cloud', 'Matcha Web', 'Wafer Crunch Bar', 'Hazelnut Velvet', 'Almond Snowcap', 'Berry Coconut Snow', "S'mores Campfire", 'Cappuccino Swirl', 'Strawberry Sprinkle', 'Choco Sprinkle'].map((n) => [...PREMIUM, ...CLASSIC].find((f) => f.name === n))];

splitWords();
initOrderUI();
initChat();
openStatus(); setInterval(openStatus, 60000);
$('#viewOrder')?.addEventListener('click', () => openDrawer(true));

/* ---------------- 3D donut ---------------- */
let donut = null;
// three.js is fetched only after the intro, so nothing on the page waits for it.
// Every other donut and cup on the page is a pre-rendered 3D image (assets/3d), so there is one WebGL canvas only.
afterIntro(() => import('./donut.js?v=46').then(({ DonutScene }) => {
  try { donut = new DonutScene($('#stage')); setTimeout(() => donut?.prewarm(FLAVORS), 2500); } catch (e) { console.warn('WebGL unavailable', e); $('#stage').remove(); }
}).catch((e) => { console.warn('3D unavailable', e); $('#stage')?.remove(); }));

/* ---------------- hero flavor picker ---------------- */
let heroIdx = 0;
FLAVORS.forEach((f, i) => {
  const b = document.createElement('button');
  b.className = 'fchip' + (i === 0 ? ' is-on' : '');
  b.innerHTML = donutArt(f, 'top', 50 + i, true);
  b.setAttribute('aria-label', f.name); b.setAttribute('aria-pressed', i === 0); b.title = f.name;
  b.addEventListener('click', () => {
    heroIdx = i;
    $$('.fchip').forEach((x, k) => { x.classList.toggle('is-on', k === i); x.setAttribute('aria-pressed', k === i); });
    $('#pickName').textContent = f.name; $('#pickPrice').textContent = money(f.price);
    gsap.fromTo('.hero__picked', { scale: 0.92 }, { scale: 1, duration: 0.4, ease: 'back.out(3)', overwrite: true });
    if (activeMode === 'hero') showOnDonut('hero:' + i, f);
  });
  $('#heroChips').appendChild(b);
});

/* ---------------- ticker ---------------- */
initBand();

/* ---------------- donut anchoring ---------------- */
const anchors = $$('[data-donut-anchor]').map((el) => ({ el, mode: el.dataset.donutAnchor, sec: el.closest('section') }));
const MODES = { hero: { rx: -0.95, spin: 0.22, fill: 0.96 }, flavors: { rx: -0.85, spin: 0.32, fill: 0.96 }, build: { rx: -1.0, spin: 0.1, fill: 0.94 } };
let activeMode = 'hero', lastMode = null, donutKey = '';
const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
if (fine) addEventListener('pointermove', (e) => { mouse.tx = e.clientX / innerWidth - 0.5; mouse.ty = e.clientY / innerHeight - 0.5; }, { passive: true });
function visibleFrac(el) {
  const r = el.getBoundingClientRect();
  return Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)) / Math.min(innerHeight, r.height || 1);
}
function showOnDonut(key, f, opts) { if (!donut || key === donutKey) return; donutKey = key; donut.setFlavor(f, opts); }
function syncDonut(mode) {
  if (mode === 'hero') showOnDonut('hero:' + heroIdx, FLAVORS[heroIdx]);
  if (mode === 'flavors') showOnDonut('menu:' + Math.max(0, flavorIdx), FLAVORS[Math.max(0, flavorIdx)]);
  if (mode === 'build') showOnDonut('build', buildFlavor());
}
const depthEls = $$('[data-depth]');
gsap.ticker.add(() => {
  mouse.x += (mouse.tx - mouse.x) * 0.06; mouse.y += (mouse.ty - mouse.y) * 0.06;
  if (fine && !reduce) for (const el of depthEls) { const dd = +el.dataset.depth * 26; el.style.transform = `translate3d(${(mouse.x * dd).toFixed(1)}px, ${(mouse.y * dd).toFixed(1)}px, 0)`; }
  if (!donut) return;
  let best = null, bestV = 0.3;
  for (const a of anchors) { const v = visibleFrac(a.sec); if (v > bestV) { bestV = v; best = a; } }
  activeMode = best ? best.mode : null;
  if (best) { const m = MODES[best.mode]; donut.setAnchor(best.el.getBoundingClientRect(), { rx: m.rx, fill: m.fill }); donut.autoSpin = reduce ? 0 : m.spin; }
  else donut.setAnchor(null);
  if (activeMode !== lastMode) { lastMode = activeMode; if (activeMode) syncDonut(activeMode); }
  donut.mouse.x = mouse.x; donut.mouse.y = mouse.y;
  donut.render();
});
let lastHit = 0, overDonut = false;
if (fine) addEventListener('pointermove', (e) => {
  if (!donut) return;
  const now = performance.now(); if (now - lastHit < 120) return; lastHit = now;
  const hit = (activeMode === 'hero' || activeMode === 'flavors') && !e.target.closest('button, a, input, .nav, .drawer') && donut.hitTest(e.clientX, e.clientY);
  if (hit !== overDonut) { overDonut = hit; document.body.style.cursor = hit ? 'pointer' : ''; }
}, { passive: true });
addEventListener('click', (e) => {
  if (!donut || !(activeMode === 'hero' || activeMode === 'flavors') || e.target.closest('button, a, input, label, .nav, .drawer, .menu__copy')) return;
  if (donut.hitTest(e.clientX, e.clientY)) donut.boop();
});

/* ---------------- signature menu (pinned) ---------------- */
const tabsWrap = $('#flavorTabs');
FLAVORS.forEach((f, i) => {
  const t = document.createElement('button');
  t.className = 'tab'; t.textContent = f.name; t.setAttribute('role', 'tab'); t.setAttribute('aria-selected', 'false');
  t.id = 'ftab' + i; t.setAttribute('aria-controls', 'flavorPanel'); t.tabIndex = i ? -1 : 0;
  t.addEventListener('click', () => goToFlavor(i));
  tabsWrap.appendChild(t);
});
const tabs = $$('.tab', tabsWrap);
const flavorPanel = $('.menu__copy'); if (flavorPanel) { flavorPanel.id = 'flavorPanel'; flavorPanel.setAttribute('role', 'tabpanel'); }
// arrow keys move between the six flavors, like any tab set
tabsWrap.addEventListener('keydown', (e) => {
  const k = { ArrowRight: 1, ArrowLeft: -1, Home: -99, End: 99 }[e.key]; if (!k) return;
  e.preventDefault();
  const i = Math.max(0, Math.min(FLAVORS.length - 1, (flavorIdx < 0 ? 0 : flavorIdx) + k));
  tabs[i].focus(); goToFlavor(i);
});
let flavorIdx = -1;
function setName(el, text) { el.innerHTML = text.split(' ').map((w) => `<span class="w"><span>${w}</span></span>`).join(' '); }
function showFlavor(i, instant) {
  if (i === flavorIdx) return;
  const dir = i > flavorIdx ? 1 : -1;
  flavorIdx = i;
  const f = FLAVORS[i];
  $('#menuBg').style.backgroundColor = f.bg;
  tabs.forEach((t, k) => { t.classList.toggle('is-on', k === i); t.setAttribute('aria-selected', k === i); t.tabIndex = k === i ? 0 : -1; });
  flavorPanel?.setAttribute('aria-labelledby', 'ftab' + i);
  if (tabsWrap.scrollWidth > tabsWrap.clientWidth) tabsWrap.scrollTo({ left: tabs[i].offsetLeft - 16, behavior: instant ? 'auto' : 'smooth' });
  setName($('#flavorName'), f.name);
  $('#flavorDesc').textContent = f.desc;
  $('#flavorFill').textContent = f.fill;
  $('#flavorGlaze').textContent = f.glazeName;
  $('#flavorPrice').textContent = money(f.price);
  $('#flavorPair').textContent = f.pair;
  $('#flavorNum').textContent = String(i + 1).padStart(2, '0');
  $$('#taste b').forEach((b) => b.style.setProperty('--s', f.taste[b.dataset.k] / 100));
  if (instant) return;
  gsap.fromTo('#flavorNum', { yPercent: 30 * dir, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7, ease: 'power3.out', overwrite: true });
  gsap.fromTo('#flavorName .w > span', { yPercent: 105 * dir }, { yPercent: 0, duration: 0.6, stagger: 0.05, ease: 'power3.out', overwrite: true });
  gsap.fromTo(['#flavorDesc', '.menu__meta', '.menu__buy'], { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, stagger: 0.06, ease: 'power2.out', overwrite: true });
  if (activeMode === 'flavors') showOnDonut('menu:' + i, f);
}
showFlavor(0, true);
const menuST = ScrollTrigger.create({
  trigger: '.menu', start: 'top top', end: () => '+=' + innerHeight * FLAVORS.length * (innerWidth < 760 ? 0.65 : 1), pin: '.menu__pin', anticipatePin: 1, invalidateOnRefresh: true,
  onUpdate: (s) => {
    const p = s.progress * FLAVORS.length, i = Math.min(FLAVORS.length - 1, Math.floor(p));
    tabs.forEach((t, k) => t.style.setProperty('--p', (k < i ? 100 : k === i ? (p - i) * 100 : 0) + '%'));
    showFlavor(i);
  },
});
function goToFlavor(i) { scrollToTarget(menuST.start + ((i + 0.5) / FLAVORS.length) * (menuST.end - menuST.start)); }
$('#flavorAdd').addEventListener('click', (e) => addToCart({ ...FLAVORS[flavorIdx], sub: FLAVORS[flavorIdx].fill + ' filling' }, e.currentTarget));

/* ---------------- build your own ---------------- */
const NAMES = {
  dough: { classic: 'Classic brioche', cocoa: 'Double cocoa', matcha: 'Matcha' },
  pattern: { plain: '', marble: 'marble swirl', dust: 'sesame dust', crumbcoat: 'crumb coat' },
  topping: { biscuit: 'Biscuit & crumbs', crumbs: 'Cookie crumbs', graham: 'Graham & mango', sesame: 'Black sesame', sprinkles: 'Sprinkles', pearls: 'Sugar pearls', none: 'No topping' },
  drizzle: { '': 'No drizzle', '#ffffff': 'White drizzle', '#3a1d10': 'Chocolate drizzle', '#9c6a3c': 'Caramel drizzle' },
};
const ADJ = { '#fbf4ea': 'Snowy', '#e8cfa6': 'Milk Tea', '#d6ac76': 'Latte', '#d9a066': 'Caramel', '#2e1810': 'Midnight', '#ff9a4d': 'Sunny', '#a8d48f': 'Matcha', '#a46be0': 'Ube' };
const NOUN = { biscuit: 'Crunch', crumbs: 'Crumble', graham: 'Tropic', sesame: 'Sesame', sprinkles: 'Party', pearls: 'Pearl', none: 'Classic' };
const TOP_PRICE = { biscuit: 0.8, crumbs: 0.5, graham: 0.9, sesame: 0.4, sprinkles: 0.4, pearls: 0.5, none: 0 };
const TOP3D = { biscuit: ['biscuit', 'cookie'], crumbs: ['crumbs'], graham: ['graham', 'jam'], sesame: ['sesame'], sprinkles: ['sprinkles'], pearls: ['pearls'], none: [] };
const build = { dough: 'classic', filling: 'Vanilla custard', glaze: '#fbf4ea', pattern: 'plain', topping: 'biscuit', drizzle: '#9c6a3c' };
const darkGlaze = (h) => { const n = parseInt(h.slice(1), 16); return ((n >> 16) * 0.3 + ((n >> 8) & 255) * 0.59 + (n & 255) * 0.11) < 110; };
function buildFlavor() {
  return {
    name: 'custom', glaze: build.glaze, dough: build.dough, pattern: build.pattern, drizzle: build.drizzle || null, toppings: TOP3D[build.topping],
    patternColor: build.pattern === 'marble' ? (darkGlaze(build.glaze) ? '#f3ede6' : '#3a1d10') : '#151515',
    crumbColors: build.topping === 'graham' ? ['#b06d30', '#8f5524', '#d08f4f', '#e3b27a'] : ['#1d1210', '#3a2419', '#4a3024'],
    cover: build.pattern === 'crumbcoat' ? 1.35 : 1.12,
  };
}
const buildPrice = () => 2.9 + (build.dough !== 'classic' ? 0.3 : 0) + (build.pattern !== 'plain' ? 0.3 : 0) + TOP_PRICE[build.topping] + (build.drizzle ? 0.3 : 0);
const buildName = () => `The ${ADJ[build.glaze] || 'Custom'} ${NOUN[build.topping]}`;
const glazeLabel = () => $(`.sw[data-v="${build.glaze}"]`)?.dataset.n || 'Custom';
function renderBuild(changed) {
  $('#buildPrice').textContent = money(buildPrice());
  const nm = $('#buildName');
  if (nm.textContent !== buildName()) { nm.textContent = buildName(); gsap.fromTo(nm, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, overwrite: true }); }
  $('#glazeName').textContent = glazeLabel() + (build.pattern !== 'plain' ? ', ' + NAMES.pattern[build.pattern] : '');
  $('#buildList').textContent = [NAMES.dough[build.dough], build.filling + ' filling', glazeLabel() + ' glaze' + (build.pattern !== 'plain' ? ' with ' + NAMES.pattern[build.pattern] : ''), NAMES.topping[build.topping], NAMES.drizzle[build.drizzle]].join(' · ');
  gsap.fromTo('#buildPrice', { scale: 1.15 }, { scale: 1, duration: 0.35, ease: 'back.out(3)', overwrite: true });
  if (!changed || !donut || activeMode !== 'build') return;
  if (changed === 'filling') { donut.boop(); return; }
  donutKey = 'build';
  donut.setFlavor(buildFlavor(), { anim: changed === 'dough' || changed === 'random' ? 'flip' : changed === 'glaze' || changed === 'pattern' ? 'pour' : 'none' });
}
$$('.build [data-group]').forEach((g) => g.addEventListener('click', (e) => {
  const b = e.target.closest('[data-v]'); if (!b || b.classList.contains('is-on')) return;
  $$('[data-v]', g).forEach((x) => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-pressed', x === b); });
  build[g.dataset.group] = b.dataset.v;
  renderBuild(g.dataset.group);
}));
$('#buildRandom').addEventListener('click', () => {
  for (const grp of ['dough', 'filling', 'glaze', 'pattern', 'topping', 'drizzle']) {
    const opts = $$(`.build [data-group="${grp}"] [data-v]`), b = opts[Math.floor(Math.random() * opts.length)];
    opts.forEach((x) => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-pressed', x === b); });
    build[grp] = b.dataset.v;
  }
  renderBuild('random');
});
$('#buildAdd').addEventListener('click', (e) => addToCart({ ...buildFlavor(), name: buildName(), sub: $('#buildList').textContent, price: buildPrice() }, e.currentTarget));
renderBuild();
const ba = $('#buildAnchor');
let dragging = false, lx = 0;
ba.addEventListener('pointerdown', (e) => { dragging = true; lx = e.clientX; ba.setPointerCapture(e.pointerId); });
ba.addEventListener('pointermove', (e) => { if (!dragging || !donut) return; donut.dragSpin += (e.clientX - lx) * 0.3; lx = e.clientX; });
['pointerup', 'pointercancel'].forEach((ev) => ba.addEventListener(ev, () => (dragging = false)));

/* ---------------- explore the full menu ---------------- */
const EXPLORE = [
  { href: 'menu.html#premium', name: 'Premium donuts', count: `${PREMIUM.length} flavors`, art: [donutArt(PREMIUM[6]), donutArt(PREMIUM[0])] },
  { href: 'menu.html#classic', name: 'Classic donuts', count: `${CLASSIC.length} flavors`, art: [donutArt(CLASSIC[4]), donutArt(CLASSIC[1])] },
  { href: 'menu.html#drinks', name: 'Hot & iced drinks', count: `${DRINKS.hot.length + DRINKS.cold.length} drinks`, art: [cupArt(DRINKS.hot[0]), cupArt(DRINKS.cold[1])] },
  { href: 'menu.html#combos', name: 'Combos', count: `${COMBOS.length} pairings`, art: [cupArt(DRINKS.cold[2]), donutArt(CLASSIC[3])] },
  { href: 'menu.html#boxes', name: 'Boxes + free drink', count: '6, 12 or 24', art: [donutArt(PREMIUM[3]), cupArt(DRINKS.cold[0])] },
];
$('#exploreGrid').innerHTML = EXPLORE.map((c) => `<a class="ex" href="${c.href}"><span class="ex__art">${c.art.map((a) => `<i>${a}</i>`).join('')}</span><span class="ex__name">${c.name}</span><span class="ex__count">${c.count}</span><span class="ex__go" aria-hidden="true">&rarr;</span></a>`).join('');

/* ---------------- free drink with every box ---------------- */
let freeDrink = FREE_DRINKS[0];
function renderFreeChips() {
  $$('[data-free-drinks]').forEach((wrap) => {
    wrap.innerHTML = FREE_DRINKS.map((dk) => `<button class="fdrink${dk === freeDrink ? ' is-on' : ''}" data-n="${dk.name}" aria-pressed="${dk === freeDrink}"><span>${cupArt(dk, true)}</span>${dk.name}</button>`).join('');
  });
  $('#boxDrink').textContent = freeDrink.name;
}
document.addEventListener('click', (e) => {
  const b = e.target.closest('.fdrink'); if (!b) return;
  freeDrink = drinkByName(b.dataset.n);
  renderFreeChips();
  setBoxFreeDrink(freeDrink.name);
});
renderFreeChips();

/* ---------------- box of 6 (3D box) ---------------- */
const tray = $('#tray'), slotsEl = $('#slots'), pbox = $('#pbox');
const slots = Array(6).fill(null);
for (let i = 0; i < 6; i++) { const dv = document.createElement('div'); dv.className = 'slot'; dv.dataset.i = i; dv.dataset.n = i + 1; slotsEl.appendChild(dv); }
TRAY.forEach((f, i) => {
  const el = document.createElement('div');
  el.className = 'tdonut'; el.tabIndex = 0; el.setAttribute('role', 'button'); el.setAttribute('aria-label', `Add ${f.name}, ${money(f.price)}, to the box`);
  el.innerHTML = `<span class="plus" aria-hidden="true">+</span><span class="cnt" aria-hidden="true"></span><span class="art">${donutArt(f, 'tilt', i + 3)}</span><span class="nm">${f.name}</span><span class="pr">${money(f.price)}</span>`;
  tray.appendChild(el);
  let ghost = null, start = null;
  el.addEventListener('pointerdown', (e) => { start = { x: e.clientX, y: e.clientY }; el.setPointerCapture(e.pointerId); });
  el.addEventListener('pointermove', (e) => {
    if (!start) return;
    if (!ghost && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 8) { ghost = document.createElement('div'); ghost.className = 'drag-ghost'; ghost.innerHTML = donutArt(f, 'tilt', i + 3); document.body.appendChild(ghost); }
    if (ghost) {
      ghost.style.left = e.clientX + 'px'; ghost.style.top = e.clientY + 'px';
      const over = document.elementsFromPoint(e.clientX, e.clientY).find((x) => x.classList?.contains('slot'));
      $$('.slot').forEach((s) => s.classList.toggle('is-target', s === over));
    }
  });
  const end = (cancel) => {
    if (!start) return;
    if (ghost) {
      const over = $$('.slot').find((s) => s.classList.contains('is-target'));
      $$('.slot').forEach((s) => s.classList.remove('is-target'));
      ghost.remove(); ghost = null;
      if (!cancel) placeInBox(f, i, over ? +over.dataset.i : undefined);
    } else if (!cancel) placeInBox(f, i);
    start = null;
  };
  el.addEventListener('pointerup', () => end(false));
  el.addEventListener('pointercancel', () => end(true));
  el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); placeInBox(f, i); } });
});
function placeInBox(f, seed, idx, quiet) {
  pbox.classList.remove('is-closed');
  if (idx === undefined || slots[idx]) idx = slots.indexOf(null);
  if (idx < 0) { toast('Your box is full. Tap a donut in the box to swap it out.'); return; }
  slots[idx] = f;
  const s = slotsEl.children[idx];
  s.classList.add('is-filled');
  s.innerHTML = `<button aria-label="Remove ${f.name} from the box">${donutArt(f, 'top', seed + 3)}</button>`;
  s.firstChild.addEventListener('click', () => { slots[idx] = null; s.innerHTML = ''; s.classList.remove('is-filled'); updateBox(); });
  updateBox(quiet);
}
function updateBox(quiet) {
  const n = slots.filter(Boolean).length, sum = slots.reduce((a, f) => a + (f ? f.price : 0), 0);
  const total = n === 0 ? '' : n === 6 ? `· ${money(sum * 0.9)} (you save ${money(sum * 0.1)})` : `· ${money(sum)} so far`;
  $('#boxCount').textContent = `${n} of 6`;
  $('#boxTotal').textContent = total;
  $('#boxAdd').disabled = n < 6;
  // tray cards show how many of each are already in the box; phones get a bar with the count
  $$('.tdonut').forEach((el, k) => { const c = slots.filter((f) => f === TRAY[k]).length; el.classList.toggle('has-cnt', c > 0); $('.cnt', el).innerHTML = c ? `${c}<span> in box</span>` : ''; });
  boxbar.n.textContent = `${n} of 6`; boxbar.t.textContent = n ? (n === 6 ? money(sum * 0.9) : money(sum)) : 'Tap donuts to fill it'; boxbar.el.classList.toggle('is-full', n === 6);
  try { localStorage.setItem('gb-box6', JSON.stringify(slots.map((f) => (f ? f.name : null)))); } catch { /* storage off */ }
  if (n === 6 && !quiet) setTimeout(() => { if (slots.every(Boolean)) { pbox.classList.add('is-closed'); toast('Box complete! Pick your free drink and add it to your order.'); } }, 450);
}
$('#boxLid').addEventListener('click', () => pbox.classList.remove('is-closed'));
$('#boxLid').addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pbox.classList.remove('is-closed'); } });
function clearBox() { slots.fill(null); $$('.slot').forEach((s) => { s.innerHTML = ''; s.classList.remove('is-filled'); }); pbox.classList.remove('is-closed'); updateBox(); }
$('#boxClear').addEventListener('click', clearBox);
$('#boxAdd').addEventListener('click', (e) => {
  const sum = slots.reduce((a, f) => a + f.price, 0);
  addToCart({ ...slots[0], box: 'six', name: 'Box of 6', sub: slots.map((f) => f.name).join(', '), free: freeDrink.name, price: sum * 0.9 }, e.currentTarget);
  setTimeout(clearBox, 900);
});
// phones: a bar with the box count while you tap donuts in the tray (the box itself is further down)
const boxbar = (() => {
  const el = document.createElement('div'); el.className = 'boxbar'; el.setAttribute('aria-live', 'polite');
  el.innerHTML = '<span class="boxbar__n">0 of 6</span><span class="boxbar__t"></span><button class="btn btn--sm btn--primary" type="button">View box</button>';
  document.body.appendChild(el);
  $('button', el).addEventListener('click', () => scrollToTarget($('.box__wrap')));
  new IntersectionObserver(([en]) => el.classList.toggle('is-on', en.isIntersecting), { rootMargin: '-35% 0px -20% 0px' }).observe(tray);
  return { el, n: $('.boxbar__n', el), t: $('.boxbar__t', el) };
})();
// a half-filled box survives a reload
try { (JSON.parse(localStorage.getItem('gb-box6')) || []).forEach((n, k) => { const f = TRAY.find((x) => x.name === n); if (f) placeInBox(f, TRAY.indexOf(f), k, true); }); } catch { /* nothing saved */ }
updateBox(true);

/* ---------------- social wall ---------------- */
const TILE_BG = ['linear-gradient(135deg,#ffb27a,#ff6a13)', 'linear-gradient(135deg,#fff3e6,#ffd9b8)', 'linear-gradient(135deg,#4a2a1a,#2a150d)', 'linear-gradient(135deg,#ffe9cc,#ffc58f)', 'linear-gradient(135deg,#ff8a45,#e85706)', 'linear-gradient(135deg,#fff8f1,#f3e3d3)'];
const TILE_TAG = ['#fff', '#e85706', '#ffb27a', '#e85706', '#fff', '#e85706'];
$('#wall').innerHTML = FLAVORS.map((f, i) => `<a class="tile" href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" style="--tb:${TILE_BG[i]};--tc:${TILE_TAG[i]}" aria-label="${f.name} on Instagram (opens in a new tab)"><span class="art">${donutArt(f, 'tilt', 70 + i)}</span><span class="tag">#${f.name.split(/\s+/).filter((w) => !/^(&|and)$/i.test(w)).slice(0, 2).join('').replace(/[^A-Za-z0-9]/g, '')}</span><span class="ig"><svg viewBox="0 0 24 24" aria-hidden="true">${SOCIAL[0].icon}</svg>View on Instagram</span></a>`).join('');

/* ---------------- section animations ---------------- */
initReveals();
navHighlight();
reveal('.opt', { y: 30, opacity: 0 }, { stagger: 0.08, trigger: '.build__panel' });
reveal('.build__stage, .summary', { y: 30, opacity: 0 }, { stagger: 0.1, trigger: '.build__grid' });
reveal('.ex', { y: 40, opacity: 0, scale: 0.95 }, { stagger: 0.08, trigger: '.explore__grid', ease: 'back.out(1.6)' });
reveal('.step', { y: 40, opacity: 0 }, { stagger: 0.12, trigger: '.steps' });
reveal('.step__icon', { scale: 0.6, rotation: -15 }, { stagger: 0.12, trigger: '.steps', ease: 'back.out(2.2)' });
reveal('.tdonut', { y: 30, opacity: 0, scale: 0.9 }, { stagger: 0.05, trigger: '.box__tray', ease: 'back.out(1.8)' });
reveal('.rv', { y: 40, opacity: 0 }, { stagger: 0.12, trigger: '.reviews__grid' });
reveal('.visit__card > *', { y: 24, opacity: 0 }, { stagger: 0.07, trigger: '.visit' });
reveal('.visit__map', { scale: 0.92, opacity: 0 }, { trigger: '.visit' });
reveal('.tile', { y: 40, opacity: 0, scale: 0.92 }, { stagger: 0.07, trigger: '.wall', ease: 'back.out(1.6)' });
reveal('.socials--lg .soc', { y: 20, opacity: 0 }, { stagger: 0.08, trigger: '.socials--lg', start: 'top 95%' });
gsap.fromTo('.box3d__scene', { rotateX: 70, rotateZ: -14, y: 60 }, { rotateX: 54, rotateZ: -4, y: 0, duration: 1.2, ease: 'power3.out', scrollTrigger: once('.box3d', 'top 85%'), clearProps: 'all' });
const mm = gsap.matchMedia();
mm.add('(min-width: 981px)', () => { gsap.to('#stepsLine', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.steps', start: 'top 75%', end: 'bottom 70%', scrub: 0.6 } }); });
mm.add('(max-width: 980px)', () => { gsap.to('#stepsLine', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.steps', start: 'top 70%', end: 'bottom 60%', scrub: 0.6 } }); });
if (!reduce) {
  gsap.to('.hero__copy', { y: -60, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__orb--a', { yPercent: 40, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
}

/* ---------------- loader -> hero intro ---------------- */
runLoader((tl) => {
  tl.fromTo('.hero__title .line > span', { yPercent: 110 }, { yPercent: 0, duration: 0.9, stagger: 0.1, ease: 'power4.out' }, '-=0.3')
    .fromTo('.hero__stage .display', { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.1, ease: 'back.out(1.3)' }, '<')
    .fromTo('.pill, .hero__lead, .hero__ctas, .hero__facts', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.08 }, '-=0.6')
    .fromTo('.hero__picker', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, '-=0.4')
    .fromTo('.gcard', { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, stagger: 0.12, ease: 'back.out(2)' }, '-=0.4')
    .fromTo('.hero__social', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, '-=0.5')
    ;
});
