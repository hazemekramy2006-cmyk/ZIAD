/* ==========================================================================
   ZIAD SHAABAN — Cinematic Portfolio
   Vanilla JS · GSAP/ScrollTrigger · Lenis · three.js
   --------------------------------------------------------------------------
   00  Helpers & environment
   01  Smooth scrolling (Lenis) + GSAP bridge
   02  Preloader
   03  Custom cursor + magnetic elements
   04  Navigation, active state, cinematic section wipe
   05  Reveal system (word masks, line reveals, counters)
   06  Hero: parallax, HUD timecode, timeline playhead
   07  Hero: three.js virtual film studio (lens / iris / frames)
   08  Marquee bands (scroll-velocity driven)
   09  Featured reel (badge follow + hover video)
   10  Projects archive (horizontal pin, 3D depth, hover tilt)
   11  Project modal / immersive viewer
   12  Video previews (easy-to-replace data-src)
   13  Process timeline progress
   14  Skills NLE (interactive editing timeline)
   15  Page timecode + scroll progress
   ========================================================================== */

/* --------------------------------------------------------------------------
   00 — HELPERS & ENVIRONMENT
-------------------------------------------------------------------------- */
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp  = (a, b, t) => a + (b - a) * t;

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const TOUCH   = window.matchMedia('(hover: none), (pointer: coarse)').matches;
const HAS_GSAP = !!(window.gsap && window.ScrollTrigger);
const NARROW  = () => window.matchMedia('(max-width: 900px)').matches;

if (HAS_GSAP) gsap.registerPlugin(ScrollTrigger);
else document.documentElement.classList.add('no-gsap');

/* --------------------------------------------------------------------------
   01 — SMOOTH SCROLLING + GSAP BRIDGE
-------------------------------------------------------------------------- */
let lenis = null;

function initScroll() {
  if (REDUCED || !window.Lenis) {
    document.documentElement.classList.add('no-lenis');
    return;
  }
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1, touchMultiplier: 1.6 });

  if (HAS_GSAP) {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
}

function scrollToTarget(el, immediate = false) {
  if (lenis) lenis.scrollTo(el, { immediate, duration: 1.2 });
  else el.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' });
}

function stopScroll(stop = true) {
  if (!lenis) {
    document.body.style.overflow = stop ? 'hidden' : '';
    return;
  }
  stop ? lenis.stop() : lenis.start();
}

/* Deep link: #section in the URL opens on that section */
function scrollToHash() {
  const hash = location.hash;
  if (!hash || hash === '#') return;
  const el = $(hash);
  if (!el) return;
  setTimeout(() => {
    if (lenis) lenis.scrollTo(el, { immediate: true });
    else window.scrollTo(0, el.offsetTop);
    if (HAS_GSAP) ScrollTrigger.update();
    if (typeof initNav === 'function') window.dispatchEvent(new Event('scroll'));
  }, 150);
}

