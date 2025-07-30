# 📈 SMS Profitability Tracker (Supabase + AdSense)

A modern dashboard to monitor SMS campaign performance and AdSense revenue, built with **Next.js + Supabase**. Automatically fetches revenue by domain using the **AdSense Management API**, and allows manual input of daily SMS message data.

---

## 🌟 Purpose

Track daily:

- 📩 SMS campaign messages (content, volume, click rate)
- 💰 Daily AdSense revenue per domain (auto-fetched)
- 💸 Total SMS cost
- 📊 Profit & margin calculations

---

## ⚙️ Tech Stack

| Layer       | Tech                          |
| ----------- | ----------------------------- |
| Frontend    | Next.js + Tailwind CSS        |
| Backend     | Supabase (Postgres, API)      |
| Auth        | Supabase Auth (optional)      |
| Revenue API | Google AdSense Management API |
| Charts      | `recharts` or `chart.js`      |

---

## 📦 Supabase Schema

### Table: `daily_metrics`

```sql
id          bigint PRIMARY KEY
date        date UNIQUE
sms_cost    numeric
revenue     numeric
profit      numeric GENERATED ALWAYS AS (revenue - sms_cost) STORED
margin      numeric GENERATED ALWAYS AS ((revenue - sms_cost) / NULLIF(revenue, 0)) STORED
created_at  timestamptz DEFAULT now()
```

### Table: `sms_messages`

```sql
id           bigint PRIMARY KEY
daily_id     bigint REFERENCES daily_metrics(id) ON DELETE CASCADE
content      text
link_url     text
click_rate   numeric      -- e.g. 0.045 = 4.5%
num_sent     int
est_cost     numeric
created_at   timestamptz DEFAULT now()
```

---

## 💻 App Pages

### `/dashboard`

- Table view of latest 30 days
- Columns:
  - Date
  - Revenue 💰
  - SMS Cost 💸
  - Profit 📈
  - Margin %
  - SMS Messages (view link)
- Top KPIs:
  - Total revenue, cost, and profit

---

### `/add`

Form to input:

- Date (defaults to today)
- SMS Cost (optional, can sum from SMS entries)

📝 **SMS Messages Section**:

- Add 1–N messages:
  - Content (textarea)
  - Link URL (optional)
  - Click rate
  - Number sent
  - Estimated cost

🚀 **AdSense Integration**

- "Fetch Revenue" button:
  - Calls AdSense API
  - Filters by domain and date
  - Populates `revenue` field

---

### `/messages/:daily_id`

- Table of messages for that day:
  - Content preview
  - Click rate
  - Num sent
  - Est. cost
  - Cost per click (calc)

---

### `/charts`

Visualizations using `recharts`:

- Profit over time
- Revenue vs Cost
- Click Rate distribution
- SMS Volume vs Revenue

---

## 🔐 Google AdSense Integration

- Use `googleapis` Node SDK
- Authenticate once via OAuth2 and store refresh token securely
- Use AdSense v2 `reports.generate` endpoint with:
  - Filter: `DOMAIN_NAME == yourdomain.com`
  - Date range: same day
  - Metric: `ESTIMATED_EARNINGS`
- Auto-pull revenue for selected date

---

## 🧠 Business Logic

- If SMS `est_cost` is entered → auto-sum to set `sms_cost`
- Else: user inputs `sms_cost` manually
- Calculate:
  - `profit = revenue - sms_cost`
  - `margin = profit / revenue`
- Optional validations:
  - Warn on 0 revenue or extreme CPC

---

## 🚀 Setup Instructions

1. Clone repo
2. Set up Supabase project & DB schema
3. Set Google Cloud credentials & AdSense OAuth2
4. Run `npm install && npm run dev`
5. Add your `.env` with Supabase + Google secrets

---

## ✅ Future Improvements

- CSV Import/Export
- Auth for team login (Supabase Auth)
- Slack/email alerts for low margin
- Multiple domains support
- Aggregate weekly/monthly summaries

---

Built to help SMS-first businesses track real-world profitability without needing UTM links or external analytics.

