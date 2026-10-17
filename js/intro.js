// Glaze Bomb - intro (classic script: starts on first paint, before the 3D modules arrive)
// Beats, like the TechNext intro: bloom + grid unfold, the donut falls in from above with a comet trail
// and bounces into place with ripples + a sprinkle burst (it never spins or squashes), letters flip up under a glint, the tagline
// wipes in, pills arc out from behind the donut, then an iris opens onto the page once it is ready.
(function () {
  var el = document.getElementById('loader');
  var gsap = window.gsap;
  function signalExit() { window.__gbIntroExited = true; document.dispatchEvent(new CustomEvent('gb:intro-exit')); }
  function signalDone() { window.__gbIntroDone = true; document.dispatchEvent(new CustomEvent('gb:intro-done')); }
  if (!el || !gsap) { signalExit(); signalDone(); return; }
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (reduce) { el.remove(); signalExit(); signalDone(); return; }
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // the same full intro on every page and every visit
  el.classList.add('is-full');

  var COLORS = ['#ff6a13', '#ffd23f', '#3ec6ff', '#7cf29c', '#ffffff', '#a974ff', '#3a1e10'];
  var word = $('#introLetters');
  word.innerHTML = word.textContent.split('').map(function (ch, i) { return ch === ' ' ? '<span class="sp"> </span>' : '<span class="l' + (i > 5 ? ' o' : '') + '">' + ch + '</span>'; }).join('');
  var sparks = $('#introSparks'), html = '';
  for (var i = 0; i < 18; i++) html += '<i style="--a:' + (i * 20 + (i % 3) * 7) + 'deg;--d:' + (1 + (i % 4) * 0.28).toFixed(2) + ';--c:' + COLORS[i % COLORS.length] + ';--dl:' + ((i % 5) * 0.025) + 's"></i>';
  sparks.innerHTML = html;
  var PILLS = [['#f6dc8c', 'filled with Custard'], ['#4a2618', 'filled with Ganache'], ['#d8344a', 'filled with Jam']];
  $('#introPills').innerHTML = PILLS.map(function (p, k) { return '<span class="ipill" style="--i:' + k + '"><i style="background:' + p[0] + '"></i>' + p[1] + '</span>'; }).join('');

  var donut = $('#introDonut'), art = $('#introArt'), lockup = $('.intro__lockup', el), trailA = $('#introTrailA'), trailB = $('#introTrailB'), grad = $('#introTrailG');
  function center() { var r = donut.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, s: r.width }; }
  var C = center();

  // ---- interaction: tilt with the pointer, a sprinkle trail, tap the donut for a burst ----
  var lastSp = 0;
  function onMove(e) {
    var px = e.clientX / innerWidth - 0.5, py = e.clientY / innerHeight - 0.5;
    gsap.to(lockup, { rotateY: px * 14, rotateX: -py * 10, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
    gsap.to('.intro__bloom', { x: px * 40, y: py * 30, duration: 0.8, ease: 'power3.out', overwrite: 'auto' });
    var now = performance.now();
    if (fine && now - lastSp > 45) {
      lastSp = now;
      var sp = document.createElement('i'); sp.className = 'isprinkle';
      sp.style.cssText = 'left:' + e.clientX + 'px;top:' + e.clientY + 'px;background:' + COLORS[(now / 45 | 0) % 6] + ';--r:' + ((Math.random() * 360) | 0) + 'deg';
      el.appendChild(sp); setTimeout(function () { sp.remove(); }, 950);
    }
  }
  el.addEventListener('pointermove', onMove);
  function burst() {
    sparks.classList.remove('go'); void sparks.offsetWidth; sparks.classList.add('go');
    $$('.intro__ripple', el).forEach(function (r) { r.classList.remove('go'); void r.offsetWidth; r.classList.add('go'); });
  }
  donut.addEventListener('click', function () {
    // a little hop and bounce: the donut keeps its shape and stays the right way up
    gsap.timeline().to(art, { y: -34, duration: 0.22, ease: 'power2.out', overwrite: true }).to(art, { y: 0, duration: 0.6, ease: 'bounce.out' });
    burst(); gsap.to('#introHint', { opacity: 0, duration: 0.3 });
  });

  // ---- the drop: the donut falls in from above the screen and bounces into place, with a short comet trail ----
  var hist = [];
  function trail() {
    var r = donut.getBoundingClientRect();
    hist.push([r.left + r.width / 2, r.top + r.height / 2]); if (hist.length > 14) hist.shift();
    if (hist.length > 1) {
      var d = 'M' + hist.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L');
      trailA.setAttribute('d', d); trailB.setAttribute('d', d);
      grad.setAttribute('x1', hist[0][0]); grad.setAttribute('y1', hist[0][1]); grad.setAttribute('x2', hist[hist.length - 1][0]); grad.setAttribute('y2', hist[hist.length - 1][1]);
    }
  }

  // ---- the iris: a hole grows out of the donut through the overlay onto the page ----
  var exiting = false, ready = !!window.__gbReady, holding = false, holdTween = null;
  function exit() {
    if (exiting) return; exiting = true;
    tl.kill(); if (holdTween) holdTween.kill();
    el.removeEventListener('pointermove', onMove);
    gsap.set(donut, { x: 0, y: 0, scale: 1, rotation: 0 });
    C = center();
    var maxR = Math.hypot(Math.max(C.x, innerWidth - C.x), Math.max(C.y, innerHeight - C.y)) + 40, iris = { r: 0 };
    el.style.setProperty('--cx', C.x + 'px'); el.style.setProperty('--cy', C.y + 'px');
    signalExit();
    gsap.timeline({ onComplete: function () { el.remove(); window.__gbIntroDone = true; document.dispatchEvent(new CustomEvent('gb:intro-done')); } })
      .to('#introBar', { width: '100%', duration: 0.2 }, 0)
      .to(lockup, { scale: 1.8, opacity: 0, duration: 0.6, ease: 'power2.in' }, 0)
      .to('.intro__skip, .intro__progress, .intro__hint', { opacity: 0, duration: 0.25 }, 0)
      .to(iris, {
        r: maxR, duration: 0.85, ease: 'power2.in',
        onUpdate: function () {
          var m = 'radial-gradient(circle at ' + C.x + 'px ' + C.y + 'px, transparent ' + iris.r + 'px, #000 ' + (iris.r + 1) + 'px)';
          el.style.webkitMaskImage = m; el.style.maskImage = m; el.style.setProperty('--r', iris.r + 'px');
        },
      }, 0.12)
      .fromTo('.intro__ring', { opacity: 1 }, { opacity: 0, duration: 0.85, ease: 'power2.in' }, 0.12);
  }
  // the sting is done: open now if the page is ready, otherwise idle gently until it is (max 10 s)
  function finish() {
    if (ready) { exit(); return; }
    holding = true; el.classList.add('is-waiting');
    holdTween = gsap.to(donut, { y: -10, duration: 0.7, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    setTimeout(exit, 10000);
  }
  document.addEventListener('gb:ready', function () { ready = true; if (holding) exit(); });
  $('#introSkip').addEventListener('click', exit);
  addEventListener('keydown', function k(e) { if (!exiting && (e.key === 'Escape' || e.key === 'Enter')) { removeEventListener('keydown', k); exit(); } });

  var tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
  tl.fromTo('.intro__bloom', { scale: 0.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.9 }, 0)
    .fromTo('.intro__gh', { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: 'power2.out' }, 0)
    .fromTo('.intro__gv', { scaleY: 0 }, { scaleY: 1, duration: 0.9, ease: 'power2.out' }, 0.05)
    .fromTo('#introBar', { width: '0%' }, { width: '100%', duration: 3.15, ease: 'none' }, 0)
    // straight down from above the screen, gravity bounce on the spot: no spin, no squash
    .fromTo(donut, { y: -(C.y + C.s), opacity: 1 }, { y: 0, duration: 1.2, ease: 'bounce.out', onUpdate: trail }, 0.15)
    .add(function () { burst(); gsap.to([trailA, trailB], { opacity: 0, duration: 0.4 }); }, 0.59)
    .fromTo('#introLetters .l', { yPercent: 70, rotateX: -95, opacity: 0 }, { yPercent: 0, rotateX: 0, opacity: 1, duration: 0.6, stagger: 0.07, ease: 'back.out(2.2)' }, 0.95)
    .fromTo('.intro__glint', { backgroundPosition: '160% 0' }, { backgroundPosition: '-60% 0', duration: 0.8, ease: 'power2.inOut' }, 1.8)
    .fromTo('#introSub', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.5, ease: 'power2.out' }, 1.65)
    .add(function () {
      C = center();
      $$('.ipill', el).forEach(function (p, k) {
        var r = p.getBoundingClientRect(), dx = C.x - (r.left + r.width / 2), dy = C.y - (r.top + r.height / 2);
        gsap.fromTo(p, { x: dx, scale: 0.2, rotation: (k - 1) * 50, opacity: 0 }, { x: 0, scale: 1, rotation: 0, opacity: 1, duration: 0.85, delay: k * 0.1, ease: 'power3.out' });
        gsap.fromTo(p, { y: dy }, { y: 0, duration: 0.85, delay: k * 0.1, ease: 'back.out(2.6)' });
      });
    }, 2.0)
    .add(function () { var r = donut.getBoundingClientRect(), h = $('#introHint'); h.style.top = Math.max(12, r.top - 46) + 'px'; h.style.left = (r.left + r.width / 2) + 'px'; }, 2.15)
    .fromTo('#introHint', { opacity: 0, y: 8 }, { opacity: fine ? 1 : 0, y: 0, duration: 0.4 }, 2.2)
    .call(finish, null, 3.15);
  // start once the title font is in (max 700 ms) so the letters flip in their real shape
  var go = function () { el.classList.add('is-on'); tl.play(0); };
  var fontWait = document.fonts && document.fonts.load ? Promise.race([document.fonts.load('800 1em "Plus Jakarta Sans"'), new Promise(function (r) { setTimeout(r, 700); })]) : Promise.resolve();
  fontWait.then(go, go);
})();
