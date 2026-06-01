'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { navItems } from './nav-items';

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 hidden h-screen bg-[#1E3A5F] text-white transition-all duration-300 md:flex md:flex-col',
        collapsed ? 'w-[70px]' : 'w-[260px]'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-5 border-b border-[#2D5A87]">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-black/30">
              <Image
                src="/brand/logo-bradwear.png"
                alt="Bradwear Logo"
                width={40}
                height={40}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Bradwear</h1>
              <p className="text-xs text-slate-300">Dashboard</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-black/30 mx-auto">
            <Image
              src="/brand/logo-bradwear.png"
              alt="Bradwear Logo"
              width={40}
              height={40}
              className="w-full h-full object-cover"
              priority
            />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                    isActive
                      ? 'bg-[#F59E0B] text-[#1E3A5F]'
                      : 'hover:bg-[#2D5A87] text-white/80 hover:text-white'
                  )}
                  title={collapsed ? item.title : undefined}
                >
                  <Icon className={cn('w-5 h-5 flex-shrink-0', collapsed && 'mx-auto')} />
                  {!collapsed && (
                    <span className="font-medium">{item.title}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse Button */}
      <div className="p-3 border-t border-[#2D5A87]">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg hover:bg-[#2D5A87] transition-colors text-white/70 hover:text-white"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>

      {/* Version */}
      {!collapsed && (
        <div className="p-4 border-t border-[#2D5A87]">
          {user && (
            <p className="text-xs text-slate-300 text-center mb-1 capitalize">
              Role: {user.role}
            </p>
          )}
          <p className="text-xs text-slate-400 text-center">v1.0.0</p>
        </div>
      )}
    </aside>
  );
}
