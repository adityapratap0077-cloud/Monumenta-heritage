<div align="center">

# MONUMENTA
### WHERE HISTORY MEETS TOMORROW — AI-Powered Heritage Restoration

![Monumenta](https://img.shields.io/badge/MONUMENTA-HERITAGE-%23060608?style=for-the-badge&labelColor=%23060608)
![Experience](https://img.shields.io/badge/AI-RESTORATION-%23060608?style=for-the-badge&labelColor=%23060608)
![License](https://img.shields.io/badge/License-MIT-%23060608?style=for-the-badge)

**Restoring History's Greatest Treasures.**<br>
We blend centuries of architectural wisdom with AI-powered restoration technology to preserve the world's most irreplaceable heritage sites.

[GitHub](https://github.com/adityapratap0077-cloud/Monumenta-heritage)

</div>

---

## The Concept

Monumenta is an immersive digital experience for a heritage restoration house — part portfolio, part product demo, part pitch. It sells a single promise: monuments don't have to fade. Visitors explore landmark restorations, drag a before/after slider to watch ruins become architecture again, and use the AI Planner to scope a restoration of their own.

---

## The Experience

- **Three.js WebGL hero** — a living particle field of golden "restoration dust" (4,000 particles on desktop, 1,500 on mobile)
- **Heritage gallery** — five landmark studies: the Colosseum, Notre-Dame, the Alhambra, Ponte Vecchio, Edinburgh Castle
- **Restoration configurator** — drag the before/after slider to witness precision restoration, from deteriorated ruin to preserved treasure
- **AI Planner** — an interactive scoping tool: enter the site name, structure type, approximate age, describe its condition, set restoration urgency — and get a restoration plan
- **Process timeline** — the four phases of every Monumenta engagement: *Assessment & Discovery*, *Conservation Planning*, *Master Craftsmanship*, *Legacy Preservation*
- **Case studies** — Notre-Dame Spire Restoration, Alhambra Courtyard Revival, Edinburgh Castle Walls, Colosseum Arch Program, Ponte Vecchio Foundations
- **Testimonials, urgency, and contact** — full conversion arc through to "Start Your Project"

---

## Craft & Detail

- **GSAP ScrollTrigger** reveals with a split left/right choreography
- **Film-grain overlay** across the whole page — archival, cinematic
- **Gold gradient typography** on a deep dark canvas
- **Reduced-motion support** — honors `prefers-reduced-motion`
- **Mobile-aware** — particle density and rendering adapt to device
- **Accessible by default** — ARIA labels, semantic nav, keyboard-aware structure

---

## Stack

- `Three.js` — WebGL hero particle scene
- `GSAP 3 + ScrollTrigger` — scroll-driven reveals
- Vanilla JS — configurator, planner, micro-interactions
- Custom CSS design system — no framework

---

## Structure

```
Monumenta-heritage/
├── index.html      # Full experience: hero → gallery → planner → cases → contact
├── styles.css      # Complete design system
├── app.js          # Three.js scene, GSAP, configurator, planner logic
├── images/         # Landmarks, before/after, about (9 assets)
├── LICENSE
└── README.md
```

---

## Run Locally

No build step. Clone the repo and open `index.html` in any modern browser — Three.js and GSAP load from CDN.

---

**Aditya Pratap** — Creative Technologist
Gorakhpur, India — github.com/adityapratap0077-cloud
