import {
    hasPermission,
} from './permissions';

export interface SessionUser {
    id: string;
    email?: string;
    role: string;
    isEditor: boolean;
    odRegionId?: string | null;
    locationId?: string | null;
    teamId?: string | null;
    effectiveOdRegionId?: string | null;
    effectiveLocationId?: string | null;
}

export const ROLE_RANKS = {
    ADMIN: 4,
    OD_MANAGER: 3,
    LOCATION_MANAGER: 2,
    TEAM_LEADER: 1,
    USER: 0,
} as const;

export type Role = keyof typeof ROLE_RANKS;

export function hasRole(user: SessionUser | undefined | null, role: Role): boolean {
    if (!user || !user.role) return false;
    const userRank = ROLE_RANKS[user.role as Role] || 0;
    const requiredRank = ROLE_RANKS[role];
    return userRank >= requiredRank;
}

// ------------------------------------------------------------------
// FILTERS (For listing data, returns Prisma 'where' clauses)
// ------------------------------------------------------------------

export function getOdRegionFilter(user: SessionUser | undefined | null) {
    if (!user || user.role === 'USER') {
        return {
            isActive: true,
        };
    }
    if (hasRole(user, 'ADMIN')) {
        return {};
    }
    
    // Managers are permitted to read structural regions to populate selection items on forms.
    // Since visibility doesn't grant mutational rights, allowing them to pull active items is perfect.
    if (hasRole(user, 'TEAM_LEADER')) {
        return {
            isActive: true,
        };
    }

    const odId = user.effectiveOdRegionId || user.odRegionId;
    if (odId) {
        return {
            id: odId,
        };
    }
    return {
        id: 'UNAUTHORIZED',
    };
}

export function getLocationFilter(user: SessionUser | undefined | null) {
    // Base users get active locations (e.g., for generic catalog views)
    if (!user || user.role === 'USER') {
        return {
            isActive: true,
        };
    }
    
    // Admins see everything
    if (hasRole(user, 'ADMIN')) {
        return {};
    }

    // OD Managers are scoped to locations within their region
    const odId = user.effectiveOdRegionId || user.odRegionId;
    if (user.role === 'OD_MANAGER' && odId) {
        return {
            odRegionId: odId,
        };
    }

    // Location Managers and Team Leaders are scoped to their specific location
    const locId = user.effectiveLocationId || user.locationId;
    if (locId) {
        return {
            id: locId,
        };
    }

    // ELEGANT FALLBACK: If a manager (TEAM_LEADER or above) is querying locations 
    // to populate a form dropdown but lacks an explicit locId in their session,
    // allow them to read active locations. 
    // (Mutations remain strictly protected by withHierarchicalScope)
    if (hasRole(user, 'TEAM_LEADER')) {
        return {
            isActive: true,
        };
    }

    // Strict deny for any corrupted states that don't match the above
    return {
        id: 'UNAUTHORIZED',
    };
}

export function getTeamFilter(user: SessionUser | undefined | null) {
    if (!user || user.role === 'USER') {
        return {
            isActive: true,
        };
    }

    if (hasRole(user, 'ADMIN')) {
        return {};
    }

    const odId = user.effectiveOdRegionId || user.odRegionId;
    const locId = user.effectiveLocationId || user.locationId;

    if (user.role === 'OD_MANAGER' && odId) {
        return {
            location: {
                odRegionId: odId,
            },
        };
    }

    if (user.role === 'LOCATION_MANAGER' && locId) {
        return {
            locationId: locId,
        };
    }

    // Explicit scope: If they have a teamId, return exactly their team.
    if (user.role === 'TEAM_LEADER' && user.teamId) {
        return {
            id: user.teamId,
        };
    }

    // ELEGANT FALLBACK: If a manager (TEAM_LEADER or above) lacks an explicit teamId 
    // in their session (e.g., role was changed for testing), scope them to their location 
    // or allow active teams to prevent form crashes.
    if (hasRole(user, 'TEAM_LEADER')) {
        if (locId) {
            return { locationId: locId };
        }
        return { isActive: true };
    }

    return {
        id: 'UNAUTHORIZED',
    };
}

export function getNewsVisibilityFilter(user: SessionUser | undefined | null) {
    if (!user) {
        return {
            id: 'UNAUTHORIZED',
        };
    }

    const orConditions: any[] = [
        {
            odRegionId: null,
            locationId: null,
            teamId: null,
        }, // Global News
    ];

    const odId = user.effectiveOdRegionId || user.odRegionId;
    const locId = user.effectiveLocationId || user.locationId;

    if (odId) {
        orConditions.push({
            odRegionId: odId,
            locationId: null,
            teamId: null,
        });
    }
    if (locId) {
        orConditions.push({
            locationId: locId,
            teamId: null,
        });
    }
    if (user.teamId) {
        orConditions.push({
            teamId: user.teamId,
        });
    }

    return {
        OR: orConditions,
    };
}

