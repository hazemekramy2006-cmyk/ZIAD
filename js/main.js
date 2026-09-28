/* ============================================================
   main.js â€” smooth scroll, cinematic transitions, gallery,
   timeline, modal, micro-interactions.
   ============================================================ */
import { PROJECTS, renderPoster, paintShot, makeShot } from './data.js';
import { createHero } from './hero3d.js';

const q = (s, c = document) => c.querySelector(s);
const qa = (s, c = document) => [...c.querySelectorAll(s)];
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = matchMedia('(hover:hover) and (pointer:fine)').matches;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pad2 = (n) => String(Math.floor(n)).padStart(2, '0');

history.scrollRestoration = 'manual';
gsap.registerPlugin(ScrollTrigger);

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â• SMOOTH SCROLL â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const lenis = new Lenis({
  duration: REDUCED ? 0.1 : 1.15,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: !REDUCED,
  touchMultiplier: 1.6,
  wheelMultiplier: 1
});
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
lenis.scrollTo(0, { immediate: true });

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â• TEXT SPLITTING â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function splitWords(el) {
  if (el.dataset.done) return qa('.wi', el);
  const words = el.textContent.trim().split(/\s+/);
  el.innerHTML = words
    .map((w) => `<span class="w"><span class="wi">${w.replace(/</g, '&lt;')}</span></span>`)
    .join('<span class="sp"></span>');
  el.dataset.done = '1';
  return qa('.wi', el);
}
const linesOf = (el) => qa('.line', el);

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â• CUSTOM CURSOR â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const cursor = q('#cursor');
if (FINE) {
  const dot = q('.cursor-dot', cursor);
  const ring = q('.cursor-ring', cursor);
  const setDotX = gsap.quickSetter(dot, 'x', 'px');
  const setDotY = gsap.quickSetter(dot, 'y', 'px');
  const setRingX = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' });
  const setRingY = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });

  addEventListener('pointermove', (e) => {
    cursor.classList.add('is-on');
    setDotX(e.clientX); setDotY(e.clientY);
    setRingX(e.clientX); setRingY(e.clientY);
  }, { passive: true });
  addEventListener('pointerdown', () => cursor.classList.add('s-down'));
  addEventListener('pointerup', () => cursor.classList.remove('s-down'));

  const STATES = ['s-hover', 's-play', 's-view', 's-scrub'];
  addEventListener('pointerover', (e) => {
    const t = e.target.closest('[data-cursor]');
    STATES.forEach((s) => cursor.classList.remove(s));
    if (t) cursor.classList.add('s-' + t.dataset.cursor);
  });
  addEventListener('pointerleave', () => cursor.classList.remove('is-on'));
  addEventListener('pointerenter', () => cursor.classList.add('is-on'));
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â• MAGNETIC ELEMENTS â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function magnetic(el, strength = 0.32) {
  if (!FINE || REDUCED) return;
  const xTo = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'power3' });
  const yTo = gsap.quickTo(el, 'y', { duration: 0.7, ease: 'power3' });
  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    xTo((e.clientX - r.left - r.width / 2) * strength);
    yTo((e.clientY - r.top - r.height / 2) * strength);
  });
  el.addEventListener('pointerleave', () => {
    gsap.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1,.35)' });
  });
}
qa('.magnetic').forEach((el) => magnetic(el, el.classList.contains('contact__cta') ? 0.16 : 0.32));

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â• NAV â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const nav = q('#nav');
const indicator = q('#nav-indicator');
const navLinks = qa('[data-nav]');
const sections = ['#hero', '#about', '#work', '#craft', '#contact'];

function moveIndicator(el) {
  if (!el) { indicator.classList.remove('is-on'); return; }
  indicator.classList.add('is-on');
  gsap.to(indicator, {
    x: el.offsetLeft, width: el.offsetWidth,
    duration: 0.65, ease: 'power3.out', overwrite: 'auto'
  });
}
function setActiveNav(id) {
  navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + id));
  moveIndicator(navLinks.find((a) => a.classList.contains('is-active')));
}
navLinks.forEach((a) => a.addEventListener('pointerenter', () => moveIndicator(a)));
q('.nav-links').addEventListener('pointerleave', () => {
  moveIndicator(navLinks.find((x) => x.classList.contains('is-active')));
});

