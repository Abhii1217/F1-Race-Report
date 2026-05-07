import { useNavigate } from 'react-router-dom'
import { Flag } from 'lucide-react'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
      <div className="w-20 h-20 rounded-full bg-f1-red/10 border border-f1-red/30 flex items-center justify-center">
        <Flag size={36} className="text-f1-red" />
      </div>
      <div>
        <h1 className="text-6xl font-black text-f1-red">404</h1>
        <p className="text-white font-bold text-xl mt-2">Page Not Found</p>
        <p className="text-gray-500 mt-2">This page doesn't exist or has been moved.</p>
      </div>
      <button className="btn-primary" onClick={() => navigate('/')}>
        ← Back to Home
      </button>
    </div>
  )
}