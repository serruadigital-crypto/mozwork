import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatMZN, formatDate } from '@/lib/utils'
import type { Gig, Review } from '@/types'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Star, Clock, RefreshCw, CheckCircle, MapPin } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getGig(id: string) {
  const supabase = await createClient()

  const { data: gig } = await supabase
    .from('gigs')
    .select('*, profile:profiles(*), category:categories(*)')
    .eq('id', id)
    .eq('status', 'active')
    .single()

  if (!gig) return null

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, reviewer:profiles!reviewer_id(full_name, avatar_url, username)')
    .eq('reviewee_id', gig.professional_id)
    .order('created_at', { ascending: false })
    .limit(5)

  return { gig: gig as Gig, reviews: (reviews ?? []) as Review[] }
}

export default async function GigPage({ params }: PageProps) {
  const { id } = await params
  const result = await getGig(id)
  if (!result) notFound()

  const { gig, reviews } = result
  const { profile, category } = gig

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Conteúdo principal */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            {category && (
              <Link href={`/search?category=${category.slug}`}>
                <Badge variant="green" className="mb-3">{category.icon} {category.name}</Badge>
              </Link>
            )}
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">{gig.title}</h1>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden">
                  {profile?.avatar_url
                    ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    : <span className="text-emerald-700 font-semibold">{profile?.full_name?.[0]}</span>}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{profile?.full_name}</p>
                  <p className="text-xs text-slate-500">@{profile?.username}</p>
                </div>
              </div>
              {profile && profile.rating > 0 && (
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-slate-900">{profile.rating.toFixed(1)}</span>
                  <span className="text-slate-500">({profile.total_reviews})</span>
                </div>
              )}
              {profile?.location && (
                <div className="flex items-center gap-1 text-sm text-slate-500">
                  <MapPin className="w-3.5 h-3.5" /> {profile.location}
                </div>
              )}
            </div>
          </div>

          {/* Imagem de capa */}
          <div className="rounded-3xl overflow-hidden bg-slate-100 aspect-video">
            {gig.cover_image
              ? <img src={gig.cover_image} alt={gig.title} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                  <span className="text-6xl mb-2">{category?.icon ?? '🛠️'}</span>
                  <span className="text-sm">Sem imagem de capa</span>
                </div>}
          </div>

          {/* Descrição */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Sobre este serviço</h2>
            <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{gig.description}</div>
          </div>

          {/* Tags */}
          {gig.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {gig.tags.map(tag => (
                <Link key={tag} href={`/search?q=${tag}`}>
                  <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full hover:bg-emerald-100 hover:text-emerald-700 transition-colors">
                    #{tag}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {/* Sobre o profissional */}
          {profile && (
            <div className="bg-white rounded-3xl border border-slate-100 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Sobre o profissional</h2>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden shrink-0">
                  {profile.avatar_url
                    ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    : <span className="text-emerald-700 font-bold text-xl">{profile.full_name?.[0]}</span>}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{profile.full_name}</p>
                  {profile.bio && <p className="text-sm text-slate-500 mt-1 line-clamp-3">{profile.bio}</p>}
                  {profile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {profile.skills.slice(0, 6).map(skill => (
                        <Badge key={skill} variant="gray">{skill}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Reviews */}
          {reviews.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Avaliações <span className="text-slate-400 font-normal">({profile?.total_reviews})</span>
              </h2>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-2xl border border-slate-100 p-5">
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-600">
                        {(review.reviewer as any)?.full_name?.[0] ?? 'C'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{(review.reviewer as any)?.full_name}</p>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                          ))}
                        </div>
                      </div>
                      <span className="ml-auto text-xs text-slate-400">{formatDate(review.created_at)}</span>
                    </div>
                    <p className="text-sm text-slate-600">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar — card de compra */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-xs text-slate-500">A partir de</span>
                  <span className="text-3xl font-bold text-slate-900">{formatMZN(gig.price)}</span>
                </div>
              </div>

              <div className="p-6 space-y-3">
                <div className="flex items-center gap-2.5 text-sm text-slate-600">
                  <Clock className="w-4 h-4 text-slate-400" />
                  Entrega em {gig.delivery_days} {gig.delivery_days === 1 ? 'dia' : 'dias'}
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-600">
                  <RefreshCw className="w-4 h-4 text-slate-400" />
                  {gig.revisions === 99 ? 'Revisões ilimitadas' : gig.revisions === 0 ? 'Sem revisões' : `${gig.revisions} revisão${gig.revisions > 1 ? 'ões' : ''}`}
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Pagamento seguro em escrow
                </div>
              </div>

              <div className="px-6 pb-6">
                <Button className="w-full" size="lg">Contratar agora</Button>
                <p className="text-center text-xs text-slate-400 mt-3">
                  Só pagas quando o trabalho for aprovado
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
