import axios from 'axios'
import toast from 'react-hot-toast'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
})

apiClient.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.params || '')
    }
    return config
  },
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status  = error.response?.status
    const message = error.response?.data?.message || error.message
    if (!error.response) {
      toast.error('Cannot reach the server. Is the backend running?')
    } else if (status === 503) {
      toast.error('AI service unavailable. Please try again.')
    } else if (status >= 500) {
      toast.error(`Server error (${status}): ${message}`)
    }
    return Promise.reject(error)
  }
)

export async function fetchSeasons() {
  const res  = await apiClient.get('/api/seasons')
  const data = res.data.data
  if (Array.isArray(data) && typeof data[0] === 'number') {
    return data.map(s => ({ season: s }))
  }
  return data
}

export async function fetchRaces(season) {
  const res = await apiClient.get('/api/races', { params: { season } })
  return res.data.data
}

export async function fetchRaceData(season, round) {
  const res = await apiClient.get('/api/race-data', { params: { season, round } })
  const d   = res.data.data

  const results = d.results || []
  const winner  = results[0]
  const fastLap = results.find(r => r.fastestLap?.rank === 1)

  // 1. Finished — completed full race distance
  const finished = results.filter(r =>
    r.status === 'Finished'
  )

  // 2. Lapped — completed race but one or more laps behind leader
  const lapped = results.filter(r =>
    r.status.startsWith('+')
  )

  // 3. Disqualified — completed race but removed by stewards
  const dsq = results.filter(r =>
    r.status === 'Disqualified'
  )

  // 4. Did Not Start — never left the grid
  const dns = results.filter(r =>
    r.status === 'Did not start' ||
    r.status === 'DNS'           ||
    r.status === 'Withdrew'      ||
    r.status === 'Not arrived'   ||
    r.status === 'Excluded'
  )

  // 5. Not Classified — drove some laps but less than 90% race distance
  const nc = results.filter(r =>
    r.status === 'Not classified' ||
    r.status === 'NC'
  )

  // 6. DNF — everything else (mechanical, accident, collision etc.)
  const dnf = results.filter(r =>
    r.status !== 'Finished'       &&
    !r.status.startsWith('+')     &&
    r.status !== 'Disqualified'   &&
    r.status !== 'Did not start'  &&
    r.status !== 'DNS'            &&
    r.status !== 'Withdrew'       &&
    r.status !== 'Not arrived'    &&
    r.status !== 'Excluded'       &&
    r.status !== 'Not classified' &&
    r.status !== 'NC'
  )

  const categoryTotal =
    finished.length + lapped.length + dsq.length +
    dns.length + nc.length + dnf.length

  if (categoryTotal !== results.length) {
    console.warn(
      `[Classification] Category total (${categoryTotal}) does not match ` +
      `results total (${results.length}) for ${d.season}/${d.round}.`
    )
  }

  return {
    season:            d.season,
    round:             d.round,
    raceName:          d.raceName,
    raceDate:          d.date,
    circuitName:       d.circuit,
    country:           d.country,
    winnerName:        winner?.driverName        || '–',
    winnerConstructor: winner?.team              || '–',
    winnerTime:        winner?.time              || '–',
    fastestLapHolder:  fastLap?.driverName       || '–',
    fastestLapTime:    fastLap?.fastestLap?.time || '–',

    retirements:         dnf.length,
    disqualified:        dsq.length,
    didNotStart:         dns.length,
    notClassified:       nc.length,
    classifiedFinishers: finished.length + lapped.length,
    totalDrivers:        results.length,

    podium: results.slice(0, 3).map(r => ({
      position:        r.position,
      driverName:      r.driverName,
      driverCode:      r.driverCode,
      constructorName: r.team,
      time:            r.position === 1
                         ? r.time
                         : (r.time?.startsWith('+') ? r.time : r.time ? `+${r.time}` : null),
      points:          r.points,
    })),

    results: results.map(r => ({
      position:        r.position,
      positionText:    r.positionText,
      driverCode:      r.driverCode,
      driverName:      r.driverName,
      constructorName: r.team,
      gridPosition:    r.gridPosition,
      status:          r.status,
      points:          r.points,
      fastestLap:      r.fastestLap,
      time:            r.time,
    })),

    lapData:         d.lapPositions || {},
    driverStandings: (d.standings || []).map(s => ({
      position:        s.position,
      driverName:      s.driverName,
      driverCode:      s.driverCode,
      constructorName: s.team,
      points:          s.points,
      wins:            s.wins,
    })),
  }
}

export async function generateReport(season, round, forceRegenerate = false) {
  const res = await apiClient.post('/api/generate-report', {
    season,
    round,
    regenerate: forceRegenerate,
  })
  const d = res.data.data
  return {
    id:            d.id,
    season:        d.season,
    round:         d.round,
    raceName:      d.race_name,
    reportContent: d.content,
    modelUsed:     d.model_used,
    generatedAt:   d.created_at,
  }
}

export async function fetchRecentReports() {
  const res = await apiClient.get('/api/reports')
  return (res.data.data || []).map(d => ({
    id:            d.id,
    season:        d.season,
    round:         d.round,
    raceName:      d.race_name,
    reportContent: d.content,
    modelUsed:     d.model_used,
    generatedAt:   d.created_at,
  }))
}

export async function downloadPdf(season, round, filename = 'f1-race-report.pdf') {
  const response = await apiClient.get(
    `/api/reports/${season}/${round}/pdf`,
    { responseType: 'blob', timeout: 30000 }
  )

  const url  = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href  = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.parentNode.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export default apiClient