import { PrismaClient, VisibEnum } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    console.log("--- SEEDING MATCHING DEMO ---")

    // 1. Ensure Feature Flag is ENABLED
    if ((prisma as any).featureFlag) {
        await (prisma as any).featureFlag.upsert({
            where: { id: 'CANDIDATURES' },
            create: { id: 'CANDIDATURES', name: 'CANDIDATURES', description: 'Qapril Match', enabled: true },
            update: { enabled: true }
        })
    }

    // 2. Create/Update 2 Tenant Profiles
    
    // Profile 1: Awa Sylla (Existing)
    const awa = await prisma.user.findFirst({ where: { phone: "+225 0504030201" } })
    if (awa) {
        await (prisma as any).locataireProfilPublic.upsert({
            where: { userId: awa.id },
            create: {
                userId: awa.id,
                visibilite: 'TOUS',
                statutRecherche: 'EN_RECHERCHE',
                statutPro: 'SALARIE',
                revenuFourchette: '800000',
                budgetMaxFcfa: 300000,
                communesSouhaitees: ['Cocody', 'Riviera'],
                kycNiveau: 4
            },
            update: {
                visibilite: 'TOUS',
                statutRecherche: 'EN_RECHERCHE',
                kycNiveau: 4
            }
        })
        console.log("Profil mis à jour pour Awa Sylla")
    }

    // Profile 2: Jean-Paul N'Guessan (New)
    let jean = await prisma.user.findFirst({ where: { phone: "+225 0707070707" } })
    if (!jean) {
        jean = await prisma.user.create({
            data: {
                phone: "+225 0707070707",
                firstName: "Jean-Paul",
                lastName: "N'Guessan",
                role: 'TENANT',
                kycLevel: 4,
                status: 'active'
            }
        })
    }

    await (prisma as any).locataireProfilPublic.upsert({
        where: { userId: jean.id },
        create: {
            userId: jean.id,
            visibilite: 'TOUS',
            statutRecherche: 'EN_RECHERCHE',
            statutPro: 'INDEPENDANT',
            revenuFourchette: '1500000',
            budgetMaxFcfa: 500000,
            communesSouhaitees: ['Marcory', 'Plateau'],
            kycNiveau: 3
        },
        update: {
            visibilite: 'TOUS',
            statutRecherche: 'EN_RECHERCHE'
        }
    })
    console.log("Profil créé pour Jean-Paul N'Guessan")

    console.log("--- SEEDING COMPLETE ---")
}

main().catch(console.error).finally(() => prisma.$disconnect())
