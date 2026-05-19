'use client';

import React from 'react';
import {
 usePermissions,
} from '@/hooks/use-permissions';
import type {
 Permission,
} from '@/lib/permissions';

interface RequirePermissionProps {
  action: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RequirePermission({
 action, children, fallback = null,
}: RequirePermissionProps) {
  const {
 can,
} = usePermissions();

  if (!can(action)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
