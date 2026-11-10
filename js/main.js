/* ══════════════════════════════════════════════
   PORTFOLIO – hlavní animační skript
   Závislosti: GSAP 3 + ScrollTrigger
══════════════════════════════════════════════ */

gsap.registerPlugin(ScrollTrigger);


/* ══════════════════════════════════════════════
   LAYOUT: centruj hero-block vertikálně
══════════════════════════════════════════════ */
function layoutHeroBlock() {
  const block = document.getElementById('hero-block');
  const top   = (window.innerHeight - block.offsetHeight) * 0.42;
  block.style.top = top + 'px';
  block.dataset.heroTop = top;
}

/* ══════════════════════════════════════════════
   MAIN INIT
══════════════════════════════════════════════ */
window.addEventListener('load', async () => {
  // Články musí být v DOM dřív, než ScrollTrigger spočítá pozice
  await renderArticles();
  initMagneticButtons();
  layoutHeroBlock();

  // Při reloadu na odscrollované stránce přeskoč intro + hero animaci,
  // nastav hero-block rovnou do header pozice
  if (window.scrollY > window.innerHeight * 0.3) {
    document.getElementById('intro-overlay').style.display = 'none';
    // Nastav přirozený výchozí stav — scrub si polohu sám dopočítá z scrollY
    gsap.set('#hero-block', { opacity: 1, y: 0, scale: 1, transformOrigin: 'left top' });
    gsap.set('#hero-meta',  { opacity: 1, y: 0 });
    initScrollAnimations();
  } else {
    initIntroOverlay();
  }
});

/* ══════════════════════════════════════════════
   ČLÁNKY – načtení z data/articles.json + render
   Pozn.: fetch nefunguje přes file:// → spouštět
   přes lokální server (viz context.md)
══════════════════════════════════════════════ */
let ARTICLES = [];

