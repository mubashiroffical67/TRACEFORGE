'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import {
  LayoutDashboard,
  AlertCircle,
  GitBranch,
  Search,
  BookOpen,
  Settings,
  Zap,
  ChevronRight,
} from 'lucide-react';

const nav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/incidents', label: 'Incidents', icon: AlertCircle },
  { href: '/repositories', label: 'Repositories', icon: GitBranch },
  { href: '/investigations', label: 'Investigations', icon: Search },
  { href: '/knowledge', label: 'Knowledge', icon: BookOpen },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 flex-shrink-0 bg-forge-surface border-r border-forge-border flex flex-col">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-forge-border">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 bg-forge-accent rounded-md flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <div>
            <span className="font-semibold text-forge-text text-sm tracking-tight">TraceForge</span>
            <div className="text-[10px] text-forge-muted leading-none">Incident Response</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm mb-0.5 transition-colors',
                active
                  ? 'bg-forge-accent/10 text-forge-accent font-medium'
                  : 'text-forge-muted hover:text-forge-text hover:bg-white/5'
              )}
            >
              <Icon size={15} />
              {label}
              {active && <ChevronRight size={12} className="ml-auto opacity-50" />}
            </Link>
          );
        })}
      </nav>

      {/* Demo badge */}
      <div className="p-3 border-t border-forge-border">
        <Link
          href="/incidents/demo"
          className="flex items-center gap-2 px-3 py-2 bg-forge-accent/10 border border-forge-accent/20 rounded-md hover:bg-forge-accent/15 transition-colors"
        >
          <Zap size={13} className="text-forge-accent" />
          <span className="text-xs text-forge-accent font-medium">Demo: INC-0042</span>
        </Link>
      </div>
    </aside>
  );
}
