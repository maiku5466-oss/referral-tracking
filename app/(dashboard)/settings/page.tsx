import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import CopyButton from './CopyButton'
import type { Agency } from '@/types/database'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('agencies')
    .select('*')
    .eq('user_id', user.id)
    .single()
  const agency = data as Agency | null

  if (!agency) redirect('/login')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://your-domain.com'
  const referralUrl = `${appUrl}/r/${agency.referral_code}`

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-[#111111]">設定</h1>
        <p className="text-sm text-[#666666] mt-1">プロフィールと紹介リンクの確認</p>
      </div>

      {/* 紹介リンク */}
      <Card className="bg-[#E8F9EF] shadow-none border border-green-100">
        <CardHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 bg-[#06C755] rounded-full flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <CardTitle className="text-base text-[#111111]">あなた専用の紹介リンク</CardTitle>
          </div>
          <CardDescription className="text-[#666666]">
            このURLを見込み客に送付してください。クリックするとLINE公式アカウントへ自動転送されます。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm bg-white border border-green-100 rounded-xl px-3 py-2.5 text-[#111111] break-all font-mono">
              {referralUrl}
            </code>
            <CopyButton text={referralUrl} />
          </div>
          <p className="text-xs text-[#666666]">
            紹介コード: <span className="font-mono font-bold text-[#06C755]">{agency.referral_code}</span>
          </p>
        </CardContent>
      </Card>

      {/* 代理店情報 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-[#111111]">代理店情報</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-4 text-sm">
            {[
              { label: '会社名',         value: agency.name },
              { label: '担当者名',       value: agency.contact_name },
              { label: 'メールアドレス',  value: user.email ?? '—' },
              { label: '報酬率',         value: `${agency.commission_rate}%（成約金額に対して）` },
              { label: 'ステータス',     value: agency.status === 'active' ? '有効' : '停止中' },
              { label: '登録日',         value: new Date(agency.created_at).toLocaleDateString('ja-JP') },
            ].map(({ label, value }) => (
              <div key={label} className="flex gap-4">
                <dt className="w-32 shrink-0 text-[#666666]">{label}</dt>
                <dd className="font-medium text-[#111111]">{value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <p className="text-xs text-[#666666]">
        報酬率や会社情報の変更が必要な場合は、担当者までお問い合わせください。
      </p>
    </div>
  )
}
