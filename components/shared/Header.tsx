'use client';

import Link from 'next/link';
import { Bell, Search, User, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export function Header({ title, breadcrumbs }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side - Breadcrumb & Title */}
        <div>
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
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
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari..."
              className="pl-10 w-[280px] bg-slate-50 border-slate-200 focus:bg-white"
            />
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5 text-slate-600" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-red-500">
              3
            </Badge>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  AD
                </AvatarFallback>
              </Avatar>
              <span className="hidden lg:inline font-medium text-sm">Admin</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="w-4 h-4 mr-2" />
                Profil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem data-variant="destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
