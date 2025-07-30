import { createClient } from '@/lib/supabase/server'
import { DailyMetric, SmsMessage } from '@/types'
import { format } from 'date-fns'
import { ArrowLeft, MessageSquare, MousePointer, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

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

async function getMessages(dailyId: string): Promise<SmsMessage[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('sms_messages')
    .select('*')
    .eq('daily_id', dailyId)
    .order('created_at', { ascending: true })
  
  if (error) {
    console.error('Error fetching messages:', error)
    return []
  }
  
  return data || []
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

function formatPercentage(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)
}

export default async function MessagesPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const dailyMetric = await getDailyMetric(id)
  
  if (!dailyMetric) {
    notFound()
  }
  
  const messages = await getMessages(id)
  
  // Calculate totals
  const totalSent = messages.reduce((sum, msg) => sum + msg.num_sent, 0)
  const totalClicks = messages.reduce((sum, msg) => sum + (msg.num_sent * (msg.click_rate || 0)), 0)
  const avgClickRate = totalSent > 0 ? totalClicks / totalSent : 0
  const totalMessageCost = messages.reduce((sum, msg) => sum + msg.est_cost, 0)
  
  return (
    <div>
      <div className="mb-8">
        <Link 
          href="/dashboard"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-800">Messages Detail</h1>
        <p className="text-gray-600 mt-2">
          {format(new Date(dailyMetric.date), 'MMMM dd, yyyy')}
        </p>
      </div>

      {/* Daily Summary */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Daily Summary</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-600">Revenue</p>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(dailyMetric.revenue)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">SMS Cost</p>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(dailyMetric.sms_cost)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Profit</p>
            <p className={`text-2xl font-bold ${dailyMetric.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(dailyMetric.profit)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Margin</p>
            <p className="text-2xl font-bold text-gray-800">{formatPercentage(dailyMetric.margin)}</p>
          </div>
        </div>
      </div>

      {/* Messages Summary */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Messages Summary</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Total Messages</p>
              <p className="text-xl font-bold text-gray-800">{messages.length}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Total Sent</p>
              <p className="text-xl font-bold text-gray-800">{totalSent.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <MousePointer className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600">Avg Click Rate</p>
              <p className="text-xl font-bold text-gray-800">{formatPercentage(avgClickRate)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-sm text-gray-600">Message Cost</p>
              <p className="text-xl font-bold text-gray-800">{formatCurrency(totalMessageCost)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h2 className="text-xl font-semibold text-gray-800 p-6 pb-4">Message Details</h2>
        
        {messages.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No messages recorded for this day.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Content
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Link
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Click Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Num Sent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Est. Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost per Click
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {messages.map((message) => {
                  const clicks = message.num_sent * (message.click_rate || 0)
                  const costPerClick = clicks > 0 ? message.est_cost / clicks : 0
                  
                  return (
                    <tr key={message.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs overflow-hidden">
                          <p className="truncate" title={message.content}>
                            {message.content}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {message.link_url ? (
                          <a 
                            href={message.link_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline truncate block max-w-xs"
                          >
                            {message.link_url}
                          </a>
                        ) : (
                          <span className="text-gray-400">No link</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {message.click_rate ? formatPercentage(message.click_rate) : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {message.num_sent.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatCurrency(message.est_cost)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {clicks > 0 ? formatCurrency(costPerClick) : '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
} 