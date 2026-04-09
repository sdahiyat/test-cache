'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/supabase';
import {
  createStudyLog,
  updateStudyLog,
  deleteStudyLog,
  getStudyLogCount,
} from '@/lib/study-logs';
import type { StudyLog } from '@/types/study-log';

const FREE_TIER_LIMIT = 500;

async function getCurrentUser() {
  const supabase = createServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

async function getSubscriptionTier(userId: string): Promise<string> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .single();
  return data?.subscription_tier ?? 'free';
}

function validateSubject(value: string | null): string | null {
  if (!value || value.trim().length === 0) return 'Subject is required.';
  if (value.trim().length > 100)
    return 'Subject must be 100 characters or fewer.';
  return null;
}

function validateDuration(value: string | null): string | null {
  if (value === null || value === '') return 'Duration is required.';
  const num = parseInt(value, 10);
  if (isNaN(num) || !Number.isInteger(num))
    return 'Duration must be a whole number.';
  if (num < 1 || num > 1440)
    return 'Duration must be between 1 and 1440 minutes.';
  return null;
}

function validateTasksCompleted(value: string | null): string | null {
  if (value === null || value === '') return 'Tasks completed is required.';
  const num = parseInt(value, 10);
  if (isNaN(num) || !Number.isInteger(num))
    return 'Tasks completed must be a whole number.';
  if (num < 0) return 'Tasks completed cannot be negative.';
  return null;
}

function validateNotes(value: string | null): string | null {
  if (value && value.length > 1000)
    return 'Notes must be 1000 characters or fewer.';
  return null;
}

export async function createStudyLogAction(formData: FormData): Promise<{
  data: StudyLog | null;
  error: string | null;
  fieldErrors?: Record<string, string>;
}> {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: 'Not authenticated.' };

  const subject = formData.get('subject') as string | null;
  const duration_minutes = formData.get('duration_minutes') as string | null;
  const tasks_completed = formData.get('tasks_completed') as string | null;
  const notes = formData.get('notes') as string | null;

  const fieldErrors: Record<string, string> = {};
  const subjectErr = validateSubject(subject);
  if (subjectErr) fieldErrors.subject = subjectErr;
  const durationErr = validateDuration(duration_minutes);
  if (durationErr) fieldErrors.duration_minutes = durationErr;
  const tasksErr = validateTasksCompleted(tasks_completed);
  if (tasksErr) fieldErrors.tasks_completed = tasksErr;
  const notesErr = validateNotes(notes);
  if (notesErr) fieldErrors.notes = notesErr;

  if (Object.keys(fieldErrors).length > 0) {
    return { data: null, error: 'Validation failed.', fieldErrors };
  }

  // Check free tier cap
  const tier = await getSubscriptionTier(user.id);
  if (tier === 'free') {
    const count = await getStudyLogCount(user.id);
    if (count >= FREE_TIER_LIMIT) {
      return { data: null, error: 'LIMIT_REACHED' };
    }
  }

  const { data, error } = await createStudyLog(user.id, {
    subject: subject!.trim(),
    duration_minutes: parseInt(duration_minutes!, 10),
    tasks_completed: parseInt(tasks_completed!, 10),
    notes: notes?.trim() || undefined,
  });

  if (error) return { data: null, error };

  revalidatePath('/study');
  return { data, error: null };
}

export async function updateStudyLogAction(formData: FormData): Promise<{
  data: StudyLog | null;
  error: string | null;
  fieldErrors?: Record<string, string>;
}> {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: 'Not authenticated.' };

  const id = formData.get('id') as string | null;
  if (!id) return { data: null, error: 'Log ID is required.' };

  const subject = formData.get('subject') as string | null;
  const duration_minutes = formData.get('duration_minutes') as string | null;
  const tasks_completed = formData.get('tasks_completed') as string | null;
  const notes = formData.get('notes') as string | null;

  const fieldErrors: Record<string, string> = {};
  const subjectErr = validateSubject(subject);
  if (subjectErr) fieldErrors.subject = subjectErr;
  const durationErr = validateDuration(duration_minutes);
  if (durationErr) fieldErrors.duration_minutes = durationErr;
  const tasksErr = validateTasksCompleted(tasks_completed);
  if (tasksErr) fieldErrors.tasks_completed = tasksErr;
  const notesErr = validateNotes(notes);
  if (notesErr) fieldErrors.notes = notesErr;

  if (Object.keys(fieldErrors).length > 0) {
    return { data: null, error: 'Validation failed.', fieldErrors };
  }

  const { data, error } = await updateStudyLog(id, user.id, {
    subject: subject!.trim(),
    duration_minutes: parseInt(duration_minutes!, 10),
    tasks_completed: parseInt(tasks_completed!, 10),
    notes: notes?.trim() || undefined,
  });

  if (error) return { data: null, error };

  revalidatePath('/study');
  return { data, error: null };
}

export async function deleteStudyLogAction(
  id: string
): Promise<{ error: string | null }> {
  const user = await getCurrentUser();
  if (!user) return { error: 'Not authenticated.' };

  const { error } = await deleteStudyLog(id, user.id);
  if (error) return { error };

  revalidatePath('/study');
  return { error: null };
}
