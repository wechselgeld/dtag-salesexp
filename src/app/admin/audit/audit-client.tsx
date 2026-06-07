'use client';

import {
    useState, useMemo, useEffect, useRef,
} from 'react';
import {
    trpc,
} from '@/lib/trpc';
import {
    History,
    X,
    Loader2,
    ShieldAlert,
    Trash2,
    Activity,
    Calendar,
    User,
    AlertTriangle,
    ChevronRight,
    RefreshCw,
    Undo2,
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    Server,
} from 'lucide-react';
import clsx from 'clsx';
import {
    showErrorToast,
} from '@/components/shared/error-toast';
import {
    Skeleton,
} from '@/components/shared/skeleton';
import {
    ScrollableFilterRow,
} from '@/components/shared/scrollable-filter-row';
import {
    AdminPageHeader,
} from '@/components/shared/ui/admin-ui';
import {
    PremiumButton,
} from '@/components/shared/form/form-suite';
import {
    motion, AnimatePresence,
} from 'framer-motion';
import { useSearchHotkey } from '@/hooks/use-search-hotkey';

interface AuditLogType {
    id: string;
    action: string;
    entityType: string | null;
    entityId: string | null;
    message: string;
    details?: any;
    userId: string | null;
    userEmail: string | null;
    userRole: string | null;
    clientIp: string | null;
    revertedFromId: string | null;
    createdAt: string | Date;
}

// Map database actions to user friendly German labels & styling properties
const ACTION_MAP: Record<string, { label: string; bg: string; text: string; border: string }> = {
    CREATE: {
 label: 'Erstellt',
bg: 'bg-emerald-50',
text: 'text-emerald-700',
border: 'border-emerald-200/50',
},
    UPDATE: {
 label: 'Geändert',
bg: 'bg-amber-50',
text: 'text-amber-700',
border: 'border-amber-200/50',
},
    DELETE: {
 label: 'Gelöscht',
bg: 'bg-rose-50',
text: 'text-rose-700',
border: 'border-rose-200/50',
},
    LOGIN: {
 label: 'Anmeldung',
bg: 'bg-blue-50',
text: 'text-blue-700',
border: 'border-blue-200/50',
},
    LOGOUT: {
 label: 'Abmeldung',
bg: 'bg-slate-50',
text: 'text-slate-600',
border: 'border-slate-200/50',
},
    REVERT: {
 label: 'Zurückgesetzt',
bg: 'bg-[#e20074]/10',
text: 'text-[#e20074]',
border: 'border-[#e20074]/20',
},
};

// Map Prisma Model Names to Friendly German Names
const ENTITY_MAP: Record<string, string> = {
    Product: 'Produkt',
    Addon: 'Zusatzoption',
    SpecialPrice: 'Aktion / Rabatt',
    User: 'Benutzer',
    Team: 'Team',
    Location: 'Standort',
    OdRegion: 'OD-Bereich',
    OneTimeCredit: 'Gutschrift',
    News: 'Neuigkeit',
    SystemSetting: 'Einstellung',
};

