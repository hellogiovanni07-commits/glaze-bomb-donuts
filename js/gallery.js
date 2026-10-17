// Glaze Bomb - gallery page: 3D product shots + placeholders for the real shop photos, taste-style filters and a photo viewer
import { initChat } from './chat.js?v=46';
import {
  gsap, $, $$, reduce, lenis, initOrderUI, initReveals, reveal, runLoader, ALL_DONUTS, ALL_DRINKS, donutArt, cupArt, boxArt,
} from './common.js?v=46';

initOrderUI();
initChat();

const byName = (n) => ALL_DONUTS.find((f) => f.name === n);
const drink = (n) => ALL_DRINKS.find((d) => d.name === n);
// line icons for the photo placeholders (24 px grid, drawn in one stroke weight)
const ICON = {
  shop: '<path d="M3 10l1.6-5h14.8L21 10M4 10v10h16V10M3 10h18M9.5 20v-6h5v6"/>',
  shelf: '<path d="M4 3v18M20 3v18M4 9h16M4 15h16M7 5.5h4V9H7zM13 11.5h4V15h-4zM7 17.5h5V21"/>',
  window: '<path d="M4 4h16v16H4zM12 4v16M4 12h16M8 9.5a4 4 0 0 1 8 0"/>',
  neon: '<path d="M6 12.5a6 6 0 1 1 12 0c0 3.2-2.7 5.5-6 5.5s-6-2.3-6-5.5zM9.2 11.4a2.8 2.8 0 0 1 5.6 0M3 21h18"/>',
  fryer: '<path d="M4 11h16v4.5A4.5 4.5 0 0 1 15.5 20h-7A4.5 4.5 0 0 1 4 15.5zM2 11h20M9 7.5c0-1.6 1.2-1.6 1.2-3.5M13.2 7.5c0-1.6 1.2-1.6 1.2-3.5"/>',
  bowl: '<path d="M3 11h18a9 9 0 0 1-18 0zM8 11.2c0 2 1 2.8 1 4.6M13 6l1.2-2.4M16 7.2l2-1.2"/>',
  piping: '<path d="M14 3l7 7-6 2-5 5-3-3 5-5zM7 14l-4 7"/>',
  sprinkle: '<path d="M8.5 3h7v4l2 3v11h-11V10l2-3zM9.5 13.5l1 1M14 12.5l1-1M11 16.5l1 1M14 17l1.2.6"/>',
  heart: '<path d="M12 20s-8-5-8-10.2A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.8C20 15 12 20 12 20z"/>',
};
const BG = ['linear-gradient(140deg,#ffb27a,#ff6a13)', 'linear-gradient(140deg,#fff3e6,#ffd2ad)', 'linear-gradient(140deg,#4a2a1a,#2a150d)', 'linear-gradient(140deg,#ffe9cc,#ffc58f)', 'linear-gradient(140deg,#f2e6ff,#d6bdf0)', 'linear-gradient(140deg,#eaf5e1,#c6e1b0)', 'linear-gradient(140deg,#ffe1ea,#ffb9cc)', 'linear-gradient(140deg,#fff8f1,#f1dfcd)'];

// size: big = 2x2, wide = 2x1, tall = 1x2 (the grid packs them densely)
const ITEMS = [
  { cat: 'donuts', name: 'Midnight Marble', sub: 'Signature · dark chocolate', size: 'big', bg: 2 },
  { cat: 'shop', name: 'The counter on Glaze Lane', sub: 'The shop', icon: 'shop', size: 'wide' },
  { cat: 'donuts', name: 'Caramel Biscuit Crunch', sub: 'Signature', bg: 3 },
  { cat: 'drinks', name: 'Iced Spanish Latte', sub: 'Most ordered with a box', size: 'tall', bg: 1 },
  { cat: 'kitchen', name: '5 AM: the first fry', sub: 'Behind the scenes', icon: 'fryer' },
  { cat: 'donuts', name: 'Ube Cheese Cloud', sub: 'Premium', bg: 4 },
  { cat: 'boxes', name: 'Box of 6', sub: 'Hand-picked, the drink is on us', box: 'six', size: 'wide', bg: 0 },
  { cat: 'kitchen', name: 'Hand-dipping the glaze', sub: 'Behind the scenes', icon: 'bowl', size: 'tall' },
  { cat: 'donuts', name: 'Mango Graham', sub: 'Signature', bg: 3 },
  { cat: 'shop', name: 'The pick-up shelf', sub: 'The shop', icon: 'shelf' },
  { cat: 'donuts', name: 'Matcha Web', sub: 'Premium', bg: 5 },
  { cat: 'drinks', name: 'Mocha Frappe', sub: 'Iced', bg: 7 },
  { cat: 'kitchen', name: 'Filled to the edge', sub: 'Behind the scenes', icon: 'piping', size: 'wide' },
  { cat: 'donuts', name: 'Wafer Crunch Bar', sub: 'Premium', size: 'tall', bg: 1 },
  { cat: 'shop', name: 'Window seats at sunrise', sub: 'The shop', icon: 'window' },
  { cat: 'donuts', name: 'Strawberry Sprinkle', sub: 'Classic', bg: 6 },
  { cat: 'kitchen', name: 'The topping station', sub: 'Behind the scenes', icon: 'sprinkle' },
  { cat: 'drinks', name: 'Hot Chocolate', sub: 'Hot', bg: 7 },
  { cat: 'donuts', name: "S'mores Campfire", sub: 'Premium', size: 'big', bg: 0 },
  { cat: 'shop', name: 'Our neon donut', sub: 'The shop', icon: 'neon', size: 'tall' },
  { cat: 'boxes', name: 'Premium box', sub: 'Box of 6, 12 or 24', box: 'premium', bg: 3 },
  { cat: 'fans', name: 'Your box here', sub: 'Tag #GlazeBomb on Instagram', icon: 'heart', size: 'wide' },
  { cat: 'donuts', name: 'Choco Crumble Stripe', sub: 'Signature', bg: 1 },
  { cat: 'drinks', name: 'Iced Matcha Latte', sub: 'Iced', bg: 5 },
];
const CATS = [['all', 'All'], ['donuts', 'Donuts'], ['drinks', 'Drinks'], ['boxes', 'Boxes'], ['shop', 'The shop'], ['kitchen', 'Behind the scenes'], ['fans', 'Your photos']];

