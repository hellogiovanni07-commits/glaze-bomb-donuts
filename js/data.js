// Glaze Bomb - product data (no side effects; shared by the pages, the chat and the 3D render tool)
// the six signature flavors (3D donut on the home page)
export const FLAVORS = [
  { name: 'Caramel Biscuit Crunch', taste: { sweet: 80, rich: 60, crunch: 70 }, pair: 'Iced latte', desc: 'White chocolate glaze with caramel biscuit stripes, buttery crumbs and a whole spiced biscuit on top.', fill: 'Vanilla custard', glazeName: 'White chocolate', price: 3.8, bg: '#fbecdc', glaze: '#fbf4ea', pattern: 'plain', dough: 'classic', toppings: ['biscuit', 'cookie'], drizzle: '#9c6a3c', cover: 1.12 },
  { name: 'Cookies & Cream Latte', taste: { sweet: 65, rich: 60, crunch: 75 }, pair: 'Hot americano', desc: 'Smooth cafe latte glaze buried under crunchy dark chocolate cookie crumbs.', fill: 'Vanilla cream', glazeName: 'Cafe latte', price: 3.5, bg: '#f5e8d8', glaze: '#d6ac76', pattern: 'plain', dough: 'classic', toppings: ['crumbs'], drizzle: null, cover: 1.15 },
  { name: 'Midnight Marble', taste: { sweet: 55, rich: 90, crunch: 15 }, pair: 'Cold brew', desc: 'Glossy dark chocolate with a hand-swirled white chocolate pattern. Rich, not too sweet.', fill: 'Chocolate ganache', glazeName: 'Dark chocolate', price: 3.6, bg: '#efe2d8', glaze: '#2e1810', pattern: 'marble', patternColor: '#f3ede6', dough: 'classic', toppings: [], drizzle: null, cover: 1.18 },
  { name: 'Choco Crumble Stripe', taste: { sweet: 70, rich: 85, crunch: 80 }, pair: 'A glass of cold milk', desc: 'A cocoa donut fully coated in chocolate cookie crumbs, finished with white chocolate stripes.', fill: 'Chocolate cream', glazeName: 'Cookie crumb coat', price: 3.7, bg: '#ece3dc', glaze: '#2b1a14', pattern: 'crumbcoat', crumbColors: ['#1d1210', '#3a2419', '#4a3024'], dough: 'cocoa', toppings: ['crumbs'], drizzle: '#ffffff', cover: 1.38 },
  { name: 'Mango Graham', taste: { sweet: 75, rich: 45, crunch: 60 }, pair: 'Iced green tea', desc: 'Toasted graham crumb coat with a spoon of glossy mango jam on top. Our summer favorite.', fill: 'Mango cream', glazeName: 'Graham crumb coat', price: 3.9, bg: '#ffe9cc', glaze: '#d9a066', pattern: 'crumbcoat', crumbColors: ['#b06d30', '#8f5524', '#d08f4f', '#e3b27a'], dough: 'classic', toppings: ['graham', 'jam'], drizzle: null, cover: 1.32 },
  { name: 'Milk Tea Sesame', taste: { sweet: 50, rich: 55, crunch: 35 }, pair: 'Hot jasmine tea', desc: 'Silky milk tea glaze dusted with toasted black sesame. Nutty, creamy and light.', fill: 'Brown sugar custard', glazeName: 'Milk tea', price: 3.4, bg: '#f6ecdc', glaze: '#e8cfa6', pattern: 'dust', patternColor: '#151515', dough: 'classic', toppings: ['sesame'], drizzle: null, cover: 1.1 },
];
const F = (name) => FLAVORS.find((f) => f.name === name);
const d = (name, price, glaze, extra = {}) => ({ name, price, glaze, pattern: 'plain', dough: 'classic', toppings: [], drizzle: null, ...extra });

