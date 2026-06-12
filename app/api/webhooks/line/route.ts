import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { processLineEvents } from '@/lib/line/webhook-handler'

// ============================================================
// LINE署名検証（HMAC-SHA256）
// ============================================================
function verifyLineSignature(rawBody: string, signature: string): boolean {
  const channelSecret = process.env.LINE_CHANNEL_SECRET
  if (!channelSecret) throw new Error('LINE_CHANNEL_SECRET が未設定です')

  const hmac = crypto.createHmac('SHA256', channelSecret)
  hmac.update(rawBody)
  const digest = hmac.digest('base64')

  return crypto.timingSafeEqual(
    Buffer.from(signature, 'base64'),
    Buffer.from(digest, 'base64')
  )
}

// ============================================================
// エルメのWebhook URLへ転送
// 元の x-line-signature をそのまま転送するため、
// エルメ側でのLINE署名検証も通過する
// ============================================================
async function forwardToErume(rawBody: string, lineSignature: string): Promise<void> {
  const erumeUrl = process.env.ERUME_WEBHOOK_URL
  if (!erumeUrl) {
    console.warn('[LINE Webhook] ERUME_WEBHOOK_URL が未設定のためエルメへの転送をスキップします')
    return
  }

  const res = await fetch(erumeUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Line-Signature': lineSignature,
    },
    body: rawBody,
  })

  if (!res.ok) {
    console.error(`[LINE Webhook] エルメへの転送失敗: ${res.status} ${res.statusText}`)
  }
}

// ============================================================
// POST /api/webhooks/line
// LINE公式アカウントのWebhook URLにこのエンドポイントを設定する
// ============================================================
export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-line-signature') ?? ''

  // 1. LINE署名検証
  try {
    if (!verifyLineSignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Signature verification failed'
    return NextResponse.json({ error: message }, { status: 401 })
  }

  let payload: unknown
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // 2. 生ペイロードをログに保存（処理失敗でも記録が残るよう先に書く）
  const { data: logData } = await supabase
    .from('webhook_logs')
    .insert({ source: 'line', payload: payload as Record<string, unknown> })
    .select('id')
    .single()
  const log = logData as { id: string } | null

  // 3. エルメへの転送とトラッキング処理を並列実行
  const [, trackingResult] = await Promise.allSettled([
    forwardToErume(rawBody, signature),
    processLineEvents(payload, supabase),
  ])

  // 4. ログを更新
  if (log) {
    const trackingError =
      trackingResult.status === 'rejected'
        ? String(trackingResult.reason)
        : null

    await supabase
      .from('webhook_logs')
      .update({ processed: trackingError === null, error_msg: trackingError })
      .eq('id', log.id)
  }

  if (trackingResult.status === 'rejected') {
    console.error('[LINE Webhook] Tracking error:', trackingResult.reason)
  }

  // LINEは200レスポンスを要求する（エルメ転送の成否に関わらず返す）
  return NextResponse.json({ success: true })
}
