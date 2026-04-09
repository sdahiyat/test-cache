// ============================================================
// Core database entity types
// ============================================================

export interface Profile {
  id: string
  user_id: string
  display_name: string
  username: string
  bio: string | null
  study_focus: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
  username_updated_at: string | null
}

export interface ProfileStats {
  study_hours: number
  tasks_completed: number
  followers_count: number
  following_count: number
  sessions_count: number
}

// ============================================================
// Study focus options
// ============================================================
export type StudyFocus =
  | 'STEM'
  | 'Humanities'
  | 'Business'
  | 'Arts'
  | 'Law'
  | 'Medicine'
  | 'Social Sciences'
  | 'Other'

export const STUDY_FOCUS_OPTIONS: StudyFocus[] = [
  'STEM',
  'Humanities',
  'Business',
  'Arts',
  'Law',
  'Medicine',
  'Social Sciences',
  'Other',
]

// ============================================================
// Input types for mutations
// ============================================================
export interface UpdateProfileInput {
  display_name?: string
  username?: string
  bio?: string | null
  study_focus?: StudyFocus | null
}

// ============================================================
// Study session types (stubbed for future tasks)
// ============================================================
export interface StudySession {
  id: string
  user_id: string
  name: string
  subject: string
  duration_minutes: number
  created_at: string
  updated_at: string
}

// ============================================================
// Study log types (stubbed for future tasks)
// ============================================================
export interface StudyLog {
  id: string
  user_id: string
  session_id: string | null
  subject: string
  duration_minutes: number
  tasks_completed: number
  notes: string | null
  created_at: string
}

// ============================================================
// Follow relationship types (stubbed for future tasks)
// ============================================================
export interface Follow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

// ============================================================
// Subscription tiers
// ============================================================
export type SubscriptionTier = 'free' | 'pro'

export interface UserSubscription {
  user_id: string
  tier: SubscriptionTier
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  expires_at: string | null
  created_at: string
}