export default function AuditClient() {
    const utils = trpc.useUtils();
    const [
 searchQuery,
setSearchQuery,
] = useState('');
    const [
 debouncedSearch,
setDebouncedSearch,
] = useState('');
    const [
 activeFilterId,
setActiveFilterId,
] = useState<string>('ALL');
    const [
        selectedLog,
        setSelectedLog,
    ] = useState<AuditLogType | null>(null);
    const [
        showClearConfirm,
        setShowClearConfirm,
    ] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Debounce search inputs to avoid rapid queries
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [
 searchQuery,
]);

    // Hotkey to focus search box with "/"
    useSearchHotkey(inputRef);

    // Query logs
    const {
        data,
        isLoading,
        isFetching,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = trpc.adminAudit.list.useInfiniteQuery(
        {
            limit: 50,
            search: debouncedSearch,
            action: [
 'CREATE',
'UPDATE',
'DELETE',
'LOGIN',
'REVERT',
].includes(activeFilterId) ? activeFilterId : undefined,
            entityType: ![
 'ALL',
'CREATE',
'UPDATE',
'DELETE',
'LOGIN',
'REVERT',
].includes(activeFilterId) ? activeFilterId : undefined,
        },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        },
    );

    // Revert mutation
    const [
 revertPending,
setRevertPending,
] = useState(false);
    const revertMutation = trpc.adminAudit.revert.useMutation({
        onSuccess: (res) => {
            utils.adminAudit.list.invalidate();
            setSelectedLog(null);
            // Show custom success state inside the flow rather than standard toast
            alert(res.message);
        },
        onError: (err) => {
            showErrorToast('Aktion konnte nicht rückgängig gemacht werden', err.message);
        },
        onSettled: () => {
            setRevertPending(false);
        },
    });

    const handleRevert = async (logId: string) => {
        if (!confirm('Möchtest Du diese Aktion wirklich rückgängig machen? Alle betroffenen Daten werden in ihren vorherigen Zustand zurückversetzt.')) {
            return;
        }
        setRevertPending(true);
        await revertMutation.mutateAsync({
 logId,
});
    };

    // Purge logs
    const clearAllLogs = trpc.adminAudit.clearAll.useMutation({
        onSuccess: () => {
            utils.adminAudit.list.invalidate();
            setShowClearConfirm(false);
        },
        onError: (error) => {
            showErrorToast('Fehler beim Leeren', error.message);
        },
    });

    const logs = useMemo(() => {
        return data?.pages.flatMap((page) => page.items) || [
];
    }, [
 data,
]);

    const handleClearLogs = async () => {
        await clearAllLogs.mutateAsync();
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Header with Clear Action */}
            <AdminPageHeader
                title="Aktivitätslog"
                subtitle="Sicheres, revisionssicheres Aktivitäts- und Audit-Logbuch über administrative Systemänderungen."
                backHref="/admin"
                action={
                    <div className="flex gap-3">
                        <PremiumButton
                            variant="secondary"
                            onClick={() => utils.adminAudit.list.invalidate()}
                            disabled={isLoading || isFetching}
                            className="h-[40px] px-4 rounded-xl text-[0.8rem] gap-1.5"
                        >
                            <RefreshCw className={clsx('w-3.5 h-3.5', (isLoading || isFetching) && 'animate-spin')} />
                            Aktualisieren
                        </PremiumButton>
                        {logs.length > 0 && (
                            <PremiumButton
                                variant="danger"
                                onClick={() => setShowClearConfirm(true)}
                                className="h-[40px] px-4 rounded-xl text-[0.8rem] gap-1.5"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                Log leeren
                            </PremiumButton>
                        )}
                    </div>
                }
            />

            {/* Hint Box */}
            <div className="bg-[#f7f8fa] border border-[#eaedf0] p-4 rounded-2xl flex items-center justify-between shadow-sm">
                <p className="text-[0.85rem] text-[#666] m-0 leading-relaxed">
                    <strong>Hinweis zur Revisionssicherheit:</strong> Jede Änderung an Produkten, Aktionen oder Benutzern wird lückenlos aufgezeichnet. Klicke auf einen Eintrag, um einen detaillierten Feld-Vergleich einzusehen, eventuelle Schreibkollisionen zu prüfen und Änderungen mit einem Klick transaktionssicher rückgängig zu machen.
                </p>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col gap-4">
                <div className="relative flex-1 group">
                    <svg className="w-4 h-4 text-[#bbb] absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 group-focus-within:text-[#e20074]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Aktivitäten suchen nach ID, Nachricht, Benutzer-E-Mail, IP-Adresse..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-11 py-3 rounded-xl border border-[#eaedf0] bg-white focus:outline-none focus:border-[#e20074]/30 focus:shadow-[0_0_0_3px_rgba(226,0,116,0.06)] transition-all text-[0.85rem] text-[#1a1a2e] font-medium"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#bbb] hover:text-[#1a1a2e] bg-transparent border-none cursor-pointer flex items-center justify-center p-1 rounded-lg hover:bg-slate-50 transition-all active:scale-95 duration-200"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    {!searchQuery && (
                        <kbd className="hidden sm:inline-flex absolute right-4 top-1/2 -translate-y-1/2 items-center gap-1 px-2 py-0.5 text-[0.65rem] font-bold text-[#bbb] bg-slate-50/50 border border-[#eaedf0] rounded-lg select-none pointer-events-none transition-opacity duration-200 group-focus-within:opacity-0">
                            /
                        </kbd>
                    )}
                </div>

                {/* Filter Row */}
                <ScrollableFilterRow>
                    {[
                        {
 id: 'ALL',
label: 'Alle Aktivitäten',
icon: Activity,
color: '#1a1a2e',
},
                        {
 id: 'CREATE',
label: 'Erstellungen',
icon: CheckCircle2,
color: '#10b981',
},
                        {
 id: 'UPDATE',
label: 'Änderungen',
icon: RefreshCw,
color: '#f59e0b',
},
                        {
 id: 'DELETE',
label: 'Löschungen',
icon: Trash2,
color: '#ef4444',
},
                        {
 id: 'REVERT',
label: 'Rückgängigmachungen',
icon: Undo2,
color: '#e20074',
},
                        {
 id: 'Product',
label: 'Produkte',
icon: Server,
color: '#6366f1',
},
                        {
 id: 'SpecialPrice',
label: 'Aktionen',
icon: History,
color: '#8b5cf6',
},
                        {
 id: 'User',
label: 'Benutzer',
icon: User,
color: '#ec4899',
},
                    ].map((filter) => {
                        const isSelected = activeFilterId === filter.id;
                        const Icon = filter.icon;
                        return (
                            <button
                                key={filter.id}
                                onClick={() => setActiveFilterId(filter.id)}
                                className={clsx(
                                    'flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border whitespace-nowrap transition-all duration-200 cursor-pointer outline-none font-semibold text-[0.8rem] active:scale-95',
                                    isSelected
                                        ? 'text-white shadow-md font-bold'
                                        : 'bg-linear-to-br from-white to-[#fcfafc] border-[#eaedf0] text-[#666] hover:bg-[#f7f8fa] hover:border-[#ddd]',
                                )}
                                style={{
                                    backgroundColor: isSelected ? filter.color : undefined,
                                    borderColor: isSelected ? filter.color : undefined,
                                }}
                            >
                                <Icon className={clsx('w-4 h-4', isSelected ? 'opacity-100' : 'opacity-60')} />
                                <span>{filter.label}</span>
                            </button>
                        );
                    })}
                </ScrollableFilterRow>
            </div>

            {/* Main Table */}
            <div className="bg-white rounded-3xl border border-[#eaedf0] overflow-hidden shadow-sm">
                {isLoading && logs.length === 0 ? (
                    <div className="flex flex-col gap-3 p-5">
                        {[
 1,
2,
3,
4,
5,
].map((i) => (
                            <Skeleton key={i} className="h-14 w-full rounded-xl" />
                        ))}
                    </div>
                ) : logs.length === 0 ? (
                    <div className="p-20 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-[#f7f8fa] rounded-2xl flex items-center justify-center mb-4 border border-[#eaedf0]">
                            <History className="w-6 h-6 text-[#ccc]" />
                        </div>
                        <h3 className="text-[1.1rem] font-bold text-[#1a1a2e] mb-1">
                            Keine Protokolleinträge
                        </h3>
                        <p className="text-[0.85rem] text-[#999] max-w-[320px] m-0 mb-4 leading-relaxed">
                            Es wurden keine Protokolle {searchQuery || activeFilterId !== 'ALL' ? 'für die ausgewählten Suchfilter' : 'im System'} gefunden.
                        </p>
                        {(searchQuery || activeFilterId !== 'ALL') && (
                            <button
                                onClick={() => { setSearchQuery(''); setActiveFilterId('ALL'); }}
                                className="text-[#1a1a2e] text-[0.85rem] font-semibold bg-white border border-[#eaedf0] px-4 py-2 rounded-xl hover:bg-[#f7f8fa] transition-colors cursor-pointer outline-none"
                            >
                                Filter zurücksetzen
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[#eaedf0] bg-[#fcfcfd]">
                                    <th className="px-6 py-4 font-bold text-[#aaa] text-[0.72rem] uppercase tracking-wider">
                                        Zeitstempel
                                    </th>
                                    <th className="px-6 py-4 font-bold text-[#aaa] text-[0.72rem] uppercase tracking-wider">
                                        Aktion
                                    </th>
                                    <th className="px-6 py-4 font-bold text-[#aaa] text-[0.72rem] uppercase tracking-wider">
                                        Bereich / ID
                                    </th>
                                    <th className="px-6 py-4 font-bold text-[#aaa] text-[0.72rem] uppercase tracking-wider">
                                        Benutzer / IP
                                    </th>
                                    <th className="px-6 py-4 font-bold text-[#aaa] text-[0.72rem] uppercase tracking-wider">
                                        Meldung
                                    </th>
                                    <th className="px-6 py-4 font-bold text-[#aaa] text-[0.72rem] uppercase tracking-wider text-right">
                                        Details
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#f0f0f0]">
                                {logs.map((log: AuditLogType) => {
                                    const actionMeta = ACTION_MAP[log.action] || {
                                        label: log.action,
                                        bg: 'bg-slate-50',
                                        text: 'text-slate-700',
                                        border: 'border-slate-200/50',
                                    };

                                    return (
                                        <tr
                                            key={log.id}
                                            onClick={() => setSelectedLog(log)}
                                            className="group hover:bg-[#fcfcfd] transition-colors cursor-pointer"
                                        >
                                            <td className="py-4 px-6 whitespace-nowrap text-[0.82rem] text-[#666] font-medium">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-[#bbb]" />
                                                    {new Date(log.createdAt).toLocaleString('de-DE', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        second: '2-digit',
                                                    })}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 whitespace-nowrap">
                                                <span className={clsx(
                                                    'text-[0.62rem] font-bold px-2.5 py-1 rounded-md inline-block uppercase tracking-wider border',
                                                    actionMeta.bg,
                                                    actionMeta.text,
                                                    actionMeta.border,
                                                )}>
                                                    {actionMeta.label}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 whitespace-nowrap">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[0.8rem] text-[#1a1a2e] font-bold">
                                                        {log.entityType ? (ENTITY_MAP[log.entityType] || log.entityType) : 'System'}
                                                    </span>
                                                    {log.entityId && (
                                                        <span className="text-[0.68rem] text-[#888] font-mono select-all">
                                                            ID: {log.entityId.substring(0, 12)}...
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col">
                                                    {log.userEmail ? (
                                                        <>
                                                            <span className="text-[0.82rem] font-bold text-[#1a1a2e]">
                                                                {log.userEmail}
                                                            </span>
                                                            <span className="text-[0.65rem] text-[#888] font-semibold uppercase tracking-wider mt-0.5">
                                                                Rolle: {log.userRole || 'USER'}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-[0.8rem] text-[#bbb] italic">
                                                            System / Gast
                                                        </span>
                                                    )}
                                                    {log.clientIp && (
                                                        <span className="text-[0.65rem] text-[#ccc] font-mono mt-0.5">
                                                            IP: {log.clientIp}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 max-w-[320px] truncate text-[0.82rem] text-[#555] font-semibold">
                                                {log.message}
                                            </td>
                                            <td className="py-4 px-6 text-right w-[80px]">
                                                <div className="flex items-center justify-end">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 border border-[#eaedf0] flex items-center justify-center text-[#ccc] group-hover:text-[#e20074] group-hover:border-[#e20074]/20 group-hover:bg-[#e20074]/5 transition-all">
                                                        <ChevronRight className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {hasNextPage && (
                    <div className="p-8 border-t border-[#f0f0f0] flex justify-center bg-[#fcfcfd]">
                        <PremiumButton
                            onClick={() => fetchNextPage()}
                            disabled={isFetchingNextPage}
                            variant="secondary"
                            className="h-[44px] px-8 rounded-xl font-bold transition-all text-[0.8rem] shadow-sm hover:shadow-md"
                        >
                            {isFetchingNextPage ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                'Mehr laden'
                            )}
                        </PremiumButton>
                    </div>
                )}
            </div>

            {/* Diagnostic Inspector & Rollback Modal */}
            <AnimatePresence>
                {selectedLog && (
                    <InspectorModal
                        log={selectedLog}
                        onClose={() => setSelectedLog(null)}
                        onRevert={handleRevert}
                        revertPending={revertPending}
                    />
                )}
            </AnimatePresence>

            {/* Purge Logs Sudo-like Confirmation Modal */}
            <AnimatePresence>
                {showClearConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{
 opacity: 0,
scale: 0.95,
y: 10,
}}
                            animate={{
 opacity: 1,
scale: 1,
y: 0,
}}
                            exit={{
 opacity: 0,
scale: 0.95,
y: 10,
}}
                            transition={{
 duration: 0.2,
}}
                            className="bg-white rounded-3xl shadow-2xl border border-[#eaedf0] w-full max-w-md overflow-hidden relative text-left"
                        >
                            {/* Confirmation Header */}
                            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#eaedf0]">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                                        <Trash2 className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-[1.15rem] font-extrabold text-[#1a1a2e] m-0">Aktivitätslog leeren?</h3>
                                </div>
                                <button
                                    onClick={() => setShowClearConfirm(false)}
                                    disabled={clearAllLogs.isPending}
                                    type="button"
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#888] hover:bg-[#f7f8fa] hover:text-[#1a1a2e] transition-colors cursor-pointer outline-none"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Confirmation Body */}
                            <div className="p-6 space-y-4">
                                <p className="text-[0.9rem] text-[#666] leading-relaxed m-0">
                                    Bist Du sicher, dass Du das gesamte Aktivitätslogbuch unwiderruflich leeren möchtest? Alle Revisions- und Rollback-Daten gehen vollständig und endgültig verloren.
                                </p>
                            </div>

                            {/* Confirmation Footer */}
                            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#eaedf0] bg-[#fcfcfd]">
                                <PremiumButton
                                    variant="secondary"
                                    onClick={() => setShowClearConfirm(false)}
                                    disabled={clearAllLogs.isPending}
                                    className="h-[40px] px-4 rounded-xl text-[0.85rem]"
                                >
                                    Abbrechen
                                </PremiumButton>
                                <PremiumButton
                                    variant="danger"
                                    onClick={handleClearLogs}
                                    loading={clearAllLogs.isPending}
                                    className="h-[40px] px-4 rounded-xl text-[0.85rem]"
                                >
                                    Ja, leeren
                                </PremiumButton>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Modal subcomponent dealing with dynamic live state verification, write-collision assessment, and line-by-line diff formatting.
function InspectorModal({
    log,
    onClose,
    onRevert,
    revertPending,
}: {
    log: AuditLogType;
    onClose: () => void;
    onRevert: (id: string) => void;
    revertPending: boolean;
}) {
    const {
 action, entityType, entityId, details,
} = log;
    const oldValue = details?.oldValue;
    const newValue = details?.newValue;

    // Fetch current state of the database record to perform write-collision analysis
    const {
 data: currentDbState, isLoading: loadingDbState,
} = trpc.adminAudit.getCurrentState.useQuery(
        {
            entityType: entityType || '',
            entityId: entityId || '',
        },
        {
            enabled: !!entityType && !!entityId,
        },
    );

    // Calculate write collision indicators
    const collisionStatus = useMemo(() => {
        if (!entityType || !entityId) {
return {
 level: 'NONE',
text: '',
};
}

        if (action === 'CREATE') {
            if (currentDbState === null) {
                return {
                    level: 'WARNING',
                    text: 'Dieses Element wurde in der Zwischenzeit bereits gelöscht. Ein automatisches Entfernen erübrigt sich.',
                };
            }
            return {
                level: 'SAFE',
                text: 'Das Element existiert weiterhin in der Datenbank. Ein Rollback wird dieses Element löschen.',
            };
        }

        if (action === 'DELETE') {
            if (currentDbState !== null) {
                return {
                    level: 'DANGER',
                    text: 'Kollisionsgefahr: Es wurde bereits wieder ein Element mit derselben ID angelegt! Ein Revert wird fehlschlagen oder das neue Element überschreiben.',
                };
            }
            return {
                level: 'SAFE',
                text: 'Das Element ist gelöscht. Eine transaktionssichere Wiederherstellung ist gefahrlos möglich.',
            };
        }

        if (action === 'UPDATE') {
            if (currentDbState === null) {
                return {
                    level: 'DANGER',
                    text: 'Änderung nicht revertierbar: Das geänderte Element existiert nicht mehr in der Datenbank (gelöscht).',
                };
            }

            // Check if fields were modified since this action
            const cleanCurrent = {
 ...currentDbState,
};
            const cleanNew = {
 ...newValue,
};
            const ignoredKeys = [
 'updatedAt',
'createdAt',
];

            let hasPostChanges = false;
            for (const key of Object.keys(cleanNew)) {
                if (ignoredKeys.includes(key)) continue;
                if (typeof cleanNew[key] !== 'object' && cleanCurrent[key] !== undefined) {
                    if (cleanCurrent[key] !== cleanNew[key]) {
                        // Special check for date parsing
                        const isDateString = typeof cleanNew[key] === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(cleanNew[key]);
                        if (isDateString) {
                            if (new Date(cleanCurrent[key]).getTime() !== new Date(cleanNew[key]).getTime()) {
                                hasPostChanges = true;
                            }
                        }
 else {
                            hasPostChanges = true;
                        }
                    }
                }
            }

            if (hasPostChanges) {
                return {
                    level: 'WARNING',
                    text: 'Kollisionswarnung: Das Element wurde nach dieser Aktion erneut bearbeitet! Ein Zurücksetzen überschreibt neuere Änderungen.',
                };
            }

            return {
                level: 'SAFE',
                text: 'Keine Nachfolgeänderungen erkannt. Das Zurücksetzen auf den vorherigen Stand ist sicher.',
            };
        }

        return {
 level: 'NONE',
text: '',
};
    }, [
 action,
entityType,
entityId,
currentDbState,
newValue,
]);

    // Difference field generator
    const diffFields = useMemo(() => {
        if (action !== 'UPDATE') {
return [
];
}
        const ignoredKeys = [
 'createdAt',
'updatedAt',
'id',
'key',
'productId',
'specialPriceId',
'addonId',
];
        const allKeys = Array.from(new Set([
            ...Object.keys(oldValue || {
}),
            ...Object.keys(newValue || {
}),
        ])).filter(k => !ignoredKeys.includes(k));

        const list: { key: string; oldVal: any; newVal: any }[] = [
];
        for (const key of allKeys) {
            const oldV = oldValue?.[key];
            const newV = newValue?.[key];

            if (typeof oldV === 'object' || typeof newV === 'object') {
                if (JSON.stringify(oldV) !== JSON.stringify(newV)) {
                    list.push({
 key,
oldVal: oldV,
newVal: newV,
});
                }
            }
 else if (oldV !== newV) {
                list.push({
 key,
oldVal: oldV,
newVal: newV,
});
            }
        }
        return list;
    }, [
 action,
oldValue,
newValue,
]);

    // Check if eligible for rollback
    const isRevertible = useMemo(() => {
        if (action === 'REVERT') return false;
        if (log.revertedFromId) return false;
        if ([
 'LOGIN',
'LOGOUT',
].includes(action)) return false;
        if (collisionStatus.level === 'DANGER') return false;
        return true;
    }, [
 action,
log.revertedFromId,
collisionStatus.level,
]);

    // Format complex arrays/objects into readable text inside badges
    const formatValue = (val: any): string => {
        if (val === null || val === undefined) return 'null';
        if (typeof val === 'boolean') return val ? 'Aktiv / Ja' : 'Inaktiv / Nein';
        if (typeof val === 'object') {
            if (Array.isArray(val)) {
                return `[Liste mit ${val.length} Einträgen]`;
            }
            return JSON.stringify(val);
        }
        return String(val);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
                initial={{
 opacity: 0,
scale: 0.95,
y: 10,
}}
                animate={{
 opacity: 1,
scale: 1,
y: 0,
}}
                exit={{
 opacity: 0,
scale: 0.95,
y: 10,
}}
                transition={{
 duration: 0.2,
}}
                className="bg-white rounded-3xl shadow-2xl border border-[#eaedf0] w-full max-w-4xl overflow-hidden relative flex flex-col my-8 max-h-[85vh] text-left"
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#eaedf0] bg-[#fcfcfd]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#e20074]/10 text-[#e20074] shrink-0">
                            <ShieldAlert className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-[1.1rem] font-extrabold text-[#1a1a2e] m-0">Aktivitäts-Inspektor</h3>
                            <p className="text-[0.75rem] text-[#999] m-0 font-semibold uppercase tracking-wider">
                                {log.entityType ? (ENTITY_MAP[log.entityType] || log.entityType) : 'System'} • {log.action}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        type="button"
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[#888] hover:bg-[#f7f8fa] hover:text-[#1a1a2e] transition-colors cursor-pointer outline-none"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6 overflow-y-auto">
                    {/* Actor context grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-[#f7f8fa] border border-[#eaedf0] rounded-2xl p-4">
                            <h4 className="text-[0.7rem] font-extrabold text-[#bbb] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" /> Zeit & Aktion
                            </h4>
                            <div className="space-y-2 text-[0.82rem]">
                                <div className="flex justify-between">
                                    <span className="text-[#888]">Ereignis-Zeit:</span>
                                    <span className="font-bold text-[#1a1a2e]">
                                        {new Date(log.createdAt).toLocaleString('de-DE')}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#888]">System-ID:</span>
                                    <span className="font-mono text-slate-600 truncate max-w-[180px]">{log.id}</span>
                                </div>
                                {entityId && (
                                    <div className="flex justify-between">
                                        <span className="text-[#888]">Objekt-ID:</span>
                                        <span className="font-mono text-slate-600 truncate max-w-[180px] select-all">{entityId}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-[#f7f8fa] border border-[#eaedf0] rounded-2xl p-4">
                            <h4 className="text-[0.7rem] font-extrabold text-[#bbb] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5" /> Akteur-Kontext
                            </h4>
                            <div className="space-y-2 text-[0.82rem]">
                                <div className="flex justify-between">
                                    <span className="text-[#888]">E-Mail-Adresse:</span>
                                    <span className="font-bold text-slate-800">{log.userEmail || 'System / Cron'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#888]">Rolle / Rechte:</span>
                                    <span className="px-2 py-0.5 rounded text-[0.65rem] font-bold uppercase bg-slate-200 text-slate-700">
                                        {log.userRole || 'SYSTEM'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#888]">IP-Adresse:</span>
                                    <span className="font-mono font-semibold text-slate-600">{log.clientIp || 'Lokal'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Friendly Message */}
                    <div className="space-y-2">
                        <h4 className="text-[0.72rem] font-extrabold text-[#999] uppercase tracking-wider">Aktivitätsbeschreibung</h4>
                        <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl text-[0.88rem] text-slate-800 font-bold leading-relaxed">
                            {log.message}
                        </div>
                    </div>

                    {/* Collision Indicator Warners */}
                    {loadingDbState && (
                        <div className="flex items-center gap-2 p-3 bg-slate-50 border border-[#eaedf0] rounded-xl text-[0.8rem] text-slate-500 font-semibold animate-pulse">
                            <Loader2 className="w-4 h-4 animate-spin text-[#e20074]" />
                            <span>Überprüfe Datenbank auf Schreibkollisionen...</span>
                        </div>
                    )}
                    {!loadingDbState && collisionStatus.level !== 'NONE' && (
                        <div className={clsx(
                            'p-4 rounded-2xl border flex gap-3 text-[0.82rem] font-bold leading-relaxed',
                            collisionStatus.level === 'SAFE' && 'bg-emerald-50/50 border-emerald-200 text-emerald-950',
                            collisionStatus.level === 'WARNING' && 'bg-amber-50/50 border-amber-200 text-amber-950',
                            collisionStatus.level === 'DANGER' && 'bg-rose-50/50 border-rose-200 text-rose-950',
                        )}>
                            {collisionStatus.level === 'SAFE' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
                            {collisionStatus.level === 'WARNING' && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}
                            {collisionStatus.level === 'DANGER' && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />}
                            <div>
                                <span className="block font-black text-[0.85rem] mb-0.5">
                                    {collisionStatus.level === 'SAFE' && 'Rollback-Status: Bereit'}
                                    {collisionStatus.level === 'WARNING' && 'Rollback-Status: Warnung'}
                                    {collisionStatus.level === 'DANGER' && 'Rollback-Status: Gesperrt'}
                                </span>
                                {collisionStatus.text}
                            </div>
                        </div>
                    )}

                    {/* Visual Diff comparisons */}
                    {action === 'CREATE' && newValue && (
                        <div className="space-y-2">
                            <h4 className="text-[0.72rem] font-extrabold text-[#999] uppercase tracking-wider">Erstellte Feldattribute</h4>
                            <div className="border border-emerald-100 rounded-2xl overflow-hidden bg-emerald-50/20 divide-y divide-emerald-100/50">
                                {Object.entries(newValue)
                                    .filter(([
 k,
v,
]) => v !== null && v !== undefined && k !== 'id' && k !== 'createdAt' && k !== 'updatedAt')
                                    .map(([
 key,
val,
]) => (
                                        <div key={key} className="p-3 flex justify-between text-[0.8rem] hover:bg-emerald-50/40 transition-colors">
                                            <span className="font-mono text-emerald-800 font-bold">{key}:</span>
                                            <span className="font-bold text-emerald-950">{formatValue(val)}</span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

                    {action === 'DELETE' && oldValue && (
                        <div className="space-y-2">
                            <h4 className="text-[0.72rem] font-extrabold text-[#999] uppercase tracking-wider">Gelöschte Feldattribute</h4>
                            <div className="border border-rose-100 rounded-2xl overflow-hidden bg-rose-50/20 divide-y divide-rose-100/50">
                                {Object.entries(oldValue)
                                    .filter(([
 k,
v,
]) => v !== null && v !== undefined && k !== 'createdAt' && k !== 'updatedAt')
                                    .map(([
 key,
val,
]) => (
                                        <div key={key} className="p-3 flex justify-between text-[0.8rem] hover:bg-rose-50/40 transition-colors">
                                            <span className="font-mono text-rose-800 font-bold">{key}:</span>
                                            <span className="font-bold text-rose-950 line-through decoration-rose-500/55">{formatValue(val)}</span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

                    {action === 'UPDATE' && diffFields.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-[0.72rem] font-extrabold text-[#999] uppercase tracking-wider">Geänderte Felder (Feld-Diff)</h4>
                            <div className="border border-amber-100/70 rounded-2xl overflow-hidden divide-y divide-amber-100/40">
                                {diffFields.map(({
 key, oldVal, newVal,
}) => (
                                    <div key={key} className="p-4 grid grid-cols-1 md:grid-cols-3 gap-2 items-center text-[0.8rem] bg-amber-50/5 hover:bg-amber-50/20 transition-colors">
                                        <span className="font-mono font-extrabold text-amber-800">{key}:</span>
                                        <div className="px-3 py-1.5 bg-rose-50 border border-rose-100/50 rounded-xl text-rose-950 font-bold flex items-center gap-1">
                                            <span className="line-through decoration-rose-500/40">{formatValue(oldVal)}</span>
                                        </div>
                                        <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-100/50 rounded-xl text-emerald-950 font-bold flex items-center gap-1.5">
                                            <ArrowRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                            <span>{formatValue(newVal)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Standard JSON details printout if no fields matches or login/logout details exist */}
                    {((action !== 'CREATE' && action !== 'DELETE' && action !== 'UPDATE') || (action === 'UPDATE' && diffFields.length === 0)) && details && (
                        <div className="space-y-2">
                            <h4 className="text-[0.72rem] font-extrabold text-[#999] uppercase tracking-wider">Erweiterte Metadaten</h4>
                            <pre className="bg-[#1a1a2e] text-[#a5b4fc] p-5 rounded-2xl overflow-x-auto text-[0.78rem] font-mono leading-relaxed max-h-[220px] border border-[#eaedf0]/10 shadow-inner">
                                {JSON.stringify(details, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-[#eaedf0] bg-[#fcfcfd]">
                    <div className="text-[0.75rem] font-bold text-[#bbb]">
                        {log.revertedFromId ? (
                            <span className="flex items-center gap-1 text-[#e20074]">
                                <Undo2 className="w-3.5 h-3.5" /> Bereits zurückgesetzt
                            </span>
                        ) : (
                            'Audit-Verfahren lückenlos protokolliert'
                        )}
                    </div>
                    <div className="flex gap-3">
                        <PremiumButton
                            variant="secondary"
                            onClick={onClose}
                            className="h-[44px] px-6 rounded-xl text-[0.8rem] font-bold"
                        >
                            Schließen
                        </PremiumButton>

                        {isRevertible && (
                            <PremiumButton
                                variant="primary"
                                onClick={() => onRevert(log.id)}
                                loading={revertPending}
                                className="h-[44px] px-6 rounded-xl text-[0.8rem] font-bold gap-1.5"
                                style={{
 backgroundColor: '#e20074',
}}
                            >
                                <Undo2 className="w-4 h-4" />
                                Aktion rückgängig machen
                            </PremiumButton>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
