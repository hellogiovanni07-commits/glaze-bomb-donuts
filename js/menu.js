// Glaze Bomb - menu page
import { initChat } from './chat.js?v=46';
import {
  gsap, ScrollTrigger, $, $$, reduce, fine, money, FLAVORS, PREMIUM, CLASSIC, DRINKS, COMBOS, BOXES, FREE_DRINKS, drinkByName, ALL_DONUTS,
  donutArt, cupArt, scrollToTarget, setBoxFreeDrink, cardLine, hasNuts, TASTES, splitWords, addToCart, initOrderUI, initReveals, reveal, runLoader, afterIntro, initBand, once,
} from './common.js?v=46';

splitWords();
initOrderUI();
initChat();
initBand();

/* ---------------- hero: flavor of the week in 3D ---------------- */
const FOTW = FLAVORS[2];
let heroFlavor = FOTW;   // the donut on the pedestal (tap any donut in the orbit to swap it)
$('#fotwName').textContent = FOTW.name; $('#fotwPrice').textContent = money(FOTW.price);
$('#fotwAdd').addEventListener('click', (e) => addToCart({ ...heroFlavor, sub: (heroFlavor.fill || 'Vanilla custard') + ' filling' }, e.currentTarget));
let donut = null;
// 3D modules are fetched only after the intro, so the menu itself never waits for three.js
const load3D = () => Promise.all([import('./donut.js?v=46'), import('./drinks.js?v=46')]);
let three3D = null;
const with3D = (fn) => afterIntro(() => { three3D = three3D || load3D(); three3D.then(([d, k]) => fn(d.DonutScene, k.DrinkScene, d)).catch((e) => console.warn('3D unavailable', e)); });
with3D((DonutScene) => { try { donut = new DonutScene($('#stage')); setTimeout(() => donut?.prewarm([FOTW]), 2500); } catch (e) { console.warn('WebGL unavailable', e); $('#stage').remove(); } });
const anchor = $('.mhero__anchor'), heroSec = $('.mhero');
const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
if (fine) addEventListener('pointermove', (e) => { mouse.tx = e.clientX / innerWidth - 0.5; mouse.ty = e.clientY / innerHeight - 0.5; }, { passive: true });
let shown = false;
gsap.ticker.add(() => {
  if (!donut) return;
  const r = heroSec.getBoundingClientRect(), vis = r.bottom > innerHeight * 0.25;
  donut.setAnchor(vis ? anchor.getBoundingClientRect() : null, { rx: -0.95, fill: 0.96 });
  donut.autoSpin = reduce ? 0 : 0.25;
  if (!shown) { shown = true; donut.setFlavor(heroFlavor); }
  mouse.x += (mouse.tx - mouse.x) * 0.06; mouse.y += (mouse.ty - mouse.y) * 0.06;
  donut.mouse.x = mouse.x; donut.mouse.y = mouse.y;
  donut.render();
});
addEventListener('click', (e) => { if (donut && !e.target.closest('button, a') && donut.hitTest(e.clientX, e.clientY)) donut.boop(); });

/* ---------------- category shortcuts ---------------- */
const CATS = [
  ['#premium', 'Premium', `${PREMIUM.length}`, donutArt(PREMIUM[6], 'top', 1, true)],
  ['#classic', 'Classic', `${CLASSIC.length}`, donutArt(CLASSIC[3], 'top', 1, true)],
  ['#drinks', 'Drinks', `${DRINKS.hot.length + DRINKS.cold.length}`, cupArt(DRINKS.cold[1], true)],
  ['#combos', 'Combos', `${COMBOS.length}`, cupArt(DRINKS.hot[1], true)],
  ['#boxes', 'Boxes', '+ free drink', donutArt(PREMIUM[3], 'top', 1, true)],
];
$('#mCats').innerHTML = CATS.map(([h, n, c, art]) => `<a class="mcat" href="${h}"><span>${art}</span>${n} <small>${c}</small></a>`).join('');