/* --------------------------------------------------------------------------
   02 — PRELOADER
-------------------------------------------------------------------------- */
function initLoader() {
  const loader = $('#loader');
  const fill   = $('#loaderFill');
  const num    = $('#loaderNum');
  const hero   = $('.hero');
  if (!loader) return;

  const start = performance.now();
  const DUR = REDUCED ? 250 : 1500;
  let finished = false;

  const finish = () => {
    if (finished) return;
    finished = true;
    fill.style.width = '100%';
    num.textContent = '100';
    loader.classList.add('is-done');
    hero?.classList.add('is-ready');
    scrollToHash();
    if (HAS_GSAP) ScrollTrigger.refresh();
  };

  const tick = (now) => {
    const p = clamp((now - start) / DUR, 0, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const v = Math.round(eased * 100);
    fill.style.width = v + '%';
    num.textContent = String(v).padStart(3, '0');
    if (p < 1) requestAnimationFrame(tick);
    else setTimeout(finish, 220);
  };
  requestAnimationFrame(tick);
  setTimeout(finish, 3200); // safety net
}

/* --------------------------------------------------------------------------
   03 — CUSTOM CURSOR + MAGNETIC ELEMENTS
-------------------------------------------------------------------------- */
function initCursor() {
  const cursor = $('.cursor');
  if (!cursor || TOUCH) return;

  const label = $('.cursor__label', cursor);
  let x = window.innerWidth / 2, y = window.innerHeight / 2;
  let cx = x, cy = y;

  window.addEventListener('mousemove', (e) => { x = e.clientX; y = e.clientY; }, { passive: true });
  window.addEventListener('mousedown', () => cursor.classList.add('is-down'));
  window.addEventListener('mouseup',   () => cursor.classList.remove('is-down'));

  const loop = () => {
    cx = lerp(cx, x, 0.2);
    cy = lerp(cy, y, 0.2);
    cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  // Cursor states from data-cursor attributes
  const bind = (el) => {
    const mode = el.dataset.cursor;
    el.addEventListener('mouseenter', () => {
      cursor.classList.remove('is-view', 'is-play', 'is-hover');
      if (mode === 'view')  { cursor.classList.add('is-view');  label.textContent = 'View'; }
      else if (mode === 'play') { cursor.classList.add('is-play'); label.textContent = 'Play'; }
      else cursor.classList.add('is-hover');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('is-view', 'is-play', 'is-hover');
      label.textContent = '';
    });
  };
  $$('[data-cursor]').forEach(bind);
  $$('a:not([data-cursor]), button:not([data-cursor])').forEach((el) => {
    el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
  });
}

function initMagnetic() {
  if (TOUCH) return;
  $$('.magnetic').forEach((el) => {
    const strength = 0.32;
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) * strength;
      const dy = (e.clientY - (r.top + r.height / 2)) * strength;
      el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = 'translate3d(0,0,0)'; });
  });
}

/* --------------------------------------------------------------------------
   04 — NAVIGATION + CINEMATIC SECTION WIPE
-------------------------------------------------------------------------- */
function initNav() {
  const nav = $('#nav');
  const burger = $('#burger');
  const menu = $('#mobileMenu');
  const indicator = $('.nav__indicator');
  const links = $$('.nav__list a');
  const sections = ['#home', '#about', '#projects', '#skills', '#contact']
    .map((id) => $(id)).filter(Boolean);

  /* --- scrolled state --- */
  const onScroll = () => {
    nav.classList.toggle('is-stuck', window.scrollY > 60);
    setActive();
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  if (lenis) lenis.on('scroll', onScroll);
  onScroll();

  /* --- active link + animated indicator --- */
  function setActive() {
    const probe = window.scrollY + window.innerHeight * 0.35;
    let current = sections[0];
    sections.forEach((s) => { if (s.offsetTop <= probe) current = s; });
    links.forEach((a) => {
      const on = a.getAttribute('href') === '#' + current.id;
      a.classList.toggle('is-active', on);
      if (on && indicator) {
        indicator.style.width = a.offsetWidth + 'px';
        indicator.style.transform = `translateX(${a.offsetLeft}px)`;
      }
    });
  }

  /* --- mobile menu --- */
  const closeMenu = () => {
    menu.classList.remove('is-open');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    stopScroll(false);
  };
  burger.addEventListener('click', () => {
    const open = !menu.classList.contains('is-open');
    menu.classList.toggle('is-open', open);
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    stopScroll(open);
  });

  /* --- cinematic wipe transition between sections --- */
  const wipe = $('#wipe');
  let wiping = false;

  const jumpTo = (el) => {
    if (lenis) lenis.scrollTo(el, { immediate: true });
    else window.scrollTo({ top: el.offsetTop, behavior: 'auto' });
    if (HAS_GSAP) ScrollTrigger.update();
  };

  $$('[data-nav]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      const target = $(href);
      if (!target) return;
      e.preventDefault();
      closeMenu();
      if (history.replaceState) history.replaceState(null, '', href);

      if (REDUCED || wiping || !wipe) { scrollToTarget(target); return; }
      wiping = true;
      wipe.classList.remove('is-out');
      wipe.classList.add('is-in');
      setTimeout(() => {
        jumpTo(target);
        wipe.classList.remove('is-in');
        wipe.classList.add('is-out');
        setTimeout(() => {
          wipe.classList.remove('is-out');
          wipe.style.visibility = '';
          wiping = false;
        }, 520);
      }, 430);
    });
  });

  window.addEventListener('resize', setActive);
}

