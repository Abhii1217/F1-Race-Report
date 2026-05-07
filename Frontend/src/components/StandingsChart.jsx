import { getTeamColor } from '../utils/helpers.js'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

export default function StandingsChart({ standings, season, round }) {
  if (!standings?.length) return null

  const top10 = standings.slice(0, 10)

  return (
    <div className="f1-card">
      <h2 className="section-heading">
        Championship Standings — {season} (After Round {round})
      </h2>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={top10} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(56,56,63,0.5)" />
          <XAxis dataKey="driverCode" tick={{ fill: '#9ca3af', fontSize: 11 }} />
          <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: '#15151E', border: '1px solid #38383F', borderRadius: 8 }}
            labelStyle={{ color: '#fff', fontWeight: 600 }}
            formatter={(value, name) => [`${value} pts`, 'Points']}
          />
          <Bar dataKey="points" radius={[4, 4, 0, 0]}>
            {top10.map((entry, i) => (
              <Cell key={entry.driverCode} fill={getTeamColor(entry.constructorName)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}