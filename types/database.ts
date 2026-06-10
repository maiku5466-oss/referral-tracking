export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type AgencyStatus = 'active' | 'inactive' | 'suspended'
export type ProspectStatus = 'registered' | 'surveyed' | 'booked' | 'met' | 'contracted' | 'lost'
export type CommissionStatus = 'pending' | 'confirmed' | 'paid'

export interface Agency {
  id: string
  user_id: string
  name: string
  contact_name: string
  referral_code: string
  commission_rate: number
  status: AgencyStatus
  created_at: string
  updated_at: string
}

export interface Prospect {
  id: string
  line_user_id: string
  agency_id: string | null
  referral_code: string
  name: string | null
  company_name: string | null
  phone: string | null
  email: string | null
  status: ProspectStatus
  contract_amount: number | null
  zoom_booked_at: string | null
  contracted_at: string | null
  raw_survey_data: Json | null
  created_at: string
  updated_at: string
}

export interface ReferralEvent {
  id: string
  prospect_id: string
  agency_id: string | null
  event_type: string
  payload: Json | null
  created_at: string
}

export interface Commission {
  id: string
  agency_id: string
  prospect_id: string
  trigger_event: string
  contract_amount: number
  commission_rate_snapshot: number
  amount: number
  status: CommissionStatus
  confirmed_at: string | null
  paid_at: string | null
  created_at: string
}

export interface WebhookLog {
  id: string
  source: string
  payload: Json | null
  processed: boolean
  error_msg: string | null
  created_at: string
}

// Supabase クライアントの型推論に必要な形式
export interface Database {
  public: {
    Tables: {
      agencies: {
        Row: Agency
        Insert: Omit<Agency, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Agency>
        Relationships: []
      }
      prospects: {
        Row: Prospect
        Insert: Omit<Prospect, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Prospect>
        Relationships: []
      }
      referral_events: {
        Row: ReferralEvent
        Insert: Omit<ReferralEvent, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<ReferralEvent>
        Relationships: []
      }
      commissions: {
        Row: Commission
        Insert: Omit<Commission, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Commission>
        Relationships: []
      }
      webhook_logs: {
        Row: WebhookLog
        Insert: Omit<WebhookLog, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<WebhookLog>
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
