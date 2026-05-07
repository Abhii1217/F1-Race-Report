const TEAM_COLORS = {
  'Red Bull':     '#3671C6',
  'Ferrari':      '#E8002D',
  'Mercedes':     '#27F4D2',
  'McLaren':      '#FF8000',
  'Aston Martin': '#358C75',
  'Alpine':       '#FF87BC',
  'Williams':     '#64C4FF',
  'Haas F1 Team': '#B6BABD',
  'Haas':         '#B6BABD',
  'Sauber':       '#52E252',
  'Kick Sauber':  '#52E252',
  'RB':           '#6692FF',
  'Racing Bulls': '#6692FF',
  'AlphaTauri':   '#5E8FAA',
  'Renault':      '#FFF500',
  'default':      '#6B7280',
}

export function getTeamColor(constructorName) {
  if (!constructorName) return TEAM_COLORS.default
  const key = Object.keys(TEAM_COLORS).find(k =>
    constructorName.toLowerCase().includes(k.toLowerCase())
  )
  return key ? TEAM_COLORS[key] : TEAM_COLORS.default
}

export function getPositionColor(position) {
  if (!position) return 'text-red-400'
  if (position === 1) return 'text-yellow-400'
  if (position === 2) return 'text-gray-300'
  if (position === 3) return 'text-orange-400'
  return 'text-white'
}

export function formatStatus(status) {
  if (!status)
    return { label: '–', colorClass: 'text-gray-500', category: 'unknown' }

  // Officially finished — completed full race distance
  if (status === 'Finished')
    return { label: 'FIN', colorClass: 'text-green-400', category: 'finished' }

  // Lapped but classified — completed >90% race distance
  // API returns "+1 Lap", "+2 Laps", "+3 Laps" etc.
  if (status.startsWith('+'))
    return { label: status, colorClass: 'text-yellow-500', category: 'lapped' }

  // Disqualified — completed race but removed by stewards
  if (status === 'Disqualified')
    return { label: 'DSQ', colorClass: 'text-red-500', category: 'dsq' }

  // Did Not Start — never left the grid
  if (
    status === 'Did not start' ||
    status === 'DNS'           ||
    status === 'Withdrew'      ||
    status === 'Not arrived'   ||
    status === 'Excluded'
  )
    return { label: 'DNS', colorClass: 'text-gray-500', category: 'dns' }

  // Not Classified — completed some laps but less than 90% race distance
  if (status === 'Not classified' || status === 'NC')
    return { label: 'NC', colorClass: 'text-orange-400', category: 'nc' }

  return { label: 'DNF', colorClass: 'text-red-400', category: 'dnf' }
}

export function formatRaceDate(dateStr) {
  if (!dateStr) return 'TBC'
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    })
  } catch { return dateStr }
}

export function formatReportTime(isoString) {
  if (!isoString) return ''
  const date    = new Date(isoString)
  const diffHrs = (new Date() - date) / (1000 * 60 * 60)
  if (diffHrs < 1)   return 'Just now'
  if (diffHrs < 24)  return `${Math.floor(diffHrs)}h ago`
  if (diffHrs < 168) return `${Math.floor(diffHrs / 24)}d ago`
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function getChartColor(index) {
  const palette = [
    '#E10600','#3671C6','#27F4D2','#FF8000','#358C75',
    '#FF87BC','#64C4FF','#B6BABD','#52E252','#6692FF',
  ]
  return palette[index % palette.length]
}

export function shortRaceName(raceName) {
  return raceName?.replace('Grand Prix', 'GP') || raceName || ''
}

export function formatPoints(points) {
  if (points == null) return '0'
  return Number.isInteger(points) ? String(points) : points.toFixed(1)
}