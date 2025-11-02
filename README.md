
# AIESEC Hackathon Dashboard

A modular React + TypeScript + Vite + Tailwind app inspired by the OPS dashboard.
It shows an animated cover, a leaderboard for KDU / SLTC / Horizon, a scoreboard table,
and a comparison chart. Data comes from deterministic dummy APIs so it feels live every refresh.

## Quick start

```bash
npm i
npm run start
# then open the printed local URL (usually http://localhost:5173)
```

## Commands

- `npm run start` – start dev server
- `npm run build` – production build
- `npm run preview` – preview production build

## Customize

- Update weights in `src/lib/score.ts` or pass your own from a settings panel.
- Swap logos in `src/components/Logo.tsx` or replace with <img> tags.
- Replace dummy API in `src/api/dummy.ts` with your real backend.
