# Brain for Cross-border Deal

**An email-first AI "business brain" for cross-border B2B deals.** Connect your email and the messaging apps each market actually uses (LinkedIn, WhatsApp, LINE, KakaoTalk, WeChat, Zalo, Telegram), feed it everything about your company and products (website, decks, videos, images, social pages), then ask: *"Which country should I sell to?"* The brain answers with that market's **demand trend** for similar products, import signals, likely buyers, and the right channel and etiquette for each step of the outreach.

- **Privacy by design:** company data is never shared between users. The brain only shows *anonymized, aggregated* demand trends (country × HS code × week), with a minimum-cohort threshold (≥5 user companies, ≥20 buyers) plus differential-privacy noise.
- **Network effect:** every user's outreach events (sent, replied, inquiry, meeting, won) feed the trend engine anonymously, so the more people use it, the wider the coverage and the closer to real time it gets (public customs data lags 2–6 months; user signals are weekly).
- **Built on DealPilot:** reuses DealPilot's lead database, AI email writing, approval-before-send, batch sending, and tracking.

## YC RFS track: Data for the Real World (Fall 2026)
The physical economy (manufacturing, logistics, the goods that cross borders) still runs on sparse, lagging data: public customs statistics arrive 2–6 months late and rarely show what buyers want *right now*. Every company using Brain for Cross-border Deal generates real-world B2B demand signals in the course of normal outreach: which countries reply, ask for quotes, book meetings and close, for which product categories (HS codes), this week. We collect these events with consent, strip company and contact identity, enforce a minimum cohort (≥5 user companies, ≥20 buyers) plus differential-privacy noise, and publish them back as a live demand index. The data set grows with every user, and that is the moat.

## Market Data (real, anonymized)
The **Market Data** page in the demo is built from DealPilot's real operating data: the enterprise product's email performance, the lead database (11,000+ companies), the outreach log (2,200+ emails), the sales pipeline, and tracked proposal opportunities. All of it is aggregated to **country × industry × month**. Company names, contacts, email addresses, websites, notes, deal amounts and exact dates are removed; any group with fewer than 5 records is hidden or merged into "Other", and every count is rounded to 5. The published file is `apps/web/data/showcase.json`.

**Live demo (clickable prototype, sample data only):** https://robert-dealpilot.github.io/brain-for-cross-border-deal/ (or open `apps/web/index.html`).

---

# 全球商務腦｜Brain for Cross-border Deal

以 Email 為核心，依各國商務通訊習慣接上 LinkedIn、WhatsApp、LINE、KakaoTalk、WeChat、Zalo、Telegram 的跨境開發 AI。

1. 登入後接上 Email 與通訊工具。
2. 上傳公司與產品資料：網站、簡報、型錄、影片、圖文、粉專。
3. 問商務腦「我要打哪一個國家」。
4. 商務腦回答該國對類似產品的**需求趨勢**、進口狀況、可能的買家，以及該用哪個管道、怎麼寫。
5. 核准後寄出，各管道的回覆進同一個收件匣。

## 需求趨勢：越多人用越準
企業的客戶、報價、成交是機密，商務腦**不會顯示任何一家使用者公司的資料**。它把所有使用者的寄信、回覆、詢價、約會議、成交行為匿名彙總成「國家 × 產品類別 × 時間」的需求趨勢，再結合公開進口數據（UN Comtrade、各國海關）。
- 匿名門檻：同一格至少 5 家使用者公司、20 個買家才顯示，並加上差分隱私誤差。
- 使用的人越多，涵蓋的國家和產品越廣，更新從「月」縮短到「週」。

## Packaging (offline bundle)
```
node tools/pack.mjs            # or: npm run pack
```
Builds `dist/brain-for-cross-border-deal-<version>.zip` and `.tar.gz` (plus `.sha256`): the app, docs, launchers for Windows / macOS / Linux, and a `manifest.json` with the SHA-256 of every file. The packager refuses to build if the published data file contains an email address, a URL, or any cell below the privacy threshold. Pushing a `v*` tag runs the same packager in GitHub Actions and attaches the bundle to a GitHub Release.

## 本機試用介面
直接用瀏覽器打開 `apps/web/index.html`（不用安裝、不連網，資料都是示意）。

## 專案結構
```
apps/web/            網頁介面（目前是可操作的示意版）
services/brain       AI 代理人：查知識庫、查趨勢、找買家、選管道、寫信
services/ingest      網站、簡報、影片、圖片解析成公司知識庫
services/market      公開進口數據轉接器（Comtrade、e-Stat、Census、Eurostat、台灣關務署）
services/trends      需求趨勢引擎：匿名訊號、門檻、差分隱私、熱度指數
services/outreach    寄信與發訊（沿用 DealPilot 企業版：核准、追蹤、退訂）
services/inbox       各管道回覆合併
connectors/          gmail、outlook、line、whatsapp、linkedin-assist、kakao、wechat、zalo、telegram
deploy/              雲端部署與地端打包（dp-pack）
docs/                架構、管道、資料來源、里程碑
```

## 文件
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/CHANNELS.md](docs/CHANNELS.md)
- [docs/DATA-SOURCES.md](docs/DATA-SOURCES.md)
- [docs/ROADMAP.md](docs/ROADMAP.md)

## 狀態
v0.1.0：設計稿＋可操作的介面示意。後端尚未實作。
