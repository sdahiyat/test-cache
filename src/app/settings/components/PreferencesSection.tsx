'use client';

import { useState } from 'react';
import { Settings, AlertCircle, CheckCircle } from 'lucide-react';
import type { ProfileData } from '@/types/settings';

interface PreferencesSectionProps {
  profile: ProfileData;
}

const STUDY_FOCUS_OPTIONS = [
  { value: 'stem', label: 'STEM' },
  { value: 'humanities', label: 'Humanities' },
  { value: 'business', label: 'Business' },
  { value: 'arts', label: 'Arts' },
  { value: 'law', label: 'Law' },
  { value: 'medicine', label: 'Medicine' },
  { value: 'other', label: 'Other' },
];

const COMMON_TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'America/Honolulu',
  'America/Toronto',
  'America/Vancouver',
  'America/Mexico_City',
  'America/Sao_Paulo',
  'America/Buenos_Aires',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Madrid',
  'Europe/Rome',
  'Europe/Moscow',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Dhaka',
  'Asia/Bangkok',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Asia/Shanghai',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Pacific/Auckland',
  'Africa/Cairo',
  'Africa/Johannesburg',
];

function getTimezoneLabel(tz: string): string {
  try {
    const now = new Date();
    const offset = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'short',
    })
      .formatToParts(now)
      .find((p) => p.type === 'timeZoneName')?.value;
    const city = tz.split('/').pop()?.replace(/_/g, ' ');
    return offset ? `${city} (${offset})` : city || tz;
  } catch {
    return tz;
  }
}

export default function PreferencesSection({ profile }: PreferencesSectionProps) {
  const [studyFocus, setStudyFocus] = useState(profile.study_focus || '');
  const [timezone, setTimezone] = useState(profile.timezone || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      const body: Record<string, string | null> = {
        study_focus: studyFocus || null,
      };
      if (timezone) {
        body.timezone = timezone;
      }

      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to save preferences');
        return;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('Failed to save preferences. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Study Preferences</h2>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Study Focus */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Study Focus
            </label>
            <select
              value={studyFocus}
              onChange={(e) => setStudyFocus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
            >
              <option value="">Select a focus area...</option>
              {STUDY_FOCUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              This helps us personalize your study suggestions and AI recommendations.
            </p>
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
            >
              <option value="">Select your timezone...</option>
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {getTimezoneLabel(tz)}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Used to display study session times in your local timezone.
            </p>
          </div>

          {/* Feedback */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              Preferences saved successfully!
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
