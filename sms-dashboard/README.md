# 📈 SMS Profitability Tracker

A modern dashboard to monitor SMS campaign performance and AdSense revenue, built with Next.js and Supabase.

## 🌟 Features

- **Dashboard Overview**: View last 30 days of SMS campaign performance
- **Data Entry**: Add daily SMS campaigns with cost tracking
- **Revenue Integration**: Fetch AdSense revenue automatically via API
- **Analytics**: Visualize trends with interactive charts
- **Profit Calculations**: Automatic profit and margin calculations
- **Message Tracking**: Track individual SMS messages with click rates

## 🚀 Setup Instructions

### 1. Clone and Install

```bash
cd sms-dashboard
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase/schema.sql`
3. Get your project URL and anon key from Settings > API

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google AdSense (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback
GOOGLE_REFRESH_TOKEN=your_refresh_token
```

### 4. Set Up Google AdSense (Optional)

To enable automatic revenue fetching:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable AdSense Management API
4. Create OAuth 2.0 credentials
5. Use the OAuth 2.0 Playground to get a refresh token

### 5. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Usage Guide

### Dashboard Page (`/dashboard`)
- View last 30 days of metrics
- See total revenue, costs, profit, and margin
- Click "View Details" to see SMS messages for each day

### Add Data Page (`/add`)
- Select date for entry
- Enter revenue manually or fetch from AdSense
- Add SMS messages with:
  - Message content
  - Link URL (optional)
  - Click rate percentage
  - Number of messages sent
  - Estimated cost

### Messages Page (`/messages/:id`)
- View all SMS messages for a specific day
- See detailed metrics including cost per click
- Review daily performance summary

### Charts Page (`/charts`)
- Profit trends over time
- Revenue vs Cost comparison
- Click rate distribution
- SMS volume correlation with revenue

## 🛠️ Technical Details

### Tech Stack
- **Frontend**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Charts**: Recharts
- **API Integration**: Google AdSense Management API

### Database Schema

**daily_metrics**
- `id`: Primary key
- `date`: Unique date
- `sms_cost`: Total SMS cost
- `revenue`: Daily revenue
- `profit`: Auto-calculated (revenue - cost)
- `margin`: Auto-calculated percentage

**sms_messages**
- `id`: Primary key
- `daily_id`: Foreign key to daily_metrics
- `content`: Message text
- `link_url`: Optional link
- `click_rate`: Click through rate
- `num_sent`: Number of messages sent
- `est_cost`: Estimated cost

## 🔧 Troubleshooting

### AdSense Integration Issues
- Ensure all Google credentials are properly set
- Check that AdSense Management API is enabled
- Verify refresh token is valid

### Database Connection Issues
- Verify Supabase URL and anon key
- Check if tables are created properly
- Ensure Supabase project is active

## 📈 Future Enhancements

- CSV Import/Export functionality
- Multi-domain support
- Email/Slack alerts for low margins
- User authentication
- Weekly/monthly aggregated reports

## 📝 License

MIT License - feel free to use for your SMS campaign tracking needs!

---

Built by Parker @ Worldwide Digital
