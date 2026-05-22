import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  LayoutDashboard, CalendarDays, Users, Settings, LogOut, Brain
} from 'lucide-react'

const menu = [
  { path: '/dashboard',          label: 'Visão Geral',  short: 'Geral',    icon: LayoutDashboard },
  { path: '/dashboard/agenda',   label: 'Agenda',       short: 'Agenda',   icon: CalendarDays },
  { path: '/dashboard/pacientes',label: 'Pacientes',    short: 'Pacientes',icon: Users },
  { path: '/dashboard/config',   label: 'Configurações',short: 'Config',   icon: Settings },
]

export default function DashboardSidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <>
      {/* DESKTOP: sidebar fixa esquerda */}
      <nav className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-white border-r-2 border-black flex-col z-50">
        <div className="p-8 border-b-2 border-black cursor-pointer hover:bg-brand-gray transition-colors"
          onClick={() => navigate('/dashboard')}>
          <div className="flex items-center gap-3">
            <div className="bg-black text-white p-1.5 rounded-lg"><Brain size={18} /></div>
            <h2 className="text-xl font-black font-heading uppercase tracking-tighter">Psiconnect</h2>
          </div>
          {user && <p className="text-xs font-bold text-gray-400 uppercase mt-2 truncate">{user.nome}</p>}
        </div>

        <div className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
          {menu.map(item => (
            <Link key={item.path} to={item.path}
              className={`flex items-center gap-4 p-4 rounded-xl font-heading font-bold uppercase text-sm transition-all
                ${location.pathname === item.path ? 'bg-black text-white' : 'hover:bg-brand-gray'}`}>
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </div>

        <div className="p-4 border-t-2 border-black flex flex-col gap-1">
          <button onClick={handleLogout}
            className="flex items-center gap-4 p-4 rounded-xl font-heading font-bold uppercase text-sm text-red-600 hover:bg-black hover:text-white transition-all">
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </nav>

      {/* MOBILE: top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b-2 border-black h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="bg-black text-white p-1 rounded"><Brain size={16} /></div>
          <span className="text-base font-black font-heading uppercase tracking-tighter">Psiconnect</span>
        </div>
        <button onClick={handleLogout} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
          <LogOut size={20} />
        </button>
      </header>

      {/* MOBILE: bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-black">
        <div className="grid grid-cols-4 h-16">
          {menu.map(item => (
            <Link key={item.path} to={item.path}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors
                ${location.pathname === item.path ? 'bg-black text-white' : 'text-gray-500 hover:bg-brand-gray'}`}>
              <item.icon size={18} />
              <span className="text-[9px] font-black font-heading uppercase leading-none">{item.short}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}