async function renderArticles() {
  try {
    const res = await fetch('data/articles.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    ARTICLES = await res.json();
  } catch (err) {
    console.error('[articles] Nepodařilo se načíst data/articles.json:', err);
    return;
  }

  const list = document.getElementById('articles-list');

  ARTICLES.forEach(article => {
    const row = el('article', 'article');
    row.id = `article-${article.id}`;
    row.dataset.semester = article.semester;

    const card = el('div', 'article-card');
    // Obrázek, nadpis i tlačítko vedou na stejné místo
    // (detail článku zatím není → placeholder '#')
    const href = '#';

    // Obrázek – odkaz, z tabového pořadí vyřazený (stejný cíl má nadpis)
    const imgLink = el('a', 'article-image-link');
    imgLink.href = href;
    imgLink.tabIndex = -1;
    imgLink.setAttribute('aria-hidden', 'true');
    const img = el('img', 'article-image');
    img.src     = article.image;
    img.alt     = '';
    img.loading = 'lazy';
    imgLink.appendChild(img);

    const body  = el('div', 'article-body');
    const title = el('h3', 'article-title');
    const titleLink = el('a', 'article-title-link', article.title);
    titleLink.href = href;
    title.appendChild(titleLink);
    const perex = el('p', 'article-perex', article.perex);
    body.append(title, perex);

    const btn = el('a', 'btn article-btn', 'ŘEKNI MI VÍC');
    btn.href = href;
    btn.dataset.articleId = article.id;

    card.append(imgLink, body, btn);
    row.append(el('span', 'article-connector'), card);
    list.appendChild(row);
  });
}

// Malý helper: element s třídou a textem (textContent → bezpečné vůči HTML v datech)
function el(tag, className, text) {
  const node = document.createElement(tag);
  node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

/* ══════════════════════════════════════════════
   1. INTRO OVERLAY – šikmá hrana, odjede doleva
   clip-path: horní roh zmizí dřív než spodní →
   diagonální wipe; element se zároveň posune
   o -10 vw aby nezbyl divný konec vlevo
══════════════════════════════════════════════ */
function initIntroOverlay() {
  const overlay = document.getElementById('intro-overlay');

  const tl = gsap.timeline({
    onComplete: () => {
      overlay.style.display = 'none';
      initHeroAnimations();
    }
  });

  // Logo fade in
  tl.from('#intro-logo', {
    scale: 0.88,
    opacity: 0,
    duration: 0.6,
    ease: 'power2.out',
  });

  // Krátká pauza
  tl.to({}, { duration: 0.8 });

  // Šikmý wipe doleva:
  //  - top-right: 100% → 0%   (horní hrana zmizí dřív)
  //  - bottom-right: 100% → -25%  (spodní hrana za ní s odstupem → šikmá čára)
  //  - zároveň element odjede o -10vw → čistý konec bez zbytků
  tl.to(overlay, {
    clipPath: 'polygon(0 0, 0% 0, -25% 100%, 0 100%)',
    x: '-10vw',
    duration: 0.95,
    ease: 'power3.inOut',
  }, '+=0.05');
}

/* ══════════════════════════════════════════════
   2. HERO MICRO-ANIMACE (ihned po intro)
══════════════════════════════════════════════ */
function initHeroAnimations() {
  gsap.set('#hero-block', { x: -55, opacity: 0 });
  gsap.set('#hero-meta',  { y: 14,  opacity: 0 });

  // initScrollAnimations voláme až po dohrání hero animace –
  // jinak GSAP zachytí opacity:0 jako výchozí stav scrub animací
  // a po zpátečním scrollu by kontakty zůstaly skryté.
  const tl = gsap.timeline({
    defaults: { ease: 'power3.out' },
    onComplete: initScrollAnimations,
  });

  // Hero block slide in + fade (jméno + PORTFOLIO SVG jako celek)
  tl.to('#hero-block', {
    x: 0,
    opacity: 1,
    duration: 0.75,
    ease: 'power4.out',
  });

  // Kontakty + CTA
  tl.to('#hero-meta', {
    y: 0,
    opacity: 1,
    duration: 0.55,
  }, '-=0.4');
}

/* ══════════════════════════════════════════════
   3. SCROLL ANIMACE
══════════════════════════════════════════════ */
function initScrollAnimations() {
  const block = document.getElementById('hero-block');

  // Cílová výška hero-blocku v headeru (~68px: malé jméno + malý SVG)
  const TARGET_H   = 68;
  const TARGET_TOP = 14; // px od vrchu viewportu

  /* ── 3a. Hero-block morph do headeru ── */
  // Funkční hodnoty + invalidateOnRefresh → po resize se přepočítají
  // z nové velikosti bloku (layoutHeroBlock běží v refreshInit)
  gsap.to('#hero-block', {
    y:     () => TARGET_TOP - parseFloat(block.dataset.heroTop),
    scale: () => TARGET_H / block.offsetHeight,
    transformOrigin: 'left top',
    ease: 'none',
    scrollTrigger: {
      trigger: '#about',
      start: 'top 88%',
      end: 'top 42%',   // kratší range = rychlejší
      scrub: 0.6,        // nižší = rychlejší odezva na scroll
      invalidateOnRefresh: true,
    }
  });

  // Bílý fade pod headerem naběhne spolu s morphem
  gsap.to('#top-fade', {
    opacity: 1,
    ease: 'none',
    scrollTrigger: {
      trigger: '#about',
      start: 'top 70%',
      end: 'top 42%',
      scrub: 0.6,
    }
  });

  /* ── 3b. Kontakty + CTA zmizí ── */
  gsap.to('#hero-meta', {
    opacity: 0,
    y: -18,
    ease: 'none',
    scrollTrigger: {
      trigger: '#about',
      start: 'top 90%',
      end: 'top 68%',
      scrub: 0.5,
    }
  });

  /* ── 3c. Foto opacity: 1 → 0.08 ── */
  gsap.to('#main-photo', {
    opacity: 0.08,
    ease: 'none',
    scrollTrigger: {
      trigger: '#about',
      start: 'top 80%',
      end: 'top 30%',
      scrub: 1,
    }
  });

  /* ── 3d. Timeline (fixní, jedna přes všechny sekce) ── */

  // Timeline se objeví
  gsap.to('#timeline', {
    opacity: 1,
    duration: 0.5,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '#about',
      start: 'top 70%',
      toggleActions: 'play none none reverse',
    }
  });

  // Linka naroste shora dolů
  gsap.to('#timeline-line', {
    scaleY: 1,
    duration: 1,
    ease: 'power3.inOut',
    scrollTrigger: {
      trigger: '#about',
      start: 'top 55%',
      toggleActions: 'play none none reverse',
    }
  });

  // Centrování přes xPercent/yPercent – jinak GSAP převede CSS
  // translate(-50%) na pevné px a po zvětšení (.is-docked) by tečka ujela
  gsap.set('#timeline-dot', { xPercent: -50, yPercent: -50, x: 0, y: 0 });

  // Tečka se objeví
  gsap.to('#timeline-dot', {
    scale: 1,
    ease: 'back.out(2)',
    scrollTrigger: {
      trigger: '#about',
      start: 'top 45%',
      toggleActions: 'play none none reverse',
    }
  });

  // Kotevní body na timeline – pozice odpovídá poloze sekce na stránce
  createTimelineAnchors();

  // Tečka se posouvá dolů přes všechny sekce a magneticky se
  // přichytává ke kotvám (viz initMagneticDot)
  initMagneticDot();

  /* ── 3e. About obsah přijede ── */
  // Nadpis se objeví písmeno po písmenu (revealHeading)
  revealHeading(document.getElementById('about-heading'), {
    trigger: '#about-heading',
    start: 'top 65%',
  });

  gsap.from('#about-text', {
    opacity: 0,
    y: 16,
    duration: 0.55,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '#about',
      start: 'top 44%',
      toggleActions: 'play none none reverse',
    }
  });

  /* ── 4. Články ── */
  initArticleAnimations();

  /* ── 5. Blur-out při odscrollování (mléčné sklo) – O mně + karty článků ── */
  ['#about-content', ...document.querySelectorAll('.article-card')].forEach(content => {
    gsap.to(content, {
      filter: 'blur(16px)',
      opacity: 0.08,
      ease: 'none',
      scrollTrigger: {
        trigger: content,
        start: 'center 32%',
        end:   'top -10%',
        scrub: 1.4,
      }
    });
  });
}

