/* ==========================================================================
   ZIAD SHAABAN — Simple UI
   Vanilla JS: nav · reveals · counters · modal · videos · EN/AR translation
   ========================================================================== */

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* --------------------------------------------------------------------------
   ARABIC TRANSLATIONS (English lives in index.html and is captured on boot)
-------------------------------------------------------------------------- */
const AR = {
  'nav.home':'الرئيسية',
  'nav.about':'نبذة عني',
  'nav.projects':'المشاريع',
  'nav.skills':'المهارات',
  'nav.contact':'تواصل معي',
  'nav.cta':'ابدأ مشروعًا',
  'a11y.menu':'فتح القائمة',
  'a11y.close':'إغلاق المشروع',

  'hero.eyebrow':'مصوّر فيديو ومونتير · سنتان من الخبرة',
  'hero.role':'مصوّر فيديو<br>ومونتير',
  'hero.statement':'ألتقط اللحظات. أحرّر القصص. <br>أحوّل اللقطات إلى تجارب.',
  'hero.cta1':'استكشف أعمالي',
  'hero.cta2':'تواصل معي',
  'hero.scroll':'مرّر للأسفل',

  'm1.a':'الالتقاط','m1.b':'المونتاج','m1.c':'الألوان','m1.d':'التسليم',
  'm2.a':'اللقطات','m2.b':'الإيقاع','m2.c':'القصة','m2.d':'الكادر',

  'about.title':'عن <em>المبدع</em>',
  'about.meta':'تصوير / مونتاج',
  'about.caption':'الكاميرا ← اللقطات ← المونتاج ← القصة',
  'about.lead':'زياد شعبان مصوّر فيديو ومونتير بخبرة عملية سنتان في صنع محتوى بصري جذّاب.',
  'about.p2':'يجمع بين التصوير والمونتاج ليحوّل الأفكار إلى قصص بصرية سينمائية.',
  'about.p3':'من خلال مشاريع مختلفة وتعاون مع علامات تجارية وأعمال، يكيّف أسلوبه البصري ليتوافق مع هوية كل مشروع وجمهوره وأهدافه.',
  'about.approach':'أسلوب العمل',
  'about.li1':'السرد البصري',
  'about.li2':'التكوين السينمائي',
  'about.li3':'مونتاج نظيف',
  'about.li4':'الإيقاع والوتيرة',
  'about.li5':'انتقالات إبداعية',
  'about.li6':'تصحيح الألوان',
  'about.li7':'محتوى وسائل التواصل',
  'about.li8':'فهم الرسالة خلف كل فيديو',

  'stat.1':'سنوات خبرة',
  'stat.2':'مشاريع مختارة',
  'stat.3':'تصنيفات محتوى',
  'stat.4':'المعيار السينمائي',

  'process.title':'من الفكرة إلى <em>اللقطة الأخيرة</em>',
  'process.meta':'خطوات العمل',
  'process.s1t':'فكرة',
  'process.s1x':'فهم المفهوم والرسالة قبل تصوير أول كادر.',
  'process.s1g':'بريفي · مراجع · اتجاه',
  'process.s2t':'تصوير',
  'process.s2x':'التقاط اللحظات والزوايا والحركة الصحيحة.',
  'process.s2g':'كادر · إضاءة · حركة',
  'process.s3t':'مونتاج',
  'process.s3x':'بناء الإيقاع والوتيرة والانتقالات والسرد.',
  'process.s3g':'قطع · إيقاع · قصة',
  'process.s4t':'اللقطة النهائية',
  'process.s4x':'الألوان والصوت والتفاصيل والتسليم النهائي.',
  'process.s4g':'تلوين · صوت · تصدير',

  'featured.title':'أعمال <em>مميزة</em>',
  'featured.meta':'الريل · 2026',

  'reel.phTitle':'الريل',
  'reel.phSub':'ريل عرضي · اللقطات قريبًا',
  'reel.badge':'شاهد الريل',
  'reel.metaLabel':'مشروع مميز',
  'reel.title':'الريل',
  'reel.metaSub':'ريل · 01:30 · 4K',
  'reel.category':'ريل عرضي',
  'reel.desc':'كانت مختارة من اللحظات المميزة — إيقاع وتكوين وتلوين في عبارة واحدة متصلة.',
  'reel.role':'تصوير · مونتاج · تلوين',
  'reel.count':'ريل',

  'projects.title':'مشاريع <em>مختارة</em>',
  'projects.meta':'15 فيلمًا · مرّر ←',
  'projects.endLabel':'نهاية الأرشيف',
  'projects.endText':'خمسة عشر فيلمًا، لغة واحدة من الضوء والإيقاع والنية.',
  'projects.endCta':'ابدأ مشروعك',

  'work.01.title':'قصص سينمائية',
  'work.01.category':'فيلم براند',
  'work.01.desc':'عمل سينمائي هادئ مبني على الضوء والملمس وحركة الكاميرا المسيطر عليها.',
  'work.01.role':'تصوير · مونتاج',
  'work.02.title':'حركة المدينة',
  'work.02.category':'برومو لايف ستايل',
  'work.02.desc':'إيقاع الشارع مترجمًا إلى وتيرة: قطع سريع وإطارات متحركة وطاقة المدينة.',
  'work.02.role':'مونتاج · موشن',
  'work.03.title':'الكادر الأحمر',
  'work.03.category':'فيلم أزياء',
  'work.03.desc':'دراسة جريئة بلون واحد يُبنى فيها كل كادر حول لمسة مميزة واحدة.',
  'work.03.role':'تصوير · مونتاج · تلوين',
  'work.04.title':'وردية الليل',
  'work.04.category':'فيلم وثائقي',
  'work.04.desc':'سرد بعد الغروب بالإضاءة الطبيعية ومونتاج هادئ ومتحفّظ.',
  'work.04.role':'تصوير · مونتاج',
  'work.05.title':'الهوية البصرية',
  'work.05.category':'محتوى براند',
  'work.05.desc':'لغة بصرية مصمّمة لتحمل رسالة العلامة التجارية في كل ثانية.',
  'work.05.role':'فكرة · مونتاج',
  'work.06.title':'الحركة والشكل',
  'work.06.category':'فيلم منتج',
  'work.06.desc':'أشكال وأسطح وحركة مرتبة في سرد نظيف للمنتج.',
  'work.06.role':'تصوير · مونتاج',
  'work.07.title':'خلف الكواليس',
  'work.07.category':'كواليس · عملية',
  'work.07.desc':'كواليس العمل، مونتاج بنفس العناية المخصّصة للعمل النهائي.',
  'work.07.role':'تصوير · مونتاج',
  'work.08.title':'أضواء المدينة',
  'work.08.category':'سفر · مكان',
  'work.08.desc':'مكان يُروى عبر الانعكاسات والنيون والساعات بين الغسق والفجر.',
  'work.08.role':'تصوير · مونتاج · تلوين',
  'work.09.title':'من الخام إلى النهائي',
  'work.09.category':'ريل مونتاج',
  'work.09.desc':'من اللقطات الخام إلى النسخة النهائية: إيقاع وألوان وصوت في مرور واحد.',
  'work.09.role':'مونتاج · تلوين',
  'work.10.title':'منظور إبداعي',
  'work.10.category':'فيديو مفهوم',
  'work.10.desc':'زاوية غير تقليدية على فكرة بسيطة، تتشكّل في المونتاج.',
  'work.10.role':'فكرة · تصوير · مونتاج',
  'work.11.title':'لحظات متحركة',
  'work.11.category':'فيلم فعالية',
  'work.11.desc':'لحظات رئيسية التُقطت ورُتّبت للحفاظ على طاقة اليوم.',
  'work.11.role':'تصوير · مونتاج',
  'work.12.title':'الإيقاع البصري',
  'work.12.category':'حملة سوشال',
  'work.12.desc':'محتوى قصير مونتاج على إيقاع، مصمّم للاحتفاظ بالانتباه كادرًا بكادر.',
  'work.12.role':'مونتاج · موشن',
  'work.13.title':'التفاصيل',
  'work.13.category':'ماكرو · منتج',
  'work.13.desc':'لقطات قريبة وحركة دقيقة، مونتاج بهدوء وبأثر فاخر.',
  'work.13.role':'تصوير · مونتاج · تلوين',
  'work.14.title':'كادر بكادر',
  'work.14.category':'مونتاج',
  'work.14.desc':'مونتاج مكثّف كل قطعة فيه يبرر مكانها.',
  'work.14.role':'مونتاج',
  'work.15.title':'المونتاج النهائي',
  'work.15.category':'ريل عرضي',
  'work.15.desc':'التجميعة الختامية: خلاصة للأسلوب والوتيرة والنية.',
  'work.15.role':'تصوير · مونتاج · تلوين',

  'skills.title':'أدوات <em>الحرفة</em>',
  'skills.meta':'برامج · مهارات',
  'skills.stripLabel':'مهارات إبداعية',
  'sk.c1':'المونتاج الأساسي · لقطات · تسلسلات',
  'sk.c2':'الألوان',
  'sk.c3':'دورة تصحيح الألوان',
  'sk.c4':'الصوت',
  'sk.c5':'مكس · مستويات',
  'sk.c6':'تصدير',
  'sk.c7':'سريع · مونتاج موبايل',
  'sk.c8':'مقاطع قصيرة',
  'sk.c9':'ريلز · شورتس',
  'sk.c10':'التترات',
  'sk.c11':'موشن · تترات',
  'sk.c12':'ما بعد الإنتاج',
  'sk.t1t':'مونتاج الفيديو',
  'sk.t1x':'بنية ووتيرة وانتقالات ولمسات نهائية — من الخام إلى التصدير النهائي.',
  'sk.t2t':'مونتاج سريع / موبايل',
  'sk.t2x':'محتوى سوشال سريع الإنجاز مع تترات واتجاهات تُسلّم في وقت قياسي.',
  'sk.s1':'تصوير فيديو',
  'sk.s2':'مونتاج فيديو',
  'sk.s3':'السرد السينمائي',
  'sk.s4':'تصحيح الألوان',
  'sk.s5':'انتقالات إبداعية',
  'sk.s6':'الإيقاع البصري',
  'sk.s7':'محتوى السوشيال ميديا',
  'sk.s8':'فيديو قصير',

  'exp.title':'ثقة في <em>رؤى مختلفة</em>',
  'exp.meta':'الخبرات',
  'exp.quote':'على مدى العامين الماضيين، عمل زياد في مجموعة متنوعة من المشاريع الإبداعية وتعاون مع علامات تجارية وأعمال مختلفة، لإنتاج محتوى بصري يناسب أهداف كل مشروع.',
  'exp.c1n':'محتوى تجاري','exp.c1m':'تصوير · مونتاج',
  'exp.c2n':'وسائل التواصل','exp.c2m':'قصير · عمودي',
  'exp.c3n':'فيديوهات البراند','exp.c3m':'قصة · هوية',
  'exp.c4n':'فيديوهات ترويجية','exp.c4m':'إطلاق · عرض',
  'exp.c5n':'محتوى قصير','exp.c5m':'ريلز · شورتس',
  'exp.c6n':'حملات إبداعية','exp.c6m':'فكرة · موشن',

  'contact.label':'07 — تواصل معي',
  'contact.l1':'هيّا نصنع',
  'contact.l2':'شيئًا يستحق',
  'contact.l3':'المشاهدة.',
  'contact.sub':'لديك فكرة أو مشروع أو قصة تحتاج أن ترى النور؟',
  'contact.call':'اتصال',
  'contact.btnCall':'اتصل الآن',
  'contact.btnStart':'ابدأ مشروعًا',

  'footer.role':'مصوّر فيديو ومونتير',
  'footer.up':'إلى الأعلى ↑',
  'footer.b1':'ألتقط اللحظات. أحرّر القصص.',
  'footer.b2':'© 2026 زياد شعبان. جميع الحقوق محفوظة.',

  'modal.ph':'فيلم المشروع · اللقطات قريبًا',
  'modal.year':'السنة',
  'modal.role':'الدور',
  'modal.dur':'المدة',
  'modal.fmt':'الصيغة',
  'modal.prev':'السابق',
  'modal.next':'التالي',

  'doc.title':'زياد شعبان — مصوّر فيديو ومونتير'
};

