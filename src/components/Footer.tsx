import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-white border-t-4 border-black px-8 py-12 flex flex-col md:flex-row justify-between items-center gap-6 mt-auto">
      <span className="text-xl font-black font-heading uppercase">Psiconnect</span>
      <nav className="flex flex-wrap justify-center gap-6 font-heading font-bold text-sm uppercase">
        <Link to="/" className="hover:line-through opacity-80 hover:opacity-100">Início</Link>
        <Link to="/psicologos" className="hover:line-through opacity-80 hover:opacity-100">Psicólogos</Link>
        <Link to="/login" className="hover:line-through opacity-80 hover:opacity-100">Entrar</Link>
        <Link to="/cadastro" className="hover:line-through opacity-80 hover:opacity-100">Cadastrar</Link>
      </nav>
      <span className="font-heading text-xs font-bold uppercase opacity-50">
        © {new Date().getFullYear()} Psiconnect
      </span>
    </footer>
  )
}
