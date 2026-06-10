---
marp: true
theme: default
paginate: true
style: |
  section {
    background-color: #F5F5F5;
    font-family: 'Hiragino Kaku Gothic Pro', 'Yu Gothic', 'Meiryo', sans-serif;
    color: #111111;
    padding: 48px 64px;
  }
  h1 {
    color: #06C755;
    border-bottom: 3px solid #06C755;
    padding-bottom: 12px;
    font-size: 1.6em;
  }
  h2 { color: #111111; font-size: 1.3em; margin-bottom: 16px; }
  h3 { color: #06C755; font-size: 1.0em; }
  strong { color: #06C755; }
  table { width: 100%; border-collapse: collapse; font-size: 0.85em; }
  th { background: #06C755; color: white; padding: 10px 14px; text-align: left; }
  td { padding: 10px 14px; border-bottom: 1px solid #EEEEEE; }
  tr:nth-child(even) td { background: #F9F9F9; }
  .columns { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
  blockquote {
    background: #E8F9EF;
    border-left: 4px solid #06C755;
    margin: 16px 0;
    padding: 16px 20px;
    border-radius: 8px;
    color: #111111;
  }
  code { background: #EEEEEE; padding: 2px 8px; border-radius: 4px; font-size: 0.9em; }
  footer { color: #666666; font-size: 0.75em; }
---

<!-- _paginate: false -->
<!-- _footer: "" -->

# LINE連携<br>紹介トラッキングシステム

## 代理店の紹介活動を完全自動化・リアルタイム見える化

<br>

> 💡 **見込み客がLINEを友達追加した瞬間から、成約・報酬計算まで**
> すべて自動で記録・管理されます。

<br>

**代理店様向け提案資料**

---

# 代理店様が抱える「紹介管理の課題」

<div class="columns">
<div>

### 😓 よくあるお悩み

❌ 自分が紹介した人が**今どこにいるか**わからない

❌ Zoom予約・商談・成約の状況を**毎回確認しなければならない**

❌ 報酬額の計算が**スプレッドシートや手作業**で面倒

❌ 自分の紹介コードで来た人かどうか**追跡できない**

</div>
<div>

### 📊 その結果

- 紹介活動への**モチベーション低下**
- 成約見逃し・報酬未確認による**機会損失**
- 事務処理の**工数増大**
- 担当者との**認識ずれ・トラブル**

</div>
</div>

---

# このシステムが解決します

<br>

> 🎯 **専用URLを渡すだけで、あとは全自動**

<br>

<div class="columns">
<div>

### Before（現状）
```
代理店 → 見込み客に声かけ
           ↓（追跡不能）
        LINE登録
           ↓（手動確認）
        Zoom予約
           ↓（連絡待ち）
        成約
           ↓（手動計算）
        報酬受取
```

</div>
<div>

### After（導入後）
```
代理店 → 専用URLを渡すだけ
           ↓（自動追跡）
        LINE登録 → 即時記録
           ↓（自動検知）
        Zoom予約 → 自動更新
           ↓（自動記録）
        成約 → 報酬自動計算
           ↓（マイページで確認）
        報酬明細をいつでも確認 ✅
```

</div>
</div>

---

# 主要機能

<br>

| 機能 | 内容 |
|------|------|
| 📊 **リアルタイムダッシュボード** | 総紹介数・Zoom予約数・成約数・見込み報酬を一画面で確認 |
| 🔗 **専用紹介リンク発行** | 代理店ごとにユニークなURLを発行。コピーワンタップで共有可能 |
| 👥 **見込み客ステータス追跡** | LINE登録→アンケート→Zoom予約→商談→成約→失注の6段階管理 |
| 💴 **報酬明細自動計算** | 成約金額×報酬率を自動計算。承認待ち・支払済みを明細で確認 |
| 🔒 **完全データ分離** | 他の代理店のデータは一切見えない。セキュア設計 |
| ⚙️ **エルメ（L Message）完全連携** | エルメのWebhookを受信して全ステータスを自動更新 |

---

# 仕組み — どうやって自動追跡するのか？

<br>

```
① 代理店様が専用URLを見込み客に共有
   https://your-domain.com/r/[代理店コード]
                    ↓
② 見込み客がURLをクリック → LINE公式アカウントを友達追加
                    ↓
③ エルメ（L Message）がWebhookを自動送信
                    ↓
④ システムがリアルタイムで受信・データベースに記録
   （LINE登録・アンケート回答・Zoom予約・成約 すべて自動）
                    ↓
⑤ 代理店マイページに即時反映 ✅
```

<br>

> 🤖 代理店様の操作は**URLを渡すだけ**。あとはすべて自動です。

---

# 報酬シミュレーション

<br>

> 💡 **報酬率は代理店様ごとに個別設定可能**（例：成約金額の10%）

<br>

| 成約金額 | 報酬率 | 報酬額 |
|---------|------|------|
| 100万円 | 10% | **¥100,000** |
| 300万円 | 10% | **¥300,000** |
| 500万円 | 10% | **¥500,000** |
| 1,000万円 | 10% | **¥1,000,000** |

<br>

**月5件ペースで成約した場合（平均200万円）**

→ 月あたり報酬 **¥1,000,000**（100万円）

成約情報はリアルタイムで記録され、**承認後すぐにマイページで確認**できます。

---

# 代理店マイページ — 4つの画面

<br>

<div class="columns">
<div>

### 📊 ダッシュボード
- 総紹介数・Zoom予約数・成約数
- 見込み報酬（リアルタイム）
- 最近の紹介一覧

### 👥 紹介一覧
- 全見込み客の一覧
- ステータスでフィルター可能
- 登録日・会社名・担当者名

</div>
<div>

### 💴 報酬明細
- 承認待ち・承認済み・支払済みを分類
- 成約金額・報酬率・報酬額を明示
- 支払日も記録

### ⚙️ 設定
- 専用紹介URLをワンタップでコピー
- 代理店情報・報酬率を確認

</div>
</div>

<br>

> 📱 `[画面スクリーンショット挿入予定]`

---

# セキュリティ・信頼性

<br>

<div class="columns">
<div>

### 🔒 データセキュリティ
- **Row Level Security（RLS）** による完全なデータ分離
  → 自分の代理店データしか見えない
- **Supabase Auth** による認証
- **Webhookシークレットキー** による改ざん防止

</div>
<div>

### ⚡ インフラ信頼性
- **Vercel（Edge Network）** でグローバル配信
- **Supabase（PostgreSQL）** の ACID 準拠
  → データの整合性を完全保証
- 全 Webhook を **ログ記録**
  → トラブル時も原因追跡可能

</div>
</div>

<br>

| 項目 | 対応状況 |
|------|--------|
| データ暗号化（転送中） | ✅ HTTPS/TLS |
| データ暗号化（保存） | ✅ Supabase管理 |
| アクセス制御 | ✅ RLS + Auth |
| 監査ログ | ✅ webhook_logs テーブル |

---

# 技術スタック

<br>

| カテゴリ | 技術 | バージョン |
|---------|------|-----------|
| フロントエンド | Next.js（App Router） | 16.2.7 |
| UI ライブラリ | React | 19.2.4 |
| UI コンポーネント | shadcn/ui + Base UI | 4.11.0 / 1.5.0 |
| スタイリング | Tailwind CSS | v4 |
| データベース | Supabase（PostgreSQL） | 2.108.0 |
| 認証 | Supabase Auth | — |
| LINE連携 | エルメ（L Message）Webhook | — |
| デプロイ | Vercel | — |
| 言語 | TypeScript | v5 |

---

<!-- _paginate: false -->

# ご導入の流れ

<br>

<div class="columns">
<div>

## Step 1
### ご契約・初期設定
**〜1営業日**

- ご契約・報酬率の合意
- 代理店アカウント作成
- エルメの Webhook URL 設定

</div>
<div>

## Step 2
### URL配布・スタート
**即日**

- 代理店様専用URLを発行
- マイページのログイン情報をお知らせ
- 紹介活動スタート 🚀

</div>
</div>

<br>

> ✅ 設定完了後は**代理店様の手間ゼロ**。URLを共有するだけで
> 見込み客の追跡・報酬計算がすべて自動で動きます。

<br>

---

<!-- _paginate: false -->
<!-- _footer: "" -->

# まずは無料でご相談ください

<br>

> 📩 **導入ご検討・ご質問はこちらまで**
>
> [メールアドレス / 連絡先を記載]

<br>

**このシステムでできること**

✅ 紹介した見込み客のリアルタイム追跡

✅ 成約・報酬の自動計算と明細確認

✅ エルメ（L Message）との完全連携

✅ 代理店ごとの完全なデータ分離

✅ Vercel × Supabase の高可用インフラ
