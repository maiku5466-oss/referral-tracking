import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import StatsCard from '@/components/dashboard/StatsCard'
import ReferralTable from '@/components/dashboard/ReferralTable'
import type { Agency, Prospect } from '@/types/database'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: agencyData } = await supabase
    .from('agencies')
    .select('id, name, commission_rate')
    .eq('user_id', user.id)
    .single()
  const agency = agencyData as Pick<Agency, 'id' | 'name' | 'commission_rate'> | null

  if (!agency) redirect('/login')

  const { data: prospectsData } = await supabase
    .from('prospects')
    .select('*')
    .eq('agency_id', agency.id)
    .order('created_at', { ascending: false })
  const prospects = (prospectsData ?? []) as Prospect[]

  const bookings   = prospects.filter(p => ['booked', 'met', 'contracted'].includes(p.status))
  const contracted = prospects.filter(p => p.status === 'contracted')

  const estimatedCommission = contracted.reduce((sum, p) => {
    if (!p.contract_amount) return sum
    return sum + (p.contract_amount * agency.commission_rate) / 100
  }, 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#111111]">ダッシュボード</h1>
        <p className="text-sm text-[#666666] mt-1">{agency.name} の紹介実績サマリー</p>
      </div>

      {/* KPI カード */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          title="総紹介数"
          value={prospects.length}
          sub="LINE登録した見込み客の累計"
          icon="👥"
        />
        <StatsCard
          title="Zoom予約数"
          value={bookings.length}
          sub="予約済み〜成約を含む"
          icon="📅"
        />
        <StatsCard
          title="成約数"
          value={contracted.length}
          sub="確定した成約の累計"
          icon="✅"
        />
        <StatsCard
          title="見込み報酬"
          value={`¥${Math.round(estimatedCommission).toLocaleString('ja-JP')}`}
          sub={`成約金額 × ${agency.commission_rate}%（承認前概算）`}
          icon="💴"
          highlight
        />
      </div>

      {/* 最近の紹介 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#111111]">最近の紹介</h2>
          <Link
            href="/referrals"
            className="text-sm text-[#06C755] font-medium hover:text-[#05A847] transition-colors"
          >
            全件表示 →
          </Link>
        </div>
        <ReferralTable prospects={prospects.slice(0, 10)} compact />
      </div>
    </div>
  )
}
