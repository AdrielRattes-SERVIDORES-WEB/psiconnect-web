import { Link } from 'react-router-dom'
import BrutalistButton from '../components/BrutalistButton'
import BrutalistCard from '../components/BrutalistCard'

const beneficios = [
  { titulo: 'Sua clínica online', desc: 'Crie sua página personalizada e receba agendamentos 24h por dia.' },
  { titulo: 'Agenda inteligente', desc: 'Gerencie seus horários, confirme sessões e evite faltas.' },
  { titulo: 'Pacientes em um clique', desc: 'Seus pacientes agendam direto pelo seu link — sem complicação.' },
]

export default function Home() {
  return (
    <div className="flex flex-col">

      {/* HERO */}
      <section className="bg-white border-b-2 border-black px-6 py-16 md:py-24">
        <div className="max-w-4xl mx-auto flex flex-col gap-8 text-center items-center">
          <h1 className="text-5xl md:text-7xl font-black font-heading uppercase leading-tight">
            Sua Clínica de Psicologia Online
          </h1>
          <p className="text-xl md:text-2xl font-medium text-gray-600 max-w-2xl">
            Crie sua página profissional, receba agendamentos e gerencie seus pacientes — tudo em um lugar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/cadastro?papel=psicologo">
              <BrutalistButton className="text-lg">Sou Psicólogo — Começar grátis</BrutalistButton>
            </Link>
            <Link to="/psicologos">
              <BrutalistButton variant="secondary" className="text-lg">Encontrar Psicólogo</BrutalistButton>
            </Link>
          </div>
        </div>
      </section>

      {/* PROBLEMA */}
      <section className="bg-black text-white px-6 py-20">
        <div className="max-w-3xl mx-auto flex flex-col gap-10">
          <h2 className="text-4xl md:text-5xl font-bold font-heading">
            Chega de agenda no WhatsApp e planilha bagunçada.
          </h2>
          <div className="flex flex-col gap-4">
            {['Pacientes sem saber seu horário disponível', 'Confirmações manuais que tomam seu tempo', 'Sem presença online profissional'].map((item) => (
              <div key={item} className="flex items-center gap-6 bg-white/10 p-6 border-2 border-white/20 rounded-2xl">
                <div className="bg-white text-black p-2 rounded-lg text-xl font-black">✗</div>
                <span className="text-xl font-bold">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="px-6 py-24 max-w-6xl mx-auto w-full">
        <h2 className="text-5xl font-bold font-heading text-center uppercase mb-16">Como funciona</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {beneficios.map((b, i) => (
            <BrutalistCard key={i} className="flex flex-col gap-4">
              <div className="bg-black text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black font-heading">
                {i + 1}
              </div>
              <h3 className="text-2xl font-bold font-heading">{b.titulo}</h3>
              <p className="text-gray-600 font-medium">{b.desc}</p>
            </BrutalistCard>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="px-6 pb-24 max-w-4xl mx-auto w-full">
        <div className="bg-black text-white rounded-[2.5rem] p-16 flex flex-col items-center text-center gap-8">
          <h2 className="text-5xl font-bold font-heading">Comece hoje.</h2>
          <p className="text-xl text-gray-400 max-w-md">
            Crie sua conta gratuitamente e tenha sua clínica online em minutos.
          </p>
          <Link to="/cadastro?papel=psicologo">
            <BrutalistButton variant="secondary" className="text-lg">Criar minha conta</BrutalistButton>
          </Link>
        </div>
      </section>

    </div>
  )
}
