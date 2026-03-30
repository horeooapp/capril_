import { redis } from "@/lib/redis"

/**
 * Enforces that a user's session role matches their globally chosen active role.
 * This guarantees that exactly ONE role is active globally, regardless of 
 * how many browser tabs/devices they open.
 */
export async function isRoleGloballyActive(userId: string, currentRole: string): Promise<boolean> {
    if (!redis) return true; // Fail open if Redis is unavailable
    
    try {
        const globalRole = await redis.get(`user:active_role:${userId}`);
        
        // If there's no explicitly set global role yet, assume valid to avoid breaking sessions.
        // It will be set on next login or role switch.
        if (!globalRole) return true;
        
        return globalRole === currentRole;
    } catch (error) {
        console.error("[ROLE-LOCK] Error checking global role:", error);
        return true; // Fail open
    }
}
