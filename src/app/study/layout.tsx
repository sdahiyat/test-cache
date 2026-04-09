import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase';
import { BookOpen } from 'lucide-react';

export default async function StudyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('users')
    .select('display_name, username, avatar_url')
    .eq('id', user.id)
    .single();

  const displayName = profile?.display_name ?? profile?.username ?? user.email ?? 'User';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav bar */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-base font-bold text-violet-700"
            >
              <BookOpen className="h-5 w-5" />
              StudySync
            </Link>
            <nav className="hidden items-center gap-1 sm:flex">
              <NavLink href="/sessions">Sessions</NavLink>
              <NavLink href="/study">Study Log</NavLink>
              <NavLink href="/search">Search</NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/user/${profile?.username ?? ''}`}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-700 transition hover:bg-gray-100"
            >
              {profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={displayName}
                  className="h-7 w-7 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="hidden sm:inline">{displayName}</span>
            </Link>
            <Link
              href="/settings"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
            >
              Settings
            </Link>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  // We can't use usePathname in a server component, so we use a simple link
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
    >
      {children}
    </Link>
  );
}
