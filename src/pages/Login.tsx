import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BrutalistCard from '../components/BrutalistCard'
import BrutalistButton from '../components/BrutalistButton'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      const { data } = await api.post('/api/auth/login', { email, senha })
      login(data)
      navigate(data.papel === 'psicologo' ? '/dashboard' : '/minha-conta')
    } catch {
      setErro('Email ou senha incorretos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <BrutalistCard className="w-full max-w-md flex flex-col gap-8">
        <header className="text-center">
          <h1 className="text-4xl font-black font-heading uppercase">Entrar</h1>
          <p className="text-gray-500 font-medium mt-2">Acesse sua conta Psiconnect</p>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-heading font-black text-[10px] uppercase tracking-widest opacity-60">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full bg-brand-gray brutalist-border rounded-xl p-4 font-bold focus:outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-heading font-black text-[10px] uppercase tracking-widest opacity-60">Senha</label>
            <input type="password" required value={senha} onChange={e => setSenha(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-brand-gray brutalist-border rounded-xl p-4 font-bold focus:outline-none" />
          </div>
          {erro && <p className="text-red-600 font-bold text-sm">{erro}</p>}
          <BrutalistButton type="submit" disabled={loading} className="w-full mt-2">
            {loading ? 'Entrando...' : 'Entrar'}
          </BrutalistButton>
        </form>

        <p className="text-center text-sm font-medium">
          Não tem conta?{' '}
          <Link to="/cadastro" className="font-bold underline underline-offset-4">Cadastre-se</Link>
        </p>
      </BrutalistCard>
    </div>
  )
}
