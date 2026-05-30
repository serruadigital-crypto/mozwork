'use client';

import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const categories = [
  { name: 'Design & Criativo', icon: '🎨', slug: 'design', count: 0 },
  { name: 'Programação & Tech', icon: '💻', slug: 'programacao', count: 0 },
  { name: 'Marketing Digital', icon: '📱', slug: 'marketing', count: 0 },
  { name: 'Redação & Tradução', icon: '✍️', slug: 'redacao', count: 0 },
  { name: 'Vídeo & Animação', icon: '🎬', slug: 'video', count: 0 },
  { name: 'Fotografia', icon: '📸', slug: 'fotografia', count: 0 },
  { name: 'Consultoria & Negócios', icon: '💼', slug: 'consultoria', count: 0 },
  { name: 'Educação & Formação', icon: '📚', slug: 'educacao', count: 0 },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 via-green-700 to-green-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="green" className="mb-4 bg-green-500 text-white border-green-400">
            🇲🇿 O Marketplace Profissional de Moçambique
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Encontra os melhores<br />
            <span className="text-yellow-300">profissionais</span> do país
          </h1>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Contrata freelancers talentosos ou oferece os teus serviços.
            Pagamento seguro com escrow. Comissão de apenas 10%.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/search">
              <Button size="lg" className="bg-yellow-400 text-green-900 hover:bg-yellow-300 font-bold px-8">
                Procurar Serviços
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-800 px-8">
                Começar a Vender
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b py-8">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold text-green-600">10%</div>
            <div className="text-gray-500 text-sm">Comissão da plataforma</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600">100%</div>
            <div className="text-gray-500 text-sm">Pagamento seguro (escrow)</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600">MZN</div>
            <div className="text-gray-500 text-sm">Preços em Meticais</div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
            Explora por Categoria
          </h2>
          <p className="text-center text-gray-500 mb-10">Encontra o profissional certo para o teu projecto</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link key={cat.slug} href={`/search?category=${cat.slug}`}>
                <div className="bg-white rounded-xl p-6 text-center hover:shadow-md hover:border-green-200 border border-gray-100 transition-all cursor-pointer group">
                  <div className="text-4xl mb-3">{cat.icon}</div>
                  <div className="font-semibold text-gray-800 group-hover:text-green-600 transition-colors text-sm">
                    {cat.name}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">Como Funciona</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">🔍</div>
              <h3 className="font-bold text-lg mb-2">1. Pesquisa</h3>
              <p className="text-gray-500">Encontra o profissional ideal entre centenas de serviços disponíveis em Moçambique.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">💳</div>
              <h3 className="font-bold text-lg mb-2">2. Paga com Segurança</h3>
              <p className="text-gray-500">O teu dinheiro fica em escrow até a entrega ser confirmada. Pagamento 100% seguro.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">⭐</div>
              <h3 className="font-bold text-lg mb-2">3. Avalia</h3>
              <p className="text-gray-500">Recebe o trabalho, confirma e avalia. O profissional recebe 90% do valor.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-green-700 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Pronto para começar?</h2>
          <p className="text-green-200 mb-8 text-lg">
            Junta-te à comunidade de profissionais moçambicanos. Grátis para se registar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register?role=client">
              <Button size="lg" className="bg-white text-green-700 hover:bg-green-50 font-bold px-8">
                Contratar Profissionais
              </Button>
            </Link>
            <Link href="/auth/register?role=professional">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-green-600 px-8">
                Oferecer Serviços
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