/* ---------------- hero: a busy counter of donuts + drinks around the 3D donut ---------------- */
const byName = (n) => ALL_DONUTS.find((f) => f.name === n) || drinkByName(n);
const isDrink = (it) => !!drinkByName(it.name);
const pic = (it, view) => (isDrink(it) ? cupArt(it) : donutArt(it, view));
const ORBIT_IN = ['Strawberry Sprinkle', 'Hazelnut Velvet', 'Matcha Web', 'Caramel Biscuit Crunch', 'Ube Cheese Cloud', 'Choco Crumble Stripe', 'Snow Web', 'Mallow Party'];
const ORBIT_OUT = ['Iced Caramel Macchiato', 'Wafer Crunch Bar', 'Hot Chocolate', 'Strawberry Glaze', 'Iced Matcha Latte', 'Mango Graham', 'Mocha Frappe', 'Cookies & Cream Latte', 'Cafe Latte', 'Orange Cold Brew'];
// [name, x %, y %, size px, parallax depth, blur px, tilt deg, also on phones]
const CLOUD = [
  ['Choco Sprinkle', 3, 12, 92, 0.6, 0, -14, 1], ['Iced Spanish Latte', 17, 7, 64, 0.3, 2, 14, 0], ['Almond Snowcap', 33, 5, 78, 0.5, 0, -6, 0],
  ['Spanish Latte', 47, 13, 58, 0.25, 3, 10, 0], ['Berry Coconut Snow', 0, 47, 112, 0.9, 0, 12, 1], ['Iced Americano', 4, 84, 84, 0.7, 0, -10, 1],
  ['Cappuccino Swirl', 20, 93, 100, 0.8, 0, 8, 0], ['Matcha Drizzle', 37, 96, 66, 0.35, 2, -16, 0], ['Hot Matcha Latte', 53, 78, 70, 0.5, 0, 12, 0],
  ['Cookie Speckle', 55, 25, 54, 0.25, 3, -8, 0], ['Caramel Macchiato', 96, 9, 78, 0.6, 0, 16, 1], ["S'mores Campfire", 98, 50, 100, 0.85, 0, -12, 1],
  ['Tiramisu Dust', 91, 92, 72, 0.4, 2, 10, 1], ['Original Glaze', 64, 5, 60, 0.3, 2, -20, 0],
];
const FRONT = [['Hazelnut Crunch', 50, 90, 150, 1.4, 1.5, -18, 0], ['Classic Americano', 99, 76, 140, 1.5, 1.5, 10, 1]];
const HSPR = ['#ff6a13', '#ffd23f', '#3ec6ff', '#7cf29c', '#a974ff', '#ff8fb4', '#3a1e10'];
function orbitHTML(names, view) {
  return names.map((n, i) => {
    const it = byName(n), d = isDrink(it);
    return `<button class="oi" style="--a:${((360 / names.length) * i).toFixed(1)}deg" data-n="${n}" aria-label="${d ? `See ${n} at the drinks counter` : `Show ${n} in 3D`}"><span class="oi__in"><span class="oi__pop">${pic(it, view)}</span><span class="oi__tag">${n}<b>${money(it.price)}</b></span></span></button>`;
  }).join('');
}
$('#orbitIn').innerHTML = orbitHTML(ORBIT_IN, 'top');
$('#orbitOut').innerHTML = orbitHTML(ORBIT_OUT, 'tilt');
const cloudItem = ([n, x, y, s, dp, bl, r, m], front) => `<span class="hc${m ? ' hc--m' : ''}${front ? ' hc--front' : ''}" data-depth="${dp}" style="--x:${x}%;--y:${y}%;--s:${s}px;--r:${r}deg;--b:${bl}px;--t:${(3.6 + (s % 7) * 0.55).toFixed(2)}s"><span class="hc__in">${pic(byName(n), 'tilt')}</span></span>`;
const sprinkles = Array.from({ length: 30 }, (_, k) => `<i class="spr" style="--x:${(k * 37 + 11) % 100}%;--y:${(k * 53 + 7) % 100}%;--c:${HSPR[k % HSPR.length]};--r:${(k * 47) % 180}deg;--t:${(3 + (k % 5) * 0.7).toFixed(1)}s"></i>`).join('');
$('#mCloud').innerHTML = sprinkles + CLOUD.map((c) => cloudItem(c)).join('');
$('#mFront').innerHTML = FRONT.map((c) => cloudItem(c, true)).join('');
function heroShow(f) {
  heroFlavor = f;
  $('#fotwLabel').textContent = f === FOTW ? 'Flavor of the week' : 'Now showing';
  $('#fotwName').textContent = f.name; $('#fotwPrice').textContent = money(f.price);
  donut?.setFlavor(f);
  gsap.fromTo('.fotw', { scale: 0.9 }, { scale: 1, duration: 0.5, ease: 'back.out(3)', overwrite: true });
}
$('.mhero__stage').addEventListener('click', (e) => {
  const b = e.target.closest('.oi'); if (!b) return;
  const it = byName(b.dataset.n);
  gsap.fromTo($('.oi__pop', b), { scale: 1.4 }, { scale: 1, duration: 0.7, ease: 'elastic.out(1, .4)', clearProps: 'transform' });
  if (!isDrink(it)) { heroShow(it); return; }
  const t = DRINKS.hot.includes(it) ? 'hot' : 'cold', i = DRINKS[t].indexOf(it);
  if (t !== temp) setTemp(t);
  bar?.select(i); highlight(t, i);
  scrollToTarget($('#drinks'));
});
// the hero's animations pause while it is scrolled out of view
new IntersectionObserver(([en]) => $('.mhero').classList.toggle('is-off', !en.isIntersecting)).observe($('.mhero'));
// floating donuts drift with the pointer, each at its own depth
if (fine && !reduce) {
  const cl = $$('.mhero .hc'), hm = { x: 0, y: 0 }, heroEl = $('.mhero');
  gsap.ticker.add(() => {
    if (heroEl.getBoundingClientRect().bottom < 0) return;
    hm.x += (mouse.tx - hm.x) * 0.06; hm.y += (mouse.ty - hm.y) * 0.06;
    for (const el of cl) { const d = +el.dataset.depth; el.style.transform = `translate3d(${(hm.x * d * -46).toFixed(1)}px, ${(hm.y * d * -30).toFixed(1)}px, 0)`; }
  });
}

