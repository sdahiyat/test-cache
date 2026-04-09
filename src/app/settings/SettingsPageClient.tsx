'use client';

import { useState } from 'react';
import { User, CreditCard, Settings, Trash2 } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { ProfileData, SubscriptionData, SettingsTab } from '@/types/settings';
import ProfileSection from './components/ProfileSection';
import SubscriptionSection from './components/SubscriptionSection';
import PreferencesSection from './components/PreferencesSection';
import AccountSection from './components/AccountSection';

function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

interface SettingsPageClientProps {
  profile: ProfileData;
  subscription: SubscriptionData | null;
  user: SupabaseUser;
}

const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
  { id: 'subscription', label: 'Subscription', icon: <CreditCard className="w-4 h-4" /> },
  { id: 'preferences', label: 'Preferences', icon: <Settings className="w-4 h-4" /> },
  { id: 'account', label: 'Account', icon: <Trash2 className="w-4 h-4" /> },
];

export default function SettingsPageClient({
  profile,
  subscription,
  user,
}: SettingsPageClientProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your account and preferences</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar nav — desktop */}
          <nav className="hidden md:flex flex-col w-56 flex-shrink-0 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-left',
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Horizontal tab bar — mobile */}
          <div className="md:hidden flex overflow-x-auto gap-1 pb-1 -mx-4 px-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0',
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 bg-white border border-gray-200 hover:bg-gray-50'
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {activeTab === 'profile' && <ProfileSection profile={profile} />}
            {activeTab === 'subscription' && (
              <SubscriptionSection subscription={subscription} userId={user.id} />
            )}
            {activeTab === 'preferences' && (
              <PreferencesSection profile={profile} />
            )}
            {activeTab === 'account' && (
              <AccountSection
                username={profile.username}
                userEmail={user.email || ''}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
