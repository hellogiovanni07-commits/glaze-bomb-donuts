// Glaze Bomb — procedural 3D filled donut (no hole), three.js
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const TAU = Math.PI * 2;
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;   // no idle bob or sway for people who asked for less motion
const R = 1.3;     // radius
const H = 0.58;    // top dome height
const HB = 0.42;   // bottom depth (flatter)
const DOUGH_SEG = [180, 110];
const GLAZE_SEG = [288, 150];   // dense so drips and the glaze edge stay smooth

function rng(seed) { let s = (seed >>> 0) || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function hashStr(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return ((h >>> 0) % 9973) + 1; }
function smoothstep(a, b, x) { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
function angDist(a, b) { let d = Math.abs(a - b) % TAU; return d > Math.PI ? TAU - d : d; }
const easeIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export const DOUGH = {
  classic: { top: '#cf914c', band: '#f7e2bd', bottom: '#b4733a' },
  cocoa: { top: '#5a2e1a', band: '#94643f', bottom: '#4a2414' },
  matcha: { top: '#97a24f', band: '#e6eac0', bottom: '#7b853d' },
};

const PARTS = {
  crumbs: { n: 230, geo: 'rock', r: 0.042, colors: ['#1d1210', '#2b1a14', '#3a2419', '#120a08'], size: [0.55, 1.5], rough: 0.95 },
  graham: { n: 420, geo: 'rock', r: 0.028, colors: ['#c98a4b', '#b5763c', '#dca066', '#a86a34'], size: [0.5, 1.3], rough: 0.95 },
  biscuit: { n: 40, geo: 'rock', r: 0.04, colors: ['#c47f3e', '#d8954f', '#b56f31'], size: [0.6, 1.3], rough: 0.85 },
  sesame: { n: 210, geo: 'seed', colors: ['#141414', '#2a2522', '#0c0c0c'], size: [0.8, 1.1], rough: 0.5 },
  sprinkles: { n: 240, geo: 'capsule', colors: ['#ff6b2c', '#ffd23f', '#3ec6ff', '#7cf29c', '#ffffff', '#a974ff'], size: [0.85, 1.1], rough: 0.35 },
  pearls: { n: 110, geo: 'pearl', colors: ['#ffffff', '#fff1e0', '#ffe9c9'], size: [0.8, 1.15], rough: 0.25 },
  almonds: { n: 30, geo: 'sliver', flat: true, colors: ['#e9c995', '#d6a868', '#f1dcb2', '#c9945a'], size: [0.85, 1.15], rough: 0.65 },
  cheese: { n: 70, geo: 'strip', flat: true, colors: ['#ffd75e', '#f2bf34', '#ffe08a', '#ffcb3d'], size: [0.8, 1.2], rough: 0.55 },
  mallows: { n: 22, geo: 'mallow', flat: true, colors: ['#fffaf2', '#fff3e6', '#fffdf8'], size: [0.85, 1.15], rough: 0.85 },
  coconut: { n: 170, geo: 'strand', colors: ['#ffffff', '#fbf6ee'], size: [0.85, 1.2], rough: 0.8 },
  nuts: { n: 60, geo: 'rock', r: 0.046, colors: ['#c8955f', '#a8703f', '#e3b27a'], size: [0.6, 1.3], rough: 0.8 },
  coffeecrumb: { n: 220, geo: 'rock', r: 0.026, colors: ['#5a3420', '#3a2419', '#7a4a2a'], size: [0.5, 1.3], rough: 0.95 },
};

export class DonutScene {
  constructor(canvas) {
    const mobile = Math.min(innerWidth, innerHeight) < 600;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.6 : 1.75));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    this.camera.position.set(0, 0, 8);
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    const key = new THREE.DirectionalLight(0xfff0dc, 2.1); key.position.set(3, 4, 6); this.scene.add(key);
    const fill = new THREE.DirectionalLight(0xffe2c4, 0.7); fill.position.set(-4, 1, 4); this.scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffc890, 1.4); rim.position.set(-4, -3, -4); this.scene.add(rim);
    this.scene.add(new THREE.HemisphereLight(0xfff6ea, 0xd8a070, 0.5));

    // root(pos/scale) > tiltG(view tilt) > flipG(flip anim) > spinG(spin) > meshes
    this.root = new THREE.Group(); this.tiltG = new THREE.Group(); this.flipG = new THREE.Group(); this.spinG = new THREE.Group();
    this.root.add(this.tiltG); this.tiltG.add(this.flipG); this.flipG.add(this.spinG);
    this.scene.add(this.root);
    this._makeShadow();

    this.cache = { dough: {}, glaze: {}, tex: {} };
    this.lumps = (() => { const r = rng(7); return Array.from({ length: 5 }, (_, k) => ({ k: k + 2, a: (r() * 0.02) / (1 + k * 0.4), p: r() * TAU })); })();
    this.flavor = { name: 'Caramel Biscuit Crunch', glaze: '#fbf4ea', pattern: 'plain', dough: 'classic', toppings: ['biscuit', 'cookie'], drizzle: '#9c6a3c', cover: 1.12 };
    this.pour = { value: 1 };
    this._makeMaterials();
    this.dough = new THREE.Mesh(new THREE.BufferGeometry(), this.doughMat);
    this.glaze = new THREE.Mesh(new THREE.BufferGeometry(), this.glazeMat);
    this.spinG.add(this.dough, this.glaze);
    this.extras = new THREE.Group(); this.spinG.add(this.extras);

    this.target = { x: 0, y: 0, s: 1, rx: -0.95, ry: 0 };
    this.cur = { x: 0, y: -3, s: 0.6, rx: -0.95, ry: 0 };
    this.mouse = { x: 0, y: 0 };
    this.spinVel = 0.2; this.autoSpin = 0.2; this.dragSpin = 0; this.rotZ = 0.6;
    this.squash = 0; this.flipT = 1; this.pending = null; this.pourT = 1; this.dropT = -0.4;
    this._apply();
    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  /* ---------------- shape ---------------- */
  _edgeFor(f) {
    const rand = rng(hashStr(f.name || 'custom'));
    const waves = Array.from({ length: 6 }, (_, k) => ({ k: k + 3, a: (rand() * 0.5 + 0.5) / (k + 3), p: rand() * TAU }));
    const drips = Array.from({ length: 6 + Math.floor(rand() * 3) }, () => ({ u: rand() * TAU, w: 0.1 + rand() * 0.1, a: 0.2 + rand() * 0.28 }));
    const base = f.cover ?? 1.1;
    return (phi) => {
      let e = base;
      for (const w of waves) e += w.a * 0.2 * Math.sin(w.k * phi + w.p);
      for (const d of drips) { const x = angDist(phi, d.u) / d.w; e += d.a * Math.exp(-x * x * 1.4); }
      return Math.min(e, 1.62);
    };
  }
  lump(phi) { let l = 1; for (const m of this.lumps) l += m.a * Math.sin(m.k * phi + m.p); return l; }
  surf(phi, th, off, out) {
    const s = Math.sin(th), c = Math.cos(th), L = this.lump(phi);
    const Lz = 1 + (L - 1) * smoothstep(0, 0.6, th);   // lumps fade out at the apex so the top stays round (no pinch)
    const rad = (R * L + off) * Math.pow(Math.max(s, 0), 0.72);
    const z = c >= 0 ? (H * (0.96 + (Lz - 1) * 2) + off) * Math.pow(c, 0.9) : -(HB + off * 0.5) * Math.pow(-c, 0.6);
    return out.set(rad * Math.cos(phi), rad * Math.sin(phi), z);
  }
  coverage(phi, th, edge = this.edge) { const e = edge(phi); return smoothstep(e + 0.07, e - 0.07, th); }
  glazeOff(phi, th, edge = this.edge) {
    const cv = this.coverage(phi, th, edge);
    // rounded lip where the glaze stops, gentle pour ripples on top
    return Math.pow(cv, 0.45) * (0.034 + 0.006 * Math.sin(phi * 4 + th * 7) * smoothstep(0.05, 0.55, th)) - (1 - cv) * 0.045;
  }
  _normal(fnOff, phi, th, out) {
    const e = 0.003, a = this._v1 || (this._v1 = new THREE.Vector3()), b = this._v2 || (this._v2 = new THREE.Vector3()), c = this._v3 || (this._v3 = new THREE.Vector3()), d = this._v4 || (this._v4 = new THREE.Vector3());
    th = Math.min(Math.max(th, 0.02), Math.PI - 0.02);
    this.surf(phi, th + e, fnOff(phi, th + e), a); this.surf(phi, th - e, fnOff(phi, th - e), b);
    this.surf(phi + e, th, fnOff(phi + e, th), c); this.surf(phi - e, th, fnOff(phi - e, th), d);
    return out.crossVectors(a.sub(b), c.sub(d)).normalize();
  }
  _grid([SP, ST], fnOff, fnColor, planarUV) {
    const n = (SP + 1) * (ST + 1);
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2), col = fnColor ? new Float32Array(n * 3) : null;
    const p = new THREE.Vector3(), nv = new THREE.Vector3(), c = new THREE.Color();
    let k = 0;
    for (let i = 0; i <= SP; i++) {
      const phi = (i / SP) * TAU;
      for (let j = 0; j <= ST; j++, k++) {
        const th = (j / ST) * Math.PI;
        this.surf(phi, th, fnOff(phi, th), p);
        this._normal(fnOff, phi, th, nv);
        pos[k * 3] = p.x; pos[k * 3 + 1] = p.y; pos[k * 3 + 2] = p.z;
        nor[k * 3] = nv.x; nor[k * 3 + 1] = nv.y; nor[k * 3 + 2] = nv.z;
        if (planarUV) { uv[k * 2] = p.x / (2 * (R + 0.1)) + 0.5; uv[k * 2 + 1] = p.y / (2 * (R + 0.1)) + 0.5; }
        else { uv[k * 2] = i / SP; uv[k * 2 + 1] = 1 - j / ST; }
        if (col) { fnColor(phi, th, c); col[k * 3] = c.r; col[k * 3 + 1] = c.g; col[k * 3 + 2] = c.b; }
      }
    }
    const idx = new Uint32Array(SP * ST * 6); let q = 0;
    for (let i = 0; i < SP; i++) for (let j = 0; j < ST; j++) {
      const a = i * (ST + 1) + j, b = (i + 1) * (ST + 1) + j;
      idx[q++] = a; idx[q++] = a + 1; idx[q++] = b; idx[q++] = b; idx[q++] = a + 1; idx[q++] = b + 1;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    if (col) g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.setIndex(new THREE.BufferAttribute(idx, 1));
    g.computeBoundingSphere();
    return g;
  }

  /* ---------------- materials & textures ---------------- */
  _canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  _makeMaterials() {
    const tex = (c, srgb, wrap = true) => { const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; if (wrap) t.wrapS = THREE.RepeatWrapping; t.anisotropy = 8; return t; };
    // ---- dough: fried colour + pores/blisters (bump) + oily crust vs dry float line (roughness), on the dough UVs
    // phones and low-memory devices get half-size maps, drawn at the same scale so the look is unchanged
    const Q = this.constructor.TEXQ ?? ((innerWidth < 760 || (navigator.deviceMemory || 8) <= 4) ? 0.5 : 1);
    const W = 2048, Hh = 1024, rand = rng(21);
    const cv = this._canvas(W * Q, Hh * Q), x = cv.getContext('2d'); x.scale(Q, Q);
    const bc = this._canvas(1024 * Q, 512 * Q), bx = bc.getContext('2d'); bx.scale(Q, Q);
    const rc = this._canvas(64, 256), rx = rc.getContext('2d');
    x.fillStyle = '#fff'; x.fillRect(0, 0, W, Hh);
    const blob = (ctx, w, X0, Y, r, col) => { for (const dx of [-w, 0, w]) { const X = X0 + dx; const g = ctx.createRadialGradient(X, Y, 0, X, Y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(X - r, Y - r, r * 2, r * 2); } };
    for (let i = 0; i < 520; i++) {
      const y = rand() * Hh, band = Math.abs(y / Hh - 0.5); if (band < 0.05) continue;
      blob(x, W, rand() * W, y, 22 + rand() * 95, `rgba(${(118 + rand() * 40) | 0},${(52 + rand() * 26) | 0},${(16 + rand() * 12) | 0},${((0.05 + rand() * 0.11) * Math.min(1, band * 5)).toFixed(3)})`);
    }
    for (let i = 0; i < 200; i++) blob(x, W, rand() * W, rand() * Hh, 16 + rand() * 48, `rgba(255,236,198,${(0.05 + rand() * 0.08).toFixed(3)})`);
    for (let i = 0; i < 1100; i++) { x.fillStyle = `rgba(255,240,212,${(0.06 + rand() * 0.12).toFixed(3)})`; x.beginPath(); x.ellipse(rand() * W, Hh * (0.5 + (rand() - 0.5) * 0.1), 6 + rand() * 26, 2 + rand() * 6, 0, 0, TAU); x.fill(); }
    bx.fillStyle = '#808080'; bx.fillRect(0, 0, 1024, 512);
    for (let i = 0; i < 1700; i++) {          // fried blisters: pale domes with a toasted rim
      const X = rand(), Y = rand(); if (Math.abs(Y - 0.5) < 0.03) continue;
      const r = 1.2 + rand() * rand() * 6.5;
      x.fillStyle = `rgba(255,232,196,${(0.16 + rand() * 0.22).toFixed(3)})`; x.beginPath(); x.arc(X * W, Y * Hh, r * 2, 0, TAU); x.fill();
      x.strokeStyle = `rgba(108,50,15,${(0.12 + rand() * 0.16).toFixed(3)})`; x.lineWidth = 1.3; x.stroke();
      const g = bx.createRadialGradient(X * 1024, Y * 512, 0, X * 1024, Y * 512, r); g.addColorStop(0, 'rgba(215,215,215,.95)'); g.addColorStop(1, 'rgba(128,128,128,0)'); bx.fillStyle = g; bx.fillRect(X * 1024 - r, Y * 512 - r, r * 2, r * 2);
    }
    for (let i = 0; i < 20000 * (Q < 1 ? 0.6 : 1); i++) {         // pores + sugar flecks
      const X = rand(), Y = rand(), r = 0.4 + rand() * 1.3;
      x.fillStyle = rand() < 0.72 ? `rgba(100,46,13,${(0.1 + rand() * 0.17).toFixed(3)})` : `rgba(255,245,224,${(0.18 + rand() * 0.3).toFixed(3)})`;
      x.beginPath(); x.arc(X * W, Y * Hh, r, 0, TAU); x.fill();
      const v = (rand() < 0.75 ? 62 + rand() * 40 : 175 + rand() * 45) | 0; bx.fillStyle = `rgba(${v},${v},${v},.6)`; bx.beginPath(); bx.arc(X * 1024, Y * 512, r * 0.6, 0, TAU); bx.fill();
    }
    const rg = rx.createLinearGradient(0, 0, 0, 256); rg.addColorStop(0, '#8c8c8c'); rg.addColorStop(0.43, '#a0a0a0'); rg.addColorStop(0.5, '#ececec'); rg.addColorStop(0.57, '#aaaaaa'); rg.addColorStop(1, '#969696'); rx.fillStyle = rg; rx.fillRect(0, 0, 64, 256);
    this.doughMat = new THREE.MeshPhysicalMaterial({ vertexColors: true, map: tex(cv, true), roughness: 1, roughnessMap: tex(rc), bumpMap: tex(bc), bumpScale: 2.2, sheen: 0.55, sheenRoughness: 0.7, sheenColor: new THREE.Color('#ffcf9a') });

    // ---- glaze: soft pour ripples + flow lines + fine sugar grain (bump), shared by every flavour
    const GS = 1024, gc = this._canvas(GS * Q, GS * Q), gx = gc.getContext('2d'), r3 = rng(5); gx.scale(Q, Q);
    gx.fillStyle = '#808080'; gx.fillRect(0, 0, GS, GS);
    for (let i = 0; i < 130; i++) { const px = r3() * GS, py = r3() * GS, rr = 40 + r3() * 190, g = gx.createRadialGradient(px, py, 0, px, py, rr), v = r3() < 0.5 ? 158 : 102; g.addColorStop(0, `rgba(${v},${v},${v},.32)`); g.addColorStop(1, 'rgba(128,128,128,0)'); gx.fillStyle = g; gx.fillRect(px - rr, py - rr, rr * 2, rr * 2); }
    for (let i = 0; i < 42000 * Q; i++) { const v = (112 + r3() * 32) | 0; gx.fillStyle = `rgb(${v},${v},${v})`; gx.fillRect(r3() * GS, r3() * GS, 1.4, 1.4); }
    this.glazeBump = tex(gc, false, false);
    this.glazeMat = this._glazeMaterial();
    this.glazeMat.onBeforeCompile = (sh) => {
      sh.uniforms.uPour = this.pour;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying float vLz;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvLz = position.z;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vLz;\nuniform float uPour;')
        .replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\nif (vLz < mix(' + (H + 0.12).toFixed(2) + ', -0.3, uPour)) discard;');
    };
    this.drizzleMat = this._drizzleMat('#9c6a3c');

    // ---- toppings: crumbs get a gritty bump, sprinkles a satin finish, marshmallows a soft sheen
    const nc = this._canvas(128, 128), nx = nc.getContext('2d'), r4 = rng(77);
    nx.fillStyle = '#808080'; nx.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 2600; i++) { const v = (55 + r4() * 150) | 0; nx.fillStyle = `rgba(${v},${v},${v},.7)`; nx.fillRect(r4() * 128, r4() * 128, 1 + r4() * 2.5, 1 + r4() * 2.5); }
    const grit = tex(nc); grit.wrapT = THREE.RepeatWrapping;
    this.partMats = {};
    for (const [k, p] of Object.entries(PARTS)) {
      const rock = p.geo === 'rock';
      this.partMats[k] = new THREE.MeshPhysicalMaterial({
        roughness: p.rough, clearcoat: k === 'pearls' ? 1 : k === 'sprinkles' ? 0.45 : 0.05, clearcoatRoughness: 0.25,
        bumpMap: rock || k === 'almonds' ? grit : null, bumpScale: rock ? 3 : 1.2,
        sheen: k === 'mallows' ? 0.9 : k === 'coconut' ? 0.5 : 0, sheenRoughness: 0.5, sheenColor: new THREE.Color('#ffffff'),
      });
    }
    this.partGeos = {
      rock: (() => {   // irregular crumb: subdivided, displaced, faceted
        const g = new THREE.IcosahedronGeometry(1, 2), pa = g.attributes.position, v = new THREE.Vector3();
        for (let i = 0; i < pa.count; i++) { v.fromBufferAttribute(pa, i); const k = 1 + 0.22 * Math.sin(v.x * 7 + v.y * 3) * Math.cos(v.z * 5 + v.x * 2) + 0.12 * Math.sin(v.y * 13 + v.z * 9) + 0.08 * Math.cos(v.x * 17 - v.z * 11); v.multiplyScalar(k); pa.setXYZ(i, v.x, v.y * 0.7, v.z); }
        g.computeVertexNormals(); return g;
      })(),
      seed: (() => { const g = new THREE.SphereGeometry(0.0085, 10, 6); g.scale(1, 2.3, 0.6); return g; })(),
      capsule: new THREE.CapsuleGeometry(0.016, 0.07, 6, 10),
      pearl: new THREE.SphereGeometry(0.027, 16, 12),
      sliver: (() => { const g = new THREE.SphereGeometry(0.1, 18, 8); g.scale(1, 0.2, 0.5); return g; })(),
      strip: (() => { const g = new THREE.CapsuleGeometry(0.016, 0.14, 3, 6); g.rotateZ(Math.PI / 2); g.scale(1, 0.75, 1.2); return g; })(),
      mallow: new THREE.CylinderGeometry(0.052, 0.052, 0.07, 22),
      strand: new THREE.CapsuleGeometry(0.008, 0.085, 2, 6),
    };
    this.capGeo = new THREE.SphereGeometry(0.0205, 12, 8);
  }
  _glazeMaterial() {
    return new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.34, clearcoat: 0.6, clearcoatRoughness: 0.18, bumpMap: this.glazeBump, bumpScale: 0.7, sheen: 0.35, sheenRoughness: 0.55, sheenColor: new THREE.Color('#ffffff'), ior: 1.45, envMapIntensity: 0.85 });
  }
  _styleGlaze(m, f) {
    const matte = f.pattern === 'crumbcoat';
    m.map = this._texFor(f);
    m.roughness = matte ? 0.92 : 0.34; m.clearcoat = matte ? 0.03 : 0.6; m.clearcoatRoughness = matte ? 0.8 : 0.18;
    m.bumpScale = matte ? 3 : 0.7; m.sheen = matte ? 0 : 0.35;
    m.needsUpdate = true;
  }
  _drizzleMat(color) {
    this._dmats = this._dmats || new Map();
    if (!this._dmats.has(color)) this._dmats.set(color, new THREE.MeshPhysicalMaterial({ color, roughness: 0.24, clearcoat: 1, clearcoatRoughness: 0.08, sheen: 0.2, sheenColor: new THREE.Color('#ffffff') }));
    return this._dmats.get(color);
  }

  _texFor(f) {
    const key = [f.glaze, f.pattern, f.patternColor, (f.crumbColors || []).join()].join('|');
    if (this.cache.tex[key]) return this.cache.tex[key];
    const S = 1024, cv = this._canvas(S, S), x = cv.getContext('2d'), rand = rng(hashStr(key));
    x.fillStyle = f.glaze; x.fillRect(0, 0, S, S);
    const g = x.createRadialGradient(S * 0.42, S * 0.38, 0, S / 2, S / 2, S * 0.56);
    g.addColorStop(0, 'rgba(255,255,255,.1)'); g.addColorStop(1, 'rgba(0,0,0,.07)');
    x.fillStyle = g; x.fillRect(0, 0, S, S);
    const pc = f.patternColor || '#ffffff';
    if (f.pattern === 'marble') {
      const N = 800, tmp = this._canvas(N, N), t = tmp.getContext('2d'), id = t.createImageData(N, N), c = new THREE.Color(pc);
      for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
        const nx = (i / N) * 2 - 1, ny = (j / N) * 2 - 1, r = Math.hypot(nx, ny), a = Math.atan2(ny, nx);
        const w = r * 4.6 + 0.62 * Math.cos(4 * a + 0.4) * (0.15 + r) + 0.1 * Math.sin(a * 9 + r * 6);
        const d = Math.abs(w - Math.round(w));
        let v = smoothstep(0.085, 0.035, d) * (r < 0.92 ? 1 : 0);
        if (r < 0.05) v = 1;
        const o = (j * N + i) * 4;
        id.data[o] = c.r * 255; id.data[o + 1] = c.g * 255; id.data[o + 2] = c.b * 255; id.data[o + 3] = v * 235;
      }
      t.putImageData(id, 0, 0); x.drawImage(tmp, 0, 0, S, S);
    } else if (f.pattern === 'dust') {
      x.fillStyle = pc;
      for (let i = 0; i < 900; i++) {
        const cx = S / 2 + (rand() - 0.5) * S * 0.85, cy = S / 2 + (rand() - 0.5) * S * 0.85;
        x.globalAlpha = 0.45 + rand() * 0.4; x.beginPath(); x.ellipse(cx, cy, 0.8 + rand() * 1.8, 0.6 + rand() * 1.1, rand() * 3, 0, TAU); x.fill();
      }
      x.globalAlpha = 1;
    } else if (f.pattern === 'crumbcoat') {
      const cols = f.crumbColors || [pc];
      for (let i = 0; i < 9000; i++) {
        x.fillStyle = cols[i % cols.length]; x.globalAlpha = 0.5 + rand() * 0.5;
        const cx = rand() * S, cy = rand() * S, rr = 2 + rand() * 8;
        x.beginPath(); for (let k = 0; k < 6; k++) { const a = (k / 6) * TAU, q = rr * (0.6 + rand() * 0.6); k ? x.lineTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q) : x.moveTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q); } x.fill();
      }
      x.globalAlpha = 1;
    }
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    return (this.cache.tex[key] = tex);
  }
  _glazeGeoFor(f, edge, seg = GLAZE_SEG) {
    const key = (f.name || 'custom') + '|' + (f.cover ?? 1.1) + '|' + seg[0];
    return this.cache.glaze[key] || (this.cache.glaze[key] = this._grid(seg, (p, t) => this.glazeOff(p, t, edge), (p, t, c) => {
      const k = Math.pow(1 - this.coverage(p, t, edge), 1.3);   // thin glaze at the edge lets the dough show through
      c.setRGB(1 - 0.12 * k, 1 - 0.27 * k, 1 - 0.42 * k);
    }, true));
  }
  _doughGeoFor(name, f = this.flavor, edge = this.edge, seg = DOUGH_SEG) {
    const key = name + '|' + ((f && f.name) || 'custom') + '|' + ((f && f.cover) ?? 1.1) + '|' + seg[0];
    if (this.cache.dough[key]) return this.cache.dough[key];
    const d = DOUGH[name] || DOUGH.classic, top = new THREE.Color(d.top), band = new THREE.Color(d.band), bot = new THREE.Color(d.bottom);
    return (this.cache.dough[key] = this._grid(seg, () => 0, (phi, th, c) => {
      c.copy(top).lerp(bot, smoothstep(1.2, 2.2, th));
      c.lerp(band, Math.exp(-Math.pow(Math.cos(th) / 0.16, 2)) * 0.92);   // pale fry ring round the middle
      if (edge) { const dd = th - edge(phi); c.multiplyScalar(1 - 0.34 * Math.exp(-Math.pow((dd - 0.05) / 0.1, 2))); }   // soft shadow under the glaze lip
    }));
  }

  _apply() {
    const f = this.flavor;
    this.edge = this._edgeFor(f);
    this.dough.geometry = this._doughGeoFor(f.dough, f, this.edge);
    this.glaze.geometry = this._glazeGeoFor(f, this.edge);
    this._styleGlaze(this.glazeMat, f);
    this._buildExtras();
  }

  // build caches ahead of time so flavour changes never stutter
  prewarm(list) {
    const queue = list.slice();
    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 60));
    const step = () => {
      const f = queue.shift(); if (!f) return;
      const e = this._edgeFor(f); this._glazeGeoFor(f, e); this._doughGeoFor(f.dough || 'classic', f, e); this._texFor(f);
      idle(step);
    };
    idle(step);
    const tmp = new THREE.Group(); tmp.scale.setScalar(1e-4);
    for (const k of Object.keys(PARTS)) { const m = new THREE.InstancedMesh(this.partGeos[PARTS[k].geo], this.partMats[k], 1); m.setColorAt(0, new THREE.Color('#fff')); tmp.add(m); }
    this.scene.add(tmp); this.renderer.compile(this.scene, this.camera); this.scene.remove(tmp);
  }

  /* ---------------- toppings ---------------- */
  _capPoint(rand, margin = 0.1) {
    const phi = rand() * TAU, tmax = Math.min(this.edge(phi) - margin, 1.15);
    return { phi, th: Math.acos(1 - rand() * (1 - Math.cos(tmax))) };
  }
  _buildExtras() {
    this.extras.children.slice().forEach((m) => { this.extras.remove(m); if (m.userData.own) m.geometry.dispose(); });
    this.inst = [];
    const f = this.flavor, rand = rng(hashStr((f.name || 'custom') + (f.toppings || []).join()));
    const p = new THREE.Vector3(), n = new THREE.Vector3(), q = new THREE.Quaternion(), qa = new THREE.Quaternion(), Y = new THREE.Vector3(0, 1, 0), tan = new THREE.Vector3(), eul = new THREE.Euler();
    const goff = (a, b) => this.glazeOff(a, b);
    for (const type of f.toppings || []) {
      if (type === 'cookie') { this._addCookie(rand); continue; }
      if (type === 'jam') { this._addJam(rand); continue; }
      if (type === 'wafer') { this._addWafer(rand); continue; }
      const spec = PARTS[type]; if (!spec) continue;
      const mesh = new THREE.InstancedMesh(this.partGeos[spec.geo], this.partMats[type], spec.n);
      const cols = spec.colors.map((h) => new THREE.Color(h)), data = [];
      for (let i = 0; i < spec.n; i++) {
        const { phi, th } = this._capPoint(rand, type === 'sesame' ? 0.06 : 0.12);
        this.surf(phi, th, goff(phi, th) + (spec.geo === 'rock' ? 0.004 : 0.006), p); this._normal(goff, phi, th, n);
        const s = spec.size[0] + rand() * (spec.size[1] - spec.size[0]);
        const sc = new THREE.Vector3(s, s, s);
        if (spec.geo === 'capsule' || spec.geo === 'seed' || spec.geo === 'strand') {
          tan.set(rand() - 0.5, rand() - 0.5, rand() - 0.5).projectOnPlane(n).normalize(); q.setFromUnitVectors(Y, tan);
        } else {
          q.setFromUnitVectors(Y, n);
          if (spec.flat) qa.setFromEuler(eul.set((rand() - 0.5) * 0.5, rand() * TAU, (rand() - 0.5) * 0.5)); else qa.setFromEuler(eul.set(rand() * 6, rand() * 6, rand() * 6));
          q.multiply(qa);
          if (spec.geo === 'rock') sc.multiplyScalar(spec.r).multiply(new THREE.Vector3(0.75 + rand() * 0.5, 0.55 + rand() * 0.35, 0.75 + rand() * 0.5));
        }
        data.push({ p: p.clone(), n: n.clone(), q: q.clone(), s: sc, d: rand() * 0.6 });
        mesh.setColorAt(i, cols[(rand() * cols.length) | 0]);
      }
      this.extras.add(mesh); this.inst.push({ mesh, data });
    }
    if (f.drizzle) this._addDrizzle(rand);
    this.dropT = Math.min(this.dropT, 0);
    this._updateInst();
  }
  _addDrizzle(rand) {
    const mat = this._drizzleMat(this.flavor.drizzle), style = this.flavor.drizzleStyle;
    if (style === 'spiral') return this._addSpiral(mat);
    const ang = 0.55 + rand() * 0.3;
    this._addStripes(ang, mat, 0);
    if (style === 'cross') this._addStripes(ang + 1.25, mat, 0.25);
  }
  _tube(run, mat, d, r = 0.019) {
    if (run.length < 6) return;
    const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(run), run.length * 4, r, 10, false), mat);
    m.userData = { drop: { d }, own: true, tube: true }; this.extras.add(m);
    for (const end of [run[0], run[run.length - 1]]) { const cap = new THREE.Mesh(this.capGeo, mat); cap.scale.setScalar(r / 0.0205); cap.position.copy(end); cap.userData = { drop: { d }, tube: true, baseZ: end.z }; this.extras.add(cap); }
  }
  // a point on the glaze seen from above (plan x/y) -> surface point, false where the glaze has run out
  _onGlaze(X, Y, p) {
    const phi = Math.atan2(Y, X), rr = Math.hypot(X, Y) / (R * this.lump(phi));
    if (rr >= 0.97) return false;
    const th = Math.asin(Math.pow(rr, 1 / 0.72));
    if (th > this.edge(phi) - 0.08 || th > 1.3) return false;
    this.surf(phi, th, this.glazeOff(phi, th) + 0.012, p); return true;
  }
  _addStripes(ang, mat, d0) {
    const ca = Math.cos(ang), sa = Math.sin(ang), p = new THREE.Vector3(), lines = 8;
    for (let li = 0; li < lines; li++) {
      const d = (li / (lines - 1) - 0.5) * 1.8 * R * 0.85;
      let run = [];
      for (let t = -R * 1.1; t <= R * 1.1; t += 0.025) {
        const lx = t, ly = d + 0.035 * Math.sin(t * 7 + li);
        if (this._onGlaze(lx * ca - ly * sa, lx * sa + ly * ca, p)) run.push(p.clone());
        else { this._tube(run, mat, d0 + li * 0.05); run = []; }
      }
      this._tube(run, mat, d0 + li * 0.05);
    }
  }
  _addSpiral(mat) {
    const p = new THREE.Vector3(), N = 900, turns = 4.2; let run = [];
    for (let i = 0; i <= N; i++) {
      const s = i / N, rr = (0.06 + 0.8 * s) * R, a = s * turns * TAU + 0.6;
      if (this._onGlaze(Math.cos(a) * rr, Math.sin(a) * rr, p)) run.push(p.clone());
      else { this._tube(run, mat, 0.1, 0.017); run = []; }
    }
    this._tube(run, mat, 0.1, 0.017);
  }
  _addWafer(rand) {
    if (!this.waferGeo) {
      const w = 1.45, h = 0.26, r = 0.05, sh = new THREE.Shape();
      sh.moveTo(-w / 2 + r, -h / 2); sh.lineTo(w / 2 - r, -h / 2); sh.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r); sh.lineTo(w / 2, h / 2 - r); sh.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
      sh.lineTo(-w / 2 + r, h / 2); sh.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); sh.lineTo(-w / 2, -h / 2 + r); sh.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
      const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.1, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 3, curveSegments: 6 });
      const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) + w / 2) / w, (uv.getY(i) + h / 2) / h);
      const cv = this._canvas(512, 128), x = cv.getContext('2d'); x.fillStyle = '#909090'; x.fillRect(0, 0, 512, 128);
      x.strokeStyle = '#5a5a5a'; x.lineWidth = 5; for (let i = 0; i < 512; i += 18) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 128); x.stroke(); } for (let j = 0; j < 128; j += 26) { x.beginPath(); x.moveTo(0, j); x.lineTo(512, j); x.stroke(); }
      this.waferGeo = geo;
      this.waferMat = new THREE.MeshStandardMaterial({ color: '#d39b5b', roughness: 0.72, bumpMap: new THREE.CanvasTexture(cv), bumpScale: 4 });
      const coat = new THREE.ExtrudeGeometry(sh, { depth: 0.022, bevelEnabled: true, bevelSize: 0.014, bevelThickness: 0.014, bevelSegments: 4, curveSegments: 6 });
      this.waferCoatGeo = coat;
      this.waferCoatMat = new THREE.MeshPhysicalMaterial({ color: '#3a1d10', roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.08 });
    }
    const g = new THREE.Group(), coat = new THREE.Mesh(this.waferCoatGeo, this.waferCoatMat);
    coat.position.z = 0.1; g.add(new THREE.Mesh(this.waferGeo, this.waferMat), coat);
    const p = new THREE.Vector3(); this.surf(0, 0.02, this.glazeOff(0, 0.02) - 0.05, p);
    g.position.copy(p); g.rotation.set(0, 0, -0.6 + (rand() - 0.5) * 0.15);
    g.userData = { drop: { d: 0.4 } };
    this.extras.add(g);
  }
  _addCookie(rand) {
    if (!this.cookieGeo) {
      const w = 0.62, h = 0.42, pts = [], sc = 14;
      for (let i = 0; i < 4; i++) {
        const [x0, y0, x1, y1] = [[-w / 2, -h / 2, w / 2, -h / 2], [w / 2, -h / 2, w / 2, h / 2], [w / 2, h / 2, -w / 2, h / 2], [-w / 2, h / 2, -w / 2, -h / 2]][i];
        const cnt = i % 2 ? Math.round((sc * h) / w) : sc;
        for (let k = 0; k < cnt; k++) {
          const t = k / cnt, xx = x0 + (x1 - x0) * t, yy = y0 + (y1 - y0) * t, nx = y1 - y0, ny = -(x1 - x0), L = Math.hypot(nx, ny), b = Math.abs(0.012 * Math.sin(t * cnt * Math.PI));
          pts.push(new THREE.Vector2(xx + (nx / L) * b, yy + (ny / L) * b));
        }
      }
      const geo = new THREE.ExtrudeGeometry(new THREE.Shape(pts), { depth: 0.05, bevelEnabled: true, bevelSize: 0.022, bevelThickness: 0.02, bevelSegments: 4, curveSegments: 4 });
      const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) + w / 2) / w, (uv.getY(i) + h / 2) / h);
      const cv = this._canvas(256, 256), x = cv.getContext('2d'); x.fillStyle = '#888'; x.fillRect(0, 0, 256, 256);
      x.strokeStyle = '#5a5a5a'; x.lineWidth = 6; x.strokeRect(24, 40, 208, 176);
      x.strokeStyle = '#a8a8a8'; x.lineWidth = 3; for (let i = -256; i < 256; i += 22) { x.beginPath(); x.moveTo(i + 40, 60); x.lineTo(i + 140, 200); x.stroke(); }
      this.cookieGeo = geo;
      this.cookieMat = new THREE.MeshStandardMaterial({ color: '#94531c', roughness: 0.8, bumpMap: new THREE.CanvasTexture(cv), bumpScale: 3 });
    }
    const m = new THREE.Mesh(this.cookieGeo, this.cookieMat);
    const phi = 2.2, th = 0.25, p = new THREE.Vector3(); this.surf(phi, th, this.glazeOff(phi, th) + 0.01, p);
    m.position.copy(p); m.rotation.set(0.1, -0.05, rand() * TAU);
    m.userData = { drop: { d: 0.35 } };
    this.extras.add(m);
  }
  _addJam(rand) {
    if (!this.jamGeo) {
      const geo = new THREE.IcosahedronGeometry(0.3, 5), pa = geo.attributes.position, v = new THREE.Vector3();
      for (let i = 0; i < pa.count; i++) { v.fromBufferAttribute(pa, i); const k = 1 + 0.16 * Math.sin(v.x * 9 + 1) * Math.sin(v.y * 8) + 0.08 * Math.sin(v.y * 15 + v.x * 4); v.multiplyScalar(k); pa.setXYZ(i, v.x * 1.15, v.y, v.z * 0.3); }
      geo.computeVertexNormals();
      this.jamGeo = geo;
      this.jamMat = new THREE.MeshPhysicalMaterial({ color: '#f39a07', roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.02, emissive: '#a24d00', emissiveIntensity: 0.18 });
    }
    const m = new THREE.Mesh(this.jamGeo, this.jamMat);
    const phi = 3.6, th = 0.5, p = new THREE.Vector3(); this.surf(phi, th, this.glazeOff(phi, th) + 0.004, p);
    m.position.copy(p); m.rotation.set(0.25, 0, rand() * TAU);
    m.userData = { drop: { d: 0.5 } };
    this.extras.add(m);
  }
  _updateInst() {
    const t = this.dropT, mm = this._m4 || (this._m4 = new THREE.Matrix4()), pos = new THREE.Vector3(), sc = new THREE.Vector3();
    for (const { mesh, data } of this.inst) {
      for (let i = 0; i < data.length; i++) {
        const d = data[i], k = Math.min(1, Math.max(0, (t - d.d) / 0.45)), e = 1 - Math.pow(1 - k, 3);
        pos.copy(d.p).addScaledVector(d.n, (1 - e) * 1.2);
        sc.copy(d.s).multiplyScalar(e * (k < 1 ? 1 + Math.sin(k * Math.PI) * 0.3 : 1));
        mm.compose(pos, d.q, sc); mesh.setMatrixAt(i, mm);
      }
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
    for (const m of this.extras.children) {
      const u = m.userData; if (!u.drop) continue;
      const k = Math.min(1, Math.max(0, (t - u.drop.d) / 0.5)), e = 1 - Math.pow(1 - k, 3);
      m.visible = k > 0;
      if (u.tube) m.position.z = (u.baseZ ?? 0) + (1 - e) * 0.6;   // drizzle lowers onto the glaze
      else m.scale.setScalar(e * (k < 1 ? 1 + Math.sin(k * Math.PI) * 0.25 : 1));
    }
  }

  _makeShadow() {
    const cv = this._canvas(256, 128), x = cv.getContext('2d'), g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, 'rgba(70,30,5,.5)'); g.addColorStop(0.5, 'rgba(70,30,5,.18)'); g.addColorStop(1, 'rgba(70,30,5,0)');
    x.fillStyle = g; x.save(); x.scale(1, 0.5); x.fillRect(0, 0, 256, 256); x.restore();
    this.shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false }));
    this.shadow.scale.set(3.1, 0.75, 1); this.shadow.position.set(0, -1.08, -0.6); this.shadow.renderOrder = -1;
    this.root.add(this.shadow);
  }

  /* ---------------- API ---------------- */
  setFlavor(f, { anim = 'flip' } = {}) {
    const next = { ...this.flavor, ...f };
    if (anim === 'flip') { this.pending = next; this.flipT = 0; this._flipApplied = false; }
    else { this.flavor = next; this._apply(); if (anim === 'pour') { this.pourT = 0; this.pour.value = 0; this.dropT = -0.4; } else this.dropT = 0; this.squash = 0.6; }
  }
  makeModel(f, { seg = [144, 76], dseg = [96, 60] } = {}) {
    const keep = { flavor: this.flavor, edge: this.edge, extras: this.extras, inst: this.inst, dropT: this.dropT };
    const fl = { pattern: 'plain', dough: 'classic', toppings: [], drizzle: null, cover: 1.12, ...f };
    this.flavor = fl; this.edge = this._edgeFor(fl);
    const ex = new THREE.Group(); this.extras = ex;
    this._buildExtras(); this.dropT = 5; this._updateInst();
    const gm = this._glazeMaterial(); this._styleGlaze(gm, fl);
    const grp = new THREE.Group();
    grp.add(new THREE.Mesh(this._doughGeoFor(fl.dough || 'classic', fl, this.edge, dseg), this.doughMat), new THREE.Mesh(this._glazeGeoFor(fl, this.edge, seg), gm), ex);
    Object.assign(this, keep);
    return grp;
  }
  boop() { this.squash = 1.2; this.spinVel += 5; }
  hitTest(cx, cy) {
    if (!this.root.visible) return false;
    this.raycaster.setFromCamera(new THREE.Vector2((cx / this.w) * 2 - 1, -(cy / this.h) * 2 + 1), this.camera);
    return this.raycaster.intersectObjects([this.dough, this.glaze], false).length > 0;
  }
  // points on the donut's outer silhouette (unit scale), used to fit it exactly into a DOM box
  _silhouette() {
    if (this._sil) return this._sil;
    const pts = [], p = new THREE.Vector3();
    for (let i = 0; i < 24; i++) { const phi = (i / 24) * TAU; for (const th of [0.02, 0.6, 1.1, 1.57, 2.1, 2.7]) { this.surf(phi, th, 0.04, p); pts.push(p.clone()); } }
    return (this._sil = pts);
  }
  // place the donut so its projected silhouette is centred in rect and fills `fill` of it
  setAnchor(rect, opts = {}) {
    if (!rect) { this.target.s = 0.0001; return; }
    const rx = opts.rx ?? -0.95, ry = opts.ry ?? 0, fill = opts.fill ?? 0.9;
    const q = (this._q || (this._q = new THREE.Quaternion())).setFromEuler((this._e || (this._e = new THREE.Euler())).set(rx, ry, 0));
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    let x = (cx / this.w - 0.5) * this.visW, y = -(cy / this.h - 0.5) * this.visH;
    let s = ((Math.min(rect.width, rect.height) / this.h) * this.visH) / (2 * (R + 0.08));
    const v = this._fv || (this._fv = new THREE.Vector3()), pts = this._silhouette();
    for (let it = 0; it < 4; it++) {
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      for (const p of pts) {
        v.copy(p).applyQuaternion(q).multiplyScalar(s); v.x += x; v.y += y; v.project(this.camera);
        const px = ((v.x + 1) / 2) * this.w, py = ((1 - v.y) / 2) * this.h;
        if (px < x0) x0 = px; if (px > x1) x1 = px; if (py < y0) y0 = py; if (py > y1) y1 = py;
      }
      x += ((cx - (x0 + x1) / 2) * this.visW) / this.w;
      y -= ((cy - (y0 + y1) / 2) * this.visH) / this.h;
      s *= Math.min((rect.width * fill) / (x1 - x0), (rect.height * fill) / (y1 - y0));
    }
    this.target.x = x; this.target.y = y; this.target.s = s; this.target.rx = rx; this.target.ry = ry;
  }
  resize() {
    this.w = innerWidth; this.h = innerHeight;
    this.renderer.setSize(this.w, this.h, false);
    this.camera.aspect = this.w / this.h; this.camera.updateProjectionMatrix();
    this.visH = 2 * this.camera.position.z * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    this.visW = this.visH * this.camera.aspect;
    this.camera.updateMatrixWorld();
  }

  render() {
    const dt = Math.min(this.clock.getDelta(), 0.1), t = this.clock.elapsedTime;
    const k = 1 - Math.pow(0.004, dt), c = this.cur, T = this.target;
    c.x += (T.x - c.x) * k; c.y += (T.y - c.y) * k; c.s += (T.s - c.s) * k;
    c.rx += (T.rx + this.mouse.y * 0.18 - c.rx) * k; c.ry += (T.ry + this.mouse.x * 0.25 - c.ry) * k;

    let hop = 0;
    if (this.flipT < 1) {
      this.flipT = Math.min(1, this.flipT + dt / 0.9);
      this.flipG.rotation.x = easeIO(this.flipT) * TAU;
      hop = Math.sin(this.flipT * Math.PI) * 0.45;
      if (!this._flipApplied && this.flipT > 0.42) {   // upside-down: swap the flavour unseen
        this._flipApplied = true;
        if (this.pending) { this.flavor = this.pending; this.pending = null; this._apply(); this.pourT = 0; this.pour.value = 0; this.dropT = -0.8; }
      }
    } else this.flipG.rotation.x = 0;
    if (this.pourT < 1) { this.pourT = Math.min(1, this.pourT + dt / 1.0); this.pour.value = 1 - Math.pow(1 - this.pourT, 2.2); }
    if (this.dropT < 1.6) { this.dropT += dt * 1.2; this._updateInst(); }

    this.squash *= Math.pow(0.03, dt);
    const sq = Math.sin(t * 20) * this.squash * 0.07, bob = REDUCE ? 0 : Math.sin(t * 1.2) * 0.04;
    this.root.position.set(c.x, c.y + (bob + hop) * c.s, 0);
    this.root.scale.set(c.s * (1 + sq), c.s * (1 - sq), c.s * (1 + sq));
    this.shadow.position.y = -1.08 - hop - bob;
    this.shadow.material.opacity = Math.max(0, 1 - hop * 1.2);
    this.tiltG.rotation.set(c.rx + (REDUCE ? 0 : Math.sin(t * 0.7) * 0.03), c.ry + (REDUCE ? 0 : Math.cos(t * 0.55) * 0.04), 0);

    this.spinVel += (this.autoSpin - this.spinVel) * (1 - Math.pow(0.2, dt));
    this.rotZ += (this.spinVel + this.dragSpin) * dt;
    this.spinG.rotation.z = this.rotZ;
    this.dragSpin *= Math.pow(0.05, dt);

    const vis = c.s > 0.004;
    this.root.visible = vis;
    if (!vis) { if (this._hiddenDrawn) return; this._hiddenDrawn = true; } else this._hiddenDrawn = false;
    this.renderer.render(this.scene, this.camera);
  }
}

