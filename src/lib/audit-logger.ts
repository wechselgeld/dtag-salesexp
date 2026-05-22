import {
 prisma,
} from './prisma';
import {
 getAuditContext,
} from './audit-context';

export const AUDITED_MODELS = [
  'Product',
  'Addon',
  'SpecialPrice',
  'Location',
  'OdRegion',
  'Team',
  'User',
  'OneTimeCredit',
  'News',
  'SystemSetting',
];

const GERMAN_MODEL_NAMES: Record<string, string> = {
  Product: 'Produkt',
  Addon: 'Option',
  SpecialPrice: 'Aktion',
  Location: 'Standort',
  OdRegion: 'OD-Bereich',
  Team: 'Team',
  User: 'Benutzer',
  OneTimeCredit: 'Gutschrift',
  News: 'Neuigkeit',
  SystemSetting: 'Systemeinstellung',
};

export function isAuditedModel(model: string): boolean {
  return AUDITED_MODELS.includes(model);
}

/**
 * Strips credentials and tokens to ensure security and GDPR compliance.
 */
export function sanitizePayload(data: any): any {
  if (!data || typeof data !== 'object') return data;

  const clone = JSON.parse(JSON.stringify(data));
  const sensitiveKeys = [
    'password',
    'pin',
    'pinResetOtpHash',
    'verificationToken',
    'verificationExpiresAt',
    'pinResetExpiresAt',
    'sessionVersion',
  ];

  const scrub = (obj: any) => {
    if (!obj || typeof obj !== 'object') return;
    for (const key in obj) {
      if (sensitiveKeys.includes(key)) {
        obj[key] = '[GEFILTERT]';
      }
 else if (typeof obj[key] === 'object') {
        scrub(obj[key]);
      }
    }
  };

  scrub(clone);
  return clone;
}

function getEntityLabel(model: string, data: any): string {
  if (!data) return 'Unbekannt';
  if (model === 'SystemSetting') return data.key || 'Einstellung';
  if (model === 'User' && (data.firstName || data.lastName)) {
    return `${data.firstName || ''} ${data.lastName || ''}`.trim();
  }
  return data.name || data.title || data.email || data.firstName || data.id || 'Unbekannt';
}

function getGermanModelName(model: string): string {
  return GERMAN_MODEL_NAMES[model] || model;
}

/**
 * Fetches the current database record for single-row updates/deletes.
 */
export async function fetchCurrentState(model: string, where: any): Promise<any> {
  try {
    const dbName = model.charAt(0).toLowerCase() + model.slice(1);
    return await (prisma as any)[dbName].findUnique({
 where,
});
  }
 catch (e) {
    console.error(`[Audit] Failed to fetch current state for ${model}:`, e);
    return null;
  }
}

/**
 * Fetches the current database record along with its direct relations before deletion
 * so they can be written to the log and successfully restored during a Revert.
 */
export async function fetchCurrentStateWithRelations(model: string, where: any): Promise<any> {
  try {
    const dbName = model.charAt(0).toLowerCase() + model.slice(1);
    const options: any = {
};

    if (model === 'Product') {
      options.include = {
        salesArguments: {
 orderBy: {
 sortOrder: 'asc',
},
},
        priceHistory: {
 orderBy: {
 createdAt: 'desc',
},
},
      };
    }
 else if (model === 'Addon') {
      options.include = {
        tiers: true,
        compatibleProducts: {
 select: {
 id: true,
},
},
      };
    }
 else if (model === 'SpecialPrice') {
      options.include = {
        tiers: {
 orderBy: {
 fromMonth: 'asc',
},
},
        products: {
 select: {
 id: true,
},
},
      };
    }

    return await (prisma as any)[dbName].findUnique({
      where,
      ...options,
    });
  }
 catch (e) {
    console.error(`[Audit] Failed to fetch current state with relations for ${model}:`, e);
    return fetchCurrentState(model, where);
  }
}

interface ManualAuditLogParams {
  action: string;
  entityType?: string;
  entityId?: string;
  message: string;
  details?: any;
  userId?: string | null;
  userEmail?: string | null;
  userRole?: string | null;
  clientIp?: string | null;
}

/**
 * Logs a manual action (like logins, logouts, passwords setups, etc.)
 */
export async function writeAuditLog(params: ManualAuditLogParams) {
  try {
    const ctx = getAuditContext();
    await prisma.auditLog.create({
      data: {
        action: params.action,
        entityType: params.entityType || null,
        entityId: params.entityId || null,
        message: params.message,
        details: params.details ? sanitizePayload(params.details) : null,
        userId: params.userId ?? ctx?.userId ?? null,
        userEmail: params.userEmail ?? ctx?.userEmail ?? null,
        userRole: params.userRole ?? ctx?.userRole ?? null,
        clientIp: params.clientIp ?? ctx?.clientIp ?? null,
      },
    });
  }
 catch (e) {
    console.error('[Audit] Failed to write manual audit log:', e);
  }
}

/**
 * Automatically records database insertions, updates, and deletions.
 */
export async function logAutomaticAction(
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  model: string,
  result: any,
  oldValue?: any,
) {
  try {
    if (!result) return;
    const ctx = getAuditContext();

    const entityId = model === 'SystemSetting' ? result.key : result.id;
    const label = getEntityLabel(model, action === 'DELETE' ? oldValue : result);
    const modelGerman = getGermanModelName(model);

    let message = '';
    if (action === 'CREATE') {
      message = `${modelGerman} "${label}" wurde erstellt.`;
    }
 else if (action === 'UPDATE') {
      message = `${modelGerman} "${label}" wurde aktualisiert.`;
    }
 else if (action === 'DELETE') {
      message = `${modelGerman} "${label}" wurde gelöscht.`;
    }

    const details: any = {
};
    if (action === 'CREATE') {
      details.newValue = sanitizePayload(result);
    }
 else if (action === 'DELETE') {
      details.oldValue = sanitizePayload(oldValue);
    }
 else if (action === 'UPDATE') {
      details.oldValue = sanitizePayload(oldValue);
      details.newValue = sanitizePayload(result);
    }

    await prisma.auditLog.create({
      data: {
        action,
        entityType: model,
        entityId,
        message,
        details,
        userId: ctx?.userId || null,
        userEmail: ctx?.userEmail || null,
        userRole: ctx?.userRole || null,
        clientIp: ctx?.clientIp || null,
      },
    });
  }
 catch (e) {
    console.error(`[Audit] Failed to write automatic audit log for ${model}.${action}:`, e);
  }
}
