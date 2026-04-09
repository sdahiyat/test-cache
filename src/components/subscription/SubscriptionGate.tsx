import Link from 'next/link';
import { Lock } from 'lucide-react';

interface SubscriptionGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  isPro: boolean;
}

export default function SubscriptionGate({ children, fallback, isPro }: SubscriptionGateProps) {
  if (isPro) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 border border-gray-200 rounded-xl text-center">
      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
        <Lock className="w-6 h-6 text-primary-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Pro Feature</h3>
      <p className="text-gray-600 mb-4 max-w-sm">
        This feature is available on the Pro plan. Upgrade to unlock unlimited sessions and
        full AI-powered features.
      </p>
      <Link
        href="/upgrade"
        className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-5 rounded-lg transition-colors duration-150"
      >
        Upgrade to Pro
      </Link>
    </div>
  );
}