/* --------------------------------------------------------------------------
   LANGUAGE (default EN, toggle AR)
-------------------------------------------------------------------------- */
let LANG = 'en';
const originals = new Map();   // element -> english innerHTML
const attrOriginals = new Map(); // element -> { attr: { orig, key } }

function captureI18n() {
  $$('[data-i18n]').forEach((el) => originals.set(el, el.innerHTML));
  $$('[data-i18n-attr]').forEach((el) => {
    const store = {};
    el.dataset.i18nAttr.split(',').forEach((pair) => {
      const i = pair.indexOf(':');
      if (i < 0) return;
      const attr = pair.slice(0, i).trim();
      const key = pair.slice(i + 1).trim();
      store[attr] = { orig: el.getAttribute(attr), key };
    });
    attrOriginals.set(el, store);
  });
}

function t(key, fallback = '') {
  if (LANG === 'ar' && AR[key]) return AR[key];
  return fallback;
}

function applyLang(lang) {
  LANG = lang;
  const html = document.documentElement;
  html.lang = lang;
  html.dir = lang === 'ar' ? 'rtl' : 'ltr';

  originals.forEach((en, el) => {
    const key = el.dataset.i18n;
    el.innerHTML = (lang === 'ar' && AR[key]) ? AR[key] : en;
  });

  attrOriginals.forEach((store, el) => {
    Object.keys(store).forEach((attr) => {
      const { orig, key } = store[attr];
      el.setAttribute(attr, (lang === 'ar' && AR[key]) ? AR[key] : orig);
    });
  });

  document.title = lang === 'ar' ? (AR['doc.title'] || document.title) : DOC_TITLE;

  const label = $('#langLabel');
  if (label) label.textContent = lang === 'ar' ? 'English' : 'العربية';
  const btn = $('#langBtn');
  if (btn) btn.setAttribute('aria-label', lang === 'ar' ? 'Switch to English' : 'التحويل إلى العربية');

  if (typeof refreshModal === 'function') refreshModal();
}

