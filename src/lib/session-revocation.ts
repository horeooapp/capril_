import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

// Cache mémoire local court pour préserver les performances à haute charge
let cachedRevocationTime: number = 0;
let cacheExpiresAt: number = 0;

/**
 * Récupère le timestamp (en millisecondes) de la dernière révocation globale des sessions.
 */
export async function getGlobalRevocationTime(): Promise<number> {
    const now = Date.now();
    if (now < cacheExpiresAt && cachedRevocationTime > 0) {
        return cachedRevocationTime;
    }

    let timestampMs = 0;

    // 1. Tenter la lecture dans Redis
    if (redis) {
        try {
            const redisVal = await redis.get("global:auth:revoked_at");
            if (redisVal) {
                timestampMs = parseInt(redisVal, 10);
            }
        } catch (err) {
            console.warn("[SESSION-REVOCATION] Redis get error:", err);
        }
    }

    // 2. Si non trouvé dans Redis, lire dans SystemConfig (PostgreSQL)
    if (!timestampMs) {
        try {
            const config = await prisma.systemConfig.findUnique({
                where: { key: "GLOBAL_AUTH_REVOCATION" }
            });
            if (config && config.value && typeof config.value === 'object') {
                const val = config.value as any;
                if (val.revokedAt) {
                    timestampMs = new Date(val.revokedAt).getTime();
                }
            }
        } catch (err) {
            console.warn("[SESSION-REVOCATION] DB read error:", err);
        }
    }

    cachedRevocationTime = timestampMs;
    cacheExpiresAt = now + 10000; // Cache 10 secondes
    return timestampMs;
}

/**
 * Vérifie si un jeton (mobile JWT ou web session) a été émis avant la dernière révocation globale.
 */
export async function isGlobalAuthRevoked(payload: any): Promise<boolean> {
    if (!payload) return false;

    const revocationCutoff = await getGlobalRevocationTime();
    if (!revocationCutoff) return false;

    // Récupérer le timestamp d'émission du jeton (iat en secondes dans JWT)
    const iatSeconds = payload.iat || payload.issuedAt;
    if (typeof iatSeconds === 'number') {
        const iatMs = iatSeconds * 1000;
        // Si le jeton a été émis avant la coupure, il est révoqué
        if (iatMs < revocationCutoff) {
            return true;
        }
    }

    return false;
}

/**
 * Action Souveraine : Déconnecte immédiatement tous les comptes connectés (Web & Mobile).
 * Invalide tous les jetons actifs et incrémente le tokenVersion de tous les utilisateurs.
 */
export async function disconnectAllConnectedUsers(adminUserId?: string, reason: string = "Déconnexion générale forcée par l'administrateur") {
    const now = Date.now();
    const nowIso = new Date(now).toISOString();

    try {
        // 1. Incrémenter le tokenVersion de tous les utilisateurs en base
        const userUpdateRes = await prisma.user.updateMany({
            data: {
                tokenVersion: { increment: 1 }
            }
        });

        // 2. Persister le timestamp de révocation dans SystemConfig
        await prisma.systemConfig.upsert({
            where: { key: "GLOBAL_AUTH_REVOCATION" },
            create: {
                key: "GLOBAL_AUTH_REVOCATION",
                value: {
                    revokedAt: nowIso,
                    revokedBy: adminUserId || "ADMIN_CONSOLE",
                    reason,
                    totalUsersImpacted: userUpdateRes.count
                }
            },
            update: {
                value: {
                    revokedAt: nowIso,
                    revokedBy: adminUserId || "ADMIN_CONSOLE",
                    reason,
                    totalUsersImpacted: userUpdateRes.count
                }
            }
        });

        // 3. Mettre à jour Redis pour invalidation instantanée ultra-rapide
        if (redis) {
            try {
                await redis.set("global:auth:revoked_at", now.toString());
                // Purger les verrous de rôle
                const roleKeys = await redis.keys("user:active_role:*");
                if (roleKeys && roleKeys.length > 0) {
                    await redis.del(...roleKeys);
                }
            } catch (rErr) {
                console.warn("[SESSION-REVOCATION] Redis sync warning:", rErr);
            }
        }

        // 4. Mettre à jour le cache mémoire local
        cachedRevocationTime = now;
        cacheExpiresAt = now + 15000;

        // 5. Journaliser l'événement d'audit
        try {
            await prisma.auditLog.create({
                data: {
                    action: "GLOBAL_FORCE_LOGOUT",
                    userId: adminUserId || null,
                    details: {
                        timestamp: nowIso,
                        reason,
                        totalAccountsReset: userUpdateRes.count
                    }
                }
            });
        } catch (aErr) {
            console.warn("[SESSION-REVOCATION] Audit log warning:", aErr);
        }

        return {
            success: true,
            revokedAt: nowIso,
            totalUsersImpacted: userUpdateRes.count,
            message: `Tous les comptes connectés (${userUpdateRes.count} utilisateurs) ont été révoqués et doivent se reconnecter.`
        };

    } catch (error: any) {
        console.error("[SESSION-REVOCATION] Erreur lors de la déconnexion globale:", error);
        throw new Error("Impossible de procéder à la déconnexion globale des comptes.");
    }
}

/**
 * Récupère le statut et l'historique du dernier forçage de déconnexion.
 */
export async function getLastRevocationInfo() {
    try {
        const config = await prisma.systemConfig.findUnique({
            where: { key: "GLOBAL_AUTH_REVOCATION" }
        });
        if (config && config.value && typeof config.value === 'object') {
            return config.value as {
                revokedAt: string;
                revokedBy: string;
                reason: string;
                totalUsersImpacted?: number;
            };
        }
        return null;
    } catch {
        return null;
    }
}

