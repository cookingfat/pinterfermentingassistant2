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
      beers: {
        Row: {
          id: string // Changed from number to string for UUID
          created_at: string
          user_id: string
          tracking_id: string
          product_id: string
          status: string
          keg_color: string | null
          keg_nickname: string | null
          brewing_days: number
          conditioning_days: number
          fermentation_start_date: string | null
          conditioning_start_date: string | null
          is_custom: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          tracking_id: string
          product_id: string
          status: string
          keg_color?: string | null
          keg_nickname?: string | null
          brewing_days: number
          conditioning_days: number
          fermentation_start_date?: string | null
          conditioning_start_date?: string | null
          is_custom: boolean
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          tracking_id?: string
          product_id?: string
          status?: string
          keg_color?: string | null
          keg_nickname?: string | null
          brewing_days?: number
          conditioning_days?: number
          fermentation_start_date?: string | null
          conditioning_start_date?: string | null
          is_custom?: boolean
        }
        Relationships: []
      }
      custom_brews: {
        Row: {
          id: string
          created_at: string
          user_id: string
          name: string
          description: string | null
          style: string | null
          abv: number
          brewing_days: number
          conditioning_days: number
          background_gradient: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          name: string
          description?: string | null
          style?: string | null
          abv: number
          brewing_days: number
          conditioning_days: number
          background_gradient: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          name?: string
          description?: string | null
          style?: string | null
          abv?: number
          brewing_days?: number
          conditioning_days?: number
          background_gradient?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}