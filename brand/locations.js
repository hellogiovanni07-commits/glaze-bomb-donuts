/* Glaze Bomb brand kit: 3D location mock-ups (mall kiosk, pop-up stall with seating, flagship store).
   Classic script. An inline module in index.html imports three.js and calls window.gbLocations(...),
   so the scenes also work when the kit is opened straight from the folder (file://).
   Every sign, menu and counter is a canvas texture drawn from the details in chapter 01. */
(() => {
  'use strict';

  window.gbLocations = async function gbLocations(THREE, { OrbitControls, RoomEnvironment }) {
    const root = document.getElementById('loc3d');
    if (!root || root.dataset.ready) return;
    root.dataset.ready = '1';
    const stage = root.querySelector('.loc3d__stage');
    const canvas = root.querySelector('canvas');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const yieldFrame = () => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));
    const B = window.gbBrand || {};
    const DEF = { name: 'Glaze Bomb', tagline: 'Filled to the edge.', promo: 'Free drink with every box of 6', hoursWk: 'Mon-Fri 6 AM - 2 PM', hoursWe: 'Sat-Sun 7 AM - 1 PM', ig: '@glazebomb', cur: '$', est: '2026' };
    const val = (k) => (B.val ? B.val(k) : DEF[k]);
    const words = () => (B.words ? B.words() : ['Glaze', 'Bomb']);
    const MENU = B.MENU || {
      premium: [['Midnight Marble', 3.6], ['Mango Graham', 3.9], ['Ube Cheese Cloud', 3.7], ['Matcha Web', 3.7], ["S'mores Campfire", 3.7], ['Tiramisu Dust', 3.7]],
      classic: [['Original Glaze', 2.5], ['Choco Glaze', 2.6], ['Strawberry Sprinkle', 2.8], ['Choco Sprinkle', 2.8], ['Mocha Glaze', 2.6], ['Caramel Drizzle', 2.7]],
      hot: [['Cafe Latte', 3.4], ['Spanish Latte', 3.8], ['Hot Chocolate', 3.2]],
      iced: [['Iced Spanish Latte', 3.9], ['Iced Matcha Latte', 3.9], ['Orange Cold Brew', 3.6]],
    };
    const money = (n) => val('cur') + n.toFixed(2);

    // ---------- renderer, scene, camera ----------
    // software WebGL (no GPU, some app browser panes) gets a lighter mode: no shadows, lower resolution
    let soft = (() => {
      try {
        const c = document.createElement('canvas'), gl = c.getContext('webgl2') || c.getContext('webgl');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const name = String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /swiftshader|llvmpipe|software|basic render|microsoft basic/i.test(name);
      } catch (e) { return false; }
    })();
    const lowCPU = (navigator.hardwareConcurrency || 8) <= 4;
    let PR_HI = soft ? 1 : Math.min(window.devicePixelRatio || 1, lowCPU ? 1.25 : 1.5);
    let PR_LO = soft ? 0.6 : 1;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: !soft, alpha: true, powerPreference: 'high-performance' });
    } catch (e) { root.classList.add('is-failed'); return; }
    root.classList.toggle('is-soft', soft);
    let prNow = PR_HI;
    renderer.setPixelRatio(PR_HI);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;
    renderer.shadowMap.enabled = !soft;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.shadowMap.autoUpdate = false; // the scenes never move: draw shadows once per scene
    const ANISO = Math.min(8, renderer.capabilities.getMaxAnisotropy());

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    await yieldFrame();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200);
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minPolarAngle = 0.22;
    controls.maxPolarAngle = 1.4; // never below the floor
    controls.enablePan = false;
    controls.autoRotateSpeed = 0.6;

    scene.add(new THREE.HemisphereLight(0xfff3e6, 0xd8b08a, 0.5));
    const sun = new THREE.DirectionalLight(0xfff0dc, 1.8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1536, 1536);
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.025;
    scene.add(sun, sun.target);

    // ---------- canvas textures (redrawn when the details change) ----------
    const TEX = [];
    function canvasTex(w, h, draw, { repeat } = {}) {
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const g = c.getContext('2d');
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = ANISO;
      if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
      t.redraw = () => { g.save(); g.clearRect(0, 0, w, h); draw(g, w, h); g.restore(); t.needsUpdate = true; };
      t.redraw();
      TEX.push(t);
      return t;
    }
    const F_TITLE = '"Plus Jakarta Sans", Inter, Arial, sans-serif';
    const F_HAND = 'Caveat, "Segoe Print", cursive';
    const F_BODY = 'Inter, Arial, sans-serif';
    const GLAZE = new Path2D('M6 33c0-12 12-20 26-20s26 8 26 20c-4 3-6-1-9 2s-2 7-6 7-4-5-8-5-4 6-8 5-3-6-7-5-4 2-6-1-6 0-8-3z');
    const PAL = { color: ['#cf914c', '#f7e2bd', '#ff6a13', '#ffffff'], reverse: ['#ffffff', '#ffd2b0', '#3a1e10', '#ffffff'] };
    // the mark: a filled donut, no hole. (x, y) = top-left of a square of size s
    function icon(g, x, y, s, v = 'color') {
      const p = PAL[v];
      g.save(); g.translate(x, y); g.scale(s / 64, s / 64);
      g.fillStyle = p[0]; g.beginPath(); g.ellipse(32, 38, 28, 20, 0, 0, Math.PI * 2); g.fill();
      g.globalAlpha = 0.8; g.fillStyle = p[1]; g.beginPath(); g.ellipse(32, 40, 27, 4, 0, 0, Math.PI * 2); g.fill();
      g.globalAlpha = 1; g.fillStyle = p[2]; g.fill(GLAZE);
      g.globalAlpha = 0.45; g.fillStyle = p[3]; g.beginPath(); g.ellipse(22, 22, 7, 3, -0.31, 0, Math.PI * 2); g.fill();
      g.restore();
    }
    function fontSet(g, weight, size, fam) { g.font = `${weight} ${size}px ${fam}`; }
    // horizontal lock-up centred on (cx, cy), shrunk until it fits maxW
    function lockup(g, cx, cy, maxW, size, c1, c2, iv = 'color') {
      const [a, b] = words();
      let f = size;
      for (let k = 0; k < 30; k++) {
        fontSet(g, 800, f, F_TITLE); g.letterSpacing = `${-f * 0.035}px`;
        const wa = g.measureText(a).width, wb = b ? g.measureText(b).width : 0, gap = b ? f * 0.05 : 0;
        const total = f * 1.45 + f * 0.32 + wa + gap + wb;
        if (total <= maxW || k === 29) {
          const x0 = cx - total / 2;
          icon(g, x0, cy - f * 1.45 * 0.56, f * 1.45, iv);
          g.textBaseline = 'middle';
          const tx = x0 + f * 1.77;
          g.fillStyle = c1; g.fillText(a, tx, cy + f * 0.05);
          if (b) { g.fillStyle = c2; g.fillText(b, tx + wa + gap, cy + f * 0.05); }
          g.letterSpacing = '0px';
          return f;
        }
        f *= 0.93;
      }
      return f;
    }
    function fitText(g, text, x, y, maxW, weight, size, fam, color, align = 'left') {
      let f = size;
      fontSet(g, weight, f, fam);
      while (g.measureText(text).width > maxW && f > 8) { f *= 0.94; fontSet(g, weight, f, fam); }
      g.fillStyle = color; g.textAlign = align; g.fillText(text, x, y); g.textAlign = 'left';
      return f;
    }
    // a glaze band of height `base` along the top, with drips hanging below
    function drip(g, x, y, w, base, color, seed = 3) {
      let s = seed;
      const r = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
      g.fillStyle = color;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + w, y); g.lineTo(x + w, y + base);
      let cx = x + w;
      while (cx > x + 1) {
        const seg = Math.min(cx - x, w * (0.045 + r() * 0.05));
        const d = base * (0.25 + r() * 1.5), rad = seg * 0.26, mid = cx - seg / 2;
        g.bezierCurveTo(cx - seg * 0.12, y + base, mid + rad, y + base + d * 0.25, mid + rad, y + base + d - rad);
        g.arc(mid, y + base + d - rad, rad, 0, Math.PI, false);
        g.bezierCurveTo(mid - rad, y + base + d * 0.25, cx - seg + seg * 0.12, y + base, cx - seg, y + base);
        cx -= seg;
      }
      g.lineTo(x, y); g.closePath(); g.fill();
    }
    function wood(g, w, h, base, line) {
      g.fillStyle = base; g.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += h / 8) {
        g.fillStyle = line; g.fillRect(0, y, w, 3);
        g.globalAlpha = 0.12; g.fillStyle = '#5a3418';
        for (let k = 0; k < 6; k++) g.fillRect((k * 97 + y * 3) % w, y + 10 + (k % 3) * 9, 60 + (k * 31) % 90, 2);
        g.globalAlpha = 1;
      }
    }

    await yieldFrame();
    const T = {
      fillSign: canvasTex(768, 220, (g, w, h) => {
        g.fillStyle = '#3a1e10'; g.fillRect(0, 0, w, h);
        icon(g, 26, h / 2 - 72, 144, 'color');
        fitText(g, 'watch us fill', 196, h * 0.52, w - 220, 700, 92, F_HAND, '#ffd2b0');
        fitText(g, 'every donut, to the edge', 196, h * 0.84, w - 220, 600, 32, F_BODY, '#ffb27a');
      }),
      floor: canvasTex(1024, 1024, (g, w, h) => {
        const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
        gr.addColorStop(0, 'rgba(255,247,239,1)'); gr.addColorStop(0.55, 'rgba(255,242,230,0.96)'); gr.addColorStop(1, 'rgba(255,242,230,0)');
        g.fillStyle = gr; g.fillRect(0, 0, w, h);
        g.globalCompositeOperation = 'source-atop';
        g.strokeStyle = 'rgba(232,87,6,0.17)'; g.lineWidth = 2;
        for (let i = 0; i <= w; i += 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, h); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(w, i); g.stroke(); }
      }),
      sign: canvasTex(2048, 512, (g, w, h) => {
        g.fillStyle = '#3a1e10'; g.fillRect(0, 0, w, h);
        g.strokeStyle = 'rgba(255,178,122,0.55)'; g.lineWidth = 6; g.strokeRect(24, 24, w - 48, h - 48);
        lockup(g, w / 2, h / 2, w * 0.82, 230, '#ffffff', '#ffb27a');
      }),
      counter: canvasTex(2048, 860, (g, w, h) => {
        g.fillStyle = '#ff6a13'; g.fillRect(0, 0, w, h);
        g.fillStyle = '#3a1e10'; g.fillRect(0, h * 0.9, w, h * 0.1);
        drip(g, 0, 0, w, h * 0.09, '#fff8f1', 5);
        lockup(g, w / 2, h * 0.5, w * 0.6, 190, '#ffffff', '#ffffff', 'reverse');
        fitText(g, val('tagline'), w / 2, h * 0.74, w * 0.6, 700, h * 0.1, F_HAND, '#fff1e4', 'center');
      }),
      counterLong: canvasTex(3072, 570, (g, w, h) => {
        g.fillStyle = '#ff6a13'; g.fillRect(0, 0, w, h);
        g.fillStyle = '#3a1e10'; g.fillRect(0, h * 0.9, w, h * 0.1);
        drip(g, 0, 0, w, h * 0.08, '#fff8f1', 11);
        lockup(g, w / 2, h * 0.5, w * 0.34, 200, '#ffffff', '#ffffff', 'reverse');
        g.globalAlpha = 0.9;
        for (const fx of [0.12, 0.88]) icon(g, w * fx - 90, h * 0.5 - 100, 180, 'reverse');
        g.globalAlpha = 1;
        fitText(g, val('tagline'), w / 2, h * 0.76, w * 0.3, 700, h * 0.11, F_HAND, '#fff1e4', 'center');
      }),
      side: canvasTex(1024, 860, (g, w, h) => {
        g.fillStyle = '#ff6a13'; g.fillRect(0, 0, w, h);
        g.fillStyle = '#3a1e10'; g.fillRect(0, h * 0.9, w, h * 0.1);
        drip(g, 0, 0, w, h * 0.09, '#fff8f1', 9);
        icon(g, w / 2 - 170, h * 0.47 - 190, 340, 'reverse');
        fitText(g, 'fresh at 5 AM', w / 2, h * 0.8, w * 0.8, 700, 92, F_HAND, '#fff1e4', 'center');
      }),
      valance: canvasTex(1024, 170, (g, w, h) => {
        g.beginPath(); g.moveTo(0, 0); g.lineTo(w, 0); g.lineTo(w, 112);
        for (let x = w; x > 0; x -= 64) g.arc(x - 32, 112, 32, 0, Math.PI, false);
        g.closePath(); g.clip();
        for (let x = 0; x < w; x += 64) { g.fillStyle = (x / 64) % 2 ? '#ffffff' : '#ff6a13'; g.fillRect(x, 0, 64, h); }
        g.fillStyle = 'rgba(58,30,16,0.12)'; g.fillRect(0, 0, w, 10);
      }),
      stripes: canvasTex(512, 64, (g, w, h) => {
        for (let x = 0; x < w; x += 64) { g.fillStyle = (x / 64) % 2 ? '#fff8f1' : '#ff6a13'; g.fillRect(x, 0, 64, h); }
      }),
      menu: canvasTex(1600, 900, (g, w, h) => drawMenu(g, w, h, [['Premium', MENU.premium.slice(0, 6)], ['Classic', MENU.classic.slice(0, 6)], ['Drinks', MENU.hot.slice(0, 3).concat(MENU.iced.slice(0, 3))]])),
      menuA: canvasTex(1200, 800, (g, w, h) => drawBoard(g, w, h, 'Premium', MENU.premium.slice(0, 7))),
      menuB: canvasTex(1200, 800, (g, w, h) => drawBoard(g, w, h, 'Classic', MENU.classic.slice(0, 7))),
      menuC: canvasTex(1200, 800, (g, w, h) => drawBoard(g, w, h, 'Drinks', MENU.hot.slice(0, 3).concat(MENU.iced.slice(0, 4)))),
      promo: canvasTex(600, 900, (g, w, h) => {
        const gr = g.createRadialGradient(w * 0.6, h * 0.35, 20, w * 0.5, h * 0.5, h * 0.7);
        gr.addColorStop(0, '#ffb27a'); gr.addColorStop(0.5, '#ff6a13'); gr.addColorStop(1, '#c94700');
        g.fillStyle = gr; g.fillRect(0, 0, w, h);
        fitText(g, 'good morning!', w / 2, 110, w * 0.8, 700, 70, F_HAND, '#ffe2c7', 'center');
        fitText(g, 'Box of 6', w / 2, 230, w * 0.84, 800, 120, F_TITLE, '#ffffff', 'center');
        icon(g, w / 2 - 170, 300, 340, 'reverse');
        fitText(g, '+ a drink on us', w / 2, 720, w * 0.84, 700, 76, F_HAND, '#ffffff', 'center');
        fitText(g, val('hoursWk'), w / 2, 820, w * 0.84, 600, 34, F_BODY, '#fff1e4', 'center');
      }),
      neon: canvasTex(1024, 256, (g, w, h) => {
        g.font = `700 150px ${F_HAND}`; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.shadowColor = '#ff6a13'; g.shadowBlur = 42; g.fillStyle = '#ffd2b0'; g.fillText('fresh at 5 AM', w / 2, h / 2);
        g.shadowBlur = 12; g.fillText('fresh at 5 AM', w / 2, h / 2);
      }),
      wallLogo: canvasTex(2048, 600, (g, w, h) => {
        lockup(g, w / 2, h * 0.42, w * 0.94, 250, '#3a1e10', '#ff6a13');
        fitText(g, val('tagline'), w / 2, h * 0.88, w * 0.6, 700, 96, F_HAND, '#d64f00', 'center');
      }),
      boxLid: canvasTex(256, 256, (g, w, h) => {
        g.fillStyle = '#ff6a13'; g.fillRect(0, 0, w, h);
        g.strokeStyle = 'rgba(255,255,255,0.3)'; g.lineWidth = 10; g.strokeRect(8, 8, w - 16, h - 16);
        icon(g, w / 2 - 70, 40, 140, 'reverse');
        fitText(g, words().join(''), w / 2, 210, w * 0.8, 800, 36, F_TITLE, '#ffffff', 'center');
      }),
      mat: canvasTex(1024, 512, (g, w, h) => {
        g.fillStyle = '#3a1e10'; g.fillRect(0, 0, w, h);
        g.strokeStyle = '#ff6a13'; g.lineWidth = 14; g.strokeRect(24, 24, w - 48, h - 48);
        lockup(g, w / 2, h * 0.44, w * 0.8, 110, '#ffffff', '#ffb27a');
        fitText(g, 'come on in, it\'s warm', w / 2, h * 0.78, w * 0.7, 700, 64, F_HAND, '#ffd2b0', 'center');
      }),
      checker: canvasTex(512, 512, (g, w, h) => {
        const n = 8, s = w / n;
        for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = (i + j) % 2 ? '#ffd9bd' : '#fff6ec'; g.fillRect(i * s, j * s, s, s); }
        g.strokeStyle = 'rgba(58,30,16,0.06)'; g.lineWidth = 2;
        for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, h); g.stroke(); g.beginPath(); g.moveTo(0, i * s); g.lineTo(w, i * s); g.stroke(); }
      }, { repeat: [5, 3.5] }),
      planks: canvasTex(512, 512, (g, w, h) => wood(g, w, h, '#c99a6b', 'rgba(90,52,24,0.35)'), { repeat: [2, 1.5] }),
      dripCream: canvasTex(2048, 220, (g, w) => drip(g, 0, 0, w, 40, '#fff3e6', 17), { repeat: [2.5, 1] }),
    };
    function drawMenu(g, w, h, cols) {
      const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#3b2216'); gr.addColorStop(1, '#1f0f07');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.strokeStyle = '#6e4630'; g.lineWidth = 26; g.strokeRect(13, 13, w - 26, h - 26);
      lockup(g, 330, 112, 520, 62, '#ffffff', '#ffb27a');
      fitText(g, val('tagline'), w - 70, 128, 600, 700, 56, F_HAND, '#ffd2b0', 'right');
      const cw = (w - 140) / 3;
      cols.forEach(([title, items], i) => {
        const x = 70 + i * cw, iw = cw - 50;
        fitText(g, title, x, 245, iw, 700, 66, F_HAND, '#ffb27a');
        items.forEach(([n, p], j) => {
          const y = 318 + j * 74;
          fontSet(g, 700, 32, F_BODY);
          const pw = g.measureText(money(p)).width;
          fitText(g, n, x, y, iw - pw - 18, 500, 32, F_BODY, '#ffffff');
          fitText(g, money(p), x + iw, y, pw + 2, 700, 32, F_BODY, '#ffd2b0', 'right');
          g.fillStyle = 'rgba(255,255,255,0.14)'; g.fillRect(x, y + 18, iw, 2);
        });
      });
      fitText(g, 'Every box of 6 comes with a free drink.', 70, h - 62, w - 140, 600, 30, F_BODY, '#ffd2b0');
    }
    function drawBoard(g, w, h, title, items) {
      const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#3b2216'); gr.addColorStop(1, '#1f0f07');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.strokeStyle = '#6e4630'; g.lineWidth = 22; g.strokeRect(11, 11, w - 22, h - 22);
      fitText(g, title, 70, 140, w - 140, 700, 96, F_HAND, '#ffb27a');
      items.forEach(([n, p], j) => {
        const y = 240 + j * 76;
        fontSet(g, 700, 38, F_BODY);
        const pw = g.measureText(money(p)).width;
        fitText(g, n, 70, y, w - 180 - pw, 500, 38, F_BODY, '#ffffff');
        fitText(g, money(p), w - 70, y, pw + 2, 700, 38, F_BODY, '#ffd2b0', 'right');
        g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(70, y + 20, w - 140, 2);
      });
    }

    // ---------- materials + builders ----------
    const std = (color, r = 0.6, m = 0, x = {}) => new THREE.MeshStandardMaterial({ color, roughness: r, metalness: m, ...x });
    const M = {
      orange: std(0xff6a13, 0.42), orangeD: std(0xe85706, 0.5), brown: std(0x3a1e10, 0.55), brown2: std(0x6e4630, 0.6),
      cream: std(0xfff8f1, 0.7), top: std(0xfff6ec, 0.22), wood: std(0xc99a6b, 0.7), white: std(0xffffff, 0.45),
      steel: std(0xd9d9d9, 0.26, 0.85), steelDark: std(0x8c8c8c, 0.34, 0.8), leaf: std(0x6f9a4a, 0.8, 0, { flatShading: true }),
      leaf2: std(0x8fb562, 0.8, 0, { flatShading: true }), wallCream: std(0xfff3e6, 0.92), wallPeach: std(0xffd3b0, 0.9),
      glass: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.14, depthWrite: false }),
      bulb: new THREE.MeshBasicMaterial({ color: 0xffdcae, toneMapped: false }),
      neon: new THREE.MeshBasicMaterial({ color: 0xffb27a, toneMapped: false }),
      neonGlow: new THREE.MeshBasicMaterial({ color: 0xff6a13, transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }),
      planks: std(0xffffff, 0.75, 0, { map: T.planks }),
      checker: std(0xffffff, 0.35, 0, { map: T.checker }),
      shadeIn: new THREE.MeshStandardMaterial({ color: 0xffe2c4, roughness: 0.6, side: THREE.BackSide, emissive: 0xffc58a, emissiveIntensity: 0.5 }),
    };
    function mesh(geo, mtl, x, y, z, parent, cast = true) {
      const m = new THREE.Mesh(geo, mtl); m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; parent.add(m); return m;
    }
    // y is the BOTTOM of the box / cylinder
    const boxB = (w, h, d, mtl, x, y, z, p, cast) => mesh(new THREE.BoxGeometry(w, h, d), mtl, x, y + h / 2, z, p, cast);
    const cyl = (rt, rb, h, mtl, x, y, z, p, seg = 24, cast) => mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mtl, x, y + h / 2, z, p, cast);
    function panel(w, h, tex, x, y, z, ry, parent, o = {}) {
      const mtl = new THREE.MeshStandardMaterial({
        map: tex, roughness: o.r ?? 0.62, transparent: !!o.transparent, alphaTest: o.alphaTest || 0,
        depthWrite: !o.transparent, side: o.double ? THREE.DoubleSide : THREE.FrontSide,
        emissive: o.lit ? 0xffffff : 0x000000, emissiveMap: o.lit ? tex : null, emissiveIntensity: o.lit || 0,
      });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mtl);
      m.position.set(x, y, z); m.rotation.y = ry || 0; m.receiveShadow = !o.lit; parent.add(m);
      return m;
    }
    function valance(width, x, y, z, ry, parent) {
      const t = T.valance.clone(); t.wrapS = THREE.RepeatWrapping; t.repeat.set(width / 1.15, 1); t.needsUpdate = true;
      return panel(width, 0.3, t, x, y, z, ry, parent, { alphaTest: 0.5, double: true });
    }

    // donuts: instanced, filled, NO hole (dough bun + fry band + glossy glaze cap + sprinkles)
    const GLAZES = [0xff6a13, 0x2e1810, 0xff8fb4, 0xfbf1e2, 0xa8d48f, 0xa46be0, 0xd9a066, 0x6b3f26];
    const SPR = [0xffffff, 0xff6a13, 0xffd166, 0x8fd3ff, 0xffb9cc, 0x3a1e10];
    const DG = {
      dough: new THREE.SphereGeometry(0.5, 22, 12), band: new THREE.CylinderGeometry(0.503, 0.503, 0.06, 22, 1, true),
      cap: new THREE.SphereGeometry(0.508, 22, 8, 0, Math.PI * 2, 0, Math.PI * 0.37), spr: new THREE.CapsuleGeometry(0.02, 0.075, 1, 5),
      drip: new THREE.CapsuleGeometry(0.05, 0.1, 3, 10),
    };
    const DM = { dough: std(0xd49a55, 0.78), fry: std(0xf3dcb4, 0.85), spr: std(0xffffff, 0.5) };
    const GM = GLAZES.map((c) => std(c, 0.26));
    function donutBatch(list, parent, cast = false) {
      if (!list.length) return;
      const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3(), e = new THREE.Euler();
      const add = (geo, mtl, items, fn) => {
        if (!items.length) return;
        const im = new THREE.InstancedMesh(geo, mtl, items.length);
        items.forEach((d, i) => { fn(d, i, im); im.setMatrixAt(i, m4); });
        im.castShadow = cast; im.receiveShadow = true; parent.add(im);
      };
      add(DG.dough, DM.dough, list, (d) => { q.setFromEuler(e.set(0, d.ry || 0, 0)); m4.compose(p.set(d.x, d.y + 0.275 * d.s, d.z), q, s.set(d.s, 0.55 * d.s, d.s)); });
      add(DG.band, DM.fry, list, (d) => { q.identity(); m4.compose(p.set(d.x, d.y + 0.255 * d.s, d.z), q, s.set(d.s, d.s, d.s)); });
      GLAZES.forEach((_, gi) => add(DG.cap, GM[gi], list.filter((d) => d.g === gi), (d) => { q.identity(); m4.compose(p.set(d.x, d.y + 0.28 * d.s, d.z), q, s.set(d.s, 0.6 * d.s, d.s)); }));
      const sp = [];
      list.forEach((d, k) => {
        if (!d.spr) return;
        for (let i = 0; i < 9; i++) {
          const a = (i * 2.399 + k) % (Math.PI * 2), r = 0.08 + ((i * 37 + k * 11) % 23) / 23 * 0.24;
          const yy = 0.6 * Math.sqrt(Math.max(0, 0.508 * 0.508 - r * r));
          sp.push({ x: d.x + Math.cos(a) * r * d.s, y: d.y + (0.28 + yy) * d.s, z: d.z + Math.sin(a) * r * d.s, s: d.s, a: a * 3.1, c: SPR[(i + k) % SPR.length] });
        }
      });
      const col = new THREE.Color();
      add(DG.spr, DM.spr, sp, (d, i, im) => {
        q.setFromEuler(e.set(Math.PI / 2, 0, d.a)); m4.compose(p.set(d.x, d.y, d.z), q, s.set(d.s, d.s, d.s));
        im.setColorAt(i, col.setHex(d.c));
      });
    }
    function bigDonut(x, y, z, s, parent) {
      const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s); parent.add(g);
      const dough = mesh(new THREE.SphereGeometry(0.5, 40, 24), DM.dough, 0, 0.275, 0, g); dough.scale.y = 0.55;
      const cap = mesh(new THREE.SphereGeometry(0.509, 40, 16, 0, Math.PI * 2, 0, Math.PI * 0.42), GM[0], 0, 0.27, 0, g); cap.scale.y = 0.62;
      for (let i = 0; i < 11; i++) {
        const a = i / 11 * Math.PI * 2 + (i % 3) * 0.17, len = 0.6 + ((i * 7) % 5) / 5 * 0.9;
        const d = mesh(DG.drip, GM[0], Math.cos(a) * 0.455, 0.2 - 0.035 * len, Math.sin(a) * 0.455, g);
        d.scale.set(0.9, len, 0.55); d.rotation.y = -a; d.rotation.z = 0.12;
      }
      const sp = [];
      for (let i = 0; i < 26; i++) { const a = i * 2.399, r = 0.05 + (i % 9) / 9 * 0.3; sp.push({ x: Math.cos(a) * r, y: 0.27 + 0.62 * Math.sqrt(0.509 * 0.509 - r * r), z: Math.sin(a) * r, a: a * 2.3, c: SPR[i % SPR.length] }); }
      const im = new THREE.InstancedMesh(DG.spr, DM.spr, sp.length), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), col = new THREE.Color();
      sp.forEach((d, i) => { q.setFromEuler(new THREE.Euler(Math.PI / 2, 0, d.a)); m4.compose(new THREE.Vector3(d.x, d.y, d.z), q, new THREE.Vector3(1, 1, 1)); im.setMatrixAt(i, m4); im.setColorAt(i, col.setHex(d.c)); });
      im.castShadow = true; g.add(im);
      g.traverse((o) => { o.castShadow = true; });
    }
    let dIndex = 0;    const nextDonut = (x, y, z, s = 0.09) => ({ x, y, z, s, g: dIndex % GLAZES.length, spr: dIndex++ % 3 === 0, ry: (dIndex * 1.3) % 6.28 });

    function displayCase(w, h, d, x, y, z, parent, list, shelves = 2) {
      boxB(w, 0.04, d, M.brown, x, y, z, parent);
      const glass = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M.glass); glass.position.set(x, y + 0.04 + h / 2, z); parent.add(glass);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) boxB(0.022, h, 0.022, M.brown, x + sx * (w / 2 - 0.011), y + 0.04, z + sz * (d / 2 - 0.011), parent, false);
      boxB(w, 0.025, d, M.brown, x, y + 0.04 + h, z, parent, false);
      const cols = Math.max(1, Math.floor((w - 0.06) / 0.115)), rows = Math.max(1, Math.floor((d - 0.05) / 0.12));
      for (let sIdx = 0; sIdx < shelves; sIdx++) {
        const sy = y + 0.04 + sIdx * (h / shelves);
        if (sIdx) boxB(w - 0.03, 0.012, d - 0.03, M.white, x, sy - 0.012, z, parent, false);
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) list.push(nextDonut(x - ((cols - 1) * 0.115) / 2 + c * 0.115, sy + 0.005, z - ((rows - 1) * 0.12) / 2 + r * 0.12));
      }
    }
    function coffeeMachine(x, y, z, ry, parent) {
      const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g);
      boxB(0.64, 0.44, 0.46, M.steel, 0, 0, 0, g);
      boxB(0.66, 0.07, 0.48, M.orange, 0, 0.44, 0, g);
      for (const dx of [-0.16, 0.16]) cyl(0.042, 0.042, 0.08, M.steelDark, dx, 0.2, 0.26, g);
      boxB(0.52, 0.02, 0.16, M.steelDark, 0, 0.03, 0.31, g);
      for (let i = 0; i < 4; i++) cyl(0.04, 0.032, 0.09, M.white, -0.21 + i * 0.14, 0.51, -0.08, g, 16, false);
    }
    function cupStack(x, y, z, parent, n = 3) {
      for (let i = 0; i < n; i++) cyl(0.046, 0.035, 0.3, i % 2 ? M.orange : M.white, x + i * 0.11, y, z, parent, 16);
    }
    function boxStack(x, y, z, parent, n = 3) {
      const lid = std(0xffffff, 0.55, 0, { map: T.boxLid });
      const mats = [M.orange, M.orange, lid, M.orange, M.orange, M.orange];
      for (let i = 0; i < n; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.08, 0.26), mats); m.position.set(x + (i % 2) * 0.01, y + 0.04 + i * 0.082, z); m.rotation.y = (i % 2) * 0.12; m.castShadow = true; m.receiveShadow = true; parent.add(m); }
    }
    function stool(x, z, parent, h = 0.76) {
      const g = new THREE.Group(); g.position.set(x, 0, z); parent.add(g);
      cyl(0.19, 0.17, 0.07, M.orange, 0, h - 0.07, 0, g);
      for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4; cyl(0.014, 0.018, h - 0.07, M.brown, Math.cos(a) * 0.13, 0, Math.sin(a) * 0.13, g, 10); }
      const ring = mesh(new THREE.TorusGeometry(0.13, 0.01, 8, 28), M.brown, 0, 0.28, 0, g); ring.rotation.x = Math.PI / 2;
    }
    function chair(x, z, ry, parent, seat = M.orange) {
      const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; parent.add(g);
      boxB(0.42, 0.045, 0.42, seat, 0, 0.44, 0, g);
      boxB(0.42, 0.36, 0.04, M.brown, 0, 0.5, -0.19, g);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(0.014, 0.014, 0.44, M.brown, sx * 0.18, 0, sz * 0.18, g, 10);
    }
    function table(x, z, parent, r = 0.36, h = 0.74) {
      cyl(r, r, 0.04, M.top, x, h - 0.04, z, parent, 32);
      cyl(0.035, 0.035, h - 0.04, M.brown, x, 0, z, parent, 12);
      cyl(0.22, 0.24, 0.03, M.brown, x, 0, z, parent, 24);
    }
    function plant(x, z, parent, s = 1) {
      cyl(0.2 * s, 0.15 * s, 0.42 * s, M.brown, x, 0, z, parent, 20);
      const f = [[0, 0.62, 0, 0.3], [0.12, 0.82, 0.05, 0.22], [-0.1, 0.78, -0.06, 0.2], [0.02, 1.0, 0, 0.16]];
      f.forEach(([dx, dy, dz, r], i) => mesh(new THREE.IcosahedronGeometry(r * s, 1), i % 2 ? M.leaf2 : M.leaf, x + dx * s, dy * s, z + dz * s, parent));
    }
    function pendant(x, y, z, ceil, parent) {
      cyl(0.004, 0.004, ceil - y - 0.12, M.brown, x, y + 0.12, z, parent, 6, false);
      const shade = mesh(new THREE.CylinderGeometry(0.055, 0.22, 0.24, 30, 1, true), M.orange, x, y, z, parent, false);
      shade.material = [M.orange][0];
      mesh(new THREE.CylinderGeometry(0.054, 0.218, 0.238, 30, 1, true), M.shadeIn, x, y, z, parent, false);
      mesh(new THREE.SphereGeometry(0.05, 16, 10), M.bulb, x, y - 0.08, z, parent, false);
    }
    function aFrame(x, z, ry, parent) {
      const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; parent.add(g);
      for (const side of [1, -1]) {
        const hinge = new THREE.Group(); hinge.position.set(0, 0.98, 0); hinge.rotation.x = -side * 0.24; g.add(hinge);
        boxB(0.62, 0.98, 0.035, M.brown, 0, -0.98, 0, hinge);
        panel(0.52, 0.8, T.promo, 0, -0.5, side * 0.019, side > 0 ? 0 : Math.PI, hinge, { r: 0.5 });
      }
    }
    function stringLights(a, b, n, sag, parent) {
      const pts = [];
      for (let i = 0; i <= 24; i++) { const t = i / 24; pts.push(new THREE.Vector3().lerpVectors(a, b, t).add(new THREE.Vector3(0, -sag * 4 * t * (1 - t), 0))); }
      const curve = new THREE.CatmullRomCurve3(pts);
      mesh(new THREE.TubeGeometry(curve, 48, 0.006, 6, false), M.brown, 0, 0, 0, parent, false);
      for (let i = 1; i < n; i++) { const p = curve.getPoint(i / n); mesh(new THREE.SphereGeometry(0.035, 12, 8), M.bulb, p.x, p.y - 0.04, p.z, parent, false); }
    }
    function parasol(x, z, parent) {
      cyl(0.02, 0.02, 2.25, M.brown, x, 0, z, parent, 10);
      const t = T.stripes.clone(); t.wrapS = THREE.RepeatWrapping; t.repeat.set(2, 1); t.needsUpdate = true;
      const cone = mesh(new THREE.ConeGeometry(1.15, 0.42, 16, 1, true), std(0xffffff, 0.6, 0, { map: t, side: THREE.DoubleSide }), x, 2.25 + 0.21 - 0.05, z, parent);
      cone.castShadow = true;
      mesh(new THREE.SphereGeometry(0.04, 10, 8), M.brown, x, 2.47, z, parent, false);
    }
    function neonSign(x, y, z, ry, parent, w = 1.7) {
      const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g);
      boxB(w, 1.15, 0.04, M.brown, 0, -0.575, 0, g, false);
      // the logo silhouette in neon: a filled dome with a dripping glaze line (no ring, no hole)
      const dome = [], dripLine = [];
      for (let i = 0; i <= 28; i++) { const a = Math.PI * (i / 28); dome.push(new THREE.Vector3(-Math.cos(a) * 0.34, Math.sin(a) * 0.26, 0)); }
      dome.push(new THREE.Vector3(0.34, -0.1, 0), new THREE.Vector3(-0.34, -0.1, 0));
      for (let i = 0; i <= 40; i++) { const t = i / 40, x = -0.33 + t * 0.66; dripLine.push(new THREE.Vector3(x, 0.02 - Math.max(0, Math.sin(t * Math.PI * 4.5)) * 0.07, 0)); }
      const tube = (pts, r, mtl, closed) => mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, closed, 'catmullrom', 0.1), 120, r, 8, closed), mtl, 0, 0.16, 0.05, g, false);
      tube(dome, 0.018, M.neon, true); tube(dome, 0.055, M.neonGlow, true);
      tube(dripLine, 0.016, M.neon, false); tube(dripLine, 0.05, M.neonGlow, false);
      const txt = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.92, w * 0.23), new THREE.MeshBasicMaterial({ map: T.neon, transparent: true, toneMapped: false, depthWrite: false }));
      txt.position.set(0, -0.32, 0.03); g.add(txt);
    }

    // ---------- the three locations ----------
    function buildKiosk() {
      const g = new THREE.Group(), donuts = [];
      const W = 2.6, D = 1.8, CH = 1.02;
      boxB(W + 0.14, 0.06, D + 0.14, M.brown, 0, 0, 0, g);
      // front counter + branded panel
      boxB(W, CH - 0.06, 0.62, M.orange, 0, 0.06, D / 2 - 0.31, g);
      panel(W, CH - 0.06, T.counter, 0, 0.06 + (CH - 0.06) / 2, D / 2 + 0.004, 0, g);
      // side counters
      for (const sx of [-1, 1]) {
        boxB(0.62, CH - 0.06, D - 0.62, M.orange, sx * (W / 2 - 0.31), 0.06, -0.31, g);
        panel(D - 0.62, CH - 0.06, T.side, sx * (W / 2 + 0.004), 0.06 + (CH - 0.06) / 2, -0.31, sx * Math.PI / 2, g);
        boxB(0.7, 0.05, D - 0.6, M.top, sx * (W / 2 - 0.31), CH, -0.31, g);
      }
      boxB(W + 0.08, 0.05, 0.7, M.top, 0, CH, D / 2 - 0.31, g);
      displayCase(1.34, 0.42, 0.5, -0.4, CH + 0.05, D / 2 - 0.32, g, donuts);
      boxB(0.26, 0.18, 0.2, M.brown, 0.82, CH + 0.05, D / 2 - 0.3, g); // till
      const tab = boxB(0.26, 0.015, 0.18, M.steelDark, 0.82, CH + 0.25, D / 2 - 0.3, g); tab.rotation.x = -0.5;
      // back counter: coffee, cups, boxes
      boxB(W - 1.24, 0.94, 0.5, M.brown2, 0, 0.06, -D / 2 + 0.25, g);
      boxB(W - 1.2, 0.04, 0.54, M.top, 0, 1.0, -D / 2 + 0.25, g);
      coffeeMachine(0.75, 1.04, -D / 2 + 0.27, 0, g);
      cupStack(-0.75, 1.04, -D / 2 + 0.2, g, 2);
      boxStack(0.75, CH + 0.05, -0.2, g, 3);
      // posts, canopy, valance, light-box sign
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(0.035, 0.035, 2.3, M.brown, sx * (W / 2 + 0.03), 0.06, sz * (D / 2 + 0.03), g, 12);
      boxB(W + 0.5, 0.1, D + 0.5, M.brown, 0, 2.36, 0, g);
      valance(W + 0.5, 0, 2.21, (D + 0.5) / 2 + 0.003, 0, g);
      valance(W + 0.5, 0, 2.21, -(D + 0.5) / 2 - 0.003, Math.PI, g);
      for (const sx of [-1, 1]) valance(D + 0.5, sx * ((W + 0.5) / 2 + 0.003), 2.21, 0, sx * Math.PI / 2, g);
      boxB(2.1, 0.52, 0.24, M.brown, 0, 2.46, 0, g);
      panel(2.0, 0.48, T.sign, 0, 2.72, 0.125, 0, g, { lit: 0.35 });
      panel(2.0, 0.48, T.sign, 0, 2.72, -0.125, Math.PI, g, { lit: 0.35 });
      // menu board hanging above the back counter
      boxB(1.3, 0.76, 0.04, M.brown, -0.3, 1.47, -D / 2 + 0.06, g, false);
      panel(1.24, 0.7, T.menu, -0.3, 1.85, -D / 2 + 0.085, 0, g, { lit: 0.2 });
      aFrame(-0.95, 2.35, 1.0, g);
      plant(-2.15, 0.7, g, 1.1);
      donutBatch(donuts, g);
      return { group: g, cam: [5.3, 3.0, 6.4], target: [0.15, 1.25, 0.25], shadow: 4.5 };
    }

    function buildStall() {
      const g = new THREE.Group(), donuts = [];
      const W = 3.0, D = 1.9, H = 2.5;
      // seating deck
      boxB(4.8, 0.08, 3.2, M.planks, 1.0, 0, 2.75, g);
      // booth walls
      boxB(W, H, 0.08, M.orange, 0, 0, -D / 2 + 0.04, g);
      for (const sx of [-1, 1]) boxB(0.08, H, D, M.orange, sx * (W / 2 - 0.04), 0, 0, g);
      boxB(W, 1.0, 0.08, M.orange, 0, 0, D / 2 - 0.04, g);
      panel(W, 1.0, T.counter, 0, 0.5, D / 2 + 0.004, 0, g);
      boxB(W, 0.5, 0.08, M.brown, 0, 2.0, D / 2 - 0.04, g);
      panel(W - 0.06, 0.46, T.sign, 0, 2.25, D / 2 + 0.004, 0, g, { lit: 0.3 });
      // roof + the giant donut on top
      boxB(W + 0.5, 0.12, D + 0.5, M.brown, 0, H, 0, g);
      cyl(0.36, 0.42, 0.14, M.brown2, 0, H + 0.12, 0, g, 28);
      bigDonut(0, H + 0.26, 0, 1.05, g);
      // service window: ledge, flip-up striped awning, props
      boxB(W - 0.08, 0.05, 0.44, M.top, 0, 1.0, D / 2 + 0.16, g);
      const hinge = new THREE.Group(); hinge.position.set(0, 1.98, D / 2); hinge.rotation.x = 0.2; g.add(hinge);
      const stripe = T.stripes.clone(); stripe.wrapS = THREE.RepeatWrapping; stripe.repeat.set(3.2, 1); stripe.needsUpdate = true;
      const under = std(0xffffff, 0.6, 0, { map: stripe });
      const flap = new THREE.Mesh(new THREE.BoxGeometry(W + 0.24, 0.045, 0.95), [M.orange, M.orange, M.orange, under, M.orange, M.orange]);
      flap.position.set(0, 0, 0.475); flap.castShadow = true; hinge.add(flap);
      for (const sx of [-1, 1]) { const rod = mesh(new THREE.CylinderGeometry(0.01, 0.01, 1.0, 8), M.brown, sx * (W / 2 - 0.12), 2.12, D / 2 + 0.44, g, false); rod.rotation.x = -1.05; }
      // inside: back counter, display, coffee, menu
      boxB(W - 0.3, 0.9, 0.5, M.brown2, 0, 0, -D / 2 + 0.33, g);
      boxB(W - 0.26, 0.04, 0.54, M.top, 0, 0.9, -D / 2 + 0.33, g);
      displayCase(1.2, 0.36, 0.42, -0.6, 0.94, -D / 2 + 0.33, g, donuts);
      coffeeMachine(0.75, 0.94, -D / 2 + 0.33, 0, g);
      panel(1.5, 0.84, T.menu, 0, 1.85, -D / 2 + 0.085, 0, g, { lit: 0.2 });
      displayCase(1.0, 0.3, 0.36, 0.7, 1.05, D / 2 + 0.16, g, donuts, 1);
      // side wall: poster
      panel(0.86, 1.29, T.promo, W / 2 + 0.004, 1.3, 0.2, Math.PI / 2, g, { r: 0.5 });
      panel(1.4, 0.79, T.menu, -W / 2 - 0.004, 1.5, 0, -Math.PI / 2, g, { lit: 0.15 });
      // seats: stools at the window, two bistro tables, parasol
      for (const sx of [-0.95, 0, 0.95]) stool(sx, D / 2 + 0.66, g);
      table(0.45, 3.35, g); chair(-0.1, 3.35, Math.PI / 2, g); chair(1.0, 3.35, -Math.PI / 2, g);
      table(2.75, 3.85, g); chair(2.2, 3.85, Math.PI / 2, g); chair(3.3, 3.85, -Math.PI / 2, g, M.brown2);
      parasol(2.75, 3.85, g);
      cyl(0.03, 0.03, 2.6, M.brown, -1.3, 0.08, 4.25, g, 10);
      stringLights(new THREE.Vector3(W / 2 + 0.25, H + 0.06, D / 2 + 0.25), new THREE.Vector3(-1.3, 2.66, 4.25), 18, 0.28, g);
      stringLights(new THREE.Vector3(-W / 2 - 0.25, H + 0.06, D / 2 + 0.25), new THREE.Vector3(-1.3, 2.66, 4.25), 12, 0.2, g);
      plant(-1.95, 1.2, g); plant(3.2, 1.3, g, 0.9);
      aFrame(-2.3, 2.0, 1.0, g);
      donutBatch(donuts, g);
      return { group: g, cam: [7.0, 3.6, 8.2], target: [0.7, 1.15, 1.2], shadow: 6.5 };
    }

    function buildStore() {
      const g = new THREE.Group(), donuts = [];
      const W = 10, D = 7, H = 3.4, fl = 0.08;
      boxB(W, fl, D, M.checker, 0, 0, 0, g);
      // walls (cutaway: back + left only) with orange wainscot and a cream glaze drip over it
      boxB(W + 0.15, H, 0.15, M.wallCream, 0.075 - 0.075, fl, -D / 2 - 0.075, g);
      boxB(0.15, H, D, M.wallPeach, -W / 2 - 0.075, fl, 0, g);
      boxB(W, 1.1, 0.03, M.orange, 0, fl, -D / 2 + 0.015, g);
      boxB(0.03, 1.1, D, M.orange, -W / 2 + 0.015, fl, 0, g);
      const dBack = T.dripCream.clone(); dBack.wrapS = THREE.RepeatWrapping; dBack.repeat.set(5, 1); dBack.needsUpdate = true;
      panel(W, 1.1 * 0.107 * 10 * 0.1 + 0.11, dBack, 0, fl + 1.1 - 0.055, -D / 2 + 0.035, 0, g, { transparent: true });
      const dLeft = T.dripCream.clone(); dLeft.wrapS = THREE.RepeatWrapping; dLeft.repeat.set(3.5, 1); dLeft.needsUpdate = true;
      panel(D, 0.11 + 0.11, dLeft, -W / 2 + 0.035, fl + 1.1 - 0.055, 0, Math.PI / 2, g, { transparent: true });
      // big logo on the left wall, booths below it
      panel(4.4, 1.29, T.wallLogo, -W / 2 + 0.01, 2.35, 0.9, Math.PI / 2, g, { transparent: true, r: 0.5 });
      for (const z0 of [-0.7, 1.05, 2.8]) {
        const x0 = -W / 2;
        boxB(1.15, 0.04, 0.72, M.top, x0 + 0.75, fl + 0.7, z0, g);
        cyl(0.04, 0.04, 0.7, M.brown, x0 + 0.85, fl, z0, g, 10);
        for (const sd of [-1, 1]) {
          boxB(1.3, 0.42, 0.52, M.brown2, x0 + 0.65, fl, z0 + sd * 0.66, g);
          boxB(1.3, 0.09, 0.52, M.orange, x0 + 0.65, fl + 0.42, z0 + sd * 0.66, g);
          boxB(1.3, 0.62, 0.12, M.orange, x0 + 0.65, fl + 0.48, z0 + sd * 0.98, g);
        }
      }
      // counter with display, till, coffee
      const cz = -1.55, cx0 = -2.9, cx1 = 2.5, cw = cx1 - cx0, mid = (cx0 + cx1) / 2;
      boxB(cw, 1.0, 0.76, M.orange, mid, fl, cz, g);
      panel(cw, 1.0, T.counterLong, mid, fl + 0.5, cz + 0.384, 0, g);
      boxB(cw + 0.1, 0.05, 0.84, M.top, mid, fl + 1.0, cz, g);
      displayCase(3.0, 0.5, 0.56, cx0 + 1.75, fl + 1.05, cz, g, donuts, 2);
      boxB(0.3, 0.18, 0.22, M.brown, 1.65, fl + 1.05, cz, g);
      cupStack(2.0, fl + 1.05, cz - 0.1, g, 3);
      // the filling station: guests watch donuts being filled to the edge
      const sx = 0.95;
      boxB(0.86, 0.03, 0.5, M.steel, sx, fl + 1.05, cz, g, false);
      const fglass = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.52, 0.5), M.glass); fglass.position.set(sx, fl + 1.08 + 0.26, cz); g.add(fglass);
      const pbag = mesh(new THREE.ConeGeometry(0.075, 0.34, 20), M.white, sx - 0.05, fl + 1.08 + 0.3, cz, g); pbag.rotation.z = Math.PI + 0.45;
      donuts.push({ x: sx + 0.06, y: fl + 1.08, z: cz, s: 0.1, g: 3, spr: false, ry: 0 }, { x: sx + 0.27, y: fl + 1.08, z: cz - 0.11, s: 0.09, g: 0, spr: true, ry: 1 }, { x: sx + 0.29, y: fl + 1.08, z: cz + 0.11, s: 0.09, g: 2, spr: false, ry: 2 });
      boxB(0.92, 0.27, 0.03, M.brown, sx, fl + 1.7, cz, g, false);
      panel(0.88, 0.252, T.fillSign, sx, fl + 1.7 + 0.135, cz + 0.017, 0, g, { lit: 0.25 });
      for (const ox of [-0.38, 0.38]) cyl(0.004, 0.004, H - 1.97, M.brown, sx + ox, fl + 1.97, cz, g, 6, false);
      // back counter + machines + boxes + menu boards
      boxB(cw, 0.94, 0.55, M.brown2, mid, fl, -D / 2 + 0.33, g);
      boxB(cw + 0.06, 0.04, 0.6, M.top, mid, fl + 0.94, -D / 2 + 0.33, g);
      coffeeMachine(-1.9, fl + 0.98, -D / 2 + 0.35, 0, g);
      coffeeMachine(-1.1, fl + 0.98, -D / 2 + 0.35, 0, g);
      boxStack(0.4, fl + 0.98, -D / 2 + 0.33, g, 4); boxStack(0.75, fl + 0.98, -D / 2 + 0.33, g, 3); boxStack(1.1, fl + 0.98, -D / 2 + 0.33, g, 5);
      [[T.menuA, -1.85], [T.menuB, -0.25], [T.menuC, 1.35]].forEach(([t, x]) => {
        boxB(1.5, 1.0, 0.05, M.brown, x, 1.95, -D / 2 + 0.03, g, false);
        panel(1.44, 0.96, t, x, 2.45, -D / 2 + 0.058, 0, g, { lit: 0.22 });
      });
      for (const x of [-2.1, -0.4, 1.3]) pendant(x, 2.55, cz, H + fl, g);
      neonSign(3.75, 2.95, -D / 2 + 0.05, 0, g);
      // tables
      [[-1.5, 0.9], [0.5, 0.9], [2.5, 0.9], [-0.5, 2.7], [1.5, 2.7], [3.5, 2.7]].forEach(([x, z], i) => {
        table(x, z, g); chair(x - 0.55, z, Math.PI / 2, g, i % 2 ? M.brown2 : M.orange); chair(x + 0.55, z, -Math.PI / 2, g, i % 2 ? M.orange : M.brown2);
      });
      plant(4.45, -3.0, g, 1.3); plant(-1.2, -3.0, g, 0.9); plant(4.5, 3.1, g, 1.1);
      panel(1.6, 0.8, T.mat, 3.4, fl + 0.006, 3.0, 0, g).rotation.x = -Math.PI / 2;
      boxB(W, 0.06, 0.08, M.brown, 0, fl, D / 2 - 0.04, g); // shopfront sill
      donutBatch(donuts, g);
      return { group: g, cam: [10.5, 8.2, 12.0], target: [0, 1.0, 0.1], shadow: 9 };
    }

    // ---------- floor, switching, framing ----------
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(34, 34), new THREE.MeshStandardMaterial({ map: T.floor, transparent: true, roughness: 0.95, depthWrite: false }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -0.002; floor.receiveShadow = true; scene.add(floor);

    const LOCS = {
      kiosk: {
        build: buildKiosk, name: 'Mall kiosk',
        aria: 'Mall kiosk: an orange island counter with a cream glaze drip, a glass donut case, a coffee machine, a striped valance under a brown canopy and a light-box sign on top.',
        specs: [['Footprint', '2.6 × 1.8 m'], ['Team', '1 to 2 people'], ['Seats', 'None, grab and go'], ['Best for', 'Malls, stations, office lobbies']],
        brand: 'Light-box sign, striped valance, drip counter front, back menu board, A-frame.',
      },
      stall: {
        build: buildStall, name: 'Pop-up stall with seating',
        aria: 'Pop-up stall: an orange booth with a giant donut on the roof, a flip-up striped awning over the service window, three bar stools at the ledge and two bistro tables on a wooden deck.',
        specs: [['Footprint', '3 × 1.9 m booth + 4.8 × 3.2 m deck'], ['Team', '2 people'], ['Seats', '3 stools + 4 chairs'], ['Best for', 'Markets, parks, campus, events']],
        brand: 'Giant roof donut, header sign, flip-up awning, side menu and poster, parasol, string lights.',
      },
      store: {
        build: buildStore, name: 'Flagship store',
        aria: 'Flagship store, cut away so you can see inside: checker floor, a long orange counter with a donut display, three menu boards, a neon sign, pendant lamps, booth seating under a big wall logo and six tables.',
        specs: [['Floor', '10 × 7 m (70 m²)'], ['Team', '4 to 6 people'], ['Seats', '24 (3 booths + 6 tables)'], ['Best for', 'High street; the shop on Glaze Lane']],
        brand: 'Wall logo, three menu boards, neon sign, drip counter, pendant lamps, booth upholstery, door mat.',
      },
    };
    const cache = {};
    let cur = null, def = null, tween = null;
    const tabs = [...root.querySelectorAll('[data-loc]')];
    const spec = root.querySelector('.loc3d__spec');
    const vTarget = new THREE.Vector3(), vCam = new THREE.Vector3();

    function aimFor(d) {
      const k = camera.aspect < 0.85 ? 1.55 : camera.aspect < 1.3 ? 1.2 : 1;
      const t = vTarget.set(...d.target);
      return { target: t.clone(), cam: vCam.set(...d.cam).sub(t).multiplyScalar(k).add(t).clone() };
    }
    function show(key, instant) {
      if (!LOCS[key]) return;
      if (cur) scene.remove(cache[cur].group);
      if (!cache[key]) cache[key] = LOCS[key].build();
      cur = key; def = cache[key];
      scene.add(def.group);
      const s = def.shadow, t = new THREE.Vector3(...def.target);
      sun.position.set(t.x + s * 0.9, s * 1.6, t.z + s * 0.7); sun.target.position.copy(t);
      Object.assign(sun.shadow.camera, { left: -s, right: s, top: s, bottom: -s, near: 0.5, far: s * 5 });
      sun.shadow.camera.updateProjectionMatrix();
      renderer.shadowMap.needsUpdate = true;
      const aim = aimFor(def), dist = aim.cam.distanceTo(aim.target);
      controls.minDistance = dist * 0.42; controls.maxDistance = dist * 1.5;
      if (instant || reduce) { camera.position.copy(aim.cam); controls.target.copy(aim.target); tween = null; }
      else tween = { t0: performance.now(), dur: 900, fromC: camera.position.clone(), fromT: controls.target.clone(), toC: aim.cam, toT: aim.target };
      const L = LOCS[key];
      canvas.setAttribute('aria-label', `3D mock-up. ${L.aria}`);
      tabs.forEach((b) => { const on = b.dataset.loc === key; b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1; b.classList.toggle('on', on); });
      stage.setAttribute('aria-labelledby', 'tab-' + key);
      const live = document.getElementById('locLive'); if (live) live.textContent = `Showing the ${L.name.toLowerCase()}`;
      if (spec) spec.innerHTML = `<h3>${L.name}</h3><dl>${L.specs.map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl><p><b>Branded touchpoints:</b> ${L.brand}</p><p class="note">Concept sizes for planning. Confirm with your fit-out designer.</p>`;
      kick();
    }

    // ---------- loop: only runs while the viewer is on screen ----------
    let raf = 0, onScreen = false, spin = false, lastSpin = 0; // auto-turn is opt-in: an idle viewer costs nothing
    controls.autoRotate = false;
    const ease = (x) => 1 - Math.pow(1 - x, 3);
    function setPR(p) { if (p === prNow) return; prNow = p; renderer.setPixelRatio(p); renderer.setSize(stage.clientWidth, stage.clientHeight, false); }
    function frame(now) {
      raf = -1; // busy: 'change' events fired by controls.update() must not start a second loop
      if (spin && !dragging && !tween && now - lastSpin < 33) { raf = requestAnimationFrame(frame); return; }
      lastSpin = now;
      if (tween) {
        const k = Math.min(1, (now - tween.t0) / tween.dur), e = ease(k);
        camera.position.lerpVectors(tween.fromC, tween.toC, e); controls.target.lerpVectors(tween.fromT, tween.toT, e);
        if (k >= 1) tween = null;
      }
      const moved = controls.update();
      const active = !!(spin || tween || moved || dragging);
      setPR(active ? PR_LO : PR_HI);
      renderer.render(scene, camera);
      if (cur) stage.classList.remove('is-loading');
      raf = 0;
      const box = stage.getBoundingClientRect();
      onScreen = box.bottom > -80 && box.top < innerHeight + 80;
      if (active && onScreen && document.visibilityState === 'visible') raf = requestAnimationFrame(frame);
    }
    let dragging = false;
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    controls.addEventListener('start', () => { dragging = true; if (spin) setSpin(false); kick(); });
    controls.addEventListener('end', () => { dragging = false; kick(); });
    controls.addEventListener('change', kick);
    new IntersectionObserver((es) => { onScreen = es[0].isIntersecting; if (onScreen) kick(); }, { rootMargin: '80px' }).observe(stage);
    document.addEventListener('visibilitychange', kick);
    function resize() {
      const w = stage.clientWidth, h = stage.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
      kick();
    }
    new ResizeObserver(resize).observe(stage);
    resize();

    // the page keeps scrolling over the canvas; zoom needs Ctrl/⌘ + wheel (trackpad pinch sends ctrlKey)
    stage.addEventListener('wheel', (e) => { if (!e.ctrlKey && !e.metaKey) e.stopPropagation(); }, { capture: true });

    // ---------- toolbar ----------
    const spinBtn = root.querySelector('[data-loc-act="spin"]');
    function setSpin(on) { spin = on && !reduce; controls.autoRotate = spin; if (spinBtn) spinBtn.setAttribute('aria-pressed', spin); kick(); }
    setSpin(false);
    document.addEventListener('gb:still', (e) => { if (e.detail) setSpin(false); });
    function orbit(dAngle) {
      const off = camera.position.clone().sub(controls.target);
      off.applyAxisAngle(new THREE.Vector3(0, 1, 0), dAngle);
      camera.position.copy(controls.target).add(off); kick();
    }
    function zoom(f) {
      const off = camera.position.clone().sub(controls.target);
      const d = THREE.MathUtils.clamp(off.length() * f, controls.minDistance, controls.maxDistance);
      camera.position.copy(controls.target).add(off.setLength(d)); kick();
    }
    function preset(kind) {
      const aim = aimFor(def), t = aim.target, dist = aim.cam.distanceTo(t);
      let to;
      if (kind === 'plan') to = new THREE.Vector3().setFromSpherical(new THREE.Spherical(dist * 1.05, 0.24, 0)).add(t);
      else if (kind === 'front') to = new THREE.Vector3().setFromSpherical(new THREE.Spherical(dist * 0.95, 1.2, 0)).add(t);
      else to = new THREE.Vector3(t.x + dist * 0.16, 1.6, t.z + dist * 0.52);
      setSpin(false);
      tween = { t0: performance.now(), dur: reduce ? 1 : 800, fromC: camera.position.clone(), fromT: controls.target.clone(), toC: to, toT: t.clone() };
      kick();
    }
    root.addEventListener('click', (e) => {
      const t = e.target.closest('[data-loc]');
      if (t) { show(t.dataset.loc); return; }
      const v = e.target.closest('[data-loc-view]');
      if (v) { preset(v.dataset.locView); return; }
      const a = e.target.closest('[data-loc-act]');
      if (!a) return;
      const act = a.dataset.locAct;
      if (act === 'left') orbit(-0.35);
      else if (act === 'right') orbit(0.35);
      else if (act === 'in') zoom(0.85);
      else if (act === 'out') zoom(1.18);
      else if (act === 'reset') { setSpin(false); show(cur); }
      else if (act === 'spin') setSpin(!spin);
      else if (act === 'save') {
        setPR(PR_HI); renderer.render(scene, camera);
        canvas.toBlob((b) => {
          if (!b) return;
          const link = document.createElement('a');
          const slug = words().join('-').toLowerCase().replace(/[^a-z0-9-]+/g, '');
          link.href = URL.createObjectURL(b); link.download = `${slug || 'brand'}-${cur}-3d.png`;
          document.body.appendChild(link); link.click();
          setTimeout(() => { URL.revokeObjectURL(link.href); link.remove(); }, 500);
          if (B.toast) B.toast(`Saved ${link.download}`);
        }, 'image/png');
      }
    });
    // arrow keys move between the location tabs
    root.querySelector('[role="tablist"]')?.addEventListener('keydown', (e) => {
      const i = tabs.findIndex((b) => b.dataset.loc === cur);
      let n = -1;
      if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') n = 0;
      else if (e.key === 'End') n = tabs.length - 1;
      if (n < 0) return;
      e.preventDefault(); show(tabs[n].dataset.loc); tabs[n].focus();
    });

    // details changed in chapter 01: redraw the signs, menus and counters
    let rt;
    const redraw = () => { clearTimeout(rt); rt = setTimeout(() => { TEX.forEach((t) => t.redraw()); kick(); }, 450); };
    if (B.onChange) B.onChange(redraw);
    // webfonts may land after the first draw
    Promise.all(['800 64px "Plus Jakarta Sans"', '700 64px Caveat', '500 32px Inter', '700 32px Inter'].map((f) => document.fonts.load(f).catch(() => null))).then(redraw);

    const first = tabs.find((b) => b.getAttribute('aria-selected') === 'true')?.dataset.loc || 'kiosk';
    await yieldFrame();
    cache[first] = LOCS[first].build();
    await yieldFrame();
    if (renderer.compileAsync) {
      scene.add(cache[first].group);
      try { await renderer.compileAsync(scene, camera); } catch (e) { /* shaders compile on the first render instead */ }
      scene.remove(cache[first].group);
    }
    show(first, true);
    await yieldFrame();
    if (!soft) {
      const gl = renderer.getContext();
      const t0 = performance.now(); renderer.render(scene, camera); gl.finish();
      if (performance.now() - t0 > 45) {
        soft = true; PR_HI = 1; PR_LO = 0.6;
        renderer.shadowMap.enabled = false;
        scene.traverse((o) => { if (o.material) [].concat(o.material).forEach((m) => { m.needsUpdate = true; }); });
        root.classList.add('is-soft'); setPR(PR_HI); kick();
      }
    }
    root.classList.add('is-ready');
    window.__gbLoc = { show, renderer, scene, camera, get cur() { return cur; } }; // for QA scripts
  };
})();
