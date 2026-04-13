import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    console.log("--- DIAGNOSTIC QAPRIL MATCH ---")
    
    // 1. Check Feature Flags
    const config = await (prisma as any).systemConfig.findUnique({
        where: { key: "feature_flags" }
    })
    console.log("Flags (SystemConfig):", config?.value)

    const flags = await (prisma as any).featureFlag.findMany()
    console.log("Flags (FeatureFlag table):", flags)

    // 2. Check Data
    const totalCandidatures = await (prisma as any).candidature.count()
    const pendingCandidatures = await (prisma as any).candidature.count({
        where: { statut: "SOUMISE" }
    })
    const publicProfiles = await (prisma as any).locataireProfilPublic.count({
        where: { statutRecherche: "EN_RECHERCHE" }
    })
    const visibleProfiles = await (prisma as any).locataireProfilPublic.count({
        where: { visibilite: "TOUS" }
    })

    console.log("--- STATS ---")
    console.log("Total Candidatures:", totalCandidatures)
    console.log("Candidatures SOUMISES:", pendingCandidatures)
    console.log("Profils 'EN RECHERCHE':", publicProfiles)
    console.log("Profils VISIBLES PAR TOUS:", visibleProfiles)

    // 3. Check for specific user (if possible)
    // We don't have the user ID here easily but we can see the last ones
    const lastProfiles = await (prisma as any).locataireProfilPublic.findMany({
        take: 10,
        orderBy: { updatedAt: 'desc' },
        include: { user: { select: { firstName: true, lastName: true, phone: true } } }
    })
    console.log("Derniers profils 'ProfilPublic' activés:", lastProfiles)

    const tenants = await prisma.user.findMany({
        where: { role: 'TENANT' },
        select: { id: true, firstName: true, lastName: true, phone: true },
        take: 10
    })
    console.log("Derniers utilisateurs TENANT crées:", tenants)
}

main().catch(console.error).finally(() => prisma.$disconnect())
