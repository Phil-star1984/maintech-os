# MainTech OS

**Das offene Community-Betriebssystem für Tech-, IT- und KI-Events in Mainfranken.**

MainTech OS ist eine moderne, minimalistische Event-Plattform im Dark-Mode/Terminal-Look. Sie sammelt Tech-, IT-, Startup-, Coding-, Design- und KI-Events aus Mainfranken, stellt sie in einem einheitlichen Standardformat dar und zeigt, wie Events maschinenlesbar und API-ready aufbereitet werden können.

## Features

- **Event-Index** — 12 Beispiel-Events aus Mainfranken als statisches JSON (`/api/events.json`)
- **Suche & Filter** — Terminal-style Command Bar + Filterchips (AI, Coding, Startup, Free, This Week, Würzburg, …)
- **Event Cards** — Einheitliche Darstellung mit Details, Save, Calendar, Share
- **Event Detail Modal** — Vollständige Infos, JSON-Block, JSON-LD Preview
- **Random / Shake Mode** — Zufälliges Event, Leertaste auf Desktop, optional DeviceMotion auf Mobile
- **Event Normalizer** — MVP-Demo: Rohtext → strukturiertes Event via Heuristiken
- **Save Events** — localStorage mit Persistenz über Reloads
- **Add to Calendar** — .ics-Download pro Event
- **Copy Functions** — JSON, Social Post, Share Text mit Feedback-Toast
- **Stats Strip** — Events indexed, Topics, Free events, Saved nodes
- **Responsive & Accessible** — Mobile-first, Fokuszustände, semantische Buttons

## Tech Stack

- React 19 + Vite 8
- JavaScript (kein TypeScript)
- Plain CSS (Terminal Luxury Design)
- Statische JSON-Daten, kein Backend
- Vercel-ready

## Local Setup

```bash
# Dependencies installieren
npm install

# Dev-Server starten
npm run dev

# Production Build
npm run build

# Build lokal previewen
npm run preview
```

Die App läuft standardmäßig unter `http://localhost:5173`.

## Deploy auf Vercel

1. Repository auf GitHub pushen
2. Auf [vercel.com](https://vercel.com) einloggen → **Add New Project**
3. GitHub-Repo auswählen
4. Framework Preset: **Vite** (wird automatisch erkannt)
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Deploy klicken

Keine Environment Variables oder API Keys nötig.

## Projektstruktur

```
src/
├── App.jsx
├── main.jsx
├── components/
│   ├── Header.jsx
│   ├── CommandBar.jsx
│   ├── FilterBar.jsx
│   ├── EventGrid.jsx
│   ├── EventCard.jsx
│   ├── EventDetail.jsx
│   ├── RandomEvent.jsx
│   ├── EventNormalizer.jsx
│   ├── StatsStrip.jsx
│   └── Footer.jsx
├── utils/
│   ├── eventUtils.js
│   └── calendar.js
├── data/
│   └── fallbackEvents.js
└── styles/
    └── global.css

public/
└── api/
    └── events.json
```

## Roadmap

- [ ] Echte API mit CRUD für Veranstalter
- [ ] KI-Agenten für Event-Normalizer (statt Heuristiken)
- [ ] Newsletter-Engine & Community-Subscriptions
- [ ] Event-Submission-Formular für Veranstalter
- [ ] iCal-Feed & Webhook-Integration
- [ ] OAuth / Community-Profile
- [ ] Automatisches Scraping regionaler Event-Quellen
- [ ] Multi-Language (DE/EN)

## Lizenz

Hackathon MVP — Open prototype for Mainfranken's tech community.
