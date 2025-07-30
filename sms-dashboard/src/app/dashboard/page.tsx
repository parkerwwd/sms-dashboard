import { createClient } from '@/lib/supabase/server'
import { DailyMetricsSummary } from '@/types'
import { format, subDays } from 'date-fns'
import { DollarSign, TrendingUp, TrendingDown, Eye, Plus } from 'lucide-react'
import Link from 'next/link'

async function getDailyMetrics(): Promise<DailyMetricsSummary[]> {
  const supabase = await createClient()
  
  const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd')
  
  const { data, error } = await supabase
    .from('daily_metrics_summary')
    .select('*')
    .gte('date', thirtyDaysAgo)
    .order('date', { ascending: false })
  
  if (error) {
    console.error('Error fetching daily metrics:', error)
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

export default async function DashboardPage() {
  const metrics = await getDailyMetrics()
  
  // Calculate KPIs
  const totalRevenue = metrics.reduce((sum, m) => sum + m.revenue, 0)
  const totalCost = metrics.reduce((sum, m) => sum + m.sms_cost, 0)
  const totalProfit = metrics.reduce((sum, m) => sum + m.profit, 0)
  const avgMargin = totalRevenue > 0 ? totalProfit / totalRevenue : 0
  
  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-slate-600 mt-2 text-lg">Last 30 days performance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-green-100/50 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Revenue</p>
              <p className="text-3xl font-bold text-green-700 mt-1">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-red-100/50 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Cost</p>
              <p className="text-3xl font-bold text-red-700 mt-1">{formatCurrency(totalCost)}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100/50 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Profit</p>
              <p className={`text-3xl font-bold mt-1 ${totalProfit >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                {formatCurrency(totalProfit)}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              totalProfit >= 0 
                ? 'bg-gradient-to-br from-blue-400 to-blue-600' 
                : 'bg-gradient-to-br from-red-400 to-red-600'
            }`}>
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100/50 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Avg Margin</p>
              <p className="text-3xl font-bold text-purple-700 mt-1">{formatPercentage(avgMargin)}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200/50">
          <h2 className="text-xl font-semibold text-slate-800">Recent Performance</h2>
        </div>
        
        {metrics.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-slate-700 mb-2">No data available</h3>
            <p className="text-slate-500 mb-6">Start by adding your first daily metrics to see your performance.</p>
            <Link 
              href="/add"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add First Entry
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200/50">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    SMS Cost
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Profit
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Margin
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Messages
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/30 divide-y divide-slate-200/30">
                {metrics.map((metric, index) => (
                  <tr key={metric.id} className={`hover:bg-white/50 transition-colors ${index % 2 === 0 ? 'bg-white/20' : 'bg-white/10'}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {format(new Date(metric.date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-700 font-semibold">
                      {formatCurrency(metric.revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-700 font-semibold">
                      {formatCurrency(metric.sms_cost)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                      <span className={metric.profit >= 0 ? 'text-blue-700' : 'text-red-700'}>
                        {formatCurrency(metric.profit)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">
                      {formatPercentage(metric.margin)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {metric.message_count > 0 ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                          {metric.message_count} messages
                        </span>
                      ) : (
                        <span className="text-slate-400">No messages</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link 
                        href={`/messages/${metric.id}`}
                        className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-xs font-medium rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
} 