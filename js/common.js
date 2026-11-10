/* ══════════════════════════════════════════════
   SPOLEČNÉ – sdílí index.html i article.html
   Závislosti: GSAP 3
══════════════════════════════════════════════ */

/* MICRO: magnetický hover na všech .btn
   (CTA v hero, "Řekni mi víc" v kartách, ZPĚT v detailu)
   Volat po vykreslení dynamických tlačítek; opakované
   volání je bezpečné (data-magnetic). */
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
   MENU – tlačítko MENU + overlay "harmonika"
   Figma: "Menu button" (22:164), "Overlay menu" (22:48)

   initMenu(articles, { currentId, onNavigate })
   - articles   … pole z data/articles.json
   - currentId  … id právě otevřeného článku (detail)
   - onNavigate … volitelný handler pro odkazy na
                  homepage (vrací true = zpracováno)

   Sloupce: 6 semestrů (otevřený 374 px, sbalené
   105 px se svislým popiskem) + černý panel s
   výchozím menu. Otevření: sloupce se rozvinou
   zleva doprava (clip-path, stagger) jako harmonika.
   Přepnutí semestru: CSS transition flex-basis.
══════════════════════════════════════════════ */
const MENU_SEMESTERS = 6;
// Barvy sloupců dle Figmy – od nejsvětlejšího
const MENU_COLORS = ['#B200FF', '#A203E7', '#8600C0', '#650190', '#4D046C', '#3A0053'];

