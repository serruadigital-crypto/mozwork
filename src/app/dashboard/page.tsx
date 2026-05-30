import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatMZN } from '@/lib/utils'
import type { Gig, Order } from '@/types'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { PlusCircle, Star, Briefcase, ShoppingBag, TrendingUp, Eye } from 'lucide-react'

async function getDashboardData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('user_id', user.id).single()

  if (!profile) redirect('/auth/login')

  const isProfessional = profile.role === 'professional'

  const [gigsResult, ordersResult] = await Promise.all([
    isProfessional
      ? supabase.from('gigs').select('*, category:categories(*)').eq('professional_id', profile.id).order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    supabase.from('orders')
      .select('*, gig:gigs(title, cover_image)')
      .eq(isProfessional ? 'professional_id' : 'client_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  return {
    profile,
    gigs: (gigsResult.data ?? []) as Gig[],
    orders: (ordersResult.data ?? []) as Order[],
    isProfessional,
  }
}

const ORDER_STATUS_LABELS: Record<string, { label: string; variant: 'green' | 'blue' | 'yellow' | 'red' | 'gray' }> = {
  pending: { label: 'Pendente', variant: 'yellow' },
  in_progress: { label: 'Em progresso', variant: 'blue' },
  delivered: { label: 'Entregue', variant: 'green' },
  completed: { label: 'Concluído', variant: 'green' },
  cancelled: { label: 'Cancelado', variant: 'red' },
  disputed: { label: 'Disputado', variant: 'red' },
}

export default async function DashboardPage() {
  const { profile, gigs, orders, isProfessional } = await getDashboardData()

  const earnings = orders
    .filter((o: Order) => o.status === 'completed')
    .reduce((sum: number, o: Order) => sum + (isProfessional ? o.professional_earnings : 0), 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Olá, {profile.full_name.split(' ')[0]} 👋</h1>
          <p className="text-slate-500 text-sm mt-1">{isProfessional ? 'Painel do profissional' : 'Painel do cliente'}</p>
        </div>
        {isProfessional && (
          <Link href="/gigs/new">
            <Button className="gap-2"><PlusCircle className="w-4 h-4" /> Novo Gig</Button>
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard icon={<Briefcase className="w-5 h-5 text-emerald-600" />}
          label={isProfessional ? 'Gigs activos' : 'Serviços comprados'}
          value={isProfessional ? gigs.filter((g: Gig) => g.status === 'active').length : orders.length} />
        <StatCard icon={<ShoppingBag className="w-5 h-5 text-blue-600" />} label="Encomendas" value={orders.length} />
        <StatCard icon={<Star className="w-5 h-5 text-amber-500" />} label="Avaliação"
          value={profile.rating > 0 ? `${profile.rating.toFixed(1)} ★` : '—'} />
        {isProfessional && (
          <StatCard icon={<TrendingUp className="w-5 h-5 text-emerald-600" />} label="Total ganho" value={formatMZN(earnings)} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gigs */}
        {isProfessional && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Os meus gigs</h2>
            {gigs.length === 0 ? (
              <EmptyState icon="🛠️" title="Ainda sem gigs"
                description="Cria o teu primeiro gig e começa a receber clientes."
                action={<Link href="/gigs/new"><Button>Criar gig</Button></Link>} />
            ) : (
              <div className="space-y-3">
                {gigs.map((gig: Gig) => (
                  <Link key={gig.id} href={`/gigs/${gig.id}`}
                    className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-4 hover:border-slate-200 transition-colors block">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-xl overflow-hidden shrink-0">
                      {gig.cover_image
                        ? <img src={gig.cover_image} alt="" className="w-full h-full object-cover rounded-xl" />
                        : (gig.category as any)?.icon ?? '🛠️'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{gig.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-emerald-600 font-medium">{formatMZN(gig.price)}</span>
                        <span className="flex items-center gap-0.5 text-xs text-slate-400">
                          <Eye className="w-3 h-3" /> {gig.views ?? 0}
                        </span>
                      </div>
                    </div>
                    <Badge variant={gig.status === 'active' ? 'green' : 'gray'}>
                      {gig.status === 'active' ? 'Activo' : 'Pausado'}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Encomendas recentes */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Encomendas recentes</h2>
          {orders.length === 0 ? (
            <EmptyState icon="📦" title="Ainda sem encomendas"
              description={isProfessional ? 'As tuas encomendas aparecem aqui.' : 'Explora serviços e faz a tua primeira encomenda.'}
              action={!isProfessional ? <Link href="/search"><Button variant="outline">Explorar serviços</Button></Link> : undefined} />
          ) : (
            <div className="space-y-3">
              {orders.map((order: Order) => {
                const status = ORDER_STATUS_LABELS[order.status] ?? { label: order.status, variant: 'gray' as const }
                return (
                  <div key={order.id} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {(order.gig as any)?.title ?? 'Serviço'}
                      </p>
                      <p className="text-xs text-emerald-600 font-medium mt-0.5">{formatMZN(order.amount)}</p>
                    </div>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Banner de perfil incompleto */}
      {isProfessional && (!profile.bio || !profile.skills?.length) && (
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-amber-800">Completa o teu perfil</p>
            <p className="text-xs text-amber-600 mt-0.5">Perfis completos recebem 3× mais clientes.</p>
          </div>
          <Link href="/profile">
            <Button variant="secondary" size="sm">Completar perfil</Button>
          </Link>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <div className="flex items-center gap-2 mb-3">{icon}<span className="text-xs text-slate-500 font-medium">{label}</span></div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  )
}

function EmptyState({ icon, title, description, action }: { icon: string; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
      <div className="text-3xl mb-3">{icon}</div>
      <p className="font-medium text-slate-900 mb-1">{title}</p>
      <p className="text-sm text-slate-500 mb-4">{description}</p>
      {action}
    </div>
  )
}
