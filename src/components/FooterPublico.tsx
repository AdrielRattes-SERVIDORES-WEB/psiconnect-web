import { Link } from 'react-router-dom'

export default function FooterPublico() {
  return (
    <footer className="bg-white border-t-2 border-black mt-auto">
      <div className="max-w-2xl mx-auto px-6 py-5 flex flex-col gap-4">

        {/* Links + pagamentos numa linha */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-wrap gap-5">
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

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black font-heading uppercase text-black tracking-widest">
              Formas de pagamento
            </span>
            {[
              { label: 'PIX', icon: '⚡' },
              { label: 'Crédito', icon: '💳' },
              { label: 'Débito', icon: '🏦' },
              { label: 'PayPal', icon: '🅿' },
              { label: 'Boleto', icon: '📄' },
            ].map(p => (
              <div key={p.label}
                className="flex items-center gap-1 border border-black px-2 py-1 rounded-md">
                <span className="text-xs">{p.icon}</span>
                <span className="text-[10px] font-black font-heading uppercase text-black">{p.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Copyright — último item */}
        <div className="border-t border-gray-200 pt-3">
          <p className="text-[10px] font-bold uppercase text-black opacity-40 text-center">
            Psiconnect © {new Date().getFullYear()} Psiconnect. Todos os direitos reservados.
          </p>
        </div>

      </div>
    </footer>
  )
}
