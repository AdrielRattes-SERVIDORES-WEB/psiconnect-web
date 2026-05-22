import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import BrutalistCard from '../components/BrutalistCard'
import BrutalistButton from '../components/BrutalistButton'
import api from '../lib/api'
import { User } from 'lucide-react'

interface Psicologo {
  id: string; nome: string; bio: string; crp: string
  especialidades: string[]; abordagem: string
  valorConsulta: number; fotoPerfil?: string; slug: string
}

const DIAS_LABEL = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
const HORARIOS = ['08:00','09:00','10:00','11:00','14:00','15:00','16:00','17:00','18:00']

function proximosDias(n: number) {
  const dias: Date[] = []
  const hoje = new Date()
  for (let i = 1; dias.length < n; i++) {
    const d = new Date(hoje); d.setDate(hoje.getDate() + i)
    if (d.getDay() !== 0 && d.getDay() !== 6) dias.push(d)
  }
  return dias
}

function fmtDataISO(d: Date) {
  return d.toISOString().split('T')[0]
}

export default function PsicologoPublico() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [psi, setPsi] = useState<Psicologo | null>(null)
  const [loading, setLoading] = useState(true)
  const [dia, setDia] = useState<Date | null>(null)
  const [horario, setHorario] = useState('')
  const [horariosOcupados, setHorariosOcupados] = useState<string[]>([])
  const [modalidade, setModalidade] = useState<'online'|'presencial'>('online')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [obs, setObs] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')

  const dias = proximosDias(10)

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
  }, [dia, slug])

  const scrollToForm = () => {
    document.getElementById('agendamento')?.scrollIntoView({ behavior: 'smooth' })
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
        dataHora: dataHora.toISOString(), modalidade, observacoes: obs
      })
      setSucesso(true)
    } catch { setErro('Erro ao agendar. Tente novamente.') }
    finally { setEnviando(false) }
  }

  if (loading) return (
    <div className="min-h-screen bg-brand-gray flex items-center justify-center">
      <p className="font-heading font-black text-2xl animate-pulse">Carregando...</p>
    </div>
  )

  if (sucesso) return (
    <div className="min-h-screen bg-brand-gray flex items-center justify-center p-6">
      <BrutalistCard className="w-full max-w-md flex flex-col gap-6 text-center items-center">
        <div className="w-20 h-20 bg-green-400 rounded-full flex items-center justify-center text-5xl">✓</div>
        <h1 className="text-4xl font-black font-heading uppercase">Agendado!</h1>
        <p className="text-black font-medium leading-relaxed">
          Enviado para <strong>{psi?.nome}</strong>.<br/>
          Você receberá confirmação em breve.
        </p>
        <Link to={`/p/${slug}/pacientes`}>
          <BrutalistButton variant="secondary" className="w-full">Ver meus agendamentos</BrutalistButton>
        </Link>
        <button onClick={() => setSucesso(false)} className="text-xs font-bold uppercase underline opacity-40 hover:opacity-100">
          Fazer outro agendamento
        </button>
      </BrutalistCard>
    </div>
  )

  return (
    <div className="min-h-screen bg-brand-gray">

      {/* NAVBAR — nome do médico + ícone de usuário */}
      <header className="bg-white border-b-2 border-black px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <span className="font-black font-heading uppercase text-base text-black">
          {psi?.nome}
        </span>
        <Link to={`/p/${slug}/pacientes`}
          className="p-2 border-2 border-black rounded-full hover:bg-black hover:text-white transition-all text-black">
          <User size={18} />
        </Link>
      </header>

      {/* HERO */}
      <section className="bg-white border-b-2 border-black">
        <div className="max-w-2xl mx-auto px-6 py-14 flex flex-col items-center text-center gap-6">

          {/* Foto redonda */}
          <div className="w-36 h-36 rounded-full border-4 border-black overflow-hidden bg-black flex items-center justify-center text-white text-6xl font-black font-heading shadow-[6px_6px_0px_rgba(0,0,0,1)]">
            {psi?.fotoPerfil
              ? <img src={psi.fotoPerfil} className="w-full h-full object-cover" alt={psi?.nome}/>
              : <span>{psi?.nome[0]}</span>}
          </div>

          {/* Nome */}
          <h1 className="text-4xl md:text-5xl font-black font-heading uppercase tracking-tighter text-black">
            {psi?.nome}
          </h1>

          {/* CRP */}
          {psi?.crp && (
            <p className="text-sm font-bold uppercase tracking-widest text-black">
              CRP {psi.crp}
            </p>
          )}

          {/* Especialidades */}
          {psi?.especialidades && psi.especialidades.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {psi.especialidades.map(e => (
                <span key={e} className="bg-black text-white text-xs font-bold font-heading uppercase px-4 py-1.5 rounded-full">
                  {e}
                </span>
              ))}
            </div>
          )}

          {/* Abordagem */}
          {psi?.abordagem && (
            <p className="text-sm font-bold text-black uppercase tracking-wide">
              {psi.abordagem}
            </p>
          )}

          {/* Quem sou eu */}
          {psi?.bio && (
            <div className="w-full border-t-2 border-black pt-6 flex flex-col gap-4">
              <h2 className="text-2xl font-black font-heading uppercase tracking-tighter text-black">
                Quem sou eu
              </h2>
              <p className="text-black font-medium leading-relaxed text-base">
                {psi.bio}
              </p>
            </div>
          )}

          {/* Botão agendar */}
          <BrutalistButton onClick={scrollToForm} className="text-lg px-10">
            Agendar Consulta
          </BrutalistButton>

          {/* Preço */}
          <div className="flex flex-col items-center gap-1">
            <div className="text-4xl font-black font-heading text-black">
              R$ {psi?.valorConsulta?.toFixed(2)}
            </div>
            <span className="text-xs font-bold uppercase text-black opacity-50">
              por sessão · 50 minutos
            </span>
          </div>

        </div>
      </section>

      {/* FORMULÁRIO DE AGENDAMENTO */}
      <section id="agendamento" className="max-w-2xl mx-auto px-6 py-14">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black font-heading uppercase tracking-tighter text-black">
            Agendar Consulta
          </h2>
          <p className="text-black font-medium mt-2 opacity-60">
            Escolha o melhor horário para você
          </p>
        </div>

        <form onSubmit={handleAgendar} className="flex flex-col gap-5">

          {/* Modalidade */}
          <BrutalistCard padding="p-6">
            <p className="font-heading font-black text-[10px] uppercase tracking-widest text-black opacity-60 mb-4">
              Modalidade
            </p>
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
          <BrutalistCard padding="p-6">
            <p className="font-heading font-black text-[10px] uppercase tracking-widest text-black opacity-60 mb-4">
              Escolha o dia
            </p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {dias.map(d => {
                const selected = dia?.toDateString() === d.toDateString()
                return (
                  <button key={d.toISOString()} type="button"
                    onClick={() => setDia(d)}
                    className={`flex flex-col items-center min-w-[56px] py-3 px-1 rounded-2xl border-2 font-heading font-bold shrink-0 transition-all
                      ${selected ? 'bg-black text-white border-black' : 'bg-white border-black text-black hover:bg-black hover:text-white'}`}>
                    <span className="text-[9px] uppercase">{DIAS_LABEL[d.getDay()]}</span>
                    <span className="text-xl font-black">{d.getDate()}</span>
                    <span className="text-[8px] opacity-60">{MESES[d.getMonth()]}</span>
                  </button>
                )
              })}
            </div>
          </BrutalistCard>

          {/* Horários */}
          {dia && (
            <BrutalistCard padding="p-6">
              <p className="font-heading font-black text-[10px] uppercase tracking-widest text-black opacity-60 mb-4">
                Horário
              </p>
              <div className="flex flex-wrap gap-2">
                {HORARIOS.map(h => {
                  const ocupado = horariosOcupados.includes(h)
                  const selected = horario === h
                  return (
                    <button key={h} type="button"
                      onClick={() => !ocupado && setHorario(h)}
                      disabled={ocupado}
                      className={`py-2 px-5 rounded-full border-2 font-heading font-bold text-sm transition-all
                        ${ocupado
                          ? 'border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed line-through'
                          : selected
                            ? 'bg-black text-white border-black'
                            : 'border-black text-black hover:bg-black hover:text-white'}`}>
                      {h}
                      {ocupado && <span className="ml-1 text-[9px] no-underline">×</span>}
                    </button>
                  )
                })}
              </div>
              {horariosOcupados.length > 0 && (
                <p className="text-[10px] text-black opacity-40 font-bold uppercase mt-3">
                  Horários riscados já estão reservados
                </p>
              )}
            </BrutalistCard>
          )}

          {/* Dados pessoais */}
          <BrutalistCard padding="p-6" className="flex flex-col gap-4">
            <p className="font-heading font-black text-[10px] uppercase tracking-widest text-black opacity-60">
              Seus dados
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-heading font-bold text-xs uppercase text-black">Nome completo</label>
                <input required value={nome} onChange={e => setNome(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full bg-white border border-black p-3 font-sans text-black focus:outline-none focus:ring-2 focus:ring-black"/>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-heading font-bold text-xs uppercase text-black">E-mail</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
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

          {erro && (
            <div className="bg-red-100 border-2 border-red-600 text-red-700 p-4 font-bold font-sans text-sm">
              {erro}
            </div>
          )}

          <BrutalistButton type="submit" disabled={enviando} className="w-full text-lg py-5">
            {enviando ? 'Enviando...' : 'Confirmar Agendamento'}
          </BrutalistButton>

          <p className="text-center text-xs font-bold uppercase text-black opacity-40">
            Já agendou antes?{' '}
            <Link to={`/p/${slug}/pacientes`} className="underline underline-offset-4 hover:opacity-80">
              Acompanhe seus agendamentos
            </Link>
          </p>
        </form>
      </section>

    </div>
  )
}
