import type { ProspectStatus } from '@/types/database'

// ============================================================
// エルメ Webhook フィールドマッピング設定
// 実際のエルメWebhookのフォーマットが判明したら、このオブジェクトのパスを変更する
// ============================================================
export const ERUME_FIELD_MAP = {
  // エルメが送ってくるLINEユーザーID
  lineUserId: ['userId', 'source.userId', 'line_user_id', 'user_id'],
  // LINE表示名
  userName: ['userName', 'profile.displayName', 'name', 'display_name'],
  // 流入経路タグ（代理店の referral_code がここに入る）
  referralCode: ['referralCode', 'ref', 'inflow_tag', 'inflowTag', 'tag', 'source_tag'],
  // イベント種別
  eventType: ['event', 'type', 'eventType', 'event_type'],
  // アンケート回答 - 会社名
  companyName: ['survey.company', 'answers.company', 'formAnswers.company', 'company_name', 'company'],
  // アンケート回答 - 電話番号
  phone: ['survey.phone', 'answers.phone', 'formAnswers.phone', 'phone_number', 'tel'],
  // アンケート回答 - メールアドレス
  email: ['survey.email', 'answers.email', 'formAnswers.email'],
  // 成約金額（contracted イベント時に含まれる想定）
  contractAmount: ['contractAmount', 'contract_amount', 'deal_amount', 'amount', 'sale_amount'],
  // Zoom予約日時
  zoomBookedAt: ['zoomBookedAt', 'zoom_booked_at', 'appointment_at', 'booking_time'],
} as const

// エルメのイベント名 → 本システムのステータス マッピング
// エルメ側のイベント名が判明したら追記・変更する
export const EVENT_TO_STATUS_MAP: Record<string, ProspectStatus> = {
  // LINE友達追加
  follow:           'registered',
  line_registered:  'registered',
  friend_added:     'registered',
  // アンケート完了
  survey_completed: 'surveyed',
  form_submitted:   'surveyed',
  questionnaire:    'surveyed',
  // Zoom予約
  zoom_booked:      'booked',
  appointment:      'booked',
  booking:          'booked',
  scheduled:        'booked',
  // 商談完了
  meeting_done:     'met',
  met:              'met',
  // 成約
  contracted:       'contracted',
  deal_closed:      'contracted',
  won:              'contracted',
  // 失注
  lost:             'lost',
  disqualified:     'lost',
}

// ============================================================
// ネストしたオブジェクトからドット記法でパス取得
// 例: getByPath({ a: { b: 1 } }, 'a.b') => 1
// ============================================================
function getByPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce((acc: unknown, key) => {
    if (acc !== null && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)
}

// 複数のパス候補から最初に見つかった値を返す
function extractField(payload: unknown, paths: readonly string[]): string | undefined {
  for (const path of paths) {
    const value = getByPath(payload, path)
    if (value !== undefined && value !== null && value !== '') {
      return String(value)
    }
  }
  return undefined
}

// ============================================================
// パース済みペイロード型
// ============================================================
export interface ParsedErumePayload {
  lineUserId: string
  userName?: string
  referralCode: string
  eventType: string
  companyName?: string
  phone?: string
  email?: string
  contractAmount?: number
  zoomBookedAt?: string
}

// ============================================================
// メインのパーサー関数
// ============================================================
export function parseErumePayload(payload: unknown): ParsedErumePayload {
  const lineUserId = extractField(payload, ERUME_FIELD_MAP.lineUserId)
  if (!lineUserId) throw new Error('lineUserId が見つかりません')

  const referralCode = extractField(payload, ERUME_FIELD_MAP.referralCode)
  if (!referralCode) throw new Error('referralCode が見つかりません')

  const eventType = extractField(payload, ERUME_FIELD_MAP.eventType)
  if (!eventType) throw new Error('eventType が見つかりません')

  const contractAmountRaw = extractField(payload, ERUME_FIELD_MAP.contractAmount)
  const contractAmount = contractAmountRaw ? parseFloat(contractAmountRaw) : undefined

  return {
    lineUserId,
    userName:       extractField(payload, ERUME_FIELD_MAP.userName),
    referralCode,
    eventType,
    companyName:    extractField(payload, ERUME_FIELD_MAP.companyName),
    phone:          extractField(payload, ERUME_FIELD_MAP.phone),
    email:          extractField(payload, ERUME_FIELD_MAP.email),
    contractAmount: isNaN(contractAmount!) ? undefined : contractAmount,
    zoomBookedAt:   extractField(payload, ERUME_FIELD_MAP.zoomBookedAt),
  }
}

// イベント名をプロスペクトのステータスに変換
export function mapEventToStatus(eventType: string): ProspectStatus {
  return EVENT_TO_STATUS_MAP[eventType.toLowerCase()] ?? 'registered'
}
