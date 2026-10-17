// Glaze Bomb - "Glazy", the site assistant.
// Answers from everything on the website (menu, prices, fillings, drinks, combos, boxes, deals, hours,
// location, how we make them, socials), tolerant of typos, plurals, slang and some Taglish.
// It can add things to the order, show the order, and take the visitor to any section.
import {
  gsap, $, $$, reduce, money, lenis, FLAVORS, PREMIUM, CLASSIC, DRINKS, ALL_DRINKS, FREE_DRINKS, COMBOS, BOXES,
  donutArt, cupArt, boxArt, addToCart, cart, removeFromCart, clearCart, openDrawer, scrollToTarget, SOCIAL, afterIntro,
} from './common.js?v=46';

/* ======================= knowledge ======================= */
const HOURS = { weekday: [360, 840], weekend: [420, 780] };
const ADDRESS = 'Glaze Bomb Bakery, 12 Glaze Lane, Downtown';
const GLAZE = { '#fbf4ea': 'white chocolate', '#fbe7c4': 'classic sugar', '#5a321c': 'milk chocolate', '#6b3f26': 'hazelnut chocolate', '#3a2016': 'dark chocolate', '#2e1810': 'dark chocolate', '#2b1a14': 'chocolate cookie', '#4a2a1a': 'chocolate', '#fff3d6': 'sweet cream', '#f3e3c8': 'tiramisu cream', '#c8955f': 'coffee', '#a46be0': 'ube', '#a8d48f': 'matcha', '#ff8fb4': 'strawberry', '#a9764a': 'mocha', '#d9a066': 'caramel', '#ff9a4d': 'orange zest', '#d6ac76': 'cafe latte', '#e8cfa6': 'milk tea' };
const TOPS = { biscuit: 'buttery biscuit crumbs', cookie: 'a whole spiced biscuit', crumbs: 'chocolate cookie crumbs', graham: 'toasted graham crumbs', jam: 'a spoon of mango jam', sesame: 'toasted black sesame', sprinkles: 'rainbow sprinkles', pearls: 'sugar pearls', almonds: 'toasted almond slivers', cheese: 'grated cheese', mallows: 'mini marshmallows', coconut: 'coconut flakes', nuts: 'chopped hazelnuts', coffeecrumb: 'coffee crumble', wafer: 'a crunchy wafer bar' };
const DRIZ = { '#fbf4ea': 'white chocolate', '#ffffff': 'white chocolate', '#fff4e6': 'white chocolate', '#2a140a': 'dark chocolate', '#3a1d10': 'dark chocolate', '#6e3f1f': 'caramel', '#9c6a3c': 'caramel' };
const list = (a) => (a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]);
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function describe(d) {
  if (d.desc) return d.desc;
  if (d.kind === 'drink') return d.desc || '';
  let s = cap(GLAZE[d.glaze] || 'glossy') + ' glaze';
  if (d.pattern === 'marble') s += ' with a hand-swirled chocolate web';
  if (d.pattern === 'dust') s += ' with a fine dusting on top';
  if (d.pattern === 'crumbcoat') s += ', fully crumb-coated';
  const t = (d.toppings || []).map((x) => TOPS[x]).filter(Boolean);
  if (t.length) s += ', topped with ' + list(t);
  if (d.drizzle) s += (t.length ? ', ' : ' ') + 'finished with a ' + (DRIZ[d.drizzle] || 'sweet') + ' drizzle';
  return s + '.';
}

const SIG = new Set(FLAVORS.map((f) => f.name));
const DONUTS = [], seen = new Set();
const addDonut = (f, cat) => { if (seen.has(f.name)) return; seen.add(f.name); DONUTS.push({ ...f, kind: 'donut', cat: SIG.has(f.name) ? 'Signature' : cat, fill: f.fill || 'Vanilla custard' }); };
FLAVORS.forEach((f) => addDonut(f, 'Signature'));
PREMIUM.forEach((f) => addDonut(f, 'Premium'));
CLASSIC.forEach((f) => addDonut(f, 'Classic'));
const DRINK_ITEMS = ALL_DRINKS.map((d) => ({ ...d, kind: 'drink', cat: d.temp === 'hot' ? 'Hot drink' : 'Iced drink' }));
const COMBO_ITEMS = COMBOS.map((c) => ({ ...c, kind: 'combo', cat: 'Combo' }));
const BOX_ITEMS = BOXES.map((b) => ({ ...b, boxKind: b.kind, kind: 'box', name: b.kind + ' box', cat: 'Box' }));
const ENTITIES = [...DONUTS, ...DRINK_ITEMS, ...COMBO_ITEMS, ...BOX_ITEMS];

// where things live on the site
const ROUTES = {
  signature: ['index.html', 'flavors', 'Signature flavors'], build: ['index.html', 'build', 'Build your own'], box6: ['index.html', 'box', 'Box of 6'],
  explore: ['index.html', 'explore', 'Menu overview'], process: ['index.html', 'process', 'How we make them'], reviews: ['index.html', 'reviews', 'Reviews'],
  visit: ['index.html', 'visit', 'Visit us'], social: ['index.html', 'social', 'Follow us'], premium: ['menu.html', 'premium', 'Premium donuts'],
  classic: ['menu.html', 'classic', 'Classic donuts'], drinks: ['menu.html', 'drinks', 'Drinks'], combos: ['menu.html', 'combos', 'Combos'], boxes: ['menu.html', 'boxes', 'Boxes + free drink'],
  gallery: ['gallery.html', 'top', 'Gallery'], location: ['location.html', 'top', 'Location'], hours: ['location.html', 'hours', 'Opening hours'], gettinghere: ['location.html', 'getting-here', 'Getting here'],
};
// searchable notes for anything the specific answers do not cover
const DOCS = [
  ['signature', 'signature flavors six best sellers caramel biscuit crunch cookies cream latte midnight marble choco crumble stripe mango graham milk tea sesame taste sweet rich crunch best with'],
  ['build', 'build your own donut dough classic brioche double cocoa matcha filling vanilla custard chocolate ganache strawberry jam ube halaya glaze finish smooth marble swirl sesame dust crumb coat topping drizzle live preview drag spin surprise me'],
  ['box6', 'fill a box of 6 save 10 percent free drink tap drag donut tray clear box add box to order'],
  ['process', 'how we make them mix knead brioche butter milk eggs slow rise overnight fry golden 90 seconds per side fill piped glaze top hand dipped 2 am 5 am 6 am'],
  ['reviews', 'what customers say reviews custard goes to the edge mango graham office box midnight marble not too sweet sell out stars'],
  ['visit', 'visit us opening hours monday friday 6 am 2 pm saturday sunday 7 am 1 pm address glaze lane downtown pick up order view map directions'],
  ['social', 'follow glazebomb instagram tiktok facebook youtube tag photo new flavors drop'],
  ['gallery', 'gallery photos pictures pics images shop kitchen behind the scenes counter neon'],
  ['location', 'location map directions train station parking car bike seating seats wheelchair accessible dog terrace pay card cash phone email contact'],
  ['premium', 'premium donuts loaded filled thick glazes real toppings almond snowcap wafer crunch bar hazelnut velvet smores campfire bavarian cream cheese cloud tiramisu coffee crumble ube matcha berry coconut cappuccino'],
  ['classic', 'classic donuts simple sweet original glaze choco strawberry sprinkle hazelnut crunch choco almond cookie speckle mocha matcha drizzle mallow party caramel drizzle'],
  ['drinks', 'hot iced drinks coffee espresso americano latte macchiato spanish latte hot chocolate matcha cold brew frappe made to order'],
  ['combos', 'combos drink donuts solo treat double date squad snack pairings'],
  ['boxes', 'boxes free drink premium assorted classic box of 6 12 24 prices order a day ahead pick your free drink'],
];

