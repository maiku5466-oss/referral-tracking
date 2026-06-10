# 実績: LINE連携 B2B紹介トラッキングシステム

## プロジェクト概要

| 項目 | 内容 |
|------|------|
| 開発期間 | 2026年6月（短期集中開発） |
| 役割 | フルスタックエンジニア（要件定義・設計・実装・デプロイまで一貫担当） |
| フロントエンド | Next.js 16.2.7 (App Router), React 19, Tailwind CSS v4 |
| バックエンド | Next.js API Routes, Supabase (PostgreSQL) |
| 外部連携 | エルメ（L Message）Webhook |
| デプロイ | Vercel |
| リポジトリ規模 | 49ファイル、DB テーブル5つ、ページ4画面 |

---

## 背景・課題

BtoB 営業を行う代理店が「紹介した見込み客が今どのフェーズにいるか」を把握できない、
報酬計算を手作業で行っている、という業務課題を解決するために開発。

**完全成果報酬型**の報酬モデル（`成約金額 × 報酬率 / 100`）を採用し、
エルメ（LINE公式アカウント管理ツール）が持つ「流入経路タグ（パラメータ付きURL）」機能と
Webhook を組み合わせて、代理店ごとの見込み客追跡を自動化した。

---

## 実装した主要機能

### 代理店向けダッシュボード
- **KPI サマリー**: 総紹介数・Zoom予約数・成約数・見込み報酬をリアルタイム表示
- **紹介一覧**: ステータスフィルター付き（6段階: LINE登録→アンケート→Zoom予約→商談→成約→失注）
- **報酬明細**: 成約ごとの報酬額・承認状態・支払日を管理
- **設定画面**: 専用紹介 URL のワンタップコピー

### 認証・セキュリティ
- Supabase Auth によるメール/パスワード認証
- Next.js 16 の `proxy.ts`（旧 `middleware.ts`）による未認証ルートのリダイレクト
- Row Level Security（RLS）による代理店間の完全なデータ分離

### エルメ Webhook 連携
- `POST /api/webhooks/erume` エンドポイントで Webhook を受信
- `x-webhook-secret` ヘッダーによる認証（改ざん防止）
- 柔軟なフィールドマッピング（エルメのペイロード形式に対応）
- 全ペイロードを `webhook_logs` テーブルに記録（デバッグ・監査対応）

### 紹介リダイレクト
- `/r/[referralCode]` → エルメの LINE 友達追加 URL へリダイレクト
- 代理店コードを `ref` パラメータとして付与

---

## 技術的な工夫

### 1. 成果報酬の「スナップショット」設計

報酬率は代理店ごとに変動するため、**成約時点の報酬率を不変値として保存**する設計を採用。

```sql
-- commissions テーブル
commission_rate_snapshot DECIMAL(5,2) NOT NULL,  -- 成約時点の料率を確定
amount                   DECIMAL(12,2) NOT NULL,  -- 計算済み報酬額
UNIQUE (prospect_id, trigger_event)               -- 同一成約の二重計上防止
```

後から代理店の報酬率が変更されても、過去の成約報酬額が変わらない。
また `UNIQUE (prospect_id, trigger_event)` により、Webhook の冪等性を DB レベルで保証。

### 2. エルメ Webhook の柔軟なフィールドマッピング

エルメの実際の Webhook フォーマットが事前に不明なため、**複数のパス候補から最初にヒットした値を使う**方式を設計。

```typescript
export const ERUME_FIELD_MAP = {
  lineUserId:    ['userId', 'source.userId', 'line_user_id', 'user_id'],
  referralCode:  ['referralCode', 'ref', 'inflow_tag', 'inflowTag', 'tag', 'source_tag'],
  contractAmount:['contractAmount', 'contract_amount', 'deal_amount', 'amount'],
  // ...
}

// ドット記法でネストしたオブジェクトを再帰的に解決
function getByPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce((acc, key) =>
    acc !== null && typeof acc === 'object'
      ? (acc as Record<string, unknown>)[key]
      : undefined
  , obj)
}
```