/* ---------------- donut grids ---------------- */
function card(f, i, grid) {
  return `<article class="mcard" data-i="${i}">${f.tag ? `<span class="mcard__tag">${f.tag}</span>` : ''}<span class="mcard__badge">${money(f.price)}</span>
    <span class="mcard__art">${donutArt(f, 'tilt', i + (grid === 'p' ? 11 : 41))}</span>
    <h3 class="mcard__name">${f.name}</h3><span class="mcard__fill">${f.fill || 'Vanilla custard'} filling</span>
    <span class="mcard__line">${cardLine(f)}</span>${hasNuts(f) ? '<span class="mcard__allergen">Contains nuts</span>' : ''}
    <button class="mcard__add" data-grid="${grid}" data-i="${i}" aria-label="Add ${f.name} to your order">+ Add</button></article>`;
}
$('#premGrid').innerHTML = PREMIUM.map((f, i) => card(f, i, 'p')).join('');
$('#clasGrid').innerHTML = CLASSIC.map((f, i) => card(f, i, 'c')).join('');
// taste filters above each grid: chips with a live count, cards that don't match fold away
$$('[data-filter]').forEach((bar) => {
  const list = bar.dataset.filter === 'premGrid' ? PREMIUM : CLASSIC, grid = $('#' + bar.dataset.filter);
  const tastes = TASTES.filter((t) => t.key === 'all' || list.some(t.test));
  bar.innerHTML = tastes.map((t, k) => `<button type="button" class="tchip${k ? '' : ' is-on'}" data-t="${t.key}" aria-pressed="${!k}">${t.label} <small>${list.filter(t.test).length}</small></button>`).join('');
  bar.addEventListener('click', (e) => {
    const b = e.target.closest('.tchip'); if (!b) return;
    const t = TASTES.find((x) => x.key === b.dataset.t);
    $$('.tchip', bar).forEach((x) => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-pressed', x === b); });
    $$('.mcard', grid).forEach((c) => c.classList.toggle('is-out', !t.test(list[+c.dataset.i])));
    ScrollTrigger.refresh();
  });
});
document.addEventListener('click', (e) => {
  const b = e.target.closest('.mcard__add'); if (!b) return;
  const f = (b.dataset.grid === 'p' ? PREMIUM : CLASSIC)[+b.dataset.i];
  addToCart({ ...f, sub: (f.fill || 'Vanilla custard') + ' filling' }, b.closest('.mcard').querySelector('.mcard__art'));
});

/* ---------------- drinks ---------------- */
let temp = 'hot', bar = null;
with3D((_, DrinkScene) => { try { bar = new DrinkScene($('#drinksCanvas'), { mode: 'bar', onSelect: (i) => highlight(temp, i) }); bar.setDrinks(DRINKS[temp]); bar.select(curDrink); } catch (e) { console.warn(e); } });
let curDrink = 0;
function drinkRows(list, t) {
  return list.map((dk, i) => `<div class="drink" data-t="${t}" data-i="${i}"><button class="drink__pick" aria-label="Show ${dk.name} in 3D"><span class="drink__art">${cupArt(dk, true)}</span><span class="drink__txt"><b>${dk.name}</b><small>${dk.desc}</small></span></button><span class="drink__price">${money(dk.price)}</span><button class="drink__add" aria-label="Add ${dk.name} to your order">+</button></div>`).join('');
}
$('#hotList').innerHTML = drinkRows(DRINKS.hot, 'hot');
$('#coldList').innerHTML = drinkRows(DRINKS.cold, 'cold');
function setTemp(t) {
  temp = t;
  $$('.drinks__toggle button').forEach((x) => { const on = x.dataset.temp === t; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on); });
  bar?.setDrinks(DRINKS[t]);
}
function highlight(t, i) {
  curDrink = i;
  $$('.mdrinks .drink').forEach((r) => r.classList.toggle('is-on', r.dataset.t === t && +r.dataset.i === i));
  $('#drinkName').textContent = DRINKS[t][i].name;
}
$$('.mdrinks .drink').forEach((row) => {
  const t = row.dataset.t, i = +row.dataset.i;
  $('.drink__pick', row).addEventListener('click', () => { if (t !== temp) setTemp(t); bar?.select(i); highlight(t, i); });
  $('.drink__add', row).addEventListener('click', (e) => addToCart({ ...DRINKS[t][i], kind: 'drink', sub: t === 'hot' ? 'Hot drink' : 'Iced drink' }, e.currentTarget));
});
$$('.drinks__toggle button').forEach((b) => b.addEventListener('click', () => { if (b.dataset.temp !== temp) { setTemp(b.dataset.temp); bar?.select(0); highlight(b.dataset.temp, 0); } }));
setTemp('hot'); bar?.select(0); highlight('hot', 0);

