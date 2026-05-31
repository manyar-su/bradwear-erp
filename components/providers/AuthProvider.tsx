'use client';

import { createContext, useContext, useMemo } from 'react';
import { can } from '@/lib/auth/permissions';
import type { AuthUserContext, PermissionKey } from '@/types/auth';

type AuthContextValue = {
  user: AuthUserContext | null;
  can: (permission: PermissionKey) => boolean;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  can: () => false,
});

export function AuthProvider({
  children,
  user,
}: {
  children: React.ReactNode;
  user: AuthUserContext | null;
}) {
  const value = useMemo<AuthContextValue>(() => {
    return {
      user,
      can: (permission) => {
        if (!user || !user.isActive) return false;
        return can(user.role, permission);
      },
    };
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
