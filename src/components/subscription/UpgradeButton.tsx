'use client';

import { useState } from 'react';
import { Crown } from 'lucide-react';

interface UpgradeButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export default function UpgradeButton({ className = '', children }: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      alert(`Error: ${message}`);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className={`
        flex items-center justify-center gap-2
        bg-primary-600 hover:bg-primary-700 active:bg-primary-800
        text-white font-semibold py-2.5 px-5 rounded-lg
        transition-colors duration-150
        disabled:opacity-60 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
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
          Upgrading...
        </>
      ) : (
        <>
          <Crown className="w-4 h-4" />
          {children ?? 'Upgrade to Pro'}
        </>
      )}
    </button>
  );
}
