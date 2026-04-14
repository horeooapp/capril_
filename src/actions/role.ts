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

    try {
        // Set the global lock in Redis & Database
        if (redis) {
            await redis.set(`user:active_role:${session.user.id}`, role).catch((e: any) => console.error("Redis error:", e));
        }
        
        const { prisma } = await import("@/lib/prisma");
        await prisma.user.update({
            where: { id: session.user.id },
            data: { capaciteActive: role }
        });
        
        console.log(`[AUTH] User ${session.user.email} chose role: ${role}`)
        
        // Determine redirect path
        let redirectUrl = "/dashboard";
        if (role === "TENANT") redirectUrl = "/mon-espace-locataire";
        if (role === "ADMIN" || role === "SUPER_ADMIN") redirectUrl = "/admin";

        return { success: true, chosenRole: role, redirectUrl }
    } catch (error: any) {
        console.error("[AUTH] setChosenRole Critical Error:", error);
        return { error: "Erreur lors du changement de rôle", details: error.message }
    }
}
