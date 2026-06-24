import { useEffect, useMemo, useState } from "react";
import {
  initialMatches,
  computeStandings,
  computeThirdPlace,
  buildBracket,
} from "./data.js";
import GroupStage from "./components/GroupStage.jsx";
import KnockoutBracket from "./components/KnockoutBracket.jsx";
import ScoreEntry from "./components/ScoreEntry.jsx";

const STORE_KEY = "wc2026scores";

// Load saved scores from localStorage and apply them onto a fresh match list.
function loadMatches() {
  const matches = initialMatches();
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      matches.forEach((m) => {
        if (data[m.id]) {
          m.hs = data[m.id][0];
          m.as = data[m.id][1];
        }
      });
    }
  } catch {
    /* ignore malformed storage */
  }
  return matches;
}

const NOTES = {
  matches:
    "Enter the score for any match. The group standings, the third-place ranking and the knockout bracket all update automatically from what you type. Scores are saved in your browser.",
  groups:
    "Group standings computed from the scores you entered. The eight best third-placed teams (below the groups) advance to the Round of 32.",
  knockout:
    "Projected knockout bracket built from your scores: group winners, runners-up and the 8 best thirds are seeded into the Round of 32; later rounds are projected from each team's group record.",
};

export default function App() {
  const [view, setView] = useState("groups");
  const [matches, setMatches] = useState(loadMatches);

  // Persist scores whenever they change.
  useEffect(() => {
    const data = {};
    matches.forEach((m) => {
      if (m.hs != null || m.as != null) data[m.id] = [m.hs, m.as];
    });
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(data));
    } catch {
      /* ignore quota / privacy-mode errors */
    }
  }, [matches]);

  const setScore = (id, side, value) =>
    setMatches((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [side]: value } : m))
    );

  const reset = () => {
    if (window.confirm("Clear all entered scores?")) {
      setMatches(initialMatches());
    }
  };

  const exportData = () => {
    const scores = {};
    matches.forEach((m) => {
      if (m.hs != null || m.as != null) scores[m.id] = [m.hs, m.as];
    });
    // Human-readable fixture list alongside the compact map used by Import.
    const matchList = matches.map((m) => ({
      id: m.id,
      group: m.group,
      matchday: m.md,
      match: `${m.home} vs ${m.away}`,
      score: m.hs != null && m.as != null ? `${m.hs}-${m.as}` : null,
    }));
    const payload = {
      tournament: "FIFA World Cup 2026",
      savedAt: new Date().toISOString(),
      matches: matchList,
      scores,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const scoresFromPayload = (data) => {
    if (!data || typeof data !== "object") return null;
    if (data.scores && typeof data.scores === "object") return data.scores;
    if (Array.isArray(data.matches)) {
      // Rebuild the score map from the human-readable list (e.g. "2-1").
      const s = {};
      data.matches.forEach((it) => {
        if (it && it.id && typeof it.score === "string" && it.score.includes("-")) {
          const [h, a] = it.score.split("-").map((n) => parseInt(n, 10));
          if (!isNaN(h) && !isNaN(a)) s[it.id] = [h, a];
        }
      });
      return s;
    }
    return data; // a bare { "A-0": [2,1], ... } map
  };

  const importData = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        const scores = scoresFromPayload(data);
        if (!scores || typeof scores !== "object") throw new Error("bad format");
        setMatches((prev) =>
          prev.map((m) =>
            scores[m.id]
              ? { ...m, hs: scores[m.id][0], as: scores[m.id][1] }
              : { ...m, hs: null, as: null }
          )
        );
      } catch {
        window.alert(
          "Could not read that file. Please choose a data.json exported from this app."
        );
      }
    };
    reader.readAsText(file);
  };

  const standings = useMemo(() => computeStandings(matches), [matches]);
  const thirds = useMemo(() => computeThirdPlace(standings), [standings]);
  const bracket = useMemo(
    () => buildBracket(standings, thirds),
    [standings, thirds]
  );

  return (
    <div className="app">
      <div className="topbar">
        <div className="title">
          <span className="trophy">🏆</span>
          <div>
            <h1>World Cup 2026 — Bracket Emulator</h1>
            <div className="sub">United States · Canada · Mexico</div>
          </div>
        </div>

        <div className="view-switch">
          <label htmlFor="view">View</label>
          <select
            id="view"
            value={view}
            onChange={(e) => setView(e.target.value)}
          >
            <option value="matches">Matchups</option>
            <option value="groups">Group Stage Standings</option>
            <option value="knockout">Knockout — Round of 32</option>
          </select>
        </div>
      </div>

      <div className="note">{NOTES[view]}</div>

      {view === "knockout" && <KnockoutBracket bracket={bracket} />}
      {view === "groups" && (
        <GroupStage standings={standings} thirds={thirds} />
      )}
      {view === "matches" && (
        <ScoreEntry
          matches={matches}
          onScore={setScore}
          onExport={exportData}
          onImport={importData}
        />
      )}
    </div>
  );
}
