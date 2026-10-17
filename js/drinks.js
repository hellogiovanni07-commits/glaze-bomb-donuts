// Glaze Bomb — procedural 3D drinks (hot paper cups, iced clear cups) and the box + free drink combo
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const TAU = Math.PI * 2;
// combo scene layout, centred on x = 0: box on the left, the free drink on the right
const BOX_X = -0.95, CUP_X = 1.85, CUP_Z = 0.45;
const COMBO_BOUNDS = new THREE.Box3(new THREE.Vector3(BOX_X - 1.8, 0, -1.55), new THREE.Vector3(CUP_X + 0.62, 2.55, 1.45));
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;   // still scenes for people who asked for less motion
const V2 = (x, y) => new THREE.Vector2(x, y);
const ease = (t) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
const back = (t) => { t = Math.min(1, Math.max(0, t)); const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };

/* ---------- shared textures ---------- */
function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
const texCache = {};
function cupTexture(base, motif) {
  const key = base + motif;
  if (texCache[key]) return texCache[key];
  const W = 1024, H = 512, c = canvas(W, H), x = c.getContext('2d');
  x.fillStyle = base; x.fillRect(0, 0, W, H);
  const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(255,255,255,.08)'); g.addColorStop(1, 'rgba(0,0,0,.08)');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  // swirl motif printed twice around the cup (like the reference cups)
  x.strokeStyle = motif; x.lineCap = 'round';
  for (const cx of [W * 0.25, W * 0.75]) {
    for (const [dx, dy, r] of [[0, 0, 58], [-70, 92, 40], [64, 104, 46], [-40, -96, 34], [72, -80, 30]]) {
      for (let k = 0; k < 3; k++) { const rr = r - k * 14; if (rr < 5) break; x.lineWidth = 7; x.beginPath(); x.arc(cx + dx, H * 0.48 + dy, rr, 0.4, TAU - 0.2); x.stroke(); }
    }
    x.fillStyle = motif; x.font = '800 38px "Plus Jakarta Sans", Inter, sans-serif'; x.textAlign = 'center';
    x.fillText('glaze bomb', cx, H * 0.93);
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return (texCache[key] = t);
}
function softDisc(color = '70,30,5', a = 0.45) {
  const c = canvas(128, 128), x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, `rgba(${color},${a})`); g.addColorStop(1, `rgba(${color},0)`);
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

/* ---------- cup builders ---------- */
const HOT_PROFILE = (() => { const p = [V2(0, 0), V2(0.4, 0), V2(0.42, 0.03)]; for (let i = 1; i <= 20; i++) { const y = 0.03 + (i / 20) * 1.52; p.push(V2(0.42 + (y / 1.55) * 0.14, y)); } return p; })();
const LID_PROFILE = [V2(0, 1.74), V2(0.34, 1.74), V2(0.4, 1.72), V2(0.44, 1.69), V2(0.5, 1.68), V2(0.58, 1.66), V2(0.61, 1.62), V2(0.6, 1.57), V2(0.57, 1.55)];
const ICED_R = (y) => 0.39 + (y / 1.6) * 0.15;

function hotCup(d) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.LatheGeometry(HOT_PROFILE, 64), new THREE.MeshStandardMaterial({ map: cupTexture(d.cup, d.motif), roughness: 0.62 }));
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.565, 0.022, 10, 64), new THREE.MeshStandardMaterial({ color: d.cup, roughness: 0.5 }));
  rim.rotation.x = Math.PI / 2; rim.position.y = 1.56;
  const lidMat = new THREE.MeshPhysicalMaterial({ color: d.lid, roughness: 0.38, clearcoat: 0.6 });
  const lid = new THREE.Mesh(new THREE.LatheGeometry(LID_PROFILE, 64), lidMat);
  const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 24), new THREE.MeshStandardMaterial({ color: '#120c08' }));
  hole.scale.set(1.6, 1, 0.7); hole.position.set(0, 1.745, 0.3);
  g.add(body, rim, lid, hole);
  g.userData.hot = true;
  return g;
}
function icedCup(d) {
  const g = new THREE.Group();
  const clear = new THREE.MeshPhysicalMaterial({ color: '#ffffff', transparent: true, opacity: 0.2, roughness: 0.06, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false });
  const prof = []; for (let i = 0; i <= 16; i++) { const y = (i / 16) * 1.6; prof.push(V2(ICED_R(y) + 0.012, y)); }
  const cup = new THREE.Mesh(new THREE.LatheGeometry([V2(0, 0.001), ...prof], 64), clear);
  cup.renderOrder = 2;
  // layered drink
  let y0 = 0.04; const top = d.whip ? 1.5 : 1.32;
  for (const [col, frac] of d.liquid) {
    const y1 = y0 + (top - 0.04) * frac;
    const pts = [V2(0, y0), V2(ICED_R(y0) - 0.01, y0), V2(ICED_R(y1) - 0.01, y1), V2(0, y1)];
    const layer = new THREE.Mesh(new THREE.LatheGeometry(pts, 48), new THREE.MeshPhysicalMaterial({ color: col, roughness: 0.25, clearcoat: 0.4 }));
    g.add(layer); y0 = y1;
  }
  if (d.ice) {
    const iceMat = new THREE.MeshPhysicalMaterial({ color: '#f2f8ff', transparent: true, opacity: 0.55, roughness: 0.05, clearcoat: 1 });
    const geo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    [[0.15, 0.05], [-0.18, 0.12], [0.02, -0.2], [-0.05, 0.22], [0.22, -0.12]].forEach(([x, z], i) => {
      const m = new THREE.Mesh(geo, iceMat); m.position.set(x, top - 0.06 + (i % 2) * 0.05, z); m.rotation.set(i, i * 1.7, i * 0.6); g.add(m);
    });
  }
  if (d.foam) { const f = new THREE.Mesh(new THREE.CylinderGeometry(ICED_R(top) - 0.012, ICED_R(top) - 0.012, 0.08, 48), new THREE.MeshStandardMaterial({ color: d.foam, roughness: 0.8 })); f.position.y = top + 0.04; g.add(f); }
  if (d.whip) {
    const wm = new THREE.MeshStandardMaterial({ color: '#fffaf2', roughness: 0.7 });
    for (let i = 0; i < 9; i++) { const a = (i / 9) * TAU, r = i === 8 ? 0 : 0.26; const s = new THREE.Mesh(new THREE.SphereGeometry(0.2 - (i === 8) * 0.02, 20, 14), wm); s.position.set(Math.cos(a) * r, top + 0.14 + (i === 8 ? 0.16 : 0), Math.sin(a) * r); g.add(s); }
    const dr = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.025, 8, 40), new THREE.MeshPhysicalMaterial({ color: '#8a4b1f', roughness: 0.2, clearcoat: 1 }));
    dr.rotation.x = Math.PI / 2; dr.position.y = top + 0.3; g.add(dr);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(ICED_R(1.6) + 0.02, 48, 16, 0, TAU, 0, Math.PI / 2), clear); dome.position.y = 1.6; dome.scale.y = 0.85; dome.renderOrder = 3; g.add(dome);
  } else {
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(ICED_R(1.6) + 0.03, ICED_R(1.6) + 0.03, 0.05, 48), clear); lid.position.y = 1.62; lid.renderOrder = 3; g.add(lid);
  }
  const straw = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.0, 16), new THREE.MeshStandardMaterial({ color: d.straw || '#3a1e10', roughness: 0.4 }));
  straw.position.set(0.12, 1.55, 0.05); straw.rotation.z = -0.13; g.add(straw);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(ICED_R(1.6) + 0.012, 0.018, 8, 64), clear); rim.rotation.x = Math.PI / 2; rim.position.y = 1.6; g.add(rim);
  g.add(cup);
  return g;
}
export function buildCup(d) { return d.temp === 'hot' ? hotCup(d) : icedCup(d); }

