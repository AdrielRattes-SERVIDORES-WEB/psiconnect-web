import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <header className="bg-white border-b-2 border-black sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-black font-heading uppercase tracking-tighter">
          Psiconnect
        </Link>

        <nav className="hidden md:flex gap-4">
          <Link to="/" className="font-heading font-bold px-4 py-1 rounded-full hover:bg-black hover:text-white transition-all">
            Início
          </Link>
          <Link to="/psicologos" className="font-heading font-bold px-4 py-1 rounded-full hover:bg-black hover:text-white transition-all">
            Psicólogos
          </Link>
        </nav>

        {user ? (
          <div className="flex items-center gap-4">
            <Link
              to={user.papel === 'psicologo' ? '/dashboard' : '/minha-conta'}
              className="font-heading font-bold text-sm bg-black text-white px-6 py-2 rounded-full border-2 border-black hover:bg-white hover:text-black transition-all"
            >
              {user.papel === 'psicologo' ? 'Dashboard' : 'Minha Conta'}
            </Link>
            <button onClick={logout} className="text-xs font-bold uppercase underline underline-offset-4 opacity-50 hover:opacity-100">
              Sair
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="font-heading font-bold text-sm bg-black text-white px-6 py-2 rounded-full border-2 border-black hover:bg-white hover:text-black transition-all"
          >
            Entrar
          </Link>
        )}
      </div>
    </header>
  )
}
