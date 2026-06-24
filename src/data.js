// FIFA World Cup 2026 — 48 teams, 12 groups (A–L) of 4.
//
// No results are baked in. Standings are computed entirely from the match
// scores the user enters on the "Enter scores" tab. Top 2 of each group plus
// the 8 best third-placed teams advance to the Round of 32.

// Team rosters per group (name + flag emoji only).
// Source: 2026 FIFA World Cup Final Draw (Washington, D.C., 5 Dec 2025).
export const groupDefs = [
  { name: "A", teams: [{ name: "Mexico", flag: "🇲🇽" }, { name: "South Africa", flag: "🇿🇦" }, { name: "South Korea", flag: "🇰🇷" }, { name: "Czechia", flag: "🇨🇿" }] },
  { name: "B", teams: [{ name: "Canada", flag: "🇨🇦" }, { name: "Bosnia & Herzegovina", flag: "🇧🇦" }, { name: "Qatar", flag: "🇶🇦" }, { name: "Switzerland", flag: "🇨🇭" }] },
  { name: "C", teams: [{ name: "Brazil", flag: "🇧🇷" }, { name: "Morocco", flag: "🇲🇦" }, { name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", code: "gb-sct" }, { name: "Haiti", flag: "🇭🇹" }] },
  { name: "D", teams: [{ name: "United States", flag: "🇺🇸" }, { name: "Paraguay", flag: "🇵🇾" }, { name: "Australia", flag: "🇦🇺" }, { name: "Türkiye", flag: "🇹🇷" }] },
  { name: "E", teams: [{ name: "Curaçao", flag: "🇨🇼" }, { name: "Germany", flag: "🇩🇪" }, { name: "Ecuador", flag: "🇪🇨" }, { name: "Côte d'Ivoire", flag: "🇨🇮" }] },
  { name: "F", teams: [{ name: "Netherlands", flag: "🇳🇱" }, { name: "Japan", flag: "🇯🇵" }, { name: "Sweden", flag: "🇸🇪" }, { name: "Tunisia", flag: "🇹🇳" }] },
  { name: "G", teams: [{ name: "Belgium", flag: "🇧🇪" }, { name: "Egypt", flag: "🇪🇬" }, { name: "Iran", flag: "🇮🇷" }, { name: "New Zealand", flag: "🇳🇿" }] },
  { name: "H", teams: [{ name: "Cabo Verde", flag: "🇨🇻" }, { name: "Spain", flag: "🇪🇸" }, { name: "Uruguay", flag: "🇺🇾" }, { name: "Saudi Arabia", flag: "🇸🇦" }] },
  { name: "I", teams: [{ name: "France", flag: "🇫🇷" }, { name: "Senegal", flag: "🇸🇳" }, { name: "Norway", flag: "🇳🇴" }, { name: "Iraq", flag: "🇮🇶" }] },
  { name: "J", teams: [{ name: "Argentina", flag: "🇦🇷" }, { name: "Algeria", flag: "🇩🇿" }, { name: "Jordan", flag: "🇯🇴" }, { name: "Austria", flag: "🇦🇹" }] },
  { name: "K", teams: [{ name: "DR Congo", flag: "🇨🇩" }, { name: "Portugal", flag: "🇵🇹" }, { name: "Colombia", flag: "🇨🇴" }, { name: "Uzbekistan", flag: "🇺🇿" }] },
  { name: "L", teams: [{ name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", code: "gb-eng" }, { name: "Croatia", flag: "🇭🇷" }, { name: "Ghana", flag: "🇬🇭" }, { name: "Panama", flag: "🇵🇦" }] },
];

// Round-robin fixtures for a group of 4 (team indices), grouped by matchday.
const FIXTURES = [
  { md: 1, h: 0, a: 1 }, { md: 1, h: 2, a: 3 },
  { md: 2, h: 0, a: 2 }, { md: 2, h: 3, a: 1 },
  { md: 3, h: 3, a: 0 }, { md: 3, h: 1, a: 2 },
];

// Per-group overrides for the matchday label (fixture index → md).
// Used when the real schedule differs from the standard round-robin order.
const GROUP_MD_OVERRIDES = {
  C: { 2: 3, 3: 3, 4: 2, 5: 2 },
  I: { 2: 3, 3: 3, 4: 2, 5: 2 },
  J: { 2: 3, 3: 3, 4: 2, 5: 2 },
};

// Build the initial match list: every group gets 6 matches with empty scores.
// Each match: { id, group, md, home, away, hs, as }  (hs/as = null until entered)
export function initialMatches() {
  const matches = [];
  groupDefs.forEach((g) => {
    const overrides = GROUP_MD_OVERRIDES[g.name];
    FIXTURES.forEach((f, i) => {
      matches.push({
        id: `${g.name}-${i}`,
        group: g.name,
        md: overrides?.[i] ?? f.md,
        home: g.teams[f.h].name,
        away: g.teams[f.a].name,
        hs: null,
        as: null,
      });
    });
  });
  return matches;
}

// --- Derived helpers -------------------------------------------------------

export const points = (t) => t.w * 3 + t.d;
export const goalDiff = (t) => t.gf - t.ga;
export const played = (t) => t.w + t.d + t.l;

export function flagOf(name) {
  for (const g of groupDefs) {
    const t = g.teams.find((x) => x.name === name);
    if (t) return t.flag;
  }
  return "";
}

// Look up the full team object (name, flag, code) by team name.
export function teamOf(name) {
  for (const g of groupDefs) {
    const t = g.teams.find((x) => x.name === name);
    if (t) return { ...t, group: g.name };
  }
  return null;
}

// Sort teams by World Cup tie-break order: points, GD, goals for, then name.
export function rankTeams(teams) {
  return [...teams].sort(
    (a, b) =>
      points(b) - points(a) ||
      goalDiff(b) - goalDiff(a) ||
      b.gf - a.gf ||
      a.name.localeCompare(b.name)
  );
}

// Standings per group, computed from the entered match scores.
export function computeStandings(matches) {
  const byGroup = Object.fromEntries(matches.map((m) => [m.group, []]));
  matches.forEach((m) => byGroup[m.group].push(m));

  return groupDefs.map((g) => {
    const stats = {};
    g.teams.forEach((t) => {
      stats[t.name] = { name: t.name, flag: t.flag, code: t.code, w: 0, d: 0, l: 0, gf: 0, ga: 0 };
    });
    byGroup[g.name].forEach((m) => {
      if (m.hs == null || m.as == null) return; // not entered yet
      const hs = +m.hs, as = +m.as;
      const H = stats[m.home], A = stats[m.away];
      H.gf += hs; H.ga += as; A.gf += as; A.ga += hs;
      if (hs > as) { H.w++; A.l++; }
      else if (hs < as) { A.w++; H.l++; }
      else { H.d++; A.d++; }
    });
    const ranked = rankTeams(g.teams.map((t) => stats[t.name]));
    return {
      name: g.name,
      teams: ranked.map((t, i) => ({ ...t, group: g.name, pos: i + 1 })),
    };
  });
}

// Two teams are "tied" for seeding when they share points, goal difference AND
// goals for (only the name tiebreak then separates them, so which finishes
// higher is effectively a coin-flip).
export const sameRank = (a, b) =>
  !!a &&
  !!b &&
  points(a) === points(b) &&
  goalDiff(a) === goalDiff(b) &&
  a.gf === b.gf;

// Every OTHER team in `teams` tied (points AND GD) with the team at `index`.
// Returns null when none — i.e. that position isn't part of a tie. Handles
// clusters of any size, up to a whole group being tied.
export const tiedSet = (teams, index) => {
  const ref = teams[index];
  if (!ref) return null;
  const others = teams.filter((t, i) => i !== index && sameRank(t, ref));
  return others.length ? others : null;
};

// The 12 third-placed teams, ranked; the top 8 qualify for the Round of 32.
// If the 3rd-place team is tied (points AND GD) with any other team in its group
// (the runner-up above, the 4th below, or several at once when a whole group is
// level), they're shown together via `tiedWith` (an array of the other teams).
// The row's stats and ranking use the 3rd-place team, which it shares on pts/GD.
export function computeThirdPlace(standings) {
  const thirds = standings.map((g) => {
    const third = g.teams[2];
    const others = tiedSet(g.teams, 2);
    return others ? { ...third, tiedWith: others } : third;
  });
  const ranked = rankTeams(thirds).map((t, i) => ({
    ...t,
    rank: i + 1,
    qualified: i < 8,
  }));
  // Qualification-boundary tie: if the 8th and 9th ranked thirds are tied, the
  // last qualifying spot is undecided — show both teams in both rows (via
  // `rankTiedWith`, which only affects the ranking table, not the bracket).
  const eighth = ranked[7];
  const ninth = ranked[8];
  if (eighth && ninth && sameRank(eighth, ninth)) {
    ranked[7] = { ...eighth, rankTiedWith: [ninth] };
    ranked[8] = { ...ninth, rankTiedWith: [eighth] };
  }
  return ranked;
}

// Build a Round of 32 → Final bracket from the current standings.
// R32 shows actual teams. R16+ shows empty slots (TBD).
export function buildBracket(standings, thirds) {
  const byGroup = Object.fromEntries(standings.map((g) => [g.name, g.teams]));
  // Group winner. If it's tied (points AND GD) with any team(s) below — up to the
  // whole group being level — it's ambiguous who wins, so show all via `tiedWith`.
  const w = (g) => {
    const others = tiedSet(byGroup[g], 0);
    return others ? { ...byGroup[g][0], tiedWith: others } : byGroup[g][0];
  };
  // Runner-up. If tied (points AND GD) with any other team(s) in the group, it's
  // ambiguous who finishes 2nd, so show all via `tiedWith`.
  const r = (g) => {
    const others = tiedSet(byGroup[g], 1);
    return others ? { ...byGroup[g][1], tiedWith: others } : byGroup[g][1];
  };

  // A 3rd-place slot: collects the 3rd-place finishers from each eligible group
  // that are still in contention — the top 8, plus the 9th when it's tied with
  // the 8th (carries `rankTiedWith`) and so could still sneak in. Rendered as
  // flags only.
  const thirdSlot = (groupList) => ({
    thirdSlot: true,
    groups: groupList,
    teams: groupList
      .map((gName) => thirds.find((t) => t.group === gName))
      .filter((t) => t && (t.qualified || t.rankTiedWith)),
  });

  // FIFA World Cup 2026 Round of 32, ordered top-to-bottom to match the official
  // bracket layout: left side (matches 1-8), then right side (matches 9-16).
  const r32 = [
    // Left side (top → bottom)
    [w("E"), thirdSlot(["A","B","C","D","F"])], // 1E vs 3ABCDF
    [w("I"), thirdSlot(["C","D","F","G","H"])], // 1I vs 3CDFGH
    [r("A"), r("B")],                           // 2A vs 2B
    [w("F"), r("C")],                           // 1F vs 2C
    [r("K"), r("L")],                           // 2K vs 2L
    [w("H"), r("J")],                           // 1H vs 2J
    [w("D"), thirdSlot(["B","E","F","I","J"])], // 1D vs 3BEFIJ
    [w("G"), thirdSlot(["A","E","H","I","J"])], // 1G vs 3AEHIJ
    // Right side (top → bottom)
    [w("C"), r("F")],                           // 1C vs 2F
    [r("E"), r("I")],                           // 2E vs 2I
    [w("A"), thirdSlot(["C","E","F","H","I"])], // 1A vs 3CEFHI
    [w("L"), thirdSlot(["E","H","I","J","K"])], // 1L vs 3EHIJK
    [w("J"), r("H")],                           // 1J vs 2H
    [r("D"), r("G")],                           // 2D vs 2G
    [w("B"), thirdSlot(["E","F","G","I","J"])], // 1B vs 3EFGIJ
    [w("K"), thirdSlot(["D","E","I","J","L"])], // 1K vs 3DEIJL
  ];

  // R16 and onwards show empty slots (TBD).
  const roundOf16 = [
    [null, null],
    [null, null],
    [null, null],
    [null, null],
    [null, null],
    [null, null],
    [null, null],
    [null, null],
  ];

  const quarters = [
    [null, null],
    [null, null],
    [null, null],
    [null, null],
  ];

  const semis = [
    [null, null],
    [null, null],
  ];

  const final = [null, null];

  return { r32, roundOf16, quarters, semis, final };
}
