import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import BrutalistCard from '../components/BrutalistCard'
import BrutalistButton from '../components/BrutalistButton'
import FooterPublico from '../components/FooterPublico'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import { User, ChevronLeft, ChevronRight } from 'lucide-react'

interface Psicologo {
  id: string; nome: string; bio: string; crp: string
  especialidades: string[]; abordagem: string
  valorConsulta: number; fotoPerfil?: string; slug: string
}

const DIAS_SEMANA = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
const MESES_NOME = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const HORARIOS = ['08:00','09:00','10:00','11:00','14:00','15:00','16:00','17:00','18:00']

function fmtDataISO(d: Date) { return d.toISOString().split('T')[0] }

function diasDoMes(ano: number, mes: number) {
  const primeiro = new Date(ano, mes, 1)
  const ultimo = new Date(ano, mes + 1, 0)
  const dias: (Date | null)[] = []
  for (let i = 0; i < primeiro.getDay(); i++) dias.push(null)
  for (let d = 1; d <= ultimo.getDate(); d++) dias.push(new Date(ano, mes, d))
  return dias
}

function scrollSuave(ref: React.RefObject<HTMLElement | null>) {
  setTimeout(() => {
    if (!ref.current) return
    const y = ref.current.getBoundingClientRect().top + window.scrollY - 100
    window.scrollTo({ top: y, behavior: 'smooth' })
  }, 200)
}

