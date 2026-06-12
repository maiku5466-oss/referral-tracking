import type { SupabaseClient } from '@supabase/supabase-js'
import type { Agency } from '@/types/database'

// ============================================================
// LINE Webhook 型定義（必要最小限）
// ============================================================
interface LineSource {
  type: string
  userId?: string
}

export interface LineFollowEvent {
  type: 'follow'
  timestamp: number
  source: LineSource
}

export interface LineUnfollowEvent {
  type: 'unfollow'
  timestamp: number
  source: LineSource
}

export interface LineMessageEvent {
  type: 'message'
  timestamp: number
  source: LineSource
  message: { type: string; id: string; text?: string }
}

export type LineEvent =
  | LineFollowEvent
  | LineUnfollowEvent
  | LineMessageEvent
  | { type: string; source?: LineSource; [key: string]: unknown }

export interface LineWebhookPayload {
  destination?: string
  events: LineEvent[]
}

// ============================================================
// 紹介コードから代理店を取得
// ============================================================
async function findAgencyByCode(
  supabase: SupabaseClient,
  referralCode: string
): Promise<Pick<Agency, 'id' | 'commission_rate'> | null> {
  const { data } = await supabase
    .from('agencies')
    .select('id, commission_rate')
    .eq('referral_code', referralCode)
    .eq('status', 'active')
    .single()
  return data as Pick<Agency, 'id' | 'commission_rate'> | null
}

// ============================================================
// 直近5分以内のpending_referral_clicksから紹介コードを取得し
// そのレコードをマッチ済みにマークする
// ============================================================
async function popPendingReferralCode(
  supabase: SupabaseClient,
  lineUserId: string
): Promise<string | null> {
  const cutoff = new Date(Date.now() - 5 * 60 * 1000).toISOString()

  const { data } = await supabase
    .from('pending_referral_clicks')
    .select('id, referral_code')
    .is('line_user_id', null)
    .gte('clicked_at', cutoff)
    .order('clicked_at', { ascending: false })
    .limit(1)
    .single()

  if (!data) return null
  const { id, referral_code } = data as { id: string; referral_code: string }

  await supabase
    .from('pending_referral_clicks')
    .update({ line_user_id: lineUserId, matched_at: new Date().toISOString() })
    .eq('id', id)

  return referral_code
}

// ============================================================
// LINE followイベント処理
// ============================================================
async function handleFollow(
  supabase: SupabaseClient,
  event: LineFollowEvent,
  rawPayload: unknown
): Promise<void> {
  const lineUserId = event.source.userId
  if (!lineUserId) return

  const referralCode = await popPendingReferralCode(supabase, lineUserId)
  const agency = referralCode ? await findAgencyByCode(supabase, referralCode) : null

  const upsertData: Record<string, unknown> = {
    line_user_id: lineUserId,
    status: 'registered',
    raw_survey_data: rawPayload as Record<string, unknown>,
  }
  if (referralCode) {
    upsertData.referral_code = referralCode
    upsertData.agency_id = agency?.id ?? null
  }

  const { data: prospectData } = await supabase
    .from('prospects')
    .upsert(upsertData, { onConflict: 'line_user_id', ignoreDuplicates: false })
    .select('id')
    .single()
  const prospect = prospectData as { id: string } | null

  if (prospect && agency) {
    await supabase.from('referral_events').insert({
      prospect_id: prospect.id,
      agency_id: agency.id,
      event_type: 'follow',
      payload: rawPayload as Record<string, unknown>,
    })
  }
}

// ============================================================
// LINE messageイベント処理
// "REF:CODE" 形式のテキストを受け取って紹介コードを後付け設定
// /r/[code] のリダイレクト先URLに oaMessage=REF%3ACODE を付与することで
// LINEが自動的にこのメッセージを会話に挿入する
// ============================================================
async function handleMessage(
  supabase: SupabaseClient,
  event: LineMessageEvent
): Promise<void> {
  if (event.message.type !== 'text' || !event.message.text) return
  if (event.source.type !== 'user' || !event.source.userId) return

  const match = event.message.text.trim().match(/^REF:([A-Z0-9_-]+)$/i)
  if (!match) return

  const referralCode = match[1].toUpperCase()
  const lineUserId = event.source.userId

  const agency = await findAgencyByCode(supabase, referralCode)
  if (!agency) return

  await supabase
    .from('prospects')
    .update({ referral_code: referralCode, agency_id: agency.id })
    .eq('line_user_id', lineUserId)
    .is('referral_code', null)
}

// ============================================================
// メインのイベント処理関数
// ============================================================
export async function processLineEvents(
  payload: unknown,
  supabase: SupabaseClient
): Promise<void> {
  const { events } = payload as LineWebhookPayload
  if (!Array.isArray(events)) return

  for (const event of events) {
    try {
      if (event.type === 'follow') {
        await handleFollow(supabase, event as LineFollowEvent, payload)
      } else if (event.type === 'message') {
        await handleMessage(supabase, event as LineMessageEvent)
      }
      // unfollow: エルメ側で処理するため、ここでは何もしない
    } catch (err) {
      console.error(`[LINE Webhook] event processing error (${event.type}):`, err)
    }
  }
}
