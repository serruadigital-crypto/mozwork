import { createClient } from '@/lib/supabase/server'
import { formatMZN } from '@/lib/utils'
import type { Gig, Category } from '@/types'
import Link from 'next/link'
import { Star, SlidersHorizontal } from 'lucide-react'

interface SearchPageProps {
  searchParams: Promise<{ q?: string; category?: string; min?: string; max?: string; sort?: string }>
}

async function searchGigs(params: { q?: string; category?: string; min?: string; max?: string; sort?: string }) {
  const supabase = await createClient()

  let query = supabase
    .from('gigs')
    .select('*, profile:profiles(*), category:categories(*)')
    .eq('status', 'active')

  if (params.category) {
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', params.category).single()
    if (cat) query = query.eq('category_id', cat.id)
  }

  if (params.q) {
    query = query.or(`title.ilike.%${params.q}%,description.ilike.%${params.q}%`)
  }

  if (params.min) query = query.gte('price', parseFloat(params.min))
  if (params.max) query = query.lte('price', parseFloat(params.max))

  const sortAsc = params.sort === 'price_asc'
  const sortField = params.sort?.startsWith('price') ? 'price' : 'created_at'
  query = query.order(sortField, { ascending: sortAsc })

  const { data } = await query.limit(24)
  return (data ?? []) as Gig[]
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  const [gigs, { data: categories }] = await Promise.all([
    searchGigs(params),
    supabase.from('categories').select('*').order('sort_order'),
  ])

  const currentCategory = (categories as Category[])?.find(c => c.slug === params.category)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {params.q ? `Resultados para "${params.q}"` : currentCategory ? currentCategory.name : 'Todos os serviços'}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {gigs.length} serviço{gigs.length !== 1 ? 's' : ''} encontrado{gigs.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex gap-8">
        {/* Filtros */}
        <aside className="w-56 shrink-0 hidden lg:block">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-6 sticky top-24">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Categorias</h3>
              <div className="space-y-1">
                <Link href={`/search${params.q ? `?q=${params.q}` : ''}`}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${!params.category ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>
                  Todas as categorias
                </Link>
                {(categories as Category[])?.map(cat => (
                  <Link key={cat.id}
                    href={`/search?category=${cat.slug}${params.q ? `&q=${params.q}` : ''}`}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${params.category === cat.slug ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>
                    <span>{cat.icon}</span>
                    <span className="truncate">{cat.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Resultados */}
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-5">
            <SlidersHorizontal className="w-4 h-4" /> Ordenar:
            {[
              { value: '', label: 'Mais recente' },
              { value: 'price_asc', label: 'Menor preço' },
              { value: 'price_desc', label: 'Maior preço' },
            ].map(opt => (
              <Link key={opt.value}
                href={`/search?${new URLSearchParams({ ...params, sort: opt.value }).toString()}`}
                className={`px-3 py-1 rounded-full text-xs transition-colors ${(params.sort ?? '') === opt.value ? 'bg-emerald-100 text-emerald-700 font-medium' : 'hover:bg-slate-100'}`}>
                {opt.label}
              </Link>
            ))}
          </div>

          {gigs.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-lg font-medium text-slate-700 mb-2">Nenhum resultado</p>
              <p className="text-sm">Tenta pesquisar por outro termo ou categoria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {gigs.map((gig) => (
                <Link key={gig.id} href={`/gigs/${gig.id}`}
                  className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:border-slate-200 transition-all duration-200">
                  <div className="aspect-video bg-slate-100 overflow-hidden">
                    {gig.cover_image
                      ? <img src={gig.cover_image} alt={gig.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <div className="w-full h-full flex items-center justify-center text-4xl">{gig.category?.icon ?? '🛠️'}</div>}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-semibold text-emerald-700 overflow-hidden">
                        {gig.profile?.avatar_url
                          ? <img src={gig.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                          : gig.profile?.full_name?.[0] ?? 'P'}
                      </div>
                      <span className="text-xs text-slate-500 truncate">{gig.profile?.full_name}</span>
                      {gig.profile && gig.profile.rating > 0 && (
                        <span className="ml-auto flex items-center gap-0.5 text-xs text-amber-500 shrink-0">
                          <Star className="w-3 h-3 fill-current" /> {gig.profile.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-medium text-slate-900 line-clamp-2 mb-3 group-hover:text-emerald-600 transition-colors">
                      {gig.title}
                    </h3>
                    <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                      <span className="text-xs text-slate-400">A partir de</span>
                      <span className="text-sm font-bold text-slate-900">{formatMZN(gig.price)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
