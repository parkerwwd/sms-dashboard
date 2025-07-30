import { Database } from './database'

export type DailyMetric = Database['public']['Tables']['daily_metrics']['Row']
export type DailyMetricInsert = Database['public']['Tables']['daily_metrics']['Insert']
export type DailyMetricUpdate = Database['public']['Tables']['daily_metrics']['Update']

export type SmsMessage = Database['public']['Tables']['sms_messages']['Row']
export type SmsMessageInsert = Database['public']['Tables']['sms_messages']['Insert']
export type SmsMessageUpdate = Database['public']['Tables']['sms_messages']['Update']

export type DailyMetricsSummary = Database['public']['Views']['daily_metrics_summary']['Row']

// Form types
export interface SmsMessageFormData {
  content: string
  link_url?: string
  click_rate?: number
  num_sent: number
  est_cost?: number
}

export interface DailyMetricFormData {
  date: string
  sms_cost?: number
  revenue?: number
  messages: SmsMessageFormData[]
} 