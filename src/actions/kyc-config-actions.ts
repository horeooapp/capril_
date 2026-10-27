"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { logAction } from "./audit";
import { 
    getKycLevelsConfig, 
    invalidateKycConfigCache, 
    KycLevelsConfig 
} from "@/lib/kyc-config";

async function verifyAdmin() {
    const session = await auth();
    const role = (session?.user as any)?.chosenRole || session?.user?.role;
    if (!session?.user || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
        throw new Error("Action réservée aux administrateurs.");
    }
    return session;
}

/**
 * Récupère la configuration actuelle des niveaux KYC
 */
export async function getKycConfigAction(): Promise<KycLevelsConfig> {
    return await getKycLevelsConfig();
}

/**
 * DÉSACTIVER TOUS LES NIVEAUX DE KYC (Mode Bypass Total)
 */
export async function disableAllKycLevelsAction() {
    try {
        const session = await verifyAdmin();

        const updatedConfig: KycLevelsConfig = {
            allDisabled: true,
            level1: false,
            level2: false,
            level3: false,
            level4: false,
            updatedAt: new Date().toISOString(),
            updatedBy: session.user.email || session.user.id,
        };

        await prisma.systemConfig.upsert({
            where: { key: "kyc_levels_config" },
            create: {
                key: "kyc_levels_config",
                value: updatedConfig as any,
            },
            update: {
                value: updatedConfig as any,
            },
        });

        // Synchroniser également avec la table FeatureFlag si présente
        if ((prisma as any).featureFlag) {
            await (prisma as any).featureFlag.upsert({
                where: { id: "M01-M03" },
                update: { enabled: false },
                create: { id: "M01-M03", name: "Vérification KYC", description: "Gestion des documents d'identité et niveaux de certification", enabled: false }
            }).catch(() => null);

            await (prisma as any).featureFlag.upsert({
                where: { id: "KYC_VERIFICATION" },
                update: { enabled: false },
                create: { id: "KYC_VERIFICATION", name: "KYC_VERIFICATION", description: "Vérification KYC", enabled: false }
            }).catch(() => null);
        }

        invalidateKycConfigCache();

        await logAction({
            action: "KYC_ALL_LEVELS_DISABLED",
            module: "KYC",
            entityId: "system",
            newValues: updatedConfig as any,
        });

        revalidatePath("/admin/system");
        revalidatePath("/admin/validation");
        revalidatePath("/admin/users");
        revalidatePath("/admin/settings/features");
        revalidatePath("/dashboard");

        return { success: true, config: updatedConfig, message: "Tous les niveaux de KYC ont été désactivés (mode bypass actif)." };
    } catch (error: any) {
        console.error("[KYC ACTION] Erreur désactivation tous niveaux :", error);
        return { success: false, error: error.message || "Erreur lors de la désactivation." };
    }
}

/**
 * RÉACTIVER TOUS LES NIVEAUX DE KYC (Mode Normal Strict)
 */
export async function enableAllKycLevelsAction() {
    try {
        const session = await verifyAdmin();

        const updatedConfig: KycLevelsConfig = {
            allDisabled: false,
            level1: true,
            level2: true,
            level3: true,
            level4: true,
            updatedAt: new Date().toISOString(),
            updatedBy: session.user.email || session.user.id,
        };

        await prisma.systemConfig.upsert({
            where: { key: "kyc_levels_config" },
            create: {
                key: "kyc_levels_config",
                value: updatedConfig as any,
            },
            update: {
                value: updatedConfig as any,
            },
        });

        // Synchroniser également avec la table FeatureFlag
        if ((prisma as any).featureFlag) {
            await (prisma as any).featureFlag.upsert({
                where: { id: "M01-M03" },
                update: { enabled: true },
                create: { id: "M01-M03", name: "Vérification KYC", description: "Gestion des documents d'identité et niveaux de certification", enabled: true }
            }).catch(() => null);

            await (prisma as any).featureFlag.upsert({
                where: { id: "KYC_VERIFICATION" },
                update: { enabled: true },
                create: { id: "KYC_VERIFICATION", name: "KYC_VERIFICATION", description: "Vérification KYC", enabled: true }
            }).catch(() => null);
        }

        invalidateKycConfigCache();

        await logAction({
            action: "KYC_ALL_LEVELS_ENABLED",
            module: "KYC",
            entityId: "system",
            newValues: updatedConfig as any,
        });

        revalidatePath("/admin/system");
        revalidatePath("/admin/validation");
        revalidatePath("/admin/users");
        revalidatePath("/admin/settings/features");
        revalidatePath("/dashboard");

        return { success: true, config: updatedConfig, message: "Tous les niveaux de KYC ont été réactivés avec succès." };
    } catch (error: any) {
        console.error("[KYC ACTION] Erreur réactivation tous niveaux :", error);
        return { success: false, error: error.message || "Erreur lors de la réactivation." };
    }
}