let lastY = 0;
lenis.on('scroll', ({ scroll }) => {
  nav.classList.toggle('is-stuck', scroll > 60);
  nav.classList.toggle('is-hidden', scroll > 400 && scroll > lastY + 5);
  if (scroll < lastY - 5 || scroll < 400) nav.classList.remove('is-hidden');
  lastY = scroll;
});

/* mobile menu */
const burger = q('#nav-burger');
const mobileMenu = q('#mobile-menu');
burger.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('is-open');
  burger.classList.toggle('is-open', open);
  document.body.classList.toggle('is-locked', open);
  open ? lenis.stop() : lenis.start();
});
qa('[data-mnav]').forEach((a) => a.addEventListener('click', () => {
  mobileMenu.classList.remove('is-open');
  burger.classList.remove('is-open');
  document.body.classList.remove('is-locked');
  lenis.start();
}));

/* anchor scrolling */
qa('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const target = q(id);
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: id === '#hero' ? 0 : -40, duration: 1.5 });
  });
});
q('#to-top').addEventListener('click', () => lenis.scrollTo(0, { duration: 1.6 }));

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â• SCROLL PROGRESS â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
gsap.to('#progress-bar', {
  scaleX: 1, ease: 'none',
  scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.4 }
});

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â• CLOCKS â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const start = Date.now();
const tcEl = q('#hero-tc');
const clocks = [q('#hero-clock'), q('#mm-clock')];
setInterval(() => {
  const s = (Date.now() - start) / 1000;
  const f = Math.floor((s % 1) * 24);
  if (tcEl) tcEl.textContent = `00:${pad2(s / 60)}:${pad2(s % 60)}:${pad2(f)}`;
  const d = new Date();
  clocks.forEach((c) => { if (c) c.textContent = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`; });
}, 120);

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â• 3D HERO â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const heroCanvas = q('#webgl');
const hero3d = createHero(heroCanvas, { reduced: REDUCED });
gsap.set(heroCanvas, { opacity: 0 });

ScrollTrigger.create({
  trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true,
  onUpdate: (self) => hero3d && hero3d.setScroll(self.progress)
});
ScrollTrigger.create({
  trigger: '#hero', start: 'bottom 90%', end: 'bottom top',
  onEnter: () => hero3d && hero3d.setVisible(false),
  onLeaveBack: () => hero3d && hero3d.setVisible(true)
});
gsap.to('.hero__content', {
  yPercent: -22, opacity: 0.06, ease: 'none',
  scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
});

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â• REVEALS â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function buildReveals() {
  qa('[data-split="words"]').forEach((el) => {
    const words = splitWords(el);
    gsap.set(words, { yPercent: 115 });
    if (el.closest('.hero')) return; // hero handled by the intro timeline
    ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: () => gsap.to(words, {
        yPercent: 0, duration: 1.1, ease: 'power4.out', stagger: 0.028
      })
    });
  });

  qa('[data-split="lines"]').forEach((el) => {
    const ls = linesOf(el);
    gsap.set(ls, { yPercent: 115 });
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter: () => gsap.to(ls, {
        yPercent: 0, duration: 1.25, ease: 'power4.out', stagger: 0.1
      })
    });
  });

  qa('[data-reveal="fade"]').forEach((el) => {
    if (el.closest('.hero')) return;
    gsap.set(el, { opacity: 0, y: 22 });
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' })
    });
  });

  qa('[data-reveal="row"]').forEach((el) => {
    gsap.set(el, { opacity: 0, y: 40, clipPath: 'inset(0 0 100% 0)' });
    ScrollTrigger.create({
      trigger: el, start: 'top 92%', once: true,
      onEnter: () => gsap.to(el, {
        opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)',
        duration: 1.1, ease: 'power4.out'
      })
    });
  });

  qa('[data-reveal="mask"]').forEach((el) => {
    const inner = el.querySelector('canvas,img');
    gsap.set(el, { clipPath: 'inset(0 0 100% 0)' });
    if (inner) gsap.set(inner, { scale: 1.28 });
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter: () => {
        gsap.to(el, { clipPath: 'inset(0 0 0% 0)', duration: 1.4, ease: 'power4.inOut' });
        if (inner) gsap.to(inner, { scale: 1.06, duration: 1.6, ease: 'power4.inOut' });
      }
    });
  });

  qa('.sec-rule i').forEach((el) => {
    ScrollTrigger.create({
      trigger: el, start: 'top 92%', once: true,
      onEnter: () => gsap.to(el, { scaleX: 1, duration: 1.5, ease: 'power4.inOut' })
    });
  });

  /* counters */
  qa('[data-counter]').forEach((el) => {
    const to = parseInt(el.dataset.counter, 10);
    const obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 92%', once: true,
      onEnter: () => gsap.to(obj, {
        v: to, duration: 2, ease: 'power3.out',
        onUpdate: () => { el.textContent = pad2(obj.v); }
      })
    });
  });

  /* parallax layers */
  const para = (sel, amount, start = 'top bottom', end = 'bottom top') =>
    qa(sel).forEach((el) => gsap.fromTo(el, { yPercent: -amount }, {
      yPercent: amount, ease: 'none',
      scrollTrigger: { trigger: el.closest('section') || el, start, end, scrub: true }
    }));
  para('.about__frame canvas', 6);
  para('.footer__word', 12);
  para('.work__hint', 30, 'top bottom', 'bottom top');
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â• MARQUEE BAND â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const bandTrack = q('#band-track');
let bandX = 0;
if (bandTrack) {
  const setW = () => bandTrack.children[0].offsetWidth;
  gsap.ticker.add(() => {
    const v = lenis.velocity || 0;
    bandX -= 1.1 + Math.abs(v) * 0.22;
    const w = setW();
    if (w && -bandX >= w) bandX += w;
    bandTrack.style.transform = `translate3d(${bandX}px,0,0)`;
  });
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â• POSTERS â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const aboutPoster = q('[data-poster="studio"]');
if (aboutPoster) {
  renderPoster(aboutPoster, {
    variant: 'studio', seed: 7,
    palette: ['#0a0a12', '#1d1a26', '#ff6a3d', '#ffd9c0']
  });
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â• WORK GALLERY â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const track = q('#work-track');
const workCurrent = q('#work-current');
q('#work-total').textContent = pad2(PROJECTS.length);

PROJECTS.forEach((p, i) => {
  const card = document.createElement('article');
  card.className = 'work-card';
  card.dataset.cursor = 'play';
  card.dataset.index = i;
  card.innerHTML = `
    <div class="work-card__media">
      <canvas width="1280" height="800"></canvas>
      <span class="work-card__grad"></span>
      <span class="work-card__num">${pad2(i + 1)}</span>
      <span class="work-card__badge">${p.badge}</span>
    </div>
    <div class="work-card__meta">
      <h3 class="work-card__title">${p.title}</h3>
      <span class="work-card__cat">${p.category} â€” ${p.year}</span>
    </div>
    <p class="work-card__desc">${p.desc}</p>
    <div class="work-card__bar"><i></i></div>`;
  track.appendChild(card);
  renderPoster(q('canvas', card), { variant: p.variant, seed: i + 3, palette: p.palette });
  card.addEventListener('click', () => openProject(i));
});

const cards = qa('.work-card', track);
const mm = gsap.matchMedia();

mm.add('(min-width: 901px)', () => {
  const getDist = () => Math.max(0, track.scrollWidth - window.innerWidth);
  const tween = gsap.to(track, {
    x: () => -getDist(), ease: 'none',
    scrollTrigger: {
      trigger: '.work', start: 'top top',
      end: () => '+=' + (getDist() + window.innerHeight * 0.5),
      pin: true, scrub: 0.85, invalidateOnRefresh: true, anticipatePin: 1,
      onUpdate: (self) => {
        const dist = getDist();
        const cx = window.innerWidth / 2;
        let best = 0, bestD = 1e9;
        cards.forEach((c, i) => {
          const r = c.getBoundingClientRect();
          const d = ((r.left + r.width / 2) - cx) / window.innerWidth;
          gsap.set(c, {
            transformPerspective: 1400,
            rotateY: clamp(d * -9, -9, 9),
            scale: 1 - Math.min(Math.abs(d) * 0.1, 0.09),
            y: Math.abs(d) * 22,
            opacity: 1 - Math.min(Math.abs(d) * 0.24, 0.3)
          });
          const ad = Math.abs(r.left + r.width / 2 - cx);
          if (ad < bestD) { bestD = ad; best = i; }
        });
        if (workCurrent) workCurrent.textContent = pad2(best + 1);
      }
    }
  });

  /* drag to scrub */
  let dragging = false, sx = 0, ss = 0, moved = 0;
  const vp = q('.work__viewport');
  const down = (e) => {
    dragging = true; sx = e.clientX; ss = lenis.scroll; moved = 0;
    vp.setPointerCapture(e.pointerId);
    document.body.style.userSelect = 'none';
    cursor && cursor.classList.add('s-drag');
  };
  const move = (e) => {
    if (!dragging) return;
    const dx = e.clientX - sx;
    moved = Math.max(moved, Math.abs(dx));
    const st = tween.scrollTrigger;
    lenis.scrollTo(ss - dx * 1.35, { immediate: true, force: true });
    if (st && (ss - dx * 1.35) < st.start) lenis.scrollTo(st.start, { immediate: true, force: true });
    if (st && (ss - dx * 1.35) > st.end) lenis.scrollTo(st.end, { immediate: true, force: true });
  };
  const up = () => {
    if (!dragging) return;
    dragging = false;
    document.body.style.userSelect = '';
    cursor && cursor.classList.remove('s-drag');
    setTimeout(() => (moved = 0), 60);
  };
  vp.addEventListener('pointerdown', down);
  vp.addEventListener('pointermove', move);
  addEventListener('pointerup', up);
  track.addEventListener('click', (e) => { if (moved > 8) { e.stopPropagation(); e.preventDefault(); } }, true);

  return () => {
    vp.removeEventListener('pointerdown', down);
    vp.removeEventListener('pointermove', move);
    removeEventListener('pointerup', up);
    gsap.set(cards, { clearProps: 'all' });
  };
});

mm.add('(max-width: 900px)', () => {
  cards.forEach((c, i) => {
    gsap.set(c, { opacity: 0, y: 60 });
    ScrollTrigger.create({
      trigger: c, start: 'top 88%', once: true,
      onEnter: () => gsap.to(c, { opacity: 1, y: 0, duration: 1, ease: 'power4.out' })
    });
  });
});

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â• CRAFT â€” TIMELINE â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const TOOLS = {
  premiere: {
    tag: 'PREMIERE PRO', title: 'The spine of every film',
    desc: 'Assembly, multicam, speed ramps and sound design â€” where the structure of the story is decided frame by frame.',
    list: ['Editorial structure', 'Sound design', 'Delivery masters'],
    color: '#ff3b2f', variant: 'skyline', palette: ['#0a1024', '#16264d', '#ff3b2f', '#ffd9a0']
  },
  after: {
    tag: 'AFTER EFFECTS', title: 'Motion that carries meaning',
    desc: 'Titles, clean-ups and compositing. Every graphic moves because the edit asked it to â€” never for decoration.',
    list: ['Title systems', 'Compositing', 'Screen design'],
    color: '#8f6bff', variant: 'signal', palette: ['#05070d', '#171233', '#8f6bff', '#e6dcff']
  },
  resolve: {
    tag: 'DAVINCI RESOLVE', title: 'Colour as narration',
    desc: 'Primary balance, secondaries and film emulation. The grade decides what the audience feels before they know why.',
    list: ['Scene grade', 'Skin protection', 'HDR + SDR masters'],
    color: '#f0b429', variant: 'peaks', palette: ['#101827', '#2b3f63', '#f0b429', '#fff2d4']
  },
  capcut: {
    tag: 'CAPCUT', title: 'Vertical, without compromise',
    desc: 'Social cutdowns built from the same masters â€” reframed, retimed and captioned so the idea survives the aspect ratio.',
    list: ['9:16 reframes', 'Auto captions', 'Platform versions'],
    color: '#37d5c9', variant: 'road', palette: ['#07131a', '#0e2c33', '#37d5c9', '#d7fff9']
  }
};

const rulerEl = q('#tl-ruler');
const TOTAL = 240; // seconds represented by the timeline
if (rulerEl) {
  let html = '';
  for (let i = 0; i <= 24; i++) {
    const s = i * 10;
    html += `<span class="tl-tick${i % 2 ? ' minor' : ''}" data-t="${pad2(s / 60)}:${pad2(s % 60)}"></span>`;
  }
  rulerEl.innerHTML = html;
}

const playhead = q('#tl-playhead');
const tlTc = q('#tl-tc');
ScrollTrigger.create({
  trigger: '.craft', start: 'top 75%', end: 'bottom 60%', scrub: true,
  onUpdate: (self) => {
    const p = self.progress;
    const bodyW = q('.tl-body') ? q('.tl-body').clientWidth - 56 : 0;
    if (playhead) playhead.style.transform = `translateX(${p * Math.max(bodyW - 8, 0)}px)`;
    const s = p * TOTAL;
    if (tlTc) tlTc.textContent = `00:${pad2(s / 60)}:${pad2(s % 60)}:${pad2((s % 1) * 24)}`;
  }
});

/* tool panel + clip lighting */
const cpCanvas = q('#cp-canvas');
const cpCtx = cpCanvas ? cpCanvas.getContext('2d') : null;
let activeTool = 'premiere';
let panelVisible = false;

function paintPanel(t) {
  if (!cpCtx) return;
  const T = TOOLS[activeTool];
  const w = cpCanvas.width, h = cpCanvas.height;
  cpCtx.fillStyle = '#08080c';
  cpCtx.fillRect(0, 0, w, h);
  // grid
  cpCtx.strokeStyle = 'rgba(255,255,255,.06)';
  cpCtx.lineWidth = 1;
  for (let x = 0; x < w; x += 40) { cpCtx.beginPath(); cpCtx.moveTo(x, 0); cpCtx.lineTo(x, h); cpCtx.stroke(); }
  for (let y = 0; y < h; y += 40) { cpCtx.beginPath(); cpCtx.moveTo(0, y); cpCtx.lineTo(w, y); cpCtx.stroke(); }
  // waveform
  cpCtx.strokeStyle = T.color;
  cpCtx.lineWidth = 2;
  cpCtx.beginPath();
  for (let x = 0; x <= w; x += 4) {
    const k = x / w;
    const y = h / 2 + Math.sin(k * 22 + t * 2.4) * h * 0.2 * Math.sin(k * Math.PI)
      + Math.sin(k * 61 - t * 1.4) * h * 0.07;
    x === 0 ? cpCtx.moveTo(x, y) : cpCtx.lineTo(x, y);
  }
  cpCtx.stroke();
  // bars
  const bars = 46;
  for (let i = 0; i < bars; i++) {
    const bh = (Math.sin(i * 0.6 + t * 3) * 0.5 + 0.5) * h * 0.34 + 6;
    cpCtx.fillStyle = i % 7 === 0 ? T.color : 'rgba(255,255,255,.14)';
    cpCtx.fillRect(14 + i * ((w - 28) / bars), h - bh - 14, ((w - 28) / bars) - 5, bh);
  }
  // scan playhead
  const px = ((t * 0.12) % 1) * w;
  cpCtx.fillStyle = 'rgba(229,36,27,.9)';
  cpCtx.fillRect(px, 0, 2, h);
  cpCtx.fillStyle = T.color;
  cpCtx.font = '500 13px "JetBrains Mono", monospace';
  cpCtx.fillText(T.tag, 16, 26);
}
gsap.ticker.add((t) => { if (panelVisible && !REDUCED) paintPanel(t); });

function activateTool(key, light = true) {
  if (!TOOLS[key]) return;
  activeTool = key;
  const T = TOOLS[key];
  qa('.tl-tool').forEach((b) => b.classList.toggle('is-active', b.dataset.tool === key));
  if (light) {
    qa('.clip').forEach((c) => {
      c.classList.toggle('is-lit', c.dataset.tool === key);
      c.classList.toggle('is-dim', c.dataset.tool !== key);
    });
  }
  const swap = (el, val) => {
    gsap.fromTo(el, { y: 16, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
      onStart: () => { el.innerHTML = val; }
    });
  };
  swap(q('#cp-tag'), T.tag);
  swap(q('#cp-title'), T.title);
  swap(q('#cp-desc'), T.desc);
  q('#cp-list').innerHTML = T.list.map((l) => `<li>${l}</li>`).join('');
  gsap.fromTo('#cp-list li', { y: 14, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.06 });
  gsap.fromTo(cpCanvas, { opacity: 0.2, scale: 1.03 },
    { opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' });
  paintPanel(gsap.ticker.time);
}
qa('.tl-tool').forEach((b) => {
  b.addEventListener('pointerenter', () => activateTool(b.dataset.tool));
  b.addEventListener('click', () => activateTool(b.dataset.tool));
});
q('#timeline').addEventListener('pointerleave', () => {
  qa('.clip').forEach((c) => c.classList.remove('is-dim', 'is-lit'));
});
ScrollTrigger.create({
  trigger: '#craft-panel', start: 'top 92%', end: 'bottom top',
  onToggle: (self) => { panelVisible = self.isActive; if (self.isActive) paintPanel(0); }
});
activateTool('premiere', false);

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â• CINEMATIC WIPE â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const tlLayer = q('#transition-layer');
const panels = qa('.tr-panel', tlLayer);
function wipe(mid) {
  return new Promise((resolve) => {
    tlLayer.classList.add('is-on');
    const tl = gsap.timeline({
      onComplete: () => { tlLayer.classList.remove('is-on'); resolve(); }
    });
    tl.fromTo(panels,
      { xPercent: -160, skewX: -8 },
      { xPercent: 0, duration: 0.5, ease: 'power4.inOut', stagger: 0.07 })
      .add(() => mid && mid())
      .to(panels, {
        xPercent: 170, duration: 0.55, ease: 'power4.inOut', stagger: 0.07
      }, '+=0.06');
  });
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â• PROJECT MODAL â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const REEL = {
  id: 'reel', title: 'SHOWREEL 2026', category: 'Compilation', year: '2026',
  badge: '4K HDR', variant: 'signal', palette: ['#05070d', '#0e1a2b', '#e5241b', '#ffd7d4'],
  desc: 'Two minutes of the last twelve months â€” night exteriors, studio fashion, documentary grain and title work, cut to one breath.',
  long: 'A reel should not explain, it should prove. Every shot here is a frame from a delivered project, re-graded to a single look so the cut reads as one continuous film instead of a list of credits.',
  client: 'ZIAD FILMS', role: 'Director / Editor', duration: '02:14',
  format: '4K Â· 2.39:1', tools: 'Premiere Pro, After Effects, Resolve', award: 'â€”',
  delivery: 'Web master, festival loop'
};

const modal = q('#project-modal');
const mCanvas = q('#m-canvas');
const mCtx = mCanvas.getContext('2d');
const player = {
  items: PROJECTS, idx: 0, t: 0, dur: 30, playing: false,
  shots: [], raf: 0, last: 0
};

function buildShots(p) {
  return [
    makeShot(p.palette, 3, p.variant),
    makeShot(p.palette, 11, p.variant),
    makeShot(p.palette, 27, p.variant)
  ];
}
function tcFormat(sec) {
  return `00:${pad2(sec / 60)}:${pad2(sec % 60)}:${pad2((sec % 1) * 24)}`;
}
function renderPlayer(now) {
  if (!player.playing) return;
  const dt = Math.min((now - player.last) / 1000, 0.06);
  player.last = now;
  player.t = (player.t + dt) % player.dur;
  const shot = player.shots[Math.floor(player.t / 6) % player.shots.length];
  if (shot) paintShot(mCanvas, shot, (player.t % 6) / 6);
  q('#m-tc').textContent = tcFormat(player.t);
  q('#m-track-fill').style.width = (player.t / player.dur) * 100 + '%';
  player.raf = requestAnimationFrame(renderPlayer);
}
function setPlaying(v) {
  player.playing = v;
  q('#m-play').classList.toggle('is-playing', v);
  if (v) { player.last = performance.now(); player.raf = requestAnimationFrame(renderPlayer); }
  else cancelAnimationFrame(player.raf);
}

function fillModal(p, idx, total) {
  q('#m-idx').textContent = `${pad2(idx + 1)} / ${pad2(total)}`;
  q('#m-cat').textContent = `${p.category} â€” ${p.year}`;
  q('#m-title').textContent = p.title;
  q('#m-desc').textContent = p.long;
  q('#m-dur').textContent = '00:30';
  const rows = [
    ['Client', p.client], ['Year', p.year], ['Role', p.role],
    ['Runtime', p.duration], ['Format', p.format], ['Tools', p.tools],
    ['Recognition', p.award], ['Delivery', p.delivery]
  ];
  q('#m-details').innerHTML = rows
    .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
  player.shots = buildShots(p);
  player.t = 0;
  if (mCanvas.width) paintShot(mCanvas, player.shots[0], 0);
  q('#m-tc').textContent = tcFormat(0);
  q('#m-track-fill').style.width = '0%';
}

let modalOpen = false;
async function openProject(i, items = PROJECTS) {
  if (modalOpen) return;
  modalOpen = true;
  player.items = items;
  player.idx = i;
  await wipe(() => {
    fillModal(items[i], i, items.length);
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    lenis.stop();
    q('#m-scroll').scrollTop = 0;
    setPlaying(!REDUCED);
  });
  gsap.fromTo(modal,
    { clipPath: 'inset(46% 0 46% 0)' },
    { clipPath: 'inset(0% 0 0% 0)', duration: 0.9, ease: 'power4.inOut' });
  gsap.fromTo('.modal__player', { scale: 1.14, opacity: 0.4 },
    { scale: 1, opacity: 1, duration: 1.3, ease: 'power4.out' });
  gsap.fromTo('.modal__title', { yPercent: 110 }, { yPercent: 0, duration: 1, ease: 'power4.out', delay: 0.15 });
  gsap.fromTo('.modal__desc, .modal__details, .modal__nav',
    { y: 34, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.09, ease: 'power3.out', delay: 0.25 });
  q('#m-close').focus({ preventScroll: true });
}
async function closeProject() {
  if (!modalOpen) return;
  setPlaying(false);
  await wipe(() => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    lenis.start();
  });
  modalOpen = false;
}
function step(dir) {
  const n = player.items.length;
  const next = (player.idx + dir + n) % n;
  wipe(() => {
    player.idx = next;
    fillModal(player.items[next], next, n);
    q('#m-scroll').scrollTop = 0;
    setPlaying(!REDUCED);
    gsap.fromTo('.modal__player', { scale: 1.1, opacity: 0.5 },
      { scale: 1, opacity: 1, duration: 1, ease: 'power4.out' });
    gsap.fromTo('.modal__title', { yPercent: 110, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 0.9, ease: 'power4.out' });
    gsap.fromTo('.modal__desc', { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' });
  });
}

q('#m-close').addEventListener('click', closeProject);
q('#m-prev').addEventListener('click', () => step(-1));
q('#m-next').addEventListener('click', () => step(1));
q('#m-play').addEventListener('click', () => setPlaying(!player.playing));
q('#m-player').addEventListener('click', (e) => {
  if (e.target.closest('#m-play') || e.target.closest('#m-track')) return;
  setPlaying(!player.playing);
});
q('#m-track').addEventListener('click', (e) => {
  const r = e.currentTarget.getBoundingClientRect();
  player.t = clamp((e.clientX - r.left) / r.width, 0, 1) * player.dur;
  q('#m-track-fill').style.width = (player.t / player.dur) * 100 + '%';
});
addEventListener('keydown', (e) => {
  if (!modalOpen) return;
  if (e.key === 'Escape') closeProject();
  if (e.key === 'ArrowRight') step(1);
  if (e.key === 'ArrowLeft') step(-1);
});
q('#showreel-btn').addEventListener('click', () => openProject(0, [REEL, ...PROJECTS]));

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â• SECTION NAV SYNC â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
sections.forEach((id) => {
  const el = q(id);
  if (!el) return;
  ScrollTrigger.create({
    trigger: el, start: 'top 55%', end: 'bottom 55%',
    onToggle: (self) => { if (self.isActive) setActiveNav(id.slice(1)); }
  });
});

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â• BUILD + PRELOADER â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
buildReveals();

const preloader = q('#preloader');
const plNum = q('#pl-num');
const plBar = q('#pl-bar');
const plFrames = q('#pl-frames');
const counter = { v: 0 };

function intro() {
  const tl = gsap.timeline();
  tl.to('.pl-count, .pl-bar, .pl-top, .pl-bottom', {
    opacity: 0, y: -18, duration: 0.5, ease: 'power3.in', stagger: 0.04
  })
    .to('.pl-panel--a', { yPercent: -101, duration: 1, ease: 'power4.inOut' }, '-=0.15')
    .to('.pl-panel--b', { yPercent: 101, duration: 1, ease: 'power4.inOut' }, '<')
    .set(preloader, { display: 'none' })
    .fromTo('.hero__title .line', { yPercent: 115 },
      { yPercent: 0, duration: 1.35, ease: 'power4.out', stagger: 0.11 }, '-=0.62')
    .fromTo(heroCanvas, { opacity: 0, scale: 1.06 },
      { opacity: 1, scale: 1, duration: 1.6, ease: 'power3.out' }, '<-0.1')
    .fromTo('.hero__eyebrow', { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, '<0.1')
    .fromTo('.hero__sub, .hero__actions',
      { opacity: 0, y: 26 },
      { opacity: 1, y: 0, duration: 1, stagger: 0.1, ease: 'power3.out' }, '<0.15')
    .fromTo('.hero__sub .wi', { yPercent: 115 },
      { yPercent: 0, duration: 1.05, ease: 'power4.out', stagger: 0.026 }, '<0.1')
    .fromTo('.hero__frame span',
      { opacity: 0 }, { opacity: 1, duration: 1.2, stagger: 0.05 }, '<')
    .fromTo('.hero__scroll', { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.8 }, '-=0.5')
    .fromTo('.nav', { opacity: 0 }, { opacity: 1, duration: 1, ease: 'power2.out' }, '<-0.6')
    .add(() => {
      /* canvas fades only once the hero has been revealed */
      gsap.fromTo('#webgl', { opacity: 1 }, {
        opacity: 0, ease: 'none', immediateRender: false,
        scrollTrigger: { trigger: '#hero', start: 'bottom 70%', end: 'bottom 15%', scrub: true }
      });
      ScrollTrigger.refresh();
    });
}

gsap.set('.hero__title .line', { yPercent: 115 });
gsap.set('.hero__eyebrow, .hero__sub, .hero__actions, .hero__scroll, .nav', { opacity: 0 });

const ready = Promise.all([
  document.fonts ? document.fonts.ready : Promise.resolve(),
  new Promise((r) => setTimeout(r, REDUCED ? 200 : 900))
]);

gsap.to(counter, {
  v: 100, duration: REDUCED ? 0.3 : 1.5, ease: 'power2.inOut',
  onUpdate: () => {
    plNum.textContent = pad2(counter.v);
    plBar.style.transform = `scaleX(${counter.v / 100})`;
    plFrames.textContent = 'FRAME ' + String(Math.floor(counter.v * 2.4)).padStart(4, '0');
  },
  onComplete: () => {
    ready.then(intro);
  }
});

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â• RESIZE â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
let rt;
addEventListener('resize', () => {
  clearTimeout(rt);
  rt = setTimeout(() => {
    hero3d && hero3d.resize();
    ScrollTrigger.refresh();
  }, 220);
});
addEventListener('load', () => ScrollTrigger.refresh());

/* safety: never trap the visitor behind the preloader */
setTimeout(() => { if (preloader && preloader.style.display !== 'none') { preloader.style.display = 'none'; intro(); } }, 9000);
