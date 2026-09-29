# Automatizaria — V5 (ChatGPT handoff)

> **Status:** baseline imutabil. Acest commit este copia exactă a build-ului **V4**.
> Nu s-a făcut niciun redesign. Scopul acestui repo este handoff-ul către ChatGPT.

---

## 1. Ce este proiectul

Landing page premium, interactiv, pentru **Automatizaria** — un produs care transformă
lead-urile primite de firmele de instalații fotovoltaice în programări confirmate.

Este un **concept demonstrativ cu date fictive**. NU este un prospect real, NU este
site-ul unei firme existente și nu are nicio conexiune la CRM, telefon, email sau
WhatsApp real.

**Reguli de conținut care NU se ating:**
- disclaimerele `SIMULATED` / „exemplu simulat" rămân în pagină;
- numele și cifrele rămân marcate explicit ca fictive;
- nu se adaugă dovezi inventate (recenzii, clienți, fotografii de șantier).

---

## 2. Starea reală la handoff

| Aspect | Stare |
|---|---|
| Build (`npm run build`) | **PASS** |
| QA desktop (Chromium 1440×900) | **făcut** — 26 capturi în `qa-evidence-v4/` |
| QA mobile (390×844) | **NEfăcut** — nu declara „complet verificat" |
| Console errors | 0 la ultima verificare desktop |
| Deploy public | **nu** — doar local / tunel temporar |

**Nu trata acest build ca „QA complet".** Punctul deschis cel mai important este QA-ul
pe mobil.

---

## 3. Stack

- **React 19** + **TypeScript 6**
- **Vite 8** (`@vitejs/plugin-react`)
- **Tailwind CSS 4** prin `@tailwindcss/vite` (fără fișier `tailwind.config.js`)
- **Motion 13** (`motion/react`) pentru toate animațiile
- **Radix UI** + `class-variance-authority` + `cn`
- **lucide-react** pentru iconițe
- **@fontsource-variable/geist** (font self-hosted, fără request extern)
- `tw-animate-css`

---

## 4. Structura

```
src/
  App.tsx                      # compoziția paginii
  main.tsx                     # bootstrap React
  index.css                    # tokens de design + Tailwind
  styles/landing.css           # stiluri specifice landing-ului

  hooks/
    useJourneyPlayer.ts        # motorul de redare a călătoriei lead-ului

  lib/
    motion.ts                  # vocabularul de animație (easing, variante)
    scroll.ts                  # utilitare de scroll
    site.ts                    # conținutul site-ului (texte, secțiuni)
    useMediaQuery.ts
    journey/
      engine.ts                # mașina de stări a călătoriei
      scenarios.ts             # scenariile deterministe (date fictive)
      types.ts
      cinematic.ts

  components/
    Nav.tsx  Hero.tsx  Problem.tsx  Capabilities.tsx
    Omnichannel.tsx  BookingCTA.tsx  FinalCTA.tsx  Footer.tsx
    hero/SystemScene.tsx
    cinematic/CinematicDemo.tsx + cinematic.css
    journey/                   # secțiunea centrală interactivă
      LeadJourney.tsx  StageRail.tsx  Conversation.tsx  ChannelBus.tsx
      PipelinePanel.tsx  EnginePanel.tsx  LeadCard.tsx  Narration.tsx
      Timeline.tsx  TimeJump.tsx  StopBanner.tsx  Comparison.tsx
      Controls.tsx  FlowChannel.tsx  icons.tsx
      journey.css + journey-v3.css

dist/                          # build comis intenționat (preview pentru handoff)
dist/qa/                       # capturi QA
qa-evidence-v4/                # capturi QA (sursă)
```

---

## 5. Rulare

```bash
npm install
npm run dev        # dezvoltare
npm run build      # tsc -b && vite build
npm run preview    # servește dist/
```

Preview static fără Node:
```bash
python3 -m http.server 8920 --directory dist --bind 127.0.0.1
```

---

## 6. Cum funcționează partea interactivă (elementul central)

Secțiunea `journey/` demonstrează fluxul comercial complet:
vizitator → asistent AI → calificare → lead → pipeline → follow-up → programare → vânzare.

- `lib/journey/engine.ts` — mașina de stări, deterministă
- `lib/journey/scenarios.ts` — scenariile (date fictive, marcate ca atare)
- `hooks/useJourneyPlayer.ts` — play / pauză / pas / reset / viteză
- `journey/*.tsx` — suprafețele care se actualizează simultan (conversație,
  pipeline, canal de comunicare, naratiune)

**Determinist prin design:** nu există apel LLM. Același input → același rezultat,
ca demonstrația să nu depindă de rețea sau de un model indisponibil.

---

## 7. Accesibilitate (păstrează)

- `prefers-reduced-motion` respectat în toate componentele animate
- un singur `<h1>`, ordine logică de heading-uri
- input-uri etichetate, butoane cu nume accesibil
- focus vizibil, contrast ridicat pe fundal întunecat

---

## 8. Ce NU se face în acest repo fără aprobare

- redenumire de brand sau schimbare de poziționare
- eliminarea disclaimerelor de simulare
- conectarea la servicii reale (CRM, email, WhatsApp, calendar)
- deploy public
- commitarea de credențiale sau chei API (`.env` nu intră în repo)

---

## 9. Context tehnic util

- Tunel temporar folosit anterior: Cloudflare quick tunnel către `127.0.0.1:8920`
- Capturile din `dist/qa/` și `qa-evidence-v4/` sunt dovada QA desktop
- Baseline-ul V4 este înghețat: orice schimbare se face pe branch-ul
  `automatizaria-v5-chatgpt`, nu pe `main`, pentru a păstra referința
