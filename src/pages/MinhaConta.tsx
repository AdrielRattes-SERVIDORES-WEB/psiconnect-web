import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BrutalistCard from '../components/BrutalistCard'
import BrutalistButton from '../components/BrutalistButton'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'

interface Agendamento {
  id: string; psicologoId: string; dataHora: string
  status: string; modalidade: string; linkSessao?: string; observacoes?: string
}

const STATUS: Record<string, { label: string; cor: string; emoji: string }> = {
  pendente:   { label: 'Aguardando confirmação', cor: 'bg-yellow-100 text-yellow-800 border-yellow-400', emoji: '⏳' },
  confirmado: { label: 'Confirmado',             cor: 'bg-green-100 text-green-800 border-green-400',   emoji: '✓' },
  cancelado:  { label: 'Cancelado',              cor: 'bg-red-100 text-red-800 border-red-400',         emoji: '✗' },
  concluido:  { label: 'Concluído',              cor: 'bg-gray-200 text-gray-600 border-gray-300',      emoji: '✓' },
}

function fmtData(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
    + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export default function MinhaConta() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [lista, setLista] = useState<Agendamento[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    api.get('/api/agendamentos/meus-agendamentos')
      .then(r => setLista(r.data))
      .finally(() => setLoading(false))
  }, [user])

  if (!user) return null

  const proximos  = lista.filter(a => ['pendente','confirmado'].includes(a.status))
  const anteriores = lista.filter(a => ['cancelado','concluido'].includes(a.status))

  return (
    <div className="flex-1 bg-brand-gray">
      <div className="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-8">

        {/* HEADER */}
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-black font-heading uppercase">Minhas Consultas</h1>
            <p className="text-gray-500 font-medium mt-1">{user.nome}</p>
          </div>
          <button onClick={logout} className="text-xs font-bold uppercase underline underline-offset-4 opacity-50 hover:opacity-100">
            Sair
          </button>
        </div>

        {loading && <p className="font-bold animate-pulse">Carregando...</p>}

        {/* PRÓXIMAS */}
        {!loading && (
          <section className="flex flex-col gap-4">
            <h2 className="text-2xl font-black font-heading uppercase">Próximas</h2>

            {proximos.length === 0 && (
              <BrutalistCard className="text-center py-14 flex flex-col gap-4 items-center">
                <p className="font-bold uppercase text-gray-400 text-sm">Nenhuma consulta agendada</p>
                <BrutalistButton onClick={() => navigate('/p/dr-teste-silva')}>
                  Agendar agora
                </BrutalistButton>
              </BrutalistCard>
            )}

            {proximos.map(ag => {
              const st = STATUS[ag.status]
              return (
                <BrutalistCard key={ag.id} padding="p-6" className="flex flex-col gap-4">
                  <div className="flex justify-between items-start flex-wrap gap-3">
                    <span className={`text-xs font-black font-heading uppercase px-3 py-1 rounded-full border-2 ${st.cor}`}>
                      {st.emoji} {st.label}
                    </span>
                    <span className="font-bold text-sm capitalize text-gray-600">{ag.modalidade}</span>
                  </div>

                  <p className="font-bold capitalize text-lg">{fmtData(ag.dataHora)}</p>

                  {ag.observacoes && (
                    <p className="text-sm text-gray-500 italic border-l-2 border-gray-300 pl-3">"{ag.observacoes}"</p>
                  )}

                  {ag.status === 'confirmado' && ag.linkSessao && (
                    <a href={ag.linkSessao} target="_blank" rel="noopener noreferrer">
                      <BrutalistButton className="w-full">🎥 Entrar na sessão</BrutalistButton>
                    </a>
                  )}

                  {ag.status === 'pendente' && (
                    <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-3 text-sm font-bold text-yellow-800">
                      Aguardando confirmação do psicólogo.
                    </div>
                  )}
                </BrutalistCard>
              )
            })}
          </section>
        )}

        {/* HISTÓRICO */}
        {!loading && anteriores.length > 0 && (
          <section className="flex flex-col gap-4">
            <h2 className="text-2xl font-black font-heading uppercase">Histórico</h2>
            {anteriores.map(ag => {
              const st = STATUS[ag.status]
              return (
                <BrutalistCard key={ag.id} padding="p-5" className="flex justify-between items-center gap-4 opacity-70">
                  <div className="flex flex-col gap-1">
                    <p className="font-bold capitalize text-sm">{fmtData(ag.dataHora)}</p>
                    <p className="text-xs font-bold uppercase text-gray-500 capitalize">{ag.modalidade}</p>
                  </div>
                  <span className={`text-xs font-black font-heading uppercase px-3 py-1 rounded-full border-2 shrink-0 ${st.cor}`}>
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