/* ---------------- combos: 3D art, animated + interactive ---------------- */
// deep enough at the bottom (where the copy sits) for white text at 4.5:1
const COMBO_BG = ['radial-gradient(110% 120% at 20% 10%, #f2701f, #c94700 50%, #a33a00)', 'radial-gradient(90% 120% at 20% 20%, #6e4630, #3a1e10 70%)', 'radial-gradient(110% 120% at 20% 10%, #f59a52, #c24a00 48%, #9c3d06)'];
const SPR = ['#ff6a13', '#ffd23f', '#ffffff', '#3ec6ff', '#7cf29c', '#a974ff', '#3a1e10'];
$('#comboGrid').innerHTML = COMBOS.map((c, i) => {
  const cup = drinkByName(c.drinks[0]);
  const crumbs = Array.from({ length: 14 }, (_, k) => `<i style="--x:${(k * 37 + i * 13) % 96}%;--d:${(k % 7) * 0.55}s;--c:${SPR[k % SPR.length]};--s:${(0.6 + (k % 3) * 0.3).toFixed(1)}"></i>`).join('');
  return `<article class="combo" style="--cb:${COMBO_BG[i]}">
    <div class="combo__art" data-i="${i}" role="button" tabindex="0" aria-label="Play with the ${c.name} combo">
      <span class="combo__shine" aria-hidden="true"></span>
      <span class="combo__crumbs" aria-hidden="true">${crumbs}</span>
      <span class="c c--cup" data-depth="0.4" data-dir="0"><span class="c__in">${cupArt(cup)}</span></span>
      ${c.donuts.slice(0, 3).map((dn, k) => `<span class="c c--d${k + 1}" data-depth="${[1, 1.25, 1.7][k]}" data-dir="${[-1, 1, 0][k]}"><span class="c__in">${donutArt(dn, 'tilt', 60 + i * 3 + k)}</span></span>`).join('')}
      <span class="combo__hint" aria-hidden="true">tap for sprinkles!</span>
    </div>
    <h3 class="combo__name">${c.name}</h3><ul>${c.lines.map((l) => `<li>${l}</li>`).join('')}</ul>
    <div class="combo__foot"><span class="combo__price">${money(c.price)}</span><button class="btn btn--sm" data-combo="${i}">Add combo</button></div></article>`;
}).join('');
$$('[data-combo]').forEach((b) => b.addEventListener('click', () => {
  const c = COMBOS[+b.dataset.combo];
  addToCart({ ...c.donuts[0], artName: c.donuts[0].name, comboCup: c.drinks[0], name: c.name + ' combo', sub: c.lines.join(' + '), price: c.price }, b.closest('.combo').querySelector('.combo__art'));
  comboBurst(b.closest('.combo').querySelector('.combo__art'));
}));

