import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../lib/AuthContext'
import { isDemoMode } from '../lib/firebase'
import toast from 'react-hot-toast'
import {
  LayoutDashboard, Database, CreditCard, BarChart3,
  LogOut, Zap, Menu, X, Moon, Sun, ChevronRight
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/data', icon: Database, label: 'Data Manager' },
  { to: '/payments', icon: CreditCard, label: 'Payments' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
]

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.success('Signed out')
    navigate('/login')
  }

  const toggleDark = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        <motion.aside
          initial={false}
          animate={{ x: sidebarOpen ? 0 : -300 }}
          className="fixed top-0 left-0 h-full w-72 z-30 lg:relative lg:translate-x-0 lg:block glass-dark border-r border-white/5 flex flex-col"
          style={{ transform: undefined }}
        >
          <div className="hidden lg:flex flex-col h-full">
            <SidebarContent user={user} onLogout={handleLogout} darkMode={darkMode} onToggleDark={toggleDark} />
          </div>
          <div className="flex lg:hidden flex-col h-full">
            <SidebarContent user={user} onLogout={handleLogout} darkMode={darkMode} onToggleDark={toggleDark} onClose={() => setSidebarOpen(false)} />
          </div>
        </motion.aside>
      </AnimatePresence>

      {/* Desktop sidebar always visible */}
      <aside className="hidden lg:flex flex-col w-72 glass-dark border-r border-white/5 flex-shrink-0">
        <SidebarContent user={user} onLogout={handleLogout} darkMode={darkMode} onToggleDark={toggleDark} />
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="glass-dark border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden glass rounded-xl p-2.5 hover:bg-white/10 transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-3 ml-auto">
            {isDemoMode && (
              <span className="badge bg-amber-400/10 text-amber-400 border border-amber-400/20">
                Demo Mode
              </span>
            )}
            <button
              onClick={toggleDark}
              className="glass rounded-xl p-2.5 hover:bg-white/10 transition-colors"
            >
              {darkMode ? <Sun className="w-4 h-4 text-zinc-400" /> : <Moon className="w-4 h-4 text-zinc-400" />}
            </button>
            <div className="flex items-center gap-2.5 glass rounded-xl px-3 py-2">
              <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-xs font-display font-bold">
                A
              </div>
              <span className="text-sm text-zinc-300 font-body hidden sm:block">Admin</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6 max-w-7xl mx-auto"
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  )
}

function SidebarContent({ user, onLogout, darkMode, onToggleDark, onClose }) {
  return (
    <div className="flex flex-col h-full p-4">
      {/* Logo */}
      <div className="flex items-center justify-between mb-8 px-2 pt-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 glass rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" strokeWidth={1.5} />
          </div>
          <div>
            <div className="font-display font-bold text-white text-base leading-none">Zargon</div>
            <div className="text-zinc-600 text-xs mt-0.5">Production Tracker</div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-zinc-600 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        <div className="text-zinc-700 text-xs font-display uppercase tracking-widest px-4 mb-3">Menu</div>
        {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
            <span className="flex-1">{label}</span>
            <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="space-y-2 pt-4 border-t border-white/5">
        <div className="glass rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-sm font-display font-bold flex-shrink-0">
            A
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-white text-sm font-medium truncate">Admin</div>
            <div className="text-zinc-600 text-xs truncate">{user?.email}</div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-400/5 transition-all duration-200 text-sm"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  )
}
