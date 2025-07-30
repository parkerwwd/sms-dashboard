import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

// Initialize OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

// Set the refresh token
oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
})

export async function POST(request: NextRequest) {
  try {
    const { date } = await request.json()
    
    if (!date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      )
    }

    // Check if all required environment variables are set
    if (!process.env.GOOGLE_CLIENT_ID || 
        !process.env.GOOGLE_CLIENT_SECRET || 
        !process.env.GOOGLE_REFRESH_TOKEN) {
      return NextResponse.json(
        { error: 'Google AdSense is not configured. Please set up environment variables.' },
        { status: 500 }
      )
    }

    // Initialize AdSense API
    const adsense = google.adsense({
      version: 'v2',
      auth: oauth2Client
    })

    try {
      // Get the account ID first
      const accountsResponse = await adsense.accounts.list()
      const accounts = accountsResponse.data.accounts

      if (!accounts || accounts.length === 0) {
        return NextResponse.json(
          { error: 'No AdSense accounts found' },
          { status: 404 }
        )
      }

      const accountName = accounts[0].name || ''

      // Format date as YYYY-MM-DD
      const formattedDate = new Date(date).toISOString().split('T')[0]

      // Generate report with page-level data
      const reportResponse = await (adsense as any).accounts.reports.generate({
        name: `${accountName}/reports`,
        dateRange: 'CUSTOM',
        'startDate.year': new Date(date).getFullYear(),
        'startDate.month': new Date(date).getMonth() + 1,
        'startDate.day': new Date(date).getDate(),
        'endDate.year': new Date(date).getFullYear(),
        'endDate.month': new Date(date).getMonth() + 1,
        'endDate.day': new Date(date).getDate(),
        metrics: ['ESTIMATED_EARNINGS', 'PAGE_VIEWS', 'IMPRESSIONS', 'CLICKS'],
        dimensions: ['PAGE_PATH', 'DOMAIN_NAME'],
        orderBy: '-ESTIMATED_EARNINGS',
        limit: 100 // Get top 100 pages by earnings
      })

      // Process page-level data
      const rows = reportResponse.data?.rows || []
      let totalRevenue = 0
      const domainBreakdown: Record<string, number> = {}
      const pageBreakdown: any[] = []

      rows.forEach((row: any) => {
        const cells = row.cells || []
        if (cells.length >= 6) {
          const pagePath = cells[0]?.value || 'Unknown'
          const domain = cells[1]?.value || 'Unknown'
          const earnings = parseFloat(cells[2]?.value || '0')
          const pageViews = parseInt(cells[3]?.value || '0')
          const impressions = parseInt(cells[4]?.value || '0')
          const clicks = parseInt(cells[5]?.value || '0')
          
          totalRevenue += earnings
          
          // Aggregate by domain
          domainBreakdown[domain] = (domainBreakdown[domain] || 0) + earnings
          
          // Store page-level data
          pageBreakdown.push({
            pagePath,
            domain,
            earnings,
            pageViews,
            impressions,
            clicks,
            fullUrl: `https://${domain}${pagePath}`
          })
        }
      })

      // Convert domain breakdown to array
      const breakdown = Object.entries(domainBreakdown).map(([domain, earnings]) => ({
        domain,
        earnings
      }))

      return NextResponse.json({ 
        revenue: totalRevenue,
        breakdown,
        pageBreakdown,
        date: formattedDate,
        summary: {
          totalPages: pageBreakdown.length,
          totalPageViews: pageBreakdown.reduce((sum, p) => sum + p.pageViews, 0),
          totalClicks: pageBreakdown.reduce((sum, p) => sum + p.clicks, 0)
        }
      })
    } catch (apiError: any) {
      console.error('AdSense API Error:', apiError.message)
      
      // For now, return mock data if AdSense fails
      // This allows testing without proper AdSense setup
      return NextResponse.json({ 
        revenue: 0,
        breakdown: [],
        pageBreakdown: [],
        date: new Date(date).toISOString().split('T')[0],
        summary: {
          totalPages: 0,
          totalPageViews: 0,
          totalClicks: 0
        },
        note: 'AdSense API not fully configured. Returning default values.'
      })
    }
  } catch (error) {
    console.error('Error in AdSense revenue endpoint:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 