// full menu (menu page): premium + classic, all filled, no hole
export const PREMIUM = [
  d('Almond Snowcap', 3.6, '#fbf4ea', { toppings: ['almonds'], fill: 'Vanilla custard', tag: 'Staff pick' }),
  d('Wafer Crunch Bar', 3.7, '#5a321c', { toppings: ['wafer'], drizzle: '#fbf4ea', drizzleStyle: 'cross', fill: 'Chocolate cream' }),
  d('Hazelnut Velvet', 3.6, '#6b3f26', { toppings: ['nuts'], drizzle: '#2a140a', drizzleStyle: 'spiral', fill: 'Hazelnut cream' }),
  { ...F('Caramel Biscuit Crunch'), tag: 'Signature' },
  d("S'mores Campfire", 3.7, '#3a2016', { toppings: ['mallows', 'crumbs'], fill: 'Toasted marshmallow' }),
  d('Bavarian Cream Dream', 3.6, '#2e1810', { fill: 'Bavarian cream' }),
  { ...F('Midnight Marble'), tag: 'Signature' },
  d('Snow Web', 3.6, '#fbf4ea', { pattern: 'marble', patternColor: '#3a1d10', fill: 'White chocolate cream' }),
  d('Cheese Cloud', 3.5, '#fff3d6', { toppings: ['cheese'], fill: 'Cream cheese', tag: 'New' }),
  d('Tiramisu Dust', 3.7, '#f3e3c8', { pattern: 'dust', patternColor: '#5a3420', fill: 'Mascarpone cream' }),
  d('Coffee Crumble', 3.6, '#c8955f', { toppings: ['coffeecrumb'], fill: 'Coffee custard' }),
  { ...F('Cookies & Cream Latte'), tag: 'Signature' },
  d('Ube Cheese Cloud', 3.7, '#a46be0', { toppings: ['cheese'], fill: 'Ube halaya' }),
  { ...F('Mango Graham'), tag: 'Signature' },
  d('Matcha Almond', 3.7, '#a8d48f', { toppings: ['almonds'], fill: 'Matcha cream' }),
  d('Matcha Web', 3.7, '#a8d48f', { pattern: 'marble', patternColor: '#fbf4ea', fill: 'White chocolate cream' }),
  d('Berry Coconut Snow', 3.6, '#ff8fb4', { toppings: ['coconut'], fill: 'Strawberry jam' }),
  d('Cappuccino Swirl', 3.6, '#c8955f', { pattern: 'marble', patternColor: '#3a1d10', fill: 'Coffee cream' }),
  { ...F('Milk Tea Sesame'), tag: 'Signature' },
  { ...F('Choco Crumble Stripe'), tag: 'Signature' },
];
export const CLASSIC = [
  d('Original Glaze', 2.5, '#fbe7c4', { fill: 'Vanilla custard' }),
  d('Choco Glaze', 2.6, '#4a2a1a', { fill: 'Chocolate cream' }),
  d('Strawberry Glaze', 2.6, '#ff8fb4', { fill: 'Strawberry jam' }),
  d('Choco Sprinkle', 2.8, '#4a2a1a', { toppings: ['sprinkles'], fill: 'Chocolate cream' }),
  d('Strawberry Sprinkle', 2.8, '#ff8fb4', { toppings: ['sprinkles'], fill: 'Strawberry jam' }),
  d('Hazelnut Crunch', 2.9, '#6b3f26', { toppings: ['nuts'], fill: 'Hazelnut cream' }),
  d('Choco Almond', 2.9, '#4a2a1a', { toppings: ['almonds'], fill: 'Vanilla custard' }),
  d('Cookie Speckle', 2.8, '#fbf4ea', { toppings: ['crumbs'], fill: 'Vanilla cream' }),
  d('Mocha Glaze', 2.6, '#a9764a', { fill: 'Coffee custard' }),
  d('Matcha Drizzle', 2.8, '#a8d48f', { drizzle: '#ffffff', fill: 'Matcha cream' }),
  d('Mallow Party', 2.9, '#4a2a1a', { toppings: ['mallows', 'sprinkles'], fill: 'Marshmallow cream' }),
  d('Caramel Drizzle', 2.7, '#d9a066', { drizzle: '#6e3f1f', drizzleStyle: 'spiral', fill: 'Salted caramel' }),
];

