import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import BrutalistCard from '../components/BrutalistCard'
import BrutalistButton from '../components/BrutalistButton'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'

export default function Cadastro() {
  const [params] = useSearchParams()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [papel, setPapel] = useState(params.get('papel') || 'paciente')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      const { data } = await api.post('/api/auth/cadastrar', { nome, email, senha, papel })
      login(data)
      navigate(papel === 'psicologo' ? '/dashboard' : '/minha-conta')
    } catch (err: any) {
      setErro(err.response?.data?.message || 'Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <BrutalistCard className="w-full max-w-md flex flex-col gap-8">
        <header className="text-center">
          <h1 className="text-4xl font-black font-heading uppercase">Criar Conta</h1>
          <p className="text-gray-500 font-medium mt-2">Junte-se ao Psiconnect</p>
        </header>

        {/* Toggle papel */}
        <div className="flex bg-brand-gray brutalist-border rounded-full p-1">
          {['paciente', 'psicologo'].map((p) => (
            <button key={p} onClick={() => setPapel(p)}
              className={`flex-1 py-2 rounded-full font-heading font-bold text-sm uppercase transition-all ${papel === p ? 'bg-black text-white' : 'text-black'}`}>
              {p === 'paciente' ? 'Paciente' : 'Psicólogo'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-heading font-black text-[10px] uppercase tracking-widest opacity-60">Nome completo</label>
            <input type="text" required value={nome} onChange={e => setNome(e.target.value)}
              placeholder="Seu nome"
              className="w-full bg-brand-gray brutalist-border rounded-xl p-4 font-bold focus:outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-heading font-black text-[10px] uppercase tracking-widest opacity-60">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full bg-brand-gray brutalist-border rounded-xl p-4 font-bold focus:outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-heading font-black text-[10px] uppercase tracking-widest opacity-60">Senha</label>
            <input type="password" required value={senha} onChange={e => setSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full bg-brand-gray brutalist-border rounded-xl p-4 font-bold focus:outline-none" />
          </div>
          {erro && <p className="text-red-600 font-bold text-sm">{erro}</p>}
          <BrutalistButton type="submit" disabled={loading} className="w-full mt-2">
            {loading ? 'Criando...' : 'Criar Conta'}
          </BrutalistButton>
        </form>

        <p className="text-center text-sm font-medium">
          Já tem conta?{' '}
          <Link to="/login" className="font-bold underline underline-offset-4">Entrar</Link>
        </p>
      </BrutalistCard>
    </div>
  )
}
