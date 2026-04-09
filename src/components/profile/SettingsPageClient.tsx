'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Profile } from '@/types/database'
import AvatarUpload from './AvatarUpload'
import ProfileEditForm from './ProfileEditForm'

interface SettingsPageClientProps {
  profile: Profile
  initialTab?: 'profile' | 'account'
}

type Tab = 'profile' | 'account'

export default function SettingsPageClient({
  profile: initialProfile,
  initialTab = 'profile',
}: SettingsPageClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab)
  const [profile, setProfile] = useState<Profile>(initialProfile)

  function handleAvatarChange(url: string | null) {
    setProfile((prev) => ({ ...prev, avatar_url: url }))
  }

  function handleProfileSuccess(updatedProfile: Profile) {
    setProfile(updatedProfile)
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'account', label: 'Account' },
  ]

  return (
    <div className="max-w-2xl mx-auto">
      {/* Tab navigation */}
      <nav
        className="flex gap-1 mb-8 border-b border-gray-200"
        aria-label="Settings navigation"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              activeTab === tab.id
                ? 'text-primary border-b-2 border-primary -mb-px'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            )}
            aria-selected={activeTab === tab.id}
            role="tab"
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Profile tab */}
      {activeTab === 'profile' && (
        <div
          role="tabpanel"
          aria-label="Profile settings"
          className="space-y-8"
        >
          {/* Avatar section */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-6">
              Profile Photo
            </h2>
            <AvatarUpload
              currentAvatarUrl={profile.avatar_url}
              displayName={profile.display_name}
              onAvatarChange={handleAvatarChange}
            />
          </section>

          {/* Profile edit form section */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-6">
              Profile Information
            </h2>
            <ProfileEditForm
              profile={profile}
              onSuccess={handleProfileSuccess}
            />
          </section>
        </div>
      )}

      {/* Account tab */}
      {activeTab === 'account' && (
        <div
          role="tabpanel"
          aria-label="Account settings"
        >
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Account Settings
            </h2>
            <p className="text-gray-500 text-sm">
              Account management features are coming soon.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
