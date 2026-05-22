import {
 prisma,
} from './prisma';
import {
 getAuditContext,
} from './audit-context';

/**
 * Reverts a given audit log entry inside an atomic database transaction.
 */
export async function revertAuditLog(logId: string): Promise<{ success: boolean; message: string }> {
  const log = await prisma.auditLog.findUnique({
    where: {
 id: logId,
},
  });

  if (!log) {
    throw new Error('Protokolleintrag nicht gefunden.');
  }

  if (log.action === 'REVERT') {
    throw new Error('Eine Rückgängigmachungs-Aktion kann nicht selbst rückgängig gemacht werden.');
  }

  // Prevent double reversion
  const existingRevert = await prisma.auditLog.findFirst({
    where: {
 revertedFromId: log.id,
},
  });
  if (existingRevert) {
    throw new Error('Diese Aktion wurde bereits rückgängig gemacht.');
  }

  const {
 action, entityType, entityId, details,
} = log;
  if (!entityType || !entityId || !details) {
    throw new Error('Dieses Protokoll enthält nicht genügend Details zur Wiederherstellung.');
  }

  const payload = details as any;
  const oldValue = payload.oldValue;

  const modelLower = entityType.charAt(0).toLowerCase() + entityType.slice(1);

  return prisma.$transaction(async (tx) => {
    // ----------------------------------------------------
    // REVERT CREATE -> Delete the created record
    // ----------------------------------------------------
    if (action === 'CREATE') {
      try {
        const where = entityType === 'SystemSetting' ? {
 key: entityId,
} : {
 id: entityId,
};
        await (tx as any)[modelLower].delete({
 where,
});
      }
 catch (err: any) {
        console.warn('[Revert CREATE error]', err);
        throw new Error(
          'Das Element existiert nicht mehr oder wurde bereits gelöscht.',
          {
 cause: err,
},
        );
      }
    }

    // ----------------------------------------------------
    // REVERT UPDATE -> Restore pre-update scalar fields
    // ----------------------------------------------------
    else if (action === 'UPDATE') {
      if (!oldValue) {
        throw new Error('Keine alten Werte für die Wiederherstellung vorhanden.');
      }

      // Filter scalar fields to clean update payload
      const cleanData: any = {
};
      for (const [
 k,
v,
] of Object.entries(oldValue)) {
        if (k === 'id' || k === 'key' || k === 'createdAt' || k === 'updatedAt') continue;
        if (v === null || v === undefined) {
          cleanData[k] = null;
        }
 else if (typeof v !== 'object') {
          cleanData[k] = v;
        }
 else if (v instanceof Date) {
          cleanData[k] = v;
        }
 else if (typeof v === 'string') {
          // Catches Date strings from JSON parsing
          if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(v)) {
            cleanData[k] = new Date(v);
          }
 else {
            cleanData[k] = v;
          }
        }
      }

      try {
        const where = entityType === 'SystemSetting' ? {
 key: entityId,
} : {
 id: entityId,
};
        await (tx as any)[modelLower].update({
          where,
          data: cleanData,
        });
      }
 catch (err: any) {
        console.error('[Revert UPDATE error]', err);
        throw new Error(
          'Das Element konnte nicht aktualisiert werden. Es wurde möglicherweise gelöscht.',
          {
 cause: err,
},
        );
      }
    }

    // ----------------------------------------------------
    // REVERT DELETE -> Recreate the deleted record + cascade relations
    // ----------------------------------------------------
    else if (action === 'DELETE') {
      if (!oldValue) {
        throw new Error('Keine gelöschten Daten für die Wiederherstellung vorhanden.');
      }

      // Filter scalar fields to clean create payload
      const cleanData: any = {
};
      for (const [
 k,
v,
] of Object.entries(oldValue)) {
        if (k === 'createdAt' || k === 'updatedAt') continue;
        if (v === null || v === undefined) {
          cleanData[k] = null;
        }
 else if (typeof v !== 'object') {
          cleanData[k] = v;
        }
 else if (v instanceof Date) {
          cleanData[k] = v;
        }
 else if (typeof v === 'string') {
          // Catches Date strings from JSON parsing
          if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(v)) {
            cleanData[k] = new Date(v);
          }
 else {
            cleanData[k] = v;
          }
        }
      }

      try {
        // Recreate base entity
        await (tx as any)[modelLower].create({
 data: cleanData,
});

        // Restore nested relations if applicable
        if (entityType === 'Product') {
          if (oldValue.salesArguments && Array.isArray(oldValue.salesArguments)) {
            for (const arg of oldValue.salesArguments) {
              await tx.salesArgument.create({
                data: {
                  id: arg.id,
                  productId: cleanData.id,
                  text: arg.text,
                  sortOrder: arg.sortOrder,
                  isActive: arg.isActive,
                },
              });
            }
          }
          if (oldValue.priceHistory && Array.isArray(oldValue.priceHistory)) {
            for (const ph of oldValue.priceHistory) {
              await tx.priceHistory.create({
                data: {
                  id: ph.id,
                  productId: cleanData.id,
                  price: ph.price,
                  label: ph.label,
                  createdAt: ph.createdAt ? new Date(ph.createdAt) : undefined,
                },
              });
            }
          }
        }
 else if (entityType === 'SpecialPrice') {
          if (oldValue.tiers && Array.isArray(oldValue.tiers)) {
            for (const tier of oldValue.tiers) {
              await tx.specialPriceTier.create({
                data: {
                  id: tier.id,
                  specialPriceId: cleanData.id,
                  price: tier.price,
                  fromMonth: tier.fromMonth,
                  toMonth: tier.toMonth,
                  discountTarget: tier.discountTarget,
                  discountType: tier.discountType,
                },
              });
            }
          }
          if (oldValue.products && Array.isArray(oldValue.products)) {
            await tx.specialPrice.update({
              where: {
 id: cleanData.id,
},
              data: {
                products: {
                  connect: oldValue.products.map((p: any) => ({
 id: p.id,
})),
                },
              },
            });
          }
        }
 else if (entityType === 'Addon') {
          if (oldValue.tiers && Array.isArray(oldValue.tiers)) {
            for (const tier of oldValue.tiers) {
              await tx.addonTier.create({
                data: {
                  id: tier.id,
                  addonId: cleanData.id,
                  name: tier.name,
                  price: tier.price,
                },
              });
            }
          }
          if (oldValue.compatibleProducts && Array.isArray(oldValue.compatibleProducts)) {
            await tx.addon.update({
              where: {
 id: cleanData.id,
},
              data: {
                compatibleProducts: {
                  connect: oldValue.compatibleProducts.map((p: any) => ({
 id: p.id,
})),
                },
              },
            });
          }
        }
      }
 catch (err: any) {
        console.error('[Revert DELETE error]', err);
        if (err.code === 'P2002') {
          throw new Error(
            `Wiederherstellung fehlgeschlagen: Ein Element mit der ID/Eigenschaft "${entityId}" existiert bereits.`,
            {
 cause: err,
},
          );
        }
        throw new Error(
          'Die Löschung konnte nicht rückgängig gemacht werden, da verknüpfte Abhängigkeiten (z.B. Standorte, Teams oder Produkte) fehlen.',
          {
 cause: err,
},
        );
      }
    }

    // Create REVERT action logging the rollback itself
    const ctx = getAuditContext();
    await tx.auditLog.create({
      data: {
        action: 'REVERT',
        entityType,
        entityId,
        message: `Rückgängig gemacht: ${log.message}`,
        details: {
 revertedFromId: log.id,
actionReverted: action,
},
        userId: ctx?.userId || null,
        userEmail: ctx?.userEmail || null,
        userRole: ctx?.userRole || null,
        clientIp: ctx?.clientIp || null,
        revertedFromId: log.id,
      },
    });

    return {
      success: true,
      message: 'Aktion wurde erfolgreich rückgängig gemacht.',
    };
  });
}
