import { useSearchParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, RefreshCw, Sparkles, Calendar, MapPin } from 'lucide-react'
import { useRaceData, useGenerateReport } from '../hooks/useF1Data.js'
import { downloadPdf } from '../services/api.js'
import PodiumCard from '../components/PodiumCard.jsx'
import ResultsTable from '../components/ResultsTable.jsx'
import PositionChart from '../components/PositionChart.jsx'
import StandingsChart from '../components/StandingsChart.jsx'
import AIReportSection from '../components/AIReportSection.jsx'
import { LoadingSpinner, ErrorCard, StatBox } from '../components/ui/StateComponents.jsx'
import { formatRaceDate } from '../utils/helpers.js'
import toast from 'react-hot-toast'

export default function ResultsPage() {
  const [searchParams] = useSearchParams()
  const navigate       = useNavigate()
  const season         = Number(searchParams.get('season'))
  const round          = Number(searchParams.get('round'))

  const { raceData, loading, error, refetch }                            = useRaceData(season, round)
  const { report, loading: reportLoading, error: reportError, generate } = useGenerateReport()

  if (!season || !round) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20">
        <ErrorCard message="No race selected. Please go back and select a season and race." />
        <button className="btn-primary mt-4" onClick={() => navigate('/')}>
          <ArrowLeft size={16} /> Back to Home
        </button>
      </div>
    )
  }

  if (loading) return <LoadingSpinner message="Fetching race data..." />
  if (error)   return (
    <div className="max-w-2xl mx-auto px-4 py-20">
      <ErrorCard message={error} onRetry={refetch} />
    </div>
  )
  if (!raceData) return null

  async function handleGenerateReport(force = false) {
    try {
      await generate(season, round, force)
      toast.success('AI report generated!')
    } catch {
      toast.error(reportError || 'Report generation failed')
    }
  }

  async function handleDownloadPdf() {
    if (!report) return
    try {
      const toastId = toast.loading('Generating PDF...')
      await downloadPdf(season, round, `f1-report-${season}-R${round}.pdf`)
      toast.dismiss(toastId)
      toast.success('PDF downloaded!')
    } catch {
      toast.error('PDF download failed')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <button className="btn-secondary text-sm py-2 mb-3" onClick={() => navigate('/')}>
            <ArrowLeft size={14} /> Back
          </button>
          <h1 className="text-3xl font-black text-white">{raceData.raceName}</h1>
          <div className="flex items-center gap-4 mt-2 text-gray-400 text-sm flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar size={13} /> {formatRaceDate(raceData.raceDate)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={13} /> {raceData.circuitName}, {raceData.country}
            </span>
            <span className="bg-f1-red/20 text-f1-red border border-f1-red/30 px-2 py-0.5 rounded text-xs font-semibold">
              Season {raceData.season} · Round {raceData.round}
            </span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {!report ? (
            <button className="btn-primary" onClick={() => handleGenerateReport(false)} disabled={reportLoading}>
              {reportLoading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</>
                : <><Sparkles size={16} /> Generate AI Report</>
              }
            </button>
          ) : (
            <>
              <button className="btn-secondary text-sm py-2" onClick={() => handleGenerateReport(true)} disabled={reportLoading}>
                <RefreshCw size={14} /> Regenerate
              </button>
              <button className="btn-primary text-sm py-2" onClick={handleDownloadPdf}>
                <Download size={14} /> Export PDF
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatBox
          label="Winner"
          value={raceData.winnerName}
          subValue={raceData.winnerConstructor}
          accent
        />
        <StatBox
          label="Race Time"
          value={raceData.winnerTime || '–'}
          subValue={`${raceData.classifiedFinishers} of ${raceData.totalDrivers} classified`}
        />
        <StatBox
          label="Fastest Lap"
          value={raceData.fastestLapHolder || '–'}
          subValue={raceData.fastestLapTime}
        />
        <StatBox
          label="Non-Finishers"
          value={`${raceData.retirements} DNF`}
          subValue={[
            raceData.disqualified  > 0 ? `${raceData.disqualified} DSQ` : null,
            raceData.didNotStart   > 0 ? `${raceData.didNotStart} DNS`  : null,
            raceData.notClassified > 0 ? `${raceData.notClassified} NC` : null,
          ].filter(Boolean).join(' · ') || `${raceData.classifiedFinishers} classified`}
        />
      </div>

      <div className="space-y-8">
        <PodiumCard podium={raceData.podium} />
        <PositionChart lapData={raceData.lapData} />
        <ResultsTable results={raceData.results} />
        {raceData.driverStandings?.length > 0 && (
          <StandingsChart standings={raceData.driverStandings} season={raceData.season} round={raceData.round} />
        )}
        <AIReportSection
          report={report}
          loading={reportLoading}
          error={reportError}
          onGenerate={() => handleGenerateReport(false)}
          onRegenerate={() => handleGenerateReport(true)}
          onDownload={handleDownloadPdf}
        />
      </div>
    </div>
  )
}