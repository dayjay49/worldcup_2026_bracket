import { useState } from "react";

// Derive an ISO country code from a flag emoji's regional-indicator codepoints
// (e.g. 🇲🇽 -> "mx"); subdivision flags like England use an explicit `code`.
export function isoCode(team) {
  if (!team) return null;
  if (team.code) return team.code;
  const cps = Array.from(team.flag || "").map((c) => c.codePointAt(0));
  if (
    cps.length === 2 &&
    cps[0] >= 0x1f1e6 && cps[0] <= 0x1f1ff &&
    cps[1] >= 0x1f1e6 && cps[1] <= 0x1f1ff
  ) {
    return (
      String.fromCharCode(cps[0] - 0x1f1e6 + 97) +
      String.fromCharCode(cps[1] - 0x1f1e6 + 97)
    );
  }
  return null;
}

// Render a flag as an image (real flags on Windows, where emoji don't render),
// falling back to the emoji glyph if the image can't load.
export default function Flag({ team }) {
  const [failed, setFailed] = useState(false);
  const code = isoCode(team);
  if (code && !failed) {
    return (
      <img
        className="flag"
        src={`https://flagcdn.com/${code}.svg`}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
      />
    );
  }
  return <span className="flag">{team?.flag}</span>;
}
