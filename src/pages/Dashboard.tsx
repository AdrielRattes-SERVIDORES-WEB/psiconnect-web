import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardSidebar from '../components/DashboardSidebar'
import BrutalistCard from '../components/BrutalistCard'
import BrutalistButton from '../components/BrutalistButton'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import { CalendarDays, Users, Clock, CheckCircle } from 'lucide-react'

interface Agendamento {
  id: string; pacienteNome?: string; pacienteEmail?: string
  dataHora: string; status: string; modalidade: string; observacoes?: string
}

const STATUS: Record<string, { label: string; cor: string }> = {
  pendente:   { label: 'Pendente',   cor: 'bg-yellow-100 text-yellow-800 border-yellow-400' },
  confirmado: { label: 'Confirmado', cor: 'bg-green-100 text-green-800 border-green-400' },
  cancelado:  { label: 'Cancelado',  cor: 'bg-red-100 text-red-800 border-red-400' },
  concluido:  { label: 'Concluído',  cor: 'bg-gray-200 text-gray-600 border-gray-300' },
}

function fmtData(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
    + ' · ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [lista, setLista] = useState<Agendamento[]>([])
  const [loading, setLoading] = useState(true)
  const [ativo, setAtivo] = useState<string | null>(null)
  const [psiSlug, setPsiSlug] = useState('')

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    if (user.papel !== 'psicologo') { navigate('/'); return }
    api.get('/api/agendamentos/minha-agenda').then(r => setLista(r.data)).finally(() => setLoading(false))
    api.get('/api/psicologos/meu-perfil').then(r => setPsiSlug(r.data?.slug || '')).catch(() => {})
  }, [user])

  const atualizar = async (id: string, status: string) => {
    setAtivo(id)
    await api.patch(`/api/agendamentos/${id}/status`, { status })
    setLista(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    setAtivo(null)
  }

  const pendentes   = lista.filter(a => a.status === 'pendente')
  const confirmados = lista.filter(a => a.status === 'confirmado' && new Date(a.dataHora) >= new Date())
  const concluidos  = lista.filter(a => a.status === 'concluido')

  if (!user) return null

  return (
    <div className="flex bg-brand-gray min-h-screen">
      <DashboardSidebar />

      <main className="ml-0 md:ml-64 px-4 pt-16 pb-24 md:p-12 flex-1">

        {/* HEADER */}
        <header className="mb-8 md:mb-12 flex flex-col md:flex-row justify-between md:items-end gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-black font-heading uppercase tracking-tighter">Visão Geral</h1>
            <p className="text-base md:text-xl text-gray-500 font-medium">Bem-vindo, {user.nome}</p>
          </div>
          {psiSlug && (
            <a href={`/p/${psiSlug}`} target="_blank"
              className="font-heading font-bold text-sm border-2 border-black px-5 py-2 rounded-full hover:bg-black hover:text-white transition-all self-start">
              Ver minha página pública →
            </a>
          )}
        </header>

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
          {[
            { label: 'Pendentes',   value: pendentes.length,   cor: pendentes.length > 0 ? 'text-yellow-500' : '',  icon: Clock },
            { label: 'Confirmados', value: confirmados.length, cor: 'text-green-600',                               icon: CheckCircle },
            { label: 'Concluídos',  value: concluidos.length,  cor: '',                                             icon: CalendarDays },
            { label: 'Total',       value: lista.length,       cor: '',                                             icon: Users },
          ].map(s => (
            <BrutalistCard key={s.label} padding="p-5 md:p-6" className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold font-heading uppercase opacity-60">{s.label}</span>
                <s.icon size={16} className="opacity-30" />
              </div>
              <div className={`text-4xl md:text-5xl font-black font-heading ${s.cor}`}>
                {String(s.value).padStart(2, '0')}
              </div>
            </BrutalistCard>
          ))}
        </div>

        {/* PENDENTES */}
        {pendentes.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl md:text-3xl font-bold font-heading uppercase tracking-tighter mb-6">
              Aguardando Confirmação
            </h2>
            <div className="flex flex-col gap-4">
              {pendentes.map(ag => (
                <BrutalistCard key={ag.id} padding="p-6" className="flex flex-col md:flex-row justify-between gap-5">
                  <div className="flex flex-col gap-2 flex-1">
                    <span className={`text-[10px] font-black font-heading uppercase px-3 py-1 rounded-full border-2 w-fit ${STATUS.pendente.cor}`}>
                      ⏳ Pendente
                    </span>
                    <p className="text-2xl font-black font-heading uppercase">{ag.pacienteNome || '—'}</p>
                    <p className="text-sm text-gray-500 font-medium">{ag.pacienteEmail}</p>
                    <p className="font-bold text-sm capitalize">{fmtData(ag.dataHora)} · {ag.modalidade}</p>
                    {ag.observacoes && (
                      <p className="text-sm text-gray-500 italic border-l-2 border-gray-200 pl-3">"{ag.observacoes}"</p>
                    )}
                  </div>
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
                </BrutalistCard>
              ))}
            </div>
          </section>
        )}

        {/* PRÓXIMAS SESSÕES */}
        <section className="mb-10">
          <h2 className="text-2xl md:text-3xl font-bold font-heading uppercase tracking-tighter mb-6">
            Próximas Sessões
          </h2>
          {loading && <p className="font-bold text-gray-500 animate-pulse">Carregando...</p>}
          {!loading && confirmados.length === 0 && (
            <BrutalistCard className="text-center py-12">
              <p className="font-bold uppercase text-gray-400 text-sm">Nenhuma sessão confirmada</p>
            </BrutalistCard>
          )}
          <div className="flex flex-col gap-4">
            {confirmados.map(ag => (
              <BrutalistCard key={ag.id} padding="p-6"
                className="flex flex-col md:flex-row justify-between gap-4 cursor-pointer hover:bg-black hover:text-white transition-all group">
                <div className="flex flex-col gap-2 flex-1">
                  <p className="text-xl font-black font-heading uppercase">{ag.pacienteNome || '—'}</p>
                  <p className="text-sm font-medium opacity-60 group-hover:opacity-80">{ag.pacienteEmail}</p>
                  <p className="font-bold text-sm capitalize">{fmtData(ag.dataHora)} · {ag.modalidade}</p>
                </div>
                <BrutalistButton variant="secondary" onClick={() => atualizar(ag.id, 'concluido')} disabled={ativo === ag.id}
                  className="text-sm py-2 px-5 shrink-0 self-start">
                  Marcar concluído
                </BrutalistButton>
              </BrutalistCard>
            ))}
          </div>
        </section>

      </main>
    </div>
  )
}