const media = (it) => {
  if (it.icon) return `<span class="ph"><span class="ph__ico"><svg viewBox="0 0 24 24" aria-hidden="true">${ICON[it.icon]}</svg></span><span class="ph__txt">Photo coming soon</span></span>`;
  if (it.box) return boxArt(it.box);
  if (it.cat === 'drinks') return cupArt(drink(it.name));
  return donutArt(byName(it.name));
};
$('#gGrid').innerHTML = ITEMS.map((it, i) => `<button type="button" class="gtile${it.size ? ' gtile--' + it.size : ''}${it.icon ? ' gtile--ph' : ''}" data-i="${i}" data-cat="${it.cat}" style="${it.icon ? '' : `--gb:${BG[it.bg ?? i % BG.length]}`}" aria-label="Open ${it.icon ? 'placeholder for ' : ''}${it.name}">
  <span class="gtile__media">${media(it)}</span><span class="gtile__cap"><b>${it.name}</b><small>${it.sub}</small></span></button>`).join('');

// filters
$('#gFilter').innerHTML = CATS.map(([k, label], n) => `<button type="button" class="tchip${n ? '' : ' is-on'}" data-c="${k}" aria-pressed="${!n}">${label} <small>${k === 'all' ? ITEMS.length : ITEMS.filter((x) => x.cat === k).length}</small></button>`).join('');
let cat = 'all';
$('#gFilter').addEventListener('click', (e) => {
  const b = e.target.closest('.tchip'); if (!b || b.dataset.c === cat) return;
  cat = b.dataset.c;
  $$('.tchip', $('#gFilter')).forEach((x) => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-pressed', x === b); });
  const tiles = $$('.gtile');
  tiles.forEach((t) => t.classList.toggle('is-out', cat !== 'all' && t.dataset.cat !== cat));
  if (!reduce) gsap.fromTo(tiles.filter((t) => !t.classList.contains('is-out')), { y: 24, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.03, ease: 'power3.out', clearProps: 'transform,opacity' });
});

// viewer: arrows / swipe-free buttons / Esc, focus returns to the tile that opened it
const lb = $('#lightbox'), lbMedia = $('#lbMedia'), lbCap = $('#lbCap');
let cur = -1, opener = null;
const visible = () => $$('.gtile').filter((t) => !t.classList.contains('is-out')).map((t) => +t.dataset.i);
function show(i) {
  cur = i; const it = ITEMS[i], list = visible();
  lbMedia.innerHTML = media(it); lbMedia.className = 'lightbox__media' + (it.icon ? ' is-ph' : '');
  lbMedia.style.setProperty('--gb', it.icon ? '' : BG[it.bg ?? i % BG.length]);
  lbCap.innerHTML = `<b>${it.name}</b><small>${it.sub}${it.icon ? ' · placeholder, real photo coming soon' : ''}</small><span class="lightbox__n">${list.indexOf(i) + 1} / ${list.length}</span>`;
  if (!reduce) gsap.fromTo(lbMedia, { scale: 0.94, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'power3.out' });
}
function step(d) { const list = visible(); show(list[(list.indexOf(cur) + d + list.length) % list.length]); }
function open(i, from) { opener = from; lb.hidden = false; document.body.classList.add('lb-open'); lenis?.stop(); show(i); $('.lightbox__x', lb).focus(); }
function close() { lb.hidden = true; document.body.classList.remove('lb-open'); lenis?.start(); opener?.focus(); }
$('#gGrid').addEventListener('click', (e) => { const t = e.target.closest('.gtile'); if (t) open(+t.dataset.i, t); });
lb.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) close(); else if (e.target.closest('.lightbox__prev')) step(-1); else if (e.target.closest('.lightbox__next')) step(1); });
addEventListener('keydown', (e) => {
  if (lb.hidden) return;
  if (e.key === 'Escape') close();
  else if (e.key === 'ArrowRight') step(1);
  else if (e.key === 'ArrowLeft') step(-1);
  else if (e.key === 'Tab') { // keep focus inside the viewer
    const f = $$('button', lb), first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

initReveals();
reveal('.gtile', { y: 40, opacity: 0, scale: 0.95 }, { stagger: 0.04, trigger: '#gGrid', ease: 'back.out(1.5)' });
runLoader((tl) => {
  tl.fromTo('.phero__title .line > span', { yPercent: 110 }, { yPercent: 0, duration: 0.9, stagger: 0.1, ease: 'power4.out' }, '-=0.3')
    .fromTo('.phero .kicker, .phero__lead, .phero .tchip', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.05 }, '-=0.6');
});
