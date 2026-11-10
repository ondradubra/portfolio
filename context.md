# Portfolio – kontext projektu

## Stav: IN PROGRESS

## Figma
- Soubor: https://www.figma.com/design/WmPBYvCFg4Sy18V6cqtbtK/Portfolio

## Technologie
- Čistý HTML + CSS + JavaScript (bez frameworků)
- GSAP 3 + ScrollTrigger plugin pro animace
- Google Fonts: Syne (ExtraBold 800) + Plus Jakarta Sans (Regular 400, Medium 500, SemiBold 600)

## Design tokeny
- `--purple: #B200FF`
- `--black: #0A0A0A`
- `--white: #FFFFFF`
- `--side-pad: 55px`

## Struktura souborů
```
portfolio/
├── index.html
├── article.html        (šablona detailu článku – article.html?id=<id>)
├── context.md
├── data/
│   ├── articles.json   (články – id, semester, title, perex, image, tags, content)
│   └── articles/<id>.html (obsah článku – HTML fragment: p, h2–h4, ul, a, img)
├── assets/
│   ├── articles/placeholder.jpg (placeholder obrázku článku z Figmy)
│   ├── icons/          (menu, close, home, about – SVG z Figmy)
│   ├── me.png          (B&W foto – fixní vpravo)
│   ├── logo.svg        (PF monogram – černý s fialovým gradientem)
│   └── PORTFOLIO.svg   (hlavní nadpis – 901×254 viewBox)
├── css/
│   ├── style.css       (homepage + základ: reset, tokeny, .btn)
│   ├── article.css     (detail článku)
│   └── menu.css        (tlačítko MENU + overlay menu)
└── js/
    ├── common.js       (sdílené: initMagneticButtons, initMenu)
    ├── main.js         (homepage)
    └── article.js      (detail článku)
```

## Sekce webu
1. **Intro overlay** – fialová obrazovka, PF logo uprostřed
2. **Hero** – PORTFOLIO SVG + jméno (hero-block), foto vpravo, kontakty + CTA
3. **O mně** (`#about`) – 85vh, obsah vlevo, timeline vpravo
4. **Články** (`#articles`) – karty cik-cak kolem timeline, generuje JS z `data/articles.json`
   (Figma screen „List articles“, node 21:2). Sekce Zkušenosti byla odstraněna.

5. **Detail článku** (`article.html?id=<id>`, Figma „Article detail“ node 19:2) – samostatná šablona:
   obrázek přes celou šířku (1512/535 = Figma výška −30 %, max 55vh; mobil 40/21, max 38vh), sloupec 823px, H1 48px, štítky (fialový rámeček,
   radius 9), obsah z fragmentu `content` (h2 32 / h3 26 / h4 18, odkazy bold fialové podtržené,
   odrážky = fialový kosočtverec). ZPĚT = černé kolečko fixní vlevo dole (desktop 100px 41/55,
   mobil 72px 16/16), vede na `index.html#article-<id>`.
   - Animace: obrázek se odkryje zespodu (clip-path) + zoom-out → nadpis → štítky → ZPĚT zleva →
     bloky obsahu po dávkách (`ScrollTrigger.batch`, once). `prefers-reduced-motion` → bez animací.
   - Neznámé id → „Článek nenalezen“.
   - Návrat na homepage: `scrollToHashArticle()` vycentruje kartu (karty vznikají až po fetchi);
     stránka je odscrollovaná → intro se přeskočí.

