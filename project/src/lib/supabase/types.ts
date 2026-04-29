export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      subjects: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string | null
          icon: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string | null
          icon?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string | null
          icon?: string | null
          created_at?: string
        }
      }
      study_sessions: {
        Row: {
          id: string
          user_id: string
          subject_id: string | null
          title: string | null
          description: string | null
          start_time: string
          end_time: string | null
          duration_seconds: number | null
          is_active: boolean
          goal_duration_seconds: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject_id?: string | null
          title?: string | null
          description?: string | null
          start_time: string
          end_time?: string | null
          duration_seconds?: number | null
          is_active?: boolean
          goal_duration_seconds?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject_id?: string | null
          title?: string | null
          description?: string | null
          start_time?: string
          end_time?: string | null
          duration_seconds?: number | null
          is_active?: boolean
          goal_duration_seconds?: number | null
          created_at?: string
        }
      }
      study_logs: {
        Row: {
          id: string
          session_id: string
          user_id: string
          log_type: 'start' | 'pause' | 'resume' | 'stop' | 'note'
          note: string | null
          timestamp: string
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          log_type: 'start' | 'pause' | 'resume' | 'stop' | 'note'
          note?: string | null
          timestamp?: string
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string
          log_type?: 'start' | 'pause' | 'resume' | 'stop' | 'note'
          note?: string | null
          timestamp?: string
        }
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          user_id: string
          session_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          user_id: string
          session_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_id?: string
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

type PublicTables = Database['public']['Tables']

export type User = PublicTables['users']['Row']
export type UserInsert = PublicTables['users']['Insert']
export type UserUpdate = PublicTables['users']['Update']

export type Subject = PublicTables['subjects']['Row']
export type SubjectInsert = PublicTables['subjects']['Insert']
export type SubjectUpdate = PublicTables['subjects']['Update']

export type StudySession = PublicTables['study_sessions']['Row']
export type StudySessionInsert = PublicTables['study_sessions']['Insert']
export type StudySessionUpdate = PublicTables['study_sessions']['Update']

export type StudyLog = PublicTables['study_logs']['Row']
export type StudyLogInsert = PublicTables['study_logs']['Insert']
export type StudyLogUpdate = PublicTables['study_logs']['Update']

export type Follow = PublicTables['follows']['Row']
export type FollowInsert = PublicTables['follows']['Insert']
export type FollowUpdate = PublicTables['follows']['Update']

export type Comment = PublicTables['comments']['Row']
export type CommentInsert = PublicTables['comments']['Insert']
export type CommentUpdate = PublicTables['comments']['Update']

export type Like = PublicTables['likes']['Row']
export type LikeInsert = PublicTables['likes']['Insert']
export type LikeUpdate = PublicTables['likes']['Update']
