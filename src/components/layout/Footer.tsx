import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="font-bold text-white text-lg">MozWork</span>
            </div>
            <p className="text-sm leading-relaxed">
              O marketplace profissional de Moçambique. Conectamos talentos locais com oportunidades reais.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Para Clientes</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/search" className="hover:text-white transition-colors">Encontrar serviços</Link></li>
              <li><Link href="/auth/register" className="hover:text-white transition-colors">Criar conta</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Como funciona</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Para Profissionais</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/auth/register?role=professional" className="hover:text-white transition-colors">Tornar-se profissional</Link></li>
              <li><Link href="/gigs/new" className="hover:text-white transition-colors">Criar gig</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Guia do vendedor</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">MozWork</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">Sobre nós</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Termos de serviço</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Privacidade</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Contacto</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© 2025 MozWork. Todos os direitos reservados.</p>
          <p>Feito com 💚 em Moçambique</p>
        </div>
      </div>
    </footer>
  )
}