/* ======================= language: tolerant matching ======================= */
const SYN = {
  doughnut: 'donut', doughnuts: 'donut', donuts: 'donut', donat: 'donut', donnut: 'donut', dougnut: 'donut', donught: 'donut', doughnot: 'donut', dnut: 'donut', donas: 'donut',
  expresso: 'espresso', carmel: 'caramel', caramal: 'caramel', carmal: 'caramel', choco: 'chocolate', choc: 'chocolate', chocolat: 'chocolate', tsokolate: 'chocolate', chocolates: 'chocolate', chocolatey: 'chocolate', chocolaty: 'chocolate', cocoa: 'chocolate',
  frappuccino: 'frappe', frap: 'frappe', frapp: 'frappe', frape: 'frappe', cappucino: 'cappuccino', capuccino: 'cappuccino', capucino: 'cappuccino', machiato: 'macchiato', macchiatto: 'macchiato', macciato: 'macchiato', machiatto: 'macchiato',
  coffe: 'coffee', cofee: 'coffee', kape: 'coffee', kopi: 'coffee', coffees: 'coffee', cold: 'iced', ice: 'iced', icy: 'iced', chilled: 'iced', warm: 'hot',
  prices: 'price', cost: 'price', costs: 'price', presyo: 'price', magkano: 'price', priced: 'price', pricing: 'price', hm: 'price', hmm: 'price',
  cheap: 'cheapest', cheaper: 'cheapest', affordable: 'cheapest', budget: 'cheapest', mura: 'cheapest', pricey: 'expensive', priciest: 'expensive',
  hour: 'hours', hrs: 'hours', oras: 'hours', schedule: 'hours', timing: 'hours', opening: 'open', opens: 'open', bukas: 'open', closing: 'close', closes: 'close', closed: 'close', sarado: 'close',
  saan: 'where', nasaan: 'where', located: 'location', address: 'location', directions: 'location', direction: 'location', map: 'location', branch: 'location', store: 'location', shop: 'location',
  libre: 'free', freebie: 'free', complimentary: 'free', inumin: 'drink', drinks: 'drink', beverage: 'drink', beverages: 'drink', bevs: 'drink', kahon: 'box', boxes: 'box',
  gud: 'good', gm: 'good morning', hole: 'hole', holes: 'hole', wi: 'wifi', wifi: 'wifi', internet: 'wifi', seats: 'seating', seat: 'seating', dine: 'seating', table: 'seating', tables: 'seating', toilet: 'restroom', cr: 'restroom', bathroom: 'restroom', pets: 'pet', dog: 'pet', parking: 'parking', park: 'parking', aircon: 'seating',
  thx: 'thanks', ty: 'thanks', tnx: 'thanks', salamat: 'thanks', thank: 'thanks', hello: 'hi', hey: 'hi', hiya: 'hi', yo: 'hi', helo: 'hi', hellow: 'hi', kumusta: 'hi', musta: 'hi', hola: 'hi', good: 'good',
  recomend: 'recommend', reccomend: 'recommend', recommendation: 'recommend', recommendations: 'recommend', suggest: 'recommend', suggestion: 'recommend', suggestions: 'recommend', fave: 'favorite', favourite: 'favorite', fav: 'favorite', bestseller: 'bestseller', bestsellers: 'bestseller',
  deliver: 'delivery', delivered: 'delivery', deliveries: 'delivery', takeout: 'pickup', takeaway: 'pickup', cart: 'order', basket: 'order', bag: 'order', orders: 'order',
  allergies: 'allergy', allergic: 'allergy', allergen: 'allergy', allergens: 'allergy', peanut: 'nut', peanuts: 'nut', nuts: 'nut', nutty: 'nut', glutenfree: 'gluten', kosher: 'halal', calorie: 'calories', kcal: 'calories', nutrition: 'calories', sugarfree: 'sugar', diabetic: 'sugar', ingredients: 'ingredient',
  insta: 'instagram', ig: 'instagram', fb: 'facebook', yt: 'youtube', socials: 'social', socmed: 'social', subscribe: 'newsletter', call: 'phone', number: 'phone', whatsapp: 'phone', viber: 'phone', mobile: 'phone',
  paying: 'payment', pay: 'payment', gcash: 'payment', card: 'payment', cash: 'payment', combos: 'combo', meal: 'combo', bundle: 'combo', deals: 'deal', promo: 'deal', promos: 'deal', discount: 'deal', discounts: 'deal', sale: 'deal', voucher: 'deal', coupon: 'deal', offer: 'deal', offers: 'deal',
  fillings: 'filling', filled: 'filling', stuffed: 'filling', palaman: 'filling', customize: 'build', customise: 'build', custom: 'build', diy: 'build',
  goodbye: 'bye', cya: 'bye', paalam: 'bye', robot: 'bot', ai: 'bot', chatbot: 'bot', funny: 'joke', menus: 'menu',
  sweeter: 'sweet', sweetest: 'sweet', matamis: 'sweet', crunchy: 'crunch', crispy: 'crunch', fruit: 'fruity', berries: 'strawberry', berry: 'strawberry',
  kid: 'kids', children: 'kids', child: 'kids', bata: 'kids', office: 'party', event: 'party', events: 'party', birthday: 'party', catering: 'party', crowd: 'party', meeting: 'party',
  saturday: 'weekend', sunday: 'weekend', sat: 'weekend', sun: 'weekend', weekdays: 'weekday', monday: 'weekday', tuesday: 'weekday', wednesday: 'weekday', thursday: 'weekday', friday: 'weekday', mon: 'weekday', fri: 'weekday',
  delete: 'remove', minus: 'remove', cancel: 'remove', empty: 'clear', reset: 'clear', buy: 'add', reviews: 'review', rating: 'review', ratings: 'review', testimonial: 'review', testimonials: 'review',
  flavour: 'flavor', flavours: 'flavor', flavors: 'flavor', marshmallow: 'mallow', marshmallows: 'mallow', mallows: 'mallow', almonds: 'almond', hazelnuts: 'hazelnut', strawberries: 'strawberry', mangoes: 'mango',
  yeah: 'yes', yep: 'yes', yup: 'yes', sure: 'yes', ok: 'yes', okay: 'yes', sige: 'yes', oo: 'yes', opo: 'yes', nope: 'no', nah: 'no', hindi: 'no', wag: 'no',
};
const COMMON = 'morning afternoon evening night hole wifi seating restroom pet parking they their theyre them u r ur im pls plz wat wut whats what when where which who how much many time today tomorrow now have want like good great nice love open close drink box free price menu order donut glaze iced hot sweet something anything recommend please thanks hi yes no show take give tell more less best new first last next see go get got need make made fresh daily every with without from for your you our are is the and also any some one two three four five six seven eight nine ten eleven twelve dozen half couple few lot all only just about between difference compare versus better than most least cheapest expensive popular favorite bestseller signature premium classic combo deal build filling flavor drinks coffee tea latte matcha ube mango cheese caramel vanilla custard jam strawberry chocolate crunch rich light kids party delivery pickup location hours weekend weekday payment checkout social instagram facebook tiktok youtube newsletter email phone contact allergy nut gluten vegan vegetarian dairy egg halal calories sugar ingredient bot joke review about story concept real website remove clear add pair goes match inside sell offer list options there here this that those them it'.split(' ');
const NUM = { one: 1, a: 1, an: 1, two: 2, couple: 2, three: 3, few: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, dozen: 12, isa: 1, dalawa: 2, tatlo: 3 };
const GENERIC = new Set(['donut', 'glaze', 'iced', 'hot', 'latte', 'cream', 'box', 'of', 'the', 'and', 'classic', 'premium', 'drizzle', 'sprinkle', 'web', 'cloud', 'dream', 'party', 'snack', 'treat', 'date', 'chocolate', 'strawberry', 'matcha', 'mango', 'caramel', 'coffee', 'hazelnut', 'almond', 'cheese', 'ube', 'sesame', 'vanilla', 'orange', 'mocha', 'milk', 'tea', 'crunch', 'glazed', 'americano', 'assorted']);
const STOP = new Set('a an the is are am i me my you your we our it its of to for in on at and or with do does did can could would should please pls plz be have has this that these those there here just some any get got want wanna like will would much how what which'.split(' '));