/* --------------------------------------------------------------------------
   05 — REVEAL SYSTEM
-------------------------------------------------------------------------- */
function splitWords(el) {
  if (el.dataset.split === 'done') return;
  el.dataset.split = 'done';
  let index = 0;

  const wrapText = (text) => {
    const frag = document.createDocumentFragment();
    text.split(/(\s+)/).forEach((chunk) => {
      if (!chunk.trim()) { frag.appendChild(document.createTextNode(chunk)); return; }
      const w = document.createElement('span');
      w.className = 'w';
      const inner = document.createElement('span');
      inner.className = 'wi';
      inner.style.transitionDelay = Math.min(index * 55, 900) + 'ms';
      inner.textContent = chunk;
      index++;
      w.appendChild(inner);
      frag.appendChild(w);
    });
    return frag;
  };

  const walk = (node) => {
    const kids = Array.from(node.childNodes);
    kids.forEach((child) => {
      if (child.nodeType === 3) node.insertBefore(wrapText(child.nodeValue), child), node.removeChild(child);
      else if (child.nodeType === 1) walk(child);
    });
  };
  walk(el);
}

function initReveals() {
  const revealEls = $$('[data-reveal], [data-split], [data-reveal-lines], .sec-head, .tool, .step');
  $$('[data-split], [data-reveal-lines]').forEach(splitWords);

  if (!('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-in'));
    $$('[data-count]').forEach(runCounter);
    return;
  }

  /* Masked elements (.line__in) are translated outside their clipped parent,
     so we observe the parent instead and flag the children. */
  const targets = new Map();
  revealEls.forEach((el) => {
    const obs = (el.classList.contains('line__in') && el.parentElement) ? el.parentElement : el;
    if (!targets.has(obs)) targets.set(obs, []);
    targets.get(obs).push(el);
  });

  const reveal = (el) => {
    el.classList.add('is-in');
    $$('[data-count]', el).forEach(runCounter);
    if (el.hasAttribute('data-count')) runCounter(el);
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      (targets.get(entry.target) || [entry.target]).forEach(reveal);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  targets.forEach((_, obs) => io.observe(obs));
  $$('[data-count]').forEach((el) => io.observe(el));
}

