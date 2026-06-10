CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE agencies (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name             TEXT NOT NULL,
  contact_name     TEXT NOT NULL,
  referral_code    TEXT UNIQUE NOT NULL,
  commission_rate  DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  status           TEXT NOT NULL DEFAULT 'active'
                     CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_agencies_updated_at
  BEFORE UPDATE ON agencies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agencies: own row only"
  ON agencies FOR ALL
  USING (user_id = auth.uid());

CREATE TABLE prospects (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  line_user_id     TEXT UNIQUE NOT NULL,
  agency_id        UUID REFERENCES agencies(id) ON DELETE SET NULL,
  referral_code    TEXT NOT NULL,
  name             TEXT,
  company_name     TEXT,
  phone            TEXT,
  email            TEXT,
  status           TEXT NOT NULL DEFAULT 'registered'
                     CHECK (status IN ('registered', 'surveyed', 'booked', 'met', 'contracted', 'lost')),
  contract_amount  DECIMAL(12,2),
  zoom_booked_at   TIMESTAMPTZ,
  contracted_at    TIMESTAMPTZ,
  raw_survey_data  JSONB,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_prospects_updated_at
  BEFORE UPDATE ON prospects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prospects: own agency only"
  ON prospects FOR ALL
  USING (
    agency_id IN (
      SELECT id FROM agencies WHERE user_id = auth.uid()
    )
  );

CREATE TABLE referral_events (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prospect_id  UUID REFERENCES prospects(id) ON DELETE CASCADE NOT NULL,
  agency_id    UUID REFERENCES agencies(id) ON DELETE SET NULL,
  event_type   TEXT NOT NULL,
  payload      JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE referral_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "referral_events: own agency only"
  ON referral_events FOR ALL
  USING (
    agency_id IN (
      SELECT id FROM agencies WHERE user_id = auth.uid()
    )
  );

CREATE TABLE commissions (
  id                       UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id                UUID REFERENCES agencies(id) ON DELETE CASCADE NOT NULL,
  prospect_id              UUID REFERENCES prospects(id) ON DELETE CASCADE NOT NULL,
  trigger_event            TEXT NOT NULL DEFAULT 'contracted',
  contract_amount          DECIMAL(12,2) NOT NULL,
  commission_rate_snapshot DECIMAL(5,2) NOT NULL,
  amount                   DECIMAL(12,2) NOT NULL,
  status                   TEXT NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending', 'confirmed', 'paid')),
  confirmed_at             TIMESTAMPTZ,
  paid_at                  TIMESTAMPTZ,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (prospect_id, trigger_event)
);

ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "commissions: own agency only"
  ON commissions FOR ALL
  USING (
    agency_id IN (
      SELECT id FROM agencies WHERE user_id = auth.uid()
    )
  );

CREATE TABLE webhook_logs (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source      TEXT NOT NULL DEFAULT 'erume',
  payload     JSONB,
  processed   BOOLEAN NOT NULL DEFAULT FALSE,
  error_msg   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