エルメ側の仕様変更にも `ERUME_FIELD_MAP` の配列に候補を追加するだけで対応可能。

### 3. Supabase RLS によるマルチテナントデータ分離

管理コストを最小化しながら完全なデータ分離を実現するため、**Row Level Security でテナント分離**を実装。

```sql
-- 代理店は自分のレコードのみ参照可能
CREATE POLICY "agencies: own row only"
  ON agencies FOR ALL
  USING (user_id = auth.uid());

-- 見込み客は自代理店に紐づくもののみ
CREATE POLICY "prospects: own agency only"
  ON prospects FOR ALL
  USING (
    agency_id IN (
      SELECT id FROM agencies WHERE user_id = auth.uid()
    )
  );
```

アプリケーション層での権限チェックに頼らず、DB レベルで保証することで
バグによる情報漏洩リスクをゼロにした。

### 4. Supabase TypeScript Client の型推論問題への対処

`createServerClient<Database>()` に自作の `Database` 型を渡すと、Supabase のジェネリクス制約（`Record<string, unknown>`）を `interface` が満たせず、クエリ結果がすべて `never` に推論される問題が発生。

```typescript
// NG: ジェネリクスを使うと never になる
const supabase = createServerClient<Database>(url, key, ...)
const { data } = await supabase.from('agencies').select()  // data: never

// OK: ジェネリクスなし + 呼び出し側でアサーション
const supabase = createServerClient(url, key, ...)
const { data } = await supabase.from('agencies').select()
const agency = data as Agency | null
```

ジェネリクスを外して各呼び出しサイトで型アサーションする方式に統一し、型安全性と実用性を両立した。

### 5. Next.js 16 の破壊的変更への対応

Next.js 16 では `middleware.ts` が廃止され `proxy.ts` に移行。また動的ルートの `params` が `Promise<{}>` 化。

```typescript
// app/r/[code]/route.ts — Next.js 16 対応
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }  // Promise を await
) {
  const { code } = await params  // ← Next.js 16 必須
  ...
}
```

### 6. LINE デザインシステムの Tailwind v4 実装

Tailwind v4 では `@theme inline` でテーマ変数を CSS カスタムプロパティとして定義する際、
Turbopack が `:root {}` ブロックをビルド出力に含めないバグが存在。

```css
/* NG: :root {} は Turbopack に無視される */
:root { --primary: #06C755; }

/* OK: @theme で静的値として定義すると確実に反映される */
@theme {
  --color-primary: #06C755;
  --color-primary-foreground: #FFFFFF;
}
```

`@theme {}` での静的定義に切り替えることで LINE グリーン（`#06C755`）を確実に適用。

---

## データモデル

```
agencies ──┬──< prospects ──< referral_events
           │
           └──< commissions >── prospects
```

| テーブル | 役割 |
|--------|------|
| `agencies` | 代理店マスター（報酬率・紹介コード） |
| `prospects` | 見込み客（LINE ユーザーID でユニーク管理） |
| `referral_events` | 各イベントの生ログ |
| `commissions` | 成約ごとの報酬レコード（rate_snapshot で不変） |
| `webhook_logs` | 全 Webhook ペイロードの監査ログ |

---

## 成果・学び

**解決した技術課題**
- Supabase の型システムとの格闘（`never` 問題の根本原因特定と回避策の設計）
- Next.js 16 の破壊的変更への迅速な対応（`proxy.ts`、`params` のPromise化）
- Tailwind v4 + Turbopack のビルドパイプライン特性の理解
- 外部仕様が不明な Webhook に対応するための拡張可能な設計パターン

**設計上の判断**
- 報酬の不変性を DB の `UNIQUE` 制約で保証（冪等性の DB 委譲）
- マルチテナント分離を RLS でのみ実現（アプリ層での条件分岐を排除）
- エルメのフォーマット変更を吸収する設定ファイル方式のフィールドマッピング

**使用した技術**
Next.js 16 / React 19 / TypeScript 5 / Tailwind CSS v4 / Supabase / PostgreSQL / RLS / shadcn/ui 4 / @base-ui/react / Vercel / エルメ（L Message）Webhook