// drinks: cup / lid / motif colours drive both the 3D cups and the 2D icons
export const DRINKS = {
  hot: [
    { name: 'Classic Americano', price: 2.8, temp: 'hot', cup: '#5a3424', lid: '#1d1612', motif: '#c58a5c', desc: 'Double shot, hot water, nothing to hide.' },
    { name: 'Cafe Latte', price: 3.4, temp: 'hot', cup: '#c9955e', lid: '#fbf7f1', motif: '#7a4a26', desc: 'Espresso and steamed milk, silky and mild.' },
    { name: 'Caramel Macchiato', price: 3.8, temp: 'hot', cup: '#f4efe8', lid: '#f4efe8', motif: '#c58a5c', desc: 'Vanilla milk, espresso and a caramel crosshatch.' },
    { name: 'Spanish Latte', price: 3.8, temp: 'hot', cup: '#2a211d', lid: '#1d1612', motif: '#c58a5c', desc: 'Sweet condensed milk meets bold espresso.' },
    { name: 'Hot Chocolate', price: 3.2, temp: 'hot', cup: '#ff6a13', lid: '#fbf7f1', motif: '#ffd2b0', desc: 'Thick dark chocolate, topped with foam.' },
    { name: 'Hot Matcha Latte', price: 3.9, temp: 'hot', cup: '#f4efe8', lid: '#1d1612', motif: '#7fa05a', desc: 'Stone-ground matcha whisked with warm milk.' },
  ],
  cold: [
    { name: 'Iced Americano', price: 3.0, temp: 'cold', liquid: [['#24130a', 1]], ice: true, straw: '#3a1e10', desc: 'Espresso over ice. Clean and crisp.' },
    { name: 'Iced Spanish Latte', price: 3.9, temp: 'cold', liquid: [['#f3ede4', 0.45], ['#a8703f', 0.55]], ice: true, straw: '#3a1e10', desc: 'Our most-ordered drink with any box.' },
    { name: 'Iced Caramel Macchiato', price: 3.9, temp: 'cold', liquid: [['#f3ede4', 0.5], ['#c78545', 0.3], ['#6e3f1f', 0.2]], ice: true, straw: '#3a1e10', desc: 'Layered milk, espresso and caramel.' },
    { name: 'Iced Matcha Latte', price: 3.9, temp: 'cold', liquid: [['#f3ede4', 0.45], ['#8fb562', 0.55]], ice: true, straw: '#2f4a1e', desc: 'Cold milk with a bright matcha float.' },
    { name: 'Orange Cold Brew', price: 3.6, temp: 'cold', liquid: [['#ff8a2b', 0.35], ['#3a1d0c', 0.65]], ice: true, straw: '#ff6a13', desc: 'Slow-steeped cold brew on fresh orange.' },
    { name: 'Mocha Frappe', price: 4.2, temp: 'cold', liquid: [['#6b4430', 1]], whip: true, straw: '#3a1e10', desc: 'Blended mocha, whipped cream, chocolate drizzle.' },
  ],
};
export const ALL_DRINKS = [...DRINKS.hot, ...DRINKS.cold];
export const FREE_DRINKS = ['Iced Spanish Latte', 'Iced Americano', 'Cafe Latte', 'Classic Americano'].map((n) => ALL_DRINKS.find((x) => x.name === n));
export const drinkByName = (n) => ALL_DRINKS.find((x) => x.name === n);

export const COMBOS = [
  { name: 'Solo Treat', price: 8.9, drinks: ['Iced Caramel Macchiato'], donuts: [CLASSIC[3], CLASSIC[4]], lines: ['1 Iced Caramel Macchiato', '2 classic donuts'] },
  { name: 'Double Date', price: 14.5, drinks: ['Iced Spanish Latte', 'Iced Spanish Latte'], donuts: [CLASSIC[0], PREMIUM[0]], lines: ['2 Iced Spanish Lattes', '1 classic + 1 premium donut'] },
  { name: 'Squad Snack', price: 13.9, drinks: ['Mocha Frappe'], donuts: [PREMIUM[4], PREMIUM[8], CLASSIC[10]], lines: ['1 Mocha Frappe', '2 premium + 1 classic donut'] },
];
export const BOXES = [
  { kind: 'Premium', note: 'Any premium flavors', prices: { 6: 19.9, 12: 37.9, 24: 71.9 }, art: [PREMIUM[3], PREMIUM[6], PREMIUM[13]] },
  { kind: 'Assorted', note: 'Half premium, half classic', prices: { 6: 17.9, 12: 33.9, 24: 63.9 }, art: [PREMIUM[1], CLASSIC[4], PREMIUM[9]] },
  { kind: 'Classic', note: 'Any classic flavors', prices: { 6: 14.9, 12: 27.9, 24: 52.9 }, art: [CLASSIC[0], CLASSIC[3], CLASSIC[9]] },
];

// two extra flavours that only appear in the home page Box of 6
export const BOX_EXTRAS = [
  d('Orange Zest Cream', 3.4, '#ff9a4d', { toppings: ['pearls'], drizzle: '#ffffff', fill: 'Vanilla custard' }),
  d('Ube Halaya', 3.6, '#a46be0', { toppings: ['crumbs'], drizzle: '#fbf4ea', fill: 'Ube halaya' }),
];
export const ALL_DONUTS = (() => { const seen = new Set(), out = []; [...FLAVORS, ...PREMIUM, ...CLASSIC, ...BOX_EXTRAS].forEach((f) => { if (!seen.has(f.name)) { seen.add(f.name); out.push(f); } }); return out; })();

