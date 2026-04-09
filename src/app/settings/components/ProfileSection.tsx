'use client';

import { useState, useRef } from 'react';
import { User, Camera, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';
import type { ProfileData } from '@/types/settings';
import Link from 'next/link';

interface ProfileSectionProps {
  profile: ProfileData;
}

function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

const STUDY_FOCUS_LABELS: Record<string, string> = {
  stem: 'STEM',
  humanities: 'Humanities',
  business: 'Business',
  arts: 'Arts',
  law: 'Law',
  medicine: 'Medicine',
  other: 'Other',
};

export default function ProfileSection({ profile }: ProfileSectionProps) {
  const [displayName, setDisplayName] = useState(profile.display_name || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '');
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar_url || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canChangeUsername = () => {
    if (!profile.username_updated_at) return true;
    const lastChanged = new Date(profile.username_updated_at);
    const daysSince = (Date.now() - lastChanged.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince >= 30;
  };

  const daysUntilUsernameChange = () => {
    if (!profile.username_updated_at) return 0;
    const lastChanged = new Date(profile.username_updated_at);
    const daysSince = (Date.now() - lastChanged.getTime()) / (1000 * 60 * 60 * 24);
    return Math.ceil(30 - daysSince);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const res = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to upload avatar');
        setAvatarPreview(avatarUrl);
        return;
      }
      const data = await res.json();
      setAvatarUrl(data.avatar_url || '');
    } catch {
      setError('Failed to upload avatar');
      setAvatarPreview(avatarUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (bio.length > 300) {
      setError('Bio must be 300 characters or less');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: displayName,
          bio: bio || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to update profile');
        return;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const initials = (profile.display_name || profile.username || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-5">
            <div className="relative">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary-100 border-2 border-gray-200 flex items-center justify-center">
                  <span className="text-primary-700 font-semibold text-lg">{initials}</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 p-1.5 bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-50 transition-colors"
                title="Change avatar"
              >
                <Camera className="w-3.5 h-3.5 text-gray-600" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Profile Photo</p>
              <p className="text-xs text-gray-500 mt-0.5">JPEG, PNG, WebP or GIF. Max 2MB.</p>
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Your display name"
              maxLength={50}
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Username
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                @{profile.username || 'not set'}
              </div>
              {profile.username && (
                <Link
                  href={`/user/${profile.username}`}
                  className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium whitespace-nowrap"
                  target="_blank"
                >
                  View profile
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
            {!canChangeUsername() ? (
              <p className="mt-1.5 text-xs text-amber-600">
                You can change your username in {daysUntilUsernameChange()} day(s). Usernames can only be changed every 30 days.
              </p>
            ) : (
              <p className="mt-1.5 text-xs text-gray-500">
                Username can be changed every 30 days. To change your username, go to the{' '}
                <Link href="/user/edit" className="text-primary-600 hover:underline">
                  profile editor
                </Link>
                .
              </p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className={cn(
                'w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none',
                bio.length > 300 ? 'border-red-400' : 'border-gray-300'
              )}
              placeholder="Tell others about yourself..."
              maxLength={310}
            />
            <div className="flex justify-between items-center mt-1">
              <span
                className={cn(
                  'text-xs',
                  bio.length > 300 ? 'text-red-500' : bio.length > 270 ? 'text-amber-500' : 'text-gray-400'
                )}
              >
                {bio.length}/300 characters
              </span>
            </div>
          </div>

          {/* Study Focus (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Study Focus
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
              {profile.study_focus
                ? STUDY_FOCUS_LABELS[profile.study_focus] || profile.study_focus
                : 'Not set'}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Change your study focus in{' '}
              <button
                type="button"
                className="text-primary-600 hover:underline"
                onClick={() => {
                  // Signal to parent to switch to preferences tab
                  const event = new CustomEvent('switchTab', { detail: 'preferences' });
                  window.dispatchEvent(event);
                }}
              >
                Preferences
              </button>
              .
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
              Profile updated successfully!
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading || bio.length > 300}
              className="px-5 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