const ntoks = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/&/g, ' and ').replace(/['’]/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/([a-z])\1{2,}/g, '$1$1').split(/\s+/).filter(Boolean);
const VOCAB = new Set([...Object.keys(SYN), ...Object.values(SYN), ...COMMON, ...Object.keys(NUM)]);
ENTITIES.forEach((e) => ntoks(e.name).forEach((t) => VOCAB.add(t)));
DOCS.forEach(([, t]) => t.split(' ').forEach((w) => VOCAB.add(w)));
const VLIST = [...VOCAB];

function dl(a, b, max) {   // Damerau-Levenshtein (optimal string alignment) with early exit
  const la = a.length, lb = b.length; if (Math.abs(la - lb) > max) return max + 1;
  let p2 = null, p = Array.from({ length: lb + 1 }, (_, j) => j);
  for (let i = 1; i <= la; i++) {
    const c = [i]; let m = i;
    for (let j = 1; j <= lb; j++) {
      let v = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, p2[j - 2] + 1);
      c[j] = v; if (v < m) m = v;
    }
    if (m > max) return max + 1;
    p2 = p; p = c;
  }
  return p[lb];
}
const canonCache = new Map();
function canon(t) {
  if (canonCache.has(t)) return canonCache.get(t);
  let out = t;
  if (SYN[t]) out = SYN[t];
  else if (VOCAB.has(t) || /^\d+$/.test(t) || t.length < 4) out = t;
  else if (t.endsWith('s') && VOCAB.has(t.slice(0, -1))) out = canon(t.slice(0, -1));
  else {
    const max = t.length >= 8 ? 2 : 1; let best = null, bd = max + 1;
    for (const v of VLIST) {
      if (v.length < 3 || Math.abs(v.length - t.length) > max) continue;
      if (t.length < 6 && v[0] !== t[0]) continue;
      const d = dl(t, v, max);
      if (d < bd || (d === bd && best && v.length > best.length)) { bd = d; best = v; }
    }
    if (best) out = SYN[best] || best;
    else { const pre = VLIST.find((v) => v.length >= 6 && v.startsWith(t)); if (pre) out = SYN[pre] || pre; }
  }
  canonCache.set(t, out);
  return out;
}
ENTITIES.forEach((e) => { e._t = ntoks(e.name).map(canon).filter((t) => !STOP.has(t) || t === 'a'); e._facets = new Set(ntoks([e.name, describe(e), e.fill || '', e.glazeName || '', e.cat, (e.toppings || []).map((x) => TOPS[x]).join(' '), e.desc || ''].join(' ')).map(canon)); });

function findEntities(C) {
  const set = new Set(C), seq = ' ' + C.join(' ') + ' ', out = [];
  for (const e of ENTITIES) {
    let hit = 0, strong = 0;
    for (const t of e._t) if (set.has(t)) { hit++; if (!GENERIC.has(t)) strong++; }
    if (!strong && hit < e._t.length) continue;
    let score = hit / e._t.length;
    if (seq.includes(' ' + e._t.join(' ') + ' ')) score += 0.6;
    if (score >= 0.5) out.push({ e, score, hit });
  }
  // prefer the temperature the visitor named
  const wantIced = set.has('iced'), wantHot = set.has('hot');
  out.forEach((o) => { if (o.e.kind === 'drink') { if (wantIced && o.e.temp === 'cold') o.score += 0.3; if (wantHot && o.e.temp === 'hot') o.score += 0.3; } });
  out.sort((a, b) => b.score - a.score || b.hit - a.hit || a.e._t.length - b.e._t.length);
  return out;
}
function qtyOf(C) {
  for (let i = 0; i < C.length; i++) {
    const t = C[i];
    if (t === 'half' && C[i + 1] === 'dozen') return 6;
    if (/^\d+$/.test(t)) { const n = +t; if (n >= 1 && n <= 24) return n; }
    if (NUM[t] && t !== 'a' && t !== 'an') return NUM[t];
  }
  return 1;
}

/* ======================= answers ======================= */
const ctx = { last: null, pending: null };
const R = (html, opts = {}) => ({ html, ...opts });
function openInfo() {
  const d = new Date(), day = d.getDay(), mins = d.getHours() * 60 + d.getMinutes(), we = day === 0 || day === 6;
  const [o, c] = we ? HOURS.weekend : HOURS.weekday, fmt = (m) => `${m / 60 % 12 | 0 || 12}:${String(m % 60).padStart(2, '0')} ${m < 720 ? 'AM' : 'PM'}`;
  if (mins >= o && mins < c) return `We're <b>open right now</b> until ${fmt(c)} (or until we sell out).`;
  const tw = ((day + 1) % 7 === 0 || (day + 1) % 7 === 6), next = mins < o ? `today at ${fmt(o)}` : `tomorrow at ${fmt(tw ? HOURS.weekend[0] : HOURS.weekday[0])}`;
  return `We're <b>closed right now</b>. We open ${next}.`;
}
const hoursTable = '<ul class="cl"><li><b>Monday to Friday</b> 6:00 AM - 2:00 PM</li><li><b>Saturday &amp; Sunday</b> 7:00 AM - 1:00 PM</li></ul>';
function card(e) {
  const art = e.kind === 'drink' ? cupArt(e, true) : e.kind === 'combo' ? cupArt(ALL_DRINKS.find((d) => d.name === e.drinks[0]), true) : e.kind === 'box' ? boxArt(e.boxKind.toLowerCase(), true) : donutArt(e, 'tilt', 31, true);
  const meta = e.kind === 'donut' ? `${e.cat} &middot; ${esc(e.fill)} filling` : e.kind === 'drink' ? e.cat : e.kind === 'combo' ? esc(e.lines.join(' + ')) : esc(e.note);
  const price = e.kind === 'box' ? `from ${money(e.prices[6])}` : money(e.price);
  return `<div class="cc"><span class="cc__art">${art}</span><span class="cc__b"><b>${esc(e.name)}</b><small>${meta}</small></span><span class="cc__p">${price}</span></div>`;
}
const addBtn = (e, n = 1) => ({ label: n > 1 ? `Add ${n} to order` : 'Add to order', run: () => doAdd(e, n) });
const goBtn = (key, label) => ({ label: label || 'Show me', run: () => go(key) });
function routeOf(e) { return e.kind === 'drink' ? 'drinks' : e.kind === 'combo' ? 'combos' : e.kind === 'box' ? 'boxes' : e.cat === 'Classic' ? 'classic' : e.cat === 'Signature' ? 'signature' : e.cat === 'Box of 6 flavor' ? 'box6' : 'premium'; }

function doAdd(e, n = 1) {
  n = Math.max(1, Math.min(12, n));
  if (e.kind === 'box') { ctx.pending = null; return R(`Which size? The ${esc(e.name)} comes in 6, 12 or 24.`, { actions: [6, 12, 24].map((s) => ({ label: `Box of ${s} &middot; ${money(e.prices[s])}`, run: () => addBox(e, s) })) }); }
  for (let i = 0; i < n; i++) {
    if (e.kind === 'drink') addToCart({ ...e, kind: 'drink', sub: e.temp === 'hot' ? 'Hot drink' : 'Iced drink' });
    else if (e.kind === 'combo') addToCart({ ...e.donuts[0], artName: e.donuts[0].name, comboCup: e.drinks[0], name: e.name + ' combo', sub: e.lines.join(' + '), price: e.price });
    else addToCart({ ...e, sub: e.fill + ' filling' });
  }
  ctx.last = e; ctx.pending = null;
  return R(`Added ${n > 1 ? n + ' x ' : ''}<b>${esc(e.name)}</b> to your order. You now have ${cart.length} item${cart.length === 1 ? '' : 's'}.`, { actions: [{ label: 'View my order', run: viewOrder }, goBtn('drinks', 'Add a drink')] });
}
function addBox(b, size) {
  const free = FREE_DRINKS[0];
  const k = b.boxKind || b.kind;
  addToCart({ ...b.art[0], box: k.toLowerCase(), name: `${k} box of ${size}`, sub: b.note, free: free.name, price: b.prices[size] });
  return R(`Added a <b>${k} box of ${size}</b> (${money(b.prices[size])}) with a free <b>${free.name}</b>. You can change the free drink in your order.`, { actions: [{ label: 'View my order', run: viewOrder }, goBtn('boxes', 'Change free drink')] });
}
function viewOrder() { closeChat(true); openDrawer(true); return null; }
function orderSummary() {
  if (!cart.length) return R('Your order is empty right now. Want a suggestion?', { chips: ['Best sellers', 'Something chocolatey', 'Free drink deal'] });
  const tot = cart.reduce((a, b) => a + (b.price || 0), 0);
  return R(`Your order has <b>${cart.length} item${cart.length === 1 ? '' : 's'}</b>, total <b>${money(tot)}</b>:<ul class="cl">${cart.slice(0, 8).map((it) => `<li>${esc(it.name)} <span>${it.price ? money(it.price) : 'Free'}</span></li>`).join('')}${cart.length > 8 ? `<li>and ${cart.length - 8} more</li>` : ''}</ul>`, { actions: [{ label: 'Open my order', run: viewOrder }] });
}
function describeE(e) {
  ctx.last = e;
  let html = card(e) + `<p>${esc(e.kind === 'combo' ? 'A ready-made pairing: ' + e.lines.join(' and ') + '.' : e.kind === 'box' ? `${e.note}. Box of 6 ${money(e.prices[6])}, 12 ${money(e.prices[12])}, 24 ${money(e.prices[24])}. Every box comes with a free drink.` : describe(e))}</p>`;
  if (e.pair) html += `<p>Best with: <b>${esc(e.pair)}</b>.</p>`;
  if (e.taste) html += `<p class="cl-taste">Sweet ${e.taste.sweet}% &middot; Rich ${e.taste.rich}% &middot; Crunch ${e.taste.crunch}%</p>`;
  if (e.cat === 'Box of 6 flavor') html += '<p>You can pick this one in the Box of 6 on the home page.</p>';
  if (e.kind === 'drink') { const twin = DRINK_ITEMS.find((d) => d !== e && d.name.replace(/^Iced |^Hot /, '') === e.name.replace(/^Iced |^Hot /, '')); if (twin) html += `<p>Also available ${twin.temp === 'cold' ? 'iced' : 'hot'}: <b>${esc(twin.name)}</b> (${money(twin.price)}).</p>`; }
  return R(html, { actions: [addBtn(e), goBtn(routeOf(e), 'See it on the site')] });
}
function priceOf(e) {
  ctx.last = e;
  if (e.kind === 'box') return R(`The <b>${esc(e.name)}</b>: box of 6 <b>${money(e.prices[6])}</b>, 12 <b>${money(e.prices[12])}</b>, 24 <b>${money(e.prices[24])}</b>. A free drink comes with every box.`, { actions: [addBtn(e)] });
  return R(`<b>${esc(e.name)}</b> is <b>${money(e.price)}</b>.` + (e.kind === 'donut' ? ` It's filled with ${esc(e.fill.toLowerCase())}.` : ''), { actions: [addBtn(e), goBtn(routeOf(e), 'See it on the site')] });
}
function cards(items, intro, max = 4) {
  const shown = items.slice(0, max);
  return R(`${intro}${shown.map(card).join('')}${items.length > max ? `<p>and ${items.length - max} more on the menu.</p>` : ''}`, { actions: shown.slice(0, 3).map((e) => ({ label: `Add ${e.name}`, run: () => doAdd(e) })) });
}
const ATTR = {
  chocolate: (e) => /chocolate|ganache|cocoa|mocha|choco/.test((e.name + ' ' + describe(e) + ' ' + (e.fill || '') + ' ' + (e.dough || '')).toLowerCase().replace(/white chocolate/g, '')), strawberry: (e) => e._facets.has('strawberry'),
  fruity: (e) => ['strawberry', 'mango', 'orange'].some((w) => e._facets.has(w) || e.name.toLowerCase().includes(w)), coffee: (e) => ['coffee', 'latte', 'mocha', 'cappuccino', 'tiramisu', 'americano', 'espresso', 'brew', 'macchiato'].some((w) => e._facets.has(w)),
  matcha: (e) => e._facets.has('matcha'), ube: (e) => e._facets.has('ube'), cheese: (e) => e._facets.has('cheese'), nut: (e) => /almond|hazelnut/i.test(e.name + ' ' + (e.fill || '')) || (e.toppings || []).some((t) => t === 'almonds' || t === 'nuts'),
  caramel: (e) => e._facets.has('caramel'), mango: (e) => e._facets.has('mango'), sesame: (e) => e._facets.has('sesame'), vanilla: (e) => e._facets.has('vanilla') || e._facets.has('custard'),
  custard: (e) => e._facets.has('custard'), jam: (e) => e._facets.has('jam'), mallow: (e) => e._facets.has('mallow') || (e.toppings || []).includes('mallows'), sprinkle: (e) => (e.toppings || []).includes('sprinkles'),
  crunch: (e) => (e.taste ? e.taste.crunch >= 70 : (e.toppings || []).some((t) => ['crumbs', 'biscuit', 'wafer', 'graham', 'nuts', 'almonds', 'coffeecrumb'].includes(t))),
  sweet: (e) => (e.kind === 'drink' ? /caramel|spanish|frappe|chocolate/i.test(e.name) : e.taste ? e.taste.sweet >= 70 : false), rich: (e) => (e.taste ? e.taste.rich >= 80 : /dark chocolate|ganache/.test(describe(e) + (e.fill || ''))), light: (e) => (e.kind === 'drink' ? /americano|brew|matcha/i.test(e.name) : e.taste ? e.taste.sweet <= 55 : false),
  hazelnut: (e) => /hazelnut/i.test(e.name + ' ' + (e.fill || '')) || (e.toppings || []).includes('nuts'), almond: (e) => /almond/i.test(e.name) || (e.toppings || []).includes('almonds'),
  kids: (e) => (e.toppings || []).some((t) => t === 'sprinkles' || t === 'mallows'), tea: (e) => e._facets.has('tea') || e._facets.has('matcha'),
};
const ATTR_WORD = { chocolate: 'chocolatey', strawberry: 'strawberry', fruity: 'fruity', coffee: 'coffee', matcha: 'matcha', ube: 'ube', cheese: 'cheesy', nut: 'nutty', caramel: 'caramel', mango: 'mango', sesame: 'sesame', vanilla: 'vanilla custard', custard: 'custard-filled', jam: 'jam-filled', mallow: 'marshmallow', sprinkle: 'sprinkle', crunch: 'crunchy', sweet: 'extra sweet', rich: 'rich', light: 'not-too-sweet', kids: 'kid-friendly', tea: 'tea', hazelnut: 'hazelnut', almond: 'almond' };
function attrsOf(C, T) {
  const a = Object.keys(ATTR).filter((k) => C.includes(k));
  if (/ not (too )?sweet | less sweet | light /.test(T)) { const i = a.indexOf('sweet'); if (i >= 0) a.splice(i, 1); a.push('light'); }
  if (C.includes('sprinkles')) a.push('sprinkle');
  return [...new Set(a)];
}
function recommend(attrs, T) {
  if (!attrs.length && / (drink|coffee|tea|latte|iced|espresso) /.test(T) && !/ donut /.test(T)) {
    const picks = ['Iced Spanish Latte', 'Iced Caramel Macchiato', 'Mocha Frappe', 'Cafe Latte'].map((n) => DRINK_ITEMS.find((d) => d.name === n));
    return { ...cards(picks, '<p>Our most-loved drinks. The Iced Spanish Latte is the one people pair with a box most.</p>'), chips: ['Iced drinks', 'Hot drinks', 'Not too sweet drink'] };
  }
  if (!attrs.length) {
    const picks = ['Caramel Biscuit Crunch', 'Midnight Marble', 'Mango Graham', 'Almond Snowcap'].map((n) => DONUTS.find((d) => d.name === n));
    return { ...cards(picks, '<p>Our crowd favorites: the #1 signature, the prettiest one, the summer one and the best seller on the menu.</p>'), chips: ['Something chocolatey', 'Not too sweet', 'Something fruity', 'Coffee drinks'] };
  }
  const wantDrink = / (drink|coffee|tea|latte|iced|espresso) /.test(T) && !/ donut /.test(T);
  let pool = wantDrink ? DRINK_ITEMS : (!/ donut /.test(T) && attrs.some((a) => ['matcha', 'coffee', 'tea'].includes(a)) ? [...DONUTS, ...DRINK_ITEMS] : DONUTS);
  if (wantDrink && / iced /.test(T)) pool = pool.filter((d) => d.temp === 'cold'); else if (wantDrink && / hot /.test(T)) pool = pool.filter((d) => d.temp === 'hot');
  let items = pool.filter((e) => attrs.every((a) => ATTR[a](e)));
  if (!items.length && !wantDrink) items = ENTITIES.filter((e) => (e.kind === 'donut' || e.kind === 'drink') && attrs.every((a) => ATTR[a](e)));
  if (!items.length) items = DONUTS.filter((e) => attrs.some((a) => ATTR[a](e)));
  if (!items.length) return R(`Hmm, nothing on the menu is ${attrs.map((a) => ATTR_WORD[a]).join(' and ')} right now. Want to <b>build your own</b> instead?`, { actions: [goBtn('build', 'Build my own')] });
  items.sort((a, b) => (b.cat === 'Signature') - (a.cat === 'Signature') || (b.tag ? 1 : 0) - (a.tag ? 1 : 0));
  return cards(items, `<p>${cap(attrs.map((a) => ATTR_WORD[a]).join(' + '))} picks${items.length > 1 ? ` (${items.length} on the menu)` : ''}:</p>`);
}
function drinksList(T) {
  const iced = / iced /.test(T), hot = / hot /.test(T) && !iced;
  if (iced || hot) { const l = DRINK_ITEMS.filter((d) => d.temp === (iced ? 'cold' : 'hot')); return { ...cards(l, `<p>Our ${iced ? 'iced' : 'hot'} drinks:</p>`, 6), actions: [goBtn('drinks', 'See the drinks in 3D')] }; }
  return R(`We have <b>6 hot</b> and <b>6 iced</b> drinks, from ${money(Math.min(...ALL_DRINKS.map((d) => d.price)))} to ${money(Math.max(...ALL_DRINKS.map((d) => d.price)))}.<ul class="cl"><li><b>Hot:</b> ${DRINKS.hot.map((d) => d.name).join(', ')}</li><li><b>Iced:</b> ${DRINKS.cold.map((d) => d.name).join(', ')}</li></ul>The Iced Spanish Latte is our most-ordered drink with a box.`, { actions: [goBtn('drinks', 'See the drinks')], chips: ['Iced drinks', 'Hot drinks', 'Free drink deal'] });
}
function search(C) {
  const words = C.filter((t) => !STOP.has(t) && t.length > 2);
  if (!words.length) return null;
  let best = null, bs = 0;
  for (const [key, text] of DOCS) { const set = new Set(text.split(' ')); const s = words.filter((w) => set.has(w)).length / words.length; if (s > bs) { bs = s; best = key; } }
  return bs >= 0.34 ? best : null;
}
const JOKES = ['Why did the donut go to the dentist? It needed a filling. Luckily, all of ours come pre-filled.', 'I tried to make a donut joke with a hole in the middle. We don\'t do holes here.', 'What do you call a donut that tells stories? A glazed-on-a-true-story.'];

function answer(raw) {
  const text = String(raw || '').slice(0, 300);
  const toks = ntoks(text);
  if (!toks.length) return R('Ask me anything about our donuts, drinks, prices, boxes or opening hours.', { chips: ['Best sellers', 'Are you open now?', 'Free drink deal', 'Build my own'] });
  const C = toks.map(canon), T = ' ' + C.join(' ') + ' ', has = (re) => re.test(T);
  const ents = findEntities(C);
  let e = ents[0]?.e || null;
  const top = ents.filter((o) => o.score >= (ents[0]?.score || 0) - 0.01);
  if (!e && ctx.last && C.length <= 3 && has(/ (price|how much|cost|add|filling|inside|pair|allergy|vegan) /)) e = ctx.last;
  if (!e && ctx.last && has(/ (it|that|this|those|them|one|same) /) && has(/ (price|how much|cost|add|filling|inside|pair|goes with|go with|allergy|nut|vegan|gluten|dairy|egg|more|describe|what is|whats|remove|same) /)) e = ctx.last;
  const n = qtyOf(C);

  // yes / no to a question I asked
  if (ctx.pending && /^ (yes|please|do it|go|add it) /.test(T)) { const p = ctx.pending; ctx.pending = null; return p(); }
  if (ctx.pending && /^ no /.test(T)) { ctx.pending = null; return R('No problem. Anything else I can help with?', { chips: ['Best sellers', 'Opening hours', 'My order'] }); }

  // order actions
  if (has(/ clear /) && has(/ order /)) { const k = cart.length; clearCart(); return R(k ? `Done, I cleared your order (${k} item${k === 1 ? '' : 's'}).` : 'Your order was already empty.'); }
  if (has(/ remove /)) {
    if (!cart.length) return R('Your order is empty, so there is nothing to remove.');
    const name = e?.name; let i = name ? cart.map((c) => c.name).lastIndexOf(name) : -1;
    if (i < 0 && name) i = cart.findIndex((c) => c.name.includes(name));
    if (i < 0 && / last /.test(T)) i = cart.length - 1;
    if (i < 0) return R('Which one should I remove? Tap the &times; next to it in your order, or tell me its name.', { actions: [{ label: 'Open my order', run: viewOrder }] });
    const it = removeFromCart(i); return R(`Removed <b>${esc(it.name)}</b>. ${cart.length} item${cart.length === 1 ? '' : 's'} left.`, { actions: [{ label: 'View my order', run: viewOrder }] });
  }
  const wantsAdd = has(/ (add|put|ill have|i ll have|give me|can i (get|have)|i (want|need)|id like|i d like|lets get|one more) /) || (has(/ order /) && e && !has(/ my order /) && !has(/ how /));
  if (wantsAdd && e && !has(/ recommend /)) {
    if (top.length > 1 && top[0].e.name !== top[1].e.name && !ctx.last) return R('Which one do you mean?', { actions: top.slice(0, 4).map((o) => ({ label: o.e.name, run: () => doAdd(o.e, n) })) });
    if (e.kind === 'box') { const size = [6, 12, 24].find((s) => C.includes(String(s))); return size ? addBox(e, size) : doAdd(e); }
    return doAdd(e, n);
  }
  if (has(/ add /) && !e) return R('Sure, what should I add? Tell me a donut, drink, combo or box, for example "add 2 Midnight Marble".', { chips: ['Add Caramel Biscuit Crunch', 'Add Iced Spanish Latte', 'Add a Premium box'] });
  if (has(/ (my order|total|whats in my|what is in my|view order|show order|order summary) /) || (C.length <= 2 && C.includes('order'))) return orderSummary();
  if (has(/ (payment|checkout) /)) return R('This is a concept website, so online checkout and payment are not active. You can still build your order here and see the total.', { actions: [{ label: 'Open my order', run: viewOrder }] });
  if (has(/ how (do|can) i (order|add|get) / ) || has(/ ordering /)) return R('Tap <b>Add</b> on any donut, drink, combo or box (or ask me, e.g. "add 2 Mango Graham"). Everything goes into your order, top right. Pick-up at the counter or delivery. Boxes of 12 and 24 are best ordered a day ahead.', { actions: [goBtn('premium', 'Open the menu'), { label: 'View my order', run: viewOrder }] });

  // questions about one item
  if (e) {
    if (has(/ (recommend|something|anything|suggest) /) && top[0].score < 1.2) return recommend(attrsOf(C, T), T);
    if (top.length > 1 && top[0].e.name !== top[1].e.name && top[0].score < 1.2 && !has(/ (it|that|this) /)) {
      return R(`We have a few of those. Which one?`, { actions: top.slice(0, 5).map((o) => ({ label: o.e.name, run: () => describeE(o.e) })) });
    }
    if (ents.length >= 2 && has(/ (difference|compare|vs|versus|better|or) /)) {
      const [a, b] = [ents[0].e, ents.find((o) => o.e.name !== ents[0].e.name)?.e];
      if (b) return R(`${card(a)}${card(b)}<p><b>${esc(a.name)}</b>: ${esc(describe(a))}</p><p><b>${esc(b.name)}</b>: ${esc(describe(b))}</p>`, { actions: [addBtn(a), addBtn(b)] });
    }
    if (has(/ (pair|goes with|go with|best with|drink with|match|partner) /)) {
      if (e.kind === 'donut') { const p = e.pair || (ATTR.chocolate(e) ? 'Cold brew' : ATTR.fruity(e) ? 'Iced green tea' : 'Iced Spanish Latte'); return R(`<b>${esc(e.name)}</b> goes best with <b>${esc(p)}</b>.`, { actions: [goBtn('drinks', 'See drinks')] }); }
      if (e.kind === 'drink') { const d = e.temp === 'hot' ? DONUTS.find((x) => x.name === 'Caramel Biscuit Crunch') : DONUTS.find((x) => x.name === 'Midnight Marble'); return { ...R(`Try <b>${esc(e.name)}</b> with a <b>${d.name}</b>.`), actions: [addBtn(d)] }; }
    }
    if (has(/ (price|how much|cost) /)) return priceOf(e);
    if (has(/ (filling|inside|what s in|whats in) /) && e.kind === 'donut') return R(`<b>${esc(e.name)}</b> is filled with <b>${esc(e.fill.toLowerCase())}</b>.`, { actions: [addBtn(e)] });
    if (has(/ (allergy|nut|gluten|vegan|dairy|egg|ingredient|halal|calories|sugar) /)) return allergy(e, T);
    return describeE(e);
  }

  // general questions
  if (C.length <= 4 && has(/ (hi|good morning|good afternoon|good evening|good night|sup|whats up) /) && !has(/ (price|open|where|recommend|menu) /)) return R('Hi! I\'m Glazy. What are you craving today?', { chips: ['Best sellers', 'Something chocolatey', 'Are you open now?', 'Free drink deal'] });
  if (has(/ hole /)) return R('No holes here! Every Glaze Bomb donut is <b>filled to the edge</b> with custard, ganache, jam or cream instead. That\'s our whole thing.', { chips: ['Best sellers', 'Fillings?'] });
  if (has(/ (parking|park|car|drive) /) && !has(/ baker park /)) return R('There are <b>20 free spots</b> in the Baker Street lot, a minute from us (free for 30 minutes). Coming by train? Downtown station, exit B, is a 2-minute walk.', { actions: [goBtn('gettinghere', 'Getting here')] });
  if (has(/ (seating|seat|sit|dine|wheelchair|accessible|accessibility|dog|pet|restroom|toilet|pay|payment|cash|card) /)) return R('Good to know:<ul class="cl"><li><b>Seating:</b> 12 window seats and a long counter</li><li><b>Access:</b> step-free entrance and an accessible restroom</li><li><b>Dogs:</b> welcome on the terrace</li><li><b>Paying:</b> card, phone or cash at the counter</li></ul>', { actions: [goBtn('location', 'Location page')] });
  if (has(/ wifi /)) return R(`The website doesn't mention wifi, so it's best to ask at the counter. We're at <b>${ADDRESS}</b>.`, { actions: [goBtn('location', 'Location page')] });
  if (has(/ (photo|photos|picture|pictures|pics|gallery|images) /) && !has(/ (instagram|tag) /)) return R('Our gallery has the donuts, drinks and boxes, plus spots for the shop and kitchen photos (those are coming soon).', { actions: [goBtn('gallery', 'Open the gallery')] });
  if (has(/ thanks /)) return R('You are welcome! Anything else? I can also add things to your order.', { chips: ['Best sellers', 'My order'] });
  if (has(/ bye /)) return R('Bye for now, see you at the counter!');
  if (has(/ (bot|who are you|your name|are you real|are you human) /)) return R('I\'m <b>Glazy</b>, the Glaze Bomb assistant. I know everything on this website: every donut, drink, combo and box, prices, fillings, hours and where to find us. I can also add things to your order.');
  if (has(/ joke /)) return R(JOKES[(Math.random() * JOKES.length) | 0]);
  if (has(/ (hours|open|close|what time|until when|today|tomorrow|weekend|weekday) /) && !has(/ (menu|order) /)) return R(`${has(/ weekend /) ? '<p>On <b>Saturday and Sunday</b> we are open <b>7:00 AM - 1:00 PM</b>.</p>' : has(/ weekday /) ? '<p>On <b>weekdays</b> we are open <b>6:00 AM - 2:00 PM</b>.</p>' : ''}${openInfo()}${hoursTable}<p>We bake from 6 AM and often sell out early, so come in the morning for the full range.</p>`, { actions: [goBtn('visit', 'Visit us')] });
  if (has(/ (where|location|visit|how to get|how do i get|directions|map) /)) return R(`You'll find us at <b>${ADDRESS}</b>, on the corner of Baker Street, 2 minutes from Downtown station. ${openInfo()}`, { actions: [goBtn('location', 'Map & directions')] });
  if (has(/ (delivery|pickup|pick up|deliver) /)) return R('You can <b>pick up</b> at the counter or get it <b>delivered</b>. For a dozen or more, order a day ahead so we can bake it fresh for you.', { actions: [goBtn('boxes', 'See boxes')] });
  if (has(/ (phone|contact|email|reach|message|talk to|call) /) && !has(/ newsletter /)) return R(`Call <b>(555) 010-4242</b> or email <b>hello@glazebomb.example</b> (placeholders on this concept site). You can also visit us at <b>${ADDRESS}</b> or ask me here.`, { actions: [goBtn('location', 'Location page'), goBtn('social', 'Our socials')] });
  if (has(/ (instagram|facebook|tiktok|youtube|social|follow|tag) /)) return R(`We're <b>@glazebomb</b> on ${SOCIAL.map((s) => `<a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.name}</a>`).join(', ')}. New flavors drop there first. Tag <b>#GlazeBomb</b> to be featured.`, { actions: [goBtn('social', 'See the photo wall')] });
  if (has(/ (newsletter|sign up|signup|mailing|email list) /)) return R('Sign up at the bottom of any page under <b>Get new flavors by email</b>. (This is a concept website, so no emails are sent yet.)');
  if (has(/ (allergy|nut|gluten|vegan|vegetarian|dairy|lactose|egg|halal|calories|sugar|ingredient) /)) return allergy(null, T);
  if (has(/ (how (are|do you|is it) (they )?made|process|bake|baked|fry|fried|fresh|knead|dough) /)) return R('Every donut goes through five steps, by hand, every morning:<ul class="cl"><li><b>2:00 AM</b> mix &amp; knead brioche with real butter, milk and eggs</li><li><b>Overnight</b> slow rise for a light, fluffy inside</li><li><b>5:00 AM</b> fry golden, 90 seconds per side</li><li><b>5:30 AM</b> fill with custard, ganache, jam or ube</li><li><b>6:00 AM</b> glaze by hand and top</li></ul>', { actions: [goBtn('process', 'How we make them')] });
  if (has(/ free /) || (has(/ drink /) && has(/ box /))) return R(`<b>Every box comes with 1 free drink.</b> Pick from ${list(FREE_DRINKS.map((d) => d.name))}. It's added automatically when you add a box.`, { actions: [goBtn('boxes', 'See boxes'), goBtn('box6', 'Fill a box of 6')] });
  if (has(/ combo /)) return { ...cards(COMBO_ITEMS, '<p>Ready-made pairings of a drink and donuts:</p>', 3), actions: [...COMBO_ITEMS.map((c) => ({ label: `Add ${c.name}`, run: () => doAdd(c) })), goBtn('combos', 'See combos')] };
  const ppl = (() => { const m = T.match(/ (\d{1,4}) (people|pax|persons|guests|kids|employees|staff|of us) /) || (has(/ party /) && T.match(/ (\d{2,4}) /)); return m ? +m[1] : 0; })();
  if (ppl >= 6) { const b24 = Math.floor(ppl / 24), rest = ppl - b24 * 24, b12 = rest > 12 ? 1 : 0, rest2 = rest - b12 * 12, b6 = rest2 > 6 ? 0 : rest2 > 0 ? 1 : 0, x12 = rest2 > 6 ? 1 : 0; const parts = [b24 && `${b24} x box of 24`, (b12 + x12) && `${b12 + x12} x box of 12`, b6 && `${b6} x box of 6`].filter(Boolean); return R(`For <b>${ppl} people</b> (one donut each) I'd go with <b>${list(parts)}</b>. Each box comes with a free drink, and for 12 or more please order a day ahead.`, { actions: [goBtn('boxes', 'See box prices')] }); }
  if (has(/ (box|dozen|party|bulk|12|24) /)) return R(`Boxes come in <b>6, 12 or 24</b>, and every box includes a <b>free drink</b>:<ul class="cl">${BOXES.map((b) => `<li><b>${b.kind}</b> (${b.note.toLowerCase()}): ${money(b.prices[6])} / ${money(b.prices[12])} / ${money(b.prices[24])}</li>`).join('')}</ul>Or hand-pick 6 on the home page and save 10%. For 12 or 24, order a day ahead.`, { actions: [goBtn('boxes', 'See boxes'), goBtn('box6', 'Pick my own 6')] });
  if (has(/ deal /) || has(/ (save|saving) /)) return R('Current deals:<ul class="cl"><li><b>1 free drink</b> with every box</li><li><b>10% off</b> when you hand-pick a box of 6</li><li><b>Combos</b> from $8.90 (drink + donuts)</li></ul>', { actions: [goBtn('boxes', 'Boxes'), goBtn('combos', 'Combos')] });
  if (has(/ (build|make my own|create|design) /)) return R('In the <b>donut lab</b> you pick 5 things and watch your donut change in 3D: <b>dough</b> (classic, cocoa or matcha), <b>filling</b> (custard, ganache, strawberry jam, ube), <b>glaze</b> (8 colors, plus marble, sesame dust or crumb coat), <b>topping</b> and <b>drizzle</b>. Prices start at $2.90.', { actions: [goBtn('build', 'Open the donut lab')] });
  if (has(/ filling /)) return R('All our donuts are <b>filled to the edge</b>. Fillings include vanilla custard, chocolate ganache, strawberry jam, ube halaya, mango cream, hazelnut cream, cream cheese, mascarpone, brown sugar custard and more. In <b>Build your own</b> you choose from custard, ganache, strawberry jam or ube.', { actions: [goBtn('build', 'Build my own')] });
  if (has(/ cheapest /)) { const l = (has(/ (drink|coffee|tea|latte|iced) /) ? [...DRINK_ITEMS] : has(/ donut /) ? [...DONUTS] : [...DONUTS, ...DRINK_ITEMS]).sort((a, b) => a.price - b.price); return cards(l.slice(0, 3), `<p>The most affordable: <b>${esc(l[0].name)}</b> at ${money(l[0].price)}.</p>`, 3); }
  if (has(/ (expensive|most premium|fanciest) /)) { const l = [...DONUTS].sort((a, b) => b.price - a.price); return cards(l.slice(0, 3), `<p>Our most indulgent donut is <b>${esc(l[0].name)}</b> at ${money(l[0].price)}.</p>`, 3); }
  if (has(/ (new|latest|newest) /)) { const l = DONUTS.filter((d) => d.tag === 'New'); return cards(l.length ? l : DONUTS.slice(0, 2), '<p>New on the menu:</p>'); }
  if (has(/ signature /)) return { ...cards(DONUTS.filter((d) => d.cat === 'Signature'), '<p>Our 6 signature best sellers:</p>', 6), actions: [goBtn('signature', 'See them in 3D')] };
  if (has(/ premium /) && !has(/ box /)) return { ...cards(DONUTS.filter((d) => d.cat !== 'Classic' && d.cat !== 'Box of 6 flavor'), `<p>${PREMIUM.length} premium donuts, from $3.40 to $3.90. A few:</p>`, 4), actions: [goBtn('premium', 'See all premium')] };
  if (has(/ classic /)) return { ...cards(DONUTS.filter((d) => d.cat === 'Classic'), `<p>${CLASSIC.length} classic donuts, from $2.50 to $2.90. A few:</p>`, 4), actions: [goBtn('classic', 'See all classics')] };
  const attrs = attrsOf(C, T);
  if (has(/ (drink|coffee|tea|latte|beverage|espresso) /) && !attrs.filter((a) => a !== 'coffee' && a !== 'tea').length && !has(/ recommend /)) return drinksList(T);
  if (attrs.length || has(/ (recommend|best|popular|favorite|bestseller|should i|what to get|try|good|suggest|surprise) /)) return recommend(attrs, T);
  if (has(/ (menu|what do you (have|sell|offer)|options|flavor|list|everything) /)) return R(`Here's everything we make:<ul class="cl"><li><b>${PREMIUM.length} premium donuts</b> ($3.40 - $3.90)</li><li><b>${CLASSIC.length} classic donuts</b> ($2.50 - $2.90)</li><li><b>12 drinks</b>, hot and iced</li><li><b>3 combos</b> and <b>boxes</b> of 6, 12 or 24 with a free drink</li></ul>`, { actions: [goBtn('premium', 'Open the full menu'), goBtn('signature', 'Best sellers')] });
  if (has(/ review /)) return R('Customers love the filling that goes all the way to the edge, the Mango Graham ("tastes like a summer holiday") and Midnight Marble ("beautiful and not too sweet"). Come early, we really do sell out.', { actions: [goBtn('reviews', 'Read the reviews')] });
  if (has(/ (about|story|concept|real|website|this site) /)) return R('Glaze Bomb makes filled brioche donuts, glazed by hand and made fresh every morning. This is a concept website: you can browse, build and add to an order, but orders and sign-ups are not processed.');
  if (has(/ (hi|good morning|good afternoon|good evening|sup|whats up) /)) return R('Hi! I\'m Glazy. What are you craving today?', { chips: ['Best sellers', 'Something chocolatey', 'Are you open now?', 'Free drink deal'] });
  const doc = search(C);
  if (doc) return R(`I think you're asking about <b>${ROUTES[doc][2]}</b>. Here's where to find it.`, { actions: [goBtn(doc, `Go to ${ROUTES[doc][2]}`)] });
  return R('Sorry, I didn\'t quite get that. I can help with flavors, prices, drinks, boxes, combos, opening hours, location and your order. Try one of these:', { chips: ['Best sellers', 'Price of Midnight Marble', 'Are you open now?', 'Free drink deal', 'Something chocolatey'] });
}
function allergy(e, T) {
  const nutty = DONUTS.filter((d) => ATTR.nut(d)).map((d) => d.name);
  let html = 'Our brioche dough is made with <b>wheat, butter, milk and eggs</b>, so our donuts are not vegan or gluten-free. ';
  if (e && e.kind === 'donut') html = `<b>${esc(e.name)}</b>: brioche dough (wheat, butter, milk, eggs), ${esc(e.fill.toLowerCase())} filling, so it is <b>not vegan or gluten-free</b>. ${ATTR.nut(e) ? 'It <b>contains nuts</b>.' : 'No nuts in the recipe.'} `;
  else if (e && e.kind === 'drink') html = `<b>${esc(e.name)}</b> is made with ${/americano|brew/i.test(e.name) ? 'espresso or coffee and water, no milk' : 'milk'}. Ask at the counter if you need a dairy-free option. `;
  else if (/ nut /.test(T)) html += `Donuts with nuts: ${esc(list(nutty))}. `;
  if (/ (calories|sugar|halal) /.test(T)) html += 'Calorie, sugar and halal details are not listed on the website. ';
  return R(html + 'Everything is made in the same kitchen, so if you have an allergy please check with us at the counter.');
}

