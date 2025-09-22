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
      users: {
        Row: {
          id: string
          username: string
          password: string
          role: 'admin' | 'staff'
          email: string | null
          created_at: string
        }
        Insert: {
          id?: string
          username: string
          password: string
          role: 'admin' | 'staff'
          email?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          password?: string
          role?: 'admin' | 'staff'
          email?: string | null
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          price: number
          stock: number
          image: string | null
          category: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          price: number
          stock?: number
          image?: string | null
          category?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          price?: number
          stock?: number
          image?: string | null
          category?: string
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          items: Json
          total: number
          payment_method: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          items: Json
          total: number
          payment_method: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          items?: Json
          total?: number
          payment_method?: string
          user_id?: string
          created_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          action: string
          user_id: string
          user_role: string
          type: string
          details: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          action: string
          user_id: string
          user_role: string
          type?: string
          details?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          action?: string
          user_id?: string
          user_role?: string
          type?: string
          details?: Json | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          title: string
          message: string
          type: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          message: string
          type: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          message?: string
          type?: string
          read?: boolean
          created_at?: string
        }
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