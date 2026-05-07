import { Outlet, NavLink } from 'react-router-dom'
import { Flag, FileText } from 'lucide-react'

export default function Layout() {
  return (
    <div className="min-h-screen bg-f1-darker">
      <nav className="bg-f1-dark border-b border-f1-gray sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <NavLink to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-f1-red rounded flex items-center justify-center">
                <Flag size={16} className="text-white" />
              </div>
              <span className="font-black text-white text-lg tracking-tight">
                F1 <span className="text-f1-red">REPORT</span>
              </span>
            </NavLink>
            <div className="flex items-center gap-6">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${isActive ? 'text-f1-red' : 'text-gray-400 hover:text-white'}`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/reports"
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors flex items-center gap-1 ${isActive ? 'text-f1-red' : 'text-gray-400 hover:text-white'}`
                }
              >
                <FileText size={14} /> Reports
              </NavLink>
            </div>
          </div>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  )
}