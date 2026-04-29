export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_status: string
  created_at: string
  updated_at: string
}

export interface StudySession {
  id: string
  user_id: string
  subject_id: string | null
  title: string
  description: string | null
  duration_minutes: number
  is_public: boolean
  ai_summary: string | null
  created_at: string
  updated_at: string
}

export interface StudyLog {
  id: string
  session_id: string
  user_id: string
  started_at: string
  ended_at: string | null
  duration_seconds: number
  notes: string | null
  created_at: string
}

export interface Subject {
  id: string
  name: string
  color: string
  icon: string | null
  user_id: string
  created_at: string
}

export interface Follow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

export interface Comment {
  id: string
  session_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
}

export interface Like {
  id: string
  session_id: string
  user_id: string
  created_at: string
}

type InsertOf<T extends { id: string; created_at: string }> = Omit<
  T,
  'id' | 'created_at'
> &
  Partial<Pick<T, 'id' | 'created_at'>>

type UpdateOf<T> = Partial<T>

export type Database = {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'created_at' | 'updated_at'> &
          Partial<Pick<User, 'created_at' | 'updated_at'>>
        Update: UpdateOf<User>
      }
      study_sessions: {
        Row: StudySession
        Insert: InsertOf<StudySession> & Partial<Pick<StudySession, 'updated_at'>>
        Update: UpdateOf<StudySession>
      }
      study_logs: {
        Row: StudyLog
        Insert: InsertOf<StudyLog>
        Update: UpdateOf<StudyLog>
      }
      subjects: {
        Row: Subject
        Insert: InsertOf<Subject>
        Update: UpdateOf<Subject>
      }
      follows: {
        Row: Follow
        Insert: InsertOf<Follow>
        Update: UpdateOf<Follow>
      }
      comments: {
        Row: Comment
        Insert: InsertOf<Comment> & Partial<Pick<Comment, 'updated_at'>>
        Update: UpdateOf<Comment>
      }
      likes: {
        Row: Like
        Insert: InsertOf<Like>
        Update: UpdateOf<Like>
      }
    }
    Views: Record<string, never>
    Functions: {
      get_user_stats: {
        Args: { user_uuid: string }
        Returns: {
          total_sessions: number
          total_duration_minutes: number
          public_sessions: number
          followers: number
          following: number
        }
      }
    }
    Enums: Record<string, never>
  }
}