/* ══════════════════════════════════════════════
   REVEAL HEADING – písmeno po písmenu
   Rozdělí text na .ch spany, ty postupně
   (zleva) spadnou shora a zviditelní se.
   Reusable pro jakýkoli nadpis.

   @param el      – DOM element s textem nadpisu
   @param trigger – objekt { trigger, start } pro ScrollTrigger
══════════════════════════════════════════════ */
function revealHeading(el, { trigger, start = 'top 42%' } = {}) {
  // Rozděl text na <span> na každý znak
  el.innerHTML = [...el.textContent].map(ch =>
    ch === ' ' ? '<span class="ch">&nbsp;</span>' : `<span class="ch">${ch}</span>`
  ).join('');

  gsap.from(el.querySelectorAll('.ch'), {
    opacity: 0,
    y: '-0.3em',
    duration: 0.25,
    stagger: 0.04,
    ease: 'power3.out',
    scrollTrigger: {
      trigger,
      start,
      toggleActions: 'play none none reverse',
    },
  });
}

/* ══════════════════════════════════════════════
   TIMELINE KOTVY – fialové body na pozicích sekcí
══════════════════════════════════════════════ */
function createTimelineAnchors() {
  const tl = document.getElementById('timeline');

  const sections = [
    { el: document.getElementById('about'), label: 'O mně' },
    ...ARTICLES.map(a => ({
      el:    document.getElementById(`article-${a.id}`),
      label: a.title,
      id:    a.id,
    })),
  ];

  sections.forEach(({ el, label, id }) => {
    if (!el) return;

    const anchor = document.createElement('div');
    anchor.className = 'timeline-anchor';
    anchor._section  = el;
    if (id) anchor.dataset.articleId = id;

    const dot = document.createElement('div');
    dot.className = 'timeline-anchor-dot';

    const tag = document.createElement('div');
    tag.className   = 'timeline-anchor-label';
    tag.textContent = label;

    anchor.append(dot, tag);

    anchor.addEventListener('click', () => {
      // Pulsující ring při kliknutí
      const ring = document.createElement('div');
      ring.className = 'timeline-anchor-ring';
      dot.appendChild(ring);
      gsap.fromTo(ring,
        { scale: 1, opacity: 1 },
        { scale: 5, opacity: 0, duration: 0.7, ease: 'power2.out',
          onComplete: () => ring.remove() }
      );
      // Článek vycentrovat, About od horní hrany
      el.scrollIntoView({ behavior: 'smooth', block: id ? 'center' : 'start' });
    });

    tl.appendChild(anchor);
  });

  positionTimelineAnchors();
  // Po každém refreshi (resize) přepočítej pozice kotev
  ScrollTrigger.addEventListener('refresh', positionTimelineAnchors);
}

// Absolutní pozice elementu na stránce (offsetTop je relativní k rodiči)
function pageTop(node) {
  return node.getBoundingClientRect().top + window.scrollY;
}

