'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Search, User, LogOut, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/providers/AuthProvider';
import { EMAIL_COOKIE, NAME_COOKIE, ROLE_COOKIE, SESSION_COOKIE } from '@/lib/auth/session';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { navItems } from './nav-items';

interface HeaderProps {
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export function Header({ title, breadcrumbs }: HeaderProps) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const initials = (() => {
    if (!user?.displayName) return 'U';
    const words = user.displayName.trim().split(/\s+/).slice(0, 2);
    return words.map((word) => word.charAt(0).toUpperCase()).join('');
  })();

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    setIsProfileMenuOpen(false);
    const cookiesToClear = [SESSION_COOKIE, EMAIL_COOKIE, NAME_COOKIE, ROLE_COOKIE];
    const expires = 'Max-Age=0; Path=/; SameSite=Lax';
    cookiesToClear.forEach((key) => {
      document.cookie = `${key}=; ${expires}`;
    });
    router.replace('/login');
    router.refresh();
  };

  useEffect(() => {
    if (!isProfileMenuOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (!profileMenuRef.current) return;
      if (!profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isProfileMenuOpen]);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="flex items-center justify-between px-3 py-3 md:px-6 md:py-4">
        {/* Left side - Breadcrumb & Title */}
        <div className="flex items-start gap-2">
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="mt-0.5 h-8 w-8 md:hidden"
                  aria-label="Buka menu"
                />
              }
            >
              <Menu className="h-4 w-4" />
            </SheetTrigger>
            <SheetContent side="left" className="w-[86%] max-w-xs border-r-0 bg-[#1E3A5F] p-0 text-white">
              <div className="border-b border-[#2D5A87] px-4 py-4">
                <SheetTitle className="text-white">Bradwear Menu</SheetTitle>
              </div>
              <nav className="px-3 py-3">
                <ul className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                            isActive
                              ? 'bg-[#F59E0B] text-[#1E3A5F]'
                              : 'text-white/85 hover:bg-[#2D5A87] hover:text-white'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </SheetContent>
          </Sheet>
          <div>
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="mb-1 hidden items-center gap-2 text-xs text-muted-foreground md:flex md:text-sm">
              {breadcrumbs.map((crumb, index) => (
                <span key={index} className="flex items-center gap-2">
                  {index > 0 && <span>/</span>}
                  {crumb.href ? (
                    <Link href={crumb.href} className="hover:text-primary">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-foreground font-medium">{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}
          <h1 className="text-lg font-bold text-foreground md:text-2xl">{title}</h1>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Search */}
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari..."
              className="pl-10 w-[280px] bg-slate-50 border-slate-200 focus:bg-white"
            />
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden">
            <Search className="h-4 w-4 text-slate-600" />
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative h-8 w-8 md:h-10 md:w-10">
            <Bell className="w-4 h-4 text-slate-600 md:w-5 md:h-5" />
            <Badge className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center bg-red-500 p-0 text-[9px] md:h-5 md:w-5 md:text-[10px]">
              3
            </Badge>
          </Button>

          {/* User Menu */}
          {user ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-slate-100"
                onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                aria-haspopup="menu"
                aria-expanded={isProfileMenuOpen}
              >
                <Avatar className="h-8 w-8">
                  {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.displayName} /> : null}
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden xl:flex flex-col items-start">
                  <span className="font-medium text-sm leading-tight">{user.displayName}</span>
                  <span className="text-[11px] text-muted-foreground leading-tight">
                    {user.statusText || user.role}
                  </span>
                </div>
              </button>
              {isProfileMenuOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[260px] rounded-lg border border-slate-200 bg-white p-2 shadow-xl">
                  <div className="rounded-md px-2 py-2">
                    <p className="text-sm font-medium">{user.displayName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="my-1 h-px bg-slate-100" />
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-slate-100"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      router.push('/profil');
                    }}
                  >
                    <User className="w-4 h-4" />
                    Profil
                    <Badge variant="secondary" className="ml-auto capitalize">
                      {user.role}
                    </Badge>
                  </button>
                  <button
                    type="button"
                    className="mt-1 flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    {isLoggingOut ? 'Memproses...' : 'Logout'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href={`/login?next=${encodeURIComponent(pathname || '/dashboard')}`}
              className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Masuk
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
