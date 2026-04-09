// ============================================================
// StudySync — Database Type Definitions
// Mirrors the Supabase PostgreSQL schema defined in migrations.
// ============================================================

export interface Database {
  public: {
    Tables: {
      // ----------------------------------------------------------
      // profiles
      // ----------------------------------------------------------
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          bio: string | null;
          study_focus: string | null;
          avatar_url: string | null;
          username_updated_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string; // must match auth.uid()
          username: string;
          display_name: string;
          bio?: string | null;
          study_focus?: string | null;
          avatar_url?: string | null;
          username_updated_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string;
          bio?: string | null;
          study_focus?: string | null;
          avatar_url?: string | null;
          username_updated_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };

      // ----------------------------------------------------------
      // subscriptions
      // ----------------------------------------------------------
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          plan: 'free' | 'pro';
          status: 'active' | 'canceled' | 'past_due' | 'trialing';
          current_period_end: string | null;
          grace_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          plan?: 'free' | 'pro';
          status?: 'active' | 'canceled' | 'past_due' | 'trialing';
          current_period_end?: string | null;
          grace_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          plan?: 'free' | 'pro';
          status?: 'active' | 'canceled' | 'past_due' | 'trialing';
          current_period_end?: string | null;
          grace_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // ----------------------------------------------------------
      // subjects
      // ----------------------------------------------------------
      subjects: {
        Row: {
          id: string;
          name: string;
          category: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          description?: string | null;
          created_at?: string;
        };
      };

      // ----------------------------------------------------------
      // tasks
      // ----------------------------------------------------------
      tasks: {
        Row: {
          id: string;
          subject_id: string | null;
          name: string;
          description: string | null;
          difficulty: 'easy' | 'medium' | 'hard' | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          subject_id?: string | null;
          name: string;
          description?: string | null;
          difficulty?: 'easy' | 'medium' | 'hard' | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          subject_id?: string | null;
          name?: string;
          description?: string | null;
          difficulty?: 'easy' | 'medium' | 'hard' | null;
          created_at?: string;
        };
      };

      // ----------------------------------------------------------
      // study_sessions
      // ----------------------------------------------------------
      study_sessions: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          subject_id: string | null;
          duration_minutes: number;
          status: 'active' | 'completed' | 'archived';
          task_ids: string[];
          notes: string | null;
          version: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          subject_id?: string | null;
          duration_minutes: number;
          status?: 'active' | 'completed' | 'archived';
          task_ids?: string[];
          notes?: string | null;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          subject_id?: string | null;
          duration_minutes?: number;
          status?: 'active' | 'completed' | 'archived';
          task_ids?: string[];
          notes?: string | null;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
      };

      // ----------------------------------------------------------
      // study_logs
      // ----------------------------------------------------------
      study_logs: {
        Row: {
          id: string;
          user_id: string;
          session_id: string | null;
          subject_id: string | null;
          duration_minutes: number;
          tasks_completed: string[];
          notes: string | null;
          logged_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_id?: string | null;
          subject_id?: string | null;
          duration_minutes: number;
          tasks_completed?: string[];
          notes?: string | null;
          logged_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_id?: string | null;
          subject_id?: string | null;
          duration_minutes?: number;
          tasks_completed?: string[];
          notes?: string | null;
          logged_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };

      // ----------------------------------------------------------
      // follows
      // ----------------------------------------------------------
      follows: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          follower_id?: string;
          following_id?: string;
          created_at?: string;
        };
      };

      // ----------------------------------------------------------
      // likes
      // ----------------------------------------------------------
      likes: {
        Row: {
          id: string;
          user_id: string;
          session_id: string; // FK → study_logs.id
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_id?: string;
          created_at?: string;
        };
      };

      // ----------------------------------------------------------
      // comments
      // ----------------------------------------------------------
      comments: {
        Row: {
          id: string;
          user_id: string;
          session_id: string; // FK → study_logs.id
          content: string;
          is_flagged: boolean;
          appeal_submitted: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_id: string;
          content: string;
          is_flagged?: boolean;
          appeal_submitted?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_id?: string;
          content?: string;
          is_flagged?: boolean;
          appeal_submitted?: boolean;
          created_at?: string;
        };
      };

      // ----------------------------------------------------------
      // ai_usage_tracking
      // ----------------------------------------------------------
      ai_usage_tracking: {
        Row: {
          id: string;
          user_id: string;
          request_type: 'study_plan' | 'study_tips' | 'moderation';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          request_type: 'study_plan' | 'study_tips' | 'moderation';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          request_type?: 'study_plan' | 'study_tips' | 'moderation';
          created_at?: string;
        };
      };

      // ----------------------------------------------------------
      // ai_study_plans
      // ----------------------------------------------------------
      ai_study_plans: {
        Row: {
          id: string;
          user_id: string;
          subjects: string[];
          hours_per_week: number;
          difficulty: 'easy' | 'medium' | 'hard' | null;
          available_days: string[];
          plan_content: Record<string, unknown>;
          is_edited: boolean;
          generated_at: string; // DATE as ISO string YYYY-MM-DD
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subjects: string[];
          hours_per_week: number;
          difficulty?: 'easy' | 'medium' | 'hard' | null;
          available_days: string[];
          plan_content: Record<string, unknown>;
          is_edited?: boolean;
          generated_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subjects?: string[];
          hours_per_week?: number;
          difficulty?: 'easy' | 'medium' | 'hard' | null;
          available_days?: string[];
          plan_content?: Record<string, unknown>;
          is_edited?: boolean;
          generated_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Functions: {
      get_profile_stats: {
        Args: { profile_uuid: string };
        Returns: {
          followers_count: number;
          following_count: number;
          study_hours_total: number;
          tasks_completed_count: number;
        }[];
      };
      get_feed_for_user: {
        Args: {
          requesting_user_id: string;
          page_limit?: number;
          page_offset?: number;
        };
        Returns: {
          id: string;
          user_id: string;
          session_id: string | null;
          subject_id: string | null;
          duration_minutes: number;
          tasks_completed: string[];
          notes: string | null;
          logged_at: string;
          created_at: string;
          updated_at: string;
          profile_username: string;
          profile_display_name: string;
          profile_avatar_url: string | null;
          subject_name: string | null;
          subject_category: string | null;
          likes_count: number;
          comments_count: number;
          is_liked_by_me: boolean;
        }[];
      };
      get_active_session_count: {
        Args: { user_uuid: string };
        Returns: number;
      };
      get_ai_usage_count: {
        Args: { user_uuid: string; hours_back?: number };
        Returns: number;
      };
      get_ai_plans_today: {
        Args: { user_uuid: string };
        Returns: number;
      };
      is_pro_user: {
        Args: { user_uuid: string };
        Returns: boolean;
      };
    };
    Enums: {};
  };
}