/* ======================= navigation from chat ======================= */
function go(key) {
  const [page, id] = ROUTES[key] || ROUTES.premium;
  const here = location.pathname.split('/').pop() || 'index.html', el = document.getElementById(id);
  if (page === here && el) { closeChat(matchMedia('(max-width: 640px)').matches); scrollToTarget(id === 'top' ? 0 : el); }
  else location.href = page + (id === 'top' ? '' : '#' + id);
  return null;
}

/* ======================= UI ======================= */
const ICON = '<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="38" rx="27" ry="19" fill="#cf914c"/><ellipse cx="32" cy="40" rx="26" ry="4" fill="#f7e2bd" opacity=".8"/><path d="M7 33c0-11 11-19 25-19s25 8 25 19c-4 3-6-1-9 2s-2 7-6 7-4-5-8-5-4 6-8 5-3-6-7-5-4 2-6-1-6 0-6-3z" fill="#ff6a13"/><circle cx="25" cy="27" r="3" fill="#3a1e10"/><circle cx="39" cy="27" r="3" fill="#3a1e10"/><path d="M27 33q5 4 10 0" stroke="#3a1e10" stroke-width="2.4" fill="none" stroke-linecap="round"/><ellipse cx="20" cy="21" rx="5" ry="2.2" fill="#fff" opacity=".5" transform="rotate(-18 20 21)"/></svg>';
let panel, log, chipsEl, input, fab, opened = false;
const STORE = 'gb-chat';
const history = (() => { try { return JSON.parse(sessionStorage.getItem(STORE)) || []; } catch { return []; } })();
const persist = () => { try { sessionStorage.setItem(STORE, JSON.stringify(history.slice(-30))); } catch { /* storage off */ } };

