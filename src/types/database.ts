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
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'> & {
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Profile, 'id'>>
      }
      study_sessions: {
        Row: StudySession
        Insert: Omit<StudySession, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<StudySession, 'id' | 'user_id'>>
      }
      study_session_versions: {
        Row: StudySessionVersion
        Insert: Omit<StudySessionVersion, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: never
      }
      subjects: {
        Row: Subject
        Insert: Omit<Subject, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<Subject, 'id'>>
      }
      subscriptions: {
        Row: Subscription
        Insert: Omit<Subscription, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Subscription, 'id' | 'user_id'>>
      }
      study_logs: {
        Row: {
          id: string
          user_id: string
          session_id: string | null
          subject_id: string | null
          duration_minutes: number
          tasks_completed: string[]
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_id?: string | null
          subject_id?: string | null
          duration_minutes: number
          tasks_completed?: string[]
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<{
          duration_minutes: number
          tasks_completed: string[]
          notes: string | null
          updated_at: string
        }>
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
        Update: never
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
        Update: never
      }
      comments: {
        Row: {
          id: string
          user_id: string
          session_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_id: string
          content: string
          created_at?: string
        }
        Update: never
      }
      ai_usage_tracking: {
        Row: {
          id: string
          user_id: string
          request_type: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          request_type: string
          created_at?: string
        }
        Update: never
      }
    }
    Functions: {
      get_profile_stats: {
        Args: { profile_id: string }
        Returns: {
          followers_count: number
          following_count: number
          study_hours_total: number
          tasks_completed_count: number
        }
      }
    }
  }
}

// ── Core entity interfaces ──────────────────────────────────────────────────

export interface Profile {
  id: string
  user_id: string
  username: string
  display_name: string
  bio: string | null
  study_focus: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface StudySession {
  id: string
  user_id: string
  name: string
  subject_id: string | null
  duration_minutes: number
  status: 'active' | 'archived' | 'completed'
  tasks: string[]
  version: number
  created_at: string
  updated_at: string
}

export interface StudySessionVersion {
  id: string
  session_id: string
  user_id: string
  name: string
  subject_id: string | null
  duration_minutes: number
  tasks: string[]
  version_number: number
  created_at: string
}

export interface Subject {
  id: string
  name: string
  category: string
  description: string | null
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  tier: 'free' | 'pro'
  status: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  current_period_end: string | null
  created_at: string
  updated_at: string
}

// ── Composite types ─────────────────────────────────────────────────────────

export type SessionWithSubject = StudySession & {
  subject: Subject | null
  profile: Pick<Profile, 'username' | 'display_name' | 'avatar_url'> | null
}

export type SessionWithVersions = SessionWithSubject & {
  versions: StudySessionVersion[]
}
