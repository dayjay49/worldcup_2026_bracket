import { Fragment } from "react";
import { points, goalDiff } from "../data.js";
import Flag from "./Flag.jsx";

function GoalDiff({ team }) {
  const gd = goalDiff(team);
  const cls = gd > 0 ? "gd-pos" : gd < 0 ? "gd-neg" : "";
  return <span className={cls}>{gd > 0 ? `+${gd}` : gd}</span>;
}

function GroupCard({ group }) {
  return (
    <div className="group-card">
      <div className="group-head">
        <span>Group {group.name}</span>
        <span>P · W · D · L · GF · GA · GD · Pts</span>
      </div>
      <table>
        <thead>
          <tr>
            <th className="team-col">Team</th>
            <th>P</th>
            <th>W</th>
            <th>D</th>
            <th>L</th>
            <th>GF</th>
            <th>GA</th>
            <th>GD</th>
            <th>Pts</th>
          </tr>
        </thead>
        <tbody>
          {group.teams.map((t) => (
            <tr key={t.name} className={`q-${t.pos}`}>
              <td className="team-col">
                <div className="team-cell">
                  <span className="pos">{t.pos}</span>
                  <Flag team={t} />
                  <span>{t.name}</span>
                </div>
              </td>
              <td>{t.w + t.d + t.l}</td>
              <td>{t.w}</td>
              <td>{t.d}</td>
              <td>{t.l}</td>
              <td>{t.gf}</td>
              <td>{t.ga}</td>
              <td>
                <GoalDiff team={t} />
              </td>
              <td className="pts">{points(t)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function GroupStage({ standings, thirds }) {
  return (
    <div>
      <div className="groups-grid">
        {standings.map((g) => (
          <GroupCard key={g.name} group={g} />
        ))}
      </div>

      <h2 className="section-title">
        Ranking of third-placed teams
        <span className="pill">Top 8 advance</span>
      </h2>

      <div className="thirds">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th className="team-col">Team</th>
              <th>Group</th>
              <th>W</th>
              <th>D</th>
              <th>L</th>
              <th>GF</th>
              <th>GA</th>
              <th>GD</th>
              <th>Pts</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {thirds.map((t) => (
              <tr
                key={t.name}
                className={`${t.qualified ? "" : "out"} ${
                  t.rank === 8 ? "cut" : ""
                }`}
              >
                <td>{t.rank}</td>
                <td className="team-col">
                  <div className="team-cell">
                    <Flag team={t} />
                    <span>{t.name}</span>
                    {[...(t.tiedWith || []), ...(t.rankTiedWith || [])].map(
                      (o, i) => (
                        <Fragment key={i}>
                          <span className="slash">/</span>
                          <Flag team={o} />
                          <span>{o.name}</span>
                        </Fragment>
                      )
                    )}
                  </div>
                </td>
                <td>{t.group}</td>
                <td>{t.w}</td>
                <td>{t.d}</td>
                <td>{t.l}</td>
                <td>{t.gf}</td>
                <td>{t.ga}</td>
                <td>
                  <GoalDiff team={t} />
                </td>
                <td className="pts">{points(t)}</td>
                <td>
                  {t.qualified ? (
                    <span className="badge-q">Qualified</span>
                  ) : (
                    <span className="badge-out">Out</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
