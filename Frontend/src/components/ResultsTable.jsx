import { getTeamColor, formatStatus } from '../utils/helpers.js'

export default function ResultsTable({ results }) {
  if (!results?.length) return null

  return (
    <div className="f1-card p-0 overflow-hidden">
      <div className="px-6 pt-6 pb-3 border-b border-f1-gray">
        <h2 className="section-heading mb-0">Full Results</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-f1-gray">
              {['POS','DRIVER','TEAM','GRID','STATUS','PTS','FAST LAP'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 font-semibold uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map(r => {
              const { label, colorClass } = formatStatus(r.status)
              const teamColor = getTeamColor(r.constructorName)
              const posBg = r.position === 1 ? 'rgba(255,215,0,0.15)'
                          : r.position === 2 ? 'rgba(192,192,192,0.15)'
                          : r.position === 3 ? 'rgba(205,127,50,0.15)'
                          : 'transparent'
              return (
                <tr key={r.driverCode} className="border-b border-f1-gray/30 hover:bg-white/5 transition-colors">
<td className="px-4 py-3">
                    <span
                      className="inline-flex items-center justify-center w-7 h-7 rounded-md text-xs font-bold"
                      style={{
                        background: posBg,
                        color: r.position <= 3 ? '#fff' : '#9ca3af'
                      }}
                    >
                      {/* Use positionText for non-finishers (R, D, N)
                          Use numeric position for finishers */}
                      {r.position != null ? r.position : (r.positionText || '–')}
                    </span>
                  </td>
                  
                  <td className="px-4 py-3">
                    <span className="font-bold text-sm" style={{ color: teamColor }}>
                      {r.driverCode}
                    </span>
                    <span className="text-gray-300 ml-2">{r.driverName}</span>
                  </td>
                  <td className="px-4 py-3" style={{ color: teamColor }}>{r.constructorName}</td>
                  <td className="px-4 py-3 text-gray-400">{r.gridPosition}</td>
                  <td className={`px-4 py-3 font-medium ${colorClass}`}>{label}</td>
                  <td className="px-4 py-3 text-yellow-400 font-bold">{r.points}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                    {r.fastestLap?.time || '–'}
                    {r.fastestLap?.rank === 1 && (
                      <span className="ml-1 text-purple-400 text-xs">⚡</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}