import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import BrutalistCard from '../components/BrutalistCard'
import BrutalistButton from '../components/BrutalistButton'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import { CalendarDays, Clock, Settings, CreditCard, User } from 'lucide-react'

interface Agendamento {
  id: string; dataHora: string; status: string
  modalidade: string; observacoes?: string; linkSessao?: string
}
interface Psicologo { nome: string; fotoPerfil?: string; slug: string }

const STATUS: Record<string, { label: string; cor: string; emoji: string }> = {
  pendente:   { label: 'Aguardando confirmação', cor: 'bg-yellow-100 text-yellow-800 border-yellow-400', emoji: '⏳' },
  confirmado: { label: 'Confirmado',             cor: 'bg-green-100 text-green-800 border-green-400',   emoji: '✓'  },
  cancelado:  { label: 'Cancelado',              cor: 'bg-red-100 text-red-800 border-red-400',         emoji: '✗'  },
  concluido:  { label: 'Concluído',              cor: 'bg-gray-200 text-gray-600 border-gray-300',      emoji: '✓'  },
}

function fmtData(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
    + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

type Aba = 'proximas' | 'historico' | 'perfil' | 'pagamentos'

export default function PacientesDoMedico() {
  const { slug } = useParams()
  const { user, login, logout } = useAuth()
  const [psi, setPsi] = useState<Psicologo | null>(null)
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState(user?.email || '')
  const [senha, setSenha] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [buscou, setBuscou] = useState(!!user)
  const [erro, setErro] = useState('')
  const [esqueceuSenha, setEsqueceuSenha] = useState(false)
  const [aba, setAba] = useState<Aba>('proximas')

  useEffect(() => {
    api.get(`/api/psicologos/publico/${slug}`)
      .then(r => setPsi(r.data))
    if (user) {
      carregarAgendamentos(user.email)
    } else {
      setLoading(false)
    }
  }, [slug, user])

  const carregarAgendamentos = (em: string) => {
    setLoading(true)
    api.get(`/api/agendamentos/por-email?email=${encodeURIComponent(em)}&psicologoSlug=${slug}`)
      .then(r => { setAgendamentos(r.data); setBuscou(true) })
      .catch(() => setErro('Erro ao buscar agendamentos.'))
      .finally(() => setLoading(false))
  }

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault(); setErro(''); setBuscando(true)
    try {
      const { data } = await api.post('/api/auth/login', { email, senha })
      login(data)
      carregarAgendamentos(data.email)
    } catch {
      setErro('E-mail ou senha incorretos.')
    } finally { setBuscando(false) }
  }

  const buscarSemSenha = (e: React.FormEvent) => {
    e.preventDefault(); setErro(''); setBuscando(true)
    carregarAgendamentos(email)
    setBuscando(false)
  }

  const proximas  = agendamentos.filter(a => ['pendente','confirmado'].includes(a.status))
  const historico = agendamentos.filter(a => ['cancelado','concluido'].includes(a.status))

  const menuItems = [
    { id: 'proximas'   as Aba, label: 'Próximas',  short: 'Próximas',  icon: CalendarDays },
    { id: 'historico'  as Aba, label: 'Histórico', short: 'Histórico', icon: Clock },
    { id: 'perfil'     as Aba, label: 'Perfil',    short: 'Perfil',    icon: Settings },
    { id: 'pagamentos' as Aba, label: 'Pagamentos',short: 'Pagamentos',icon: CreditCard },
  ]

  return (
    <div className="min-h-screen bg-brand-gray pb-20">

      {/* HEADER */}
      <header className="bg-white border-b-2 border-black px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <Link to={`/p/${slug}`} className="font-black font-heading uppercase text-base text-black hover:opacity-70 transition-opacity">
          ← {psi?.nome || 'Voltar'}
        </Link>
        {user && (
          <button onClick={() => { logout(); setBuscou(false); setAgendamentos([]) }}
            className="text-xs font-bold uppercase text-black opacity-50 hover:opacity-100 underline underline-offset-4">
            Sair
          </button>
        )}
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-6">

        {/* Login */}
        {!buscou && (
          <>
            <div className="text-center">
              <h1 className="text-4xl font-black font-heading uppercase text-black">Meus Agendamentos</h1>
              {psi && <p className="text-black font-medium mt-1 opacity-60">com {psi.nome}</p>}
            </div>

            {/* Formulário com senha */}
            {!esqueceuSenha && (
              <BrutalistCard className="flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-black font-heading uppercase text-black">Entrar na sua conta</h2>
                  <p className="text-sm font-medium text-black">Use o e-mail e senha cadastrados ao agendar.</p>
                </div>
                <form onSubmit={entrar} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-heading font-bold text-xs uppercase text-black">E-mail</label>
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full bg-white border border-black p-3 font-sans text-black focus:outline-none focus:ring-2 focus:ring-black"/>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <label className="font-heading font-bold text-xs uppercase text-black">Senha</label>
                      <button type="button" onClick={() => { setEsqueceuSenha(true); setErro('') }}
                        className="text-xs font-bold uppercase underline underline-offset-4 text-black opacity-50 hover:opacity-100">
                        Esqueci minha senha
                      </button>
                    </div>
                    <input type="password" required value={senha} onChange={e => setSenha(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white border border-black p-3 font-sans text-black focus:outline-none focus:ring-2 focus:ring-black"/>
                  </div>
                  {erro && <div className="bg-red-100 border-2 border-red-600 text-red-700 p-3 text-sm font-bold">{erro}</div>}
                  <BrutalistButton type="submit" disabled={buscando} className="w-full">
                    {buscando ? 'Entrando...' : 'Entrar'}
                  </BrutalistButton>
                </form>
                <div className="border-t-2 border-black pt-4 text-center">
                  <Link to={`/p/${slug}`}>
                    <span className="text-xs font-bold uppercase underline underline-offset-4 text-black opacity-40 hover:opacity-100">
                      Fazer novo agendamento →
                    </span>
                  </Link>
                </div>
              </BrutalistCard>
            )}

            {/* Esqueci minha senha */}
            {esqueceuSenha && (
              <BrutalistCard className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-black font-heading uppercase text-black">Esqueci minha senha</h2>
                  <p className="text-sm font-medium text-black opacity-60">
                    Digite seu e-mail para buscar seus agendamentos sem senha. Você poderá criar uma nova senha depois.
                  </p>
                </div>
                <form onSubmit={buscarSemSenha} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-heading font-bold text-xs uppercase text-black">E-mail</label>
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full bg-white border border-black p-3 font-sans text-black focus:outline-none focus:ring-2 focus:ring-black"/>
                  </div>
                  {erro && <div className="bg-red-100 border-2 border-red-600 text-red-700 p-3 text-sm font-bold">{erro}</div>}
                  <BrutalistButton type="submit" disabled={buscando} className="w-full">
                    {buscando ? 'Buscando...' : 'Buscar meus agendamentos'}
                  </BrutalistButton>
                </form>
                <button onClick={() => setEsqueceuSenha(false)}
                  className="text-xs font-bold uppercase underline underline-offset-4 text-black opacity-40 hover:opacity-100 text-center">
                  ← Voltar ao login
                </button>
              </BrutalistCard>
            )}
          </>
        )}

        {/* Área logada */}
        {buscou && (
          <>
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-black font-heading uppercase text-black">
                  {aba === 'proximas' && 'Próximas Consultas'}
                  {aba === 'historico' && 'Histórico'}
                  {aba === 'perfil' && 'Meu Perfil'}
                  {aba === 'pagamentos' && 'Pagamentos'}
                </h1>
                <p className="text-xs font-bold uppercase text-black opacity-50">{email}</p>
              </div>
              {!user && (
                <button onClick={() => { setBuscou(false); setAgendamentos([]) }}
                  className="text-xs font-bold uppercase underline underline-offset-4 opacity-40 hover:opacity-100 text-black">
                  Trocar
                </button>
              )}
            </div>

            {loading && <p className="font-bold animate-pulse text-black">Carregando...</p>}

            {/* ABA: Próximas */}
            {aba === 'proximas' && !loading && (
              <div className="flex flex-col gap-4">
                {proximas.length === 0 && (
                  <BrutalistCard className="text-center py-14 flex flex-col gap-4 items-center">
                    <p className="font-bold uppercase text-black opacity-40 text-sm">Nenhuma consulta agendada</p>
                    <Link to={`/p/${slug}`}>
                      <BrutalistButton>Agendar agora</BrutalistButton>
                    </Link>
                  </BrutalistCard>
                )}
                {proximas.map(ag => {
                  const st = STATUS[ag.status]
                  return (
                    <BrutalistCard key={ag.id} padding="p-6" className="flex flex-col gap-3">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <span className={`text-[10px] font-black font-heading uppercase px-3 py-1 rounded-full border-2 ${st.cor}`}>
                          {st.emoji} {st.label}
                        </span>
                        <span className="font-bold text-sm capitalize text-black opacity-60">{ag.modalidade}</span>
                      </div>
                      <p className="font-bold capitalize text-black">{fmtData(ag.dataHora)}</p>
                      {ag.observacoes && (
                        <p className="text-sm text-black opacity-50 italic border-l-2 border-gray-300 pl-3">"{ag.observacoes}"</p>
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
                <Link to={`/p/${slug}`}>
                  <BrutalistButton variant="secondary" className="w-full">+ Novo agendamento</BrutalistButton>
                </Link>
              </div>
            )}

            {/* ABA: Histórico */}
            {aba === 'historico' && !loading && (
              <div className="flex flex-col gap-4">
                {historico.length === 0 && (
                  <BrutalistCard className="text-center py-14">
                    <p className="font-bold uppercase text-black opacity-40 text-sm">Nenhum histórico ainda</p>
                  </BrutalistCard>
                )}
                {historico.map(ag => {
                  const st = STATUS[ag.status]
                  return (
                    <BrutalistCard key={ag.id} padding="p-5" className="flex justify-between items-center gap-4">
                      <div className="flex flex-col gap-1">
                        <p className="font-bold text-sm capitalize text-black">{fmtData(ag.dataHora)}</p>
                        <p className="text-xs font-bold uppercase text-black opacity-50 capitalize">{ag.modalidade}</p>
                      </div>
                      <span className={`text-[10px] font-black font-heading uppercase px-3 py-1 rounded-full border-2 shrink-0 ${st.cor}`}>
                        {st.label}
                      </span>
                    </BrutalistCard>
                  )
                })}
              </div>
            )}

            {/* ABA: Perfil */}
            {aba === 'perfil' && (
              <div className="flex flex-col gap-4">
                <BrutalistCard padding="p-6" className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center text-white text-2xl font-black font-heading">
                      <User size={28} />
                    </div>
                    <div>
                      <p className="font-black font-heading text-xl uppercase text-black">{user?.nome || 'Paciente'}</p>
                      <p className="text-sm text-black opacity-60 font-medium">{email}</p>
                    </div>
                  </div>
                  <div className="border-t-2 border-black pt-4 flex flex-col gap-3">
                    <p className="text-xs font-black font-heading uppercase text-black opacity-40">Em breve</p>
                    <p className="text-sm font-medium text-black opacity-50">Edição de perfil, notificações e preferências estarão disponíveis em breve.</p>
                  </div>
                </BrutalistCard>
                {user && (
                  <BrutalistButton variant="secondary" onClick={() => { logout(); setBuscou(false); setAgendamentos([]) }} className="w-full">
                    Sair da conta
                  </BrutalistButton>
                )}
              </div>
            )}

            {/* ABA: Pagamentos */}
            {aba === 'pagamentos' && (
              <BrutalistCard className="text-center py-16 flex flex-col gap-3 items-center">
                <CreditCard size={40} className="opacity-20" />
                <p className="font-bold uppercase text-black opacity-40 text-sm">Em breve</p>
                <p className="text-sm font-medium text-black opacity-40">Histórico de pagamentos disponível em breve.</p>
              </BrutalistCard>
            )}
          </>
        )}
      </div>

      {/* BOTTOM NAV MOBILE (sempre visível quando logado) */}
      {buscou && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-black">
          <div className="grid grid-cols-4 h-16 max-w-2xl mx-auto">
            {menuItems.map(item => (
              <button key={item.id} onClick={() => setAba(item.id)}
                className={`flex flex-col items-center justify-center gap-0.5 transition-colors
                  ${aba === item.id ? 'bg-black text-white' : 'text-black hover:bg-brand-gray'}`}>
                <item.icon size={18} />
                <span className="text-[9px] font-black font-heading uppercase leading-none">{item.short}</span>
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  )
}