export default function PsicologoPublico() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [psi, setPsi] = useState<Psicologo | null>(null)
  const [loading, setLoading] = useState(true)

  const refCalendario = useRef<HTMLDivElement>(null)
  const refHorarios = useRef<HTMLDivElement>(null)
  const refDados = useRef<HTMLDivElement>(null)

  const hoje = new Date(); hoje.setHours(0,0,0,0)
  const [mesAtual, setMesAtual] = useState(new Date(hoje.getFullYear(), hoje.getMonth(), 1))
  const [dia, setDia] = useState<Date | null>(null)
  const [horario, setHorario] = useState('')
  const [horariosOcupados, setHorariosOcupados] = useState<string[]>([])
  const [modalidade, setModalidade] = useState<'online'|'presencial'>('online')

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [obs, setObs] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  const [etapa, setEtapa] = useState<'form'|'senha'|'ok'>('form')
  const [senha, setSenha] = useState('')
  const [senha2, setSenha2] = useState('')
  const [criandoSenha, setCriandoSenha] = useState(false)
  const [erroSenha, setErroSenha] = useState('')

  useEffect(() => {
    api.get(`/api/psicologos/publico/${slug}`)
      .then(r => setPsi(r.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    if (!dia || !slug) return
    setHorario('')
    api.get(`/api/agendamentos/horarios-ocupados?psicologoSlug=${slug}&data=${fmtDataISO(dia)}`)
      .then(r => setHorariosOcupados(r.data))
      .catch(() => setHorariosOcupados([]))
    scrollSuave(refHorarios)
  }, [dia, slug])

  const selecionarHorario = (h: string) => {
    setHorario(h)
    scrollSuave(refDados)
  }

  const scrollToForm = () => {
    if (!refCalendario.current) return
    const y = refCalendario.current.getBoundingClientRect().top + window.scrollY - (window.innerHeight / 2 - refCalendario.current.offsetHeight / 2)
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' })
  }

  const handleAgendar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dia || !horario) { setErro('Selecione data e horário.'); return }
    setErro(''); setEnviando(true)
    try {
      const [h, m] = horario.split(':')
      const dataHora = new Date(dia)
      dataHora.setHours(Number(h), Number(m), 0, 0)
      await api.post('/api/agendamentos/publico', {
        psicologoId: psi!.id, pacienteNome: nome, pacienteEmail: email,
        pacienteTelefone: telefone, dataHora: dataHora.toISOString(),
        modalidade, observacoes: obs
      })
      setEtapa('senha')
    } catch { setErro('Erro ao agendar. Tente novamente.') }
    finally { setEnviando(false) }
  }

  const handleCriarSenha = async (e: React.FormEvent) => {
    e.preventDefault()
    if (senha !== senha2) { setErroSenha('As senhas não coincidem.'); return }
    if (senha.length < 6) { setErroSenha('Mínimo 6 caracteres.'); return }
    setErroSenha(''); setCriandoSenha(true)
    try {
      const { data } = await api.post('/api/auth/criar-senha-paciente', { email, senha, nome })
      login(data)
      navigate(`/p/${slug}/pacientes`)
    } catch { setErroSenha('Erro ao criar conta. Tente novamente.') }
    finally { setCriandoSenha(false) }
  }

  const diasCalendario = diasDoMes(mesAtual.getFullYear(), mesAtual.getMonth())
  const podePrevMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1) > new Date(hoje.getFullYear(), hoje.getMonth(), 1)

  if (loading) return (
    <div className="min-h-screen bg-brand-gray flex items-center justify-center">
      <p className="font-heading font-black text-2xl animate-pulse">Carregando...</p>
    </div>
  )

  if (etapa === 'senha') return (
    <div className="min-h-screen bg-brand-gray flex items-center justify-center p-6">
      <BrutalistCard className="w-full max-w-md flex flex-col gap-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">✓</div>
          <h1 className="text-3xl font-black font-heading uppercase text-black">Agendamento enviado!</h1>
          <p className="text-black font-medium mt-2">
            Crie sua senha para acompanhar seus agendamentos com {psi?.nome}.
          </p>
        </div>
        <form onSubmit={handleCriarSenha} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-heading font-bold text-xs uppercase text-black">E-mail</label>
            <input disabled value={email}
              className="w-full bg-gray-100 border border-black p-3 font-sans text-black opacity-60"/>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-heading font-bold text-xs uppercase text-black">Crie uma senha</label>
            <input type="password" required value={senha} onChange={e => setSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full bg-white border border-black p-3 font-sans text-black focus:outline-none focus:ring-2 focus:ring-black"/>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-heading font-bold text-xs uppercase text-black">Confirme a senha</label>
            <input type="password" required value={senha2} onChange={e => setSenha2(e.target.value)}
              placeholder="Repita a senha"
              className="w-full bg-white border border-black p-3 font-sans text-black focus:outline-none focus:ring-2 focus:ring-black"/>
          </div>
          {erroSenha && (
            <div className="bg-red-100 border-2 border-red-600 text-red-700 p-3 text-sm font-bold">{erroSenha}</div>
          )}
          <BrutalistButton type="submit" disabled={criandoSenha} className="w-full">
            {criandoSenha ? 'Criando...' : 'Criar conta e ver agendamentos'}
          </BrutalistButton>
        </form>
        <button onClick={() => navigate(`/p/${slug}/pacientes`)}
          className="text-xs font-bold uppercase underline opacity-40 hover:opacity-100 text-center text-black">
          Pular por agora
        </button>
      </BrutalistCard>
    </div>
  )

  return (
    <div className="min-h-screen bg-brand-gray">

      {/* NAVBAR */}
      <header className="bg-white border-b-2 border-black px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <span className="font-black font-heading uppercase text-base text-black">{psi?.nome}</span>
        <Link to={`/p/${slug}/pacientes`}
          className="p-2 border-2 border-black rounded-full hover:bg-black hover:text-white transition-all text-black">
          <User size={18} />
        </Link>
      </header>

      {/* HERO */}
      <section className="bg-white border-b-2 border-black">
        <div className="max-w-2xl mx-auto px-6 py-14 flex flex-col items-center text-center gap-5">

          <div className="w-48 h-48 md:w-72 md:h-72 rounded-full border-4 border-black overflow-hidden bg-black flex items-center justify-center text-white text-7xl font-black font-heading shadow-[8px_8px_0px_rgba(0,0,0,1)]">
            {psi?.fotoPerfil
              ? <img src={psi.fotoPerfil} className="w-full h-full object-cover" alt={psi?.nome}/>
              : <span>{psi?.nome[0]}</span>}
          </div>

          <h1 className="text-4xl md:text-5xl font-black font-heading uppercase tracking-tighter text-black">{psi?.nome}</h1>

          {psi?.crp && <p className="text-sm font-bold uppercase tracking-widest text-black">CRP {psi.crp}</p>}

          {psi?.especialidades && psi.especialidades.length > 0 && (
            <div className="flex flex-col gap-2 items-center">
              <span className="text-xs font-black font-heading uppercase tracking-widest text-black">Tratamento de</span>
              <div className="flex flex-wrap gap-2 justify-center">
                {psi.especialidades.map(e => (
                  <span key={e} className="bg-black text-white text-xs font-bold font-heading uppercase px-4 py-1.5 rounded-full">{e}</span>
                ))}
              </div>
            </div>
          )}

          {psi?.abordagem && (
            <div className="flex flex-col gap-1 items-center">
              <span className="text-xs font-black font-heading uppercase tracking-widest text-black">Linha de trabalho</span>
              <p className="text-sm font-bold text-black">{psi.abordagem}</p>
            </div>
          )}

          {psi?.bio && (
            <div className="w-full border-t-2 border-black pt-6 flex flex-col gap-3">
              <h2 className="text-2xl font-black font-heading uppercase tracking-tighter text-black">Quem sou eu</h2>
              <p className="text-black font-medium leading-relaxed">{psi.bio}</p>
            </div>
          )}

          {/* Planos */}
          <div className="w-full border-t-2 border-black pt-6 flex flex-col gap-4">
            <h2 className="text-xl font-black font-heading uppercase tracking-tighter text-black text-center">Planos de atendimento</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">

              {/* Diário */}
              <div className="bg-black text-white brutalist-border rounded-2xl p-5 flex flex-col gap-2 items-center text-center relative">
                <span className="text-[9px] font-black font-heading uppercase tracking-widest opacity-60">Sessão avulsa</span>
                <span className="text-4xl font-black font-heading">R$ 180</span>
                <span className="text-xs font-bold opacity-60">por sessão · 50 min</span>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-white text-black text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-black">
                  Padrão
                </div>
              </div>

              {/* Mensal */}
              <div className="bg-white brutalist-border rounded-2xl p-5 flex flex-col gap-2 items-center text-center">
                <span className="text-[9px] font-black font-heading uppercase tracking-widest text-black opacity-60">Plano mensal</span>
                <span className="text-4xl font-black font-heading text-black">R$ 640</span>
                <span className="text-xs font-bold text-black opacity-60">4 sessões · economia R$ 80</span>
                <span className="text-[10px] font-black uppercase text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                  -11% de desconto
                </span>
              </div>

              {/* Bimestral */}
              <div className="bg-white brutalist-border rounded-2xl p-5 flex flex-col gap-2 items-center text-center">
                <span className="text-[9px] font-black font-heading uppercase tracking-widest text-black opacity-60">Plano bimestral</span>
                <span className="text-4xl font-black font-heading text-black">R$ 1.200</span>
                <span className="text-xs font-bold text-black opacity-60">8 sessões · economia R$ 240</span>
                <span className="text-[10px] font-black uppercase text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                  -17% de desconto
                </span>
              </div>

            </div>
            <p className="text-[10px] font-bold uppercase text-black opacity-40 text-center">
              Pagamento combinado diretamente com o profissional
            </p>
          </div>

          <BrutalistButton onClick={scrollToForm} className="text-lg px-10">Agendar Consulta</BrutalistButton>
        </div>
      </section>

      {/* FORMULÁRIO */}
      <section id="agendamento" className="max-w-2xl mx-auto px-6 py-14">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-black font-heading uppercase tracking-tighter text-black">Agendar Consulta</h2>
          <p className="text-black font-medium mt-2 opacity-60">Escolha o melhor horário para você</p>
        </div>

        <form onSubmit={handleAgendar} className="flex flex-col gap-5">

          {/* Modalidade */}
          <BrutalistCard padding="p-6">
            <p className="font-heading font-black text-[10px] uppercase tracking-widest text-black mb-4">Modo de atendimento</p>
            <div className="flex gap-3">
              {(['online','presencial'] as const).map(m => (
                <button key={m} type="button" onClick={() => setModalidade(m)}
                  className={`flex-1 py-3 rounded-full font-heading font-bold text-sm uppercase border-2 transition-all
                    ${modalidade === m ? 'bg-black text-white border-black' : 'border-black text-black hover:bg-black hover:text-white'}`}>
                  {m === 'online' ? '📹 Online' : '🏢 Presencial'}
                </button>
              ))}
            </div>
          </BrutalistCard>

          {/* Calendário */}
          <div ref={refCalendario}>
          <BrutalistCard padding="p-4">
            <div className="flex justify-between items-center mb-3">
              <p className="font-heading font-black text-[10px] uppercase tracking-widest text-black">Escolha o dia</p>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1))}
                  disabled={!podePrevMes}
                  className="p-1 border-2 border-black rounded-lg hover:bg-black hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed text-black">
                  <ChevronLeft size={16} />
                </button>
                <span className="font-heading font-black text-sm uppercase text-black">
                  {MESES_NOME[mesAtual.getMonth()]} {mesAtual.getFullYear()}
                </span>
                <button type="button" onClick={() => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1))}
                  className="p-1 border-2 border-black rounded-lg hover:bg-black hover:text-white transition-all text-black">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 mb-1">
              {DIAS_SEMANA.map(d => (
                <div key={d} className="text-center text-[9px] md:text-[10px] font-black font-heading uppercase text-black py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5 md:gap-1">
              {diasCalendario.map((d, i) => {
                if (!d) return <div key={`e-${i}`} />
                const passado = d < hoje
                const fimSemana = d.getDay() === 0 || d.getDay() === 6
                const disabled = passado || fimSemana
                const selected = dia?.toDateString() === d.toDateString()
                return (
                  <button key={d.toISOString()} type="button" onClick={() => !disabled && setDia(d)} disabled={disabled}
                    className={`h-8 md:h-7 flex items-center justify-center text-xs font-bold font-heading rounded-md border-2 transition-all
                      ${disabled ? 'border-transparent text-black opacity-20 cursor-not-allowed'
                        : selected ? 'bg-black text-white border-black'
                        : 'border-transparent text-black hover:border-black hover:bg-black hover:text-white'}`}>
                    {d.getDate()}
                  </button>
                )
              })}
            </div>
          </BrutalistCard>

          </div>

          {/* Horários — aparece com scroll suave */}
          {dia && (
            <BrutalistCard padding="p-6">
              <div ref={refHorarios} />
              <p className="font-heading font-black text-[10px] uppercase tracking-widest text-black opacity-60 mb-4">Horário</p>
              <div className="flex flex-wrap gap-2">
                {HORARIOS.map(h => {
                  const ocupado = horariosOcupados.includes(h)
                  const selected = horario === h
                  return (
                    <button key={h} type="button" onClick={() => !ocupado && selecionarHorario(h)} disabled={ocupado}
                      className={`py-2 px-5 rounded-full border-2 font-heading font-bold text-sm transition-all
                        ${ocupado ? 'border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed line-through'
                          : selected ? 'bg-black text-white border-black'
                          : 'border-black text-black hover:bg-black hover:text-white'}`}>
                      {h}
                    </button>
                  )
                })}
              </div>
              {horariosOcupados.length > 0 && (
                <p className="text-[10px] text-black opacity-40 font-bold uppercase mt-3">Horários riscados já estão reservados</p>
              )}
            </BrutalistCard>
          )}

          {/* Dados pessoais — aparece com scroll suave */}
          <div ref={refDados}>
            <BrutalistCard padding="p-6" className="flex flex-col gap-4">
              <p className="font-heading font-black text-[10px] uppercase tracking-widest text-black opacity-60">Seus dados</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-heading font-bold text-xs uppercase text-black">Nome completo</label>
                  <input required value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome"
                    className="w-full bg-white border border-black p-3 font-sans text-black focus:outline-none focus:ring-2 focus:ring-black"/>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-heading font-bold text-xs uppercase text-black">E-mail</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com"
                    className="w-full bg-white border border-black p-3 font-sans text-black focus:outline-none focus:ring-2 focus:ring-black"/>
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="font-heading font-bold text-xs uppercase text-black">Telefone / WhatsApp</label>
                  <input type="tel" required value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="(00) 00000-0000"
                    className="w-full bg-white border border-black p-3 font-sans text-black focus:outline-none focus:ring-2 focus:ring-black"/>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-heading font-bold text-xs uppercase text-black">Motivo (opcional)</label>
                <textarea rows={3} value={obs} onChange={e => setObs(e.target.value)}
                  placeholder="Descreva brevemente o que te trouxe aqui..."
                  className="w-full bg-white border border-black p-3 font-sans text-black resize-none focus:outline-none focus:ring-2 focus:ring-black"/>
              </div>
            </BrutalistCard>
          </div>

          {erro && (
            <div className="bg-red-100 border-2 border-red-600 text-red-700 p-4 font-bold text-sm">{erro}</div>
          )}

          <BrutalistButton type="submit" disabled={enviando} className="w-full text-lg py-5">
            {enviando ? 'Enviando...' : 'Confirmar Agendamento'}
          </BrutalistButton>

          <p className="text-center text-xs font-bold uppercase text-black">
            Já agendou antes?{' '}
            <Link to={`/p/${slug}/pacientes`} className="underline underline-offset-4 hover:opacity-70">
              Acompanhe seus agendamentos
            </Link>
          </p>
        </form>
      </section>

      <FooterPublico />
    </div>
  )
}