function positionTimelineAnchors() {
  const vh       = window.innerHeight;
  const about    = document.getElementById('about');
  const articles = document.getElementById('articles');

  // Stejný rozsah jako scrub tečky: '#about top top' → '#articles bottom bottom'
  const scrollMin   = pageTop(about);
  const scrollMax   = pageTop(articles) + articles.offsetHeight - vh;
  const scrollRange = scrollMax - scrollMin;

  document.querySelectorAll('.timeline-anchor').forEach(anchor => {
    const el = anchor._section;
    // scrollY kdy je střed sekce uprostřed viewportu
    const scrollAtCenter = pageTop(el) + el.offsetHeight / 2 - vh / 2;
    const progress = Math.max(0, Math.min(1, (scrollAtCenter - scrollMin) / scrollRange));
    anchor._pos = DOT_START + progress * (DOT_END - DOT_START); // v % výšky
    anchor.style.top = anchor._pos + '%';
  });
}

/* ══════════════════════════════════════════════
   MAGNETICKÁ TEČKA
   Surová pozice odpovídá scrollu (8 % → 88 %).
   Mezi každými dvěma sousedními kotvami je úsek
   rozdělený na tři části:
     [0, HOLD)        tečka drží na horní kotvě
     [HOLD, 1-HOLD]   rychlý přeskok (power2.inOut)
     (1-HOLD, 1]      tečka už drží na dolní kotvě
   → většinu scrollu sedí na fialové tečce a k další
   se "přicvakne". Přichycená tečka má .is-docked
   a při přichycení krátce pulzne.
══════════════════════════════════════════════ */
const DOT_START   = 8;    // % výšky timeline
const DOT_END     = 88;
const MAGNET_HOLD = 0.38; // podíl úseku, kdy tečka drží na kotvě (z každé strany)