function bubble(who, html, actions, restore) {
  const m = document.createElement('div');
  m.className = 'msg msg--' + who;
  m.innerHTML = (who === 'bot' ? `<span class="msg__av">${ICON}</span>` : '') + `<div class="msg__b">${html}</div>`;
  if (actions?.length) {
    const row = document.createElement('div'); row.className = 'msg__acts';
    actions.forEach((a) => { const b = document.createElement('button'); b.type = 'button'; b.innerHTML = a.label; b.addEventListener('click', () => { const r = a.run(); if (r) reply(r); }); row.appendChild(b); });
    m.querySelector('.msg__b').appendChild(row);
  }
  log.appendChild(m);
  if (!restore && !reduce) gsap.fromTo(m, { y: 14, opacity: 0, scale: 0.97 }, { y: 0, opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(1.8)' });
  log.scrollTop = log.scrollHeight;
  if (!restore) { history.push({ who, html }); persist(); }
}
function setChips(list) {
  chipsEl.innerHTML = '';
  (list || ['Best sellers', 'Are you open now?', 'Free drink deal', 'Something chocolatey', 'Build my own', 'My order']).forEach((c) => {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = c; b.addEventListener('click', () => send(c)); chipsEl.appendChild(b);
  });
}
function reply(r) {
  const typing = document.createElement('div'); typing.className = 'msg msg--bot msg--typing';
  typing.innerHTML = `<span class="msg__av">${ICON}</span><div class="msg__b"><i></i><i></i><i></i></div>`;
  log.appendChild(typing); log.scrollTop = log.scrollHeight;
  const delay = reduce ? 0 : Math.min(950, 320 + r.html.length * 1.4);
  setTimeout(() => { typing.remove(); bubble('bot', r.html, r.actions); if (r.chips) setChips(r.chips); }, delay);
}
function send(text) {
  const t = String(text || '').trim(); if (!t) return;
  bubble('me', esc(t));
  let r;
  try { r = answer(t); } catch (err) { console.warn(err); r = R('Oops, I tripped over a sprinkle. Could you ask that another way?'); }
  reply(r);
}
function openChat() {
  if (opened) return; opened = true;
  panel.classList.add('is-open'); panel.setAttribute('aria-hidden', 'false'); fab.setAttribute('aria-expanded', 'true'); fab.classList.add('is-hidden');
  if (!reduce) gsap.fromTo(panel, { y: 30, opacity: 0, scale: 0.94 }, { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(1.6)' });
  if (matchMedia('(max-width: 640px)').matches) lenis?.stop();
  if (!log.children.length) {
    bubble('bot', 'Hi, I\'m <b>Glazy</b>, the Glaze Bomb assistant. Ask me anything about our donuts, drinks, prices, boxes or opening hours. Typos are fine. I can also add things to your order.');
    setChips();
  }
  setTimeout(() => input.focus({ preventScroll: true }), 200);
  $('.chat-nudge')?.remove();
}
function closeChat(silent) {
  if (!opened) return; opened = false;
  panel.classList.remove('is-open'); panel.setAttribute('aria-hidden', 'true'); fab.setAttribute('aria-expanded', 'false'); fab.classList.remove('is-hidden');
  if (!$('#drawer')?.classList.contains('is-open')) lenis?.start();
  if (!silent) fab.focus({ preventScroll: true });
}

export function initChat() {
  fab = document.createElement('button');
  fab.className = 'chat-fab'; fab.type = 'button'; fab.setAttribute('aria-label', 'Chat with Glazy, our assistant'); fab.setAttribute('aria-expanded', 'false'); fab.setAttribute('aria-controls', 'chatPanel');
  fab.innerHTML = `<span class="chat-fab__icon">${ICON}</span><span class="chat-fab__label">Ask Glazy</span>`;
  panel = document.createElement('section');
  panel.className = 'chat'; panel.id = 'chatPanel'; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Chat with Glazy'); panel.setAttribute('aria-hidden', 'true');
  panel.innerHTML = `<header class="chat__head"><span class="chat__avatar">${ICON}</span><div><b>Glazy</b><small><i></i>Online &middot; knows the whole menu</small></div><button class="chat__x" type="button" aria-label="Close chat">&times;</button></header>
    <div class="chat__log" id="chatLog" data-lenis-prevent aria-live="polite"></div>
    <div class="chat__chips" id="chatChips" data-lenis-prevent></div>
    <form class="chat__form" id="chatForm"><input id="chatInput" type="text" autocomplete="off" maxlength="300" placeholder="Ask about flavors, prices, hours..." aria-label="Type your question"><button type="submit" aria-label="Send"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h14M12 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></form>`;
  document.body.append(fab, panel);
  log = $('#chatLog', panel); chipsEl = $('#chatChips', panel); input = $('#chatInput', panel);
  history.forEach((h) => bubble(h.who, h.html, null, true));
  if (history.length) setChips();
  fab.addEventListener('click', openChat);
  $('.chat__x', panel).addEventListener('click', () => closeChat());
  $('#chatForm', panel).addEventListener('submit', (ev) => { ev.preventDefault(); const v = input.value; input.value = ''; send(v); });
  addEventListener('keydown', (ev) => { if (ev.key === 'Escape' && opened) closeChat(); });
  // show the launcher after the intro, then a one-time nudge
  afterIntro(() => {
    fab.classList.add('is-in');
    // tucks away while you scroll down, and on phones while the home hero buttons are on screen (it would cover them)
    let fy = scrollY, nearCtas = false, down = false;
    const tuck = () => fab.classList.toggle('is-tucked', (down || nearCtas) && !panel.classList.contains('is-open'));
    addEventListener('scroll', () => { const y = scrollY, d = y - fy; if (Math.abs(d) < 8) return; down = d > 0 && y > 300; fy = y; tuck(); }, { passive: true });
    const ctas = $('.hero__ctas');
    if (ctas && matchMedia('(max-width: 760px)').matches) new IntersectionObserver(([en]) => { nearCtas = en.isIntersecting; tuck(); }).observe(ctas);
    if (!reduce) gsap.fromTo(fab, { scale: 0, rotation: -40 }, { scale: 1, rotation: 0, duration: 0.7, ease: 'back.out(2)', delay: 0.6, clearProps: 'transform' });
    let nudged = false; try { nudged = sessionStorage.getItem('gb-chat-nudge'); } catch { /* storage off */ }
    if (!nudged && !history.length) setTimeout(() => {
      if (opened) return;
      const n = document.createElement('button'); n.type = 'button'; n.className = 'chat-nudge'; n.textContent = 'Need help choosing? Ask me!';
      n.addEventListener('click', () => { n.remove(); openChat(); });
      document.body.appendChild(n);
      if (!reduce) gsap.fromTo(n, { y: 12, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(2)' });
      setTimeout(() => n.isConnected && gsap.to(n, { opacity: 0, y: 8, duration: 0.3, onComplete: () => n.remove() }), 7000);
      try { sessionStorage.setItem('gb-chat-nudge', '1'); } catch { /* storage off */ }
    }, 6000);
  });
}
// for tests: ask without the UI
window.__gbAsk = (q) => { const r = answer(q); return r.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); };
