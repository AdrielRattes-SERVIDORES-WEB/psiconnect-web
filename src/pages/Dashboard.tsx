import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BrutalistCard from '../components/BrutalistCard'
import BrutalistButton from '../components/BrutalistButton'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'

interface Agendamento {
  id: string; pacienteNome?: string; pacienteEmail?: string
  dataHora: string; status: string; modalidade: string
  linkSessao?: string; observacoes?: string
}

const STATUS: Record<string, { label: string; cor: string }> = {
  pendente:   { label: 'Pendente',   cor: 'bg-yellow-100 text-yellow-800 border-yellow-400' },
  confirmado: { label: 'Confirmado', cor: 'bg-green-100 text-green-800 border-green-400' },
  cancelado:  { label: 'Cancelado',  cor: 'bg-red-100 text-red-800 border-red-400' },
  concluido:  { label: 'Concluído',  cor: 'bg-gray-200 text-gray-600 border-gray-300' },
}

function fmtData(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
    + ' · ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [lista, setLista] = useState<Agendamento[]>([])
  const [loading, setLoading] = useState(true)
  const [ativo, setAtivo] = useState<string | null>(null)
  const [aba, setAba] = useState<'pendentes'|'confirmados'|'historico'>('pendentes')

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    if (user.papel !== 'psicologo') { navigate('/minha-conta'); return }
    api.get('/api/agendamentos/minha-agenda')
      .then(r => setLista(r.data))
      .finally(() => setLoading(false))
  }, [user])

  const atualizar = async (id: string, status: string) => {
    setAtivo(id)
    await api.patch(`/api/agendamentos/${id}/status`, { status })
    setLista(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    setAtivo(null)
  }

  const pendentes   = lista.filter(a => a.status === 'pendente')
  const confirmados = lista.filter(a => a.status === 'confirmado')
  const historico   = lista.filter(a => ['cancelado','concluido'].includes(a.status))

  const abas = [
    { id: 'pendentes',   label: `Pendentes (${pendentes.length})` },
    { id: 'confirmados', label: `Confirmados (${confirmados.length})` },
    { id: 'historico',   label: `Histórico (${historico.length})` },
  ] as const

  const atual = aba === 'pendentes' ? pendentes : aba === 'confirmados' ? confirmados : historico

  if (!user) return null

  return (
    <div className="flex-1 bg-brand-gray">
      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-8">

        {/* HEADER */}
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-black font-heading uppercase">Minha Agenda</h1>
            <p className="text-gray-500 font-medium mt-1">Bem-vindo, {user.nome}</p>
          </div>
          <div className="flex gap-3 items-center">
            <a href="/p/dr-teste-silva" target="_blank"
              className="font-heading font-bold text-sm border-2 border-black px-5 py-2 rounded-full hover:bg-black hover:text-white transition-all">
              Ver minha página →
            </a>
            <button onClick={logout} className="text-xs font-bold uppercase underline underline-offset-4 opacity-50 hover:opacity-100">
              Sair
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Pendentes', val: pendentes.length, cor: pendentes.length > 0 ? 'text-yellow-500' : '' },
            { label: 'Confirmados', val: confirmados.length, cor: 'text-green-600' },
            { label: 'Total', val: lista.length, cor: '' },
          ].map(s => (
            <BrutalistCard key={s.label} padding="p-5" className="flex flex-col gap-1">
              <span className="text-xs font-bold font-heading uppercase opacity-60">{s.label}</span>
              <div className={`text-4xl font-black font-heading ${s.cor}`}>
                {String(s.val).padStart(2, '0')}
              </div>
            </BrutalistCard>
          ))}
        </div>

        {/* ABAS */}
        <div className="flex gap-2 border-b-2 border-black pb-0">
          {abas.map(a => (
            <button key={a.id} onClick={() => setAba(a.id)}
              className={`font-heading font-bold text-sm uppercase px-5 py-2 border-2 rounded-t-xl transition-all
                ${aba === a.id ? 'bg-black text-white border-black' : 'border-transparent hover:border-black'}`}>
              {a.label}
            </button>
          ))}
        </div>

        {/* LISTA */}
        {loading && <p className="font-bold animate-pulse">Carregando...</p>}

        {!loading && atual.length === 0 && (
          <BrutalistCard className="text-center py-14">
            <p className="font-bold uppercase text-gray-400 text-sm">Nenhum agendamento aqui</p>
          </BrutalistCard>
        )}

        {atual.map(ag => (
          <BrutalistCard key={ag.id} padding="p-6" className="flex flex-col md:flex-row gap-5 justify-between">
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`text-xs font-black font-heading uppercase px-3 py-1 rounded-full border-2 ${STATUS[ag.status].cor}`}>
                  {STATUS[ag.status].label}
                </span>
                <span className="font-bold text-sm capitalize text-gray-600">{ag.modalidade}</span>
              </div>
              <p className="font-black font-heading text-2xl">{ag.pacienteNome || '—'}</p>
              {ag.pacienteEmail && (
                <p className="text-sm text-gray-500 font-medium">{ag.pacienteEmail}</p>
              )}
              <p className="font-bold text-sm capitalize">{fmtData(ag.dataHora)}</p>
              {ag.observacoes && (
                <p className="text-sm text-gray-500 italic border-l-2 border-gray-300 pl-3">"{ag.observacoes}"</p>
              )}
            </div>

            {ag.status === 'pendente' && (
              <div className="flex md:flex-col gap-2 shrink-0">
                <BrutalistButton onClick={() => atualizar(ag.id, 'confirmado')} disabled={ativo === ag.id}
                  className="flex-1 md:flex-none text-sm py-2 px-5">
                  {ativo === ag.id ? '...' : '✓ Confirmar'}
                </BrutalistButton>
                <BrutalistButton variant="secondary" onClick={() => atualizar(ag.id, 'cancelado')} disabled={ativo === ag.id}
                  className="flex-1 md:flex-none text-sm py-2 px-5">
                  ✗ Recusar
                </BrutalistButton>
              </div>
            )}

            {ag.status === 'confirmado' && (
              <div className="flex md:flex-col gap-2 shrink-0">
                <BrutalistButton variant="secondary" onClick={() => atualizar(ag.id, 'concluido')} disabled={ativo === ag.id}
                  className="text-sm py-2 px-5">
                  Marcar concluído
                </BrutalistButton>
              </div>
            )}
          </BrutalistCard>
        ))}
      </div>
    </div>
  )
}
