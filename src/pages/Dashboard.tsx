import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BrutalistCard from '../components/BrutalistCard'
import BrutalistButton from '../components/BrutalistButton'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'

interface Agendamento {
  id: string
  pacienteNome?: string
  pacienteEmail?: string
  dataHora: string
  status: string
  modalidade: string
  linkSessao?: string
  observacoes?: string
}

const STATUS_LABEL: Record<string, { label: string; cor: string }> = {
  pendente:   { label: 'Pendente',   cor: 'bg-yellow-100 text-yellow-800 border-yellow-400' },
  confirmado: { label: 'Confirmado', cor: 'bg-green-100 text-green-800 border-green-400' },
  cancelado:  { label: 'Cancelado',  cor: 'bg-red-100 text-red-800 border-red-400' },
  concluido:  { label: 'Concluído',  cor: 'bg-gray-100 text-gray-600 border-gray-300' },
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [loading, setLoading] = useState(true)
  const [atualizando, setAtualizando] = useState<string | null>(null)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    if (user.papel !== 'psicologo') { navigate('/minha-conta'); return }
    carregarAgendamentos()
  }, [user])

  const carregarAgendamentos = () => {
    api.get('/api/agendamentos/minha-agenda')
      .then(r => setAgendamentos(r.data))
      .finally(() => setLoading(false))
  }

  const atualizarStatus = async (id: string, status: string) => {
    setAtualizando(id)
    try {
      await api.patch(`/api/agendamentos/${id}/status`, { status })
      setAgendamentos(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    } finally {
      setAtualizando(null)
    }
  }

  const formatData = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
      + ' · ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  const pendentes  = agendamentos.filter(a => a.status === 'pendente')
  const proximos   = agendamentos.filter(a => a.status === 'confirmado' && new Date(a.dataHora) >= new Date())
  const historico  = agendamentos.filter(a => ['cancelado','concluido'].includes(a.status))

  if (!user) return null

  return (
    <div className="flex-1 bg-brand-gray">
      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col gap-10">

        {/* HEADER */}
        <header className="flex justify-between items-end flex-wrap gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black font-heading uppercase">Dashboard</h1>
            <p className="text-xl text-gray-500 font-medium">Bem-vindo, {user.nome}</p>
          </div>
          <button onClick={logout} className="text-xs font-bold uppercase underline underline-offset-4 opacity-50 hover:opacity-100">
            Sair
          </button>
        </header>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BrutalistCard padding="p-5" className="flex flex-col gap-1">
            <span className="text-xs font-bold font-heading uppercase opacity-60">Pendentes</span>
            <div className={`text-4xl font-black font-heading ${pendentes.length > 0 ? 'text-yellow-500' : ''}`}>
              {String(pendentes.length).padStart(2,'0')}
            </div>
          </BrutalistCard>
          <BrutalistCard padding="p-5" className="flex flex-col gap-1">
            <span className="text-xs font-bold font-heading uppercase opacity-60">Confirmados</span>
            <div className="text-4xl font-black font-heading text-green-600">
              {String(proximos.length).padStart(2,'0')}
            </div>
          </BrutalistCard>
          <BrutalistCard padding="p-5" className="flex flex-col gap-1">
            <span className="text-xs font-bold font-heading uppercase opacity-60">Total</span>
            <div className="text-4xl font-black font-heading">
              {String(agendamentos.length).padStart(2,'0')}
            </div>
          </BrutalistCard>
          <BrutalistCard padding="p-5" className="flex flex-col gap-1 cursor-pointer hover:bg-black hover:text-white transition-all group"
            onClick={() => navigate(`/p/${user.email.split('@')[0]}`)}>
            <span className="text-xs font-bold font-heading uppercase opacity-60 group-hover:opacity-100">Minha Página</span>
            <div className="text-lg font-black font-heading mt-2 uppercase">Ver →</div>
          </BrutalistCard>
        </div>

        {/* PENDENTES */}
        {pendentes.length > 0 && (
          <section className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold font-heading uppercase">Aguardando Confirmação</h2>
            {pendentes.map(ag => (
              <BrutalistCard key={ag.id} padding="p-6" className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-black font-heading uppercase px-3 py-1 rounded-full border-2 ${STATUS_LABEL.pendente.cor}`}>
                      Pendente
                    </span>
                    <span className="font-bold text-sm capitalize">{ag.modalidade}</span>
                  </div>
                  <p className="font-black font-heading text-xl">{ag.pacienteNome || 'Paciente'}</p>
                  <p className="text-sm text-gray-500 font-medium">{ag.pacienteEmail}</p>
                  <p className="font-bold text-sm capitalize">{formatData(ag.dataHora)}</p>
                  {ag.observacoes && <p className="text-sm text-gray-600 italic">"{ag.observacoes}"</p>}
                </div>
                <div className="flex md:flex-col gap-3 shrink-0">
                  <BrutalistButton
                    onClick={() => atualizarStatus(ag.id, 'confirmado')}
                    disabled={atualizando === ag.id}
                    className="flex-1 md:flex-none text-sm py-3 px-6">
                    {atualizando === ag.id ? '...' : '✓ Confirmar'}
                  </BrutalistButton>
                  <BrutalistButton variant="secondary"
                    onClick={() => atualizarStatus(ag.id, 'cancelado')}
                    disabled={atualizando === ag.id}
                    className="flex-1 md:flex-none text-sm py-3 px-6">
                    ✗ Recusar
                  </BrutalistButton>
                </div>
              </BrutalistCard>
            ))}
          </section>
        )}

        {/* PRÓXIMAS SESSÕES */}
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold font-heading uppercase">Próximas Sessões</h2>
          {loading && <p className="font-bold animate-pulse">Carregando...</p>}
          {!loading && proximos.length === 0 && (
            <BrutalistCard className="text-center py-12">
              <p className="font-bold uppercase text-gray-500 text-sm">Nenhuma sessão confirmada</p>
            </BrutalistCard>
          )}
          {proximos.map(ag => (
            <BrutalistCard key={ag.id} padding="p-6" className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex flex-col gap-2">
                <p className="font-black font-heading text-xl">{ag.pacienteNome || 'Paciente'}</p>
                <p className="text-sm text-gray-500 font-medium">{ag.pacienteEmail}</p>
                <p className="font-bold capitalize">{formatData(ag.dataHora)} · {ag.modalidade}</p>
              </div>
              <div className="flex gap-3 shrink-0 items-start flex-wrap">
                {ag.linkSessao && (
                  <a href={ag.linkSessao} target="_blank" rel="noopener noreferrer">
                    <BrutalistButton className="text-sm py-3 px-6">🎥 Google Meet</BrutalistButton>
                  </a>
                )}
                <BrutalistButton variant="secondary"
                  onClick={() => atualizarStatus(ag.id, 'concluido')}
                  disabled={atualizando === ag.id}
                  className="text-sm py-3 px-6">
                  Marcar como concluído
                </BrutalistButton>
              </div>
            </BrutalistCard>
          ))}
        </section>

        {/* HISTÓRICO */}
        {historico.length > 0 && (
          <section className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold font-heading uppercase">Histórico</h2>
            {historico.map(ag => {
              const st = STATUS_LABEL[ag.status]
              return (
                <BrutalistCard key={ag.id} padding="p-4" className="flex justify-between items-center gap-4 opacity-70">
                  <div>
                    <p className="font-bold">{ag.pacienteNome || 'Paciente'} · {formatData(ag.dataHora)}</p>
                  </div>
                  <span className={`text-xs font-black font-heading uppercase px-3 py-1 rounded-full border-2 ${st.cor}`}>
                    {st.label}
                  </span>
                </BrutalistCard>
              )
            })}
          </section>
        )}
      </div>
    </div>
  )
}
