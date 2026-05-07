import { AlertCircle, RefreshCw, Inbox } from 'lucide-react'

export function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-10 h-10 border-2 border-f1-gray border-t-f1-red rounded-full animate-spin" />
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  )
}

export function InlineLoader({ message = 'Loading...' }) {
  return (
    <div className="flex items-center gap-2 text-gray-500 text-sm py-2">
      <div className="w-4 h-4 border-2 border-f1-gray border-t-f1-red rounded-full animate-spin" />
      {message}
    </div>
  )
}

export function ErrorCard({ message, onRetry }) {
  return (
    <div className="f1-card border-red-800/50 bg-red-950/20">
      <div className="flex items-start gap-3">
        <AlertCircle size={20} className="text-red-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-red-400 font-semibold text-sm">Something went wrong</p>
          <p className="text-gray-400 text-sm mt-1">{message}</p>
          {onRetry && (
            <button onClick={onRetry} className="btn-secondary text-sm py-2 mt-3">
              <RefreshCw size={14} /> Try again
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
      <div className="w-16 h-16 rounded-full bg-f1-dark border border-f1-gray flex items-center justify-center">
        <Icon size={28} className="text-gray-600" />
      </div>
      <div>
        <p className="text-white font-semibold">{title}</p>
        {description && <p className="text-gray-500 text-sm mt-1 max-w-sm">{description}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export function StatBox({ label, value, subValue, accent }) {
  return (
    <div className={`f1-card p-4 ${accent ? 'border-f1-red/30' : ''}`}>
      <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
      <p className={`font-bold text-lg ${accent ? 'text-f1-red' : 'text-white'}`}>{value}</p>
      {subValue && <p className="text-gray-500 text-xs mt-0.5">{subValue}</p>}
    </div>
  )
}