/**
 * Tuning Turbo - Main JS
 */

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initMobileMenu();
  initHeaderScroll();
  initBackToTop();
  initHeroParallax();
  initReveal();
  initCounters();
  initGalleryFilters();
  initCompare();
  initPowerCalculator();
  initCardSpotlight();
  initFormValidation();
});

/* ------------------------------------------------------------------ Theme */
function initTheme() {
  const html = document.documentElement;
  const saved = localStorage.getItem('theme');
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

  const current = saved || (prefersLight ? 'light' : 'dark');
  html.setAttribute('data-theme', current);
  updateThemeIcons(current);

  document.querySelectorAll('.theme-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      updateThemeIcons(next);
    });
  });
}

function updateThemeIcons(theme) {
  document.querySelectorAll('.theme-toggle').forEach(toggle => {
    const dark = theme === 'dark';
    toggle.innerHTML = dark ? '<i class="ph ph-sun"></i>' : '<i class="ph ph-moon"></i>';
    toggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  });
}

/* ------------------------------------------------------- Nav & scroll spy */
function initNavigation() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a, .drawer-links a');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId.startsWith('#')) {
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' });
          closeMobileMenu();
        }
      }
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    });
  }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });

  sections.forEach(section => observer.observe(section));
}

function initHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  const onScroll = () => btn.classList.toggle('visible', window.scrollY > 600);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' });
  });
}

function initHeroParallax() {
  const media = document.querySelector('.hero-media');
  if (!media || REDUCED) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = Math.min(window.scrollY, window.innerHeight);
      media.style.transform = `scale(1.08) translateY(${y * 0.18}px)`;
      ticking = false;
    });
  }, { passive: true });
}

/* --------------------------------------------------------- Mobile drawer */
const drawer = document.querySelector('.mobile-drawer');
const overlay = document.querySelector('.drawer-overlay');

function initMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const drawerClose = document.querySelector('.drawer-close');

  if (menuToggle) menuToggle.addEventListener('click', openMobileMenu);
  if (drawerClose) drawerClose.addEventListener('click', closeMobileMenu);
  if (overlay) overlay.addEventListener('click', closeMobileMenu);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileMenu();
  });
}

function openMobileMenu() {
  if (drawer) drawer.classList.add('active');
  if (overlay) overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  if (drawer) drawer.classList.remove('active');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
}

