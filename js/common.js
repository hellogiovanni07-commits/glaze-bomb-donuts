// Glaze Bomb - shared data, art, cart, nav and motion helpers (home + menu page)
export const gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
gsap.registerPlugin(ScrollTrigger);
export const $ = (s, el = document) => el.querySelector(s);
export const $$ = (s, el = document) => [...el.querySelectorAll(s)];
export const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
export const money = (n) => '$' + n.toFixed(2);

/* ================= DATA ================= */
export * from './data.js?v=46';
import { art3dSrc, boxArtKey, FREE_DRINKS } from './data.js?v=46';

/* ================= 2D ART ================= */
const DOUGH2D = { classic: '#cf914c', cocoa: '#5a2e1a', matcha: '#97a24f' };
const CRUMB2D = { crumbs: ['#1d1210', '#3a2419'], graham: ['#c98a4b', '#b5763c'], biscuit: ['#c47f3e', '#d8954f'], sesame: ['#151515'], sprinkles: ['#ff6b2c', '#ffd23f', '#3ec6ff', '#7cf29c', '#ffffff'], pearls: ['#ffffff', '#ffe9c9'], nuts: ['#c8955f', '#a8703f', '#e3b27a'], coffeecrumb: ['#5a3420', '#3a2419', '#7a4a2a'] };
let uid = 0;
export function donutSVG(f, seed = 1) {
  let s = (seed * 9301 + 49297) % 233280;
  const id = 'd' + (++uid);
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const P = (x, y) => `${x.toFixed(1)},${y.toFixed(1)}`;
  const ph = rnd() * 6, drips = Array.from({ length: 5 }, () => rnd() * Math.PI * 2), cov = (f.cover || 1.1) > 1.25 ? 41 : 36;
  const pts = [];
  for (let i = 0; i <= 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    let rr = cov + Math.sin(a * 5 + ph) * 1.3 + Math.sin(a * 9 + ph * 2) * 0.7;
    for (const dd of drips) { let x = Math.abs(a - dd); x = Math.min(x, Math.PI * 2 - x); rr += 3.2 * Math.exp(-((x / 0.17) ** 2)); }
    rr = Math.min(rr, 44);
    pts.push(P(50 + Math.cos(a) * rr, 50 + Math.sin(a) * rr));
  }
  const gp = `M${pts.join('L')}Z`;
  const polar = (maxR) => { const a = rnd() * Math.PI * 2, rr = Math.sqrt(rnd()) * maxR; return [50 + Math.cos(a) * rr, 50 + Math.sin(a) * rr]; };
  const specks = (n, cols, r0, r1, maxR) => { let o = ''; for (let i = 0; i < n; i++) { const [x, y] = polar(maxR); o += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(r0 + rnd() * (r1 - r0)).toFixed(1)}" fill="${cols[i % cols.length]}"/>`; } return o; };
  let pat = '';
  if (f.pattern === 'marble') for (let k = 1; k <= 3; k++) { let dd = ''; for (let i = 0; i <= 64; i++) { const a = (i / 64) * Math.PI * 2, rr = k * 8.5 + Math.cos(4 * a) * (2 + k * 1.8); dd += (i ? 'L' : 'M') + P(50 + Math.cos(a) * rr, 50 + Math.sin(a) * rr); } pat += `<path d="${dd}" fill="none" stroke="${f.patternColor}" stroke-width="1.6"/>`; }
  if (f.pattern === 'dust') pat += specks(110, [f.patternColor], 0.4, 0.9, 32);
  if (f.pattern === 'crumbcoat') pat += specks(240, f.crumbColors, 0.5, 1.4, 38);
  let dz = '';
  if (f.drizzle) {
    const st = f.drizzleStyle || 'lines';
    if (st === 'spiral') { let dd = ''; for (let i = 0; i <= 140; i++) { const a = i * 0.32, rr = 3 + i * 0.22; dd += (i ? 'L' : 'M') + P(50 + Math.cos(a) * rr, 50 + Math.sin(a) * rr); } dz = `<path d="${dd}" fill="none" stroke="${f.drizzle}" stroke-width="1.7" stroke-linecap="round"/>`; }
    else for (let i = 0; i < 7; i++) {
      const o = -27 + i * 9;
      dz += `<path d="M${P(50 + o - 22, 28)} Q${P(50 + o + 4, 50)} ${P(50 + o + 22, 72)}" fill="none" stroke="${f.drizzle}" stroke-width="1.8" stroke-linecap="round"/>`;
      if (st === 'cross') dz += `<path d="M${P(50 + o + 22, 28)} Q${P(50 + o - 4, 50)} ${P(50 + o - 22, 72)}" fill="none" stroke="${f.drizzle}" stroke-width="1.5" stroke-linecap="round"/>`;
    }
  }
  let tops = '';
  for (const t of f.toppings || []) {
    if (CRUMB2D[t]) tops += specks({ crumbs: 80, graham: 70, biscuit: 14, sesame: 60, sprinkles: 36, pearls: 24, nuts: 50, coffeecrumb: 70 }[t], CRUMB2D[t], t === 'sesame' ? 0.5 : 0.9, t === 'sesame' ? 0.8 : 2.1, 30);
    if (t === 'cookie') tops += `<g transform="rotate(${(rnd() * 40 - 20).toFixed(0)} 50 50)"><rect x="35" y="41" width="30" height="20" rx="3" fill="#b8702c" stroke="#94561f" stroke-width="1.2" stroke-dasharray="1.6 1.2"/></g>`;
    if (t === 'jam') tops += `<path d="M26 34c6-6 16-4 17 4 1 7-6 11-12 10s-10-8-5-14z" fill="#f39a07"/><ellipse cx="31" cy="36" rx="4" ry="2" fill="#fff" opacity=".5"/>`;
    if (t === 'almonds') for (let i = 0; i < 22; i++) { const [x, y] = polar(29); tops += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="3.4" ry="1.7" fill="#ecd3a6" stroke="#c99e62" stroke-width=".6" transform="rotate(${(rnd() * 180).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`; }
    if (t === 'cheese') for (let i = 0; i < 46; i++) { const [x, y] = polar(30); tops += `<rect x="${(x - 2.6).toFixed(1)}" y="${(y - 0.8).toFixed(1)}" width="5.2" height="1.6" rx=".8" fill="${i % 3 ? '#ffd75e' : '#f2bf34'}" transform="rotate(${(rnd() * 180).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`; }
    if (t === 'mallows') for (let i = 0; i < 9; i++) { const [x, y] = polar(26); tops += `<rect x="${(x - 3).toFixed(1)}" y="${(y - 3).toFixed(1)}" width="6" height="6" rx="2" fill="#fffaf2" stroke="#ead9c6" stroke-width=".6"/>`; }
    if (t === 'coconut') for (let i = 0; i < 40; i++) { const [x, y] = polar(31); tops += `<rect x="${(x - 1.8).toFixed(1)}" y="${(y - 0.5).toFixed(1)}" width="3.6" height="1" rx=".5" fill="#fff" transform="rotate(${(rnd() * 180).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`; }
    if (t === 'wafer') tops += `<g transform="rotate(-28 50 50)"><rect x="24" y="45" width="52" height="11" rx="3" fill="#c98a4b" stroke="#8f5524" stroke-width="1"/><path d="M30 45v11M36 45v11M42 45v11M48 45v11M54 45v11M60 45v11M66 45v11M72 45v11" stroke="#a8703f" stroke-width=".8"/><rect x="24" y="43" width="52" height="4" rx="2" fill="#4a2a1a"/></g>`;
  }
  return `<svg viewBox="0 0 100 100" aria-hidden="true"><defs><clipPath id="c${id}"><path d="${gp}"/></clipPath><radialGradient id="g${id}" cx=".4" cy=".35"><stop offset="0" stop-color="#fff" stop-opacity=".4"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>`
    + `<circle cx="50" cy="51.5" r="45" fill="${DOUGH2D[f.dough] || DOUGH2D.classic}"/><circle cx="50" cy="51.5" r="45" fill="none" stroke="#f7e2bd" stroke-width="2.4" opacity=".7"/>`
    + `<path d="${gp}" fill="${f.glaze}"/><g clip-path="url(#c${id})">${pat}${dz}</g><path d="${gp}" fill="url(#g${id})"/>${tops}</svg>`;
}
// side view cup icon (hot paper cup or iced clear cup)
export function cupSVG(dk) {
  const id = 'k' + (++uid);
  if (dk.temp === 'hot') {
    return `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M30 30h40l-5 60H35z" fill="${dk.cup}"/><path d="M30 30h40l-5 60H35z" fill="url(#s${id})"/><defs><linearGradient id="s${id}" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".18"/><stop offset=".45" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient></defs>`
      + `<g fill="none" stroke="${dk.motif}" stroke-width="2.2"><circle cx="50" cy="58" r="8"/><circle cx="50" cy="58" r="4"/><circle cx="41" cy="70" r="5"/><circle cx="59" cy="69" r="5.5"/></g>`
      + `<path d="M27 30c0-4 2-7 6-7h34c4 0 6 3 6 7z" fill="${dk.lid}"/><rect x="25" y="28" width="50" height="5" rx="2.5" fill="${dk.lid}"/><rect x="25" y="28" width="50" height="5" rx="2.5" fill="#000" opacity=".12"/><ellipse cx="58" cy="24.5" rx="5" ry="1.4" fill="#120c08"/></svg>`;
  }
  const top = dk.whip ? 26 : 36; let y = 88, layers = '';
  const h = 88 - top;
  for (const [col, frac] of [...dk.liquid].reverse()) { const y0 = y - h * frac; layers += `<rect x="20" y="${y0.toFixed(1)}" width="60" height="${(y - y0 + 0.5).toFixed(1)}" fill="${col}"/>`; y = y0; }
  const whip = dk.whip ? '<path d="M33 30c0-6 6-9 9-7 2-5 12-5 14 0 4-2 10 1 9 7z" fill="#fffaf2"/><path d="M38 27c6 2 18 2 24 0" stroke="#8a4b1f" stroke-width="1.6" fill="none"/>' : '';
  const ice = dk.ice ? '<rect x="37" y="34" width="10" height="10" rx="2" fill="#fff" opacity=".55" transform="rotate(12 42 39)"/><rect x="52" y="38" width="10" height="10" rx="2" fill="#fff" opacity=".45" transform="rotate(-10 57 43)"/>' : '';
  return `<svg viewBox="0 0 100 100" aria-hidden="true"><defs><clipPath id="c${id}"><path d="M28 24h44l-6 66H34z"/></clipPath></defs><g clip-path="url(#c${id})">${layers}${ice}</g>${whip}`
    + `<path d="M28 24h44l-6 66H34z" fill="#fff" fill-opacity=".18" stroke="#c9b8a8" stroke-width="1.4"/><path d="M33 26l4 60" stroke="#fff" stroke-width="2.5" opacity=".6"/>`
    + `<rect x="26" y="21" width="48" height="4" rx="2" fill="#e9e2da"/><path d="M56 4l-4 50" stroke="${dk.straw || '#3a1e10'}" stroke-width="4" stroke-linecap="round"/></svg>`;
}
// real 3D renders (pre-rendered images) wherever we have them, the flat icon otherwise
export function art3d(name, view = 'tilt', size = 480, small = false) {
  const src = art3dSrc(name, view, small);
  return src ? `<img class="r3d" src="${src}" alt="" loading="lazy" decoding="async" draggable="false" width="${size}" height="${size}">` : null;
}
export const boxArt = (key, small = false) => art3d('box:' + key, 'tilt', small ? 160 : 400, small);
// boxes show the 3D donut box, combos their drink + donut, everything else its own donut or cup (small copies)
export const itemArt = (it, seed = 1, view = 'tilt') => {
  const bk = boxArtKey(it); if (bk) return boxArt(bk, true);
  if (it.comboCup) return `<span class="duo">${art3d(it.comboCup, 'tilt', 128, true) || ''}${art3d(it.artName, 'tilt', 160, true) || ''}</span>`;
  return art3d(it.artName || String(it.name).replace(/^Free /, ''), view, 160, true) || (it.kind === 'drink' ? cupSVG(it) : donutSVG(it, seed));
};
export const cupArt = (dk, small = false) => art3d(dk.name, 'tilt', small ? 128 : 400, small) || cupSVG(dk);
export const donutArt = (f, view = 'tilt', seed = 1, small = false) => art3d(f.name, view, small ? (view === 'top' ? 128 : 160) : view === 'top' ? 360 : 480, small) || donutSVG(f, seed);

/* ================= SOCIAL ================= */
export const SOCIAL = [
  { name: 'Instagram', url: 'https://www.instagram.com/', icon: '<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.3" cy="6.7" r="1.3" fill="currentColor"/>' },
  { name: 'TikTok', url: 'https://www.tiktok.com/', icon: '<path d="M14 3h3c.3 2 1.6 3.4 3.6 3.6v3c-1.4 0-2.6-.4-3.6-1.1V15a6 6 0 1 1-6-6c.3 0 .7 0 1 .1v3.1a3 3 0 1 0 2 2.8z" fill="currentColor"/>' },
  { name: 'Facebook', url: 'https://www.facebook.com/', icon: '<path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21z" fill="currentColor"/>' },
  { name: 'YouTube', url: 'https://www.youtube.com/', icon: '<rect x="2.5" y="5.5" width="19" height="13" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 9.2v5.6l4.8-2.8z" fill="currentColor"/>' },
];
export function renderSocials() {
  $$('[data-socials]').forEach((box) => {
    const labels = box.hasAttribute('data-labels');
    box.innerHTML = SOCIAL.map((x) => `<a class="soc" href="${x.url}" target="_blank" rel="noopener noreferrer" aria-label="Glaze Bomb on ${x.name} (opens in a new tab)"><svg viewBox="0 0 24 24" aria-hidden="true">${x.icon}</svg>${labels ? `<span>${x.name}</span>` : ''}</a>`).join('');
  });
}

/* ================= SCROLL + NAV ================= */
export let lenis = null;
if (!reduce && window.Lenis) {
  lenis = new window.Lenis({ lerp: 0.12, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
}
let navLock = 0;   // keeps the header visible while a link scrolls the page for you
export function scrollToTarget(t) {
  navLock = performance.now() + 1700;
  const off = typeof t === 'number' ? 0 : -(parseFloat(getComputedStyle(t).scrollMarginTop) || 8);
  if (lenis) lenis.scrollTo(t, { duration: 1.4, offset: off, onComplete: () => { navLock = 0; } });
  else if (typeof t === 'number') scrollTo({ top: t, behavior: reduce ? 'auto' : 'smooth' });
  else t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
}
const nav = $('#nav'), burger = $('#burger');
export function closeNav() { nav?.classList.remove('is-open'); burger?.setAttribute('aria-expanded', 'false'); burger?.setAttribute('aria-label', 'Open menu'); }
burger?.addEventListener('click', () => {
  const open = !nav.classList.contains('is-open');
  nav.classList.toggle('is-open', open); burger.setAttribute('aria-expanded', open); burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});
document.addEventListener('click', (e) => {
  if (e.target.closest('.skip')) { e.preventDefault(); const m = $('main'); m.setAttribute('tabindex', '-1'); m.focus({ preventScroll: true }); scrollToTarget(m.firstElementChild || m); return; }
  const a = e.target.closest('a[href^="#"]'); if (!a) return;
  const id = a.getAttribute('href');
  const t = id === '#top' ? 0 : $(id);
  if (t === null) return;
  e.preventDefault();
  closeNav(); openDrawer(false);
  scrollToTarget(t);
});
/* header: hides after a real scroll down, comes straight back on any scroll up.
   Direction is measured over a short run of travel, so smooth-scroll easing (tiny steps at the end
   of a wheel flick) can no longer flip it back and forth. */
let lastY = scrollY, travel = 0;
function setNavHidden(h) {
  if (!nav || nav.classList.contains('is-hidden') === h) return;
  nav.classList.toggle('is-hidden', h); document.body.classList.toggle('nav-hidden', h);
}
function onNavScroll() {
  const y = Math.max(0, scrollY), dy = y - lastY; lastY = y;
  if (!dy) return;
  if (nav?.classList.contains('is-open') || $('#drawer')?.classList.contains('is-open') || performance.now() < navLock || y < 140) { travel = 0; setNavHidden(false); return; }
  if ((dy > 0) !== (travel > 0)) travel = 0;
  travel += dy;
  if (travel < -6) setNavHidden(false);
  else if (travel > 28 && y > 420) setNavHidden(true);
}
addEventListener('scroll', onNavScroll, { passive: true });
lenis?.on('scroll', onNavScroll);
// a mouse wheel / swipe / key up always brings the header back, even inside pinned sections
addEventListener('wheel', (e) => { if (e.deltaY < -2) { travel = 0; setNavHidden(false); } }, { passive: true });
addEventListener('keydown', (e) => { if (['ArrowUp', 'PageUp', 'Home'].includes(e.key)) setNavHidden(false); });
nav?.addEventListener('focusin', () => setNavHidden(false));
export function navHighlight() {
  $$('#navLinks a[href^="#"]:not([href="#top"])').forEach((a) => {
    const sec = $(a.getAttribute('href'));
    if (sec) ScrollTrigger.create({ trigger: sec, start: 'top 45%', end: 'bottom 45%', onToggle: (st) => a.classList.toggle('is-current', st.isActive) });
  });
}
// the orange ticker ribbon (both pages)
export function initBand() {
  const band = $('#bandTrack'); if (!band) return;
  band.innerHTML += band.innerHTML;
  if (reduce) return;
  const tw = gsap.to(band, { xPercent: -50, duration: 32, ease: 'none', repeat: -1 });
  // hovering or focusing the ribbon pauses it (WCAG 2.2.2)
  const host = band.closest('.band');
  host?.addEventListener('pointerenter', () => tw.pause()); host?.addEventListener('pointerleave', () => tw.resume());
}
export function splitWords() {
  $$('[data-words]').forEach((el) => { el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="w"><span>${w}</span></span>`).join(' '); });
}

/* ================= TOAST + ORDER ================= */
let toastT;
export function toast(text) { const t = $('#toast'); if (!t) return; t.textContent = text; t.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('is-on'), 2600); }
const KEY = 'gb-order';
export const cart = (() => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } })();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch { /* private mode: order lives for this page only */ } };
export function addToCart(item, fromEl) {
  cart.push(item); save();
  const c = $('#cartBtn').getBoundingClientRect();
  if (fromEl && !reduce) {
    const r = fromEl.getBoundingClientRect();
    const fly = document.createElement('div'); fly.className = 'fly'; fly.innerHTML = itemArt(item, cart.length + 7); document.body.appendChild(fly);
    gsap.set(fly, { left: r.left + r.width / 2 - 32, top: r.top + r.height / 2 - 32 });
    gsap.timeline({ onComplete: () => { fly.remove(); bumpCart(); } })
      .to(fly, { y: -60, scale: 1.2, duration: 0.3, ease: 'power2.out' })
      .to(fly, { left: c.left + c.width / 2 - 32, top: c.top + c.height / 2 - 32, y: 0, scale: 0.3, rotation: 200, duration: 0.6, ease: 'power3.in' });
  } else bumpCart();
  toast(`Added ${item.name} to your order`);
}
function bumpCart() {
  const b = $('#cartBtn'); b.classList.remove('is-bump'); void b.offsetWidth; b.classList.add('is-bump');
  renderCart();
}
export function renderCart() {
  $('#cartCount').textContent = cart.length;
  $('#cartBtn').setAttribute('aria-label', `Open your order (${cart.length} item${cart.length === 1 ? '' : 's'})`);
  const list = $('#drawerList');
  list.innerHTML = '';
  if (!cart.length) list.innerHTML = `<li class="drawer__empty"><span>Your order is empty.</span><a href="${$('#premium') ? '#premium' : 'menu.html'}" class="btn btn--primary btn--sm">Browse the menu</a></li>`;
  cart.forEach((it, i) => {
    const li = document.createElement('li');
    // a box carries its free drink, changeable right here until checkout
    const free = it.free ? `<label class="free"><span>Free drink</span><select aria-label="Free drink with your ${it.name}">${FREE_DRINKS.map((d) => `<option${d.name === it.free ? ' selected' : ''}>${d.name}</option>`).join('')}</select></label>` : '';
    li.innerHTML = `${itemArt(it, i + 9)}<span class="nm">${it.name}<small>${it.sub || ''}</small>${free}</span><b>${it.price ? money(it.price) : 'Free'}</b><button class="rm" aria-label="Remove ${it.name}">&times;</button>`;
    li.querySelector('.rm').addEventListener('click', () => removeFromCart(i));
    li.querySelector('select')?.addEventListener('change', (e) => { it.free = e.target.value; save(); toast(`Free drink changed to ${it.free}`); });
    list.appendChild(li);
  });
  $('#drawerTotal').textContent = money(cart.reduce((a, b) => a + (b.price || 0), 0));
  const co = $('#checkout'); if (co) co.disabled = !cart.length;
}
// picking a free drink on the page also updates the boxes already in the order
export function setBoxFreeDrink(name) {
  let n = 0; cart.forEach((it) => { if (it.free && it.free !== name) { it.free = name; n++; } });
  if (n) { save(); renderCart(); toast(`Free drink for your box${n > 1 ? 'es' : ''}: ${name}`); }
  return n;
}
export function removeFromCart(i) { if (i < 0 || i >= cart.length) return null; const [it] = cart.splice(i, 1); save(); renderCart(); return it; }
export function clearCart() { cart.length = 0; save(); renderCart(); }
export function openDrawer(on) {
  const dr = $('#drawer'); if (!dr) return;
  if (!on && !dr.classList.contains('is-open')) return;
  dr.classList.toggle('is-open', on); dr.setAttribute('aria-hidden', !on);
  $('#scrim').classList.toggle('is-on', on);
  if (on) { lenis?.stop(); closeNav(); setTimeout(() => $('#drawerClose').focus(), 300); } else lenis?.start();
}
export function initOrderUI() {
  renderCart();
  $('#cartBtn').addEventListener('click', () => openDrawer(true));
  $('#drawerClose').addEventListener('click', () => openDrawer(false));
  $('#scrim').addEventListener('click', () => openDrawer(false));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') { openDrawer(false); closeNav(); } });
  initTicket();
  $('#checkout').addEventListener('click', () => {
    if (!cart.length) { toast('Add something to your order first.'); return; }
    gsap.fromTo('#checkoutNote', { scale: 1 }, { scale: 1.06, yoyo: true, repeat: 1, duration: 0.2 });
    toast(`Concept website: no order was placed (${ticket.way === 'delivery' ? 'delivery' : 'pick-up'}, ${$('#readyBy')?.selectedOptions[0]?.textContent || 'today'}).`);
  });
  $('#newsForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = $('#newsEmail'), msg = $('#newsMsg');
    if (!input.checkValidity() || !input.value) { msg.textContent = 'Please enter a valid email address.'; input.focus(); return; }
    msg.textContent = 'Thanks! This is a concept website, so no email was sent.'; input.value = '';
  });
}

/* ================= ORDER TICKET: pick-up or delivery + a time slot ================= */
const TKEY = 'gb-order-opts';
const ticket = (() => { try { return JSON.parse(localStorage.getItem(TKEY)) || { way: 'pickup' }; } catch { return { way: 'pickup' }; } })();
function slots() {
  // 15-minute slots inside opening hours: today if there is still time, otherwise tomorrow
  const now = new Date(), day = now.getDay(), mins = now.getHours() * 60 + now.getMinutes();
  const hours = (d) => (d === 0 || d === 6 ? [420, 780] : [360, 840]);
  const fmt = (m) => { const h = Math.floor(m / 60), mm = m % 60; return `${h % 12 || 12}:${String(mm).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`; };
  const [o, c] = hours(day), out = [];
  let start = Math.max(o + 30, Math.ceil((mins + 25) / 15) * 15);
  for (let m = start; m <= c - 15 && out.length < 16; m += 15) out.push(`Today ${fmt(m)}`);
  if (!out.length) { const [o2, c2] = hours((day + 1) % 7); for (let m = o2 + 30; m <= c2 - 15 && out.length < 16; m += 15) out.push(`Tomorrow ${fmt(m)}`); }
  return out;
}
function initTicket() {
  const seg = $('#ticketWay'), sel = $('#readyBy'); if (!seg || !sel) return;
  const paint = () => {
    $$('button', seg).forEach((b) => b.setAttribute('aria-checked', b.dataset.way === ticket.way));
    $('#whenLabel').textContent = ticket.way === 'delivery' ? 'Deliver around' : 'Ready for pick-up';
  };
  sel.innerHTML = slots().map((t) => `<option${t === ticket.when ? ' selected' : ''}>${t}</option>`).join('');
  const store = () => { try { localStorage.setItem(TKEY, JSON.stringify(ticket)); } catch { /* storage off */ } };
  seg.addEventListener('click', (e) => { const b = e.target.closest('[data-way]'); if (!b) return; ticket.way = b.dataset.way; paint(); store(); });
  seg.addEventListener('keydown', (e) => { if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return; ticket.way = ticket.way === 'pickup' ? 'delivery' : 'pickup'; paint(); store(); $(`[data-way="${ticket.way}"]`, seg).focus(); });
  sel.addEventListener('change', () => { ticket.when = sel.value; store(); });
  paint();
}

/* ================= OPEN STATUS ================= */
export function openStatus() {
  const dt = new Date(), day = dt.getDay(), mins = dt.getHours() * 60 + dt.getMinutes();
  const weekend = day === 0 || day === 6, o = weekend ? 420 : 360, c = weekend ? 780 : 840;
  const fmt = (m) => { const h = Math.floor(m / 60), mm = m % 60; return `${h % 12 || 12}:${String(mm).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`; };
  const open = mins >= o && mins < c;
  const tomorrow = (day + 1) % 7, tOpen = tomorrow === 0 || tomorrow === 6 ? 420 : 360;
  const text = open ? `Open now until ${fmt(c)}` : `Closed now. Opens ${mins < o ? 'today' : 'tomorrow'} at ${fmt(mins < o ? o : tOpen)}`;
  const pill = $('#heroOpen');
  if (pill) { pill.classList.toggle('is-open', open); $('.pill__text', pill).textContent = open ? `Open now until ${fmt(c)}` : text.replace('Closed now. ', ''); }
  if ($('#openStatus')) { $('#openStatus').className = 'open ' + (open ? 'is-open' : 'is-closed'); $('#openText').textContent = open ? text + ' (or until we sell out)' : text; }
}

/* ================= REVEALS + LOADER ================= */
export const once = (trigger, start = 'top 82%') => ({ trigger, start, once: true });
export function reveal(sel, from, opts = {}) {
  if (!$(sel)) return;
  const { trigger, start, ...tween } = opts;
  gsap.fromTo(sel, from, { y: 0, x: 0, opacity: 1, scale: 1, rotation: 0, duration: 0.7, ease: 'power3.out', clearProps: 'transform,opacity,translate,rotate,scale', ...tween, scrollTrigger: once(trigger || sel, start || 'top 85%') });
}
export function initReveals() {
  $$('main [data-words]').forEach((t) => gsap.fromTo($$('.w > span', t), { yPercent: 110 }, { yPercent: 0, duration: 0.8, stagger: 0.06, ease: 'power4.out', scrollTrigger: once(t, 'top 88%') }));
  $$('main [data-reveal]').forEach((el) => gsap.fromTo(el, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', scrollTrigger: once(el, 'top 90%') }));
  reveal('.foot__top > *', { y: 24, opacity: 0 }, { stagger: 0.08, trigger: '.foot', start: 'top 92%' });
}
// build heavy WebGL scenes after the intro so its animation never stutters
export function afterIntro(fn) {
  if (window.__gbIntroDone || !$('#loader')) setTimeout(fn, 0);
  else document.addEventListener('gb:intro-done', () => setTimeout(fn, 0), { once: true });
}

/* ================= PAGE REVEAL =================
   The intro itself lives in js/intro.js (a classic script, so it starts on first paint).
   This module tells it the page is ready and plays the page entrance when the iris opens. */
export function runLoader(onReveal) {
  const done = () => {
    document.body.classList.remove('is-loading'); lenis?.start(); ScrollTrigger.refresh();
    if (location.hash && $(location.hash)) setTimeout(() => scrollToTarget($(location.hash)), 300);
    onReveal?.(gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.25 }));
  };
  if (window.__gbIntroExited || !$('#loader')) done();
  else document.addEventListener('gb:intro-exit', done, { once: true });
  window.__gbReady = true;
  document.dispatchEvent(new CustomEvent('gb:ready'));
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  addEventListener('load', () => ScrollTrigger.refresh());
}
renderSocials();
