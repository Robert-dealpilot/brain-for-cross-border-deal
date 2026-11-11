# 架構

```
Web App（對話、知識庫、需求趨勢、買家、聯絡計畫、收件匣）
  └─ Brain（AI 代理人）
       工具：search_knowledge｜query_trends｜query_trade｜find_buyers｜pick_channels｜draft_message｜schedule
服務：ingest｜market｜trends｜leads｜outreach｜inbox
連接器：Email（Gmail、Outlook、SMTP）、LINE OA、WhatsApp Business、LinkedIn（輔助）、KakaoTalk、WeChat、Zalo、Telegram
```

## 原則
- 數字只來自資料來源，AI 回答一律附出處與資料時間；查不到就說查不到。
- 使用者之間資料不互通；trends 只輸出匿名彙總（k ≥ 5 家使用者公司、≥ 20 個買家，加差分隱私）。
- 寄出前一定要使用者核准；退訂、退信 2 天內自動排除。
- 每個服務自己管理資料庫結構，部署前自動檢查欄位。
- 寄信失敗即時告警。

## trends 資料流
1. 事件：sent、opened、replied、inquiry、quote_requested、meeting、won（只在使用者同意下收集）。
2. 去識別：只留 國家、HS 4～6 碼、週、事件類型；不存公司、聯絡人、金額明細。
3. 彙總：國家 × HS × 週；未達門檻就往上合併（HS 4 碼、月、季）。
4. 熱度指數：匿名訊號變化 ＋ 公開進口數據 → 0～100，上升／持平／下降。
