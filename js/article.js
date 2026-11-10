/* ══════════════════════════════════════════════
   DETAIL ČLÁNKU – šablona article.html?id=<id>
   Závislosti: GSAP 3 + ScrollTrigger, common.js
══════════════════════════════════════════════ */

gsap.registerPlugin(ScrollTrigger);

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

window.addEventListener('DOMContentLoaded', async () => {
  const id = new URLSearchParams(location.search).get('id');
  let articles = [];

  try {
    const res = await fetch('data/articles.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    articles = await res.json();
    const article = articles.find(a => a.id === id);
    if (!article) throw new Error(`Článek "${id}" neexistuje`);

    await renderArticle(article);
  } catch (err) {
    console.error('[article]', err);
    renderMissing();
  }

  initMenu(articles, { currentId: id });
  initMagneticButtons();
  initArticleAnimations();
});

/* ══════════════════════════════════════════════
   RENDER
══════════════════════════════════════════════ */
async function renderArticle(article) {
  document.title = `${article.title} – Ondřej Dúbravčík`;

  // ZPĚT vrací přímo na kartu článku na homepage
  document.getElementById('back-btn').href = `index.html#article-${encodeURIComponent(article.id)}`;

  const img = document.getElementById('article-hero-img');
  img.src = article.image;
  img.alt = '';

  document.getElementById('article-detail-title').textContent = article.title;

  const tags = document.getElementById('article-tags');
  (article.tags || []).forEach(tag => {
    const li = document.createElement('li');
    li.textContent = tag;
    tags.appendChild(li);
  });
  if (!tags.children.length) tags.remove();

  // Obsah = vlastní HTML fragment (autorský obsah repozitáře, ne uživatelský vstup)
  if (article.content) {
    const res = await fetch(article.content);
    if (!res.ok) throw new Error(`Obsah ${article.content}: HTTP ${res.status}`);
    document.getElementById('article-content').innerHTML = await res.text();
  }
}

function renderMissing() {
  document.title = 'Článek nenalezen – Ondřej Dúbravčík';
  document.getElementById('article-hero').remove();
  document.getElementById('article-tags')?.remove();
  document.getElementById('article-detail-title').textContent = 'Článek nenalezen';
  const p = document.createElement('p');
  p.className = 'article-missing';
  p.textContent = 'Tenhle článek tu není. Zkus se vrátit na přehled.';
  document.getElementById('article-content').replaceChildren(p);
}

/* ══════════════════════════════════════════════
   ANIMACE – decentní, sekce naskakují postupně
   1. obrázek se odkryje zespodu nahoru + lehký zoom-out
   2. nadpis a štítky vyjedou krátce za ním
   3. bloky obsahu (odstavce, nadpisy, seznamy)
      naskakují po dávkách, jak přicházejí do viewportu
   4. ZPĚT vyjede zleva
══════════════════════════════════════════════ */
function initArticleAnimations() {
  const hero    = document.getElementById('article-hero');
  const heroImg = document.getElementById('article-hero-img');
  const title   = document.getElementById('article-detail-title');
  const tags    = [...document.querySelectorAll('#article-tags li')];
  const blocks  = [...document.querySelectorAll('#article-content > *')];
  const back    = document.getElementById('back-btn');

  if (REDUCED_MOTION) return;

  if (blocks.length) gsap.set(blocks, { opacity: 0, y: 24 });

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  if (hero) {
    tl.fromTo(hero,
      { clipPath: 'inset(100% 0 0 0)' },
      { clipPath: 'inset(0% 0 0 0)', duration: 1.1, ease: 'power4.inOut' })
      .from(heroImg, { scale: 1.08, duration: 1.6, ease: 'power3.out' }, '<');
  }

  tl.from(title, { opacity: 0, y: 30, duration: 0.7 }, hero ? '-=0.55' : 0);
  if (tags.length) tl.from(tags, { opacity: 0, y: 12, duration: 0.45, stagger: 0.07 }, '-=0.45');
  tl.from(back,  { opacity: 0, x: -30, duration: 0.6 }, '-=0.3')
    .from('#menu-toggle-wrap', { autoAlpha: 0, y: -12, duration: 0.6 }, '<')
    // Obsah až po úvodu – jinak by první odstavce naskočily dřív než nadpis
    .add(() => revealBlocks(blocks), '-=0.35');
}

function revealBlocks(blocks) {
  if (!blocks.length) return;
  ScrollTrigger.batch(blocks, {
    start: 'top 92%',
    once: true,
    onEnter: batch => gsap.to(batch, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power3.out',
      stagger: 0.09,
    }),
  });
}
