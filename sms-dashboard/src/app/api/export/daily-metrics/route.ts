import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function toCsv(rows: any[]): string {
  if (rows.length === 0) return ''
  const headers = Object.keys(rows[0])
  const escape = (val: any) => {
    if (val === null || val === undefined) return ''
    const str = String(val)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return '"' + str.replace(/"/g, '""') + '"'
    }
    return str
  }
  const lines = [headers.join(',')]
  for (const row of rows) {
    lines.push(headers.map((h) => escape((row as any)[h])).join(','))
  }
  return lines.join('\n')
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const start = url.searchParams.get('start')
    const end = url.searchParams.get('end')
    const supabase = await createClient()

    let query = supabase.from('daily_metrics_summary').select('*')
    if (start) query = query.gte('date', start)
    if (end) query = query.lte('date', end)
    query = query.order('date', { ascending: true })

    const { data, error } = await query
    if (error) throw error

    const rows = (data || []).map((m: any) => ({
      date: m.date,
      revenue: m.revenue,
      sms_cost: m.sms_cost,
      profit: m.profit,
      margin: m.margin,
      total_messages_sent: m.total_messages_sent,
      avg_click_rate: m.avg_click_rate,
      message_count: m.message_count,
    }))

    const csv = toCsv(rows)
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="daily-metrics.csv"`,
      },
    })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to export' }, { status: 500 })
  }
}


