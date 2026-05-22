import { Link } from 'react-router-dom'

export default function FooterPublico() {
  return (
    <footer className="bg-white border-t-2 border-black mt-auto">
      <div className="max-w-2xl mx-auto px-6 py-10 flex flex-col gap-8">

        {/* Logo + copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-black font-heading uppercase text-lg text-black tracking-tighter">
            Psiconnect
          </span>
          <span className="text-xs font-bold uppercase text-black opacity-40">
            © {new Date().getFullYear()} Psiconnect. Todos os direitos reservados.
          </span>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center md:justify-start gap-6 border-t-2 border-black pt-6">
          {[
            { label: 'Termos de Serviço', to: '/termos' },
            { label: 'Privacidade',       to: '/privacidade' },
            { label: 'Contato',           to: '/contato' },
          ].map(l => (
            <Link key={l.to} to={l.to}
              className="text-xs font-bold uppercase text-black hover:underline underline-offset-4 transition-all">
              {l.label}
            </Link>
          ))}
        </div>

        {/* Formas de pagamento */}
        <div className="flex flex-col gap-3 border-t-2 border-black pt-6">
          <p className="text-[10px] font-black font-heading uppercase text-black opacity-40 tracking-widest">
            Formas de pagamento
          </p>
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'PIX',     icon: '⚡' },
              { label: 'Crédito', icon: '💳' },
              { label: 'Débito',  icon: '🏦' },
              { label: 'PayPal',  icon: '🅿' },
              { label: 'Boleto',  icon: '📄' },
            ].map(p => (
              <div key={p.label}
                className="flex items-center gap-1.5 border-2 border-black px-3 py-1.5 rounded-lg bg-white">
                <span className="text-sm">{p.icon}</span>
                <span className="text-xs font-black font-heading uppercase text-black">{p.label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </footer>
  )
}