function comboBurst(art, px, py) {
  const r = art.getBoundingClientRect();
  const x = px ?? r.left + r.width / 2, y = py ?? r.top + r.height * 0.55;
  if (!reduce) for (let k = 0; k < 22; k++) {
    const sp = document.createElement('i'); sp.className = 'csprinkle'; sp.style.background = SPR[k % SPR.length];
    art.appendChild(sp);
    const ang = Math.random() * Math.PI * 2, dist = 55 + Math.random() * 80;
    gsap.set(sp, { left: x - r.left, top: y - r.top, rotation: Math.random() * 360 });
    gsap.timeline({ onComplete: () => sp.remove() })
      .to(sp, { x: Math.cos(ang) * dist, y: Math.sin(ang) * dist - 34, rotation: '+=' + (220 + Math.random() * 320), duration: 0.55, ease: 'power3.out' })
      .to(sp, { y: '+=80', opacity: 0, duration: 0.55, ease: 'power1.in' });
  }
  $$('.c', art).forEach((p, k) => {
    const el = p.querySelector('.c__in > *'); if (!el) return;
    const cup = p.classList.contains('c--cup');
    gsap.timeline({ delay: k * 0.06 })
      .to(el, { y: cup ? -20 : -48 - k * 8, scaleX: 0.9, scaleY: 1.1, duration: 0.28, ease: 'power2.out' })
      .to(el, { y: 0, scaleX: 1.14, scaleY: 0.86, duration: 0.3, ease: 'power2.in' })
      .to(el, { scaleX: 1, scaleY: 1, duration: 0.6, ease: 'elastic.out(1, .4)' });
    if (cup) gsap.fromTo(el, { rotation: -10 }, { rotation: 0, duration: 0.9, ease: 'elastic.out(1, .3)' });
    else gsap.fromTo(el, { rotationY: 0 }, { rotationY: 360, transformPerspective: 600, duration: 0.62, delay: k * 0.06, ease: 'power2.inOut' });
  });
  gsap.to($('.combo__hint', art), { opacity: 0, duration: 0.3 });
}

