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
          password_hash: string
          is_admin: boolean
          is_editor: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          password_hash: string
          is_admin?: boolean
          is_editor?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          password_hash?: string
          is_admin?: boolean
          is_editor?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      office_map: {
        Row: {
          id: string
          image_url: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          image_url: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          image_url?: string
          created_at?: string
          updated_at?: string
        }
      }
      desk_elements: {
        Row: {
          id: string
          x: number
          y: number
          width: number
          height: number
          desk_number: string
          status: 'available' | 'reserved' | 'permanently_occupied'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          x: number
          y: number
          width: number
          height: number
          desk_number: string
          status?: 'available' | 'reserved' | 'permanently_occupied'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          x?: number
          y?: number
          width?: number
          height?: number
          desk_number?: string
          status?: 'available' | 'reserved' | 'permanently_occupied'
          created_at?: string
          updated_at?: string
        }
      }
      reservations: {
        Row: {
          id: string
          user_id: string
          desk_id: string
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          desk_id: string
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          desk_id?: string
          date?: string
          created_at?: string
        }
      }
    }
  }
}

