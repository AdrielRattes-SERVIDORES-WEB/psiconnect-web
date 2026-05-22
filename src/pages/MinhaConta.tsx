import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BrutalistCard from '../components/BrutalistCard'
import BrutalistButton from '../components/BrutalistButton'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'

interface Agendamento {
  id: string
  psicologoId: string
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

export default function MinhaConta() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    api.get('/api/agendamentos/meus-agendamentos')
      .then(r => setAgendamentos(r.data))
      .finally(() => setLoading(false))
  }, [user])

  const formatData = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
      + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  if (!user) return null

  return (
    <div className="flex-1 bg-brand-gray">
      <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-10">

        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl md:text-5xl font-black font-heading uppercase">Minha Conta</h1>
            <p className="text-xl text-gray-500 font-medium">{user.nome}</p>
          </div>
          <button onClick={logout} className="text-xs font-bold uppercase underline underline-offset-4 opacity-50 hover:opacity-100">
            Sair
          </button>
        </header>

        <section className="flex flex-col gap-6">
          <h2 className="text-3xl font-bold font-heading uppercase">Meus Agendamentos</h2>

          {loading && <p className="font-bold animate-pulse">Carregando...</p>}

          {!loading && agendamentos.length === 0 && (
            <BrutalistCard className="text-center py-16 flex flex-col gap-4 items-center">
              <p className="font-heading font-bold uppercase text-gray-500">Nenhum agendamento ainda</p>
              <BrutalistButton onClick={() => navigate('/psicologos')}>Encontrar Psicólogo</BrutalistButton>
            </BrutalistCard>
          )}

          {agendamentos.map(ag => {
            const st = STATUS_LABEL[ag.status] || STATUS_LABEL.pendente
            return (
              <BrutalistCard key={ag.id} padding="p-6" className="flex flex-col gap-4">
                <div className="flex justify-between items-start flex-wrap gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="font-heading font-black text-[10px] uppercase tracking-widest opacity-60">Data e hora</span>
                    <span className="font-bold capitalize">{formatData(ag.dataHora)}</span>
                  </div>
                  <span className={`text-xs font-black font-heading uppercase px-3 py-1 rounded-full border-2 ${st.cor}`}>
                    {st.label}
                  </span>
                </div>

                <div className="flex gap-6 flex-wrap">
                  <div>
                    <span className="font-heading font-black text-[10px] uppercase tracking-widest opacity-60">Modalidade</span>
                    <p className="font-bold capitalize">{ag.modalidade}</p>
                  </div>
                  {ag.observacoes && (
                    <div>
                      <span className="font-heading font-black text-[10px] uppercase tracking-widest opacity-60">Observações</span>
                      <p className="font-bold">{ag.observacoes}</p>
                    </div>
                  )}
                </div>

                {ag.status === 'confirmado' && ag.linkSessao && (
                  <a href={ag.linkSessao} target="_blank" rel="noopener noreferrer">
                    <BrutalistButton className="w-full md:w-auto">
                      🎥 Entrar no Google Meet
                    </BrutalistButton>
                  </a>
                )}

                {ag.status === 'confirmado' && !ag.linkSessao && ag.modalidade === 'online' && (
                  <div className="bg-yellow-100 border-2 border-yellow-400 p-3 rounded-xl text-sm font-bold">
                    Link do Google Meet será enviado por e-mail em breve.
                  </div>
                )}
              </BrutalistCard>
            )
          })}
        </section>
      </div>
    </div>
  )
}
