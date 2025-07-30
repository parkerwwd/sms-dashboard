export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      daily_metrics: {
        Row: {
          id: number
          date: string
          sms_cost: number
          revenue: number
          profit: number
          margin: number
          created_at: string
        }
        Insert: {
          id?: number
          date: string
          sms_cost?: number
          revenue?: number
          created_at?: string
        }
        Update: {
          id?: number
          date?: string
          sms_cost?: number
          revenue?: number
          created_at?: string
        }
      }
      sms_messages: {
        Row: {
          id: number
          daily_id: number
          content: string
          link_url: string | null
          click_rate: number | null
          num_sent: number
          est_cost: number
          created_at: string
        }
        Insert: {
          id?: number
          daily_id: number
          content: string
          link_url?: string | null
          click_rate?: number | null
          num_sent: number
          est_cost?: number
          created_at?: string
        }
        Update: {
          id?: number
          daily_id?: number
          content?: string
          link_url?: string | null
          click_rate?: number | null
          num_sent?: number
          est_cost?: number
          created_at?: string
        }
      }
    }
    Views: {
      daily_metrics_summary: {
        Row: {
          id: number
          date: string
          revenue: number
          sms_cost: number
          profit: number
          margin: number
          created_at: string
          message_count: number
          total_messages_sent: number | null
          avg_click_rate: number | null
        }
      }
    }
    Functions: {}
    Enums: {}
  }
} 