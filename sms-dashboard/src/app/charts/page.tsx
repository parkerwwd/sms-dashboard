'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DailyMetricsSummary } from '@/types'
import { format, subDays } from 'date-fns'
import DateRangePicker from '@/components/DateRangePicker'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts'

export default function ChartsPage() {
  const [metrics, setMetrics] = useState<DailyMetricsSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [start, setStart] = useState<string>(format(subDays(new Date(), 30), 'yyyy-MM-dd'))
  const [end, setEnd] = useState<string>(format(new Date(), 'yyyy-MM-dd'))

  useEffect(() => {
    fetchMetrics(start, end)
  }, [start, end])

  const fetchMetrics = async (startDate?: string, endDate?: string) => {
    const supabase = createClient()
    let query = supabase.from('daily_metrics_summary').select('*').order('date', { ascending: true })
    const startBound = startDate || format(subDays(new Date(), 30), 'yyyy-MM-dd')
    const endBound = endDate
    if (startBound) query = query.gte('date', startBound)
    if (endBound) query = query.lte('date', endBound)
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching metrics:', error)
    } else {
      setMetrics(data || [])
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading charts...</div>
      </div>
    )
  }

  // Prepare data for charts
  const chartData = metrics.map(m => ({
    date: format(new Date(m.date), 'MMM dd'),
    revenue: m.revenue,
    cost: m.sms_cost,
    profit: m.profit,
    margin: m.margin * 100,
    clickRate: (m.avg_click_rate || 0) * 100,
    messages: m.total_messages_sent || 0,
  }))

  // Calculate totals for pie chart
  const totalRevenue = metrics.reduce((sum, m) => sum + m.revenue, 0)
  const totalCost = metrics.reduce((sum, m) => sum + m.sms_cost, 0)
  const totalProfit = metrics.reduce((sum, m) => sum + m.profit, 0)

  const pieData = [
    { name: 'SMS Cost', value: totalCost, color: '#ef4444' },
    { name: 'Profit', value: totalProfit, color: '#10b981' },
  ]

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded shadow-lg">
          <p className="font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('Rate') || entry.name === 'Margin' 
                ? `${entry.value.toFixed(1)}%` 
                : entry.name === 'messages' 
                ? entry.value.toLocaleString()
                : `$${entry.value.toFixed(2)}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100">Analytics & Charts</h1>
            <p className="text-gray-600 dark:text-slate-400 mt-2">Visual insights into your SMS campaign performance</p>
          </div>
          <DateRangePicker onChange={(s, e) => { setStart(s); setEnd(e) }} />
        </div>
      </div>

      <div className="space-y-8">
        {/* Profit Over Time */}
        <div className="bg-white dark:bg-slate-900/80 rounded-lg shadow p-6 border border-slate-200/60 dark:border-slate-800">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-100 mb-4">Profit Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={customTooltip} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="profit" 
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.6}
                name="Profit"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue vs Cost */}
        <div className="bg-white dark:bg-slate-900/80 rounded-lg shadow p-6 border border-slate-200/60 dark:border-slate-800">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-100 mb-4">Revenue vs Cost</h2>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={customTooltip} />
              <Legend />
              <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
              <Bar dataKey="cost" fill="#ef4444" name="SMS Cost" />
              <Line 
                type="monotone" 
                dataKey="margin" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                name="Margin %"
                yAxisId="right"
              />
              <YAxis yAxisId="right" orientation="right" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Click Rate Distribution */}
        <div className="bg-white dark:bg-slate-900/80 rounded-lg shadow p-6 border border-slate-200/60 dark:border-slate-800">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-100 mb-4">Click Rate Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={customTooltip} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="clickRate" 
                stroke="#f59e0b" 
                strokeWidth={2}
                name="Click Rate %"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* SMS Volume vs Revenue */}
        <div className="bg-white dark:bg-slate-900/80 rounded-lg shadow p-6 border border-slate-200/60 dark:border-slate-800">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-100 mb-4">SMS Volume vs Revenue</h2>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip content={customTooltip} />
              <Legend />
              <Bar 
                dataKey="messages" 
                fill="#06b6d4" 
                name="Messages Sent"
                yAxisId="left"
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Revenue"
                yAxisId="right"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Cost Breakdown Pie Chart */}
        <div className="bg-white dark:bg-slate-900/80 rounded-lg shadow p-6 border border-slate-200/60 dark:border-slate-800">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-100 mb-4">Revenue Breakdown</h2>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center text-sm text-gray-600">
            Total Revenue: ${totalRevenue.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  )
} 