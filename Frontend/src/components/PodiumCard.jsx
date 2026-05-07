import { getTeamColor } from '../utils/helpers.js'

export default function PodiumCard({ podium }) {
  if (!podium?.length) return null

  const [p1, p2, p3] = podium
  const heights = ['h-36', 'h-28', 'h-24']
  const order   = [p2, p1, p3]
  const orderIdx = [1, 0, 2]

  function formatTime(driver, origIdx) {
    if (origIdx === 0) return driver?.time || '–'
    if (!driver?.time) return '–'
    // Strip all leading + signs then add exactly one
    return driver.time.replace(/^\+*/, '+')
  }

  return (
    <div className="f1-card">
      <h2 className="section-heading">Podium</h2>
      <div className="flex items-end justify-center gap-4 pt-4 pb-2">
        {order.map((driver, i) => {
          const origIdx = orderIdx[i]
          const color   = getTeamColor(driver?.constructorName)
          return (
            <div key={driver?.driverCode} className="flex flex-col items-center gap-2 w-40">
              <div className="text-3xl">
                {origIdx === 0 ? '🥇' : origIdx === 1 ? '🥈' : '🥉'}
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-sm">{driver?.driverName}</p>
                <p className="text-xs mt-0.5" style={{ color }}>{driver?.constructorName}</p>
                <p className="text-gray-400 text-xs mt-1 font-mono">
                  {formatTime(driver, origIdx)}
                </p>
                <p className="text-yellow-400 text-xs font-bold mt-0.5">{driver?.points} pts</p>
              </div>
              <div
                className={`w-full ${heights[origIdx]} rounded-t-lg flex items-end justify-center pb-2`}
                style={{ background: `${color}22`, border: `1px solid ${color}44` }}
              >
                <span className="text-2xl font-black" style={{ color }}>
                  P{origIdx + 1}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}