/* ---------- pre-rendered 3D art (made by tools/render3d.html, see README) ---------- */
export const slug = (n) => n.toLowerCase().replace(/&/g, 'and').replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const DONUT_SET = new Set(ALL_DONUTS.map((f) => f.name)), DRINK_SET = new Set(ALL_DRINKS.map((f) => f.name));
export const ART_VERSION = 1;
// the six donuts shown in each pre-rendered 3D box (home Box of 6 + the three menu boxes)
export const BOX_SETS = {
  six: FLAVORS.slice(0, 6),
  premium: [PREMIUM[3], PREMIUM[6], PREMIUM[13], PREMIUM[0], PREMIUM[2], PREMIUM[9]],
  assorted: [PREMIUM[1], CLASSIC[4], PREMIUM[9], CLASSIC[1], PREMIUM[6], CLASSIC[7]],
  classic: [CLASSIC[0], CLASSIC[3], CLASSIC[9], CLASSIC[1], CLASSIC[5], CLASSIC[7]],
};
// which box picture a cart item gets (also works for items saved before boxes had their own picture)
export function boxArtKey(it) {
  if (it.box && BOX_SETS[it.box]) return it.box;
  const m = /^(premium|assorted|classic) box( of \d+)?$/i.exec(it.name || '');
  if (m) return m[1].toLowerCase();
  return /^box of 6$/i.test(it.name || '') ? 'six' : null;
}
// small = a 128-160 px copy for chips, drawer rows and chat bubbles (made by qa/gb_thumbs_sm.py)
export function art3dSrc(name, view = 'tilt', small = false) {
  const sm = small ? '-sm' : '';
  if (name.startsWith('box:') && BOX_SETS[name.slice(4)]) return `assets/3d/boxes/${name.slice(4)}${sm}.webp?a=${ART_VERSION}`;
  if (DONUT_SET.has(name)) return `assets/3d/donuts/${slug(name)}${view === 'top' ? '-top' : ''}${sm}.webp?a=${ART_VERSION}`;
  if (DRINK_SET.has(name)) return `assets/3d/drinks/${slug(name)}${sm}.webp?a=${ART_VERSION}`;
  return null;
}

/* ---------- one-line descriptions + taste groups (menu cards, filters) ---------- */
const GLAZE_SHORT = { '#fbf4ea': 'White chocolate', '#5a321c': 'Milk chocolate', '#6b3f26': 'Hazelnut chocolate', '#3a2016': 'Dark chocolate', '#2e1810': 'Dark chocolate', '#fff3d6': 'Sweet cream', '#f3e3c8': 'Tiramisu cream', '#c8955f': 'Coffee', '#a46be0': 'Ube', '#a8d48f': 'Matcha', '#ff8fb4': 'Strawberry', '#fbe7c4': 'Classic sugar', '#4a2a1a': 'Chocolate', '#a9764a': 'Mocha', '#d9a066': 'Caramel', '#d6ac76': 'Cafe latte', '#e8cfa6': 'Milk tea', '#2b1a14': 'Cookie crumb' };
const TOP_SHORT = { almonds: 'toasted almonds', wafer: 'a wafer bar', nuts: 'chopped hazelnuts', mallows: 'marshmallows', crumbs: 'cookie crumbs', cheese: 'grated cheese', coffeecrumb: 'coffee crumble', coconut: 'coconut flakes', sprinkles: 'sprinkles', biscuit: 'biscuit crumbs', graham: 'graham crumbs', jam: 'mango jam', sesame: 'black sesame' };
export function cardLine(f) {
  const base = (GLAZE_SHORT[f.glaze] || 'Glossy') + (f.pattern === 'crumbcoat' ? ' coat' : ' glaze');
  const more = (f.toppings || []).filter((t) => TOP_SHORT[t] && t !== 'cookie').map((t) => TOP_SHORT[t]);
  if (f.pattern === 'marble') more.unshift(/^#f/i.test(f.patternColor || '') ? 'white swirl' : 'dark swirl');
  if (f.pattern === 'dust' && !more.length) more.push('cocoa dust');
  if (f.drizzle && !more.length) more.push('a drizzle');
  return [base, ...more.slice(0, 2)].join(' with ').replace(' with ', ' \u00b7 ').replace(' with ', ' & ');
}
export const hasNuts = (f) => /almond|hazelnut/i.test(f.name + ' ' + (f.fill || '')) || (f.toppings || []).some((t) => t === 'almonds' || t === 'nuts');
const TXT = (f) => (f.name + ' ' + (f.fill || '') + ' ' + (GLAZE_SHORT[f.glaze] || '') + ' ' + (f.toppings || []).join(' ')).toLowerCase();
export const TASTES = [
  { key: 'all', label: 'All', test: () => true },
  { key: 'choc', label: 'Chocolatey', test: (f) => /chocolate|choco|cocoa|ganache|mocha|midnight|s'mores|crumbs/.test(TXT(f).replace(/white chocolate/g, '')) },
  { key: 'fruit', label: 'Fruity', test: (f) => /strawberry|berry|mango|jam/.test(TXT(f)) },
  { key: 'coffee', label: 'Coffee & tea', test: (f) => /coffee|latte|mocha|cappuccino|tiramisu|matcha|tea/.test(TXT(f)) },
  { key: 'nut', label: 'Nutty', test: (f) => hasNuts(f) || /sesame/.test(TXT(f)) },
  { key: 'fun', label: 'Sprinkles & mallows', test: (f) => (f.toppings || []).some((t) => t === 'sprinkles' || t === 'mallows') },
];