const DOC_TITLE = document.title;

/* --------------------------------------------------------------------------
   NAVIGATION
-------------------------------------------------------------------------- */
function initNav() {
  const nav = $('#nav');
  const burger = $('#burger');
  const menu = $('#mobileMenu');
  const links = $$('.nav__list a');
  const sections = ['#home', '#about', '#projects', '#skills', '#contact']
    .map((id) => $(id)).filter(Boolean);

  const onScroll = () => {
    nav.classList.toggle('is-stuck', window.scrollY > 40);
    const probe = window.scrollY + window.innerHeight * 0.35;
    let current = sections[0];
    sections.forEach((s) => { if (s.offsetTop <= probe) current = s; });
    links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + current.id));
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  const closeMenu = () => {
    menu.classList.remove('is-open');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };
  burger.addEventListener('click', () => {
    const open = !menu.classList.contains('is-open');
    menu.classList.toggle('is-open', open);
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  $$('[data-nav]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      const target = $(href);
      if (!target) return;
      e.preventDefault();
      closeMenu();
      if (history.replaceState) history.replaceState(null, '', href);
      const top = target.getBoundingClientRect().top + window.scrollY - (nav.offsetHeight - 4);
      window.scrollTo({ top, behavior: REDUCED ? 'auto' : 'smooth' });
    });
  });
}

