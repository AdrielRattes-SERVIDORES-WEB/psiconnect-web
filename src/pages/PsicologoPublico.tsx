import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import BrutalistCard from '../components/BrutalistCard'
import BrutalistButton from '../components/BrutalistButton'
import api from '../lib/api'

interface Psicologo {
  id: string
  nome: string
  bio: string
  crp: string
  especialidades: string[]
  abordagem: string
  valorConsulta: number
  fotoPerfil?: string
}

const HORARIOS = ['08:00','09:00','10:00','11:00','14:00','15:00','16:00','17:00','18:00']
const DIAS_SEMANA = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

function proximosDias(qtd: number) {
  const dias = []
  const hoje = new Date()
  for (let i = 1; i <= qtd; i++) {
    const d = new Date(hoje)
    d.setDate(hoje.getDate() + i)
    if (d.getDay() !== 0) dias.push(d)
    if (dias.length === qtd) break
  }
  return dias
}

export default function PsicologoPublico() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [psi, setPsi] = useState<Psicologo | null>(null)
  const [loading, setLoading] = useState(true)
  const [diaSelecionado, setDiaSelecionado] = useState<Date | null>(null)
  const [horarioSelecionado, setHorarioSelecionado] = useState('')
  const [modalidade, setModalidade] = useState<'online' | 'presencial'>('online')
  const [form, setForm] = useState({ nome: '', email: '', observacoes: '' })
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

  const agendar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!diaSelecionado || !horarioSelecionado) { setErro('Selecione data e horário.'); return }
    setErro('')
    setEnviando(true)
    try {
      const [h, m] = horarioSelecionado.split(':')
      const dataHora = new Date(diaSelecionado)
      dataHora.setHours(Number(h), Number(m), 0)
      await api.post('/api/agendamentos/publico', {
        psicologoId: psi!.id,
        pacienteNome: form.nome,
        pacienteEmail: form.email,
        dataHora: dataHora.toISOString(),
        modalidade,
        observacoes: form.observacoes,
      })
      setSucesso(true)
    } catch {
      setErro('Erro ao agendar. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  if (loading) return <div className="flex-1 flex items-center justify-center p-12 font-heading font-black text-2xl animate-pulse">Carregando...</div>
  if (!psi) return null

  if (sucesso) return (
    <div className="flex-1 flex items-center justify-center p-8">
      <BrutalistCard className="w-full max-w-lg flex flex-col gap-6 text-center items-center">
        <div className="w-20 h-20 bg-green-400 rounded-full flex items-center justify-center text-4xl">✓</div>
        <h1 className="text-4xl font-black font-heading uppercase">Agendado!</h1>
        <p className="text-gray-600 font-medium">
          Seu agendamento foi enviado para <strong>{psi.nome}</strong>.<br />
          Você receberá uma confirmação por e-mail.
        </p>
        <div className="bg-yellow-100 border-2 border-yellow-400 p-4 w-full text-left rounded-xl">
          <p className="font-heading font-black text-xs uppercase mb-1">Próximo passo</p>
          <p className="text-sm">Aguarde a confirmação do psicólogo. O link do Google Meet será enviado por e-mail.</p>
        </div>
        <BrutalistButton onClick={() => navigate('/')}>Voltar ao início</BrutalistButton>
      </BrutalistCard>
    </div>
  )

  return (
    <div className="flex-1 bg-brand-gray">

      {/* HERO DO PSICÓLOGO */}
      <section className="bg-white border-b-2 border-black px-6 py-12">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-center">
          <div className="w-32 h-32 rounded-full bg-black flex items-center justify-center text-white text-5xl font-black font-heading shrink-0">
            {psi.fotoPerfil ? <img src={psi.fotoPerfil} className="w-full h-full rounded-full object-cover" /> : psi.nome[0]}
          </div>
          <div className="flex flex-col gap-3 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-black font-heading uppercase">{psi.nome}</h1>
            <p className="text-sm font-bold text-gray-500 uppercase">CRP {psi.crp}</p>
            {psi.especialidades?.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {psi.especialidades.map(e => (
                  <span key={e} className="bg-black text-white text-xs font-bold font-heading uppercase px-3 py-1 rounded-full">{e}</span>
                ))}
              </div>
            )}
            {psi.abordagem && <p className="text-gray-600 font-medium">{psi.abordagem}</p>}
          </div>
          <div className="md:ml-auto text-center shrink-0">
            <div className="text-4xl font-black font-heading">R$ {psi.valorConsulta?.toFixed(2)}</div>
            <div className="text-xs font-bold uppercase opacity-60">por sessão</div>
          </div>
        </div>
      </section>

      {psi.bio && (
        <section className="bg-white border-b-2 border-black px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-gray-700 font-medium leading-relaxed">{psi.bio}</p>
          </div>
        </section>
      )}

      {/* FORMULÁRIO DE AGENDAMENTO */}
      <section className="px-6 py-12 max-w-4xl mx-auto w-full">
        <h2 className="text-4xl font-black font-heading uppercase mb-8">Agendar Consulta</h2>
        <form onSubmit={agendar} className="flex flex-col gap-8">

          {/* Modalidade */}
          <BrutalistCard padding="p-6" className="flex flex-col gap-4">
            <h3 className="font-heading font-black text-xs uppercase tracking-widest opacity-60">Modalidade</h3>
            <div className="flex gap-3">
              {(['online','presencial'] as const).map(m => (
                <button key={m} type="button" onClick={() => setModalidade(m)}
                  className={`flex-1 py-3 rounded-full font-heading font-bold text-sm uppercase border-2 transition-all ${modalidade === m ? 'bg-black text-white border-black' : 'border-black hover:bg-black hover:text-white'}`}>
                  {m === 'online' ? '🎥 Online (Google Meet)' : '🏢 Presencial'}
                </button>
              ))}
            </div>
          </BrutalistCard>

          {/* Selecionar data */}
          <BrutalistCard padding="p-6" className="flex flex-col gap-4">
            <h3 className="font-heading font-black text-xs uppercase tracking-widest opacity-60">Escolha o dia</h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {dias.map(dia => (
                <button key={dia.toISOString()} type="button"
                  onClick={() => { setDiaSelecionado(dia); setHorarioSelecionado('') }}
                  className={`flex flex-col items-center min-w-[64px] py-3 px-2 rounded-2xl border-2 transition-all font-heading font-bold ${diaSelecionado?.toDateString() === dia.toDateString() ? 'bg-black text-white border-black' : 'bg-white border-black hover:bg-black hover:text-white'}`}>
                  <span className="text-xs uppercase">{DIAS_SEMANA[dia.getDay()]}</span>
                  <span className="text-2xl font-black">{dia.getDate()}</span>
                </button>
              ))}
            </div>
          </BrutalistCard>

          {/* Horários */}
          {diaSelecionado && (
            <BrutalistCard padding="p-6" className="flex flex-col gap-4">
              <h3 className="font-heading font-black text-xs uppercase tracking-widest opacity-60">Escolha o horário</h3>
              <div className="flex flex-wrap gap-3">
                {HORARIOS.map(h => (
                  <button key={h} type="button" onClick={() => setHorarioSelecionado(h)}
                    className={`py-2 px-5 rounded-full border-2 font-heading font-bold text-sm transition-all ${horarioSelecionado === h ? 'bg-black text-white border-black' : 'border-black hover:bg-black hover:text-white'}`}>
                    {h}
                  </button>
                ))}
              </div>
            </BrutalistCard>
          )}

          {/* Dados pessoais */}
          <BrutalistCard padding="p-6" className="flex flex-col gap-4">
            <h3 className="font-heading font-black text-xs uppercase tracking-widest opacity-60">Seus dados</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-heading font-black text-[10px] uppercase tracking-widest opacity-60">Nome completo</label>
                <input required value={form.nome} onChange={e => setForm({...form, nome: e.target.value})}
                  placeholder="Seu nome" className="brutalist-border rounded-xl p-4 font-bold focus:outline-none bg-brand-gray" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-heading font-black text-[10px] uppercase tracking-widest opacity-60">E-mail</label>
                <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  placeholder="seu@email.com" className="brutalist-border rounded-xl p-4 font-bold focus:outline-none bg-brand-gray" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-heading font-black text-[10px] uppercase tracking-widest opacity-60">Motivo / Observações (opcional)</label>
              <textarea rows={3} value={form.observacoes} onChange={e => setForm({...form, observacoes: e.target.value})}
                placeholder="Descreva brevemente o que busca..." className="brutalist-border rounded-xl p-4 font-bold focus:outline-none bg-brand-gray resize-none" />
            </div>
          </BrutalistCard>

          {erro && <p className="text-red-600 font-bold">{erro}</p>}

          <BrutalistButton type="submit" disabled={enviando} className="text-lg w-full md:w-auto self-start">
            {enviando ? 'Enviando...' : `Confirmar Agendamento${modalidade === 'online' ? ' — Google Meet' : ''}`}
          </BrutalistButton>
        </form>
      </section>
    </div>
  )
}
