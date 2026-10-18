/* Glaze Bomb brand kit: logo builder, live "your details", downloads, demos.
   Classic script (no modules) so the kit also opens straight from the folder (file://). */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---------- your details (placeholders until the real ones are known) ----------
  // [key, label, default, isPlaceholder]
  const FIELDS = [
    ['name', 'Brand name', 'Glaze Bomb'],
    ['tagline', 'Tagline', 'Filled to the edge.'],
    ['promo', 'Current promo', 'Free drink with every box of 6'],
    ['address', 'Street address', '12 Glaze Lane, Downtown'],
    ['city', 'City / area', 'Your City', 1],
    ['hoursWk', 'Weekday hours', 'Mon-Fri 6 AM - 2 PM'],
    ['hoursWe', 'Weekend hours', 'Sat-Sun 7 AM - 1 PM'],
    ['phone', 'Phone', '(555) 010-4242', 1],
    ['email', 'Email', 'hello@glazebomb.example', 1],
    ['web', 'Website', 'www.glazebomb.example', 1],
    ['ig', 'Instagram', '@glazebomb', 1],
    ['tiktok', 'TikTok', '@glazebomb', 1],
    ['fb', 'Facebook', 'facebook.com/glazebomb', 1],
    ['owner', 'Owner / contact name', 'Your Name', 1],
    ['role', 'Job title', 'Founder & Head Baker', 1],
    ['est', 'Year established', '2026', 1],
    ['wifi', 'Guest Wi-Fi name', 'GlazeBomb-Guest', 1],
    ['reg', 'Business reg. no.', 'REG 0000-0000', 1],
    ['cur', 'Currency symbol', '$'],
  ];
  const DEF = Object.fromEntries(FIELDS.map((f) => [f[0], f[2]]));
  const PH = new Set(FIELDS.filter((f) => f[3]).map((f) => f[0]));
  const KEY = 'gb-brand-details';
  const D = { ...DEF };
  try { Object.assign(D, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { /* private mode: defaults only */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(D)); } catch (e) { /* ignore */ } };
  const raw = (k) => String(D[k] ?? '').trim() || DEF[k];
  const words = () => { const p = raw('name').split(/\s+/); return [p[0], p.slice(1).join(' ')]; };
  const val = (k) => (k === 'w1' ? words()[0] : k === 'w2' ? words()[1] : k === 'nameUp' ? raw('name').toUpperCase() : raw(k));
  const isPH = (k) => PH.has(k) && raw(k) === DEF[k];

  // ---------- the mark: a filled donut, no hole, glaze dripping over the edge ----------
  const PAL = {
    color: ['#cf914c', '#f7e2bd', '#ff6a13', '#fff'],
    reverse: ['#fff', '#ffd2b0', '#3a1e10', '#fff'], // on orange
    white: ['rgba(255,255,255,.5)', '', '#fff', ''],
    brown: ['rgba(58,30,16,.42)', '', '#3a1e10', ''],
    orange: ['rgba(255,106,19,.42)', '', '#ff6a13', ''],
  };
  const GLAZE = 'M6 33c0-12 12-20 26-20s26 8 26 20c-4 3-6-1-9 2s-2 7-6 7-4-5-8-5-4 6-8 5-3-6-7-5-4 2-6-1-6 0-8-3z';
  const iconInner = (v = 'color') => {
    const p = PAL[v] || PAL.color;
    return `<ellipse cx="32" cy="38" rx="28" ry="20" fill="${p[0]}"/>${p[1] ? `<ellipse cx="32" cy="40" rx="27" ry="4" fill="${p[1]}" opacity=".8"/>` : ''}<path d="${GLAZE}" fill="${p[2]}"/>${p[3] ? `<ellipse cx="22" cy="22" rx="7" ry="3" fill="${p[3]}" opacity=".45" transform="rotate(-18 22 22)"/>` : ''}`;
  };
  const iconSVG = (v = 'color', cls = 'lg-icon') => `<svg class="${cls}" viewBox="0 0 64 64" aria-hidden="true" focusable="false">${iconInner(v)}</svg>`;
  const iconAt = (x, y, s, v) => `<svg x="${x}" y="${y}" width="${s}" height="${s}" viewBox="0 0 64 64">${iconInner(v)}</svg>`;
  const lockup = (kind, v) => {
    const [a, b] = words();
    const txt = `<span class="lw"><span class="w1">${esc(a)}</span><span class="w2">${esc(b)}</span></span>`;
    if (kind === 'icon') return iconSVG(v);
    if (kind === 'word') return `<span class="lockup">${txt}</span>`;
    return `<span class="lockup${kind === 'stack' ? ' lockup--stack' : ''}">${iconSVG(v)}${txt}</span>`;
  };

  let uid = 0;
  const roundel = (bg = '#3a1e10', ring = '#ffb27a', ink = '#fff') => {
    const id = 'rp' + (++uid);
    const t = `${val('name')} · ${val('tagline').replace(/[.!]$/, '')} · EST. ${val('est')} · `.toUpperCase();
    return `<svg viewBox="0 0 200 200" role="img" aria-label="${esc(val('name'))} roundel badge"><defs><path id="${id}" d="M100 100m-74 0a74 74 0 1 1 148 0a74 74 0 1 1-148 0"/></defs>
      <circle cx="100" cy="100" r="98" fill="${bg}"/><circle cx="100" cy="100" r="90" fill="none" stroke="${ring}" stroke-width="2"/>
      <circle cx="100" cy="100" r="57" fill="none" stroke="${ring}" stroke-width="1.5" stroke-dasharray="3 5"/>
      <text font-family="Plus Jakarta Sans, Arial, sans-serif" font-weight="800" font-size="14" letter-spacing="2" fill="${ink}"><textPath href="#${id}" textLength="452" lengthAdjust="spacing">${esc(t)}</textPath></text>
      ${iconAt(62, 58, 76, 'color')}</svg>`;
  };
  const bomb = () => `<svg viewBox="0 0 200 200" role="img" aria-label="Donut bomb sticker">
    <circle cx="100" cy="104" r="94" fill="#fff"/><circle cx="100" cy="104" r="86" fill="#ffe6d2"/>
    <path d="M100 92c2-26 22-36 42-46" fill="none" stroke="#3a1e10" stroke-width="6" stroke-linecap="round"/>
    <path d="M100 92c2-26 22-36 42-46" fill="none" stroke="#cf914c" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="4 5"/>
    <g transform="translate(146 42)"><path d="M0-21l5 12 13-4-8 11 11 8-13 1 1 13-9-10-9 10 1-13-13-1 11-8-8-11 13 4z" fill="#ffd166"/><circle r="6" fill="#ff6a13"/></g>
    ${iconAt(30, 64, 140, 'color')}</svg>`;

  // ---------- patterns (sprinkles, wax paper, stamp donut) ----------
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const sprinkles = (cols, n, size, len = 12) => {
    let s = '';
    for (let i = 0; i < n; i++) {
      const x = (rnd() * size).toFixed(1), y = (rnd() * size).toFixed(1), r = Math.round(rnd() * 180);
      s += `<rect x="${x}" y="${y}" width="${len}" height="4" rx="2" fill="${cols[i % cols.length]}" transform="rotate(${r} ${x} ${y})"/>`;
    }
    return s;
  };
  const uri = (svg) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  root.style.setProperty('--spr', uri(`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">${sprinkles(['#ff6a13', '#ffb9cc', '#c6e1b0', '#d6bdf0', '#ffd166', '#fff'], 16, 112)}</svg>`));
  root.style.setProperty('--spr-w', uri(`<svg xmlns="http://www.w3.org/2000/svg" width="90" height="90">${sprinkles(['#fff', '#ffe2c7', '#3a1e10'], 10, 84, 10)}</svg>`));
  root.style.setProperty('--wrap', uri(`<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><g opacity=".22">${iconAt(14, 14, 44, 'orange')}${iconAt(94, 94, 44, 'orange')}</g><text x="96" y="52" font-family="Caveat, cursive" font-weight="700" font-size="20" fill="#e85706" opacity=".35" transform="rotate(-12 96 52)">fresh!</text><text x="12" y="132" font-family="Caveat, cursive" font-weight="700" font-size="20" fill="#e85706" opacity=".35" transform="rotate(-12 12 132)">filled!</text>${sprinkles(['rgba(255,106,19,.3)', 'rgba(58,30,16,.18)'], 8, 150, 9)}</svg>`));
  root.style.setProperty('--dn', uri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${iconInner('reverse')}</svg>`));

  // ---------- line icons (24 px grid, one stroke weight) ----------
  const ICONS = {
    donut: '<ellipse cx="12" cy="13.5" rx="9" ry="6.5"/><path d="M3.4 12C4.6 8.6 8 6.5 12 6.5s7.4 2.1 8.6 5.5c-1.4 1-2.2-.4-3.4.6s-.8 2.2-2.2 2.2-1.4-1.6-2.8-1.6-1.4 1.8-2.8 1.6-1.2-1.8-2.4-1.6-1.6.4-3.6-1.2z"/>',
    box: '<path d="M3 9h18v11H3zM3 9l2-4h14l2 4M9 13h6"/>',
    'hot cup': '<path d="M6 8h12l-1.4 12H7.4zM5 8h14M7.5 5h9l1 3M10 13h4"/>',
    'iced cup': '<path d="M6.5 8h11l-1.3 13H7.8zM5.5 8h13M12 8l2-6h2.5M9.5 12.5l1.5 1.5M13 15l1.5-1"/>',
    bag: '<path d="M5 8h14l-1 13H6zM9 8V6a3 3 0 0 1 6 0v2"/>',
    shop: '<path d="M3 10l1.6-5h14.8L21 10M4 10v10h16V10M3 10h18M9.5 20v-6h5v6"/>',
    location: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    hours: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    email: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6l8.5 7 8.5-7"/>',
    instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17" cy="7" r=".6"/>',
    tiktok: '<path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5M14 3c.5 2.6 2.4 4.4 5 4.6"/>',
    facebook: '<path d="M14.5 21v-8h3l.5-3.5h-3.5V7.6c0-1 .4-1.6 1.7-1.6H18V3.2c-.7-.1-1.6-.2-2.6-.2-2.6 0-4.4 1.6-4.4 4.4v2.1H8V13h3v8"/>',
    delivery: '<path d="M2 6h11v10H2zM13 9h4l4 4v3h-8z"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
    gift: '<path d="M3 8h18v4H3zM5 12v9h14v-9M12 8v13M12 8C10 4 6.5 4 6.5 6.2S10 8 12 8zM12 8c2-4 5.5-4 5.5-1.8S14 8 12 8z"/>',
    favorite: '<path d="M12 20s-8-5-8-10.2A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.8C20 15 12 20 12 20z"/>',
    rating: '<path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z"/>',
    sprinkles: '<path d="M8.5 3h7v4l2 3v11h-11V10l2-3zM9.5 13.5l1 1M14 12.5l1-1M11 16.5l1 1M14 17l1.2.6"/>',
    filling: '<path d="M14 3l7 7-6 2-5 5-3-3 5-5zM7 14l-4 7"/>',
    'fresh daily': '<path d="M12 21c4 0 7-2.8 7-6.8 0-4.2-3.2-6.2-4-10.2-2 1.6-3.2 3.6-3.4 6-1-1-1.4-2.2-1.4-3.4C7.5 8.4 5 11.2 5 14.4 5 18.2 8 21 12 21z"/>',
    coffee: '<ellipse cx="12" cy="12" rx="6.5" ry="9" transform="rotate(35 12 12)"/><path d="M8 17c3-2 5-8 8-10"/>',
    payment: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3 10h18M6.5 15h4"/>',
    'scan QR': '<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2M14 18h2v2M18 18h2v2h-2z"/>',
    'Wi-Fi': '<path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M8.6 15.8a5 5 0 0 1 6.8 0"/><circle cx="12" cy="19" r="1"/>',
    'pre-order': '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 10h8"/>',
    cart: '<path d="M3 4h2.5l2.2 11h10.8L21 7H6.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>',
    receipt: '<path d="M6 3h12v18l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5L6 21zM9 8h6M9 12h6M9 16h3"/>',
    gluten: '<path d="M12 21V8M12 8c-2-1-3-3-3-5 2 1 3 3 3 5zM12 8c2-1 3-3 3-5-2 1-3 3-3 5zM12 13c-2.5-.5-4-2.5-4-4.5 2.5.5 4 2.5 4 4.5zM12 13c2.5-.5 4-2.5 4-4.5-2.5.5-4 2.5-4 4.5zM12 18c-2.5-.5-4-2.5-4-4.5 2.5.5 4 2.5 4 4.5zM12 18c2.5-.5 4-2.5 4-4.5-2.5.5-4 2.5-4 4.5z"/>',
    dairy: '<path d="M8 3h8v3l2 3v12H6V9l2-3zM6 12h12"/>',
    egg: '<path d="M12 3c3.6 0 6.5 6 6.5 10.2a6.5 6.5 0 0 1-13 0C5.5 9 8.4 3 12 3z"/>',
    nuts: '<path d="M12 3c3.6 2.2 6 5.8 6 9.6 0 4.6-2.7 8.4-6 8.4s-6-3.8-6-8.4C6 8.8 8.4 5.2 12 3z"/><path d="M12 7.5c-1.6 2.6-2 5.8-.8 9.5"/>',
  };
  const lineIcon = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[k]}</svg>`;

  // ---------- menu (same prices as the website) ----------
  const MENU = {
    premium: [['Almond Snowcap', 3.6], ['Wafer Crunch Bar', 3.7], ['Hazelnut Velvet', 3.6], ['Caramel Biscuit Crunch', 3.8], ["S'mores Campfire", 3.7], ['Bavarian Cream Dream', 3.6], ['Midnight Marble', 3.6], ['Snow Web', 3.6], ['Cheese Cloud', 3.5], ['Tiramisu Dust', 3.7], ['Coffee Crumble', 3.6], ['Cookies & Cream Latte', 3.5], ['Ube Cheese Cloud', 3.7], ['Mango Graham', 3.9], ['Matcha Almond', 3.7], ['Matcha Web', 3.7], ['Berry Coconut Snow', 3.6], ['Cappuccino Swirl', 3.6], ['Milk Tea Sesame', 3.4], ['Choco Crumble Stripe', 3.7]],
    classic: [['Original Glaze', 2.5], ['Choco Glaze', 2.6], ['Strawberry Glaze', 2.6], ['Choco Sprinkle', 2.8], ['Strawberry Sprinkle', 2.8], ['Hazelnut Crunch', 2.9], ['Choco Almond', 2.9], ['Cookie Speckle', 2.8], ['Mocha Glaze', 2.6], ['Matcha Drizzle', 2.8], ['Mallow Party', 2.9], ['Caramel Drizzle', 2.7]],
    hot: [['Classic Americano', 2.8], ['Cafe Latte', 3.4], ['Caramel Macchiato', 3.8], ['Spanish Latte', 3.8], ['Hot Chocolate', 3.2], ['Hot Matcha Latte', 3.9]],
    iced: [['Iced Americano', 3.0], ['Iced Spanish Latte', 3.9], ['Iced Caramel Macchiato', 3.9], ['Iced Matcha Latte', 3.9], ['Orange Cold Brew', 3.6], ['Mocha Frappe', 4.2]],
    boxes: [['Classic', 14.9, 27.9, 52.9], ['Assorted', 17.9, 33.9, 63.9], ['Premium', 19.9, 37.9, 71.9]],
    combos: [['Solo Treat', 8.9, '1 iced macchiato + 2 classics'], ['Double Date', 14.5, '2 Spanish lattes + 2 donuts'], ['Squad Snack', 13.9, '1 frappe + 3 donuts']],
  };
  const money = (n) => val('cur') + n.toFixed(2);
  const li = (r) => `<li>${esc(r[0])}<b>${money(r[1])}</b></li>`;
  function renderBoard() {
    const b = $('#board'); if (!b) return;
    b.innerHTML = `<div class="board__head">${lockup()}<p>${esc(val('tagline'))} Every donut, every time.</p></div>
      <div class="board__cols">
        <div><h4>Premium</h4><ul>${MENU.premium.map(li).join('')}</ul></div>
        <div><h4>Classic</h4><ul>${MENU.classic.map(li).join('')}</ul><h4 style="margin-top:16px">Boxes <small style="font:600 13px var(--body);color:#ffd2b0">6 / 12 / 24</small></h4><ul>${MENU.boxes.map((x) => `<li>${x[0]}<b>${money(x[1])} · ${money(x[2])} · ${money(x[3])}</b></li>`).join('')}</ul></div>
        <div><h4>Hot</h4><ul>${MENU.hot.map(li).join('')}</ul><h4 style="margin-top:16px">Iced</h4><ul>${MENU.iced.map(li).join('')}</ul><h4 style="margin-top:16px">Combos</h4><ul>${MENU.combos.map(li).join('')}</ul></div>
      </div>
      <div class="board__foot"><span>Every box of 6 comes with a free drink.</span><span>All donuts are filled. Ask us about allergens.</span></div>`;
  }

  // ---------- 3D render library ----------
  const DONUTS = 'almond-snowcap bavarian-cream-dream berry-coconut-snow cappuccino-swirl caramel-biscuit-crunch caramel-drizzle cheese-cloud choco-almond choco-crumble-stripe choco-glaze choco-sprinkle coffee-crumble cookie-speckle cookies-and-cream-latte hazelnut-crunch hazelnut-velvet mallow-party mango-graham matcha-almond matcha-drizzle matcha-web midnight-marble milk-tea-sesame mocha-glaze orange-zest-cream original-glaze smores-campfire snow-web strawberry-glaze strawberry-sprinkle tiramisu-dust ube-cheese-cloud ube-halaya wafer-crunch-bar'.split(' ');
  const DRINK_IMG = 'classic-americano cafe-latte caramel-macchiato spanish-latte hot-chocolate hot-matcha-latte iced-americano iced-spanish-latte iced-caramel-macchiato iced-matcha-latte orange-cold-brew mocha-frappe'.split(' ');
  const BOX_IMG = { six: 'Box of 6', classic: 'Classic box', assorted: 'Assorted box', premium: 'Premium box' };
  const nice = (s) => s === 'smores-campfire' ? "S'mores Campfire" : s.replace('-and-', ' & ').split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
  const LIB = {
    donuts: DONUTS.map((s) => [`../assets/3d/donuts/${s}-sm.webp`, nice(s), `${s}.webp`]),
    tops: DONUTS.map((s) => [`../assets/3d/donuts/${s}-top-sm.webp`, nice(s), `${s}-top.webp`]),
    drinks: DRINK_IMG.map((s) => [`../assets/3d/drinks/${s}-sm.webp`, nice(s), `${s}.webp`]),
    boxes: Object.entries(BOX_IMG).map(([s, n]) => [`../assets/3d/boxes/${s}-sm.webp`, n, `${s}.webp`]),
  };
  function renderLib(kind) {
    const g = $('#lib'); if (!g) return;
    g.innerHTML = LIB[kind].map(([src, n, file]) => `<figure class="render"><img src="${src}" alt="${esc(n)}" loading="lazy" width="200" height="200"><figcaption>${esc(n)}<code>${file}</code></figcaption></figure>`).join('');
    $$('#libTabs .ui-chip').forEach((b) => { const on = b.dataset.lib === kind; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
  }

  // ---------- color maths (RGB, CMYK, contrast) ----------
  const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const cmyk = (h) => { const [r, g, b] = rgb(h).map((x) => x / 255), k = 1 - Math.max(r, g, b); if (k >= 1) return '0 0 0 100'; return [r, g, b].map((x) => Math.round(((1 - x - k) / (1 - k)) * 100)).concat(Math.round(k * 100)).join(' '); };
  const lum = (h) => { const c = rgb(h).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const CORE = [
    ['Glaze Orange', '#ff6a13', 'Hero colour: buttons, boxes, price badges', 'Pantone 1505 C (closest, check on a swatch book)', 1],
    ['Deep Fry Brown', '#3a1e10', 'Text, dark panels, menu boards', 'Pantone 4625 C (closest, check on a swatch book)', 1],
    ['Cream', '#fff8f1', 'Page background, wax paper', '', 0, '#3a1e10'],
    ['Peach', '#ffe6d2', 'Soft panels, chips, inner lids', '', 0, '#3a1e10'],
    ['Orange Hi', '#d64f00', 'Large orange text on light', ''],
    ['Orange Ink', '#b33c00', 'Small orange text, focus rings', ''],
    ['Dough', '#cf914c', 'The donut itself, kraft accents', ''],
    ['Brown 2', '#6e4630', 'Secondary text, trims', ''],
  ];
  function renderColors() {
    const s = $('#swatches');
    if (s) s.innerHTML = CORE.map(([n, h, use, pms, big, t]) => `<button type="button" class="sw${big ? ' sw--big' : ''}" data-copy="${h}" style="--c:${h}${t ? ';--t:' + t : ''}" aria-label="Copy ${n} ${h}">
      <span class="sw__chip">${n}</span><span class="sw__info"><b>${h.toUpperCase()}</b><code>RGB ${rgb(h).join(' ')}</code><code>CMYK ${cmyk(h)}</code>${pms ? `<code>${pms}</code>` : ''}<span>${use}</span></span></button>`).join('');
    const PAIRS = [['#ffffff', '#ff6a13', 'White on Glaze Orange', 'Bold labels 14 px+ on buttons and badges (brand choice)'], ['#3a1e10', '#fff8f1', 'Brown on Cream', 'All body text'], ['#3a1e10', '#ff6a13', 'Brown on Glaze Orange', 'Big headlines on orange'], ['#ffffff', '#3a1e10', 'White on Brown', 'Menu boards, dark panels'], ['#ffd2b0', '#3a1e10', 'Peach on Brown', 'Small notes on dark'], ['#b33c00', '#fff8f1', 'Orange Ink on Cream', 'Small orange text, links'], ['#d64f00', '#ffffff', 'Orange Hi on White', 'Large orange words only'], ['#745443', '#fff8f1', 'Muted on Cream', 'Captions and fine print']];
    const c = $('#contrast');
    if (c) c.innerHTML = `<thead><tr><th>Pair</th><th>Ratio</th><th>Use it for</th></tr></thead><tbody>${PAIRS.map(([fg, bg, n, use]) => { const r = ratio(fg, bg); return `<tr><td><span class="pv" style="color:${fg};background:${bg}">Aa ${n}</span></td><td><b>${r.toFixed(1)}:1</b> ${r >= 4.5 ? '<span class="tag tag--ok">AA text</span>' : r >= 3 ? '<span class="tag">AA large</span>' : '<span class="tag">bold only</span>'}</td><td>${use}</td></tr>`; }).join('')}</tbody>`;
  }

  // ---------- storefront ----------
  function storefront() {
    const [a, b] = words();
    let scal = '';
    for (let x = 60; x < 740; x += 34) scal += `<circle cx="${x + 17}" cy="192" r="17" fill="${(x / 34) % 2 ? '#fff' : '#ff6a13'}"/>`;
    const dn = (n, x, y, s = 62) => `<image href="../assets/3d/donuts/${n}-sm.webp" x="${x}" y="${y}" width="${s}" height="${s}"/>`;
    return `<svg viewBox="0 0 800 470" role="img" aria-label="Storefront with awning, sign and window display">
      <defs><linearGradient id="sfSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe2c7"/><stop offset="1" stop-color="#fff8f1"/></linearGradient>
      <pattern id="sfBrick" width="44" height="22" patternUnits="userSpaceOnUse"><rect width="44" height="22" fill="#f6e2cf"/><path d="M0 11h44M22 0v11M0 11v11M44 11v11" stroke="#ead0b6" stroke-width="1.6"/></pattern>
      <pattern id="sfAwn" width="68" height="10" patternUnits="userSpaceOnUse"><rect width="34" height="10" fill="#ff6a13"/><rect x="34" width="34" height="10" fill="#fff"/></pattern>
      <filter id="sfGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <rect width="800" height="470" fill="url(#sfSky)"/>
      <rect x="60" y="30" width="680" height="380" fill="url(#sfBrick)"/>
      <rect x="50" y="30" width="700" height="104" rx="6" fill="#3a1e10"/>
      ${iconAt(214, 38, 88, 'color')}
      <text x="312" y="104" font-family="Plus Jakarta Sans, Arial, sans-serif" font-weight="800" font-size="58" letter-spacing="-2"><tspan fill="#fff" data-b="w1">${esc(a)}</tspan><tspan fill="#ffb27a" data-b="w2">${esc(b)}</tspan></text>
      <text x="704" y="64" text-anchor="end" font-family="Caveat, cursive" font-weight="700" font-size="22" fill="#ffd2b0">est. <tspan data-b="est">${esc(val('est'))}</tspan></text>
      <path d="M44 134h712l-16 58H60z" fill="url(#sfAwn)"/>${scal}
      <rect x="92" y="222" width="300" height="168" rx="8" fill="#2a1409" stroke="#6e4630" stroke-width="8"/>
      <path d="M100 300h284M100 380h284" stroke="#6e4630" stroke-width="5"/>
      ${dn('midnight-marble', 108, 240)}${dn('mango-graham', 178, 236)}${dn('ube-cheese-cloud', 250, 240)}${dn('strawberry-sprinkle', 318, 238)}
      ${dn('matcha-web', 120, 318)}${dn('caramel-biscuit-crunch', 192, 314)}${dn('choco-crumble-stripe', 262, 318)}${dn('cheese-cloud', 322, 318, 56)}
      <text x="242" y="216" text-anchor="middle" font-family="Caveat, cursive" font-weight="700" font-size="22" fill="#b33c00">filled fresh at 5 AM</text>
      <rect x="430" y="214" width="130" height="196" fill="#6e4630"/><rect x="444" y="228" width="102" height="120" rx="4" fill="#2a1409"/>
      <rect x="462" y="252" width="66" height="26" rx="13" fill="#1fae5b"/><text x="495" y="270" text-anchor="middle" font-family="Plus Jakarta Sans, Arial" font-weight="800" font-size="13" letter-spacing="2" fill="#fff">OPEN</text>
      <text x="495" y="300" text-anchor="middle" font-family="Inter, Arial" font-weight="600" font-size="9" fill="#ffd2b0" data-b="hoursWk">${esc(val('hoursWk'))}</text>
      <text x="495" y="314" text-anchor="middle" font-family="Inter, Arial" font-weight="600" font-size="9" fill="#ffd2b0" data-b="hoursWe">${esc(val('hoursWe'))}</text>
      <circle cx="538" cy="372" r="5" fill="#ffd166"/>
      <rect x="592" y="222" width="116" height="168" rx="8" fill="#2a1409" stroke="#6e4630" stroke-width="8"/>
      <g filter="url(#sfGlow)"><ellipse cx="650" cy="290" rx="34" ry="24" fill="none" stroke="#ffb27a" stroke-width="5"/><path d="M618 284c4-14 18-20 32-20s28 6 32 20" fill="none" stroke="#ff6a13" stroke-width="5" stroke-linecap="round"/></g>
      <text x="650" y="350" text-anchor="middle" font-family="Caveat, cursive" font-weight="700" font-size="24" fill="#ffb27a" filter="url(#sfGlow)">open late-ish</text>
      <rect y="410" width="800" height="60" fill="#ead3bd"/><path d="M0 410h800" stroke="#d9bb9e" stroke-width="3"/>
      <g transform="translate(704 352)"><path d="M10 58L30 0h40l20 58" fill="#3a1e10"/><rect x="26" y="6" width="48" height="38" rx="3" fill="#241109"/><text x="50" y="22" text-anchor="middle" font-family="Caveat, cursive" font-weight="700" font-size="12" fill="#ffd2b0">box of 6</text><text x="50" y="36" text-anchor="middle" font-family="Plus Jakarta Sans, Arial" font-weight="800" font-size="9" fill="#fff">+ FREE DRINK</text></g>
      <g transform="translate(70 360)"><rect x="0" y="22" width="34" height="30" rx="4" fill="#ff6a13"/><circle cx="17" cy="14" r="16" fill="#7fa05a"/><circle cx="8" cy="20" r="10" fill="#8fb562"/></g>
    </svg>`;
  }

  // ---------- merch ----------
  const T = (x, y, s, fill, txt, extra = '') => `<text x="${x}" y="${y}" text-anchor="middle" font-family="Plus Jakarta Sans, Arial, sans-serif" font-weight="800" font-size="${s}" letter-spacing="-.5" fill="${fill}" ${extra}>${esc(txt)}</text>`;
  const MERCH = {
    apron: () => `<svg viewBox="0 0 200 220" role="img" aria-label="Apron"><path d="M78 10c0 20 44 20 44 0" fill="none" stroke="#6e4630" stroke-width="5"/><path d="M70 12h60v34l34 22v140H36V68l34-22z" fill="#3a1e10"/><path d="M36 92h-26M164 92h26" stroke="#6e4630" stroke-width="5" stroke-linecap="round"/><rect x="66" y="150" width="68" height="40" rx="6" fill="none" stroke="#6e4630" stroke-width="3" stroke-dasharray="5 4"/>${iconAt(78, 54, 44, 'color')}${T(100, 122, 17, '#fff', val('name'))}<text x="100" y="140" text-anchor="middle" font-family="Caveat, cursive" font-weight="700" font-size="15" fill="#ffb27a">${esc(val('tagline'))}</text></svg>`,
    cap: () => `<svg viewBox="0 0 200 200" role="img" aria-label="Cap"><path d="M30 128c40 22 110 22 160-4-10 22-54 32-96 30-30-1-52-10-64-26z" fill="#d64f00"/><path d="M38 128c-2-52 24-82 64-84 40 2 64 32 62 84-40 12-86 12-126 0z" fill="#ff6a13"/><path d="M100 44v80M64 52c-8 22-10 50-8 76M136 52c8 22 10 50 8 76" fill="none" stroke="#e85706" stroke-width="2"/><circle cx="100" cy="44" r="5" fill="#e85706"/>${iconAt(72, 72, 56, 'reverse')}</svg>`,
    tee: () => `<svg viewBox="0 0 200 200" role="img" aria-label="T-shirt"><path d="M62 24l24-8c6 10 22 10 28 0l24 8 36 30-20 24-14-10v112H60V68L46 78 26 54z" fill="#fff8f1" stroke="#e7d2c0" stroke-width="2"/><path d="M86 16c6 12 22 12 28 0" fill="none" stroke="#e7d2c0" stroke-width="3"/>${iconAt(70, 52, 60, 'color')}${T(100, 130, 18, '#3a1e10', val('name'))}<text x="100" y="150" text-anchor="middle" font-family="Caveat, cursive" font-weight="700" font-size="16" fill="#d64f00">${esc(val('tagline'))}</text></svg>`,
    tote: () => `<svg viewBox="0 0 200 210" role="img" aria-label="Tote bag"><path d="M70 70c0-50 60-50 60 0" fill="none" stroke="#d9bb9e" stroke-width="7"/><rect x="40" y="66" width="120" height="136" rx="4" fill="#f1e3d0"/><g opacity=".9">${iconAt(68, 82, 64, 'orange')}</g>${T(100, 168, 20, '#3a1e10', val('name'))}<text x="100" y="188" text-anchor="middle" font-family="Caveat, cursive" font-weight="700" font-size="16" fill="#b33c00">carry the box, not the guilt</text></svg>`,
    mug: () => `<svg viewBox="0 0 200 200" role="img" aria-label="Mug"><path d="M150 82c26 0 26 52 0 52" fill="none" stroke="#ff6a13" stroke-width="12"/><rect x="46" y="56" width="108" height="118" rx="12" fill="#ff6a13"/><ellipse cx="100" cy="58" rx="54" ry="8" fill="#e85706"/><ellipse cx="100" cy="58" rx="46" ry="5" fill="#3a1e10"/>${iconAt(70, 82, 60, 'reverse')}${T(100, 160, 15, '#fff', val('name'))}</svg>`,
    pin: () => `<svg viewBox="0 0 200 200" role="img" aria-label="Enamel pin"><circle cx="100" cy="100" r="78" fill="#ffd166"/><circle cx="100" cy="100" r="70" fill="#3a1e10"/>${iconAt(56, 46, 88, 'color')}${T(100, 150, 14, '#ffb27a', val('nameUp'), 'letter-spacing="2"')}</svg>`,
  };
  const renderMerch = () => $$('[data-merch]').forEach((el) => { el.innerHTML = MERCH[el.dataset.merch](); });

  // ---------- materials checklist (status follows the details panel) ----------
  const CHECK = [
    ['Identity', 'Primary logo (horizontal)', 'logo'], ['Identity', 'Stacked logo', 'logo'], ['Identity', 'Icon mark (filled donut)', 'logo'], ['Identity', 'Wordmark', 'logo'],
    ['Identity', 'Roundel badge', 'logo', ['est']], ['Identity', 'Donut-bomb sticker', 'logo'], ['Identity', 'Logo colour versions', 'logo'], ['Identity', 'Clear space, minimum size, misuse', 'logo'],
    ['Identity', 'Colour palette (HEX, RGB, CMYK)', 'color'], ['Identity', 'Typography + type scale', 'type'], ['Identity', 'Icon set (32 line icons)', 'icons-ch'], ['Identity', 'Graphic elements + patterns', 'elements'],
    ['Identity', '3D render library (62 renders)', 'imagery'], ['Identity', 'Real shop + food photos', 'imagery', [], 'shoot'],
    ['Voice', 'Promise, story, personality', 'essence'], ['Voice', 'Taglines, CTAs, hashtags', 'voice'], ['Voice', 'Boilerplate + social bios', 'voice', ['ig', 'web']], ['Voice', 'Words we use / avoid', 'voice'],
    ['Packaging', 'Box lid (6 / 12 / 24)', 'packaging'], ['Packaging', 'Inner lid message', 'packaging', ['ig']], ['Packaging', 'Box side panel', 'packaging', ['web', 'ig']], ['Packaging', 'Hot cup + sleeve', 'packaging'],
    ['Packaging', 'Iced cup', 'packaging'], ['Packaging', 'Paper bag + seal', 'packaging'], ['Packaging', 'Wax paper', 'packaging'], ['Packaging', 'Box tape', 'packaging', ['ig']],
    ['Packaging', 'Napkin', 'packaging'], ['Packaging', 'Gift hang tag', 'packaging'], ['Packaging', 'Delivery bag sticker', 'packaging', ['phone', 'ig']],
    ['Store', 'Storefront sign + awning', 'store', ['est']], ['Store', 'Menu board', 'store'], ['Store', 'A-frame sidewalk sign', 'store'], ['Store', 'Door hours sign', 'store', ['phone']],
    ['Store', 'Shelf price tag', 'store'], ['Store', 'Order number tent', 'store'], ['Store', 'Guest Wi-Fi card', 'store', ['wifi']], ['Store', 'Window decal', 'store', ['ig']],
    ['Print', 'Business card', 'print', ['owner', 'role', 'phone', 'email', 'web']], ['Print', 'Loyalty card', 'print'], ['Print', 'A5 flyer', 'print', ['ig']], ['Print', 'Poster', 'print', ['web']],
    ['Print', 'Gift card', 'print'], ['Print', 'Coupon', 'print'], ['Print', 'Thank-you card', 'print', ['ig']], ['Print', 'Receipt', 'print', ['phone', 'reg']],
    ['Print', 'Letterhead', 'print', ['phone', 'email', 'web', 'reg']], ['Print', 'Envelope', 'print', ['city']], ['Print', 'Allergen card', 'print'], ['Print', 'Review card', 'print', ['web']],
    ['Digital', 'Instagram posts (3:4)', 'digital', ['ig']], ['Digital', 'Stories (9:16)', 'digital'], ['Digital', 'Facebook cover', 'digital'], ['Digital', 'YouTube thumbnail', 'digital'],
    ['Digital', 'Email newsletter', 'digital', ['web']], ['Digital', 'Email signature', 'digital', ['owner', 'role', 'phone', 'email', 'web']], ['Digital', 'Web ad banners', 'digital'],
    ['Digital', 'Profile pictures + app icon', 'digital'], ['Digital', 'Favicon', 'digital'], ['Digital', 'Link share image (OG)', 'digital', ['web']], ['Digital', 'Maps listing', 'digital', ['phone', 'city']], ['Digital', 'Delivery app banner', 'digital'],
    ['Website', 'UI kit (buttons, chips, cards)', 'ui'],
    ['Merch', 'Apron', 'merch'], ['Merch', 'Cap', 'merch'], ['Merch', 'T-shirt', 'merch'], ['Merch', 'Tote bag', 'merch'], ['Merch', 'Mug', 'merch'], ['Merch', 'Enamel pin', 'merch'], ['Merch', 'Staff name badge', 'merch', ['owner']],
    ['Motion', 'Falling donut, sprinkle burst, button pop', 'motion'], ['Motion', 'Timing tokens', 'motion'],
    ['Toolkit', 'CSS + JSON design tokens', 'toolkit'], ['Toolkit', 'SVG logo files', 'toolkit'],
  ];
  const LABEL = Object.fromEntries(FIELDS.map((f) => [f[0], f[1]]));
  function renderCheck() {
    const t = $('#checkBody'); if (!t) return;
    let ready = 0, need = 0, shoot = 0;
    t.innerHTML = CHECK.map(([grp, item, sec, keys = [], kind]) => {
      const miss = keys.filter(isPH);
      let st;
      if (kind === 'shoot') { shoot++; st = '<span class="tag tag--todo">Shoot photos</span>'; }
      else if (miss.length) { need++; st = `<span class="tag tag--todo">Needs: ${miss.map((k) => LABEL[k].toLowerCase()).join(', ')}</span>`; }
      else { ready++; st = '<span class="tag tag--ok">Ready</span>'; }
      return `<tr><td>${item}</td><td>${grp}</td><td><a href="#${sec}">Open</a></td><td>${st}</td></tr>`;
    }).join('');
    const s = $('#checkSum');
    const mc = $('#matCount'); if (mc) mc.textContent = CHECK.length;
    if (s) s.innerHTML = `<div><b>${CHECK.length}</b>materials</div><div><b>${ready}</b>ready to use</div><div><b>${need}</b>waiting on details</div><div><b>${shoot}</b>need a photo shoot</div>`;
  }

  // ---------- render everything that depends on the details ----------
  function render() {
    $$('[data-b]').forEach((el) => { const k = el.dataset.b; el.textContent = val(k); el.classList.toggle('is-ph', isPH(k)); });
    $$('[data-lockup]').forEach((el) => { el.innerHTML = lockup(el.dataset.lockup, el.dataset.v); });
    $$('[data-icon]').forEach((el) => { el.innerHTML = iconSVG(el.dataset.icon || 'color'); });
    $$('[data-roundel]').forEach((el) => { const [bg, ring, ink] = (el.dataset.roundel || '').split(',').filter(Boolean); el.innerHTML = roundel(bg, ring, ink); });
    $$('[data-bomb]').forEach((el) => { el.innerHTML = bomb(); });
    const sf = $('#storefront'); if (sf) sf.innerHTML = storefront();
    renderBoard(); renderMerch(); renderCheck();
    const n = [...PH].filter(isPH).length;
    const c = $('#phCount'); if (c) c.textContent = n ? `${n} details are still placeholders. Replace them when you have them; every mockup updates.` : 'All details filled in. Every mockup uses your real details.';
    $$('.field').forEach((f) => { const k = f.dataset.k; const tag = $('.tag', f); if (tag) tag.hidden = !isPH(k); });
    document.title = `${val('name')} Brand Kit`;
  }

  // details form
  const form = $('#detailsForm');
  if (form) {
    form.innerHTML = FIELDS.map(([k, label, def, ph]) => `<label class="field" data-k="${k}"><span>${label}${ph ? ' <i class="tag tag--todo">placeholder</i>' : ''}</span><input name="${k}" value="${esc(D[k] ?? def)}" placeholder="${esc(def)}" autocomplete="off" spellcheck="false"></label>`).join('');
    let t;
    form.addEventListener('input', (e) => { const k = e.target.name; if (!k) return; D[k] = e.target.value; save(); clearTimeout(t); t = setTimeout(render, 120); });
  }
  $('#resetDetails')?.addEventListener('click', () => { Object.assign(D, DEF); save(); $$('input', form).forEach((i) => { i.value = DEF[i.name]; }); render(); toast('Details reset to the defaults'); });
  $('#showPh')?.addEventListener('click', (e) => { const on = document.body.classList.toggle('show-ph'); e.currentTarget.setAttribute('aria-pressed', on); e.currentTarget.lastChild.textContent = on ? ' Hide placeholders' : ' Highlight placeholders'; });

  // ---------- downloads (SVG logos, tokens) ----------
  function download(name, text, type = 'image/svg+xml') {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 400);
    toast(`Saved ${name}`);
  }
  const svgDoc = (w, h, body) => `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${body}</svg>\n`;
  const wordSVG = (x, y, s, c1, c2, anchor = 'start') => { const [a, b] = words(); return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Plus Jakarta Sans, Arial, sans-serif" font-weight="800" font-size="${s}" letter-spacing="${-s * 0.035}"><tspan fill="${c1}">${esc(a)}</tspan><tspan fill="${c2}">${esc(b)}</tspan></text>`; };
  const slugName = () => raw('name').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const LOGO_FILES = {
    'logo-horizontal': () => { const w = Math.round(92 + raw('name').length * 27); return svgDoc(w, 80, iconAt(4, 6, 68, 'color') + wordSVG(84, 56, 46, '#3a1e10', '#ff6a13')); },
    'logo-horizontal-white': () => { const w = Math.round(92 + raw('name').length * 27); return svgDoc(w, 80, iconAt(4, 6, 68, 'color') + wordSVG(84, 56, 46, '#ffffff', '#ffb27a')); },
    'logo-stacked': () => svgDoc(320, 220, iconAt(110, 4, 100, 'color') + wordSVG(160, 190, 46, '#3a1e10', '#ff6a13', 'middle')),
    'icon-color': () => svgDoc(64, 64, iconInner('color')),
    'icon-on-orange': () => svgDoc(64, 64, `<rect width="64" height="64" rx="16" fill="#ff6a13"/><g transform="translate(6 4) scale(.82)">${iconInner('reverse')}</g>`),
    'icon-white': () => svgDoc(64, 64, iconInner('white')),
    'icon-brown': () => svgDoc(64, 64, iconInner('brown')),
    roundel: () => roundel().replace('<svg ', '<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" '),
    'bomb-sticker': () => bomb().replace('<svg ', '<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" '),
  };
  const TOKENS = {
    color: { orange: '#ff6a13', 'orange-d': '#e85706', 'orange-hi': '#d64f00', 'orange-ink': '#b33c00', 'orange-l': '#ffb27a', brown: '#3a1e10', 'brown-2': '#6e4630', muted: '#745443', cream: '#fff8f1', peach: '#ffe6d2', 'peach-2': '#fff0e3', dough: '#cf914c', fry: '#f7e2bd', 'on-orange': '#ffffff' },
    font: { title: "'Plus Jakarta Sans', sans-serif", body: "'Inter', sans-serif", hand: "'Caveat', cursive" },
    radius: { chip: '999px', card: '24px', plate: '28px', hero: '36px' },
    motion: { ease: 'cubic-bezier(.22, 1, .36, 1)', fast: '200ms', base: '350ms', slow: '900ms', drop: '1200ms' },
  };
  const tokensCSS = () => `/* ${val('name')} design tokens */\n:root {\n${Object.entries(TOKENS).map(([g, o]) => Object.entries(o).map(([k, v]) => `  --${g === 'color' ? '' : g + '-'}${k}: ${v};`).join('\n')).join('\n')}\n}\n`;
  document.addEventListener('click', (e) => {
    const d = e.target.closest('[data-dl]');
    if (d) {
      const k = d.dataset.dl, s = slugName();
      if (k === 'tokens-css') return download(`${s}-tokens.css`, tokensCSS(), 'text/css');
      if (k === 'tokens-json') return download(`${s}-tokens.json`, JSON.stringify({ brand: val('name'), tagline: val('tagline'), ...TOKENS }, null, 2), 'application/json');
      if (k === 'details-json') return download(`${s}-details.json`, JSON.stringify(Object.fromEntries(FIELDS.map((f) => [f[0], raw(f[0])])), null, 2), 'application/json');
      if (k === 'all-logos') { Object.keys(LOGO_FILES).forEach((n, i) => setTimeout(() => download(`${s}-${n}.svg`, LOGO_FILES[n]()), i * 250)); return; }
      if (LOGO_FILES[k]) return download(`${s}-${k}.svg`, LOGO_FILES[k]());
    }
    const cp = e.target.closest('[data-copy]');
    if (cp) {
      const txt = cp.dataset.copy;
      (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => toast(`Copied ${txt}`), () => toast(txt));
    }
    const lb = e.target.closest('#libTabs .ui-chip');
    if (lb) renderLib(lb.dataset.lib);
    const pl = e.target.closest('[data-play]');
    if (pl) play($(pl.dataset.play));
  });

  // ---------- toast ----------
  let tt;
  function toast(msg) { const t = $('#toast'); if (!t) return; t.textContent = msg; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 2200); }

  // ---------- motion demos ----------
  function play(el) { if (!el) return; el.classList.remove('play'); void el.offsetWidth; el.classList.add('play'); }
  const burst = $('#burst');
  if (burst) {
    const cols = ['#ff6a13', '#ffb9cc', '#c6e1b0', '#d6bdf0', '#ffd166', '#3a1e10'];
    burst.insertAdjacentHTML('beforeend', Array.from({ length: 28 }, (_, i) => `<i style="background:${cols[i % cols.length]};--r:${Math.round(i * (360 / 28) + rnd() * 10)}deg;--d:${Math.round(60 + rnd() * 50)}px"></i>`).join(''));
  }

  // ---------- static lists ----------
  const icons = $('#icons');
  if (icons) icons.innerHTML = Object.keys(ICONS).map((k, i) => `<div class="ico${i % 9 === 4 ? ' ico--fill' : ''}">${lineIcon(k)}<span>${k}</span></div>`).join('');
  const FLAV = [['Original glaze', '#fbe7c4'], ['Strawberry', '#ff8fb4'], ['Matcha', '#a8d48f'], ['Ube', '#a46be0'], ['Caramel', '#d9a066'], ['Coffee', '#c8955f'], ['Hazelnut', '#6b3f26'], ['Dark choco', '#2e1810']];
  const fl = $('#flavors');
  if (fl) fl.innerHTML = FLAV.map(([n, h]) => `<button type="button" class="flavor" data-copy="${h}" aria-label="Copy ${n} ${h}"><i style="--c:${h}"></i>${n}<code>${h}</code></button>`).join('');
  renderColors();
  renderLib('donuts');

  // ---------- contents: highlight the chapter on screen ----------
  const links = $$('.toc a');
  const io = new IntersectionObserver((es) => {
    es.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((a) => {
        const on = a.getAttribute('href') === '#' + en.target.id;
        a.classList.toggle('is-on', on);
        if (on) { a.setAttribute('aria-current', 'true'); const toc = a.closest('.toc'); if (toc && toc.scrollWidth > toc.clientWidth) toc.scrollTo({ left: a.offsetLeft - 16, behavior: reduce ? 'auto' : 'smooth' }); } else a.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-35% 0px -60% 0px' });
  $$('.chap, #top').forEach((s) => io.observe(s));

  render();
})();