/* ---------- donut box for the combo ---------- */
function printTex(w, h, draw) { const c = canvas(w, h); draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
const BRAND = '"Plus Jakarta Sans", Inter, sans-serif';
function boxSide(x, w, h) {   // outside print: logo, tagline and a row of little donuts
  x.fillStyle = '#ff6a13'; x.fillRect(0, 0, w, h);
  x.fillStyle = 'rgba(255,255,255,.14)'; for (let i = 0; i < 26; i++) { x.beginPath(); x.arc(20 + i * 40, h - 18, 9, 0, TAU); x.fill(); }
  x.fillStyle = '#fff'; x.textAlign = 'center'; x.font = `800 ${h * 0.4}px ${BRAND}`; x.fillText('GLAZE BOMB', w / 2, h * 0.52);
  x.font = `600 ${h * 0.15}px Inter, sans-serif`; x.fillText('filled donuts  ·  fresh daily', w / 2, h * 0.76);
}
function donutBox(flavors, model) {
  const g = new THREE.Group();
  const W = 2.5, D = 1.7, Hh = 0.46, t = 0.04;
  const out = new THREE.MeshStandardMaterial({ color: '#ff6a13', roughness: 0.62 });
  const inn = new THREE.MeshStandardMaterial({ color: '#fbeedd', roughness: 0.85 });
  const front = new THREE.MeshStandardMaterial({ map: printTex(1024, 188, boxSide), roughness: 0.6 });
  const floor = new THREE.Mesh(new THREE.BoxGeometry(W, t, D), inn); floor.position.y = t / 2; g.add(floor);
  // material order: +x, -x, +y, -y, +z, -z
  const wall = (w, d, x, z, mats) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, Hh, d), mats); m.position.set(x, Hh / 2, z); g.add(m); };
  wall(W, t, 0, D / 2, [out, out, inn, inn, front, inn]);
  wall(W, t, 0, -D / 2, [out, out, inn, inn, inn, out]);
  wall(t, D, W / 2, 0, [out, inn, inn, inn, out, out]);
  wall(t, D, -W / 2, 0, [inn, out, inn, inn, out, out]);
  // lid: logo outside, a hand-written note inside; hinged at the back, it swings open when the scene starts
  const lidOut = printTex(1024, 696, (x, w, h) => {
    x.fillStyle = '#ff6a13'; x.fillRect(0, 0, w, h);
    x.strokeStyle = 'rgba(255,255,255,.4)'; x.lineWidth = 14; x.strokeRect(26, 26, w - 52, h - 52);
    x.fillStyle = '#fff'; x.textAlign = 'center'; x.font = `800 128px ${BRAND}`; x.fillText('Glaze Bomb', w / 2, h * 0.53);
    x.font = `600 46px Inter, sans-serif`; x.fillText('filled donuts · fresh daily', w / 2, h * 0.68);
  });
  const lidIn = printTex(1024, 696, (x, w, h) => {
    x.fillStyle = '#fbeedd'; x.fillRect(0, 0, w, h);
    x.fillStyle = 'rgba(255,106,19,.08)'; for (let i = 0; i < 9; i++) for (let j = 0; j < 6; j++) { x.beginPath(); x.arc(70 + i * 112, 70 + j * 112, 18, 0, TAU); x.fill(); }
    x.fillStyle = '#e85706'; x.textAlign = 'center'; x.font = '700 104px Caveat, "Segoe Script", cursive';
    x.fillText('Made fresh this morning ♥', w / 2, h * 0.5);
    x.font = `800 44px ${BRAND}`; x.fillStyle = '#3a1e10'; x.fillText('GLAZE BOMB', w / 2, h * 0.7);
  });
  const hinge = new THREE.Group(); hinge.position.set(0, Hh, -D / 2); g.add(hinge);
  const lid = new THREE.Mesh(new THREE.BoxGeometry(W, t, D), [out, out, new THREE.MeshStandardMaterial({ map: lidOut, roughness: 0.55 }), new THREE.MeshStandardMaterial({ map: lidIn, roughness: 0.8 }), out, out]);
  lid.position.set(0, 0, D / 2); hinge.add(lid); hinge.rotation.x = 0;
  // six paper liners + six donuts; the donuts are the real model (made one per frame, as they drop in)
  const liner = new THREE.MeshStandardMaterial({ color: '#fffaf3', roughness: 0.92, side: THREE.DoubleSide });
  const donuts = [];
  flavors.slice(0, 6).forEach((f, i) => {
    const x = ((i % 3) - 1) * 0.78, z = (Math.floor(i / 3) - 0.5) * 0.78;
    const cup = new THREE.Mesh(LINER(), liner); cup.position.set(x, t + 0.05, z); g.add(cup);
    const base = new THREE.Mesh(new THREE.CircleGeometry(0.31, 40), liner); base.rotation.x = -Math.PI / 2; base.position.set(x, t + 0.002, z); g.add(base);
    const holder = new THREE.Group(); holder.position.set(x, 3, z); holder.visible = false;
    holder.userData = { y: t + 0.115, t: -0.55 - i * 0.16, rot: i * 1.3 - 0.6, f, built: false };
    g.add(holder); donuts.push(holder);
  });
  g.userData = { hinge, donuts, model, lidT: 0 };
  return g;
}
// the same box, lid open and all six donuts in place (for the pre-rendered cart / chat pictures)
export function staticBox(flavors, model, lid = -1.95) {
  const g = donutBox(flavors, model), B = g.userData;
  B.hinge.rotation.x = lid;
  for (const d of B.donuts) {
    const u = d.userData; let m = null;
    if (model) { m = model(u.f); m.rotation.x = -Math.PI / 2; m.scale.setScalar(0.265); }
    d.add(m || sphereDonut(u.f)); d.visible = true; d.position.y = u.y; d.rotation.y = u.rot; u.built = true;
  }
  return g;
}
let linerGeo = null;
function LINER() {   // fluted paper cup
  if (linerGeo) return linerGeo;
  const geo = new THREE.CylinderGeometry(0.4, 0.31, 0.1, 96, 1, true), pa = geo.attributes.position;
  for (let i = 0; i < pa.count; i++) { const x = pa.getX(i), z = pa.getZ(i), k = 1 + 0.04 * Math.sin(Math.atan2(z, x) * 30); pa.setX(i, x * k); pa.setZ(i, z * k); }
  geo.computeVertexNormals();
  return (linerGeo = geo);
}
function sphereDonut(f) {   // fallback if the real model is not available
  const g = new THREE.Group(), dg = new THREE.SphereGeometry(0.34, 32, 18); dg.scale(1, 0.46, 1);
  const cg = new THREE.SphereGeometry(0.348, 32, 14, 0, TAU, 0, 1.05); cg.scale(1, 0.48, 1);
  g.add(new THREE.Mesh(dg, new THREE.MeshStandardMaterial({ color: '#cf914c', roughness: 0.8 })), new THREE.Mesh(cg, new THREE.MeshPhysicalMaterial({ color: f.glaze || '#fbf4ea', roughness: 0.3, clearcoat: 0.8 })));
  return g;
}

