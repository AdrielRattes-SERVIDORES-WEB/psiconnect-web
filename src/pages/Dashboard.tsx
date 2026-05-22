import { useAuth } from '../contexts/AuthContext'
import BrutalistCard from '../components/BrutalistCard'
import BrutalistButton from '../components/BrutalistButton'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { user, logout } = useAuth()

  if (!user || user.papel !== 'psicologo') {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <BrutalistCard className="text-center flex flex-col gap-4">
          <h2 className="text-2xl font-black font-heading uppercase">Acesso negado</h2>
          <Link to="/login"><BrutalistButton>Entrar</BrutalistButton></Link>
        </BrutalistCard>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-brand-gray">
      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col gap-10">

        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl md:text-5xl font-black font-heading uppercase">Dashboard</h1>
            <p className="text-xl text-gray-500 font-medium">Bem-vindo, {user.nome}</p>
          </div>
          <button onClick={logout} className="text-xs font-bold uppercase underline underline-offset-4 opacity-50 hover:opacity-100">
            Sair
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BrutalistCard padding="p-6" className="flex flex-col gap-2">
            <span className="text-xs font-bold font-heading uppercase opacity-60">Agendamentos</span>
            <div className="text-4xl font-black font-heading">00</div>
          </BrutalistCard>
          <BrutalistCard padding="p-6" className="flex flex-col gap-2">
            <span className="text-xs font-bold font-heading uppercase opacity-60">Pacientes</span>
            <div className="text-4xl font-black font-heading">00</div>
          </BrutalistCard>
          <BrutalistCard padding="p-6" className="flex flex-col gap-2 cursor-pointer hover:bg-black hover:text-white transition-all group">
            <span className="text-xs font-bold font-heading uppercase opacity-60 group-hover:opacity-100">Minha Página</span>
            <div className="text-lg font-black font-heading uppercase mt-2">Ver →</div>
          </BrutalistCard>
        </div>

        <section className="flex flex-col gap-6">
          <h2 className="text-3xl font-bold font-heading uppercase">Próximos agendamentos</h2>
          <BrutalistCard className="flex items-center justify-center py-16 text-center flex flex-col gap-4">
            <p className="text-gray-500 font-bold uppercase text-sm">Nenhum agendamento ainda</p>
            <p className="text-gray-400 text-sm">Compartilhe seu link para receber agendamentos</p>
          </BrutalistCard>
        </section>

      </div>
    </div>
  )
}
