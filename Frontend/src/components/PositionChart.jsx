import { getChartColor, getTeamColor } from '../utils/helpers.js'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

export default function PositionChart({ lapData }) {
  if (!lapData || Object.keys(lapData).length === 0) return null

  const driverIds  = Object.keys(lapData)
  const maxLap     = Math.max(...driverIds.flatMap(id => lapData[id].map(l => l.lap)))
  const chartData  = []

  for (let lap = 1; lap <= maxLap; lap++) {
    const point = { lap }
    driverIds.forEach(id => {
      const entry = lapData[id].find(l => l.lap === lap)
      if (entry) point[id] = entry.position
    })
    chartData.push(point)
  }

  // Only show top 10 drivers (less cluttered)
  const top10 = driverIds.slice(0, 10)

  return (
    <div className="f1-card">
      <h2 className="section-heading">Lap by Lap Positions</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(56,56,63,0.5)" />
          <XAxis dataKey="lap" tick={{ fill: '#9ca3af', fontSize: 11 }} label={{ value: 'Lap', position: 'insideBottom', fill: '#9ca3af', fontSize: 11 }} />
          <YAxis reversed domain={[1, 20]} tick={{ fill: '#9ca3af', fontSize: 11 }} label={{ value: 'Position', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: '#15151E', border: '1px solid #38383F', borderRadius: 8 }}
            labelStyle={{ color: '#fff', fontWeight: 600 }}
            itemStyle={{ color: '#d1d5db', fontSize: 11 }}
            labelFormatter={(v) => `Lap ${v}`}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {top10.map((id, i) => (
            <Line
              key={id}
              type="monotone"
              dataKey={id}
              stroke={getChartColor(i)}
              dot={false}
              strokeWidth={2}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}