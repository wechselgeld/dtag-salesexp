import {
 AsyncLocalStorage,
} from 'node:async_hooks';

export interface AuditContext {
  userId?: string | null;
  userEmail?: string | null;
  userRole?: string | null;
  clientIp?: string | null;
}

export const auditContextStorage = new AsyncLocalStorage<AuditContext>();

export function getAuditContext(): AuditContext | undefined {
  return auditContextStorage.getStore();
}