function initMenu(articles = [], { currentId = null, onNavigate = null } = {}) {
  const current = articles.find(a => a.id === currentId);
  const startSemester = current ? Number(current.semester) : 1;

  /* ── Tlačítko MENU ── */
  const wrap = document.createElement('div');
  wrap.id = 'menu-toggle-wrap';
  wrap.innerHTML = `
    <button id="menu-toggle" type="button" aria-expanded="false" aria-controls="menu-overlay">
      <img src="assets/icons/menu.svg" alt="" />
      <span class="menu-label">MENU</span>
    </button>`;
  document.body.appendChild(wrap);
  const toggle = wrap.querySelector('#menu-toggle');

  /* ── Overlay ── */
  const overlay = document.createElement('div');
  overlay.id = 'menu-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Menu');
  overlay.setAttribute('aria-hidden', 'true');

  const columns = [];

  for (let n = 1; n <= MENU_SEMESTERS; n++) {
    const sem = document.createElement('section');
    sem.className = 'menu-sem';
    sem.dataset.semester = n;
    sem.style.setProperty('--sem-bg', MENU_COLORS[n - 1] || MENU_COLORS[MENU_COLORS.length - 1]);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'menu-sem-toggle';
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = `<span class="menu-sem-vertical">SEMESTR ${n}</span>`;

    const body = document.createElement('div');
    body.className = 'menu-sem-body';
    const heading = document.createElement('p');
    heading.className = 'menu-sem-heading';
    heading.textContent = `SEMESTR ${n}`;
    body.appendChild(heading);

    const semArticles = articles.filter(a => Number(a.semester) === n);
    if (semArticles.length) {
      const ul = document.createElement('ul');
      ul.className = 'menu-links';
      semArticles.forEach(a => {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = `article.html?id=${encodeURIComponent(a.id)}`;
        link.textContent = a.title;
        if (a.id === currentId) link.setAttribute('aria-current', 'page');
        li.appendChild(link);
        ul.appendChild(li);
      });
      body.appendChild(ul);
    } else {
      const empty = document.createElement('p');
      empty.className = 'menu-empty';
      empty.textContent = 'Články přibudou.';
      body.appendChild(empty);
    }

    btn.addEventListener('click', () => openSemester(n));
    sem.append(btn, body);
    overlay.appendChild(sem);
    columns.push(sem);
  }

  const main = document.createElement('div');
  main.className = 'menu-main';
  main.innerHTML = `
    <button id="menu-close" type="button">
      <img src="assets/icons/close.svg" alt="" />
      <span class="menu-label">Zavřít</span>
    </button>
    <nav aria-label="Hlavní">
      <ul class="menu-nav">
        <li><a href="index.html" data-nav="home"><img src="assets/icons/home.svg" alt="" /><span class="menu-label">Návrat domů</span></a></li>
        <li><a href="index.html#about" data-nav="about"><img src="assets/icons/about.svg" alt="" /><span class="menu-label">O mně</span></a></li>
      </ul>
    </nav>`;
  overlay.appendChild(main);
  columns.push(main);
  document.body.appendChild(overlay);

  const closeBtn = main.querySelector('#menu-close');
  const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

  /* ── Přepnutí semestru (harmonika) ── */
  function openSemester(n) {
    columns.slice(0, MENU_SEMESTERS).forEach(sem => {
      const open = Number(sem.dataset.semester) === n;
      sem.classList.toggle('is-open', open);
      sem.querySelector('.menu-sem-toggle').setAttribute('aria-expanded', String(open));
    });
    // Odkazy nově otevřeného semestru naskočí postupně
    const items = overlay.querySelectorAll(`.menu-sem[data-semester="${n}"] .menu-links li, .menu-sem[data-semester="${n}"] .menu-empty`);
    if (items.length) {
      gsap.fromTo(items, { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, delay: 0.3, ease: 'power2.out', overwrite: true });
    }
  }

  /* ── Otevřít / zavřít overlay ── */
  let isOpen = false;
  let tl = null;

  function open() {
    if (isOpen) return;
    isOpen = true;
    openSemester(startSemester);
    overlay.classList.add('is-visible');
    overlay.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    document.documentElement.style.overflow = 'hidden';

    // Harmonika: sloupce se rozvinou jeden po druhém
    // (desktop zleva doprava, mobil shora dolů)
    const hidden = isMobile() ? 'inset(0 0 100% 0)' : 'inset(0 100% 0 0)';
    tl?.kill();
    tl = gsap.timeline()
      .fromTo(columns, { clipPath: hidden }, {
        clipPath: 'inset(0 0% 0% 0)',
        duration: 0.6,
        ease: 'power3.inOut',
        stagger: 0.07,
        clearProps: 'clipPath',
      })
      .fromTo(main.querySelectorAll('.menu-nav li, #menu-close'), { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.07, ease: 'power2.out' }, '-=0.25');

    closeBtn.focus({ preventScroll: true });
  }

  function close({ instant = false } = {}) {
    if (!isOpen) return;
    isOpen = false;
    toggle.setAttribute('aria-expanded', 'false');
    overlay.setAttribute('aria-hidden', 'true');

    const finish = () => {
      overlay.classList.remove('is-visible');
      gsap.set(columns, { clearProps: 'clipPath' });
      document.documentElement.style.overflow = '';
    };

    tl?.kill();
    if (instant) { finish(); return; }

    // Složení harmoniky v opačném pořadí
    const hidden = isMobile() ? 'inset(0 0 100% 0)' : 'inset(0 100% 0 0)';
    tl = gsap.timeline({ onComplete: finish })
      .to(columns, {
        clipPath: hidden,
        duration: 0.45,
        ease: 'power3.inOut',
        stagger: { each: 0.05, from: 'end' },
      });
    toggle.focus({ preventScroll: true });
  }

  toggle.addEventListener('click', open);
  closeBtn.addEventListener('click', () => close());
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) close();
  });

  // Navigace – stránka může odkazy obsloužit sama (homepage: scroll místo reloadu)
  main.querySelectorAll('[data-nav]').forEach(link => {
    link.addEventListener('click', e => {
      if (onNavigate && onNavigate(link.dataset.nav)) {
        e.preventDefault();
        close({ instant: true });
      }
    });
  });

  return { open, close, toggle: wrap };
}