$$('.combo').forEach((card, i) => {
  const art = $('.combo__art', card), parts = $$('.c', art);
  // entrance: the cup drops in, donuts slide in from the sides
  const enter = gsap.timeline({ paused: true, defaults: { ease: 'back.out(1.7)' } })
    .fromTo($('.c--cup', art), { y: -150, opacity: 0 }, { y: 0, opacity: 1, duration: 0.95, ease: 'bounce.out' })
    .fromTo($('.c--d1', art), { x: -160, rotation: -120, opacity: 0 }, { x: 0, rotation: 0, opacity: 1, duration: 0.85 }, 0.18)
    .fromTo($('.c--d2', art), { x: 160, rotation: 120, opacity: 0 }, { x: 0, rotation: 0, opacity: 1, duration: 0.85 }, 0.26)
    .fromTo($('.combo__hint', art), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5 }, 0.9);
  if ($('.c--d3', art)) enter.fromTo($('.c--d3', art), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7 }, 0.5);
  ScrollTrigger.create({ trigger: card, start: 'top 88%', once: true, onEnter: () => enter.play() });
  // idle: everything floats on its own rhythm
  if (!reduce) $$('.c__in', art).forEach((el, k) => gsap.to(el, { y: -6 - k * 2, rotation: k % 2 ? 3 : -3, duration: 1.6 + k * 0.37, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: k * 0.25 }));
  // pointer: the card tilts in 3D, layers move at their own depth, donuts spread on hover
  if (fine && !reduce) {
    const tx = gsap.quickTo(art, 'rotationY', { duration: 0.5, ease: 'power3' }), ty = gsap.quickTo(art, 'rotationX', { duration: 0.5, ease: 'power3' });
    const px = parts.map((p) => [gsap.quickTo(p, 'x', { duration: 0.6, ease: 'power3' }), gsap.quickTo(p, 'y', { duration: 0.6, ease: 'power3' }), +p.dataset.depth]);
    gsap.set(art, { transformPerspective: 700 });
    card.addEventListener('pointermove', (e) => {
      const r = art.getBoundingClientRect(), mx = (e.clientX - r.left) / r.width - 0.5, my = (e.clientY - r.top) / r.height - 0.5;
      tx(mx * 16); ty(-my * 12);
      px.forEach(([qx, qy, d]) => { qx(mx * d * 22); qy(my * d * 12); });
      art.style.setProperty('--mx', (mx + 0.5) * 100 + '%'); art.style.setProperty('--my', (my + 0.5) * 100 + '%');
    });
    card.addEventListener('pointerenter', () => parts.forEach((p) => gsap.to(p, { xPercent: +p.dataset.dir * 7, yPercent: p.classList.contains('c--cup') ? -8 : 0, scale: 1.06, duration: 0.5, ease: 'back.out(2)' })));
    card.addEventListener('pointerleave', () => {
      tx(0); ty(0); px.forEach(([qx, qy]) => { qx(0); qy(0); });
      parts.forEach((p) => gsap.to(p, { xPercent: 0, yPercent: 0, scale: 1, duration: 0.8, ease: 'elastic.out(1, .45)' }));
    });
  }
  art.addEventListener('click', (e) => comboBurst(art, e.clientX, e.clientY));
  art.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); comboBurst(art); } });
});

/* ---------------- boxes + free drink ---------------- */
let freeDrink = FREE_DRINKS[0];
let combo = null;
with3D((_, DrinkScene) => { try { combo = new DrinkScene($('#dealCanvas'), { mode: 'combo', donutModel: donut ? (f) => donut.makeModel(f, { seg: [112, 60], dseg: [72, 44] }) : null }); combo.setCombo(freeDrink, PREMIUM.slice(0, 6)); } catch (e) { console.warn(e); } });
function renderFree() {
  $$('[data-free-drinks]').forEach((w) => { w.innerHTML = FREE_DRINKS.map((dk) => `<button class="fdrink${dk === freeDrink ? ' is-on' : ''}" data-n="${dk.name}" aria-pressed="${dk === freeDrink}"><span>${cupArt(dk, true)}</span>${dk.name}</button>`).join(''); });
}
document.addEventListener('click', (e) => {
  const b = e.target.closest('.fdrink'); if (!b) return;
  freeDrink = drinkByName(b.dataset.n); renderFree();
  combo?.setCombo(freeDrink, PREMIUM.slice(0, 6));
  setBoxFreeDrink(freeDrink.name);
});
renderFree();
$('#boxTable').innerHTML = BOXES.map((bx, i) => `<article class="bcard"><div class="bcard__art" aria-hidden="true">${bx.art.map((f, k) => `<span>${donutArt(f, 'tilt', 30 + i * 3 + k)}</span>`).join('')}</div>
  <h3>${bx.kind}</h3><p>${bx.note}</p>
  ${[6, 12, 24].map((n) => `<div class="brow"><b>Box of ${n}</b><span>${money(bx.prices[n])}</span><button data-box="${i}" data-n="${n}" aria-label="Add ${bx.kind} box of ${n} to your order">+</button></div>`).join('')}</article>`).join('');
