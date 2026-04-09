export interface StudyLog {
  id: string;
  user_id: string;
  subject: string;
  tasks_completed: number;
  duration_minutes: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateStudyLogInput {
  subject: string;
  tasks_completed: number;
  duration_minutes: number;
  notes?: string;
}

export interface UpdateStudyLogInput extends Partial<CreateStudyLogInput> {
  id: string;
}

export interface StudyLogFormErrors {
  subject?: string;
  tasks_completed?: string;
  duration_minutes?: string;
  notes?: string;
  general?: string;
}

export interface ProgressStats {
  dailyHours: { date: string; hours: number }[];
  subjectBreakdown: { subject: string; minutes: number; percentage: number }[];
  taskCompletionRate: { subject: string; total_tasks: number }[];
  totalMinutes: number;
  totalTasks: number;
  totalEntries: number;
}
