import { createClient } from '@/lib/supabase/server'
import { DailyMetric, SmsMessage } from '@/types'
import { format } from 'date-fns'
import { DollarSign, TrendingUp, Eye, Link2, FileText, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

type PageProps = {
  params: Promise<{ id: string }>
}

async function getDailyMetric(id: string): Promise<DailyMetric | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('daily_metrics')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error || !data) {
    return null
  }
  
  return data
}

async function getSmsMessages(dailyId: string): Promise<SmsMessage[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('sms_messages')
    .select('*')
    .eq('daily_id', dailyId)
    .order('num_sent', { ascending: false })
  
  if (error || !data) {
    return []
  }
  
  return data
}

async function fetchAdSensePageData(date: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/adsense/revenue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date }),
      cache: 'no-store'
    })
    
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.error('Error fetching AdSense data:', error)
  }
  
  return null
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}

export default async function RevenueAnalysisPage(props: PageProps) {
  const params = await props.params
  const dailyMetric = await getDailyMetric(params.id)
  
  if (!dailyMetric) {
    notFound()
  }
  
  const messages = await getSmsMessages(params.id)
  const adsenseData = await fetchAdSensePageData(dailyMetric.date)
  
  // Extract unique domains from SMS messages
  const smsLinks = messages
    .filter(m => m.link_url)
    .map(m => {
      try {
        const url = new URL(m.link_url!)
        return {
          message: m,
          domain: url.hostname,
          path: url.pathname,
          fullUrl: m.link_url!
        }
      } catch {
        return null
      }
    })
    .filter(Boolean) as Array<{
      message: SmsMessage
      domain: string
      path: string
      fullUrl: string
    }>
  
  // Match AdSense page data with SMS links
  const matchedPages = adsenseData?.pageBreakdown?.map((page: any) => {
    const matchingSms = smsLinks.find(link => 
      link.domain.includes(page.domain) && 
      (link.path === page.pagePath || link.path.includes(page.pagePath))
    )
    
    return {
      ...page,
      smsMessage: matchingSms?.message,
      isMatched: !!matchingSms
    }
  }) || []
  
  const matchedRevenue = matchedPages
    .filter((p: any) => p.isMatched)
    .reduce((sum: number, p: any) => sum + p.earnings, 0)
  
  const unmatchedRevenue = (adsenseData?.revenue || 0) - matchedRevenue
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Revenue Analysis
          </h1>
          <p className="text-slate-600 mt-1">
            {format(new Date(dailyMetric.date), 'MMMM dd, yyyy')}
          </p>
        </div>
        <Link 
          href="/dashboard"
          className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-700 mt-1">
                {formatCurrency(adsenseData?.revenue || 0)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">SMS-Attributed</p>
              <p className="text-2xl font-bold text-blue-700 mt-1">
                {formatCurrency(matchedRevenue)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {matchedRevenue > 0 ? Math.round((matchedRevenue / (adsenseData?.revenue || 1)) * 100) : 0}% of total
              </p>
            </div>
            <Link2 className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Other Revenue</p>
              <p className="text-2xl font-bold text-amber-700 mt-1">
                {formatCurrency(unmatchedRevenue)}
              </p>
            </div>
            <FileText className="w-8 h-8 text-amber-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Page Views</p>
              <p className="text-2xl font-bold text-purple-700 mt-1">
                {formatNumber(adsenseData?.summary?.totalPageViews || 0)}
              </p>
            </div>
            <Eye className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Page-Level Revenue Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Page-Level Revenue</h2>
          <p className="text-sm text-slate-600 mt-1">
            Top {adsenseData?.pageBreakdown?.length || 0} pages by revenue
          </p>
        </div>
        
        {adsenseData?.pageBreakdown && adsenseData.pageBreakdown.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Page URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    SMS Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Page Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Ad Clicks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    RPM
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {matchedPages.map((page: any, index: number) => {
                  const rpm = page.pageViews > 0 ? (page.earnings / page.pageViews) * 1000 : 0
                  
                  return (
                    <tr key={index} className={page.isMatched ? 'bg-blue-50' : ''}>
                      <td className="px-6 py-4 text-sm">
                        <a 
                          href={page.fullUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {page.pagePath}
                        </a>
                        <p className="text-xs text-slate-500">{page.domain}</p>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {page.smsMessage ? (
                          <div>
                            <p className="text-slate-900 truncate max-w-xs" title={page.smsMessage.content}>
                              {page.smsMessage.content}
                            </p>
                            <p className="text-xs text-slate-500">
                              {formatNumber(page.smsMessage.num_sent)} sent
                            </p>
                          </div>
                        ) : (
                          <span className="text-slate-400">Not from SMS</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-700">
                        {formatCurrency(page.earnings)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900">
                        {formatNumber(page.pageViews)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900">
                        {formatNumber(page.clicks)}
                      </td>
                      <td className="px-6 py-4 text-sm text-purple-700 font-medium">
                        {formatCurrency(rpm)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500">
            <p>No page-level revenue data available.</p>
            <p className="text-sm mt-2">Make sure AdSense is configured properly.</p>
          </div>
        )}
      </div>

      {/* SMS Messages Without Revenue */}
      {smsLinks.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">SMS Campaigns</h2>
            <p className="text-sm text-slate-600 mt-1">
              All SMS messages with links for this day
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Link
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Messages Sent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Click Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Cost
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {smsLinks.map((link, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 text-sm text-slate-900">
                      <p className="max-w-xs truncate" title={link.message.content}>
                        {link.message.content}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <a 
                        href={link.fullUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate block max-w-xs"
                      >
                        {link.path}
                      </a>
                      <p className="text-xs text-slate-500">{link.domain}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">
                      {formatNumber(link.message.num_sent)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">
                      {link.message.click_rate ? `${(link.message.click_rate * 100).toFixed(1)}%` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-red-700 font-medium">
                      {formatCurrency(link.message.est_cost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}