$$('[data-box]').forEach((b) => b.addEventListener('click', (e) => {
  const bx = BOXES[+b.dataset.box], n = +b.dataset.n;
  addToCart({ ...bx.art[0], box: bx.kind.toLowerCase(), name: `${bx.kind} box of ${n}`, sub: bx.note, free: freeDrink.name, price: bx.prices[n] }, e.currentTarget);
}));

/* ---------------- category bar highlight ----------------
   Measured on every scroll (not trigger callbacks, which can miss an update): the current chip is the last
   section whose top has passed 40% of the screen, so a section is marked as soon as its heading is in view. */
const catLinks = $$('#catbar a'), catSecs = catLinks.map((a) => $(a.getAttribute('href')));
let catCur = -2;
function markCat() {
  const line = innerHeight * 0.4;
  let k = -1;
  catSecs.forEach((s, i) => { if (s && s.getBoundingClientRect().top <= line) k = i; });
  if (k === catCur) return;
  catCur = k;
  catLinks.forEach((a, i) => { a.classList.toggle('is-current', i === k); if (i === k) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); });
  const bar = $('#catbar'), a = catLinks[k];
  if (a && bar.scrollWidth > bar.clientWidth) bar.scrollTo({ left: a.offsetLeft - 20, behavior: 'smooth' });
}
addEventListener('scroll', markCat, { passive: true });
addEventListener('resize', markCat);
markCat();

/* ---------------- reveals + intro ---------------- */
initReveals();
reveal('#premGrid .mcard', { y: 40, opacity: 0, scale: 0.94 }, { stagger: 0.04, trigger: '#premGrid', ease: 'back.out(1.6)' });
reveal('#clasGrid .mcard', { y: 40, opacity: 0, scale: 0.94 }, { stagger: 0.04, trigger: '#clasGrid', ease: 'back.out(1.6)' });
reveal('.mdrinks > *', { y: 40, opacity: 0 }, { stagger: 0.1, trigger: '.mdrinks' });
reveal('.combo', { y: 50, opacity: 0, rotation: -2 }, { stagger: 0.12, trigger: '.combos' });
reveal('.boxdeal .deal__card', { y: 40, opacity: 0 }, { trigger: '.boxdeal' });
reveal('.bcard', { y: 50, opacity: 0 }, { stagger: 0.1, trigger: '.btable' });
runLoader((tl) => {
  tl.fromTo('.mhero__title .line > span', { yPercent: 110 }, { yPercent: 0, duration: 0.9, stagger: 0.1, ease: 'power4.out' }, '-=0.3')
    .fromTo('.mhero .display', { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.1, ease: 'back.out(1.3)' }, '<')
    .fromTo('.mhero .kicker, .mhero__lead, .mcat, .fotw', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.06 }, '-=0.6')
    .fromTo('.mhero .hc__in, .mhero .oi__pop', { scale: 0 }, { scale: 1, duration: 0.6, stagger: { each: 0.025, from: 'random' }, ease: 'back.out(2.2)', clearProps: 'transform' }, '-=0.7')
    .fromTo('.mhero__hint', { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, '-=0.3')
    ;
});
