import { redirect } from 'next/navigation';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { Sidebar } from '@/components/shared/Sidebar';
import { getCurrentUserContext } from '@/lib/auth/server';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUserContext();

  if (!user || !user.isActive) {
    redirect('/login');
  }

  return (
    <AuthProvider user={user}>
      <div className="flex min-h-screen">
        <Sidebar />
        <main
          className="flex-1 transition-all duration-300"
          style={{ marginLeft: '260px' }}
        >
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}
