import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CommissionTable from '@/components/dashboard/CommissionTable'
import StatsCard from '@/components/dashboard/StatsCard'
import type { Agency, Commission } from '@/types/database'

type CommissionWithProspect = Commission & {
  prospect: { company_name: string | null; name: string | null } | null
}

export default async function CommissionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: agencyData } = await supabase
    .from('agencies')
    .select('id, commission_rate')
    .eq('user_id', user.id)
    .single()
  const agency = agencyData as Pick<Agency, 'id' | 'commission_rate'> | null

  if (!agency) redirect('/login')

  const { data } = await supabase
    .from('commissions')
    .select('*, prospect:prospects(company_name, name)')
    .eq('agency_id', agency.id)
    .order('created_at', { ascending: false })
  const commissions = (data ?? []) as CommissionWithProspect[]

  const pending   = commissions.filter(c => c.status === 'pending')
  const confirmed = commissions.filter(c => c.status === 'confirmed')
  const paid      = commissions.filter(c => c.status === 'paid')

  const sum = (arr: Commission[]) => arr.reduce((s, c) => s + Number(c.amount), 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#111111]">報酬明細</h1>
        <p className="text-sm text-[#666666] mt-1">
          成約ベースの報酬履歴（報酬率: {agency.commission_rate}%）
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatsCard
          title="承認待ち"
          value={`¥${Math.round(sum(pending)).toLocaleString('ja-JP')}`}
          sub={`${pending.length}件`}
          icon="⏳"
        />
        <StatsCard
          title="承認済み（未払い）"
          value={`¥${Math.round(sum(confirmed)).toLocaleString('ja-JP')}`}
          sub={`${confirmed.length}件`}
          icon="✔️"
        />
        <StatsCard
          title="支払済み累計"
          value={`¥${Math.round(sum(paid)).toLocaleString('ja-JP')}`}
          sub={`${paid.length}件`}
          icon="💴"
          highlight
        />
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-[#111111]">報酬履歴</h2>
        <CommissionTable commissions={commissions} />
      </div>
    </div>
  )
}