function runCounter(el) {
  if (el.dataset.done) return;
  el.dataset.done = '1';
  const target = parseInt(el.dataset.count, 10) || 0;
  const pad = parseInt(el.dataset.pad || '2', 10);
  const dur = REDUCED ? 1 : 1300;
  const start = performance.now();

  const step = (now) => {
    const p = clamp((now - start) / dur, 0, 1);
    const eased = 1 - Math.pow(1 - p, 4);
    el.textContent = String(Math.round(eased * target)).padStart(pad, '0');
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* --------------------------------------------------------------------------
   06 — HERO: PARALLAX, HUD TIMECODE, TIMELINE PLAYHEAD
-------------------------------------------------------------------------- */
const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

function initHeroMotion() {
  window.addEventListener('mousemove', (e) => {
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  const studio  = $('.hero__studio');
  const content = $('.hero__content');
  const beams   = $('.hero__beams');
  const playhead = $('#heroPlayhead');
  const hudTime = $('#hudTime');
  const timeline = $('.hero__timeline');
  const started = performance.now();

  const frame = (now) => {
    pointer.x = lerp(pointer.x, pointer.tx, 0.06);
    pointer.y = lerp(pointer.y, pointer.ty, 0.06);

    if (!REDUCED) {
      if (studio)  studio.style.transform  = `translate3d(${pointer.x * -18}px, ${pointer.y * -12}px, 0) scale(1.06)`;
      if (content) content.style.transform = `translate3d(${pointer.x * 8}px, ${pointer.y * 5}px, 0)`;
      if (beams)   beams.style.transform   = `translate3d(${pointer.x * 26}px, ${pointer.y * 10}px, 0)`;
    }

    // Editing playhead sweep
    if (playhead && timeline) {
      const w = timeline.clientWidth;
      const gutter = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--gutter')) || 40;
      const p = ((now - started) % 16000) / 16000;
      playhead.style.left = (gutter + p * (w - gutter * 2)) + 'px';
    }

    // HUD running timecode (24 fps)
    if (hudTime) {
      const total = (now - started) / 1000;
      const f = Math.floor((total % 1) * 24);
      const s = Math.floor(total) % 60;
      const m = Math.floor(total / 60) % 60;
      const h = Math.floor(total / 3600);
      hudTime.textContent =
        String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' +
        String(s).padStart(2, '0') + ':' + String(f).padStart(2, '0');
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

/* --------------------------------------------------------------------------
   07 — HERO: THREE.JS VIRTUAL FILM STUDIO
-------------------------------------------------------------------------- */
function loadThree() {
  if (window.THREE) return Promise.resolve(window.THREE);
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'vendor/three.global.js';
    s.onload = () => (window.THREE ? resolve(window.THREE) : reject(new Error('THREE missing')));
    s.onerror = () => reject(new Error('three.global.js failed'));
    document.head.appendChild(s);
  });
}

async function initHero3D() {
  const canvas = $('#scene');
  if (!canvas || REDUCED) return;

  let THREE = null;
  try { THREE = await loadThree(); }
  catch (err) { console.warn('3D scene unavailable:', err); return; }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (err) { console.warn('WebGL unavailable:', err); return; }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0, 9.4);

  const rig = new THREE.Group();
  scene.add(rig);

  const matDark = new THREE.MeshStandardMaterial({ color: 0x171214, metalness: 0.95, roughness: 0.3 });
  const matBlade = new THREE.MeshStandardMaterial({ color: 0x141012, metalness: 0.9, roughness: 0.38, emissive: 0x3a0508, emissiveIntensity: 0.28 });
  const matRed = new THREE.MeshStandardMaterial({ color: 0x8B1117, emissive: 0x8B1117, emissiveIntensity: 1.15, metalness: 0.5, roughness: 0.35 });

  // Lens barrel rings
  const ringSpecs = [
    { r: 2.75, t: 0.07, mat: matDark, rx: 0, ry: 0 },
    { r: 2.45, t: 0.022, mat: matRed, rx: 0.22, ry: 0.1 },
    { r: 2.15, t: 0.05, mat: matDark, rx: -0.16, ry: 0.22 },
    { r: 1.55, t: 0.03, mat: matDark, rx: 0.3, ry: -0.18 }
  ];
  const rings = ringSpecs.map((s) => {
    const m = new THREE.Mesh(new THREE.TorusGeometry(s.r, s.t, 14, 160), s.mat);
    m.rotation.set(s.rx, s.ry, 0);
    rig.add(m);
    return m;
  });

  // Aperture iris (6 blades)
  const iris = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.5, 0.04), matBlade);
    const a = (i / 6) * Math.PI * 2;
    blade.position.set(Math.cos(a) * 0.78, Math.sin(a) * 0.78, 0);
    blade.rotation.z = a + Math.PI / 2.4;
    blade.rotation.x = 0.35;
    iris.add(blade);
  }
  rig.add(iris);

  // Glowing core
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.34, 32, 32), new THREE.MeshBasicMaterial({ color: 0xc21620 }));
  rig.add(core);
  const halo = new THREE.Mesh(
    new THREE.RingGeometry(0.5, 1.1, 64),
    new THREE.MeshBasicMaterial({ color: 0x8B1117, transparent: true, opacity: 0.28, side: THREE.DoubleSide })
  );
  rig.add(halo);

  // Floating film frames
  const frames = [];
  const mkFrame = (w, h, color, opacity) => {
    const geo = new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, 0.02));
    const line = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
    scene.add(line);
    frames.push(line);
    return line;
  };
  const f1 = mkFrame(5.6, 3.2, 0xffffff, 0.28);
  f1.position.set(-1.4, 1.5, -2.6);
  f1.rotation.set(0.24, 0.5, 0.1);
  const f2 = mkFrame(4.4, 2.5, 0x8B1117, 0.55);
  f2.position.set(2.2, -1.7, -1.4);
  f2.rotation.set(-0.2, -0.45, -0.08);

  // Film dust
  const count = NARROW() ? 260 : 520;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 18;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    color: 0xffffff, size: 0.035, transparent: true, opacity: 0.5, sizeAttenuation: true
  }));
  scene.add(dust);

  // Lighting
  scene.add(new THREE.AmbientLight(0x3a0a0c, 1.1));
  const key = new THREE.DirectionalLight(0xffffff, 1.5);
  key.position.set(4, 6, 6);
  scene.add(key);
  const redLight = new THREE.PointLight(0xc21620, 60, 30, 2);
  redLight.position.set(4.2, -1.4, 3.4);
  scene.add(redLight);
  const rim = new THREE.PointLight(0xffffff, 22, 26, 2);
  rim.position.set(-5, 3.4, 2);
  scene.add(rim);

  // Resize
  const resize = () => {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener('resize', resize);

  // Only render while hero is on screen
  let visible = true;
  const hero = $('.hero');
  if ('IntersectionObserver' in window && hero) {
    new IntersectionObserver((e) => { visible = e[0].isIntersecting; }, { threshold: 0.02 }).observe(hero);
  }

  let scrollP = 0;
  if (HAS_GSAP) {
    ScrollTrigger.create({
      trigger: hero, start: 'top top', end: 'bottom top', scrub: true,
      onUpdate: (self) => { scrollP = self.progress; }
    });
  }

  const clock = new THREE.Clock();
  const render = () => {
    requestAnimationFrame(render);
    if (!visible) return;
    const t = clock.getElapsedTime();

    rig.rotation.y = lerp(rig.rotation.y, pointer.x * 0.55 + t * 0.06 + scrollP * 1.4, 0.05);
    rig.rotation.x = lerp(rig.rotation.x, pointer.y * 0.35 + Math.sin(t * 0.4) * 0.05 + scrollP * 0.5, 0.05);
    rig.rotation.z = Math.sin(t * 0.25) * 0.06;
    rig.position.y = Math.sin(t * 0.6) * 0.12 - scrollP * 1.6;

    iris.rotation.z = t * 0.22;
    core.scale.setScalar(1 + Math.sin(t * 2.2) * 0.09);
    halo.material.opacity = 0.2 + Math.sin(t * 1.6) * 0.1;

    rings[1].rotation.z = t * 0.35;
    rings[3].rotation.z = -t * 0.28;

    frames[0].rotation.y = 0.5 + Math.sin(t * 0.3) * 0.18 + pointer.x * 0.15;
    frames[1].rotation.y = -0.45 + Math.cos(t * 0.26) * 0.16 - pointer.x * 0.12;
    frames[0].position.y = 1.5 + Math.sin(t * 0.5) * 0.18;
    frames[1].position.y = -1.7 + Math.cos(t * 0.44) * 0.2;

    dust.rotation.y = t * 0.02 + pointer.x * 0.05;
    dust.rotation.x = pointer.y * 0.03;

    redLight.position.x = lerp(redLight.position.x, 2.4 + pointer.x * 3.4, 0.05);
    redLight.position.y = lerp(redLight.position.y, -1.2 - pointer.y * 2.4, 0.05);
    redLight.intensity = 55 + Math.sin(t * 3) * 8 + Math.abs(pointer.x) * 22;

    camera.position.x = lerp(camera.position.x, pointer.x * 0.7, 0.05);
    camera.position.y = lerp(camera.position.y, -pointer.y * 0.5, 0.05);
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  };
  render();
}

