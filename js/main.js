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
window.addEventListener('load', () => {
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

  // Tečka se posouvá dolů přes všechny sekce (scrub)
  gsap.to('#timeline-dot', {
    top: '88%',
    ease: 'none',
    scrollTrigger: {
      trigger: '#about',
      start: 'top top',
      endTrigger: '#experience',
      end: 'bottom bottom',
      scrub: 1.2,
    }
  });

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

  /* ── 4b. Experience obsah ── */
  revealHeading(document.getElementById('experience-heading'), {
    trigger: '#experience-heading',
    start: 'top 65%',
  });

  gsap.from('#experience-text', {
    opacity: 0,
    y: 16,
    duration: 0.55,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '#experience',
      start: 'top 44%',
      toggleActions: 'play none none reverse',
    }
  });

  /* ── 5. Blur-out při odscrollování (mléčné sklo) ── */
  ['#about-content', '#experience-content'].forEach(content => {
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
  const tl    = document.getElementById('timeline');
  const about = document.getElementById('about');
  const exp   = document.getElementById('experience');

  const sections = [
    { el: about, label: 'O mně'      },
    { el: exp,   label: 'Zkušenosti' },
  ];

  sections.forEach(({ el, label }) => {
    const dot = document.createElement('div');
    dot.className = 'timeline-anchor';
    dot.title     = label;
    dot._section  = el;

    dot.addEventListener('click', () => {
      // Pulsující ring při kliknutí
      const ring = document.createElement('div');
      ring.className = 'timeline-anchor-ring';
      dot.appendChild(ring);
      gsap.fromTo(ring,
        { scale: 1, opacity: 1 },
        { scale: 5, opacity: 0, duration: 0.7, ease: 'power2.out',
          onComplete: () => ring.remove() }
      );
      el.scrollIntoView({ behavior: 'smooth' });
    });

    tl.appendChild(dot);
  });

  positionTimelineAnchors();
  // Po každém refreshi (resize) přepočítej pozice kotev
  ScrollTrigger.addEventListener('refresh', positionTimelineAnchors);
}

function positionTimelineAnchors() {
  const vh    = window.innerHeight;
  const about = document.getElementById('about');
  const exp   = document.getElementById('experience');

  // Stejný rozsah jako scrub tečky: 'top top' → 'bottom bottom'
  const scrollMin   = about.offsetTop;
  const scrollMax   = exp.offsetTop + exp.offsetHeight - vh;
  const scrollRange = scrollMax - scrollMin;

  // Dot cestuje z 8 % na 88 % (viz gsap.to '#timeline-dot')
  const DOT_START = 8;
  const DOT_END   = 88;

  document.querySelectorAll('.timeline-anchor').forEach(dot => {
    const el = dot._section;
    // scrollY kdy je střed sekce uprostřed viewportu
    const scrollAtCenter = el.offsetTop + el.offsetHeight / 2 - vh / 2;
    const progress = Math.max(0, Math.min(1, (scrollAtCenter - scrollMin) / scrollRange));
    dot.style.top = DOT_START + progress * (DOT_END - DOT_START) + '%';
  });
}

/* ══════════════════════════════════════════════
   MICRO: magnetický hover na CTA
══════════════════════════════════════════════ */
document.getElementById('cta-btn').addEventListener('mousemove', (e) => {
  const r  = e.currentTarget.getBoundingClientRect();
  const dx = (e.clientX - r.left - r.width  / 2) * 0.28;
  const dy = (e.clientY - r.top  - r.height / 2) * 0.28;
  gsap.to('#cta-btn', { x: dx, y: dy, duration: 0.3, ease: 'power2.out' });
});

document.getElementById('cta-btn').addEventListener('mouseleave', () => {
  gsap.to('#cta-btn', { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.45)' });
});

/* ══════════════════════════════════════════════
   RESIZE
   ScrollTrigger při resize sám volá refresh();
   hero-block přecentrujeme ještě před ním, aby
   morph (3a) četl nové heroTop
══════════════════════════════════════════════ */
ScrollTrigger.addEventListener('refreshInit', layoutHeroBlock);