function initMagneticDot() {
  const dot = document.getElementById('timeline-dot');
  const jumpEase = gsap.parseEase('power2.inOut');
  let docked = null; // pozice kotvy, na které tečka sedí (nebo null)

  const update = self => {
    const raw = DOT_START + self.progress * (DOT_END - DOT_START);
    const { pos, anchor } = magnetize(raw, jumpEase);

    gsap.to(dot, {
      top: pos + '%',
      duration: 0.35,
      ease: 'power3.out',
      overwrite: 'auto',
    });

    // Přichycení → třída + krátký "cvak"
    if (anchor !== docked) {
      docked = anchor;
      dot.classList.toggle('is-docked', anchor != null);
      if (anchor != null) {
        gsap.fromTo(dot, { scale: 1.45 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      }
    }
  };

  const st = ScrollTrigger.create({
    trigger: '#about',
    start: 'top top',
    endTrigger: '#articles',
    end: 'bottom bottom',
    onUpdate: update,
  });

  update(st);
  // Po refreshi (resize) – kotvy už mají nové _pos (jejich listener běží dřív)
  ScrollTrigger.addEventListener('refresh', () => update(st));
}

// Vrací { pos: výsledná pozice v %, anchor: pozice kotvy, pokud na ní tečka drží, jinak null }
function magnetize(p, jumpEase) {
  const positions = [...document.querySelectorAll('.timeline-anchor')]
    .map(a => a._pos)
    .filter(v => v != null)
    .sort((a, b) => a - b);
  if (!positions.length) return { pos: p, anchor: null };

  // Před první / za poslední kotvou drží na krajní kotvě
  if (p <= positions[0])                    return { pos: positions[0], anchor: positions[0] };
  if (p >= positions[positions.length - 1]) return { pos: positions[positions.length - 1], anchor: positions[positions.length - 1] };

  // Úsek mezi kotvami a, b, kde leží p
  let i = 0;
  while (p > positions[i + 1]) i++;
  const a = positions[i], b = positions[i + 1];
  const t = (p - a) / (b - a);

  if (t < MAGNET_HOLD)     return { pos: a, anchor: a };
  if (t > 1 - MAGNET_HOLD) return { pos: b, anchor: b };

  const k = (t - MAGNET_HOLD) / (1 - 2 * MAGNET_HOLD);
  return { pos: a + (b - a) * jumpEase(k), anchor: null };
}

/* ══════════════════════════════════════════════
   ČLÁNKY – scroll animace
   - karta přijede zespodu
   - spojnice karta → kotva (initArticleConnectors)
   - popisek semestru se objeví u prvního článku
     semestru a zmizí po posledním (i zpětně)
══════════════════════════════════════════════ */
function initArticleAnimations() {
  const rows = [...document.querySelectorAll('.article')];

  rows.forEach(row => {
    // Reveal – animuje se celý řádek, opacity karty patří blur-outu (sekce 5)
    gsap.from(row, {
      opacity: 0,
      y: 40,
      duration: 0.6,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: row,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      }
    });

  });

  initArticleConnectors(rows);

  // Semestry – jeden fixní popisek na semestr, prolínání přes opacity
  const container = document.getElementById('semester-labels');
  const semesters = [...new Set(rows.map(r => r.dataset.semester))];

  semesters.forEach((sem, i) => {
    const semRows = rows.filter(r => r.dataset.semester === sem);
    const label   = el('div', 'semester-label', `SEMESTER ${sem}`);
    container.appendChild(label);

    const isLast = i === semesters.length - 1;
    ScrollTrigger.create({
      trigger:    semRows[0],
      start:      'top center',
      endTrigger: semRows[semRows.length - 1],
      // poslední semestr zůstane, dokud poslední karta neodjede nahoru
      end:        isLast ? 'bottom top' : 'bottom center',
      onToggle: self => gsap.to(label, {
        opacity: self.isActive ? 1 : 0,
        duration: 0.5,
        ease: 'power2.out',
        overwrite: true,
      }),
    });
  });
}

/* ══════════════════════════════════════════════
   SPOJNICE KARTA → KOTVA
   Kotvy jsou fixní (minimapa), karty jedou se
   scrollem. Spojnice se vykreslí (scaleX 0→1),
   jakmile je kotva článku na úrovni karty, a vede
   vodorovně ve výšce kotvy → vždy spojuje tečku
   a kartu. Když karta úroveň opustí, stáhne se.
   Připojená kotva dostane .is-active (záře).
══════════════════════════════════════════════ */
const CONNECTOR_PAD = 12; // spojnice nejblíž 12 px od horní/dolní hrany karty

function initArticleConnectors(rows) {
  const items = rows.map(row => ({
    row,
    card:   row.querySelector('.article-card'),
    line:   row.querySelector('.article-connector'),
    anchor: document.querySelector(
      `.timeline-anchor[data-article-id="${row.id.replace('article-', '')}"]`
    ),
    on: false,
  })).filter(it => it.anchor && it.line);

  const update = () => {
    // Na mobilu je timeline schovaná → spojnice nekreslit
    const enabled = getComputedStyle(document.getElementById('timeline')).display !== 'none';

    items.forEach(it => {
      const a  = it.anchor.getBoundingClientRect();
      const ay = a.top + a.height / 2;
      const c  = it.card.getBoundingClientRect();
      const level = enabled && ay >= c.top + CONNECTOR_PAD && ay <= c.bottom - CONNECTOR_PAD;

      if (level) {
        it.line.style.top = (ay - it.row.getBoundingClientRect().top) + 'px';
      }

      if (level !== it.on) {
        it.on = level;
        it.anchor.classList.toggle('is-active', level);
        gsap.to(it.line, {
          scaleX:   level ? 1 : 0,
          duration: level ? 0.55 : 0.3,
          ease:     level ? 'power3.out' : 'power2.in',
          overwrite: true,
        });
      }
    });
  };

  ScrollTrigger.create({
    trigger: '#articles',
    start: 'top bottom',
    end:   'bottom top',
    onUpdate:    update,
    onToggle:    update,
    onRefresh:   update,
  });
  update();
}

/* ══════════════════════════════════════════════
   MICRO: magnetický hover na všech .btn
   (CTA v hero + "Řekni mi víc" v kartách)
══════════════════════════════════════════════ */
function initMagneticButtons() {
  document.querySelectorAll('.btn').forEach(btn => {
    if (btn.dataset.magnetic) return;
    btn.dataset.magnetic = '1';

    btn.addEventListener('mousemove', (e) => {
      const r  = btn.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width  / 2) * 0.28;
      const dy = (e.clientY - r.top  - r.height / 2) * 0.28;
      gsap.to(btn, { x: dx, y: dy, duration: 0.3, ease: 'power2.out' });
    });

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.45)' });
    });
  });
}

/* ══════════════════════════════════════════════
   RESIZE
   ScrollTrigger při resize sám volá refresh();
   hero-block přecentrujeme ještě před ním, aby
   morph (3a) četl nové heroTop
══════════════════════════════════════════════ */
ScrollTrigger.addEventListener('refreshInit', layoutHeroBlock);
