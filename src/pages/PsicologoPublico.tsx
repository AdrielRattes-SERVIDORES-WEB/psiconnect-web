import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import BrutalistCard from '../components/BrutalistCard'
import BrutalistButton from '../components/BrutalistButton'
import api from '../lib/api'

interface Psicologo {
  id: string; nome: string; bio: string; crp: string
  especialidades: string[]; abordagem: string
  valorConsulta: number; fotoPerfil?: string; slug: string
}

const DIAS_LABEL = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
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

export default function PsicologoPublico() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [psi, setPsi] = useState<Psicologo | null>(null)
  const [loading, setLoading] = useState(true)
  const [dia, setDia] = useState<Date | null>(null)
  const [horario, setHorario] = useState('')
  const [modalidade, setModalidade] = useState<'online'|'presencial'>('online')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [obs, setObs] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    api.get(`/api/psicologos/publico/${slug}`)
      .then(r => setPsi(r.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [slug])

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
        <p className="text-gray-600 font-medium leading-relaxed">
          Enviado para <strong>{psi?.nome}</strong>.<br/>
          Você receberá confirmação por e-mail em breve.
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

  const dias = proximosDias(8)

  return (
    <div className="min-h-screen bg-brand-gray">

      {/* MINI NAVBAR */}
      <header className="bg-white border-b-2 border-black px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <span className="font-black font-heading uppercase text-sm opacity-40">Psiconnect</span>
        <Link to={`/p/${slug}/entrar`}
          className="font-heading font-bold text-xs uppercase border-2 border-black px-4 py-1.5 rounded-full hover:bg-black hover:text-white transition-all">
          Minha conta
        </Link>
      </header>

      {/* HERO — foto + info */}
      <section className="bg-white border-b-2 border-black">
        <div className="max-w-3xl mx-auto px-6 py-12 flex flex-col items-center text-center gap-6">

          {/* Foto redonda */}
          <div className="w-32 h-32 rounded-full border-4 border-black overflow-hidden bg-black flex items-center justify-center text-white text-6xl font-black font-heading shadow-[6px_6px_0px_rgba(0,0,0,0.15)]">
            {psi?.fotoPerfil
              ? <img src={psi.fotoPerfil} className="w-full h-full object-cover" alt={psi?.nome}/>
              : psi?.nome[0]}
          </div>

          <div className="flex flex-col gap-3">
            <h1 className="text-4xl md:text-5xl font-black font-heading uppercase tracking-tighter">{psi?.nome}</h1>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">CRP {psi?.crp}</p>

            {/* Especialidades */}
            <div className="flex flex-wrap gap-2 justify-center">
              {psi?.especialidades?.map(e => (
                <span key={e} className="bg-black text-white text-xs font-bold font-heading uppercase px-4 py-1.5 rounded-full">{e}</span>
              ))}
            </div>

            {psi?.abordagem && (
              <p className="text-gray-600 font-medium">{psi.abordagem}</p>
            )}
          </div>

          {/* Preço + CTA */}
          <div className="flex flex-col items-center gap-2 pt-2">
            <div className="text-5xl font-black font-heading">
              R$ {psi?.valorConsulta?.toFixed(2)}
            </div>
            <span className="text-xs font-bold uppercase opacity-50">por sessão · 50 minutos</span>
          </div>
        </div>

        {/* Bio */}
        {psi?.bio && (
          <div className="border-t-2 border-black">
            <div className="max-w-3xl mx-auto px-6 py-8">
              <p className="text-gray-700 font-medium leading-relaxed text-center">{psi.bio}</p>
            </div>
          </div>
        )}
      </section>

      {/* FORMULÁRIO DE AGENDAMENTO */}
      <section className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black font-heading uppercase tracking-tighter">Agendar Consulta</h2>
          <p className="text-gray-500 font-medium mt-2">Escolha o melhor horário para você</p>
        </div>

        <form onSubmit={handleAgendar} className="flex flex-col gap-5">

          {/* Modalidade */}
          <BrutalistCard padding="p-6">
            <p className="font-heading font-black text-[10px] uppercase tracking-widest opacity-60 mb-4">Modalidade</p>
            <div className="flex gap-3">
              {(['online','presencial'] as const).map(m => (
                <button key={m} type="button" onClick={() => setModalidade(m)}
                  className={`flex-1 py-3 rounded-full font-heading font-bold text-sm uppercase border-2 transition-all
                    ${modalidade === m ? 'bg-black text-white border-black' : 'border-black hover:bg-black hover:text-white'}`}>
                  {m === 'online' ? '📹 Online' : '🏢 Presencial'}
                </button>
              ))}
            </div>
          </BrutalistCard>

          {/* Dias */}
          <BrutalistCard padding="p-6">
            <p className="font-heading font-black text-[10px] uppercase tracking-widest opacity-60 mb-4">Dia</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {dias.map(d => (
                <button key={d.toISOString()} type="button"
                  onClick={() => { setDia(d); setHorario('') }}
                  className={`flex flex-col items-center min-w-[52px] py-3 px-1 rounded-2xl border-2 font-heading font-bold shrink-0 transition-all
                    ${dia?.toDateString() === d.toDateString() ? 'bg-black text-white border-black' : 'bg-white border-black hover:bg-black hover:text-white'}`}>
                  <span className="text-[9px] uppercase">{DIAS_LABEL[d.getDay()]}</span>
                  <span className="text-xl font-black">{d.getDate()}</span>
                </button>
              ))}
            </div>
          </BrutalistCard>

          {/* Horários */}
          {dia && (
            <BrutalistCard padding="p-6">
              <p className="font-heading font-black text-[10px] uppercase tracking-widest opacity-60 mb-4">Horário</p>
              <div className="flex flex-wrap gap-2">
                {HORARIOS.map(h => (
                  <button key={h} type="button" onClick={() => setHorario(h)}
                    className={`py-2 px-5 rounded-full border-2 font-heading font-bold text-sm transition-all
                      ${horario === h ? 'bg-black text-white border-black' : 'border-black hover:bg-black hover:text-white'}`}>
                    {h}
                  </button>
                ))}
              </div>
            </BrutalistCard>
          )}

          {/* Dados pessoais */}
          <BrutalistCard padding="p-6" className="flex flex-col gap-4">
            <p className="font-heading font-black text-[10px] uppercase tracking-widest opacity-60">Seus dados</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-heading font-bold text-xs uppercase">Nome completo</label>
                <input required value={nome} onChange={e => setNome(e.target.value)}
                  placeholder="Seu nome" className="w-full bg-white border border-black p-3 font-sans focus:outline-none focus:ring-2 focus:ring-black"/>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-heading font-bold text-xs uppercase">E-mail</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com" className="w-full bg-white border border-black p-3 font-sans focus:outline-none focus:ring-2 focus:ring-black"/>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-heading font-bold text-xs uppercase">Motivo da consulta (opcional)</label>
              <textarea rows={3} value={obs} onChange={e => setObs(e.target.value)}
                placeholder="Descreva brevemente o que te trouxe aqui..."
                className="w-full bg-white border border-black p-3 font-sans resize-none focus:outline-none focus:ring-2 focus:ring-black"/>
            </div>
          </BrutalistCard>

          {erro && (
            <div className="bg-red-100 border-2 border-red-600 text-red-700 p-4 font-bold font-sans text-sm">{erro}</div>
          )}

          <BrutalistButton type="submit" disabled={enviando} className="w-full text-lg py-5">
            {enviando ? 'Enviando...' : 'Confirmar Agendamento'}
          </BrutalistButton>

          <p className="text-center text-xs font-bold uppercase opacity-40">
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
