import { prisma } from "./prisma";

export interface KycLevelsConfig {
    allDisabled: boolean; // Si true, tous les niveaux de KYC sont désactivés (mode bypass)
    level1: boolean;      // Niveau 1: CNI / Passeport / Téléphone vérifié
    level2: boolean;      // Niveau 2: Profil complet / Ajout de biens
    level3: boolean;      // Niveau 3: Vérification manuelle ANAH / CDC
    level4: boolean;      // Niveau 4: Certification PRO / Agence / RCCM
    updatedAt?: string;
    updatedBy?: string;
}

export const DEFAULT_KYC_CONFIG: KycLevelsConfig = {
    allDisabled: false,
    level1: true,
    level2: true,
    level3: true,
    level4: true,
};

let cachedConfig: KycLevelsConfig | null = null;
let lastFetch = 0;
const CACHE_TTL = 10000; // 10 secondes en mémoire

/**
 * Récupère la configuration actuelle des niveaux KYC
 */
export async function getKycLevelsConfig(): Promise<KycLevelsConfig> {
    const now = Date.now();
    if (cachedConfig && (now - lastFetch) <= CACHE_TTL) {
        return cachedConfig;
    }

    try {
        const config = await prisma.systemConfig.findUnique({
            where: { key: "kyc_levels_config" }
        });

        if (config && config.value) {
            const val = config.value as any;
            cachedConfig = {
                allDisabled: Boolean(val.allDisabled),
                level1: val.level1 !== false,
                level2: val.level2 !== false,
                level3: val.level3 !== false,
                level4: val.level4 !== false,
                updatedAt: val.updatedAt,
                updatedBy: val.updatedBy,
            };
            lastFetch = now;
            return cachedConfig;
        }
    } catch (e) {
        console.error("[KYC-CONFIG] Erreur lecture configuration :", e);
    }

    return DEFAULT_KYC_CONFIG;
}

/**
 * Vérifie si un niveau KYC spécifique est actuellement requis/activé
 */
export async function isKycLevelRequired(level: number): Promise<boolean> {
    const config = await getKycLevelsConfig();
    if (config.allDisabled) return false;
    if (level === 1) return config.level1;
    if (level === 2) return config.level2;
    if (level === 3) return config.level3;
    if (level === 4) return config.level4;
    return true;
}

/**
 * Vérifie si le niveau KYC d'un utilisateur est suffisant compte tenu des règles actives
 */
export async function isUserKycSufficient(userKycLevel: number | null | undefined, requiredLevel: number): Promise<boolean> {
    const required = await isKycLevelRequired(requiredLevel);
    // Si le niveau requis est désactivé par l'admin, l'accès est automatiquement autorisé
    if (!required) return true;
    return (userKycLevel || 0) >= requiredLevel;
}

export function invalidateKycConfigCache() {
    cachedConfig = null;
    lastFetch = 0;
}
