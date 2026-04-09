'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  Search,
  LayoutDashboard,
  Settings,
  Users,
  BookMarked,
} from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { href: '/sessions', label: 'Sessions', icon: LayoutDashboard },
  { href: '/study', label: 'Study Log', icon: BookOpen },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={clsx(
              'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition',
              isActive
                ? 'bg-violet-100 text-violet-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            <Icon size={16} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
