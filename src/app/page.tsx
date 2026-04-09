import Link from 'next/link'
import { BookOpen, Users, Brain, BarChart3, ArrowRight, CheckCircle } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-100 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
          <div className="flex items-center gap-2 font-bold text-gray-900">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg">StudySync</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors px-4 py-2 rounded-lg"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 text-sm font-medium mb-6">
            <Brain className="h-3.5 w-3.5" />
            AI-Powered Study Platform
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Study smarter,{' '}
            <span className="text-primary-600">not harder</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            StudySync helps students organize study sessions, collaborate with peers, and get
            AI-powered learning suggestions — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors text-base shadow-sm"
            >
              Start for free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-base"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need to excel
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Built for students who are serious about their academic success.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: BookOpen,
                title: 'Study Sessions',
                description:
                  'Create structured study sessions with subjects, durations, and specific tasks.',
                color: 'bg-blue-100 text-blue-600',
              },
              {
                icon: Users,
                title: 'Peer Collaboration',
                description:
                  'Follow peers, see their study activity, and motivate each other.',
                color: 'bg-green-100 text-green-600',
              },
              {
                icon: Brain,
                title: 'AI Study Plans',
                description:
                  'Get personalized study plans and learning tips powered by GPT-4.',
                color: 'bg-purple-100 text-purple-600',
              },
              {
                icon: BarChart3,
                title: 'Progress Tracking',
                description:
                  'Visualize your study hours, subjects covered, and task completion.',
                color: 'bg-orange-100 text-orange-600',
              },
            ].map(({ icon: Icon, title, description, color }) => (
              <div
                key={title}
                className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-4`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-gray-600">Start free, upgrade when you need more.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Free tier */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Free</h3>
              <p className="text-gray-500 text-sm mb-4">Perfect for getting started</p>
              <div className="text-3xl font-bold text-gray-900 mb-6">
                $0<span className="text-base font-normal text-gray-400">/mo</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  '5 active study sessions',
                  'Basic progress tracking',
                  'Peer follow system',
                  'Activity feed',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block text-center px-5 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Get started free
              </Link>
            </div>

            {/* Pro tier */}
            <div className="bg-primary-600 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                Popular
              </div>
              <h3 className="text-xl font-bold mb-1">Pro</h3>
              <p className="text-primary-200 text-sm mb-4">For serious students</p>
              <div className="text-3xl font-bold mb-6">
                $10<span className="text-base font-normal text-primary-200">/mo</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Unlimited study sessions',
                  'AI study plan generator',
                  'AI learning tips & suggestions',
                  'Advanced progress charts',
                  'Priority support',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-white">
                    <CheckCircle className="h-4 w-4 text-primary-200 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block text-center px-5 py-2.5 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition-colors"
              >
                Start free trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gray-600 font-medium">
            <div className="w-6 h-6 rounded bg-primary-600 flex items-center justify-center">
              <BookOpen className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
            </div>
            StudySync
          </div>
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} StudySync. Built for students.
          </p>
        </div>
      </footer>
    </div>
  )
}
