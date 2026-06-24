# World Cup 2026 — Bracket Emulator

A React app for the FIFA World Cup 2026 with three views (dropdown, top-right):

1. **Enter scores** — every group fixture (12 groups × 6 matches) with score
   inputs you fill in yourself. No results are baked in.
2. **Group stage** — 12 group tables (P/W/D/L/GD/Pts) computed from the scores
   you entered, plus a **ranking of the third-placed teams** (top 8 advance)
   below all the groups.
3. **Knockout — Round of 32** — a projected bracket seeded from your standings,
   running through to a projected champion.

The standings, third-place ranking and bracket all update automatically from
the scores you type. Entries are saved in the browser (localStorage) for the
current browser, and the **Export data.json / Import data.json** buttons on the
"Enter scores" tab let you save a portable `data.json` file and reload it in any
browser, machine, or incognito window — the file is the shareable source of
truth. The layout follows the same idea as Google's table and knockout views.

## Two ways to run it

### 1. Instant — no install
Double-click **`standalone.html`** to open it in your browser. It loads React
from a CDN, so nothing needs to be installed. (Needs an internet connection the
first time so the CDN scripts load.)

### 2. Proper dev setup (Vite)
Requires Node.js (https://nodejs.org). Then:

```bash
npm install
npm run dev
```

Open the printed `http://localhost:5173` URL.

## Project structure
- `src/data.js` — team rosters, fixtures, and the standings / third-place /
  bracket computations (all derived from entered scores)
- `src/components/ScoreEntry.jsx` — the fixture list with score inputs
- `src/components/GroupStage.jsx` — group tables + third-place ranking
- `src/components/KnockoutBracket.jsx` — Round of 32 → Final bracket
- `src/App.jsx` — view dropdown, score state, localStorage persistence
- `standalone.html` — the whole app inlined into one file (no build needed)
- `data.json` — reference template with all 72 fixtures (Group A filled
  in as an example); import it on the "Enter scores" tab to see the format

## Note on the data
No match results are baked in — you enter the scores. The team rosters in
`src/data.js` (and the matching block in `standalone.html`) are an editable
starting lineup; adjust team names/flags there if a group's teams differ from
the real draw.
