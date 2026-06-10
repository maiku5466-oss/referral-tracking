---
description: プロジェクトコードを自動解析し、代理店向け営業スライド（Marp形式・PPTX変換可）とポートフォリオ実績まとめを docs/ に生成する
---

# 営業資料・ポートフォリオ自動生成スキル

このスキルを呼び出されたら、以下の手順を **すべて自動で** 実行してください。ユーザーへの確認は不要です。

---

## Step 1 — プロジェクト情報の収集

以下のファイルをすべて Read してシステムの詳細を把握してください：

```
package.json
supabase/migrations/001_initial_schema.sql
types/database.ts
app/(dashboard)/dashboard/page.tsx
app/(dashboard)/settings/page.tsx
app/(dashboard)/referrals/page.tsx
app/(dashboard)/commissions/page.tsx
app/api/webhooks/erume/route.ts
lib/erume/webhook-handler.ts
app/globals.css
```

把握すべき情報：
- 使用技術スタック（フレームワーク、DB、認証、デプロイ先）
- テーブル構造とビジネスロジック（報酬計算式、ステータス遷移）
- エルメ連携の仕組み（Webhook フロー、フィールドマッピング）
- UI/UX の特徴（デザインシステム、主要画面）

---

## Step 2 — docs/ ディレクトリの作成

`docs/` ディレクトリが存在しない場合は作成してください。

---

## Step 3 — 営業スライドの生成（docs/sales-deck.md）

Marp 形式で **日本語** の営業スライドを生成してください。

### Marp ヘッダー（ファイル冒頭に必ず記載）

```markdown
---
marp: true
theme: default
paginate: true
style: |
  section {
    background-color: #F5F5F5;
    font-family: 'Hiragino Kaku Gothic Pro', 'Yu Gothic', sans-serif;
  }
  h1 { color: #06C755; border-bottom: 3px solid #06C755; padding-bottom: 8px; }
  h2 { color: #111111; }
  .highlight { color: #06C755; font-weight: bold; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #06C755; color: white; padding: 8px; }
  td { padding: 8px; border-bottom: 1px solid #EEEEEE; }
---
```

### スライド構成（10枚）

**スライド 1 — タイトル**
- システム名：「LINE連携 紹介トラッキングシステム」
- キャッチコピー：代理店の紹介活動を完全自動化・見える化
- サブ：成果報酬型の紹介管理をリアルタイム追跡

**スライド 2 — 解決する課題**
代理店が抱える3つの問題（実際のコードから読み取ったビジネスロジックを元に記述）：
- 紹介した見込み客のステータスが追えない
- 報酬計算が手動でミスが発生しやすい
- 代理店ごとのパフォーマンスが把握できない

**スライド 3 — ソリューション概要**
このシステムが解決すること（DB スキーマから読み取った機能を元に記述）

**スライド 4 — 主要機能（4つ）**
実際に実装されている機能を箇条書きで。各機能に 📊🔗💴⚙️ などの絵文字を付ける。

**スライド 5 — 仕組みフロー図**
以下のテキスト図を使用：
```
見込み客がURLをクリック
        ↓
専用紹介リンク (/r/[code])
        ↓
LINE 公式アカウントを友達追加
        ↓
エルメ（L Message）がWebhookを送信
        ↓
API (/api/webhooks/erume) が受信
        ↓
データベース（Supabase）に自動記録
        ↓
代理店マイページでリアルタイム確認
```

**スライド 6 — 報酬シミュレーション**
実際の commission_rate（デフォルト 10%）を使った具体例：
- 例1：成約金額 100万円 → 報酬 10万円
- 例2：成約金額 500万円 → 報酬 50万円
- 例3：月5件成約 × 平均200万円 = 月100万円の報酬
マークダウンテーブルで視覚的に表示

**スライド 7 — 代理店マイページ画面紹介**
実装済みの4画面を紹介：
- ダッシュボード（KPI: 総紹介数・Zoom予約数・成約数・見込み報酬）
- 紹介一覧（ステータスフィルター付き）
- 報酬明細（承認待ち・承認済み・支払済み）
- 設定（専用紹介URL コピー）
各画面に `> 📱 [画面イメージ]` のプレースホルダーを入れる

**スライド 8 — セキュリティ・信頼性**
実際の技術構成から記述：
- Supabase Row Level Security（代理店ごとのデータ分離）
- Supabase Auth による認証
- Webhook シークレットキーによる改ざん防止
- Vercel（Edge Network）でのホスティング
- PostgreSQL の ACID 準拠でデータの整合性保証

**スライド 9 — 技術スタック**
package.json から読み取った実際のバージョンを使い、テーブルで表示：

| カテゴリ | 技術 | バージョン |
|---------|------|-----------|
| フロントエンド | ... | ... |
| バックエンド | ... | ... |
| データベース | ... | ... |
| 認証 | ... | ... |
| デプロイ | ... | ... |

**スライド 10 — まとめ・導入ステップ**
3ステップで導入完了：
1. ご契約・初期設定（〜1日）
2. 代理店アカウント発行・URL配布（即日）
3. エルメ Webhook 設定（30分）

---

## Step 4 — ポートフォリオ実績まとめの生成（docs/portfolio.md）

エンジニア向けの実績ドキュメントを生成してください。

### 構成

```markdown
# 実績: LINE連携 B2B紹介トラッキングシステム

## プロジェクト概要

| 項目 | 内容 |
|------|------|
| 期間 | [読み取った情報から推定] |
| 役割 | フルスタックエンジニア（設計・実装・デプロイ） |
| 技術スタック | [package.json から列挙] |
| 規模 | [ファイル数・テーブル数など] |

## 背景・課題

[ビジネス要件の説明]

## 実装した主要機能

[コードから読み取った機能を詳細に列挙]

## 技術的な工夫・チャレンジ

### 1. Supabase RLS による厳格なマルチテナント分離
[実際のRLSポリシーの説明]

### 2. エルメ Webhook のフィールドマッピング設計
[ERUME_FIELD_MAP の設計意図の説明]

### 3. 完全成果報酬型コミッションの不変性確保
[commission_rate_snapshot の設計意図の説明]

### 4. Next.js 16 の最新機能への対応
[proxy.ts、params の Promise 化などの説明]

## アーキテクチャ図

[テキストで表現したアーキテクチャ図]

## 成果・学び

[実装を通じて得た知見]

## コードハイライト

[特に工夫したコードスニペットを3つほど抜粋して紹介]
```

---

## Step 5 — 完了報告

生成完了後、以下を報告してください：

1. 生成したファイルのパス
2. スライド枚数と主な内容
3. PPTX への変換コマンド：
   ```
   npx @marp-team/marp-cli docs/sales-deck.md --allow-local-files -o docs/sales-deck.pptx
   ```
4. HTML プレビューコマンド：
   ```
   npx @marp-team/marp-cli docs/sales-deck.md --html -o docs/sales-deck.html && open docs/sales-deck.html
   ```

---

## 注意事項

- 実際のコードから読み取った内容のみを記載してください（架空の機能を追加しない）
- 数値や技術バージョンは package.json と migration SQL から正確に読み取ること
- 日本語で全文を記述すること
- Marp のスライド区切りは `---` を使用