// ============================================================
// Convenience Row type aliases
// ============================================================

export type Profile        = Database['public']['Tables']['profiles']['Row'];
export type Subscription   = Database['public']['Tables']['subscriptions']['Row'];
export type Subject        = Database['public']['Tables']['subjects']['Row'];
export type Task           = Database['public']['Tables']['tasks']['Row'];
export type StudySession   = Database['public']['Tables']['study_sessions']['Row'];
export type StudyLog       = Database['public']['Tables']['study_logs']['Row'];
export type Follow         = Database['public']['Tables']['follows']['Row'];
export type Like           = Database['public']['Tables']['likes']['Row'];
export type Comment        = Database['public']['Tables']['comments']['Row'];
export type AIUsageTracking = Database['public']['Tables']['ai_usage_tracking']['Row'];
export type AIStudyPlan    = Database['public']['Tables']['ai_study_plans']['Row'];

// ============================================================
// Insert / Update type aliases
// ============================================================

export type ProfileInsert        = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate        = Database['public']['Tables']['profiles']['Update'];
export type SubscriptionInsert   = Database['public']['Tables']['subscriptions']['Insert'];
export type SubscriptionUpdate   = Database['public']['Tables']['subscriptions']['Update'];
export type SubjectInsert        = Database['public']['Tables']['subjects']['Insert'];
export type TaskInsert           = Database['public']['Tables']['tasks']['Insert'];
export type StudySessionInsert   = Database['public']['Tables']['study_sessions']['Insert'];
export type StudySessionUpdate   = Database['public']['Tables']['study_sessions']['Update'];
export type StudyLogInsert       = Database['public']['Tables']['study_logs']['Insert'];
export type StudyLogUpdate       = Database['public']['Tables']['study_logs']['Update'];
export type FollowInsert         = Database['public']['Tables']['follows']['Insert'];
export type LikeInsert           = Database['public']['Tables']['likes']['Insert'];
export type CommentInsert        = Database['public']['Tables']['comments']['Insert'];
export type AIStudyPlanInsert    = Database['public']['Tables']['ai_study_plans']['Insert'];
export type AIStudyPlanUpdate    = Database['public']['Tables']['ai_study_plans']['Update'];

// ============================================================
// Enum-style type aliases
// ============================================================

export type SubscriptionPlan   = 'free' | 'pro';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';
export type SessionStatus      = 'active' | 'completed' | 'archived';
export type Difficulty         = 'easy' | 'medium' | 'hard';
export type AIRequestType      = 'study_plan' | 'study_tips' | 'moderation';

// ============================================================
// Composite / joined types used in the application
// ============================================================

/** Profile enriched with aggregated stats */
export type ProfileWithStats = Profile & {
  followers_count: number;
  following_count: number;
  study_hours_total: number;
  tasks_completed_count: number;
};

/** Study log enriched with author profile, subject info, and social counts */
export type StudyLogWithProfile = StudyLog & {
  profile: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url'>;
  subject: Pick<Subject, 'id' | 'name' | 'category'> | null;
  likes_count: number;
  comments_count: number;
  is_liked_by_me: boolean;
};

/** Study session enriched with its associated subject */
export type StudySessionWithSubject = StudySession & {
  subject: Pick<Subject, 'id' | 'name' | 'category'> | null;
};

/** Comment enriched with the commenter's profile */
export type CommentWithProfile = Comment & {
  profile: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url'>;
};

/** Feed item returned by get_feed_for_user RPC */
export type FeedItem = {
  id: string;
  user_id: string;
  session_id: string | null;
  subject_id: string | null;
  duration_minutes: number;
  tasks_completed: string[];
  notes: string | null;
  logged_at: string;
  created_at: string;
  updated_at: string;
  profile_username: string;
  profile_display_name: string;
  profile_avatar_url: string | null;
  subject_name: string | null;
  subject_category: string | null;
  likes_count: number;
  comments_count: number;
  is_liked_by_me: boolean;
};