/* ---------------- snapshots ----------------
   Offscreen renderer used by tools/render3d.html to turn the real 3D donut (and the 3D cups)
   into the transparent images in assets/3d that every card, tray, box and chat bubble shows. */
let SNAP_PX = 320;
export class DonutThumbs extends DonutScene {
  static TEXQ = 1;   // always full-size maps for the renders
  constructor(sharedCache) {
    super(document.createElement('canvas'));
    if (sharedCache) this.cache = sharedCache;
    this.renderer.setClearColor(0x000000, 0);
    this.holder = new THREE.Group(); this.scene.add(this.holder);
  }
  resize() {
    this.w = this.h = SNAP_PX;
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(SNAP_PX, SNAP_PX, false);
    this.camera.aspect = 1; this.camera.updateProjectionMatrix();
    this.visH = this.visW = 2 * this.camera.position.z * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    this.camera.updateMatrixWorld();
  }
  _px(px) { if (px !== SNAP_PX || this.w !== px) { SNAP_PX = px; this.resize(); } }
  donut(f, { rx = -0.85, spin = 0.55, px = 320, fill = 0.92 } = {}) {
    this._px(px);
    this.flavor = { ...this.flavor, ...f };
    this._apply();
    this.pour.value = 1; this.dropT = 5; this._updateInst();
    this.flipG.rotation.set(0, 0, 0); this.spinG.rotation.z = spin;
    this.setAnchor({ left: 0, top: 0, width: px, height: px }, { rx, fill });
    const T = this.target;
    this.root.visible = true; this.holder.visible = false;
    this.root.position.set(T.x, T.y, 0); this.root.scale.setScalar(T.s);
    this.tiltG.rotation.set(rx, 0, 0);
    this.shadow.visible = rx < -0.4; this.shadow.position.y = -1.08; this.shadow.material.opacity = 0.75;
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL('image/png');
  }
  object(obj, { px = 320, turn = -0.45, lift = 0.22 } = {}) {
    this._px(px);
    this.root.visible = false; this.holder.visible = true;
    this.holder.add(obj); obj.rotation.y = turn;
    const box = new THREE.Box3().setFromObject(obj), c = box.getCenter(new THREE.Vector3()), sz = box.getSize(new THREE.Vector3());
    const cam = this.camera, half = THREE.MathUtils.degToRad(cam.fov / 2);
    const dist = (Math.max(sz.y, sz.x, sz.z) * 0.5) / Math.tan(half) * 1.12;
    cam.position.set(c.x, c.y + dist * lift, c.z + dist); cam.lookAt(c); cam.updateMatrixWorld();
    this.renderer.render(this.scene, cam);
    const url = this.renderer.domElement.toDataURL('image/png');
    this.holder.remove(obj); this.root.visible = true; this.holder.visible = false;
    cam.position.set(0, 0, 8); cam.rotation.set(0, 0, 0); cam.updateMatrixWorld();
    return url;
  }
}