/* --------------------------------------------------------------------------
   08 — MARQUEE BANDS
-------------------------------------------------------------------------- */
function initMarquees() {
  const bands = $$('[data-marquee]').map((el) => ({
    row: $('.marquee__row', el),
    dir: parseFloat(el.dataset.speed) || 1,
    x: 0,
    half: 0
  })).filter((b) => b.row);

  if (!bands.length) return;

  const measure = () => bands.forEach((b) => { b.half = b.row.scrollWidth / 2; });
  measure();
  window.addEventListener('resize', measure);

  let velocity = 0, lastY = window.scrollY;
  window.addEventListener('scroll', () => {
    velocity = clamp(window.scrollY - lastY, -60, 60);
    lastY = window.scrollY;
  }, { passive: true });

  const step = () => {
    velocity *= 0.92;
    bands.forEach((b) => {
      if (!b.half) return;
      b.x -= (0.55 + Math.abs(velocity) * 0.06) * b.dir;
      if (b.x <= -b.half) b.x += b.half;
      if (b.x >= 0) b.x -= b.half;
      b.row.style.transform = `translate3d(${b.x}px,0,0)`;
    });
    requestAnimationFrame(step);
  };
  if (!REDUCED) requestAnimationFrame(step);
}

/* --------------------------------------------------------------------------
   09 — FEATURED REEL
-------------------------------------------------------------------------- */
function initReel() {
  const reel = $('.reel');
  const badge = $('#reelBadge');
  if (!reel) return;

  if (!TOUCH && badge) {
    reel.addEventListener('mousemove', (e) => {
      const r = reel.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) * 0.16;
      const dy = (e.clientY - (r.top + r.height / 2)) * 0.22;
      badge.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1.05)`;
    });
    reel.addEventListener('mouseleave', () => {
      badge.style.transform = 'translate(-50%,-50%) scale(.9)';
    });
  }
}

/* --------------------------------------------------------------------------
   10 — PROJECTS ARCHIVE: horizontal pin + 3D depth + hover tilt
-------------------------------------------------------------------------- */
function initArchive() {
  const archive = $('#archive');
  const track = $('#archiveTrack');
  const bar = $('#archiveProgress');
  if (!archive || !track) return;

  const cards = $$('.p', track);

  /* Hover tilt (desktop only) */
  if (!TOUCH) {
    cards.forEach((card) => {
      const media = $('.p__media', card);
      if (!media) return;
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        media.style.setProperty('--ry', (px * 12).toFixed(2) + 'deg');
        media.style.setProperty('--rx', (py * -10).toFixed(2) + 'deg');
      });
      card.addEventListener('mouseleave', () => {
        media.style.setProperty('--ry', '0deg');
        media.style.setProperty('--rx', '0deg');
      });
    });
  }

  /* Depth effect based on distance from viewport centre */
  const depth = () => {
    if (NARROW()) return;
    const mid = window.innerWidth / 2;
    cards.forEach((card) => {
      const r = card.getBoundingClientRect();
      if (r.right < -200 || r.left > window.innerWidth + 200) return;
      const d = ((r.left + r.width / 2) - mid) / window.innerWidth;
      const rot = clamp(d * -10, -6, 6);
      const sc = 1 - Math.min(Math.abs(d) * 0.12, 0.12);
      card.style.transform = `perspective(1600px) rotateY(${rot.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
    });
  };

  if (!HAS_GSAP) {
    archive.classList.add('is-scroll');
    window.addEventListener('scroll', depth, { passive: true });
    depth();
    return;
  }

  const distance = () => Math.max(0, track.scrollWidth - archive.clientWidth);
  const clearCards = () => cards.forEach((c) => c.style.removeProperty('transform'));

  let tween = null;

  const enable = () => {
    if (tween || NARROW()) return;
    tween = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: archive,
        start: 'top top',
        end: () => '+=' + distance(),
        pin: true,
        scrub: 0.55,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefresh: depth,
        onUpdate: (self) => {
          if (bar) bar.style.transform = `scaleX(${self.progress})`;
          depth();
        }
      }
    });
  };

  const disable = () => {
    if (!tween) return;
    if (tween.scrollTrigger) tween.scrollTrigger.kill();
    tween.kill();
    tween = null;
    gsap.set(track, { clearProps: 'transform' });
    clearCards();
    if (bar) bar.style.transform = '';
  };

  enable();

  window.addEventListener('resize', () => {
    if (NARROW()) disable(); else enable();
    ScrollTrigger.refresh();
  });
}

