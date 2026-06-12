-- 紹介リンクのクリックを追跡する中間テーブル
-- LINE followイベントと紹介コードを紐付けるために使用
-- （LINE webhookのfollowイベントには referral_code が含まれないため）
CREATE TABLE pending_referral_clicks (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_code TEXT NOT NULL,
  line_user_id  TEXT,
  clicked_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  matched_at    TIMESTAMPTZ
);

CREATE INDEX idx_pending_referral_clicks_unmatched
  ON pending_referral_clicks(clicked_at DESC)
  WHERE line_user_id IS NULL;

ALTER TABLE pending_referral_clicks ENABLE ROW LEVEL SECURITY;

-- prospectsのreferral_codeをNULL許容に変更
-- （followイベント受信時点では紹介コードが未確定の場合があるため）
ALTER TABLE prospects ALTER COLUMN referral_code DROP NOT NULL;

-- webhook_logsのsourceデフォルト値を汎用化
ALTER TABLE webhook_logs ALTER COLUMN source SET DEFAULT 'line';
