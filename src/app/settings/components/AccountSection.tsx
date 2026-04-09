'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, AlertTriangle, LogOut, X } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

interface AccountSectionProps {
  username: string;
  userEmail: string;
}

export default function AccountSection({ username, userEmail }: AccountSectionProps) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== username) return;
    setError(null);
    setIsDeleting(true);

    try {
      const res = await fetch('/api/account/delete', { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to delete account. Please try again.');
        setIsDeleting(false);
        return;
      }
      await supabase.auth.signOut();
      router.push('/');
    } catch {
      setError('Failed to delete account. Please try again.');
      setIsDeleting(false);
    }
  };

  const canConfirmDelete = confirmText === username;

  return (
    <div className="space-y-6">
      {/* Sign out */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Sign Out</h2>
        <p className="text-sm text-gray-500 mb-4">
          Sign out of your account on this device. You can sign back in at any time.
        </p>
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {isSigningOut ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>

      {/* Danger zone */}
      <div className="bg-red-50 rounded-xl border border-red-200 p-6">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-lg font-semibold text-red-900">Danger Zone</h2>
            <p className="text-sm text-red-700 mt-1">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-red-200 p-4 mb-4">
          <h3 className="text-sm font-medium text-gray-900 mb-1">What will be deleted:</h3>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>Your profile and all personal data</li>
            <li>All study sessions and logs</li>
            <li>Comments, likes, and follows</li>
            <li>Subscription data (subscription will be canceled)</li>
          </ul>
        </div>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete Account
        </button>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">Delete Account</h3>
              </div>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setConfirmText('');
                  setError(null);
                }}
                disabled={isDeleting}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-700">
                <strong>This action cannot be undone.</strong> All your study sessions, logs, and
                profile data will be permanently deleted.
              </p>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-xs text-red-700">
                  Account: <strong>{userEmail}</strong>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Type your username{' '}
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-red-700 font-mono text-xs">
                    {username || 'your-username'}
                  </code>{' '}
                  to confirm:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={username || 'your-username'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  autoComplete="off"
                  disabled={isDeleting}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}
            </div>

            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setConfirmText('');
                  setError(null);
                }}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={!canConfirmDelete || isDeleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
