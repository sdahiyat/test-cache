import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase';
import { getUserSubscription } from '@/lib/subscription';
import UpgradeButton from '@/components/subscription/UpgradeButton';
import ManageBillingButton from '@/components/subscription/ManageBillingButton';
import { CheckCircle, XCircle, Crown, Zap, BookOpen, Lightbulb, HeadphonesIcon } from 'lucide-react';

interface UpgradePageProps {
  searchParams: { success?: string; canceled?: string };
}

export default async function UpgradePage({ searchParams }: UpgradePageProps) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const subscription = await getUserSubscription(user.id);
  const isSuccess = searchParams.success === 'true';
  const isCanceled = searchParams.canceled === 'true';

  const proFeatures = [
    {
      icon: <Zap className="w-5 h-5 text-primary-500" />,
      title: 'Unlimited Study Sessions',
      description: 'Create as many study sessions as you need',
    },
    {
      icon: <BookOpen className="w-5 h-5 text-primary-500" />,
      title: 'AI Study Plan Generator',
      description: 'Get personalized weekly study plans powered by AI',
    },
    {
      icon: <Lightbulb className="w-5 h-5 text-primary-500" />,
      title: 'AI Study Tips & Suggestions',
      description: 'Receive subject-specific learning tips and strategies',
    },
    {
      icon: <HeadphonesIcon className="w-5 h-5 text-primary-500" />,
      title: 'Priority Support',
      description: 'Get faster responses from our support team',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Banner */}
        {isSuccess && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-800">You are now a Pro member!</p>
              <p className="text-green-700 text-sm">
                Your subscription is active. Enjoy unlimited sessions and full AI features.
              </p>
            </div>
          </div>
        )}

        {/* Canceled Banner */}
        {isCanceled && !isSuccess && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
            <XCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-blue-800">Checkout canceled</p>
              <p className="text-blue-700 text-sm">
                No charge was made. You can upgrade anytime.
              </p>
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Crown className="w-8 h-8 text-yellow-500" />
            <h1 className="text-3xl font-bold text-gray-900">StudySync Pro</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Unlock unlimited study sessions and full AI-powered features
          </p>
        </div>

        {/* Current Plan Status (for Pro users) */}
        {subscription.isPro && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  <h2 className="font-semibold text-gray-900">
                    {subscription.status === 'grace'
                      ? 'Pro (Grace Period)'
                      : 'Pro Plan — Active'}
                  </h2>
                </div>
                {subscription.status === 'grace' && subscription.gracePeriodEnd && (
                  <p className="text-sm text-yellow-700">
                    Your payment failed. Access continues until{' '}
                    {new Date(subscription.gracePeriodEnd).toLocaleDateString()}.
                    Please update your payment method.
                  </p>
                )}
                {subscription.currentPeriodEnd && subscription.status !== 'grace' && (
                  <p className="text-sm text-gray-600">
                    {subscription.cancelAtPeriodEnd
                      ? `Access until ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                      : `Renews on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`}
                  </p>
                )}
              </div>
              <ManageBillingButton />
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Free Tier Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Free Plan</h2>
            <p className="text-3xl font-bold text-gray-900 mb-4">
              $0<span className="text-base font-normal text-gray-500">/month</span>
            </p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2 text-gray-600">
                <CheckCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>5 active study sessions</span>
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <CheckCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>Basic study tracking</span>
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <CheckCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>Activity feed & social features</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <XCircle className="w-4 h-4 flex-shrink-0" />
                <span>AI Study Plan Generator</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <XCircle className="w-4 h-4 flex-shrink-0" />
                <span>AI Study Tips</span>
              </li>
            </ul>
            {!subscription.isPro && (
              <div className="w-full py-2 px-4 rounded-lg border border-gray-300 text-center text-gray-500 text-sm font-medium">
                Current Plan
              </div>
            )}
          </div>

          {/* Pro Tier Card */}
          <div className="bg-white border-2 border-primary-500 rounded-xl p-6 relative shadow-md">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-primary-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                RECOMMENDED
              </span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Pro Plan</h2>
            <p className="text-3xl font-bold text-gray-900 mb-4">
              $10<span className="text-base font-normal text-gray-500">/month</span>
            </p>
            <ul className="space-y-3 mb-6">
              {proFeatures.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0" />
                  <span>{feature.title}</span>
                </li>
              ))}
            </ul>

            {subscription.isPro ? (
              <div className="w-full py-2 px-4 rounded-lg bg-primary-50 border border-primary-300 text-center text-primary-700 text-sm font-medium">
                ✓ Current Plan
              </div>
            ) : (
              <UpgradeButton className="w-full" />
            )}
          </div>
        </div>

        {/* Pro Features Detail */}
        {!subscription.isPro && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              Everything in Pro
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {proFeatures.map((feature, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">{feature.icon}</div>
                  <div>
                    <h3 className="font-medium text-gray-900">{feature.title}</h3>
                    <p className="text-sm text-gray-600 mt-0.5">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-center text-gray-500 text-sm mt-8">
          Cancel anytime. No hidden fees. Secure payment via Stripe.
        </p>
      </div>
    </div>
  );
}
