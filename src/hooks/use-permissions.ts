'use client';

import {
  trpc,
} from '@/lib/trpc';
import type {
  Permission,
} from '@/lib/permissions';
import {
  hasPermission,
} from '@/lib/permissions';

import {
 useEffect, useState,
} from 'react';

interface CachedSession {
  role: string;
  isEditor: boolean;
}

export function usePermissions() {
  const {
    data: currentUser,
    isLoading,
  } = trpc.auth.me.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  const [
 cached,
setCached,
] = useState<CachedSession | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const item = window.sessionStorage.getItem('saleshelper_session');
        if (item) {
          return JSON.parse(item) as CachedSession;
        }
      }
 catch (e) {
        console.error('Failed to parse cached session', e);
      }
    }
    return null;
  });

  useEffect(() => {
    if (currentUser) {
      const sessionData: CachedSession = {
        role: currentUser.role,
        isEditor: currentUser.isEditor ?? false,
      };
      setCached(sessionData);
      try {
        window.sessionStorage.setItem('saleshelper_session', JSON.stringify(sessionData));
      }
 catch (e) {
        console.error('Failed to save session to storage', e);
      }
    }
 else if (currentUser === null) {
      setCached(null);
      try {
        window.sessionStorage.removeItem('saleshelper_session');
      }
 catch (e) {
        console.error('Failed to clear session from storage', e);
      }
    }
  }, [
 currentUser,
]);

  const activeRole = currentUser?.role || cached?.role || 'USER';
  const activeIsEditor = currentUser?.isEditor ?? cached?.isEditor ?? false;
  const isLoaded = !!currentUser || !!cached;

  return {
    can: (permission: Permission) => hasPermission(activeRole, permission, activeIsEditor),
    role: activeRole,
    isAuthenticated: isLoaded && activeRole !== 'USER',
    isLoading: isLoading && !cached,
  };
}
