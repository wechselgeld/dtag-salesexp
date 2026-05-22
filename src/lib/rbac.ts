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
        return {
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
    if (!user || user.role === 'USER') {
        return {
            isActive: true,
        };
    }
    if (hasRole(user, 'ADMIN')) {
        return {
        };
    }
    const odId = user.effectiveOdRegionId || user.odRegionId;
    const locId = user.effectiveLocationId || user.locationId;
    if (user.role === 'OD_MANAGER' && odId) {
        return {
            odRegionId: odId,
        };
    }
    if (user.role === 'LOCATION_MANAGER' && locId) {
        return {
            id: locId,
        };
    }
    if (locId) {
        return {
            id: locId,
        };
    }
    return {
        id: 'UNAUTHORIZED',
    };
}

export function getTeamFilter(user: SessionUser | undefined | null) {
    if (!user || user.role === 'USER') {
        return {
        };
    }
    if (hasRole(user, 'ADMIN')) {
        return {
        };
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
    if (user.role === 'TEAM_LEADER' && user.teamId) {
        return {
            id: user.teamId,
        };
    }
    if (user.teamId) {
        return {
            id: user.teamId,
        };
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

    if (user.odRegionId) {
        orConditions.push({
            odRegionId: user.odRegionId,
            locationId: null,
            teamId: null,
        });
    }
    if (user.locationId) {
        orConditions.push({
            locationId: user.locationId,
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

    if (news.locationId && user.locationId && news.locationId === user.locationId && !news.teamId) return true;
    if (news.odRegionId && user.odRegionId && news.odRegionId === user.odRegionId && !news.locationId && !news.teamId) return true;

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
            role: { notIn: ['ADMIN', 'OD_MANAGER'] },
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
            role: { notIn: ['ADMIN', 'OD_MANAGER', 'LOCATION_MANAGER'] },
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
        if (!user.locationId) return false;
        if (targetLocationId && targetLocationId !== user.locationId) return false;
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
        if (!user.odRegionId) return false;
        if (targetLocationOdRegionId && targetLocationOdRegionId !== user.odRegionId) return false;
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

    if (user.role === 'OD_MANAGER') {
        if (!user.odRegionId) return false;
        if (!scope.odRegionId && !scope.locationId && !scope.teamId) return false;
        if (scope.odRegionId && scope.odRegionId !== user.odRegionId) return false;
        return true;
    }

    if (user.role === 'LOCATION_MANAGER') {
        if (!user.locationId) return false;
        if (!scope.locationId && !scope.teamId) return false;
        if (scope.odRegionId) return false;
        if (scope.locationId && scope.locationId !== user.locationId) return false;
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
        if (!currentUser.odRegionId) return false;
        if (!targetOdRegionId || targetOdRegionId !== currentUser.odRegionId) return false;
        return true;
    }

    if (currentUser.role === 'LOCATION_MANAGER') {
        if (!currentUser.locationId) return false;
        if (!targetLocationId || targetLocationId !== currentUser.locationId) return false;
        return true;
    }

    return false;
}