/**
 * ACTIVER OU DÉSACTIVER UN NIVEAU DE KYC PARTICULIER (1, 2, 3 ou 4)
 */
export async function toggleSingleKycLevelAction(level: 1 | 2 | 3 | 4, enabled: boolean) {
    try {
        const session = await verifyAdmin();
        const current = await getKycLevelsConfig();

        const updatedConfig: KycLevelsConfig = {
            ...current,
            [`level${level}`]: enabled,
            updatedAt: new Date().toISOString(),
            updatedBy: session.user.email || session.user.id,
        };

        // Si tous les 4 niveaux sont désactivés, marquer allDisabled = true
        if (!updatedConfig.level1 && !updatedConfig.level2 && !updatedConfig.level3 && !updatedConfig.level4) {
            updatedConfig.allDisabled = true;
        } else if (enabled) {
            // Si on réactive au moins un niveau, allDisabled redevient false
            updatedConfig.allDisabled = false;
        }

        await prisma.systemConfig.upsert({
            where: { key: "kyc_levels_config" },
            create: {
                key: "kyc_levels_config",
                value: updatedConfig as any,
            },
            update: {
                value: updatedConfig as any,
            },
        });

        invalidateKycConfigCache();

        await logAction({
            action: `KYC_LEVEL_${level}_${enabled ? "ENABLED" : "DISABLED"}`,
            module: "KYC",
            entityId: `level_${level}`,
            newValues: { level, enabled },
        });

        revalidatePath("/admin/system");
        revalidatePath("/admin/validation");
        revalidatePath("/admin/users");
        revalidatePath("/admin/settings/features");

        return { success: true, config: updatedConfig };
    } catch (error: any) {
        console.error(`[KYC ACTION] Erreur toggle niveau ${level} :`, error);
        return { success: false, error: error.message || "Erreur lors de la mise à jour." };
    }
}

/**
 * ACTION EN MASSE : Passer tous les utilisateurs existants à un niveau KYC (ou réinitialiser)
 */
export async function bulkUpdateUsersKycAction(targetLevel: number, kycStatus: "verified" | "pending" | "unverified") {
    try {
        const session = await verifyAdmin();

        const updateResult = await prisma.user.updateMany({
            data: {
                kycLevel: targetLevel,
                kycStatus: kycStatus,
                isCertified: targetLevel >= 3,
            }
        });

        await logAction({
            action: "KYC_BULK_USERS_UPDATED",
            module: "KYC",
            entityId: "users",
            newValues: { targetLevel, kycStatus, count: updateResult.count },
        });

        revalidatePath("/admin/users");
        revalidatePath("/admin/system");
        revalidatePath("/admin/validation");

        return { 
            success: true, 
            count: updateResult.count,
            message: `${updateResult.count} utilisateurs mis à jour vers KYC Niveau ${targetLevel} (${kycStatus}).` 
        };
    } catch (error: any) {
        console.error("[KYC ACTION] Erreur mise à jour en masse KYC :", error);
        return { success: false, error: error.message || "Erreur lors de la mise à jour en masse." };
    }
}

/**
 * MODIFIER DIRECTEMENT LE NIVEAU KYC D'UN UTILISATEUR UNIQUE
 */
export async function setUserKycLevelAction(userId: string, level: number, status?: "verified" | "pending" | "unverified" | "rejected") {
    try {
        await verifyAdmin();

        const calculatedStatus = status || (level > 0 ? "verified" : "unverified");

        await prisma.user.update({
            where: { id: userId },
            data: {
                kycLevel: level,
                kycStatus: calculatedStatus,
                isCertified: level >= 3,
            }
        });

        await logAction({
            action: "KYC_USER_UPDATED",
            module: "KYC",
            entityId: userId,
            newValues: { level, status: calculatedStatus },
        });

        revalidatePath("/admin/users");
        revalidatePath("/admin/validation");

        return { success: true, message: `Utilisateur mis à jour (Niveau ${level} - ${calculatedStatus}).` };
    } catch (error: any) {
        console.error("[KYC ACTION] Erreur mise à jour KYC utilisateur :", error);
        return { success: false, error: error.message || "Erreur lors de la mise à jour." };
    }
}
