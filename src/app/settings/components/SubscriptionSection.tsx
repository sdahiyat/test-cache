'use client';

import { useState } from 'react';
import { CreditCard, CheckCircle, AlertTriangle, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { SubscriptionData } from '@/types/settings';

interface SubscriptionSectionProps {
  subscription: SubscriptionData | null;
  userId: string;
}

function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function SubscriptionSection({
  subscription,
  userId,
}: SubscriptionSectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localSub, setLocalSub] = useState(subscription);

  const isPro = localSub?.plan === 'pro';
  const isPastDue = localSub?.status === 'past_due';
  const isCanceling = localSub?.cancel_at_period_end === true;

  const handlePortal = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to open billing portal');
        return;
      }
      const { url } = await res.json();
      window.location.href = url;
    } catch {
      setError('Failed to open billing portal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will retain Pro access until the end of your billing period.')) {
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch('/api/stripe/cancel-subscription', { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to cancel subscription');
        return;
      }
      const data = await res.json();
      setLocalSub((prev) =>
        prev
          ? {
              ...prev,
              cancel_at_period_end: true,
              current_period_end: data.current_period_end || prev.current_period_end,
            }
          : prev
      );
    } catch {
      setError('Failed to cancel subscription. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReactivate = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch('/api/stripe/reactivate-subscription', { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to reactivate subscription');
        return;
      }
      setLocalSub((prev) =>
        prev ? { ...prev, cancel_at_period_end: false } : prev
      );
    } catch {
      setError('Failed to reactivate subscription. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Past due warning */}
      {isPastDue && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Payment Required</p>
            <p className="text-sm text-amber-700 mt-0.5">
              Your last payment failed. You have a 7-day grace period to update your payment method before losing Pro access.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Subscription</h2>
          <div
            className={cn(
              'flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium',
              isPro
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
            )}
          >
            {isPro ? (
              <>
                <Zap className="w-3.5 h-3.5" />
                Pro Plan
              </>
            ) : (
              <>
                <CreditCard className="w-3.5 h-3.5" />
                Free Plan
              </>
            )}
          </div>
        </div>

        {!isPro ? (
          /* Free plan view */
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">What's included in your plan</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg border border-gray-200 p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Free</p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      Up to 5 active study sessions
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      Basic study logging
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      Up to 500 log entries
                    </li>
                    <li className="flex items-center gap-2 text-gray-400">
                      <span className="w-4 h-4 flex-shrink-0 text-center">✕</span>
                      Limited AI features
                    </li>
                  </ul>
                </div>
                <div className="rounded-lg border-2 border-primary-200 bg-primary-50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm font-semibold text-primary-900">Pro</p>
                    <span className="text-xs bg-primary-600 text-white px-2 py-0.5 rounded-full">$10/mo</span>
                  </div>
                  <ul className="space-y-2 text-sm text-primary-800">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0" />
                      Unlimited study sessions
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0" />
                      Unlimited study logs
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0" />
                      Full AI study plan generator
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0" />
                      AI study tips &amp; suggestions
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <Link
              href="/upgrade"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Zap className="w-4 h-4" />
              Upgrade to Pro
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* Pro plan view */
          <div className="space-y-5">
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500">Status</span>
                <span
                  className={cn(
                    'font-medium',
                    isPastDue ? 'text-amber-600' : isCanceling ? 'text-orange-600' : 'text-green-600'
                  )}
                >
                  {isPastDue ? 'Payment Failed' : isCanceling ? 'Cancels at period end' : 'Active'}
                </span>
              </div>

              {localSub?.current_period_end && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">
                    {isCanceling ? 'Access ends on' : 'Next billing date'}
                  </span>
                  <span className="font-medium text-gray-900">
                    {formatDate(localSub.current_period_end)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500">Plan</span>
                <span className="font-medium text-gray-900">Pro — $10/month</span>
              </div>
            </div>

            {isCanceling && (
              <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-lg px-4 py-3">
                <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-orange-700">
                  Your subscription will be canceled on{' '}
                  <strong>{formatDate(localSub?.current_period_end || null)}</strong>. You can reactivate anytime before then.
                </p>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              {localSub?.stripe_customer_id ? (
                <button
                  onClick={handlePortal}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <CreditCard className="w-4 h-4" />
                  Manage Payment Method
                </button>
              ) : (
                <p className="text-sm text-gray-500 italic">No payment method on file.</p>
              )}

              {isCanceling ? (
                <button
                  onClick={handleReactivate}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Processing...' : 'Reactivate Subscription'}
                </button>
              ) : (
                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Processing...' : 'Cancel Subscription'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
