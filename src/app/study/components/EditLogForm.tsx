'use client';

import { useState } from 'react';
import type { StudyLog, StudyLogFormErrors } from '@/types/study-log';
import { updateStudyLogAction } from '../actions';

interface EditLogFormProps {
  log: StudyLog;
  onSuccess: (updated: StudyLog) => void;
  onCancel: () => void;
}

export function EditLogForm({ log, onSuccess, onCancel }: EditLogFormProps) {
  const [subject, setSubject] = useState(log.subject);
  const [durationMinutes, setDurationMinutes] = useState(
    String(log.duration_minutes)
  );
  const [tasksCompleted, setTasksCompleted] = useState(
    String(log.tasks_completed)
  );
  const [notes, setNotes] = useState(log.notes ?? '');
  const [errors, setErrors] = useState<StudyLogFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): boolean {
    const newErrors: StudyLogFormErrors = {};
    if (!subject.trim()) newErrors.subject = 'Subject is required.';
    else if (subject.trim().length > 100)
      newErrors.subject = 'Subject must be 100 characters or fewer.';

    const dur = parseInt(durationMinutes, 10);
    if (!durationMinutes) newErrors.duration_minutes = 'Duration is required.';
    else if (isNaN(dur) || dur < 1 || dur > 1440)
      newErrors.duration_minutes =
        'Duration must be between 1 and 1440 minutes.';

    const tasks = parseInt(tasksCompleted, 10);
    if (tasksCompleted === '')
      newErrors.tasks_completed = 'Tasks completed is required.';
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
    formData.set('id', log.id);
    formData.set('subject', subject.trim());
    formData.set('duration_minutes', durationMinutes);
    formData.set('tasks_completed', tasksCompleted);
    formData.set('notes', notes);

    try {
      const result = await updateStudyLogAction(formData);

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
    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
      <h3 className="text-base font-semibold text-gray-900 mb-4">
        Edit Entry
      </h3>

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
              htmlFor={`edit-subject-${log.id}`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              id={`edit-subject-${log.id}`}
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={100}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500 ${
                errors.subject
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300'
              }`}
              aria-describedby={
                errors.subject ? `edit-subject-error-${log.id}` : undefined
              }
              aria-invalid={!!errors.subject}
            />
            {errors.subject && (
              <p
                id={`edit-subject-error-${log.id}`}
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
              htmlFor={`edit-duration-${log.id}`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Duration (minutes) <span className="text-red-500">*</span>
            </label>
            <input
              id={`edit-duration-${log.id}`}
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              min={1}
              max={1440}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500 ${
                errors.duration_minutes
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300'
              }`}
              aria-describedby={
                errors.duration_minutes
                  ? `edit-duration-error-${log.id}`
                  : undefined
              }
              aria-invalid={!!errors.duration_minutes}
            />
            {errors.duration_minutes && (
              <p
                id={`edit-duration-error-${log.id}`}
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
              htmlFor={`edit-tasks-${log.id}`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tasks Completed <span className="text-red-500">*</span>
            </label>
            <input
              id={`edit-tasks-${log.id}`}
              type="number"
              value={tasksCompleted}
              onChange={(e) => setTasksCompleted(e.target.value)}
              min={0}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500 ${
                errors.tasks_completed
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300'
              }`}
              aria-describedby={
                errors.tasks_completed
                  ? `edit-tasks-error-${log.id}`
                  : undefined
              }
              aria-invalid={!!errors.tasks_completed}
            />
            {errors.tasks_completed && (
              <p
                id={`edit-tasks-error-${log.id}`}
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
              htmlFor={`edit-notes-${log.id}`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Notes{' '}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              id={`edit-notes-${log.id}`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={1000}
              rows={3}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500 resize-none ${
                errors.notes
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300'
              }`}
              aria-describedby={
                errors.notes ? `edit-notes-error-${log.id}` : undefined
              }
              aria-invalid={!!errors.notes}
            />
            <div className="flex justify-between mt-1">
              {errors.notes ? (
                <p
                  id={`edit-notes-error-${log.id}`}
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

        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-indigo-200">
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
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
