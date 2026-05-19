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

export function usePermissions() {
  const {
    data: currentUser,
  } = trpc.auth.me.useQuery();
  const role = currentUser?.role;

  return {
    can: (permission: Permission) => hasPermission(role, permission),
    role: role || 'USER',
    isAuthenticated: !!currentUser,
  };
}