6. **Menu** (Figma „Menu button“ 22:164, „Overlay menu“ 22:48) – generuje `initMenu()` v common.js,
   na obou stránkách:
   - Tlačítko MENU fixní vpravo nahoře (top 47, right 61), opacity 0.2 → hover 1.
     Homepage: objeví se se zmenšeným headerem (`.page-home` ho skryje, GSAP scrub na `#about`).
     Detail: naběhne v úvodní animaci.
   - Overlay: 6 sloupců semestrů (otevřený 374px s nadpisem a odkazy na články, sbalené 105px se
     svislým „SEMESTR n“ opacity 0.2; barvy `MENU_COLORS` od #B200FF po #3A0053) + černý panel
     (Návrat domů, O mně, Zavřít). Počet semestrů = `MENU_SEMESTERS`.
   - Otevření = harmonika: sloupce se rozvinou zleva (clip-path, stagger 0.07), zavření opačně.
     Přepnutí semestru = CSS transition `flex-basis`. Esc zavírá, scroll stránky je zamčený.
   - Mobil: sloupce pod sebou, semestr se rozbaluje dolů (`grid-template-rows` 0fr → 1fr).
   - Detail: otevře se semestr aktuálního článku, článek je označený (`aria-current`).
   - Homepage: Návrat domů / O mně jen odscrollují (`navigateHome`), bez reloadu.
   - Ikony MENU i Zavřít mají 44×44 px (desktop i mobil); Zavřít se na hover otočí o 90°.
   - Pozor: obsah semestru má při otevření `visibility: inherit`, ne `visible` – jinak by
     přebil skrytý overlay a texty by po zavření menu zůstaly viset.
- Texty: všude „SEMESTR“ (ne „SEMESTER“).

## Animační flow

### Fáze 1 – Intro (automaticky po načtení, přeskočeno při reloadu na odscrollované stránce)
- Fialový overlay, PF logo fade in
- Šikmý wipe doleva: `clip-path` + `x: -10vw`, ease: power3.inOut
- Po zmizení: `initHeroAnimations()`

### Fáze 2 – Hero micro-animace
- `#hero-block` (jméno + PORTFOLIO SVG jako jeden celek): slide in zleva + fade
- `#hero-meta` (kontakty + CTA): fade up
- Po dokončení: `initScrollAnimations()` — KRITICKY zde, ne v intro onComplete
  (důvod: GSAP musí zachytit opacity:1 jako výchozí stav scrub animací)

### Fáze 3 – Scroll animace (ScrollTrigger)

**Hero-block morph do headeru:**
- trigger: `#about`, start: `top 88%`, end: `top 42%`, scrub: 0.6
- `y: deltaY` (= 14px - heroTop), `scale` (= 68px / block.offsetHeight)
- `transformOrigin: left top`

**Kontakty zmizí:**
- trigger: `#about`, start: `top 90%`, end: `top 68%`, scrub: 0.5

**Foto opacity 1→0.08:**
- trigger: `#about`, start: `top 80%`, end: `top 30%`, scrub: 1

**Timeline (fixní, jedna přes celou stránku):**
- `position: fixed; left: 62.8%; top: 0; bottom: 0; z-index: 4`
- Appearance: toggle reverse při zpátečním scrollu
- Linka: scaleY 0→1, trigger `top 55%`, toggleActions reverse
- Pohyblivá tečka: top 8%→88%, rozsah od `#about top top` do `#articles bottom bottom`
  - MAGNETICKÁ (`initMagneticDot` + `magnetize`): úsek mezi sousedními kotvami se dělí na
    drž (38 %) – přeskok (24 %, power2.inOut) – drž (38 %) → tečka většinu scrollu sedí na kotvě
    a k další se přicvakne; síla = konstanta `MAGNET_HOLD`. Pozice se dotahuje `gsap.to` 0.35 s.
  - přichycená tečka má `.is-docked`: větší průhledný fialový kroužek kolem fialové kotvy + elastický „cvak“
- Pohyblivá tečka má CSS `animation: timelinePulse` (pulsující box-shadow)
- Kotevní body: JS vypočítá pozici z `(scrollAtCenter - scrollMin) / scrollRange * 80 + 8`
  - kotvy = minimapa: About + každý článek, fialové tečky (`.timeline-anchor` > `-dot` + `-label`)
  - scrollMin = pageTop(about), scrollMax = pageTop(articles) + articles.offsetHeight - vh
  - klik: expandující ring (GSAP scale 1→5, opacity 1→0) + scrollIntoView (článek na střed)
  - hover: fialový štítek s názvem (CSS transition, clip-path wipe zleva)
  - aktivní článek = kotva připojená spojnicí ke kartě: `.is-active` → fialová záře

**Články:**
- Liché karty: pravá hrana 25px před linkou; sudé: u levého okraje
- Spojnice `.article-connector` (`initArticleConnectors`): vykreslí se animovaně (scaleX 0→1, origin vlevo),
  jen když je kotva článku na úrovni karty (±12px od hran); vede vodorovně ve výšce kotvy → vždy spojuje
  tečku a kartu; po opuštění úrovně se stáhne. `#articles` má malý spodní padding (10vh),
  aby poslední karta na konci zůstala připojená
- Obrázek, nadpis i tlačítko karty vedou na `article.html?id=<id>`; hover obrázku/nadpisu → nadpis fialový + zoom obrázku 1.04
- Nadpis karty: line-height 1.04
- Blur-out karet stejně jako O mně (filter blur 16px + opacity 0.08, `center 32%` → `top -10%`);
  proto reveal animuje celý řádek `.article`, ne kartu (jinak by se tweeny praly o opacity)
- Všechna `.btn` mají magnetický hover (`initMagneticButtons`, volá se po renderu článků)
- Karta přijede zespodu (toggle reverse)
- Popisek semestru („SEMESTR n“): fixní svislý text vpravo, jeden na semestr, opacity on/off
  od `top center` prvního článku semestru (poslední semestr drží do `bottom top` posledního článku)
- `#top-fade`: bílý přechod pod zmenšeným headerem (Figma Frame 10), naběhne s morphem

**Nadpisy (letter-by-letter reveal):**
- `revealHeading(el, { trigger, start })` — rozdělí text na `.ch` spany
- GSAP from: opacity 0, y: -0.3em, stagger: 0.04, toggleActions reverse

**Blur-out při odscrollování (mléčné sklo):**
- animuje `#about-content` a `.article-card` (ne timeline)
- trigger na content elementu: start `center 32%`, end `top -10%`, scrub: 1.4
- blur: 0→16px, opacity: 1→0.08

## Reload na odscrollované stránce
```js
if (window.scrollY > window.innerHeight * 0.3) {
  // přeskoč intro + hero animace
  gsap.set('#hero-block', { opacity: 1, y: 0, scale: 1, transformOrigin: 'left top' });
  gsap.set('#hero-meta',  { opacity: 1, y: 0 });
  initScrollAnimations(); // scrub si sám dopočítá pozici z scrollY
}
```

## Klíčová rozhodnutí
- `#hero-block` a `#photo-container` jsou `position: fixed` — JS centruje block opticky (×0.42)
- `initScrollAnimations()` se volá z `onComplete` hero timeline, ne z intro — jinak GSAP zachytí opacity:0
- Timeline je jeden fixed element, ne per-sekce — nebluruje, kotvy jsou klikatelné
- Sekce `#about` je `height: 85vh` (ne 100vh)
- Články se načítají `fetch`em ještě před `layoutHeroBlock` / ScrollTriggery → nutný lokální server (file:// nefunguje)
- Blur animuje content elementy přes `filter: blur()` + opacity, timeline zůstává ostrá
- Resize: `ScrollTrigger.addEventListener('refreshInit', layoutHeroBlock)` — hero-block se přecentruje před každým refreshem;
  morph používá funkční hodnoty `y`/`scale` + `invalidateOnRefresh`, kotvy timeline se přepočítají na `refresh` (`positionTimelineAnchors`)

## Responsivita
- Desktop: 1280px+ (referenční)
- Tablet 768–1279px: menší padding, menší SVG
- Mobile <768px: foto 100% opacity 0.2, timeline + semestr schované, about-content a karty full width bez cik-caku
- Na výšku: foto se řídí výškou okna (`height: 100%; width: auto; max-width: 100%`, zarovnané vpravo dole),
  PORTFOLIO SVG má strop `min(…, 100vh)`, `@media (max-height: 700px)` zmenší mezery v hero-meta a u nadpisů

## TODO
- [ ] Doplnit skutečný text (O mně) a skutečné články do `data/articles.json`
- [ ] Skutečný obsah článků (fragmenty v `data/articles/` jsou zatím lorem ipsum ve struktuře z Figmy)
- [ ] Spodní bílý fade (Figma Frame 3) zatím není implementovaný
- [ ] Fine-tuning blur start hodnoty (center 32% — lze upravit)
- [ ] Responsivita timeline kotev na mobile
- [ ] Mobil: fixní ZPĚT na detailu může překrývat text – zatím nerozhodnuto
- [ ] Ve Figmě (List articles) ještě přepsat „SEMESTER 1“ na „SEMESTR 1“

## Spuštění lokálně
```bash
cd /Users/dubra/projects/portfolio
python3 -m http.server 8080
# otevřít http://localhost:8080
```
