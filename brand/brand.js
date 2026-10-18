/* Glaze Bomb brand kit: logo builder, live "your details", artwork generators, downloads, demos.
   Classic script (no modules) so the kit also opens straight from the folder (file://). */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let uid = 0;

  // ---------- your details (placeholders until the real ones are known) ----------
  // [key, label, default, isPlaceholder, input type]
  const FIELDS = [
    ['name', 'Brand name', 'Glaze Bomb'],
    ['tagline', 'Tagline', 'Filled to the edge.'],
    ['promo', 'Signature offer', 'Free drink with every box of 6'],
    ['address', 'Street address', '12 Glaze Lane, Downtown'],
    ['city', 'City / area', 'Your City', 1],
    ['hoursWk', 'Weekday hours', 'Mon-Fri 6 AM - 2 PM'],
    ['hoursWe', 'Weekend hours', 'Sat-Sun 7 AM - 1 PM'],
    ['phone', 'Phone', '(555) 010-4242', 1, 'tel'],
    ['email', 'Email', 'hello@glazebomb.example', 1, 'email'],
    ['web', 'Website', 'www.glazebomb.example', 1, 'url'],
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
  const LABEL = Object.fromEntries(FIELDS.map((f) => [f[0], f[1]]));
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
    if (kind === 'stamp') return `<span class="stamp-word">${esc(raw('name').toUpperCase())}</span>`;
    return `<span class="lockup${kind === 'stack' ? ' lockup--stack' : ''}">${iconSVG(v)}${txt}</span>`;
  };
  // SVG versions of the wordmark (two-tone, no space) and the stamp (caps, letter-spaced, one colour)
  const FT = 'Plus Jakarta Sans, Arial, sans-serif';
  const wordSVG = (x, y, s, c1, c2, anchor = 'start') => {
    const [a, b] = words();
    return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${FT}" font-weight="800" font-size="${s}" letter-spacing="${(-s * 0.035).toFixed(2)}"><tspan fill="${c1}">${esc(a)}</tspan><tspan fill="${c2}" dx="${(s * 0.05).toFixed(2)}">${esc(b)}</tspan></text>`;
  };
  const stampSVG = (x, y, s, c, anchor = 'middle') => `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${FT}" font-weight="800" font-size="${s}" letter-spacing="${(s * 0.16).toFixed(2)}" fill="${c}">${esc(raw('name').toUpperCase())}</text>`;
  const caveat = (x, y, s, c, t, anchor = 'middle', extra = '') => `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Caveat, cursive" font-weight="700" font-size="${s}" fill="${c}" ${extra}>${esc(t)}</text>`;

  function roundel(bg = '#3a1e10', ring = '#ffb27a', ink = '#fff') {
    const id = 'rp' + (++uid);
    const t = `${val('name')} · ${val('tagline').replace(/[.!]$/, '')} · EST. ${val('est')} · `.toUpperCase();
    return `<svg viewBox="0 0 200 200" role="img" aria-label="${esc(val('name'))} roundel badge"><defs><path id="${id}" d="M100 100m-74 0a74 74 0 1 1 148 0a74 74 0 1 1-148 0"/></defs>
      <circle cx="100" cy="100" r="98" fill="${bg}"/><circle cx="100" cy="100" r="90" fill="none" stroke="${ring}" stroke-width="2"/>
      <circle cx="100" cy="100" r="57" fill="none" stroke="${ring}" stroke-width="1.5" stroke-dasharray="3 5"/>
      <text font-family="${FT}" font-weight="800" font-size="14" letter-spacing="2" fill="${ink}"><textPath href="#${id}" textLength="452" lengthAdjust="spacing">${esc(t)}</textPath></text>
      ${iconAt(62, 58, 76, 'color')}</svg>`;
  }
  // the bomb: the brand's second mark (donut + fuse + spark)
  const bomb = () => `<svg viewBox="0 0 200 200" role="img" aria-label="Donut bomb mark">
    <circle cx="100" cy="104" r="94" fill="#fff"/><circle cx="100" cy="104" r="86" fill="#ffe6d2"/>
    <path d="M100 92c2-26 22-36 42-46" fill="none" stroke="#3a1e10" stroke-width="6" stroke-linecap="round"/>
    <path d="M100 92c2-26 22-36 42-46" fill="none" stroke="#cf914c" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="4 5"/>
    <g transform="translate(146 42)"><path d="M0-21l5 12 13-4-8 11 11 8-13 1 1 13-9-10-9 10 1-13-13-1 11-8-8-11 13 4z" fill="#ffd166"/><circle r="6" fill="#ff6a13"/></g>
    ${iconAt(30, 64, 140, 'color')}</svg>`;
  // "the cut": the signature image that proves the promise (filling right to the edge)
  const FACE = 'M24 150C24 52 216 52 216 150C216 166 24 166 24 150Z';
  function cutDonut() {
    const u = 'cut' + (++uid);
    const spr = [[84, 86, 20, '#fff'], [102, 80, -15, '#ffd166'], [122, 78, 8, '#3a1e10'], [142, 80, 30, '#fff'], [160, 86, -30, '#ffb9cc'], [66, 97, 50, '#8fd3ff'], [176, 96, -50, '#ffd166'], [112, 89, 70, '#ffb9cc'], [134, 89, -10, '#8fd3ff']];
    return `<svg viewBox="0 0 240 182" role="img" aria-label="A filled donut cut in half: glaze on top, cream filling right to the edge">
      <defs><radialGradient id="${u}a" cx="50%" cy="58%" r="62%"><stop offset="0" stop-color="#fdeccb"/><stop offset="1" stop-color="#efcf98"/></radialGradient>
      <linearGradient id="${u}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#ffe0a0"/></linearGradient>
      <linearGradient id="${u}c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff8f45"/><stop offset="1" stop-color="#e85706"/></linearGradient>
      <clipPath id="${u}f"><path d="${FACE}"/></clipPath>
      <clipPath id="${u}t"><path d="M0 0H240V110H221c2 7 2 22-4 23-6 1-5-14-7-18-1-2-2-4-3-5H40c-2 2-3 6-4 10-2 7-2 20-8 20-6-1-5-20-3-30H0Z"/></clipPath></defs>
      <ellipse cx="120" cy="170" rx="106" ry="10" fill="#3a1e10" opacity=".14"/>
      <path d="${FACE}" fill="url(#${u}a)"/>
      <g clip-path="url(#${u}f)"><g fill="#e3b979" opacity=".75"><ellipse cx="46" cy="140" rx="4" ry="2.4"/><ellipse cx="58" cy="156" rx="5" ry="2.4"/><ellipse cx="194" cy="138" rx="4.5" ry="2.4"/><ellipse cx="184" cy="156" rx="3.6" ry="2"/><ellipse cx="102" cy="158" rx="3" ry="1.6"/><ellipse cx="140" cy="159" rx="3.4" ry="1.8"/><ellipse cx="52" cy="122" rx="3" ry="1.8"/><ellipse cx="190" cy="120" rx="3" ry="1.8"/></g>
        <path d="M44 132C44 88 196 88 196 132C196 150 170 154 120 154C70 154 44 150 44 132Z" fill="url(#${u}b)"/>
        <path d="M64 112C86 100 154 100 176 112" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".85"/></g>
      <path d="${FACE}" fill="none" stroke="#c98a43" stroke-width="5"/>
      <path d="M28 158C64 170 176 170 212 158" fill="none" stroke="#f7e2bd" stroke-width="3"/>
      <path clip-path="url(#${u}t)" d="M19 150C19 46 221 46 221 150L204 150C204 76 36 76 36 150Z" fill="url(#${u}c)"/>
      <path d="M66 90c14-8 30-12 46-13" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" opacity=".5"/>
      <g stroke-linecap="round" stroke-width="3.4">${spr.map(([x, y, r, c]) => `<path d="M${x - 3} ${y}h6" stroke="${c}" transform="rotate(${r} ${x} ${y})"/>`).join('')}</g></svg>`;
  }
  // neon sign: the logo silhouette (a filled dome with a dripping glaze line), never a ring
  function neonDome(text) {
    const u = 'neo' + (++uid);
    return `<svg viewBox="0 0 220 ${text ? 168 : 118}" role="img" aria-label="Neon sign: the filled donut silhouette${text ? ' and the words fresh at 5 AM' : ''}">
      <defs><filter id="${u}" x="-30%" y="-40%" width="160%" height="180%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <g filter="url(#${u})" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M30 96C30 36 190 36 190 96Z" stroke="#ffb27a" stroke-width="5"/>
        <path d="M36 72c9 5 13-4 21 2s5 14 13 14 8-10 15-10 8 13 16 13 8-11 16-11 6 10 14 10 8-12 15-12 7 7 14 3" stroke="#ff6a13" stroke-width="4.5"/>
        ${text ? caveat(110, 150, 32, '#ffd2b0', 'fresh at 5 AM') : ''}
      </g></svg>`;
  }
  // the fuse: a dashed line that ends in a spark (tear lines, dividers, countdowns)
  const fuse = () => `<svg viewBox="0 0 400 28" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M4 14H372" stroke="currentColor" stroke-width="3" stroke-dasharray="9 7" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg><svg class="fuse__spark" viewBox="-14 -14 28 28" aria-hidden="true" focusable="false"><path d="M0-13l3 8 8-3-5 7 7 5-8 1 1 8-6-6-6 6 1-8-8-1 7-5-5-7 8 3z" fill="#ffd166"/><circle r="4" fill="#ff6a13"/></svg>`;

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
  root.style.setProperty('--wrap', uri(`<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><g opacity=".34">${iconAt(14, 14, 44, 'orange')}${iconAt(94, 94, 44, 'orange')}</g><text x="96" y="52" font-family="Caveat, cursive" font-weight="700" font-size="20" fill="#e85706" opacity=".55" transform="rotate(-12 96 52)">fresh!</text><text x="12" y="132" font-family="Caveat, cursive" font-weight="700" font-size="20" fill="#e85706" opacity=".55" transform="rotate(-12 12 132)">filled!</text></svg>`));
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
    recyclable: '<path d="M20 12a8 8 0 0 1-14 5.3M4 12a8 8 0 0 1 14-5.3"/><path d="M18 3v4h-4M6 21v-4h4"/>',
    gluten: '<path d="M12 21V8M12 8c-2-1-3-3-3-5 2 1 3 3 3 5zM12 8c2-1 3-3 3-5-2 1-3 3-3 5zM12 13c-2.5-.5-4-2.5-4-4.5 2.5.5 4 2.5 4 4.5zM12 13c2.5-.5 4-2.5 4-4.5-2.5.5-4 2.5-4 4.5zM12 18c-2.5-.5-4-2.5-4-4.5 2.5.5 4 2.5 4 4.5zM12 18c2.5-.5 4-2.5 4-4.5-2.5.5-4 2.5-4 4.5z"/>',
    dairy: '<path d="M8 3h8v3l2 3v12H6V9l2-3zM6 12h12"/>',
    egg: '<path d="M12 3c3.6 0 6.5 6 6.5 10.2a6.5 6.5 0 0 1-13 0C5.5 9 8.4 3 12 3z"/>',
    nuts: '<path d="M12 3c3.6 2.2 6 5.8 6 9.6 0 4.6-2.7 8.4-6 8.4s-6-3.8-6-8.4C6 8.8 8.4 5.2 12 3z"/><path d="M12 7.5c-1.6 2.6-2 5.8-.8 9.5"/>',
    sesame: '<path d="M7.5 10.5c0-2.6 1.6-4.6 3-4.6s1.4 2.6.6 4.6-2.2 3-3 2.5-.6-1-.6-2.5zM14 15.5c.8-2.4 2.8-3.8 4.2-3.4s.6 2.8-.6 4.4-3 2.2-3.6 1.5-.3-1.5 0-2.5zM6 17.5c1.4-2 3.6-2.6 4.6-1.8s0 2.8-1.7 3.8-3.4.9-3.6 0 .3-1.3.7-2z"/>',
    soy: '<path d="M5 17.5c2-6.5 8-11.5 14.5-12.5-1 6.5-6.5 12.5-12.5 14.5-1.5.4-2.5-.5-2-2z"/><circle cx="10" cy="14" r="1.5"/><circle cx="13.6" cy="10.4" r="1.5"/>',
    coconut: '<circle cx="12" cy="12.5" r="8"/><circle cx="8.5" cy="9.5" r=".9"/><circle cx="12" cy="8" r=".9"/><circle cx="15.5" cy="9.5" r=".9"/>',
  };
  const lineIcon = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[k]}</svg>`;

  // ---------- menu (same prices as the website) ----------
  const MENU = {
    premium: [['Almond Snowcap', 3.6, 'vanilla custard'], ['Wafer Crunch Bar', 3.7, 'chocolate cream'], ['Hazelnut Velvet', 3.6, 'hazelnut cream'], ['Caramel Biscuit Crunch', 3.8, 'vanilla custard'], ["S'mores Campfire", 3.7, 'toasted marshmallow'], ['Bavarian Cream Dream', 3.6, 'Bavarian cream'], ['Midnight Marble', 3.6, 'chocolate ganache'], ['Snow Web', 3.6, 'white chocolate cream'], ['Cheese Cloud', 3.5, 'cream cheese'], ['Tiramisu Dust', 3.7, 'mascarpone cream'], ['Coffee Crumble', 3.6, 'coffee custard'], ['Cookies & Cream Latte', 3.5, 'vanilla cream'], ['Ube Cheese Cloud', 3.7, 'ube halaya'], ['Mango Graham', 3.9, 'mango cream'], ['Matcha Almond', 3.7, 'matcha cream'], ['Matcha Web', 3.7, 'white chocolate cream'], ['Berry Coconut Snow', 3.6, 'strawberry jam'], ['Cappuccino Swirl', 3.6, 'coffee cream'], ['Milk Tea Sesame', 3.4, 'brown sugar custard'], ['Choco Crumble Stripe', 3.7, 'chocolate cream']],
    classic: [['Original Glaze', 2.5, 'vanilla custard'], ['Choco Glaze', 2.6, 'chocolate cream'], ['Strawberry Glaze', 2.6, 'strawberry jam'], ['Choco Sprinkle', 2.8, 'chocolate cream'], ['Strawberry Sprinkle', 2.8, 'strawberry jam'], ['Hazelnut Crunch', 2.9, 'hazelnut cream'], ['Choco Almond', 2.9, 'vanilla custard'], ['Cookie Speckle', 2.8, 'vanilla cream'], ['Mocha Glaze', 2.6, 'coffee custard'], ['Matcha Drizzle', 2.8, 'matcha cream'], ['Mallow Party', 2.9, 'marshmallow cream'], ['Caramel Drizzle', 2.7, 'salted caramel']],
    hot: [['Classic Americano', 2.8], ['Cafe Latte', 3.4], ['Caramel Macchiato', 3.8], ['Spanish Latte', 3.8], ['Hot Chocolate', 3.2], ['Hot Matcha Latte', 3.9]],
    iced: [['Iced Americano', 3.0], ['Iced Spanish Latte', 3.9], ['Iced Caramel Macchiato', 3.9], ['Iced Matcha Latte', 3.9], ['Orange Cold Brew', 3.6], ['Mocha Frappe', 4.2]],
    boxes: [['Classic', 14.9, 27.9, 52.9], ['Assorted', 17.9, 33.9, 63.9], ['Premium', 19.9, 37.9, 71.9]],
    combos: [['Solo Treat', 8.9, '1 iced caramel macchiato + 2 classics'], ['Double Date', 14.5, '2 iced Spanish lattes + 1 classic + 1 premium'], ['Squad Snack', 13.9, '1 mocha frappe + 2 premium + 1 classic']],
  };
  const money = (n) => val('cur') + n.toFixed(2);
  const li = (r) => `<li><span>${esc(r[0])}${r[2] ? `<small>${esc(r[2])}</small>` : ''}</span><b>${money(r[1])}</b></li>`;
  function renderBoards() {
    const b = $('#boards'); if (!b) return;
    b.innerHTML = `
      <div class="board">
        <header class="board__head">${lockup()}<p>every donut, filled</p></header>
        <p class="board__title">Premium <small>${money(3.4)} to ${money(3.9)}</small></p>
        <ul>${MENU.premium.map(li).join('')}</ul>
      </div>
      <div class="board">
        <p class="board__title">Classic <small>${money(2.5)} to ${money(2.9)}</small></p>
        <ul>${MENU.classic.map(li).join('')}</ul>
        <p class="board__title board__title--sm">Boxes <small>6 · 12 · 24</small></p>
        <ul class="board__boxes">${MENU.boxes.map((x) => `<li><span>${x[0]}</span><b>${money(x[1])}</b><b>${money(x[2])}</b><b>${money(x[3])}</b></li>`).join('')}</ul>
        <p class="board__offer">${esc(val('promo'))}</p>
        <img class="board__hero" src="../assets/3d/boxes/six-sm.webp" alt="" width="200" height="200" loading="lazy">
      </div>
      <div class="board">
        <p class="board__title board__title--sm">Hot</p><ul>${MENU.hot.map(li).join('')}</ul>
        <p class="board__title board__title--sm">Iced</p><ul>${MENU.iced.map(li).join('')}</ul>
        <p class="board__title board__title--sm">Combos</p>
        <ul class="board__combos">${MENU.combos.map((x) => `<li><span>${esc(x[0])}<small>${esc(x[2])}</small></span><b>${money(x[1])}</b></li>`).join('')}</ul>
        <img class="board__hero" src="../assets/3d/drinks/iced-spanish-latte-sm.webp" alt="" width="200" height="200" loading="lazy">
      </div>`;
  }

  // ---------- allergens (draft from the menu toppings: confirm every recipe before printing) ----------
  const ALLERGENS = [
    ['gluten', 'Wheat', 'Every donut'],
    ['dairy', 'Milk', 'Every donut'],
    ['egg', 'Egg', 'Every donut'],
    ['soy', 'Soy', 'Possible in chocolate glazes: check with suppliers'],
    ['nuts', 'Tree nuts', 'Almond Snowcap, Hazelnut Velvet, Matcha Almond, Hazelnut Crunch, Choco Almond'],
    ['coconut', 'Coconut', 'Berry Coconut Snow'],
    ['sesame', 'Sesame', 'Milk Tea Sesame'],
  ];
  function renderAllergens() {
    const el = $('#allergenCard'); if (!el) return;
    el.innerHTML = `<p class="allergen__title">Allergens</p>
      <ul>${ALLERGENS.map(([ic, n, w]) => `<li>${lineIcon(ic)}<span><b>${n}</b>${w}</span></li>`).join('')}</ul>
      <p class="allergen__note">Gelatin (marshmallow): Mallow Party, S'mores Campfire. Our kitchen handles tree nuts and sesame. Ask us before you order.</p>`;
  }

  // ---------- 3D render library ----------
  const DONUTS = 'almond-snowcap bavarian-cream-dream berry-coconut-snow cappuccino-swirl caramel-biscuit-crunch caramel-drizzle cheese-cloud choco-almond choco-crumble-stripe choco-glaze choco-sprinkle coffee-crumble cookie-speckle cookies-and-cream-latte hazelnut-crunch hazelnut-velvet mallow-party mango-graham matcha-almond matcha-drizzle matcha-web midnight-marble milk-tea-sesame mocha-glaze orange-zest-cream original-glaze smores-campfire snow-web strawberry-glaze strawberry-sprinkle tiramisu-dust ube-cheese-cloud ube-halaya wafer-crunch-bar'.split(' ');
  const OFF_MENU = new Set(['orange-zest-cream', 'ube-halaya']);
  const DRINK_IMG = 'classic-americano cafe-latte caramel-macchiato spanish-latte hot-chocolate hot-matcha-latte iced-americano iced-spanish-latte iced-caramel-macchiato iced-matcha-latte orange-cold-brew mocha-frappe'.split(' ');
  const BOX_IMG = { six: 'Box of 6', classic: 'Classic box', assorted: 'Assorted box', premium: 'Premium box' };
  const nice = (s) => (s === 'smores-campfire' ? "S'mores Campfire" : s.replace('-and-', ' & ').split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' '));
  const LIB = {
    donuts: DONUTS.map((s) => [`../assets/3d/donuts/${s}-sm.webp`, nice(s), `${s}.webp`, OFF_MENU.has(s)]),
    tops: DONUTS.map((s) => [`../assets/3d/donuts/${s}-top-sm.webp`, nice(s), `${s}-top.webp`, OFF_MENU.has(s)]),
    drinks: DRINK_IMG.map((s) => [`../assets/3d/drinks/${s}-sm.webp`, nice(s), `${s}.webp`]),
    boxes: Object.entries(BOX_IMG).map(([s, n]) => [`../assets/3d/boxes/${s}-sm.webp`, n, `${s}.webp`]),
  };
  const RENDER_TOTAL = Object.values(LIB).reduce((n, l) => n + l.length, 0);
  function renderLib(kind) {
    const g = $('#lib'); if (!g) return;
    g.innerHTML = LIB[kind].map(([src, n, file, off]) => `<figure class="render"><img src="${src}" alt="${esc(n)}" loading="lazy" width="200" height="200"><figcaption>${esc(n)}${off ? '<i class="tag tag--todo">not on the menu</i>' : ''}<code>${file}</code></figcaption></figure>`).join('');
    $$('#libTabs .chip').forEach((b) => { const on = b.dataset.lib === kind; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
  }

  // ---------- colour maths (RGB, CMYK, contrast) ----------
  const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const cmyk = (h) => { const [r, g, b] = rgb(h).map((x) => x / 255), k = 1 - Math.max(r, g, b); if (k >= 1) return '0 0 0 100'; return [r, g, b].map((x) => Math.round(((1 - x - k) / (1 - k)) * 100)).concat(Math.round(k * 100)).join(' '); };
  const lum = (h) => { const c = rgb(h).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  // [name, hex, use, print build, big, label colour]
  const CORE = [
    ['Glaze Orange', '#ff6a13', 'Hero colour: boxes, buttons, price badges', 'Pantone 1505 C spot on packaging · process build CMYK 0 65 100 0', 1],
    ['Deep Fry Brown', '#3a1e10', 'Text, dark panels, menu boards', 'Pantone 4625 C · rich-brown build CMYK 35 75 90 60', 1],
    ['Cream', '#fff8f1', 'Page background, wax paper, inner lids', '', 0, '#3a1e10'],
    ['Peach', '#ffe6d2', 'Soft panels, chips', '', 0, '#3a1e10'],
    ['Orange Deep', '#d64f00', 'Large orange words on light', '', 0, '#fff'],
    ['Apricot', '#ffd2b0', 'Small notes on brown, soft highlights', '', 0, '#3a1e10'],
    ['Orange Ink', '#b33c00', 'Small orange text, focus rings', ''],
    ['Dough', '#cf914c', 'The donut itself, kraft accents', '', 0, '#3a1e10'],
    ['Brown 2', '#6e4630', 'Secondary text, trims', ''],
  ];
  function renderColors() {
    const s = $('#swatches');
    if (s) s.innerHTML = CORE.map(([n, h, use, pms, big, t]) => `<button type="button" class="sw${big ? ' sw--big' : ''}" data-copy="${h}" style="--c:${h}${t ? ';--t:' + t : ''}" title="Copy ${h}">
      <span class="sw__chip">${n}</span><span class="sw__info"><b>${h.toUpperCase()} <i>copy</i></b><code>RGB ${rgb(h).join(' ')}</code>${pms ? `<code class="sw__print">${pms}</code>` : `<code>CMYK ${cmyk(h)} (screen conversion)</code>`}<span>${use}</span></span></button>`).join('');
    const PAIRS = [['#ffffff', '#ff6a13', 'White on Glaze Orange', 'Bold labels 14 px+ on buttons and badges (brand choice)'], ['#3a1e10', '#fff8f1', 'Brown on Cream', 'All body text'], ['#3a1e10', '#ff6a13', 'Brown on Glaze Orange', 'Big headlines on orange'], ['#ffffff', '#3a1e10', 'White on Brown', 'Menu boards, dark panels'], ['#ffd2b0', '#3a1e10', 'Apricot on Brown', 'Small notes on dark'], ['#b33c00', '#fff8f1', 'Orange Ink on Cream', 'Small orange text, links'], ['#d64f00', '#ffffff', 'Orange Deep on White', 'Large orange words only'], ['#745443', '#fff8f1', 'Muted on Cream', 'Captions and fine print']];
    const c = $('#contrast');
    if (c) c.innerHTML = `<thead><tr><th scope="col">Pair</th><th scope="col">Ratio</th><th scope="col">Use it for</th></tr></thead><tbody>${PAIRS.map(([fg, bg, n, use]) => { const r = ratio(fg, bg); return `<tr><td><span class="pv" style="color:${fg};background:${bg}">Aa ${n}</span></td><td><b>${r.toFixed(1)}:1</b> ${r >= 4.5 ? '<span class="tag tag--ok">AA text</span>' : r >= 3 ? '<span class="tag">AA large</span>' : '<span class="tag">bold only</span>'}</td><td>${use}</td></tr>`; }).join('')}</tbody>`;
  }

  // ---------- storefront ----------
  function storefront() {
    const [a, b] = words();
    let scal = '';
    for (let x = 60; x < 740; x += 34) scal += `<circle cx="${x + 17}" cy="192" r="17" fill="${(x / 34) % 2 ? '#fff' : '#ff6a13'}"/>`;
    const dn = (n, x, y, s = 62) => `<image href="../assets/3d/donuts/${n}-sm.webp" x="${x}" y="${y}" width="${s}" height="${s}"/>`;
    const u = 'sf' + (++uid);
    return `<svg viewBox="0 0 800 470" role="img" aria-label="Storefront: brown sign band with the logo, striped orange awning, a window of donuts, a neon donut sign and an A-frame on the pavement">
      <defs><linearGradient id="${u}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe2c7"/><stop offset="1" stop-color="#fff8f1"/></linearGradient>
      <pattern id="${u}b" width="44" height="22" patternUnits="userSpaceOnUse"><rect width="44" height="22" fill="#f6e2cf"/><path d="M0 11h44M22 0v11M0 11v11M44 11v11" stroke="#ead0b6" stroke-width="1.6"/></pattern>
      <pattern id="${u}a" width="68" height="10" patternUnits="userSpaceOnUse"><rect width="34" height="10" fill="#ff6a13"/><rect x="34" width="34" height="10" fill="#fff"/></pattern>
      <filter id="${u}g" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <rect width="800" height="470" fill="url(#${u}s)"/>
      <rect x="60" y="30" width="680" height="380" fill="url(#${u}b)"/>
      <rect x="50" y="30" width="700" height="104" rx="6" fill="#3a1e10"/>
      ${iconAt(214, 38, 88, 'color')}
      <text x="312" y="104" font-family="${FT}" font-weight="800" font-size="58" letter-spacing="-2"><tspan fill="#fff">${esc(a)}</tspan><tspan fill="#ffb27a" dx="3">${esc(b)}</tspan></text>
      ${caveat(704, 64, 24, '#ffd2b0', `est. ${val('est')}`, 'end')}
      <path d="M44 134h712l-16 58H60z" fill="url(#${u}a)"/>${scal}
      <rect x="92" y="222" width="300" height="168" rx="8" fill="#2a1409" stroke="#6e4630" stroke-width="8"/>
      <path d="M100 300h284M100 380h284" stroke="#6e4630" stroke-width="5"/>
      ${caveat(242, 252, 22, '#fff1e4', 'filled fresh at 5 AM')}
      ${dn('midnight-marble', 108, 252, 52)}${dn('mango-graham', 170, 248, 56)}${dn('ube-cheese-cloud', 236, 252, 52)}${dn('strawberry-sprinkle', 300, 250, 56)}
      ${dn('matcha-web', 120, 318)}${dn('caramel-biscuit-crunch', 192, 314)}${dn('choco-crumble-stripe', 262, 318)}${dn('cheese-cloud', 322, 318, 56)}
      <rect x="430" y="214" width="130" height="196" fill="#6e4630"/><rect x="444" y="228" width="102" height="120" rx="4" fill="#2a1409"/>
      <rect x="462" y="246" width="66" height="26" rx="13" fill="#3a1e10" stroke="#ffb27a" stroke-width="2"/><circle cx="474" cy="259" r="4" fill="#3ad07a"/>
      <text x="501" y="264" text-anchor="middle" font-family="${FT}" font-weight="800" font-size="12" letter-spacing="2" fill="#fff">OPEN</text>
      <text x="495" y="296" text-anchor="middle" font-family="Inter, Arial" font-weight="700" font-size="11" fill="#ffd2b0">${esc(val('hoursWk'))}</text>
      <text x="495" y="314" text-anchor="middle" font-family="Inter, Arial" font-weight="700" font-size="11" fill="#ffd2b0">${esc(val('hoursWe'))}</text>
      <circle cx="538" cy="372" r="5" fill="#ffd166"/>
      <rect x="592" y="222" width="116" height="168" rx="8" fill="#2a1409" stroke="#6e4630" stroke-width="8"/>
      <g filter="url(#${u}g)" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M618 300C618 256 682 256 682 300Z" stroke="#ffb27a" stroke-width="4"/>
        <path d="M621 284c4 3 6-2 10 1s3 7 7 7 4-5 8-5 4 7 8 7 4-6 8-6 4 4 9 1" stroke="#ff6a13" stroke-width="3.5"/>
        ${caveat(650, 340, 25, '#ffd2b0', 'fresh at 5 AM')}
      </g>
      <rect y="410" width="800" height="60" fill="#ead3bd"/><path d="M0 410h800" stroke="#d9bb9e" stroke-width="3"/>
      <g transform="translate(704 344)"><path d="M6 66L28 0h44l22 66" fill="#3a1e10"/><rect x="22" y="8" width="56" height="44" rx="3" fill="#241109"/>
        <text x="50" y="27" text-anchor="middle" font-family="${FT}" font-weight="800" font-size="11" fill="#fff">BOX OF 6</text>
        <text x="50" y="43" text-anchor="middle" font-family="${FT}" font-weight="700" font-size="9" fill="#ffd2b0">+ free drink</text></g>
      <g transform="translate(70 360)"><rect x="0" y="22" width="34" height="30" rx="4" fill="#ff6a13"/><circle cx="17" cy="14" r="16" fill="#7fa05a"/><circle cx="8" cy="20" r="10" fill="#8fb562"/></g>
    </svg>`;
  }

  // ---------- packaging: dieline for the box of 6 (300 x 200 x 80 mm), cup wrap, sleeve, decal ----------
  function dieline() {
    const X0 = 50, BX = 130, BX2 = 430, RX = 510, FL = 30, LID = 70, BK = 270, BS = 350, FR = 550, FR1 = 630;
    const u = 'die' + (++uid);
    const cut = `M${BX + 10} ${FL}H${BX2 - 10}L${BX2} ${FL + 10}V${LID + 10}L${BX2 + 30} ${LID + 25}V${BK - 25}L${BX2} ${BK - 10}V${BK}L${BX2 + 25} ${BK + 10}V${BS - 10}L${BX2} ${BS}H${RX}V${FR}H${BX2}L${BX2 + 25} ${FR + 10}V${FR1 - 10}L${BX2} ${FR1}H${BX}L${BX - 25} ${FR1 - 10}V${FR + 10}L${BX} ${FR}H${X0}V${BS}H${BX}L${BX - 25} ${BS - 10}V${BK + 10}L${BX} ${BK}V${BK - 10}L${BX - 30} ${BK - 25}V${LID + 25}L${BX} ${LID + 10}V${FL + 10}Z`;
    const folds = [[BX, LID, BX2, LID], [BX, BK, BX2, BK], [BX, BS, BX2, BS], [BX, FR, BX2, FR], [BX, BS, BX, FR], [BX2, BS, BX2, FR], [BX, LID + 10, BX, BK - 10], [BX2, LID + 10, BX2, BK - 10], [BX, BK, BX, BS], [BX2, BK, BX2, BS], [BX, FR, BX, FR1], [BX2, FR, BX2, FR1]];
    const W = BX2 - BX, cx = (BX + BX2) / 2;
    const [a, b] = words();
    return `<svg viewBox="0 0 600 700" role="img" aria-label="Dieline for the box of 6, 300 by 200 by 80 millimetres, with the artwork on each panel">
      <defs><clipPath id="${u}c"><path d="${cut}"/></clipPath>
      <pattern id="${u}s" width="40" height="40" patternUnits="userSpaceOnUse">${sprinkles(['#fff', '#ffe2c7', '#3a1e10'], 6, 36, 7)}</pattern></defs>
      <g clip-path="url(#${u}c)">
        <rect x="0" y="0" width="600" height="700" fill="#ead6bb"/>
        <rect x="${BX}" y="${FL}" width="${W}" height="${LID - FL}" fill="#e85706"/>
        <text x="${cx}" y="${FL + 25}" text-anchor="middle" font-family="${FT}" font-weight="700" font-size="9" fill="#ffd2b0" letter-spacing="2" transform="rotate(180 ${cx} ${FL + 22})">TUCK IN</text>
        <g transform="rotate(180 ${cx} ${(LID + BK) / 2})">
          <rect x="${BX}" y="${LID}" width="${W}" height="${BK - LID}" fill="#ff6a13"/><rect x="${BX}" y="${LID}" width="${W}" height="${BK - LID}" fill="url(#${u}s)" opacity=".35"/>
          <ellipse cx="${cx}" cy="${LID + 108}" rx="104" ry="82" fill="#ff6a13"/>
          ${iconAt(cx - 34, LID + 46, 68, 'reverse')}
          <text x="${cx}" y="${LID + 140}" text-anchor="middle" font-family="${FT}" font-weight="800" font-size="34" letter-spacing="-1.2" fill="#fff">${esc(a)}${esc(b)}</text>
          ${caveat(cx, LID + 168, 20, '#fff1e4', 'six filled donuts')}
          <circle cx="${BX2 - 34}" cy="${LID + 34}" r="20" fill="#fff"/><text x="${BX2 - 34}" y="${LID + 41}" text-anchor="middle" font-family="${FT}" font-weight="800" font-size="22" fill="#b33c00">6</text><path d="M${BX2 - 40} ${LID + 45}h12" stroke="#b33c00" stroke-width="2.4" stroke-linecap="round"/>
        </g>
        <rect x="${BX}" y="${BK}" width="${W}" height="${BS - BK}" fill="#ff6a13"/>
        <text x="${BX + 16}" y="${BK + 34}" font-family="${FT}" font-weight="700" font-size="12" fill="#fff">${esc(val('web'))}</text>
        <text x="${BX + 16}" y="${BK + 54}" font-family="${FT}" font-weight="700" font-size="12" fill="#fff">${esc(val('ig'))}</text>
        <g transform="translate(${BX2 - 44} ${BK + 22}) scale(1.4)" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round">${ICONS.recyclable}</g>
        <text x="${BX2 - 28}" y="${BK + 70}" text-anchor="middle" font-family="Inter, Arial" font-weight="600" font-size="8" fill="#fff">recycle me</text>
        <rect x="${BX}" y="${BS}" width="${W}" height="${FR - BS}" fill="#fff8f1"/>
        <text x="${cx}" y="${(BS + FR) / 2}" text-anchor="middle" font-family="Inter, Arial" font-weight="600" font-size="11" fill="#b9a594" letter-spacing="2">BASE · INSIDE: FOOD-SAFE WHITE</text>
        <g transform="rotate(180 ${cx} ${(FR + FR1) / 2})">
          <rect x="${BX}" y="${FR}" width="${W}" height="${FR1 - FR}" fill="#ff6a13"/>
          <path d="M${BX} ${FR}H${BX2}V${FR + 8}c-10 0-10 10-20 10s-8-8-18-8-10 16-20 16-10-12-20-12-8 8-18 8-10-14-20-14-10 10-20 10-8-8-18-8-10 14-20 14-10-12-20-12-8 8-18 8-10-10-20-10-10 12-20 12-8-6-18-6-10 8-20 8-10-10-18-10V${FR}Z" fill="#fff8f1"/>
          ${stampSVG(cx, FR + 52, 22, '#fff')}
          <text x="${cx}" y="${FR + 70}" text-anchor="middle" font-family="Inter, Arial" font-weight="600" font-size="10" fill="#fff1e4">${esc(val('tagline'))} · fresh at 5 AM</text>
        </g>
        <g transform="rotate(-90 ${(X0 + BX) / 2} ${(BS + FR) / 2})">
          <rect x="${(X0 + BX) / 2 - 100}" y="${(BS + FR) / 2 - 40}" width="200" height="80" fill="#e85706"/>
          <text x="${(X0 + BX) / 2 - 88}" y="${(BS + FR) / 2 - 18}" font-family="${FT}" font-weight="800" font-size="11" fill="#fff">PACKED FOR YOU</text>
          ${['Premium', 'Classic', 'Assorted'].map((t, i) => `<rect x="${(X0 + BX) / 2 - 88 + i * 64}" y="${(BS + FR) / 2 - 6}" width="10" height="10" rx="2" fill="none" stroke="#fff" stroke-width="1.5"/><text x="${(X0 + BX) / 2 - 74 + i * 64}" y="${(BS + FR) / 2 + 3}" font-family="Inter, Arial" font-weight="600" font-size="9" fill="#fff">${t}</text>`).join('')}
          <text x="${(X0 + BX) / 2 - 88}" y="${(BS + FR) / 2 + 26}" font-family="Inter, Arial" font-weight="600" font-size="9" fill="#fff">packed at ____ : ____   by ________</text>
        </g>
        <g transform="rotate(90 ${(BX2 + RX) / 2} ${(BS + FR) / 2})">
          <rect x="${(BX2 + RX) / 2 - 100}" y="${(BS + FR) / 2 - 40}" width="200" height="80" fill="#e85706"/>
          <text x="${(BX2 + RX) / 2 - 88}" y="${(BS + FR) / 2 - 18}" font-family="${FT}" font-weight="800" font-size="11" fill="#fff">BEST TODAY</text>
          <text x="${(BX2 + RX) / 2 - 88}" y="${(BS + FR) / 2 - 2}" font-family="Inter, Arial" font-weight="600" font-size="8.5" fill="#fff">Contains wheat, milk, egg. May contain</text>
          <text x="${(BX2 + RX) / 2 - 88}" y="${(BS + FR) / 2 + 10}" font-family="Inter, Arial" font-weight="600" font-size="8.5" fill="#fff">tree nuts, coconut, sesame, soy.</text>
          <g fill="#fff">${Array.from({ length: 22 }, (_, i) => `<rect x="${(BX2 + RX) / 2 - 88 + i * 3.6}" y="${(BS + FR) / 2 + 18}" width="${i % 3 ? 1.4 : 2.4}" height="16"/>`).join('')}</g>
        </g>
      </g>
      <path d="${cut}" fill="none" stroke="#3a1e10" stroke-width="2"/>
      <g stroke="#ff6a13" stroke-width="1.6" stroke-dasharray="7 5">${folds.map(([x1, y1, x2, y2]) => `<path d="M${x1} ${y1}L${x2} ${y2}"/>`).join('')}</g>
      <g font-family="Inter, Arial" font-weight="700" font-size="11" fill="#ffd2b0">
        <path d="M${BX} ${FR1 + 26}H${BX2}M${BX} ${FR1 + 20}v12M${BX2} ${FR1 + 20}v12" stroke="#ffd2b0" stroke-width="1.2"/><text x="${cx}" y="${FR1 + 44}" text-anchor="middle">300 mm</text>
        <path d="M${X0 - 22} ${BS}V${FR}M${X0 - 28} ${BS}h12M${X0 - 28} ${FR}h12" stroke="#ffd2b0" stroke-width="1.2"/><text transform="translate(${X0 - 30} ${(BS + FR) / 2}) rotate(-90)" text-anchor="middle">200 mm</text>
        <path d="M${RX + 22} ${FR}V${FR1}M${RX + 16} ${FR}h12M${RX + 16} ${FR1}h12" stroke="#ffd2b0" stroke-width="1.2"/><text transform="translate(${RX + 38} ${(FR + FR1) / 2}) rotate(-90)" text-anchor="middle">80 mm</text>
      </g>
      <g font-family="Inter, Arial" font-weight="600" font-size="11" fill="#fff8f1" transform="translate(470 40)">
        <path d="M0 6h26" stroke="#fff8f1" stroke-width="2"/><text x="34" y="10">cut</text>
        <path d="M0 26h26" stroke="#ff6a13" stroke-width="2" stroke-dasharray="7 5"/><text x="34" y="30">fold</text>
        <text x="0" y="56" font-weight="800">Box of 6</text><text x="0" y="72">300 × 200 × 80 mm</text><text x="0" y="88">artwork bleeds 3 mm</text>
      </g>
      <text x="${cx}" y="${LID - 46}" text-anchor="middle" font-family="Inter, Arial" font-weight="700" font-size="10" fill="#ffd2b0" letter-spacing="1">LID FLAP</text>
      <text x="${(X0 + BX) / 2}" y="${BS - 8}" text-anchor="middle" font-family="Inter, Arial" font-weight="700" font-size="9" fill="#ffd2b0">SIDE</text>
      <text x="${(BX2 + RX) / 2}" y="${BS - 8}" text-anchor="middle" font-family="Inter, Arial" font-weight="700" font-size="9" fill="#ffd2b0">SIDE</text>
    </svg>`;
  }
  // annular-sector die (cup wrap / sleeve): returns [path, midArcPath]
  function arcDie(cx, cy, r1, r2, deg) {
    const p = (r, d) => { const t = (d * Math.PI) / 180; return [(cx + r * Math.sin(t)).toFixed(1), (cy - r * Math.cos(t)).toFixed(1)]; };
    const [a, b, c, d] = [p(r2, -deg), p(r2, deg), p(r1, deg), p(r1, -deg)];
    return `M${a} A${r2} ${r2} 0 0 1 ${b} L${c} A${r1} ${r1} 0 0 0 ${d} Z`;
  }
  const arcPath = (cx, cy, r, deg) => { const t = (deg * Math.PI) / 180; return `M${(cx - r * Math.sin(t)).toFixed(1)} ${(cy - r * Math.cos(t)).toFixed(1)} A${r} ${r} 0 0 1 ${(cx + r * Math.sin(t)).toFixed(1)} ${(cy - r * Math.cos(t)).toFixed(1)}`; };
  function cupWrap() {
    const u = 'cup' + (++uid), cx = 300, cy = 940, r1 = 600, r2 = 770, deg = 19;
    const [a, b] = words();
    let icons = '';
    for (let d = -16; d <= 16.1; d += 4) { const t = (d * Math.PI) / 180, r = 742; icons += `<g transform="translate(${(cx + r * Math.sin(t)).toFixed(1)} ${(cy - r * Math.cos(t)).toFixed(1)}) rotate(${d})">${iconAt(-13, -13, 26, 'reverse')}</g>`; }
    return `<svg viewBox="40 150 520 225" role="img" aria-label="Flat artwork for the hot cup wrap: an arc-shaped die in orange with the logo and a row of donut icons">
      <defs><path id="${u}m" d="${arcPath(cx, cy, 672, 24)}"/><path id="${u}l" d="${arcPath(cx, cy, 622, 24)}"/><clipPath id="${u}c"><path d="${arcDie(cx, cy, r1, r2, deg)}"/></clipPath></defs>
      <path d="${arcDie(cx, cy, r1 - 6, r2 + 6, deg + 0.5)}" fill="none" stroke="#ffb27a" stroke-width="1" stroke-dasharray="4 4"/>
      <g clip-path="url(#${u}c)"><rect x="0" y="0" width="600" height="400" fill="#ff6a13"/>${icons}
        <text font-family="${FT}" font-weight="800" font-size="38" letter-spacing="-1"><textPath href="#${u}m" startOffset="50%" text-anchor="middle"><tspan fill="#fff">${esc(a)}</tspan><tspan fill="#fff">${esc(b)}</tspan></textPath></text>
        <text font-family="Caveat, cursive" font-weight="700" font-size="21" fill="#fff1e4"><textPath href="#${u}l" startOffset="50%" text-anchor="middle">Glazed. Filled. Loved. · careful, it's hot</textPath></text></g>
      <path d="${arcDie(cx, cy, r1, r2, deg)}" fill="none" stroke="#3a1e10" stroke-width="2"/>
    </svg>`;
  }
  function sleeveArc() {
    const u = 'slv' + (++uid), cx = 300, cy = 820, r1 = 640, r2 = 700, deg = 21;
    const [a, b] = words();
    return `<svg viewBox="60 110 480 105" role="img" aria-label="Cup sleeve die: a brown arc band with the wordmark">
      <defs><path id="${u}m" d="${arcPath(cx, cy, 662, 26)}"/></defs>
      <path d="${arcDie(cx, cy, r1, r2, deg)}" fill="#3a1e10" stroke="#241109" stroke-width="2"/>
      <text font-family="${FT}" font-weight="800" font-size="30" letter-spacing="-1"><textPath href="#${u}m" startOffset="50%" text-anchor="middle"><tspan fill="#fff">${esc(a)}</tspan><tspan fill="#ffb27a">${esc(b)}</tspan><tspan fill="#ffd2b0" font-family="Caveat, cursive" font-weight="700" font-size="24" dx="14">careful, it's hot</tspan></textPath></text>
    </svg>`;
  }
  function decalRing() {
    const id = 'dc' + (++uid);
    const t = `FRESH AT 5 AM · FOLLOW ${val('ig').toUpperCase()} · `;
    return `<svg viewBox="0 0 200 200" role="img" aria-label="Round window decal: the donut mark with the words fresh at 5 AM and the Instagram handle around it">
      <defs><path id="${id}" d="M100 100m-77 0a77 77 0 1 1 154 0a77 77 0 1 1-154 0"/></defs>
      <circle cx="100" cy="100" r="98" fill="#ff6a13"/><circle cx="100" cy="100" r="62" fill="#fff8f1"/>
      <text font-family="${FT}" font-weight="800" font-size="15" letter-spacing="1.5" fill="#fff"><textPath href="#${id}" textLength="470" lengthAdjust="spacing">${esc(t)}</textPath></text>
      ${iconAt(56, 52, 88, 'color')}</svg>`;
  }

  // ---------- merch ----------
  const MERCH = {
    apron: () => `<svg viewBox="0 0 200 220" role="img" aria-label="Brown staff apron with the stacked logo"><path d="M78 10c0 20 44 20 44 0" fill="none" stroke="#6e4630" stroke-width="5"/><path d="M70 12h60v34l34 22v140H36V68l34-22z" fill="#3a1e10"/><path d="M36 92h-26M164 92h26" stroke="#6e4630" stroke-width="5" stroke-linecap="round"/><rect x="66" y="150" width="68" height="40" rx="6" fill="none" stroke="#6e4630" stroke-width="3" stroke-dasharray="5 4"/>${iconAt(78, 54, 44, 'color')}${wordSVG(100, 122, 19, '#fff', '#ffb27a', 'middle')}</svg>`,
    cap: () => `<svg viewBox="0 0 200 160" role="img" aria-label="Orange baseball cap with the donut mark on the front panel"><ellipse cx="104" cy="122" rx="78" ry="9" fill="#3a1e10" opacity=".12"/><path d="M34 106C34 56 66 32 104 32c40 0 64 28 64 74z" fill="#ff6a13"/><path d="M104 32c-6 20-8 48-6 74M104 32c18 16 30 44 32 74" fill="none" stroke="#e85706" stroke-width="2"/><circle cx="104" cy="33" r="5" fill="#e85706"/><path d="M34 104h134" stroke="#d64f00" stroke-width="6" stroke-linecap="round"/><path d="M150 100c20-2 38 4 44 12-14 7-40 7-60 2z" fill="#d64f00"/>${iconAt(110, 54, 40, 'reverse')}</svg>`,
    tee: () => `<svg viewBox="0 0 200 200" role="img" aria-label="Cream T-shirt with the stacked logo on the chest"><path d="M62 24l24-8c6 10 22 10 28 0l24 8 36 30-20 24-14-10v112H60V68L46 78 26 54z" fill="#fff8f1" stroke="#e7d2c0" stroke-width="2"/><path d="M86 16c6 12 22 12 28 0" fill="none" stroke="#e7d2c0" stroke-width="3"/>${iconAt(72, 54, 56, 'color')}${wordSVG(100, 128, 19, '#3a1e10', '#ff6a13', 'middle')}</svg>`,
    tote: () => `<svg viewBox="0 0 200 210" role="img" aria-label="Natural canvas tote with a one-colour brown logo"><path d="M70 70c0-50 60-50 60 0" fill="none" stroke="#d9bb9e" stroke-width="7"/><rect x="40" y="66" width="120" height="136" rx="4" fill="#f1e3d0"/>${iconAt(70, 84, 60, 'brown')}${wordSVG(100, 164, 20, '#3a1e10', '#3a1e10', 'middle')}${caveat(100, 186, 17, '#3a1e10', 'carry the good stuff')}</svg>`,
    mug: () => `<svg viewBox="0 0 200 200" role="img" aria-label="Orange mug with the reversed logo"><path d="M150 82c26 0 26 52 0 52" fill="none" stroke="#ff6a13" stroke-width="12"/><rect x="46" y="56" width="108" height="118" rx="12" fill="#ff6a13"/><ellipse cx="100" cy="58" rx="54" ry="8" fill="#e85706"/><ellipse cx="100" cy="58" rx="46" ry="5" fill="#3a1e10"/>${iconAt(70, 80, 60, 'reverse')}${wordSVG(100, 158, 17, '#fff', '#fff', 'middle')}</svg>`,
    pin: () => `<svg viewBox="0 0 200 200" role="img" aria-label="Enamel pin: brown disc with a gold edge, the donut mark and the wordmark"><circle cx="100" cy="100" r="78" fill="#ffd166"/><circle cx="100" cy="100" r="70" fill="#3a1e10"/>${iconAt(58, 44, 84, 'color')}${wordSVG(100, 148, 17, '#fff', '#ffb27a', 'middle')}</svg>`,
    gift: () => `<svg viewBox="0 0 200 180" role="img" aria-label="Gift box tied with a brown satin ribbon and a bow"><ellipse cx="100" cy="160" rx="74" ry="8" fill="#3a1e10" opacity=".14"/><path d="M30 70l70-26 70 26-70 26z" fill="#ff8a45"/><path d="M30 70v70l70 26V96z" fill="#ff6a13"/><path d="M170 70v70l-70 26V96z" fill="#e85706"/><path d="M65 57l70 26v70" fill="none" stroke="#3a1e10" stroke-width="9"/><path d="M135 57L65 83v70" fill="none" stroke="#6e4630" stroke-width="9"/><path d="M100 70c-22-24-40-16-34-4s34 4 34 4zM100 70c22-24 40-16 34-4s-34 4-34 4z" fill="#3a1e10"/><circle cx="100" cy="70" r="7" fill="#6e4630"/>${wordSVG(64, 128, 11, '#fff', '#fff', 'middle').replace('<text ', '<text transform="rotate(20 64 128)" ')}</svg>`,
  };
  const renderMerch = () => $$('[data-merch]').forEach((el) => { el.innerHTML = MERCH[el.dataset.merch](); });

  // ---------- materials checklist (status follows the details panel) ----------
  // [group, item, section id, keys used, special status]
  const CHECK = [
    ['Identity', 'Primary logo (horizontal)', 'logo'], ['Identity', 'Stacked logo', 'logo'], ['Identity', 'Icon mark (filled donut)', 'logo'], ['Identity', 'Wordmark + stamp + naming rules', 'logo'],
    ['Identity', 'Roundel badge', 'logo', ['est']], ['Identity', 'Bomb mark', 'logo'], ['Identity', 'Logo colour versions', 'logo'], ['Identity', 'Clear space, minimum size, misuse', 'logo'],
    ['Identity', 'Colour palette with print builds', 'color'], ['Identity', 'Typography + type scale', 'type'], ['Identity', 'Icon set (36 line icons)', 'icons-ch'], ['Identity', 'Graphic elements: the cut, neon, fuse', 'elements'],
    ['Identity', `3D render library (${RENDER_TOTAL} renders)`, 'imagery'], ['Identity', 'Real shop + food photos', 'imagery', [], 'shoot'],
    ['Voice', 'Promise, story, personality', 'essence'], ['Voice', 'Taglines, CTAs, hashtags', 'voice'], ['Voice', 'Offer rules (one offer, one loyalty card)', 'voice'], ['Voice', 'Boilerplate + social bios', 'voice', ['ig', 'web']], ['Voice', 'Words we use / avoid', 'voice'],
    ['Packaging', 'Box of 6 dieline (300 × 200 × 80 mm)', 'packaging', ['web', 'ig']], ['Packaging', 'Box family 6 / 12 / 24', 'packaging'], ['Packaging', 'Inner lid', 'packaging', ['ig']], ['Packaging', 'Offer seal sticker', 'packaging'],
    ['Packaging', 'Hot cup wrap (arc die)', 'packaging'], ['Packaging', 'Cup sleeve (arc die)', 'packaging'], ['Packaging', 'Paper bag + seal', 'packaging'], ['Packaging', 'Wax paper', 'packaging'], ['Packaging', 'Box tape', 'packaging'],
    ['Packaging', 'Napkin', 'packaging'], ['Packaging', 'Gift tag', 'packaging'], ['Packaging', 'Delivery seal sticker', 'packaging', ['phone']],
    ['Store', '3D location: mall kiosk', 'store'], ['Store', '3D location: pop-up stall with seating', 'store'], ['Store', '3D location: flagship store', 'store'],
    ['Store', 'Storefront sign + awning', 'store', ['est']], ['Store', 'Menu boards (3 panels)', 'store'], ['Store', 'A-frame sidewalk sign', 'store'], ['Store', 'Door hours sign', 'store', ['phone']],
    ['Store', 'Shelf price tag', 'store'], ['Store', 'Order number tent', 'store'], ['Store', 'Guest Wi-Fi card', 'store', ['wifi']], ['Store', 'Window decal', 'store', ['ig']],
    ['Print', 'Business card (85 × 55 mm)', 'print', ['owner', 'role', 'phone', 'email', 'web']], ['Print', 'Loyalty card', 'print'], ['Print', 'A5 flyer', 'print', ['ig']], ['Print', 'A3 poster', 'print', ['web']],
    ['Print', 'Gift card', 'print'], ['Print', 'Offer coupon', 'print'], ['Print', 'Thank-you card', 'print', ['ig']], ['Print', 'Receipt', 'print', ['phone', 'reg']],
    ['Print', 'Letterhead (A4)', 'print', ['phone', 'email', 'web', 'reg']], ['Print', 'DL envelope', 'print', ['city']], ['Print', 'Allergen card', 'print', [], 'review'], ['Print', 'Review card', 'print', ['web']],
    ['Digital', 'Instagram grid + 4 post templates', 'digital', ['ig']], ['Digital', 'Stories (9:16) with safe zones', 'digital'], ['Digital', 'Facebook cover', 'digital'], ['Digital', 'YouTube thumbnail', 'digital'],
    ['Digital', 'Email newsletter', 'digital', ['web']], ['Digital', 'Email signature', 'digital', ['owner', 'role', 'phone', 'email', 'web']], ['Digital', 'Web ad banners', 'digital'],
    ['Digital', 'Profile pictures + app icon', 'digital'], ['Digital', 'Favicon', 'digital'], ['Digital', 'Link share image (OG)', 'digital', ['web']], ['Digital', 'Maps listing', 'digital', ['phone', 'city']], ['Digital', 'Delivery app banner', 'digital'],
    ['Website', 'UI kit (buttons, chips, cards)', 'ui'],
    ['Merch', 'Apron', 'merch'], ['Merch', 'Cap', 'merch'], ['Merch', 'T-shirt', 'merch'], ['Merch', 'Tote bag', 'merch'], ['Merch', 'Mug', 'merch'], ['Merch', 'Enamel pin', 'merch'], ['Merch', 'Staff name badge', 'merch', ['owner']], ['Merch', 'Gift wrap + ribbon', 'merch'],
    ['Motion', 'Falling donut, sprinkle burst, button pop', 'motion'], ['Motion', 'Timing tokens', 'motion'],
    ['Toolkit', 'CSS + JSON design tokens', 'toolkit'], ['Toolkit', 'SVG logo files', 'toolkit'],
  ];
  function renderCheck() {
    const t = $('#checkBody'); if (!t) return;
    let ready = 0, need = 0, other = 0;
    t.innerHTML = CHECK.map(([grp, item, sec, keys = [], kind]) => {
      const miss = keys.filter(isPH);
      let st;
      if (kind === 'shoot') { other++; st = '<span class="tag tag--todo">Shoot photos</span>'; }
      else if (kind === 'review') { other++; st = '<span class="tag tag--todo">Needs review: confirm recipes</span>'; }
      else if (miss.length) { need++; st = `<span class="tag tag--todo">Needs: ${miss.map((k) => LABEL[k].toLowerCase()).join(', ')}</span>`; }
      else { ready++; st = '<span class="tag tag--ok">Design ready</span>'; }
      return `<tr><td>${item}</td><td>${grp}</td><td><a href="#${sec}" aria-label="View ${esc(item)}">View</a></td><td>${st}</td></tr>`;
    }).join('');
    const mc = $('#matCount'); if (mc) mc.textContent = CHECK.length;
    const s = $('#checkSum');
    if (s) s.innerHTML = `<div><b>${CHECK.length}</b>materials</div><div><b>${ready}</b>design ready</div><div><b>${need}</b>waiting on details</div><div><b>${other}</b>need photos or review</div>`;
  }

  // ---------- render: each part redraws only when a detail it uses changes ----------
  const PARTS = [
    [['name'], () => $$('[data-lockup]').forEach((el) => { el.innerHTML = lockup(el.dataset.lockup, el.dataset.v); })],
    [['name', 'tagline', 'est'], () => $$('[data-roundel]').forEach((el) => { const [bg, ring, ink] = (el.dataset.roundel || '').split(',').filter(Boolean); el.innerHTML = roundel(bg, ring, ink); })],
    [['name', 'est', 'hoursWk', 'hoursWe'], () => { const sf = $('#storefront'); if (sf) sf.innerHTML = storefront(); }],
    [['name', 'cur', 'promo'], renderBoards],
    [['name', 'tagline'], renderMerch],
    [['name', 'web', 'ig', 'tagline'], () => { const d = $('#dieline'); if (d) d.innerHTML = dieline(); }],
    [['name'], () => { const c = $('#cupWrap'); if (c) c.innerHTML = cupWrap(); const s = $('#sleeveArc'); if (s) s.innerHTML = sleeveArc(); }],
    [['ig'], () => $$('[data-decal]').forEach((el) => { el.innerHTML = decalRing(); })],
    [[...PH], renderCheck],
  ];
  const listeners = [];
  function render(changed) {
    const keys = changed ? (changed === 'name' ? ['name', 'w1', 'w2', 'nameUp'] : [changed]) : null;
    const sel = keys ? keys.map((k) => `[data-b="${k}"]`).join(',') : '[data-b]';
    $$(sel).forEach((el) => { const k = el.dataset.b; el.textContent = val(k); el.classList.toggle('is-ph', isPH(k)); });
    PARTS.forEach(([deps, fn]) => { if (!changed || deps.includes(changed)) fn(); });
    if (!changed || PH.has(changed)) {
      const n = [...PH].filter(isPH).length;
      const c = $('#phCount'); if (c) c.textContent = n ? `${n} details are still placeholders. Replace them when you have them; every mockup updates.` : 'All details filled in. Every mockup uses your real details.';
      $$('.field').forEach((f) => { const tag = $('.tag', f); if (tag) tag.hidden = !isPH(f.dataset.k); });
    }
    if (!changed || changed === 'name') document.title = `${val('name')} Brand Kit`;
    listeners.forEach((f) => f(changed));
  }
  // static art that never depends on the details
  function renderStatic() {
    $$('[data-icon]').forEach((el) => { el.innerHTML = iconSVG(el.dataset.icon || 'color'); });
    $$('[data-bomb]').forEach((el) => { el.innerHTML = bomb(); });
    $$('[data-cut]').forEach((el) => { el.innerHTML = cutDonut(); });
    $$('[data-neon]').forEach((el) => { el.innerHTML = neonDome(el.dataset.neon === 'text'); });
    $$('[data-fuse]').forEach((el) => { el.innerHTML = fuse(); });
    $$('[data-line-icon]').forEach((el) => { el.innerHTML = lineIcon(el.dataset.lineIcon); });
    renderAllergens();
  }

  // details form
  const form = $('#detailsForm');
  if (form) {
    form.innerHTML = FIELDS.map(([k, label, def, ph, type]) => `<label class="field" data-k="${k}"><span>${label}${ph ? ' <i class="tag tag--todo">placeholder</i>' : ''}</span><input name="${k}" type="${type || 'text'}" value="${esc(D[k] ?? def)}" placeholder="${esc(def)}" autocomplete="off" spellcheck="false"${type === 'tel' ? ' inputmode="tel"' : ''}></label>`).join('');
    const timers = {};
    form.addEventListener('input', (e) => { const k = e.target.name; if (!k) return; D[k] = e.target.value; save(); clearTimeout(timers[k]); timers[k] = setTimeout(() => render(k), 140); });
    form.addEventListener('submit', (e) => e.preventDefault());
  }
  $('#resetDetails')?.addEventListener('click', () => { Object.assign(D, DEF); save(); $$('input', form).forEach((i) => { i.value = DEF[i.name]; }); render(); toast('Details reset to the defaults'); });
  $('#showPh')?.addEventListener('click', (e) => { const on = document.body.classList.toggle('show-ph'); e.currentTarget.setAttribute('aria-pressed', on); });

  // ---------- downloads (SVG logos, tokens) ----------
  function download(name, text, type = 'image/svg+xml') {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 400);
    toast(`Saved ${name}`);
  }
  const svgDoc = (w, h, body) => `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${body}</svg>\n`;
  const asDoc = (svg, w, h) => svg.replace('<svg ', `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" `);
  const slugName = () => raw('name').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const LOGO_FILES = {
    'logo-horizontal': () => { const w = Math.round(92 + raw('name').length * 27); return svgDoc(w, 80, iconAt(4, 6, 68, 'color') + wordSVG(84, 56, 46, '#3a1e10', '#ff6a13')); },
    'logo-horizontal-white': () => { const w = Math.round(92 + raw('name').length * 27); return svgDoc(w, 80, iconAt(4, 6, 68, 'color') + wordSVG(84, 56, 46, '#ffffff', '#ffb27a')); },
    'logo-stacked': () => svgDoc(320, 220, iconAt(110, 4, 100, 'color') + wordSVG(160, 190, 46, '#3a1e10', '#ff6a13', 'middle')),
    'icon-color': () => svgDoc(64, 64, iconInner('color')),
    'icon-on-orange': () => svgDoc(64, 64, `<rect width="64" height="64" rx="16" fill="#ff6a13"/><g transform="translate(6 4) scale(.82)">${iconInner('reverse')}</g>`),
    'icon-white': () => svgDoc(64, 64, iconInner('white')),
    'icon-brown': () => svgDoc(64, 64, iconInner('brown')),
    roundel: () => asDoc(roundel(), 400, 400),
    'bomb-mark': () => asDoc(bomb(), 400, 400),
    'the-cut': () => asDoc(cutDonut(), 960, 728),
    'box-of-6-dieline': () => asDoc(dieline(), 1200, 1400),
    'cup-wrap': () => asDoc(cupWrap(), 1560, 675),
  };
  const TOKENS = {
    color: { orange: '#ff6a13', 'orange-d': '#e85706', 'orange-hi': '#d64f00', 'orange-ink': '#b33c00', 'orange-l': '#ffb27a', apricot: '#ffd2b0', brown: '#3a1e10', 'brown-2': '#6e4630', 'brown-3': '#241109', muted: '#745443', cream: '#fff8f1', peach: '#ffe6d2', 'peach-2': '#fff0e3', dough: '#cf914c', fry: '#f7e2bd', white: '#ffffff', 'on-orange': '#ffffff' },
    font: { title: "'Plus Jakarta Sans', sans-serif", body: "'Inter', sans-serif", hand: "'Caveat', cursive" },
    radius: { chip: '999px', sm: '14px', md: '22px', lg: '28px', xl: '36px' },
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
    const lb = e.target.closest('#libTabs .chip');
    if (lb) renderLib(lb.dataset.lib);
    const pl = e.target.closest('[data-play]');
    if (pl) play($(pl.dataset.play));
    const z = e.target.closest('.zoom-btn');
    if (z) openZoom(z.closest('figure'));
  });

  // ---------- toast (the live region stays in the accessibility tree; only its text changes) ----------
  let tt;
  function toast(msg) {
    const t = $('#toast'); if (!t) return;
    t.textContent = ''; t.classList.add('on');
    requestAnimationFrame(() => { t.textContent = msg; });
    clearTimeout(tt); tt = setTimeout(() => { t.classList.remove('on'); }, 2400);
  }

  // ---------- motion: demos, a page-wide pause, nothing loops offscreen ----------
  function play(el) { if (!el) return; el.classList.remove('play'); void el.offsetWidth; el.classList.add('play'); }
  const burst = $('#burst');
  if (burst) {
    const cols = ['#ff6a13', '#ffb9cc', '#c6e1b0', '#d6bdf0', '#ffd166', '#3a1e10'];
    burst.insertAdjacentHTML('beforeend', Array.from({ length: 28 }, (_, i) => `<i style="background:${cols[i % cols.length]};--r:${Math.round(i * (360 / 28) + rnd() * 10)}deg;--d:${Math.round(60 + rnd() * 50)}px"></i>`).join(''));
  }
  const motionBtn = $('#motionToggle');
  function setStill(on) {
    document.body.classList.toggle('is-still', on);
    if (motionBtn) motionBtn.setAttribute('aria-pressed', on);
    document.dispatchEvent(new CustomEvent('gb:still', { detail: on }));
    try { localStorage.setItem('gb-brand-still', on ? '1' : '0'); } catch (e) { /* ignore */ }
  }
  motionBtn?.addEventListener('click', () => setStill(!document.body.classList.contains('is-still')));
  try { if (localStorage.getItem('gb-brand-still') === '1') setStill(true); } catch (e) { /* ignore */ }
  const offIO = new IntersectionObserver((es) => es.forEach((en) => en.target.classList.toggle('is-off', !en.isIntersecting)), { rootMargin: '200px 0px' });
  $$('.chap, .cover').forEach((s) => offIO.observe(s));

  // ---------- enlarge a mockup ----------
  const zoomDlg = $('#zoom');
  function openZoom(fig) {
    if (!zoomDlg || !fig) return;
    const stage = $('.stage', fig), cap = $('figcaption', fig);
    const body = $('.zoom__body', zoomDlg);
    body.innerHTML = '';
    const clone = stage.cloneNode(true);
    $$('.zoom-btn', clone).forEach((b) => b.remove());
    $$('[id]', clone).forEach((n) => n.removeAttribute('id'));
    // keep the mockup's proportions and fill the dialog
    const r = stage.offsetWidth / Math.max(1, stage.offsetHeight);
    const fit = Math.min(innerWidth * 0.9, 1200, innerHeight * 0.74 * r);
    const w = Math.max(fit, Math.min(stage.offsetWidth * 1.8, 1400));
    zoomDlg.setAttribute('aria-label', `Enlarged: ${$('figcaption b', fig)?.textContent || 'mockup'}`);
    Object.assign(clone.style, { width: `${w}px`, height: `${w / r}px`, aspectRatio: 'auto' });
    body.appendChild(clone);
    $('.zoom__cap', zoomDlg).innerHTML = cap ? cap.innerHTML : '';
    zoomDlg.showModal();
  }
  zoomDlg?.addEventListener('click', (e) => { if (e.target === zoomDlg || e.target.closest('.zoom__x')) zoomDlg.close(); });
  $$('.stage:not(.stage--3d)').forEach((st) => {
    const fig = st.closest('figure'); if (!fig) return;
    const title = $('figcaption b', fig)?.textContent || 'mockup';
    st.insertAdjacentHTML('beforeend', `<button type="button" class="zoom-btn" aria-label="Enlarge ${esc(title)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button>`);
  });

  // ---------- static lists ----------
  const icons = $('#icons');
  if (icons) icons.innerHTML = Object.keys(ICONS).map((k, i) => `<div class="ico">${lineIcon(k)}<span>${k}</span></div>`).join('');
  const FLAV = [['Original glaze', '#fbe7c4'], ['Strawberry', '#ff8fb4'], ['Matcha', '#a8d48f'], ['Ube', '#a46be0'], ['Caramel', '#d9a066'], ['Coffee', '#c8955f'], ['Hazelnut', '#6b3f26'], ['Dark choco', '#2e1810']];
  const fl = $('#flavors');
  if (fl) fl.innerHTML = FLAV.map(([n, h]) => `<button type="button" class="flavor" data-copy="${h}" title="Copy ${h}"><i style="--c:${h}"></i>${n}<code>${h}</code></button>`).join('');
  const rc = $('#renderCount'); if (rc) rc.textContent = RENDER_TOTAL;
  renderColors();
  renderLib('donuts');

  // ---------- contents: highlight the chapter on screen + reading progress ----------
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
  const bar = $('.progress i');
  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking || !bar) return; ticking = true;
    requestAnimationFrame(() => { const h = document.documentElement.scrollHeight - innerHeight; bar.style.transform = `scaleX(${h > 0 ? Math.min(1, scrollY / h) : 0})`; ticking = false; });
  }, { passive: true });

  // keep the sticky chapter strip and anchor offsets under the top bar, whatever its height
  const topBar = $('.top');
  if (topBar) new ResizeObserver(() => root.style.setProperty('--top-h', `${topBar.offsetHeight}px`)).observe(topBar);

  // shared with the 3D location scenes (locations.js)
  window.gbBrand = { val, words, MENU, money, toast, onChange: (fn) => listeners.push(fn) };

  renderStatic();
  render();
})();
