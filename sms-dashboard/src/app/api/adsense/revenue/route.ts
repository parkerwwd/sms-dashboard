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

      // Generate report using the simplified approach
      const reportResponse = await (adsense as any).accounts.reports.generate({
        name: `${accountName}/reports`,
        dateRange: 'CUSTOM',
        'startDate.year': new Date(date).getFullYear(),
        'startDate.month': new Date(date).getMonth() + 1,
        'startDate.day': new Date(date).getDate(),
        'endDate.year': new Date(date).getFullYear(),
        'endDate.month': new Date(date).getMonth() + 1,
        'endDate.day': new Date(date).getDate(),
        metrics: 'ESTIMATED_EARNINGS',
        dimensions: 'DOMAIN_NAME',
      })

      // Calculate total revenue
      const rows = reportResponse.data?.rows || []
      let totalRevenue = 0
      const breakdown: any[] = []

      rows.forEach((row: any) => {
        const cells = row.cells || []
        if (cells.length >= 2) {
          const domain = cells[0]?.value || 'Unknown'
          const earnings = parseFloat(cells[1]?.value || '0')
          totalRevenue += earnings
          breakdown.push({ domain, earnings })
        }
      })

      return NextResponse.json({ 
        revenue: totalRevenue,
        breakdown,
        date: formattedDate
      })
    } catch (apiError: any) {
      console.error('AdSense API Error:', apiError.message)
      
      // For now, return mock data if AdSense fails
      // This allows testing without proper AdSense setup
      return NextResponse.json({ 
        revenue: 0,
        breakdown: [],
        date: new Date(date).toISOString().split('T')[0],
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