export function isNewsVisible(user: SessionUser | undefined | null, news: { odRegionId?: string | null, locationId?: string | null, teamId?: string | null }): boolean {
    if (!user) return false;

    const isGlobal = !news.odRegionId && !news.locationId && !news.teamId;
    if (isGlobal) return true;

    if (news.teamId && user.teamId && news.teamId === user.teamId) return true;

    const odId = user.effectiveOdRegionId || user.odRegionId;
    const locId = user.effectiveLocationId || user.locationId;

    if (news.locationId && locId && news.locationId === locId && !news.teamId) return true;
    if (news.odRegionId && odId && news.odRegionId === odId && !news.locationId && !news.teamId) return true;

    return false;
}

export function getUserFilter(user: SessionUser | undefined | null) {
    if (!user) {
        return {
            id: 'UNAUTHORIZED',
        };
    }
    if (hasRole(user, 'ADMIN')) {
        return {
        };
    }
    if (user.role === 'OD_MANAGER' && user.odRegionId) {
        return {
            role: {
 notIn: [
 'ADMIN',
'OD_MANAGER',
],
},
            OR: [
                {
                    odRegionId: user.odRegionId,
                },
                {
                    location: {
                        odRegionId: user.odRegionId,
                    },
                },
                {
                    team: {
                        location: {
                            odRegionId: user.odRegionId,
                        },
                    },
                },
            ],
        };
    }
    if (user.role === 'LOCATION_MANAGER' && user.locationId) {
        return {
            role: {
 notIn: [
 'ADMIN',
'OD_MANAGER',
'LOCATION_MANAGER',
],
},
            OR: [
                {
                    locationId: user.locationId,
                },
                {
                    team: {
                        locationId: user.locationId,
                    },
                },
            ],
        };
    }
    if (hasPermission(user.role, 'users:read')) {
        return {
        };
    }
    return {
        id: user.id,
    };
}

// ------------------------------------------------------------------
// ACTIONS (For create/update/delete checks)
// ------------------------------------------------------------------

export function canEditTeam(user: SessionUser | undefined | null, targetLocationId?: string | null, targetTeamId?: string | null): boolean {
    if (!user) return false;
    if (hasRole(user, 'ADMIN')) return true;
    if (!hasPermission(user.role, 'teams:manage')) return false;

    if (user.role === 'OD_MANAGER') {
        return true;
    }
    if (user.role === 'LOCATION_MANAGER') {
        const locId = user.effectiveLocationId || user.locationId;
        if (!locId) return false;
        if (targetLocationId && targetLocationId !== locId) return false;
        return true;
    }
    if (user.role === 'TEAM_LEADER') {
        if (!user.teamId) return false;
        if (targetTeamId && targetTeamId !== user.teamId) return false;
        return true;
    }
    return false;
}

export function canManageLocation(user: SessionUser, targetLocationOdRegionId?: string | null): boolean {
    if (hasRole(user, 'ADMIN')) return true;
    if (!hasPermission(user.role, 'locations:manage')) return false;

    if (user.role === 'OD_MANAGER') {
        const odId = user.effectiveOdRegionId || user.odRegionId;
        if (!odId) return false;
        if (targetLocationOdRegionId && targetLocationOdRegionId !== odId) return false;
        return true;
    }
    if (user.role === 'LOCATION_MANAGER') {
        return true;
    }
    return false;
}

export function canCreateNews(user: SessionUser, scope: { odRegionId?: string | null, locationId?: string | null, teamId?: string | null }): boolean {
    if (hasRole(user, 'ADMIN')) return true;
    if (!hasPermission(user.role, 'news:create')) return false;

    const userOdId = user.effectiveOdRegionId || user.odRegionId;
    const userLocId = user.effectiveLocationId || user.locationId;

    if (user.role === 'OD_MANAGER') {
        if (!userOdId) return false;
        if (!scope.odRegionId && !scope.locationId && !scope.teamId) return false;
        if (scope.odRegionId && scope.odRegionId !== userOdId) return false;
        return true;
    }

    if (user.role === 'LOCATION_MANAGER') {
        if (!userLocId) return false;
        if (!scope.locationId && !scope.teamId) return false;
        if (scope.odRegionId) return false;
        if (scope.locationId && scope.locationId !== userLocId) return false;
        return true;
    }

    if (user.role === 'TEAM_LEADER') {
        if (!user.teamId) return false;
        if (scope.odRegionId || scope.locationId) return false;
        if (scope.teamId !== user.teamId) return false;
        return true;
    }

    return false;
}

export function canManageUser(currentUser: SessionUser, targetRole: string, targetOdRegionId?: string | null, targetLocationId?: string | null): boolean {
    if (hasRole(currentUser, 'ADMIN')) return true;
    if (!hasPermission(currentUser.role, 'users:write')) return false;

    const currentRank = ROLE_RANKS[currentUser.role as Role] || 0;
    const targetRank = ROLE_RANKS[targetRole as Role] || 0;

    if (targetRank >= currentRank) return false;

    if (currentUser.role === 'OD_MANAGER') {
        const odId = currentUser.effectiveOdRegionId || currentUser.odRegionId;
        if (!odId) return false;
        if (!targetOdRegionId || targetOdRegionId !== odId) return false;
        return true;
    }

    if (currentUser.role === 'LOCATION_MANAGER') {
        const locId = currentUser.effectiveLocationId || currentUser.locationId;
        if (!locId) return false;
        if (!targetLocationId || targetLocationId !== locId) return false;
        return true;
    }

    return false;
}