/* --------------------------------------------------------------------------
   REVEALS + COUNTERS
-------------------------------------------------------------------------- */
function runCounter(el) {
  if (el.dataset.done) return;
  el.dataset.done = '1';
  const target = parseInt(el.dataset.count, 10) || 0;
  const pad = parseInt(el.dataset.pad || '2', 10);
  const dur = REDUCED ? 1 : 1200;
  const start = performance.now();

  const step = (now) => {
    const p = clamp((now - start) / dur, 0, 1);
    const eased = 1 - Math.pow(1 - p, 4);
    el.textContent = String(Math.round(eased * target)).padStart(pad, '0');
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function initReveals() {
  const els = $$('[data-reveal]');
  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-in'));
    $$('[data-count]').forEach(runCounter);
    return;
  }

  /* Masked elements (.line__in) sit fully outside their clipped parent, so the
     observer watches the parent instead and flags the children. */
  const targets = new Map();
  els.forEach((el) => {
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
  }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });

  targets.forEach((_, obs) => io.observe(obs));
  $$('[data-count]').forEach((el) => io.observe(el));
}

/* --------------------------------------------------------------------------
   VIDEO PREVIEWS (set data-src="videos/01.mp4" to enable)
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
    const stop = () => video.pause();

    if (host) {
      host.addEventListener('mouseenter', play);
      host.addEventListener('mouseleave', stop);
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        entries.forEach((e) => (e.isIntersecting ? play() : stop()));
      }, { threshold: 0.55 }).observe(video);
    }
  });
}

/* --------------------------------------------------------------------------
   PROJECT MODAL
-------------------------------------------------------------------------- */
let refreshModal = null;

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
  let current = null;

  const setVideo = (el) => {
    const src = (el && el.dataset.src) || '';
    if (els.video.dataset.src !== src) {
      els.video.classList.remove('is-live');
      els.video.pause();
      els.video.removeAttribute('src');
      els.video.dataset.src = src;
      if (src) els.video.src = src;
    }
    if (src) {
      const p = els.video.play();
      if (p) p.then(() => els.video.classList.add('is-live')).catch(() => {});
    }
  };

  const fill = (card) => {
    const d = card.dataset;
    const key = d.key || '';
    els.cat.textContent = t(key + '.category', d.category || '');
    els.title.textContent = t(key + '.title', d.title || '');
    els.desc.textContent = t(key + '.desc', d.desc || '');
    els.role.textContent = t(key + '.role', d.role || '—');
    els.year.textContent = d.year || '—';
    els.dur.textContent = d.duration || '—';
    els.fmt.textContent = d.format || '—';
    setVideo($('video', card));
  };

  const render = (i) => {
    const card = projects[i];
    if (!card) return;
    index = i;
    current = card;
    featured = false;
    const num = String(i + 1).padStart(2, '0');
    els.idx.textContent = num;
    els.now.textContent = num;
    els.phNum.textContent = num;
    els.count.style.visibility = 'visible';
    fill(card);
  };

  const renderFeatured = (card) => {
    current = card;
    featured = true;
    els.idx.textContent = '★';
    els.now.textContent = t('reel.count', 'REEL');
    els.phNum.textContent = '★';
    els.count.style.visibility = 'hidden';
    fill(card);
  };

  const open = (card) => {
    if (card.classList.contains('reel')) renderFeatured(card);
    else render(projects.indexOf(card));

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => els.close.focus(), 300);
  };

  const close = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    els.video.pause();
    document.body.style.overflow = '';
  };

  refreshModal = () => {
    if (!modal.classList.contains('is-open') || !current) return;
    if (featured) renderFeatured(current);
    else render(index);
  };

  $$('.p, [data-project]').forEach((card) => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.addEventListener('click', () => open(card));
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
    if (e.key === 'ArrowLeft') render((index - 1 + projects.length) % projects.length);
    if (e.key === 'ArrowRight') render((index + 1) % projects.length);
  });
}

/* --------------------------------------------------------------------------
   BOOT
-------------------------------------------------------------------------- */
function boot() {
  captureI18n();
  applyLang('en');

  initNav();
  initReveals();
  initVideos();
  initModal();

  const langBtn = $('#langBtn');
  if (langBtn) langBtn.addEventListener('click', () => applyLang(LANG === 'en' ? 'ar' : 'en'));

  window.__ziadBooted = true;
  setTimeout(() => {
    const hero = $('.hero');
    if (hero) hero.classList.add('is-ready');
  }, 120);
}

boot();
