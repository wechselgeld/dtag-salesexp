export interface SessionUser {
    id: string;
    email?: string;
    role: string;
    isEditor: boolean;
    odRegionId?: string | null;
    locationId?: string | null;
    teamId?: string | null;
}

const ROLE_RANKS = {
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
    if (!user) return { id: 'UNAUTHORIZED' };
    if (hasRole(user, 'ADMIN')) return {};
    if (user.role === 'OD_MANAGER' && user.odRegionId) {
        return { id: user.odRegionId };
    }
    // LOWER ROLES CANNOT LIST ALL OD REGIONS BUT MIGHT SEE THEIR OWN
    if (user.odRegionId) {
        return { id: user.odRegionId };
    }
    return { id: 'UNAUTHORIZED' };
}

export function getLocationFilter(user: SessionUser | undefined | null) {
    if (!user) return { id: 'UNAUTHORIZED' };
    if (hasRole(user, 'ADMIN')) return {};
    if (user.role === 'OD_MANAGER' && user.odRegionId) {
        return { odRegionId: user.odRegionId };
    }
    if (user.role === 'LOCATION_MANAGER' && user.locationId) {
        return { id: user.locationId };
    }
    if (user.locationId) {
        return { id: user.locationId };
    }
    return { id: 'UNAUTHORIZED' };
}

export function getTeamFilter(user: SessionUser | undefined | null) {
    if (!user) return { id: 'UNAUTHORIZED' };
    if (hasRole(user, 'ADMIN')) return {};
    if (user.role === 'OD_MANAGER' && user.odRegionId) {
        return { location: { odRegionId: user.odRegionId } };
    }
    if (user.role === 'LOCATION_MANAGER' && user.locationId) {
        return { locationId: user.locationId };
    }
    if (user.role === 'TEAM_LEADER' && user.teamId) {
        return { id: user.teamId };
    }
    if (user.teamId) {
        return { id: user.teamId };
    }
    return { id: 'UNAUTHORIZED' };
}

export function getNewsVisibilityFilter(user: SessionUser | undefined | null) {
    if (!user) return { id: 'UNAUTHORIZED' };
    if (hasRole(user, 'ADMIN')) return {};

    const orConditions: any[] = [
        { odRegionId: null, locationId: null, teamId: null }, // Global News
    ];

    if (user.odRegionId) {
        orConditions.push({ odRegionId: user.odRegionId, locationId: null, teamId: null });
    }
    if (user.locationId) {
        orConditions.push({ locationId: user.locationId, teamId: null });
    }
    if (user.teamId) {
        orConditions.push({ teamId: user.teamId });
    }

    return { OR: orConditions };
}

/**
 * Checks if a news item is visible to a user.
 * Used for real-time updates (SSE/Subscriptions) to mirror Prisma filtering.
 */
export function isNewsVisible(user: SessionUser | undefined | null, news: { odRegionId?: string | null, locationId?: string | null, teamId?: string | null }): boolean {
    if (!user) return false;
    if (hasRole(user, 'ADMIN')) return true;

    // Global News - explicitly check that ALL target fields are null or undefined
    const isGlobal = !news.odRegionId && !news.locationId && !news.teamId;
    if (isGlobal) return true;

    // Target Check - use strict comparison and ensure IDs exist
    if (news.teamId && user.teamId && news.teamId === user.teamId) return true;
    
    // For location/region news, they must NOT have a more specific target (teamId/locationId)
    if (news.locationId && user.locationId && news.locationId === user.locationId && !news.teamId) return true;
    if (news.odRegionId && user.odRegionId && news.odRegionId === user.odRegionId && !news.locationId && !news.teamId) return true;

    return false;
}

export function getUserFilter(user: SessionUser | undefined | null) {
    if (!user) return { id: 'UNAUTHORIZED' };
    if (hasRole(user, 'ADMIN')) return {};
    if (user.role === 'OD_MANAGER' && user.odRegionId) {
        return {
            OR: [
                { odRegionId: user.odRegionId },
                { location: { odRegionId: user.odRegionId } },
            ]
        };
    }
    if (user.role === 'LOCATION_MANAGER' && user.locationId) {
        return { locationId: user.locationId };
    }
    // TEAM LEADER CANNOT LIST USERS
    return { id: user.id }; // Can only see themselves
}

// ------------------------------------------------------------------
// ACTIONS (For create/update/delete checks)
// ------------------------------------------------------------------

export function canEditTeam(user: SessionUser | undefined | null, targetLocationId?: string | null, targetTeamId?: string | null): boolean {
    if (!user) return false;
    if (hasRole(user, 'ADMIN')) return true;
    
    // For updating an existing team where we know its ID
    if (targetTeamId && user.role === 'TEAM_LEADER' && user.teamId === targetTeamId) return true;
    
    // For creating/updating where we know the location it belongs to
    if (targetLocationId) {
        if (user.role === 'LOCATION_MANAGER' && user.locationId === targetLocationId) return true;
        // OD Managers check is trickier if we only have targetLocationId, because we don't know the OD of that location here.
        // We usually need to fetch the location first to check its odRegionId, OR the caller fetches it and uses another function.
        // For simplicity, we'll assume the caller passes the odRegionId of the location if checking OD Manager.
    }
    
    return false;
}

// A more robust async check is better done in the router where we can query DB.
// These are synchronous checks where we already have the data.

export function canManageLocation(user: SessionUser, targetLocationOdRegionId?: string | null): boolean {
    if (hasRole(user, 'ADMIN')) return true;
    if (user.role === 'OD_MANAGER' && targetLocationOdRegionId && user.odRegionId === targetLocationOdRegionId) return true;
    return false;
}

export function canCreateNews(user: SessionUser, scope: { odRegionId?: string | null, locationId?: string | null, teamId?: string | null }): boolean {
    if (hasRole(user, 'ADMIN')) return true;

    if (user.role === 'OD_MANAGER') {
        if (!user.odRegionId) return false;
        // OD Manager can create news for their region, or locations/teams WITHIN their region
        // The router will need to verify if the selected location/team actually belongs to this OD
        if (!scope.odRegionId && !scope.locationId && !scope.teamId) return false; // Cannot create global
        if (scope.odRegionId && scope.odRegionId !== user.odRegionId) return false;
        return true; 
    }

    if (user.role === 'LOCATION_MANAGER') {
        if (!user.locationId) return false;
        // Location manager can create news for their location, or teams WITHIN their location
        if (!scope.locationId && !scope.teamId) return false; // Cannot create global or OD news
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

    // You cannot create/manage someone with a higher or equal role to yourself!
    const currentRank = ROLE_RANKS[currentUser.role as Role] || 0;
    const targetRank = ROLE_RANKS[targetRole as Role] || 0;
    
    if (targetRank >= currentRank) return false;

    if (currentUser.role === 'OD_MANAGER') {
        if (!currentUser.odRegionId) return false;
        if (targetOdRegionId && targetOdRegionId !== currentUser.odRegionId) return false;
        // We assume the router will verify that targetLocationId belongs to this OD
        return true;
    }

    if (currentUser.role === 'LOCATION_MANAGER') {
        if (!currentUser.locationId) return false;
        if (targetOdRegionId) return false; // Can't assign an OD region
        if (targetLocationId && targetLocationId !== currentUser.locationId) return false;
        return true;
    }

    return false;
}
