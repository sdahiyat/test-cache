import { createServerClient } from '@/lib/supabase';
import type {
  StudyLog,
  CreateStudyLogInput,
  ProgressStats,
} from '@/types/study-log';

export async function getStudyLogs(userId: string): Promise<StudyLog[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('study_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    console.error('Error fetching study logs:', error);
    return [];
  }

  return data as StudyLog[];
}

export async function getStudyLogCount(userId: string): Promise<number> {
  const supabase = createServerClient();
  const { count, error } = await supabase
    .from('study_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching study log count:', error);
    return 0;
  }

  return count ?? 0;
}

export async function createStudyLog(
  userId: string,
  input: CreateStudyLogInput
): Promise<{ data: StudyLog | null; error: string | null }> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('study_logs')
    .insert({
      user_id: userId,
      subject: input.subject,
      tasks_completed: input.tasks_completed,
      duration_minutes: input.duration_minutes,
      notes: input.notes ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating study log:', error);
    return { data: null, error: error.message };
  }

  return { data: data as StudyLog, error: null };
}

export async function updateStudyLog(
  id: string,
  userId: string,
  input: Partial<CreateStudyLogInput>
): Promise<{ data: StudyLog | null; error: string | null }> {
  const supabase = createServerClient();

  const updateData: Record<string, unknown> = {};
  if (input.subject !== undefined) updateData.subject = input.subject;
  if (input.tasks_completed !== undefined)
    updateData.tasks_completed = input.tasks_completed;
  if (input.duration_minutes !== undefined)
    updateData.duration_minutes = input.duration_minutes;
  if (input.notes !== undefined) updateData.notes = input.notes || null;

  const { data, error } = await supabase
    .from('study_logs')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating study log:', error);
    return { data: null, error: error.message };
  }

  return { data: data as StudyLog, error: null };
}

export async function deleteStudyLog(
  id: string,
  userId: string
): Promise<{ error: string | null }> {
  const supabase = createServerClient();
  const { error } = await supabase
    .from('study_logs')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting study log:', error);
    return { error: error.message };
  }

  return { error: null };
}

export async function getProgressStats(userId: string): Promise<ProgressStats> {
  const supabase = createServerClient();

  // Query 1: last 30 days daily sum of duration_minutes
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const { data: dailyData, error: dailyError } = await supabase
    .from('study_logs')
    .select('created_at, duration_minutes')
    .eq('user_id', userId)
    .gte('created_at', thirtyDaysAgo.toISOString());

  if (dailyError) {
    console.error('Error fetching daily stats:', dailyError);
  }

  // Query 2: all-time sum of duration_minutes grouped by subject
  const { data: subjectData, error: subjectError } = await supabase
    .from('study_logs')
    .select('subject, duration_minutes')
    .eq('user_id', userId);

  if (subjectError) {
    console.error('Error fetching subject stats:', subjectError);
  }

  // Query 3: sum of tasks_completed grouped by subject
  const { data: taskData, error: taskError } = await supabase
    .from('study_logs')
    .select('subject, tasks_completed')
    .eq('user_id', userId);

  if (taskError) {
    console.error('Error fetching task stats:', taskError);
  }

  // Process daily hours
  const dailyMap: Record<string, number> = {};
  for (const row of dailyData ?? []) {
    const date = new Date(row.created_at).toLocaleDateString('en-CA'); // YYYY-MM-DD
    dailyMap[date] = (dailyMap[date] ?? 0) + row.duration_minutes;
  }

  // Generate last 30 days array
  const dailyHours: { date: string; hours: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-CA');
    dailyHours.push({
      date: dateStr,
      hours: Math.round(((dailyMap[dateStr] ?? 0) / 60) * 100) / 100,
    });
  }

  // Process subject breakdown
  const subjectMinuteMap: Record<string, number> = {};
  for (const row of subjectData ?? []) {
    subjectMinuteMap[row.subject] =
      (subjectMinuteMap[row.subject] ?? 0) + row.duration_minutes;
  }

  const totalMinutes = Object.values(subjectMinuteMap).reduce(
    (a, b) => a + b,
    0
  );

  const subjectBreakdown = Object.entries(subjectMinuteMap)
    .map(([subject, minutes]) => ({
      subject,
      minutes,
      percentage: totalMinutes > 0 ? (minutes / totalMinutes) * 100 : 0,
    }))
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 10);

  // Process task completion rate
  const taskMap: Record<string, number> = {};
  for (const row of taskData ?? []) {
    taskMap[row.subject] = (taskMap[row.subject] ?? 0) + row.tasks_completed;
  }

  const taskCompletionRate = Object.entries(taskMap)
    .map(([subject, total_tasks]) => ({ subject, total_tasks }))
    .sort((a, b) => b.total_tasks - a.total_tasks);

  const totalTasks = Object.values(taskMap).reduce((a, b) => a + b, 0);

  // Total log count
  const { count } = await supabase
    .from('study_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  return {
    dailyHours,
    subjectBreakdown,
    taskCompletionRate,
    totalMinutes,
    totalTasks,
    totalEntries: count ?? 0,
  };
}