/* ---------- scene ---------- */
export class DrinkScene {
  constructor(host, { mode = 'bar', onSelect, donutModel = null } = {}) {
    this.host = host; this.mode = mode; this.onSelect = onSelect; this.donutModel = donutModel;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    host.appendChild(this.renderer.domElement);
    this.scene = new THREE.Scene();
    this.scene.environment = new THREE.PMREMGenerator(this.renderer).fromScene(new RoomEnvironment(), 0.04).texture;
    const key = new THREE.DirectionalLight(0xfff0dc, 2); key.position.set(3, 6, 6); this.scene.add(key);
    const rim = new THREE.DirectionalLight(0xffc890, 1.2); rim.position.set(-5, 3, -4); this.scene.add(rim);
    this.scene.add(new THREE.HemisphereLight(0xfff6ea, 0xd8a070, 0.5));
    this.camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
    this.root = new THREE.Group(); this.scene.add(this.root);
    this.shadowTex = softDisc();
    this.steamTex = softDisc('255,255,255', 0.5);
    this.items = []; this.sel = 0; this.clock = new THREE.Clock(); this.visible = false; this.mouse = { x: 0, y: 0 };
    if (mode === 'bar') this._makeStage();
    this.ray = new THREE.Raycaster();
    host.addEventListener('pointermove', (e) => { const r = host.getBoundingClientRect(); this.mouse.x = (e.clientX - r.left) / r.width - 0.5; this.mouse.y = (e.clientY - r.top) / r.height - 0.5; });
    host.addEventListener('click', (e) => this._pick(e));
    new ResizeObserver(() => this.resize()).observe(host);
    new IntersectionObserver(([en]) => { this.visible = en.isIntersecting; if (this.visible) { if (!this.seen) { this.seen = true; const q = this.queued; this.queued = null; q?.(); } this._loop(); } }, { rootMargin: '300px' }).observe(host);
    this.resize();
  }
  _makeStage() {
    const top = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.4, 0.3, 96), new THREE.MeshStandardMaterial({ color: '#fbefe2', roughness: 0.6 }));
    top.position.y = -0.15; this.scene.add(top);
    const glow = new THREE.Mesh(new THREE.TorusGeometry(5.22, 0.035, 12, 160), new THREE.MeshBasicMaterial({ color: '#ff7a2a' }));
    glow.rotation.x = Math.PI / 2; this.scene.add(glow);
  }
  _shadow(w = 1.5) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w), new THREE.MeshBasicMaterial({ map: this.shadowTex, transparent: true, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.position.y = 0.01; return m;
  }
  setDrinks(list) {
    if (!this.seen) { this.queued = () => this.setDrinks(list); return; }
    const old = this.items;
    old.forEach((it) => { it.leave = 0; });
    this.leaving = old;
    this.items = list.map((d, i) => {
      const holder = new THREE.Group(), cup = buildCup(d), sh = this._shadow();
      holder.add(sh, cup); this.root.add(holder);
      const n = list.length, k = i - (n - 1) / 2;
      holder.userData = { home: new THREE.Vector3(k * 1.42, 0, -Math.abs(k) * 0.35), t: -i * 0.08, cup, steam: d.temp === 'hot' ? this._steam(holder) : null };
      holder.position.copy(holder.userData.home); holder.position.y = -3; holder.rotation.y = -0.4 + k * 0.1;
      return holder;
    });
    this.sel = Math.min(this.sel, this.items.length - 1);
    this._frame();
    this._loop();
  }
  _steam(holder) {
    const ps = [];
    for (let i = 0; i < 5; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.steamTex, transparent: true, depthWrite: false, opacity: 0 })); s.userData.p = i / 5; holder.add(s); ps.push(s); }
    return ps;
  }
  select(i) { this.sel = i; this._loop(); }
  // flavors: six flavor objects; only the cup is swapped when just the free drink changes
  setCombo(drink, flavors) {
    if (!this.seen) { this.queued = () => this.setCombo(drink, flavors); return; }
    const key = flavors.slice(0, 6).map((f) => f.name || f.glaze).join('|');
    const rebuild = key !== this.comboKey;
    if (rebuild) {
      this.comboKey = key;
      this.root.clear();
      this.box = donutBox(flavors, this.donutModel); this.box.position.set(BOX_X, 0, 0); this.box.scale.setScalar(1.2); this.box.add(this._shadow(4.2));
      this.cupShadow = this._shadow(1.6); this.cupShadow.position.set(CUP_X, 0.01, CUP_Z);
      this.root.add(this._gridFloor(), this.box, this.cupShadow);
      this.cup = null;
    }
    if (this.cup) this.root.remove(this.cup);
    this.cup = buildCup(drink); this.cup.position.set(CUP_X, 3, CUP_Z); this.cup.scale.setScalar(1.0); this.cup.userData.t = rebuild ? 0 : 0.8;   // after a rebuild the cup lands once the donuts are in
    this.root.add(this.cup);
    this.items = [];
    this._frame();
    this._loop();
  }
  _hop() { (this.box?.userData.donuts || []).forEach((d, i) => { if (d.userData.t > 1) d.userData.hop = -i * 0.07; }); if (this.cup) this.cup.userData.wob = 0; }
  _frame() {
    const a = this.camera.aspect || 1;
    if (this.mode === 'bar') {
      const n = Math.max(this.items.length, 1), width = n * 1.42 + 0.6;
      const dist = Math.max(width / (2 * Math.tan(THREE.MathUtils.degToRad(14)) * a), 6.5);
      this.camera.position.set(0, dist * 0.32, dist); this.camera.lookAt(0, 0.85, 0);
    } else {
      this._fitCombo();
    }
  }
  // a subtle graph-paper floor that fades out towards the edges (combo scene)
  _gridFloor() {
    if (!this._gridTex) {
      const W = 1024, H = 1024, c = canvas(W, H), x = c.getContext('2d'), step = 32;
      x.strokeStyle = 'rgba(232, 87, 6, .11)'; x.lineWidth = 1.3;
      for (let i = 0; i <= W; i += step) { x.beginPath(); x.moveTo(i + 0.5, 0); x.lineTo(i + 0.5, H); x.stroke(); x.beginPath(); x.moveTo(0, i + 0.5); x.lineTo(W, i + 0.5); x.stroke(); }
      x.strokeStyle = 'rgba(232, 87, 6, .17)'; x.lineWidth = 1.8;   // a slightly stronger line every 4 squares, like real graph paper
      for (let i = 0; i <= W; i += step * 4) { x.beginPath(); x.moveTo(i + 0.5, 0); x.lineTo(i + 0.5, H); x.stroke(); x.beginPath(); x.moveTo(0, i + 0.5); x.lineTo(W, i + 0.5); x.stroke(); }
      x.globalCompositeOperation = 'destination-in';
      const g = x.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W / 2); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.5, 'rgba(0,0,0,.75)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = g; x.fillRect(0, 0, W, H);
      this._gridTex = new THREE.CanvasTexture(c); this._gridTex.colorSpace = THREE.SRGBColorSpace; this._gridTex.anisotropy = 8;
    }
    const m = new THREE.Mesh(new THREE.PlaneGeometry(13, 13), new THREE.MeshBasicMaterial({ map: this._gridTex, transparent: true, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.position.set((BOX_X + CUP_X) / 2, 0.002, 0.2); m.renderOrder = -1;
    return m;
  }
  // frame the box + cup: find the distance that fits them with a margin, then centre what the camera actually sees
  _fitCombo() {
    const cam = this.camera, a = cam.aspect || 1, el = THREE.MathUtils.degToRad(22);
    const B = COMBO_BOUNDS, pts = [];
    for (const x of [B.min.x, B.max.x]) for (const y of [B.min.y, B.max.y]) for (const z of [B.min.z, B.max.z]) pts.push(new THREE.Vector3(x, y, z));
    const target = B.getCenter(new THREE.Vector3()); target.y *= 0.9;
    const place = (d) => { cam.position.set(target.x, target.y + Math.sin(el) * d, target.z + Math.cos(el) * d); cam.lookAt(target); cam.updateMatrixWorld(); };
    const ext = () => { let x0 = 9, x1 = -9, y0 = 9, y1 = -9; for (const p of pts) { const q = p.clone().project(cam); x0 = Math.min(x0, q.x); x1 = Math.max(x1, q.x); y0 = Math.min(y0, q.y); y1 = Math.max(y1, q.y); } return { x0, x1, y0, y1 }; };
    const fit = () => { let lo = 2, hi = 60; for (let k = 0; k < 26; k++) { const d = (lo + hi) / 2; place(d); const e = ext(); if (e.x0 > -0.84 && e.x1 < 0.84 && e.y0 > -0.8 && e.y1 < 0.8) hi = d; else lo = d; } place(hi); };
    const centre = () => {
      const e = ext(), d = cam.position.distanceTo(target), hh = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * d;
      const right = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0), up = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 1);
      target.addScaledVector(right, ((e.x0 + e.x1) / 2) * hh * a).addScaledVector(up, ((e.y0 + e.y1) / 2) * hh); place(d);
    };
    fit(); centre(); fit(); centre();
  }
  resize() {
    const r = this.host.getBoundingClientRect(); if (!r.width) return;
    this.renderer.setSize(r.width, r.height, false);
    this.camera.aspect = r.width / r.height; this.camera.updateProjectionMatrix(); this._frame();
    if (this.seen) this.renderer.render(this.scene, this.camera);
  }
  _pick(e) {
    if (this.mode === 'combo') { this._hop(); return; }
    if (this.mode !== 'bar' || !this.items.length) return;
    const r = this.host.getBoundingClientRect();
    this.ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), this.camera);
    const hit = this.ray.intersectObjects(this.items, true)[0];
    if (!hit) return;
    let o = hit.object; while (o && !this.items.includes(o)) o = o.parent;
    const i = this.items.indexOf(o); if (i >= 0) { this.sel = i; this.onSelect?.(i); }
  }
  _loop() {
    if (this._raf || !this.visible) return;
    const tick = () => {
      this._raf = 0;
      if (!this.visible) return;
      this._update(); this.renderer.render(this.scene, this.camera);
      this._raf = requestAnimationFrame(tick);
    };
    this._raf = requestAnimationFrame(tick);
  }
  _update() {
    const dt = Math.min(this.clock.getDelta(), 0.05), t = this.clock.elapsedTime;
    this.root.rotation.y += ((this.mouse.x * 0.35) - this.root.rotation.y) * 0.05;
    if (this.mode === 'combo') {
      if (!this.box) return;
      const B = this.box.userData;
      this.box.rotation.y = -0.35 + (REDUCE ? 0 : Math.sin(t * 0.5) * 0.12);
      B.lidT += dt * 1.4; B.hinge.rotation.x = -1.95 * back(B.lidT);   // lid swings open, then the donuts drop in
      for (const d of B.donuts) {
        const u = d.userData; u.t += dt * 1.7;
        if (u.t < 0) continue;
        if (!u.built) {   // build one donut per frame so nothing stalls
          if (this._builtThisFrame) continue;
          this._builtThisFrame = true; u.built = true;
          let m = null;
          try { if (B.model) { m = B.model(u.f); m.rotation.x = -Math.PI / 2; m.scale.setScalar(0.265); } } catch (e) { console.warn(e); }
          d.add(m || sphereDonut(u.f)); d.visible = true;
        }
        const p = Math.min(1, u.t);
        let y = u.y + (1 - p * p) * 1.8, sy = 1;
        if (u.t > 1) { const k = u.t - 1; sy = 1 - 0.16 * Math.exp(-k * 6) * Math.cos(k * 16); }
        if (u.hop !== undefined) { u.hop += dt * 2.4; if (u.hop > 1) u.hop = undefined; else if (u.hop > 0) { y += Math.sin(u.hop * Math.PI) * 0.42; u.rot += dt * 2.4 * TAU; } }
        d.position.y = y; d.scale.set(1 + (1 - sy) * 0.6, sy, 1 + (1 - sy) * 0.6);
        d.rotation.y += ((u.rot + (1 - p) * 2.5) - d.rotation.y) * 0.2;
      }
      this._builtThisFrame = false;
      const c = this.cup.userData; c.t = (c.t ?? 0) + dt * 1.6;
      this.cup.position.y = (1 - back(Math.min(1, Math.max(0, c.t - 0.9)))) * 3 + (REDUCE ? 0 : Math.sin(t * 1.4) * 0.05);
      this.cup.rotation.y = REDUCE ? 0.3 : t * 0.4;
      if (c.wob !== undefined) { c.wob += dt * 2; this.cup.rotation.z = Math.sin(c.wob * 14) * 0.12 * Math.max(0, 1 - c.wob); if (c.wob > 1) { c.wob = undefined; this.cup.rotation.z = 0; } }
      return;
    }
    (this.leaving || []).forEach((h) => { h.userData.leave += dt * 2.4; h.position.y = -ease(h.userData.leave) * 4; if (h.userData.leave > 1) { this.root.remove(h); } });
    if (this.leaving && this.leaving.every((h) => h.userData.leave > 1)) this.leaving = null;
    this.items.forEach((h, i) => {
      const u = h.userData; u.t += dt * 1.6;
      const on = i === this.sel, k = back(u.t);
      const lift = on ? 0.28 + (REDUCE ? 0 : Math.sin(t * 2) * 0.04) : 0;
      h.position.x = u.home.x; h.position.z = u.home.z + (on ? 0.4 : 0);
      h.position.y += ((u.t < 1 ? -3 + 3 * k : 0) + lift - h.position.y) * (u.t < 1 ? 1 : 0.12);
      const s = on ? 1.1 : 1; h.scale.x += (s - h.scale.x) * 0.12; h.scale.y = h.scale.z = h.scale.x;
      if (!REDUCE) u.cup.rotation.y += dt * (on ? 1.1 : 0.15);
      if (u.steam && !REDUCE) u.steam.forEach((sp) => {
        sp.userData.p = (sp.userData.p + dt * 0.35) % 1; const p = sp.userData.p;
        sp.position.set(Math.sin(p * 6 + i) * 0.12, 1.85 + p * 1.1, 0.1); sp.scale.setScalar(0.35 + p * 0.6); sp.material.opacity = Math.sin(p * Math.PI) * 0.55;
      });
    });
  }
}
