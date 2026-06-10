import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ReferralTable from '@/components/dashboard/ReferralTable'
import type { Agency, Prospect, ProspectStatus } from '@/types/database'

const STATUS_LABELS: Record<ProspectStatus | 'all', string> = {
  all:         'すべて',
  registered:  'LINE登録済み',
  surveyed:    'アンケート回答済み',
  booked:      'Zoom予約済み',
  met:         '商談済み',
  contracted:  '成約',
  lost:        '失注',
}

interface Props {
  searchParams: Promise<{ status?: string }>
}

export default async function ReferralsPage({ searchParams }: Props) {
  const { status } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: agencyData } = await supabase
    .from('agencies')
    .select('id')
    .eq('user_id', user.id)
    .single()
  const agency = agencyData as Pick<Agency, 'id'> | null

  if (!agency) redirect('/login')

  const validStatuses: ProspectStatus[] = ['registered', 'surveyed', 'booked', 'met', 'contracted', 'lost']

  let query = supabase
    .from('prospects')
    .select('*')
    .eq('agency_id', agency.id)
    .order('created_at', { ascending: false })

  if (status && validStatuses.includes(status as ProspectStatus)) {
    query = query.eq('status', status)
  }

  const { data } = await query
  const prospects = (data ?? []) as Prospect[]

  const tabs = ['all', ...validStatuses] as const

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#111111]">紹介一覧</h1>
        <p className="text-sm text-[#666666] mt-1">あなたが紹介した見込み客の全履歴</p>
      </div>

      {/* ステータスフィルタータブ */}
      <div className="flex flex-wrap gap-2">
        {tabs.map(s => {
          const isActive = (s === 'all' && !status) || s === status
          return (
            <a
              key={s}
              href={s === 'all' ? '/referrals' : `/referrals?status=${s}`}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#06C755] text-white shadow-sm'
                  : 'bg-white border border-[#EEEEEE] text-[#666666] hover:border-[#06C755] hover:text-[#06C755]'
              }`}
            >
              {STATUS_LABELS[s]}
            </a>
          )
        })}
      </div>

      <ReferralTable prospects={prospects} />
    </div>
  )
}