/* --------------------------------------------------------------------------
   11 — PROJECT MODAL / IMMERSIVE VIEWER
-------------------------------------------------------------------------- */
function initModal() {
  const modal = $('#modal');
  if (!modal) return;

  const projects = $$('.p');
  const els = {
    idx: $('#mIdx'), cat: $('#mCat'), title: $('#mTitle'), desc: $('#mDesc'),
    year: $('#mYear'), role: $('#mRole'), dur: $('#mDur'), fmt: $('#mFmt'),
    phNum: $('#mPhNum'), video: $('#mVideo'), now: $('#mNow'),
    prev: $('#mPrev'), next: $('#mNext'), close: $('#mClose'),
    count: $('.modal__count')
  };
  let index = 0;
  let featured = false;

  const setVideo = (el) => {
    const src = el?.dataset.src || '';
    if (els.video.dataset.src !== src) {
      els.video.classList.remove('is-live');
      els.video.pause();
      els.video.removeAttribute('src');
      els.video.dataset.src = src;
      if (src) { els.video.src = src; }
    }
    if (src) {
      const p = els.video.play();
      if (p) p.then(() => els.video.classList.add('is-live')).catch(() => {});
    }
  };

  const render = (i) => {
    const card = projects[i];
    if (!card) return;
    index = i;
    const d = card.dataset;
    const num = String(i + 1).padStart(2, '0');
    els.idx.textContent = num;
    els.now.textContent = num;
    els.cat.textContent = d.category || '';
    els.title.textContent = d.title || '';
    els.desc.textContent = d.desc || '';
    els.year.textContent = d.year || '—';
    els.role.textContent = d.role || '—';
    els.dur.textContent = d.duration || '—';
    els.fmt.textContent = d.format || '—';
    els.phNum.textContent = num;
    setVideo($('video', card));
  };

  const open = (card) => {
    featured = card.classList.contains('reel');
    if (featured) {
      const d = card.dataset;
      els.idx.textContent = '★';
      els.now.textContent = 'REEL';
      els.cat.textContent = d.category || 'Featured';
      els.title.textContent = d.title || 'The Reel';
      els.desc.textContent = d.desc || '';
      els.year.textContent = d.year || '—';
      els.role.textContent = d.role || '—';
      els.dur.textContent = d.duration || '—';
      els.fmt.textContent = d.format || '—';
      els.phNum.textContent = '★';
      setVideo($('video', card));
    } else {
      render(projects.indexOf(card));
    }
    els.count.style.visibility = featured ? 'hidden' : 'visible';

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    stopScroll(true);
    setTimeout(() => els.close.focus(), 600);
  };

  const close = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    els.video.pause();
    stopScroll(false);
  };

  /* open triggers */
  $$('.p, [data-project]').forEach((card) => {
    card.addEventListener('click', () => open(card));
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(card); }
    });
  });

  els.close.addEventListener('click', close);
  els.prev.addEventListener('click', () => render((index - 1 + projects.length) % projects.length));
  els.next.addEventListener('click', () => render((index + 1) % projects.length));
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (featured) return;
    if (e.key === 'ArrowLeft')  render((index - 1 + projects.length) % projects.length);
    if (e.key === 'ArrowRight') render((index + 1) % projects.length);
  });
}

