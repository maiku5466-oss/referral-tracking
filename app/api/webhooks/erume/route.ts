import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { parseErumePayload, mapEventToStatus } from '@/lib/erume/webhook-handler'
import type { Agency, Prospect } from '@/types/database'

export async function POST(request: NextRequest) {
  // Webhookシークレットによる認証
  const secret = request.headers.get('x-webhook-secret')
  if (secret !== process.env.ERUME_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let rawPayload: unknown
  try {
    rawPayload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // 生ペイロードをまずログに保存（処理失敗でも記録が残るよう先に書く）
  const { data: logData } = await supabase
    .from('webhook_logs')
    .insert({ source: 'erume', payload: rawPayload as Record<string, unknown> })
    .select('id')
    .single()
  const log = logData as { id: string } | null

  try {
    const parsed = parseErumePayload(rawPayload)
    const newStatus = mapEventToStatus(parsed.eventType)

    // 紹介コードから代理店を取得
    const { data: agencyData } = await supabase
      .from('agencies')
      .select('id, commission_rate')
      .eq('referral_code', parsed.referralCode)
      .eq('status', 'active')
      .single()
    const agency = agencyData as Pick<Agency, 'id' | 'commission_rate'> | null

    if (!agency) {
      throw new Error(`代理店が見つかりません: referral_code=${parsed.referralCode}`)
    }

    // 見込み客をアップサート
    const upsertData: Record<string, unknown> = {
      line_user_id:    parsed.lineUserId,
      agency_id:       agency.id,
      referral_code:   parsed.referralCode,
      status:          newStatus,
      raw_survey_data: rawPayload as Record<string, unknown>,
    }

    if (parsed.userName)    upsertData.name         = parsed.userName
    if (parsed.companyName) upsertData.company_name = parsed.companyName
    if (parsed.phone)       upsertData.phone        = parsed.phone
    if (parsed.email)       upsertData.email        = parsed.email

    if (newStatus === 'booked') {
      upsertData.zoom_booked_at = parsed.zoomBookedAt ?? new Date().toISOString()
    }
    if (newStatus === 'contracted') {
      upsertData.contracted_at = new Date().toISOString()
      if (parsed.contractAmount !== undefined) {
        upsertData.contract_amount = parsed.contractAmount
      }
    }

    const { data: prospectData } = await supabase
      .from('prospects')
      .upsert(upsertData, { onConflict: 'line_user_id' })
      .select('id, contract_amount')
      .single()
    const prospect = prospectData as Pick<Prospect, 'id' | 'contract_amount'> | null

    if (!prospect) {
      throw new Error('見込み客の保存に失敗しました')
    }

    // イベント履歴を記録
    await supabase.from('referral_events').insert({
      prospect_id: prospect.id,
      agency_id:   agency.id,
      event_type:  parsed.eventType,
      payload:     rawPayload as Record<string, unknown>,
    })

    // 成約時: 報酬レコードを作成
    if (newStatus === 'contracted') {
      const contractAmount = prospect.contract_amount ?? parsed.contractAmount
      if (contractAmount) {
        const commissionAmount = Math.round((contractAmount * agency.commission_rate) / 100)

        await supabase.from('commissions').upsert(
          {
            agency_id:                agency.id,
            prospect_id:              prospect.id,
            trigger_event:            'contracted',
            contract_amount:          contractAmount,
            commission_rate_snapshot: agency.commission_rate,
            amount:                   commissionAmount,
            status:                   'pending',
          },
          { onConflict: 'prospect_id,trigger_event' }
        )
      }
    }

    // ログを処理済みにマーク
    if (log) {
      await supabase
        .from('webhook_logs')
        .update({ processed: true })
        .eq('id', log.id)
    }

    return NextResponse.json({ success: true, prospectId: prospect.id })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'

    if (log) {
      await supabase
        .from('webhook_logs')
        .update({ error_msg: message })
        .eq('id', log.id)
    }

    console.error('[Erume Webhook] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
