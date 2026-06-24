// Renders a projected knockout bracket: Round of 32 → Round of 16 →
// Quarter-finals → Semi-finals → Final → Champion.
import { Fragment, useEffect, useRef, useState } from "react";
import Flag from "./Flag.jsx";

function seedLabel(team) {
  if (!team) return "";
  if (team.rank) return `3rd · ${team.group}`; // best-third qualifier
  return `${team.group}${team.pos}`; // e.g. A1, C2
}

function teamLabel(team) {
  // For R32 teams (single or tied), build the display label.
  if (!team) return "TBD";
  if (team.tiedWith) return [team, ...team.tiedWith].map((t) => t.name).join(" / ");
  return team.name;
}

function Slot({ team, isWinner }) {
  if (!team) {
    return (
      <div className="slot empty">
        <span className="nm">TBD</span>
      </div>
    );
  }

  // A 3rd-place slot: show the flags of every potential qualifier (no names).
  if (team.thirdSlot) {
    return (
      <div className="slot third-slot">
        <span className="seed">3rd</span>
        {team.teams.map((t, i) => (
          <span className="third-opt" key={i}>
            <Flag team={t} />
            {t.tiedWith && t.tiedWith.map((o, j) => <Flag key={j} team={o} />)}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className={`slot ${isWinner ? "winner" : ""}`}>
      <Flag team={team} />
      {team.tiedWith ? (
        team.tiedWith.map((o, i) => (
          <Fragment key={i}>
            <span className="slash">/</span>
            <Flag team={o} />
          </Fragment>
        ))
      ) : (
        <span className="nm">{team.name}</span>
      )}
      {!team.tiedWith && <span className="seed">{seedLabel(team)}</span>}
    </div>
  );
}

function Match({ pair }) {
  const [a, b] = pair;
  return (
    <div className="match">
      <Slot team={a} />
      <Slot team={b} />
    </div>
  );
}

function Round({ label, pairs }) {
  return (
    <div className="round">
      <div className="round-label">{label}</div>
      <div className="matchups">
        {pairs.map((pair, i) => (
          <Match key={i} pair={pair} />
        ))}
      </div>
    </div>
  );
}

export default function KnockoutBracket({ bracket }) {
  const { r32, roundOf16, quarters, semis, final } = bracket;
  const bracketRef = useRef(null);
  const r32MatchupsRef = useRef(null);
  const [lineStyle, setLineStyle] = useState({});

  useEffect(() => {
    const bracketEl = bracketRef.current;
    const r32El = r32MatchupsRef.current;
    if (!bracketEl || !r32El) return;

    const bracketRect = bracketEl.getBoundingClientRect();
    const matches = r32El.querySelectorAll(".match");
    if (matches.length < 9) return;

    // Position the divider line between R32 match 8 and match 9.
    const match8Rect = matches[7].getBoundingClientRect();
    const match9Rect = matches[8].getBoundingClientRect();
    const topPos =
      match8Rect.bottom - bracketRect.top + (match9Rect.top - match8Rect.bottom) / 2;

    // Width: from the end of R32 to the end of the Final round (before Champion).
    const r32Right = r32El.parentElement.getBoundingClientRect().right - bracketRect.left;
    const allRounds = bracketEl.querySelectorAll(".round");
    const finalRound = allRounds[allRounds.length - 2];
    const championRound = allRounds[allRounds.length - 1];
    const finalRoundRight = finalRound.getBoundingClientRect().right - bracketRect.left;

    setLineStyle({
      top: `${topPos}px`,
      left: `${r32Right}px`,
      width: `${finalRoundRight - r32Right}px`,
    });

    // Center the Final match and the Champion on the line (they otherwise sit at
    // the bracket's geometric middle, which drifts from the line when R32 slots wrap).
    const centerOnLine = (el) => {
      if (!el) return;
      el.style.transform = "translateY(0px)"; // reset before measuring
      const r = el.getBoundingClientRect();
      const center = r.top - bracketRect.top + r.height / 2;
      el.style.transform = `translateY(${topPos - center}px)`;
    };
    centerOnLine(finalRound.querySelector(".match"));
    centerOnLine(championRound.querySelector(".match"));
  }, [bracket]);

  return (
    <div className="bracket-scroll">
      <div className="bracket" ref={bracketRef}>
        <div ref={r32MatchupsRef} style={{ position: "relative" }}>
          <Round label="Round of 32" pairs={r32} />
        </div>
        <Round label="Round of 16" pairs={roundOf16} />
        <Round label="Quarter-finals" pairs={quarters} />
        <Round label="Semi-finals" pairs={semis} />
        <Round label="Final" pairs={[final]} />

        <div className="round">
          <div className="round-label">Champion</div>
          <div className="matchups">
            <div className="match champion">
              <span className="cup">🏆</span>
              <span className="label">TBD</span>
              <span className="name">—</span>
            </div>
          </div>
        </div>

        <div className="bracket-midline" style={lineStyle} />
      </div>
    </div>
  );
}
