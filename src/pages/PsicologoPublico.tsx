import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import BrutalistCard from '../components/BrutalistCard'
import BrutalistButton from '../components/BrutalistButton'
import api from '../lib/api'

interface Psicologo {
  id: string; nome: string; bio: string; crp: string
  especialidades: string[]; abordagem: string
  valorConsulta: number; fotoPerfil?: string
}

const DIAS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
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
        psicologoId: psi!.id, pacienteNome: nome,
        pacienteEmail: email, dataHora: dataHora.toISOString(),
        modalidade, observacoes: obs
      })
      setSucesso(true)
    } catch { setErro('Erro ao agendar. Tente novamente.') }
    finally { setEnviando(false) }
  }

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <p className="font-heading font-black text-2xl animate-pulse">Carregando...</p>
    </div>
  )

  if (sucesso) return (
    <div className="flex-1 flex items-center justify-center p-8">
      <BrutalistCard className="w-full max-w-md flex flex-col gap-6 text-center items-center">
        <div className="w-20 h-20 bg-green-400 rounded-full flex items-center justify-center text-5xl font-black">✓</div>
        <h1 className="text-4xl font-black font-heading uppercase">Agendado!</h1>
        <p className="text-gray-600 font-medium leading-relaxed">
          Seu agendamento foi enviado para <strong>{psi?.nome}</strong>.<br/>
          Aguarde a confirmação por e-mail.
        </p>
        <BrutalistButton onClick={() => navigate('/')} className="w-full">Voltar ao início</BrutalistButton>
      </BrutalistCard>
    </div>
  )

  const dias = proximosDias(8)

  return (
    <div className="flex-1 bg-brand-gray">
      {/* PERFIL */}
      <section className="bg-white border-b-2 border-black px-6 py-10">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-center">
          <div className="w-28 h-28 rounded-full bg-black flex items-center justify-center text-white text-5xl font-black font-heading shrink-0">
            {psi?.fotoPerfil
              ? <img src={psi.fotoPerfil} className="w-full h-full rounded-full object-cover" alt={psi.nome}/>
              : psi?.nome[0]}
          </div>
          <div className="flex flex-col gap-3 text-center md:text-left flex-1">
            <h1 className="text-4xl font-black font-heading uppercase">{psi?.nome}</h1>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">CRP {psi?.crp}</p>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {psi?.especialidades?.map(e => (
                <span key={e} className="bg-black text-white text-xs font-bold uppercase px-3 py-1 rounded-full">{e}</span>
              ))}
            </div>
            {psi?.abordagem && <p className="text-gray-600 font-medium text-sm">{psi.abordagem}</p>}
          </div>
          <div className="text-center shrink-0">
            <div className="text-4xl font-black font-heading">R$ {psi?.valorConsulta?.toFixed(2)}</div>
            <div className="text-xs font-bold uppercase opacity-50 mt-1">por sessão</div>
          </div>
        </div>
        {psi?.bio && (
          <div className="max-w-4xl mx-auto mt-6 border-t-2 border-black pt-6">
            <p className="text-gray-700 font-medium leading-relaxed">{psi.bio}</p>
          </div>
        )}
      </section>

      {/* FORMULÁRIO */}
      <section className="max-w-3xl mx-auto px-6 py-12">
        <h2 className="text-4xl font-black font-heading uppercase mb-8">Agendar Consulta</h2>
        <form onSubmit={handleAgendar} className="flex flex-col gap-6">

          {/* Modalidade */}
          <BrutalistCard padding="p-6">
            <p className="font-heading font-black text-xs uppercase tracking-widest opacity-60 mb-4">Modalidade</p>
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

          {/* Data */}
          <BrutalistCard padding="p-6">
            <p className="font-heading font-black text-xs uppercase tracking-widest opacity-60 mb-4">Escolha o dia</p>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {dias.map(d => (
                <button key={d.toISOString()} type="button"
                  onClick={() => { setDia(d); setHorario('') }}
                  className={`flex flex-col items-center min-w-[56px] py-3 px-1 rounded-2xl border-2 font-heading font-bold shrink-0 transition-all
                    ${dia?.toDateString() === d.toDateString() ? 'bg-black text-white border-black' : 'bg-white border-black hover:bg-black hover:text-white'}`}>
                  <span className="text-[10px] uppercase">{DIAS[d.getDay()]}</span>
                  <span className="text-2xl font-black">{d.getDate()}</span>
                </button>
              ))}
            </div>
          </BrutalistCard>

          {/* Horário */}
          {dia && (
            <BrutalistCard padding="p-6">
              <p className="font-heading font-black text-xs uppercase tracking-widest opacity-60 mb-4">Horário</p>
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

          {/* Dados */}
          <BrutalistCard padding="p-6" className="flex flex-col gap-4">
            <p className="font-heading font-black text-xs uppercase tracking-widest opacity-60">Seus dados</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-heading font-black text-[10px] uppercase tracking-widest opacity-60">Nome completo</label>
                <input required value={nome} onChange={e => setNome(e.target.value)}
                  placeholder="Seu nome completo"
                  className="brutalist-border rounded-xl p-3 font-bold focus:outline-none bg-brand-gray"/>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-heading font-black text-[10px] uppercase tracking-widest opacity-60">E-mail</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="brutalist-border rounded-xl p-3 font-bold focus:outline-none bg-brand-gray"/>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-heading font-black text-[10px] uppercase tracking-widest opacity-60">Motivo (opcional)</label>
              <textarea rows={3} value={obs} onChange={e => setObs(e.target.value)}
                placeholder="Descreva o que busca..."
                className="brutalist-border rounded-xl p-3 font-bold focus:outline-none bg-brand-gray resize-none"/>
            </div>
          </BrutalistCard>

          {erro && <p className="font-bold text-red-600">{erro}</p>}

          <BrutalistButton type="submit" disabled={enviando} className="text-lg">
            {enviando ? 'Enviando...' : 'Confirmar Agendamento'}
          </BrutalistButton>
        </form>
      </section>
    </div>
  )
}
