'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DailyMetricFormData, SmsMessageFormData } from '@/types'
import { format } from 'date-fns'
import { Plus, Trash2, Download } from 'lucide-react'

export default function AddPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetchingRevenue, setFetchingRevenue] = useState(false)
  const [formData, setFormData] = useState<DailyMetricFormData>({
    date: format(new Date(), 'yyyy-MM-dd'),
    sms_cost: undefined,
    revenue: undefined,
    messages: []
  })

  const addMessage = () => {
    setFormData({
      ...formData,
      messages: [
        ...formData.messages,
        {
          content: '',
          link_url: '',
          click_rate: undefined,
          num_sent: 0,
          est_cost: undefined
        }
      ]
    })
  }

  const removeMessage = (index: number) => {
    setFormData({
      ...formData,
      messages: formData.messages.filter((_, i) => i !== index)
    })
  }

  const updateMessage = (index: number, field: keyof SmsMessageFormData, value: any) => {
    const updatedMessages = [...formData.messages]
    updatedMessages[index] = { ...updatedMessages[index], [field]: value }
    setFormData({ ...formData, messages: updatedMessages })
  }

  const fetchAdSenseRevenue = async () => {
    setFetchingRevenue(true)
    try {
      const response = await fetch('/api/adsense/revenue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: formData.date })
      })
      
      if (response.ok) {
        const data = await response.json()
        setFormData({ ...formData, revenue: data.revenue })
      } else {
        alert('Failed to fetch AdSense revenue. Please check your configuration.')
      }
    } catch (error) {
      console.error('Error fetching revenue:', error)
      alert('Error fetching AdSense revenue.')
    } finally {
      setFetchingRevenue(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      
      // Calculate total SMS cost if not provided
      let sms_cost = formData.sms_cost
      if (sms_cost === undefined && formData.messages.length > 0) {
        sms_cost = formData.messages.reduce((sum, msg) => sum + (msg.est_cost || 0), 0)
      }

      // Insert daily metric
      const { data: dailyMetric, error: metricError } = await supabase
        .from('daily_metrics')
        .insert({
          date: formData.date,
          sms_cost: sms_cost || 0,
          revenue: formData.revenue || 0
        })
        .select()
        .single()

      if (metricError) throw metricError

      // Insert SMS messages if any
      if (formData.messages.length > 0 && dailyMetric) {
        const messagesToInsert = formData.messages.map(msg => ({
          daily_id: dailyMetric.id,
          content: msg.content,
          link_url: msg.link_url || null,
          click_rate: msg.click_rate || null,
          num_sent: msg.num_sent,
          est_cost: msg.est_cost || 0
        }))

        const { error: messagesError } = await supabase
          .from('sms_messages')
          .insert(messagesToInsert)

        if (messagesError) throw messagesError
      }

      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving data:', error)
      alert('Error saving data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Add Daily Data</h1>
        <p className="text-gray-600 mt-2">Track your SMS campaigns and revenue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Revenue ($)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={formData.revenue || ''}
                  onChange={(e) => setFormData({ ...formData, revenue: parseFloat(e.target.value) || undefined })}
                  placeholder="0.00"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={fetchAdSenseRevenue}
                  disabled={fetchingRevenue}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {fetchingRevenue ? 'Fetching...' : 'Fetch'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMS Cost ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.sms_cost || ''}
                onChange={(e) => setFormData({ ...formData, sms_cost: parseFloat(e.target.value) || undefined })}
                placeholder="Auto-calculate from messages"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* SMS Messages */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">SMS Messages</h2>
            <button
              type="button"
              onClick={addMessage}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Message
            </button>
          </div>

          {formData.messages.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No messages added yet. Click "Add Message" to start tracking SMS campaigns.
            </p>
          ) : (
            <div className="space-y-6">
              {formData.messages.map((message, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
                  <button
                    type="button"
                    onClick={() => removeMessage(index)}
                    className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message Content
                      </label>
                      <textarea
                        required
                        value={message.content}
                        onChange={(e) => updateMessage(index, 'content', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter SMS message content..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Link URL (optional)
                      </label>
                      <input
                        type="url"
                        value={message.link_url || ''}
                        onChange={(e) => updateMessage(index, 'link_url', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Click Rate (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={message.click_rate ? message.click_rate * 100 : ''}
                        onChange={(e) => updateMessage(index, 'click_rate', parseFloat(e.target.value) / 100 || undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="4.5"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number Sent
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={message.num_sent}
                        onChange={(e) => updateMessage(index, 'num_sent', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estimated Cost ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={message.est_cost || ''}
                        onChange={(e) => updateMessage(index, 'est_cost', parseFloat(e.target.value) || undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Saving...' : 'Save Data'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
} 