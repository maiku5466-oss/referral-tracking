import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// 紹介リンクのリダイレクトハンドラー
// /r/ABC12345 → エルメのLINE友達追加URL（?ref=ABC12345 付き）へリダイレクト
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const supabase = createAdminClient()

  // 代理店の存在確認（無効コードや停止中代理店はブロック）
  const { data: agency } = await supabase
    .from('agencies')
    .select('id')
    .eq('referral_code', code)
    .eq('status', 'active')
    .single()

  const fallbackUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://example.com'

  if (!agency) {
    return NextResponse.redirect(new URL('/not-found', fallbackUrl))
  }

  // エルメのLINE友達追加ベースURL（環境変数で管理）
  // 例: https://line.me/R/ti/p/@XXXXXXXX  または  https://liff.line.me/XXXXXXXX
  const lineBaseUrl = process.env.ERUME_LINE_FRIEND_URL
  if (!lineBaseUrl) {
    console.error('ERUME_LINE_FRIEND_URL が未設定です')
    return NextResponse.redirect(new URL('/not-found', fallbackUrl))
  }

  // 流入経路タグとして referral_code を付与
  const redirectUrl = new URL(lineBaseUrl)
  redirectUrl.searchParams.set('ref', code)

  return NextResponse.redirect(redirectUrl.toString(), { status: 302 })
}
