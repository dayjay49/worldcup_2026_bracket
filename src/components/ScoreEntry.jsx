import { useRef } from "react";
import { teamOf } from "../data.js";
import Flag from "./Flag.jsx";

function ScoreInput({ match, side, onScore }) {
  const value = match[side] == null ? "" : match[side];
  return (
    <input
      className="score-in"
      type="number"
      min="0"
      inputMode="numeric"
      aria-label={`${side === "hs" ? match.home : match.away} score`}
      value={value}
      onChange={(e) => {
        const raw = e.target.value;
        const v = raw === "" ? null : Math.max(0, parseInt(raw, 10) || 0);
        onScore(match.id, side, raw === "" ? null : v);
      }}
    />
  );
}

function FixtureRow({ match, onScore }) {
  const scored = match.hs != null && match.as != null;
  const homeWin = scored && match.hs > match.as;
  const awayWin = scored && match.as > match.hs;
  const draw = scored && match.hs === match.as;

  return (
    <div className="fixture">
      <div className="home">
        <span className={`nm${homeWin ? " nm-win" : awayWin ? " nm-loss" : draw ? " nm-draw" : ""}`}>{match.home}</span>
        {homeWin && <span className="wl win">W</span>}
        {awayWin && <span className="wl loss">L</span>}
        <Flag team={teamOf(match.home)} />
      </div>
      <ScoreInput match={match} side="hs" onScore={onScore} />
      <span className="vs">–</span>
      <ScoreInput match={match} side="as" onScore={onScore} />
      <div className="away">
        <Flag team={teamOf(match.away)} />
        {awayWin && <span className="wl win">W</span>}
        {homeWin && <span className="wl loss">L</span>}
        <span className={`nm${awayWin ? " nm-win" : homeWin ? " nm-loss" : draw ? " nm-draw" : ""}`}>{match.away}</span>
      </div>
    </div>
  );
}

function FixturesCard({ group, matches, onScore }) {
  const sortMd = (list) =>
    [...list].sort((a, b) => {
      const aScored = a.hs != null || a.as != null ? 0 : 1;
      const bScored = b.hs != null || b.as != null ? 0 : 1;
      return aScored - bScored;
    });

  const rows = [];
  [1, 2, 3].forEach((md) => {
    const list = sortMd(matches.filter((m) => m.md === md));
    rows.push(<div className="md-label" key={`md-${md}`}>Matchday {md}</div>);
    list.forEach((m) => rows.push(<FixtureRow key={m.id} match={m} onScore={onScore} />));
  });

  return (
    <div className="group-card">
      <div className="group-head">
        <span>Group {group}</span>
        <span>Score</span>
      </div>
      {rows}
    </div>
  );
}

export default function ScoreEntry({
  matches,
  onScore,
  onReset,
  onExport,
  onImport,
}) {
  const done = matches.filter((m) => m.hs != null && m.as != null).length;
  const groups = [...new Set(matches.map((m) => m.group))];
  const fileRef = useRef(null);

  return (
    <div>
      <div className="matches-actions">
        <span className="progress">
          {done} of {matches.length} matches entered
        </span>
        <div className="action-group">
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            style={{ display: "none" }}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) onImport(e.target.files[0]);
              e.target.value = ""; // allow re-importing the same filename
            }}
          />
          <button className="btn" onClick={() => fileRef.current.click()}>
            Import data.json
          </button>
          <button className="btn" onClick={onExport}>
            Export data.json
          </button>
        </div>
      </div>
      <div className="fixtures-grid">
        {groups.map((g) => (
          <FixturesCard
            key={g}
            group={g}
            matches={matches.filter((m) => m.group === g)}
            onScore={onScore}
          />
        ))}
      </div>
    </div>
  );
}