/* --------------------------------------------------------------------------
   12 — VIDEO PREVIEWS (set data-src="videos/01.mp4" to enable)
-------------------------------------------------------------------------- */
function initVideos() {
  $$('.pv-video').forEach((video) => {
    const src = video.dataset.src;
    if (!src) return;
    const host = video.closest('.p__media, .reel__media, .modal__stage') || video.parentElement;

    const play = () => {
      if (!video.src) video.src = src;
      const p = video.play();
      if (p) p.then(() => video.classList.add('is-live')).catch(() => {});
    };
    const stop = () => { video.pause(); };

    if (host) {
      host.addEventListener('mouseenter', play);
      host.addEventListener('mouseleave', stop);
    }

    // Autoplay muted loops when their card enters the viewport
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        entries.forEach((e) => e.isIntersecting ? play() : stop());
      }, { threshold: 0.55 }).observe(video);
    }
  });
}

/* --------------------------------------------------------------------------
   13 — PROCESS TIMELINE PROGRESS
-------------------------------------------------------------------------- */
function initTimeline() {
  const timeline = $('#timeline');
  const fill = $('#timelineFill');
  if (!timeline || !fill || !HAS_GSAP) return;

  ScrollTrigger.create({
    trigger: timeline,
    start: 'top 78%',
    end: 'bottom 62%',
    onUpdate: (self) => {
      fill.style.transform = NARROW()
        ? `scaleY(${self.progress})`
        : `scaleX(${self.progress})`;
    },
    onRefresh: (self) => {
      fill.style.transform = NARROW()
        ? `scaleY(${self.progress})`
        : `scaleX(${self.progress})`;
    }
  });

  /* Small cinematic elements travelling with the scroll */
  if (!REDUCED) {
    $$('.step__marker', timeline).forEach((m, i) => {
      gsap.fromTo(m, { xPercent: -40 }, {
        xPercent: 40, ease: 'none',
        scrollTrigger: { trigger: timeline, start: 'top bottom', end: 'bottom top', scrub: 1 + i * 0.2 }
      });
    });
  }
}

