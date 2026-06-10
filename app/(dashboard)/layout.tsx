import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NavLink from './NavLink'
import LogoutButton from './LogoutButton'
import type { Agency } from '@/types/database'

const NAV_ITEMS = [
  { href: '/dashboard',    label: 'ダッシュボード', icon: '📊' },
  { href: '/referrals',   label: '紹介一覧',        icon: '👥' },
  { href: '/commissions', label: '報酬明細',        icon: '💴' },
  { href: '/settings',    label: '設定・URLコピー',  icon: '⚙️' },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data } = await supabase
    .from('agencies')
    .select('name, contact_name')
    .eq('user_id', user.id)
    .single()
  const agency = data as Pick<Agency, 'name' | 'contact_name'> | null

  return (
    <div className="min-h-screen flex bg-[#F5F5F5]">
      {/* サイドバー */}
      <aside className="w-60 shrink-0 bg-white flex flex-col border-r border-[#EEEEEE]">
        {/* ロゴ */}
        <div className="px-5 py-6 flex items-center gap-3">
          <div className="w-9 h-9 bg-[#06C755] rounded-full flex items-center justify-center shadow-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="7" r="4" stroke="white" strokeWidth="2.3"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#06C755] tracking-wider">REFERRAL</p>
            <p className="text-xs text-[#666666] leading-none mt-0.5">代理店管理</p>
          </div>
        </div>

        <div className="h-px bg-[#EEEEEE] mx-4" />

        {/* ナビゲーション */}
        <nav className="flex-1 py-4 px-3 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} href={item.href} icon={item.icon} label={item.label} />
          ))}
        </nav>

        <div className="h-px bg-[#EEEEEE] mx-4" />

        {/* ユーザー情報 & ログアウト */}
        <div className="px-4 py-5 space-y-3">
          <div className="flex items-center gap-3 px-1">
            <div className="w-8 h-8 rounded-full bg-[#E8F9EF] flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-[#06C755]">
                {agency?.name?.charAt(0) ?? '?'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#111111] truncate">{agency?.name ?? '—'}</p>
              <p className="text-xs text-[#666666] truncate">{agency?.contact_name ?? user.email}</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* メインコンテンツ */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
