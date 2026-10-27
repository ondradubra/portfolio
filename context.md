# Portfolio – kontext projektu

## Stav: IN PROGRESS

## Figma
- Soubor: https://www.figma.com/design/WmPBYvCFg4Sy18V6cqtbtK/Portfolio

## Technologie
- Čistý HTML + CSS + JavaScript (bez frameworků)
- GSAP 3 + ScrollTrigger plugin pro animace
- Google Fonts: Syne (ExtraBold 800) + Plus Jakarta Sans (Regular 400, Medium 500)

## Design tokeny
- `--purple: #B200FF`
- `--black: #0A0A0A`
- `--white: #FFFFFF`
- `--side-pad: 55px`

## Struktura souborů
```
portfolio/
├── index.html
├── context.md
├── assets/
│   ├── me.png          (B&W foto – fixní vpravo)
│   ├── logo.svg        (PF monogram – černý s fialovým gradientem)
│   └── PORTFOLIO.svg   (hlavní nadpis – 901×254 viewBox)
├── css/
│   └── style.css
└── js/
    └── main.js
```

## Sekce webu
1. **Intro overlay** – fialová obrazovka, PF logo uprostřed
2. **Hero** – PORTFOLIO SVG + jméno (hero-block), foto vpravo, kontakty + CTA
3. **O mně** (`#about`) – 85vh, obsah vlevo, timeline vpravo
4. **Zkušenosti** (`#experience`) – 85vh, stejný layout jako O mně

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
- Pohyblivá tečka: scrub top 8%→88%, rozsah od `#about top top` do `#experience bottom bottom`
- Pohyblivá tečka má CSS `animation: timelinePulse` (pulsující box-shadow)
- Kotevní body: JS vypočítá pozici z `(scrollAtCenter - scrollMin) / scrollRange * 80 + 8`
  - scrollMin = about.offsetTop, scrollMax = exp.offsetTop + exp.offsetHeight - vh
  - klik: expandující ring (GSAP scale 1→5, opacity 1→0) + scrollIntoView

**Nadpisy (letter-by-letter reveal):**
- `revealHeading(el, { trigger, start })` — rozdělí text na `.ch` spany
- GSAP from: opacity 0, y: -0.3em, stagger: 0.04, toggleActions reverse

**Blur-out při odscrollování (mléčné sklo):**
- animuje pouze `#about-content` a `#experience-content` (ne timeline)
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
- Sekce `#about` a `#experience` jsou `height: 85vh` (ne 100vh) — těsnější za sebou
- Blur animuje content elementy přes `filter: blur()` + opacity, timeline zůstává ostrá

## Responsivita
- Desktop: 1280px+ (referenční)
- Tablet 768–1279px: menší padding, menší SVG
- Mobile <768px: foto 100% opacity 0.2, timeline schovaná, about-content full width

## TODO
- [ ] Doplnit skutečný text (O mně, Zkušenosti)
- [ ] Přidat další sekce (projekty, kontakt)
- [ ] Fine-tuning blur start hodnoty (center 32% — lze upravit)
- [ ] Responsivita timeline kotev na mobile

## Spuštění lokálně
```bash
cd /Users/dubra/projects/portfolio
python3 -m http.server 8080
# otevřít http://localhost:8080
```
