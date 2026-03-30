"use server"

import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { redis } from "@/lib/redis"

/**
 * Sets the chosen role for the current session.
 * Since we want "logout to switch", we don't necessarily 
 * need to persist this in the DB, just the session/JWT.
 */
export async function setChosenRole(role: string) {
    const session = await auth()
    if (!session?.user) return { error: "Non authentifié" }

    // Check if the requested role is in eligible roles
    const eligibleRoles = (session.user as any).eligibleRoles || []
    if (!eligibleRoles.includes(role) && (session.user as any).role !== role) {
        return { error: "Rôle non autorisé pour cet utilisateur" }
    }

    // Set the global lock in Redis
    if (redis) {
        await redis.set(`user:active_role:${session.user.id}`, role);
    }
    
    console.log(`[AUTH] User ${session.user.email} chose role: ${role}`)
    
    return { success: true, chosenRole: role }
}
