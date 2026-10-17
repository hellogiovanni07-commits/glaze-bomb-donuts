// Glaze Bomb - location page: live open status, this week's hours with today marked, copy address
import { initChat } from './chat.js?v=46';
import { gsap, $, $$, reduce, toast, initOrderUI, initReveals, reveal, runLoader, openStatus } from './common.js?v=46';

initOrderUI();
initChat();
openStatus(); setInterval(openStatus, 60000);

// the week, Monday first, with today highlighted
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const today = new Date().getDay();
$('#weekHours').innerHTML = [1, 2, 3, 4, 5, 6, 0].map((d) => {
  const wk = d === 0 || d === 6;
  return `<li class="${d === today ? 'is-today' : ''}"><span>${DAYS[d]}${d === today ? ' <em>Today</em>' : ''}</span><b>${wk ? '7:00 AM - 1:00 PM' : '6:00 AM - 2:00 PM'}</b></li>`;
}).join('');

$('#copyAddr').addEventListener('click', async () => {
  const text = 'Glaze Bomb Bakery, 12 Glaze Lane, Downtown';
  try { await navigator.clipboard.writeText(text); toast('Address copied'); } catch { toast(text); }
});

initReveals();
reveal('.linfo > *', { y: 40, opacity: 0 }, { stagger: 0.1, trigger: '.linfo' });
reveal('.lfaq details', { y: 24, opacity: 0 }, { stagger: 0.06, trigger: '.lfaq' });
runLoader((tl) => {
  tl.fromTo('.phero__title .line > span', { yPercent: 110 }, { yPercent: 0, duration: 0.9, stagger: 0.1, ease: 'power4.out' }, '-=0.3')
    .fromTo('.phero .kicker, .phero .open, .phero__lead, .lhero__btns', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.06 }, '-=0.6')
    .fromTo('.lmap', { scale: 0.92, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.9, ease: 'back.out(1.4)' }, '<');
  if (!reduce) gsap.fromTo('.lmap .route', { strokeDashoffset: 420 }, { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut', delay: 0.8 });
});
