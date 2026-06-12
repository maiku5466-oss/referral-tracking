import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// 紹介リンクのリダイレクトハンドラー
// /r/ABC12345 → LINE友達追加URL へリダイレクト
// クリック時に pending_referral_clicks へ記録し、後続のfollowイベントと紐付ける
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

  // クリックを記録（followイベントとの紐付けに使用）
  await supabase
    .from('pending_referral_clicks')
    .insert({ referral_code: code })

  const lineBaseUrl = process.env.LINE_FRIEND_URL
  if (!lineBaseUrl) {
    console.error('LINE_FRIEND_URL が未設定です')
    return NextResponse.redirect(new URL('/not-found', fallbackUrl))
  }

  // oaMessage に "REF:CODE" を付与することで、ユーザーがLINE追加時に
  // メッセージボックスへ自動挿入される（送信はユーザー操作が必要）
  const redirectUrl = new URL(lineBaseUrl)
  redirectUrl.searchParams.set('oaMessage', `REF:${code}`)

  return NextResponse.redirect(redirectUrl.toString(), { status: 302 })
}
