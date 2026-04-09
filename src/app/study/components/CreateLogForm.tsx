'use client';

import { useState } from 'react';
import type { StudyLog, StudyLogFormErrors } from '@/types/study-log';
import { createStudyLogAction } from '../actions';

interface CreateLogFormProps {
  onSuccess: (log: StudyLog) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (v: boolean) => void;
}

export function CreateLogForm({
  onSuccess,
  onCancel,
  isSubmitting,
  setIsSubmitting,
}: CreateLogFormProps) {
  const [subject, setSubject] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [tasksCompleted, setTasksCompleted] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<StudyLogFormErrors>({});

  function validate(): boolean {
    const newErrors: StudyLogFormErrors = {};
    if (!subject.trim()) newErrors.subject = 'Subject is required.';
    else if (subject.trim().length > 100)
      newErrors.subject = 'Subject must be 100 characters or fewer.';

    const dur = parseInt(durationMinutes, 10);
    if (!durationMinutes) newErrors.duration_minutes = 'Duration is required.';
    else if (isNaN(dur) || dur < 1 || dur > 1440)
      newErrors.duration_minutes = 'Duration must be between 1 and 1440 minutes.';

    const tasks = parseInt(tasksCompleted, 10);
    if (tasksCompleted === '') newErrors.tasks_completed = 'Tasks completed is required.';
    else if (isNaN(tasks) || tasks < 0)
      newErrors.tasks_completed = 'Tasks completed must be 0 or more.';

    if (notes.length > 1000)
      newErrors.notes = 'Notes must be 1000 characters or fewer.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    const formData = new FormData();
    formData.set('subject', subject.trim());
    formData.set('duration_minutes', durationMinutes);
    formData.set('tasks_completed', tasksCompleted);
    formData.set('notes', notes);

    try {
      const result = await createStudyLogAction(formData);

      if (result.error === 'LIMIT_REACHED') {
        setErrors({
          general:
            'You have reached the 500 log entry limit. Please upgrade to Pro for unlimited logging.',
        });
        return;
      }

      if (result.error || result.fieldErrors) {
        if (result.fieldErrors) {
          setErrors(result.fieldErrors as StudyLogFormErrors);
        } else {
          setErrors({ general: result.error ?? 'An error occurred.' });
        }
        return;
      }

      if (result.data) {
        onSuccess(result.data);
      }
    } catch {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        New Study Log Entry
      </h2>

      {errors.general && (
        <div
          role="alert"
          className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
        >
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Subject */}
          <div className="sm:col-span-2">
            <label
              htmlFor="create-subject"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              id="create-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={100}
              placeholder="e.g. Mathematics, Physics, History"
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500 ${
                errors.subject
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300'
              }`}
              aria-describedby={errors.subject ? 'create-subject-error' : undefined}
              aria-invalid={!!errors.subject}
            />
            {errors.subject && (
              <p
                id="create-subject-error"
                role="alert"
                className="mt-1 text-xs text-red-600"
              >
                {errors.subject}
              </p>
            )}
          </div>

          {/* Duration */}
          <div>
            <label
              htmlFor="create-duration"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Duration (minutes) <span className="text-red-500">*</span>
            </label>
            <input
              id="create-duration"
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              min={1}
              max={1440}
              placeholder="e.g. 60"
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500 ${
                errors.duration_minutes
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300'
              }`}
              aria-describedby={
                errors.duration_minutes ? 'create-duration-error' : undefined
              }
              aria-invalid={!!errors.duration_minutes}
            />
            {errors.duration_minutes && (
              <p
                id="create-duration-error"
                role="alert"
                className="mt-1 text-xs text-red-600"
              >
                {errors.duration_minutes}
              </p>
            )}
          </div>

          {/* Tasks Completed */}
          <div>
            <label
              htmlFor="create-tasks"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tasks Completed <span className="text-red-500">*</span>
            </label>
            <input
              id="create-tasks"
              type="number"
              value={tasksCompleted}
              onChange={(e) => setTasksCompleted(e.target.value)}
              min={0}
              placeholder="e.g. 5"
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500 ${
                errors.tasks_completed
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300'
              }`}
              aria-describedby={
                errors.tasks_completed ? 'create-tasks-error' : undefined
              }
              aria-invalid={!!errors.tasks_completed}
            />
            {errors.tasks_completed && (
              <p
                id="create-tasks-error"
                role="alert"
                className="mt-1 text-xs text-red-600"
              >
                {errors.tasks_completed}
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="sm:col-span-2">
            <label
              htmlFor="create-notes"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Notes{' '}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="create-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="Any additional notes about this study session..."
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500 resize-none ${
                errors.notes
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300'
              }`}
              aria-describedby={errors.notes ? 'create-notes-error' : undefined}
              aria-invalid={!!errors.notes}
            />
            <div className="flex justify-between mt-1">
              {errors.notes ? (
                <p
                  id="create-notes-error"
                  role="alert"
                  className="text-xs text-red-600"
                >
                  {errors.notes}
                </p>
              ) : (
                <span />
              )}
              <span className="text-xs text-gray-400">{notes.length}/1000</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Saving...
              </span>
            ) : (
              'Save Entry'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
