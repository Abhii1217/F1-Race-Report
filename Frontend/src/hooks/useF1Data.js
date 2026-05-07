import { useState, useEffect, useCallback } from 'react'
import {
  fetchSeasons, fetchRaces, fetchRaceData,
  generateReport, fetchRecentReports,
} from '../services/api.js'

function useAsyncData(asyncFn, deps = [], enabled = true) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const execute = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    setError(null)
    try {
      const result = await asyncFn()
      setData(result)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [enabled, ...deps])

  useEffect(() => { execute() }, [execute])

  return { data, loading, error, refetch: execute }
}

export function useSeasons() {
  const { data, loading, error, refetch } = useAsyncData(() => fetchSeasons(), [])
  return { seasons: data, loading, error, refetch }
}

export function useRaces(season) {
  const { data, loading, error, refetch } = useAsyncData(
    () => fetchRaces(season), [season], !!season
  )
  return { races: data, loading, error, refetch }
}

export function useRaceData(season, round) {
  const { data, loading, error, refetch } = useAsyncData(
    () => fetchRaceData(season, round), [season, round], !!(season && round)
  )
  return { raceData: data, loading, error, refetch }
}

export function useGenerateReport() {
  const [report,  setReport]  = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const generate = useCallback(async (season, round, forceRegenerate = false) => {
    setLoading(true)
    setError(null)
    try {
      const result = await generateReport(season, round, forceRegenerate)
      setReport(result)
      return result
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Report generation failed'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => { setReport(null); setError(null) }, [])
  return { report, loading, error, generate, reset }
}

export function useRecentReports() {
  const { data, loading, error, refetch } = useAsyncData(() => fetchRecentReports(), [])
  return { reports: data, loading, error, refetch }
}