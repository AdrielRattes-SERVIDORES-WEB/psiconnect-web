import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import BrutalistCard from '../components/BrutalistCard'
import BrutalistButton from '../components/BrutalistButton'
import api from '../lib/api'

interface Agendamento {
  id: string; dataHora: string; status: string
  modalidade: string; observacoes?: string; linkSessao?: string
}

interface Psicologo { nome: string; fotoPerfil?: string; slug: string }

const STATUS: Record<string, { label: string; cor: string; emoji: string }> = {
  pendente:   { label: 'Aguardando confirmação', cor: 'bg-yellow-100 text-yellow-800 border-yellow-400', emoji: '⏳' },
  confirmado: { label: 'Confirmado',             cor: 'bg-green-100 text-green-800 border-green-400',   emoji: '✓' },
  cancelado:  { label: 'Cancelado',              cor: 'bg-red-100 text-red-800 border-red-400',         emoji: '✗' },
  concluido:  { label: 'Concluído',              cor: 'bg-gray-200 text-gray-600 border-gray-300',      emoji: '✓' },
}

function fmtData(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
    + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export default function PacientesDoMedico() {
  const { slug } = useParams()
  const [psi, setPsi] = useState<Psicologo | null>(null)
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [buscou, setBuscou] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    api.get(`/api/psicologos/publico/${slug}`)
      .then(r => setPsi(r.data))
      .finally(() => setLoading(false))
  }, [slug])

  const buscar = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro(''); setBuscando(true)
    try {
      const { data } = await api.get(`/api/agendamentos/por-email?email=${encodeURIComponent(email)}&psicologoSlug=${slug}`)
      setAgendamentos(data)
      setBuscou(true)
    } catch { setErro('Erro ao buscar agendamentos.') }
    finally { setBuscando(false) }
  }

  const proximos  = agendamentos.filter(a => ['pendente','confirmado'].includes(a.status))
  const historico = agendamentos.filter(a => ['cancelado','concluido'].includes(a.status))

  if (loading) return (
    <div className="min-h-screen bg-brand-gray flex items-center justify-center">
      <p className="font-heading font-black text-2xl animate-pulse">Carregando...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-brand-gray">

      {/* MINI NAVBAR */}
      <header className="bg-white border-b-2 border-black px-6 py-4 flex justify-between items-center">
        <Link to={`/p/${slug}`} className="font-black font-heading uppercase text-sm opacity-60 hover:opacity-100 transition-opacity">
          ← {psi?.nome || 'Voltar'}
        </Link>
        <span className="font-black font-heading uppercase text-xs opacity-30">Psiconnect</span>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-12 flex flex-col gap-8">

        {/* HEADER */}
        <div className="text-center flex flex-col gap-3">
          <h1 className="text-4xl font-black font-heading uppercase tracking-tighter">Meus Agendamentos</h1>
          <p className="text-gray-500 font-medium">
            {psi?.nome && <>com <strong>{psi.nome}</strong></>}
          </p>
        </div>

        {/* BUSCA POR EMAIL */}
        {!buscou && (
          <BrutalistCard className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-black font-heading uppercase">Acesse seus agendamentos</h2>
              <p className="text-gray-500 font-medium text-sm">
                Digite o e-mail que usou ao agendar para ver suas consultas.
              </p>
            </div>
            <form onSubmit={buscar} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-heading font-bold text-xs uppercase">E-mail</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-white border border-black p-3 font-sans focus:outline-none focus:ring-2 focus:ring-black"/>
              </div>
              {erro && (
                <div className="bg-red-100 border-2 border-red-600 text-red-700 p-3 text-sm font-bold">{erro}</div>
              )}
              <BrutalistButton type="submit" disabled={buscando} className="w-full">
                {buscando ? 'Buscando...' : 'Ver meus agendamentos'}
              </BrutalistButton>
            </form>
            <div className="border-t-2 border-black pt-4 text-center">
              <p className="text-sm text-gray-500 font-medium mb-2">Ainda não tem consulta agendada?</p>
              <Link to={`/p/${slug}`}>
                <BrutalistButton variant="secondary" className="w-full">Agendar agora →</BrutalistButton>
              </Link>
            </div>
          </BrutalistCard>
        )}

        {/* RESULTADOS */}
        {buscou && (
          <>
            <div className="flex justify-between items-center">
              <p className="font-bold text-sm opacity-60">{email}</p>
              <button onClick={() => { setBuscou(false); setAgendamentos([]) }}
                className="text-xs font-bold uppercase underline underline-offset-4 opacity-50 hover:opacity-100">
                Trocar e-mail
              </button>
            </div>

            {agendamentos.length === 0 && (
              <BrutalistCard className="text-center py-14 flex flex-col gap-5 items-center">
                <p className="font-bold uppercase text-gray-400 text-sm">Nenhum agendamento encontrado</p>
                <Link to={`/p/${slug}`}>
                  <BrutalistButton>Agendar agora</BrutalistButton>
                </Link>
              </BrutalistCard>
            )}

            {proximos.length > 0 && (
              <section className="flex flex-col gap-4">
                <h2 className="text-2xl font-black font-heading uppercase tracking-tighter">Próximas consultas</h2>
                {proximos.map(ag => {
                  const st = STATUS[ag.status]
                  return (
                    <BrutalistCard key={ag.id} padding="p-6" className="flex flex-col gap-4">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <span className={`text-[10px] font-black font-heading uppercase px-3 py-1 rounded-full border-2 ${st.cor}`}>
                          {st.emoji} {st.label}
                        </span>
                        <span className="font-bold text-sm capitalize text-gray-500">{ag.modalidade}</span>
                      </div>
                      <p className="font-bold capitalize">{fmtData(ag.dataHora)}</p>
                      {ag.observacoes && (
                        <p className="text-sm text-gray-500 italic border-l-2 border-gray-200 pl-3">"{ag.observacoes}"</p>
                      )}
                      {ag.status === 'confirmado' && ag.linkSessao && (
                        <a href={ag.linkSessao} target="_blank" rel="noopener noreferrer">
                          <BrutalistButton className="w-full">🎥 Entrar na sessão</BrutalistButton>
                        </a>
                      )}
                      {ag.status === 'pendente' && (
                        <div className="bg-yellow-50 border-2 border-yellow-400 p-3 text-sm font-bold text-yellow-800">
                          Aguardando confirmação do psicólogo.
                        </div>
                      )}
                    </BrutalistCard>
                  )
                })}
              </section>
            )}

            {historico.length > 0 && (
              <section className="flex flex-col gap-4">
                <h2 className="text-2xl font-black font-heading uppercase tracking-tighter">Histórico</h2>
                {historico.map(ag => {
                  const st = STATUS[ag.status]
                  return (
                    <BrutalistCard key={ag.id} padding="p-4" className="flex justify-between items-center gap-4 opacity-70">
                      <p className="font-bold text-sm capitalize">{fmtData(ag.dataHora)}</p>
                      <span className={`text-[10px] font-black font-heading uppercase px-3 py-1 rounded-full border-2 shrink-0 ${st.cor}`}>
                        {st.label}
                      </span>
                    </BrutalistCard>
                  )
                })}
              </section>
            )}

            <Link to={`/p/${slug}`}>
              <BrutalistButton variant="secondary" className="w-full">+ Fazer novo agendamento</BrutalistButton>
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