/* --------------------------------------------------------------------------
   14 — SKILLS: INTERACTIVE EDITING TIMELINE
-------------------------------------------------------------------------- */
function initNLE() {
  const nle = $('#nle');
  const head = $('#nlePlayhead');
  const tc = $('#nleTc');
  const ruler = $('#nleRuler');
  if (!nle || !head) return;

  // Build ruler ticks
  if (ruler) {
    ruler.style.background =
      'repeating-linear-gradient(90deg, rgba(255,255,255,.3) 0 1px, transparent 1px 26px)';
  }

  const DURATION = 96; // seconds shown on the timeline
  const fmt = (sec) => {
    const s = Math.max(0, Math.min(DURATION, sec));
    const m = Math.floor(s / 60);
    const ss = Math.floor(s % 60);
    const f = Math.floor((s % 1) * 24);
    return `00:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}:${String(f).padStart(2, '0')}`;
  };

  const move = (clientX) => {
    const r = nle.getBoundingClientRect();
    const x = clamp(clientX - r.left, 0, r.width);
    head.style.left = x + 'px';
    if (tc) tc.textContent = fmt((x / r.width) * DURATION);
  };

  nle.addEventListener('mousemove', (e) => move(e.clientX), { passive: true });
  nle.addEventListener('touchmove', (e) => { if (e.touches[0]) move(e.touches[0].clientX); }, { passive: true });

  nle.addEventListener('mouseleave', () => {
    const r = nle.getBoundingClientRect();
    head.style.left = (r.width * 0.34) + 'px';
    if (tc) tc.textContent = fmt(DURATION * 0.34);
  });

  const r0 = nle.getBoundingClientRect();
  head.style.left = (r0.width * 0.34) + 'px';
  if (tc) tc.textContent = fmt(DURATION * 0.34);
}

/* --------------------------------------------------------------------------
   15 — PAGE TIMECODE + SCROLL PROGRESS
-------------------------------------------------------------------------- */
function initProgress() {
  const fill = $('.scrollbar__fill');
  const tc = $('#timecode');
  const RUNTIME = 90; // seconds of "reel" mapped across the page

  const update = () => {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const p = clamp(window.scrollY / max, 0, 1);
    if (fill) fill.style.transform = `scaleX(${p})`;
    if (tc) {
      tc.classList.toggle('is-on', window.scrollY > window.innerHeight * 0.75);
      const s = p * RUNTIME;
      const mm = String(Math.floor(s / 60)).padStart(2, '0');
      const ss = String(Math.floor(s % 60)).padStart(2, '0');
      const ff = String(Math.floor((s % 1) * 24)).padStart(2, '0');
      tc.textContent = `00:${mm}:${ss}:${ff}`;
    }
  };

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  if (lenis) lenis.on('scroll', update);
  update();
}

/* --------------------------------------------------------------------------
   BOOT
-------------------------------------------------------------------------- */
function boot() {
  initScroll();
  initLoader();
  window.__ziadBooted = true;
  initCursor();
  initMagnetic();
  initNav();
  initReveals();
  initHeroMotion();
  initMarquees();
  initReel();
  initArchive();
  initModal();
  initVideos();
  initTimeline();
  initNLE();
  initProgress();

  const idle = window.requestIdleCallback
    ? (fn) => window.requestIdleCallback(fn, { timeout: 1500 })
    : (fn) => setTimeout(fn, 300);
  idle(initHero3D);

  if (HAS_GSAP) {
    window.addEventListener('load', () => ScrollTrigger.refresh());
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
}

boot();
