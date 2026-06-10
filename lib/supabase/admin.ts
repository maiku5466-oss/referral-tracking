import { createClient } from '@supabase/supabase-js'

// サービスロールキーを使用（RLSをバイパス）
// Webhookエンドポイントなど、ユーザーセッションがない処理で使用する
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
