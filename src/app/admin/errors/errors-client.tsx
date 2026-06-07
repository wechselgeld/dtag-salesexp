'use client';

import {
    useState, useMemo, useEffect, useRef,
} from 'react';
import {
    trpc,
} from '@/lib/trpc';
import {
    Terminal,
    X,
    Copy,
    Check,
    Loader2,
    ShieldAlert,
    Trash2,
    Activity,
    Calendar,
    User,
    Globe,
    Lock,
    AlertTriangle,
    ChevronRight,
    RefreshCw,
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

interface ErrorLogType {
    id: string;
    traceId: string;
    path: string | null;
    type: string | null;
    message: string;
    stack?: string | null;
    details?: any;
    userId: string | null;
    userEmail: string | null;
    userRole: string | null;
    clientIp: string | null;
    createdAt: string | Date;
}

export default function ErrorsClient() {
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
] = useState<ErrorLogType | null>(null);
    const [
 showClearConfirm,
setShowClearConfirm,
] = useState(false);
    const [
 copiedId,
setCopiedId,
] = useState<string | null>(null);

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

    const {
        data,
        isLoading,
        isFetching,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = trpc.adminErrors.list.useInfiniteQuery(
        {
            limit: 50,
            search: debouncedSearch,
            type: activeFilterId,
        },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        },
    );

    const clearAllLogs = trpc.adminErrors.clearAll.useMutation({
        onSuccess: () => {
            utils.adminErrors.list.invalidate();
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

    const handleCopy = (e: React.MouseEvent, text: string, key: string) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopiedId(key);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleClearLogs = async () => {
        await clearAllLogs.mutateAsync();
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Header with Clear Action */}
            <AdminPageHeader
                title="Fehlerprotokoll"
                subtitle="Detaillierte Einsicht in Systemausnahmen, Berechtigungskonflikte und API-Traces."
                backHref="/admin"
                action={
                    <div className="flex gap-3">
                        <PremiumButton
                            variant="secondary"
                            onClick={() => utils.adminErrors.list.invalidate()}
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
                                Protokoll leeren
                            </PremiumButton>
                        )}
                    </div>
                }
            />

            {/* Info Card copy style */}
            <div className="bg-[#f7f8fa] border border-[#eaedf0] p-4 rounded-2xl flex items-center justify-between shadow-sm">
                <p className="text-[0.85rem] text-[#666] m-0 leading-relaxed">
                    <strong>Tipp:</strong> Jede Aktion wird serverseitig mit einer eindeutigen Trace ID versehen. Bei Fehlermeldungen im Frontend kann diese ID hier gesucht werden, um die genauen Fehlerursachen und Sicherheits-Scopes sofort zu analysieren.
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
                        placeholder="Fehler suchen nach Trace ID, Nachricht, API-Pfad, E-Mail..."
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

                {/* Filter Bubbles */}
                <ScrollableFilterRow>
                    {[
                        {
 id: 'ALL',
label: 'Alle Einträge',
icon: Activity,
color: '#1a1a2e',
},
                        {
 id: 'PERMISSION_DENIED',
label: 'Keine Berechtigung',
icon: Lock,
color: '#e20074',
},
                        {
 id: 'SCOPE_MISMATCH',
label: 'Bereichsfehler',
icon: Globe,
color: '#ff6b00',
},
                        {
 id: 'UNAUTHORIZED',
label: 'Nicht autorisiert',
icon: User,
color: '#64748b',
},
                        {
 id: 'INTERNAL_SERVER_ERROR',
label: 'Systemabstürze',
icon: AlertTriangle,
color: '#dc2626',
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

            {/* Main Interactive Table */}
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
                            <Terminal className="w-6 h-6 text-[#ccc]" />
                        </div>
                        <h3 className="text-[1.1rem] font-bold text-[#1a1a2e] mb-1">
                            Keine Protokolleinträge
                        </h3>
                        <p className="text-[0.85rem] text-[#999] max-w-[320px] m-0 mb-4 leading-relaxed">
                            Es wurden keine Fehlerprotokolle {searchQuery || activeFilterId !== 'ALL' ? 'für die ausgewählten Suchfilter' : 'im System'} gefunden.
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
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-[#eaedf0] bg-[#fcfcfd]">
                                    <th className="px-6 py-4 font-bold text-[#aaa] text-[0.72rem] uppercase tracking-wider">
                                        Zeitstempel
                                    </th>
                                    <th className="px-6 py-4 font-bold text-[#aaa] text-[0.72rem] uppercase tracking-wider">
                                        Trace ID
                                    </th>
                                    <th className="px-6 py-4 font-bold text-[#aaa] text-[0.72rem] uppercase tracking-wider">
                                        Typ / API-Pfad
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
                                {logs.map((log: ErrorLogType) => {
                                    const isPermError = log.type === 'PERMISSION_DENIED';
                                    const isScopeError = log.type === 'SCOPE_MISMATCH';
                                    const isUnauthError = log.type === 'UNAUTHORIZED';
                                    const isInternalError = log.type === 'INTERNAL_SERVER_ERROR' || log.type === 'UNKNOWN';

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
                                                <button
                                                    onClick={(e) => handleCopy(e, log.traceId, log.id)}
                                                    className="px-2.5 py-1 bg-slate-50 text-[#1a1a2e] font-mono text-[0.72rem] font-bold rounded-lg border border-[#eaedf0] select-all cursor-pointer hover:bg-slate-100 hover:border-slate-300 transition-all flex items-center gap-1 w-fit outline-none"
                                                    title="Trace ID kopieren"
                                                >
                                                    {copiedId === log.id ? (
                                                        <Check className="w-3 h-3 text-emerald-500 shrink-0 animate-scale-up" />
                                                    ) : (
                                                        <Copy className="w-3 h-3 text-[#bbb] group-hover:text-[#e20074] shrink-0" />
                                                    )}
                                                    <span>{log.traceId}</span>
                                                </button>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col gap-1.5">
                                                    <span className={clsx(
                                                        'text-[0.6rem] font-bold px-2 py-0.5 rounded-md inline-block w-fit uppercase tracking-wider',
                                                        isPermError && 'bg-[#e20074]/10 text-[#e20074] border border-[#e20074]/20',
                                                        isScopeError && 'bg-orange-50 text-orange-600 border border-orange-200/50',
                                                        isUnauthError && 'bg-slate-100 text-slate-700 border border-slate-200/50',
                                                        isInternalError && 'bg-red-50 text-red-600 border border-red-200/50',
                                                    )}>
                                                        {log.type || 'EXZEPTION'}
                                                    </span>
                                                    <span className="text-[0.8rem] text-[#1a1a2e] font-mono leading-none font-bold">
                                                        {log.path || 'unbekannt'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col">
                                                    {log.userEmail ? (
                                                        <>
                                                            <span className="text-[0.85rem] font-bold text-[#1a1a2e]">
                                                                {log.userEmail}
                                                            </span>
                                                            <span className="text-[0.68rem] text-[#888] font-semibold uppercase tracking-wider mt-0.5">
                                                                Rolle: {log.userRole || 'USER'}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-[0.8rem] text-[#bbb] italic">
                                                            Nicht angemeldet
                                                        </span>
                                                    )}
                                                    {log.clientIp && (
                                                        <span className="text-[0.65rem] text-[#ccc] font-mono mt-0.5">
                                                            IP: {log.clientIp}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 max-w-[320px] truncate text-[0.82rem] text-[#555] font-medium">
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

            {/* Diagnostic Inspector Modal */}
            <AnimatePresence>
                {selectedLog && (
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
                            className="bg-white rounded-3xl shadow-2xl border border-[#eaedf0] w-full max-w-4xl overflow-hidden relative flex flex-col my-8 max-h-[85vh]"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-[#eaedf0] bg-[#fcfcfd]">
                                <div className="flex items-center gap-3">
                                    <div className={clsx(
                                        'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                                        selectedLog.type === 'PERMISSION_DENIED' && 'bg-[#e20074]/10 text-[#e20074]',
                                        selectedLog.type === 'SCOPE_MISMATCH' && 'bg-orange-100 text-orange-600',
                                        (selectedLog.type === 'INTERNAL_SERVER_ERROR' || selectedLog.type === 'UNKNOWN') && 'bg-red-100 text-red-600',
                                        selectedLog.type === 'UNAUTHORIZED' && 'bg-slate-100 text-slate-700',
                                    )}>
                                        <ShieldAlert className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-[1.1rem] font-extrabold text-[#1a1a2e] m-0">Diagnose-Protokoll</h3>
                                        <p className="text-[0.75rem] text-[#999] m-0 font-medium">Laufzeit-Analysator und Scope-Auswertung</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedLog(null)}
                                    type="button"
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#888] hover:bg-[#f7f8fa] hover:text-[#1a1a2e] transition-colors cursor-pointer outline-none"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Body (Scrollable) */}
                            <div className="p-6 space-y-6 overflow-y-auto">
                                {/* Core Info grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-[#f7f8fa] border border-[#eaedf0] rounded-2xl p-4 text-left">
                                        <h4 className="text-[0.7rem] font-bold text-[#bbb] uppercase tracking-wider mb-2">Systemparameter</h4>
                                        <div className="space-y-2 text-[0.82rem]">
                                            <div className="flex justify-between">
                                                <span className="text-[#888]">Trace ID:</span>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-mono font-bold text-[#1a1a2e]">{selectedLog.traceId}</span>
                                                    <button
                                                        onClick={(e) => handleCopy(e, selectedLog.traceId, 'inspector-trace')}
                                                        className="p-1 text-[#ccc] hover:text-[#e20074] rounded-md transition-colors"
                                                        title="Trace ID kopieren"
                                                    >
                                                        {copiedId === 'inspector-trace' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[#888]">Fehlertyp:</span>
                                                <span className="font-bold text-[#1a1a2e]">{selectedLog.type || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[#888]">API-Prozedur:</span>
                                                <span className="font-mono font-bold text-slate-800">{selectedLog.path || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[#888]">Zeitstempel:</span>
                                                <span className="font-medium text-slate-800">
                                                    {new Date(selectedLog.createdAt).toLocaleString('de-DE')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-[#f7f8fa] border border-[#eaedf0] rounded-2xl p-4 text-left">
                                        <h4 className="text-[0.7rem] font-bold text-[#bbb] uppercase tracking-wider mb-2">Benutzerkontext</h4>
                                        <div className="space-y-2 text-[0.82rem]">
                                            <div className="flex justify-between">
                                                <span className="text-[#888]">Benutzer-ID:</span>
                                                <span className="font-mono text-slate-800 truncate max-w-[200px]" title={selectedLog.userId || 'Gast'}>
                                                    {selectedLog.userId || 'Gast'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[#888]">E-Mail-Adresse:</span>
                                                <span className="font-bold text-slate-800">{selectedLog.userEmail || 'Nicht angemeldet'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[#888]">Aktive Rolle:</span>
                                                <span className="px-2 py-0.5 rounded text-[0.7rem] font-extrabold uppercase bg-slate-200 text-slate-800">
                                                    {selectedLog.userRole || 'GUEST'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[#888]">Client-IP:</span>
                                                <span className="font-mono font-semibold text-slate-700">{selectedLog.clientIp || 'Lokal / Unbekannt'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Message */}
                                <div className="space-y-2 text-left">
                                    <h4 className="text-[0.75rem] font-bold text-[#999] uppercase tracking-wider">Fehlermeldung</h4>
                                    <div className="p-4 bg-red-50/50 border border-red-100 rounded-2xl text-[0.9rem] text-red-950 font-bold leading-relaxed">
                                        {selectedLog.message}
                                    </div>
                                </div>

                                {/* Structured Cause Details (JSON metadata) */}
                                {selectedLog.details && (
                                    <div className="space-y-2 text-left">
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-[0.75rem] font-bold text-[#999] uppercase tracking-wider">Scoping- und Sicherheitsdetails (details)</h4>
                                            <button
                                                onClick={(e) => handleCopy(e, JSON.stringify(selectedLog.details, null, 2), 'inspector-details')}
                                                className="text-[0.75rem] font-semibold text-[#666] hover:text-[#e20074] flex items-center gap-1 transition-colors"
                                            >
                                                {copiedId === 'inspector-details' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                                Details kopieren
                                            </button>
                                        </div>
                                        <pre className="bg-[#1a1a2e] text-[#a5b4fc] p-5 rounded-2xl overflow-x-auto text-[0.8rem] font-mono leading-relaxed max-h-[300px] border border-[#eaedf0]/10 shadow-inner">
                                            {JSON.stringify(selectedLog.details, null, 2)}
                                        </pre>
                                    </div>
                                )}

                                {/* Call Stack (Stacktrace) */}
                                {selectedLog.stack && (
                                    <div className="space-y-2 text-left">
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-[0.75rem] font-bold text-[#999] uppercase tracking-wider">Server-Stacktrace (stack)</h4>
                                            <button
                                                onClick={(e) => handleCopy(e, selectedLog.stack || '', 'inspector-stack')}
                                                className="text-[0.75rem] font-semibold text-[#666] hover:text-[#e20074] flex items-center gap-1 transition-colors"
                                            >
                                                {copiedId === 'inspector-stack' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                                Stacktrace kopieren
                                            </button>
                                        </div>
                                        <pre className="bg-[#111] text-[#f43f5e] p-5 rounded-2xl overflow-x-auto text-[0.74rem] font-mono leading-normal max-h-[350px] border border-red-950/20 shadow-inner">
                                            {selectedLog.stack}
                                        </pre>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#eaedf0] bg-[#fcfcfd]">
                                <PremiumButton
                                    variant="secondary"
                                    onClick={() => setSelectedLog(null)}
                                    className="h-[44px] px-6 rounded-xl"
                                >
                                    Schließen
                                </PremiumButton>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Clear Logs Sudo-like Confirmation Modal */}
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
                                    <h3 className="text-[1.15rem] font-extrabold text-[#1a1a2e] m-0">Protokoll leeren?</h3>
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
                                    Bist Du sicher, dass Du das gesamte Fehlerprotokoll unwiderruflich leeren möchtest? Alle gespeicherten Traces und Diagnosedaten werden unwiderruflich aus der Datenbank gelöscht.
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