/* ------------------------------------------------------- Reveal on scroll */
function initReveal() {
  const targets = document.querySelectorAll(
    '.section-header, .usp-card, .build-card, .package-card, ' +
    '.testi-card, .about-image, .dyno-chart, .compare-wrap, ' +
    '.contact-form, .info-item, .stat-item, .map-frame'
  );

  targets.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${Math.min(i % 6, 5) * 70}ms`;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  targets.forEach(el => observer.observe(el));
}

/* ------------------------------------------------------------- Stat count */
function initCounters() {
  const nums = document.querySelectorAll('[data-count]');
  if (!nums.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      countUp(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  nums.forEach(n => observer.observe(n));
}

function countUp(el) {
  const target = parseFloat(el.dataset.count);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const render = v => { el.textContent = prefix + Math.round(v).toLocaleString() + suffix; };

  if (REDUCED) { render(target); return; }

  const duration = 1400;
  const start = performance.now();
  const tick = (now) => {
    const p = Math.min((now - start) / duration, 1);
    render(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* -------------------------------------------------------- Gallery filters */
function initGalleryFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const buildCards = document.querySelectorAll('.build-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      buildCards.forEach(card => {
        const match = filter === 'all' || card.getAttribute('data-category') === filter;
        if (match) {
          card.style.display = '';
          requestAnimationFrame(() => { card.style.opacity = '1'; });
        } else {
          card.style.opacity = '0';
          setTimeout(() => { card.style.display = 'none'; }, 320);
        }
      });
    });
  });
}

/* ============================================================
 * INTERACTIVE 1 — Before / After comparison slider
 * ============================================================ */
function initCompare() {
  const el = document.getElementById('compare');
  if (!el) return;

  let dragging = false;

  const setPos = (pct) => {
    const clamped = Math.max(0, Math.min(100, pct));
    el.style.setProperty('--pos', clamped + '%');
    el.setAttribute('aria-valuenow', Math.round(clamped));
  };

  const fromEvent = (clientX) => {
    const rect = el.getBoundingClientRect();
    setPos(((clientX - rect.left) / rect.width) * 100);
  };

  el.addEventListener('pointerdown', (e) => {
    dragging = true;
    el.setPointerCapture(e.pointerId);
    fromEvent(e.clientX);
  });

  el.addEventListener('pointermove', (e) => {
    if (dragging) fromEvent(e.clientX);
  });

  const stop = () => { dragging = false; };
  el.addEventListener('pointerup', stop);
  el.addEventListener('pointercancel', stop);

  // Hover-to-scrub on fine pointers, so it feels alive before you click
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    el.addEventListener('mousemove', (e) => { if (!dragging) fromEvent(e.clientX); });
  }

  el.addEventListener('keydown', (e) => {
    const current = parseFloat(el.getAttribute('aria-valuenow')) || 50;
    const step = e.shiftKey ? 10 : 4;
    if (e.key === 'ArrowLeft')  { setPos(current - step); e.preventDefault(); }
    if (e.key === 'ArrowRight') { setPos(current + step); e.preventDefault(); }
    if (e.key === 'Home')       { setPos(0);  e.preventDefault(); }
    if (e.key === 'End')        { setPos(100); e.preventDefault(); }
  });

  // Sweep once when it scrolls into view, to advertise the interaction
  if (!REDUCED) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        const start = performance.now();
        const sweep = (now) => {
          if (dragging) return;
          const p = Math.min((now - start) / 1600, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          setPos(72 - 22 * Math.sin(eased * Math.PI));
          if (p < 1) requestAnimationFrame(sweep);
        };
        requestAnimationFrame(sweep);
      });
    }, { threshold: 0.45 });
    io.observe(el);
  }
}

/* ============================================================
 * INTERACTIVE 2 — Live power calculator + dyno plot
 * ============================================================ */
const PLATFORMS = {
  b58:    { name: 'BMW B58',       hp: 335, tq: 369, zero: 4.5 },
  ea888:  { name: 'VW/Audi EA888', hp: 228, tq: 258, zero: 5.6 },
  '2jz':  { name: 'Toyota 2JZ',    hp: 276, tq: 289, zero: 5.3 },
  coyote: { name: 'Ford Coyote',   hp: 435, tq: 400, zero: 4.3 }
};

const STAGES = [
  { label: 'Stock',   hp: 1.00, tq: 1.00 },
  { label: 'Stage 1', hp: 1.17, tq: 1.20 },
  { label: 'Stage 2', hp: 1.34, tq: 1.38 },
  { label: 'Stage 3', hp: 1.76, tq: 1.72 }
];

const FUELS = {
  '91':  { label: '91 Octane', mult: 1.00 },
  '93':  { label: '93 Octane', mult: 1.035 },
  'e85': { label: 'E85 Flex',  mult: 1.09 }
};

function initPowerCalculator() {
  const slider = document.getElementById('stageSlider');
  if (!slider) return;

  const state = { platform: 'b58', stage: 2, fuel: '91' };

  const el = {
    platformPicker: document.getElementById('platformPicker'),
    fuelPicker: document.getElementById('fuelPicker'),
    platformLabel: document.getElementById('platformLabel'),
    stageLabel: document.getElementById('stageLabel'),
    fuelLabel: document.getElementById('fuelLabel'),
    legendTuned: document.getElementById('legendTuned'),
    outHp: document.getElementById('outHp'),
    outTq: document.getElementById('outTq'),
    outZero: document.getElementById('outZero'),
    gainHp: document.getElementById('gainHp'),
    gainTq: document.getElementById('gainTq'),
    gainZero: document.getElementById('gainZero'),
    yAxis: document.getElementById('curveYAxis'),
    stock: document.getElementById('curveStock'),
    tuned: document.getElementById('curveTuned'),
    area: document.getElementById('curveArea')
  };

  const compute = () => {
    const base = PLATFORMS[state.platform];
    const stage = STAGES[state.stage];
    const fuel = state.stage === 0 ? 1 : FUELS[state.fuel].mult;

    const hp = Math.round(base.hp * stage.hp * fuel);
    const tq = Math.round(base.tq * stage.tq * fuel);
    // more power over the same mass shortens the run, with diminishing returns
    const zero = +(base.zero * Math.pow(base.hp / hp, 0.42)).toFixed(1);

    return { base, stage, hp, tq, zero };
  };

  // --- SVG plot geometry
  const X0 = 46, X1 = 500, Y0 = 228, Y1 = 20;

  // Normalised power delivery across the rev range. `spool` < 1 builds boost
  // earlier, which is what a bigger tune actually does low down.
  const shape = (t, spool) => {
    const peakAt = 0.78;
    if (t <= peakAt) return 1 - 0.86 * Math.pow((peakAt - t) / peakAt, 1.55 * spool);
    return 1 - 0.5 * Math.pow((t - peakAt) / (1 - peakAt), 1.9);
  };

  const buildPath = (peak, scale, spool, close) => {
    const pts = [];
    for (let i = 0; i <= 44; i++) {
      const t = i / 44;
      const v = peak * shape(t, spool);
      pts.push([
        X0 + t * (X1 - X0),
        Y0 - (v / scale) * (Y0 - Y1)
      ]);
    }
    let d = 'M' + pts.map(p => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L');
    if (close) d += ` L${X1} ${Y0} L${X0} ${Y0} Z`;
    return d;
  };

  const drawAxis = (scale) => {
    const rows = [20, 72, 124, 176, 228];
    el.yAxis.innerHTML = rows.map((y, i) => {
      const value = Math.round(scale * (1 - i / (rows.length - 1)));
      return `<text x="8" y="${y + 3}">${value}</text>`;
    }).join('');
  };

  const draw = (hp, stockHp) => {
    const scale = Math.ceil((hp * 1.12) / 50) * 50;
    drawAxis(scale);
    el.stock.setAttribute('d', buildPath(stockHp, scale, 1.0, false));
    el.tuned.setAttribute('d', buildPath(hp, scale, 0.78, false));
    el.area.setAttribute('d', buildPath(hp, scale, 0.78, true));
  };

  // Tween between states so the plot morphs instead of snapping
  let anim = null;
  let shown = null;

  const render = () => {
    const { base, stage, hp, tq, zero } = compute();

    el.platformLabel.textContent = base.name;
    el.stageLabel.textContent = stage.label;
    el.fuelLabel.textContent = FUELS[state.fuel].label;
    el.legendTuned.textContent = stage.label === 'Stock' ? 'Current' : stage.label;
    slider.setAttribute('aria-valuetext', stage.label);
    slider.style.setProperty('--fill', (state.stage / 3) * 100 + '%');

    const gainHp = hp - base.hp;
    const gainTq = tq - base.tq;
    const gainZero = +(zero - base.zero).toFixed(1);

    el.gainHp.textContent = gainHp > 0 ? `+${gainHp} hp` : 'baseline';
    el.gainTq.textContent = gainTq > 0 ? `+${gainTq} tq` : 'baseline';
    el.gainZero.textContent = gainZero < 0 ? `${gainZero}s` : 'baseline';
    [el.gainHp, el.gainTq, el.gainZero].forEach(n => {
      n.style.color = n.textContent === 'baseline' ? 'var(--text-muted)' : 'var(--success)';
    });

    const to = { hp, tq, zero };
    const from = shown || { hp: base.hp, tq: base.tq, zero: base.zero };

    if (anim) cancelAnimationFrame(anim);

    const paint = (v) => {
      el.outHp.textContent = Math.round(v.hp);
      el.outTq.textContent = Math.round(v.tq);
      el.outZero.textContent = v.zero.toFixed(1);
      draw(v.hp, base.hp);
    };

    if (REDUCED) { shown = to; paint(to); return; }

    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / 520, 1);
      const e = 1 - Math.pow(1 - p, 3);
      paint({
        hp: from.hp + (to.hp - from.hp) * e,
        tq: from.tq + (to.tq - from.tq) * e,
        zero: from.zero + (to.zero - from.zero) * e
      });
      if (p < 1) anim = requestAnimationFrame(step);
      else shown = to;
    };
    anim = requestAnimationFrame(step);
  };

  const wirePicker = (picker, key, attr) => {
    if (!picker) return;
    picker.addEventListener('click', (e) => {
      const btn = e.target.closest('.platform-btn');
      if (!btn) return;
      picker.querySelectorAll('.platform-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state[key] = btn.dataset[attr];
      render();
    });
  };

  wirePicker(el.platformPicker, 'platform', 'platform');
  wirePicker(el.fuelPicker, 'fuel', 'fuel');

  slider.addEventListener('input', () => {
    state.stage = parseInt(slider.value, 10);
    render();
  });

  // Draw the baseline first, then animate to the default build on scroll-in
  shown = { hp: PLATFORMS.b58.hp, tq: PLATFORMS.b58.tq, zero: PLATFORMS.b58.zero };
  el.outHp.textContent = shown.hp;
  el.outTq.textContent = shown.tq;
  el.outZero.textContent = shown.zero.toFixed(1);
  draw(shown.hp, PLATFORMS.b58.hp);
  slider.style.setProperty('--fill', (state.stage / 3) * 100 + '%');

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      io.unobserve(entry.target);
      render();
    });
  }, { threshold: 0.3 });
  io.observe(document.getElementById('dyno'));
}

/* ------------------------------------------------- Card cursor spotlight */
function initCardSpotlight() {
  if (REDUCED || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  document.querySelectorAll('.package-card').forEach(card => {
    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
      card.style.setProperty('--my', `${e.clientY - rect.top}px`);
    });
  });
}

/* --------------------------------------------------- Contact validation */
function initFormValidation() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    const inputs = form.querySelectorAll('.form-control[required]');

    inputs.forEach(input => {
      const type = input.getAttribute('type');
      let ok = true;

      if (!input.value.trim()) {
        ok = false;
      } else if (type === 'email') {
        ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
      } else if (type === 'tel') {
        ok = /^\+?[\d\s-]{7,15}$/.test(input.value);
      }

      if (ok) setSuccessFor(input);
      else { setErrorFor(input); isValid = false; }
    });

    if (!isValid) return;

    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="ph ph-check"></i> Request Sent';
    btn.style.backgroundColor = 'var(--success)';
    btn.style.color = '#fff';

    setTimeout(() => {
      form.reset();
      inputs.forEach(i => i.classList.remove('success'));
      btn.innerHTML = originalText;
      btn.style.backgroundColor = '';
      btn.style.color = '';
    }, 3000);
  });

  form.querySelectorAll('.form-control').forEach(input => {
    input.addEventListener('input', () => input.classList.remove('error'));
  });
}

function setErrorFor(input) {
  input.classList.add('error');
  input.classList.remove('success');
}

function setSuccessFor(input) {
  input.classList.add('success');
  input.classList.remove('error');
}
