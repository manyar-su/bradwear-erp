'use client';

import { Sidebar } from '@/components/shared/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: '260px' }}
      >
        {children}
      </main>
    </div>
  );
}
