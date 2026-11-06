with open('src/actions/marketplace-actions.ts', 'r', encoding='utf-8') as f:
    c = f.read()

# Add import
if 'notifyMatchingTenantsForProperty' not in c:
    c = c.replace(
        'import { logAction } from "./audit"',
        'import { logAction } from "./audit"\nimport { notifyMatchingTenantsForProperty } from "./locataire-profil-public"'
    )

# Notify on togglePropertyMarketplaceStatus
old_toggle_succ = """        revalidatePath("/dashboard/properties")
        revalidatePath("/dashboard")
        revalidatePath("/mon-espace-locataire/marketplace")
        return { success: true }"""

new_toggle_succ = """        if (isOnline) {
            const loyerFinal = property.declaredRentFcfa || (property.leases?.[0]?.rentAmount ? Number(property.leases[0].rentAmount) : 150000);
            notifyMatchingTenantsForProperty({
                id: property.id,
                name: property.name,
                commune: property.commune,
                city: property.city,
                neighborhood: (property as any).neighborhood,
                rentAmount: Number(loyerFinal)
            }).catch(() => {});
        }

        revalidatePath("/dashboard/properties")
        revalidatePath("/dashboard")
        revalidatePath("/mon-espace-locataire/marketplace")
        return { success: true }"""

assert old_toggle_succ in c, "togglePropertyMarketplaceStatus success block not found"
c = c.replace(old_toggle_succ, new_toggle_succ)

# Notify on publishAnnonce
old_publish = """        await logAction({
            action: "PUBLISH_ANNONCE",
            module: "MARKETPLACE",
            entityId: annonceId
        })

        revalidatePath("/dashboard/marketplace")
        return { success: true }"""

new_publish = """        await logAction({
            action: "PUBLISH_ANNONCE",
            module: "MARKETPLACE",
            entityId: annonceId
        })

        // Déclencher les alertes automatiques pour les locataires correspondants
        try {
            const ann = await prisma.annonce.findUnique({
                where: { id: annonceId },
                include: { logement: true }
            });
            if (ann && ann.logement) {
                notifyMatchingTenantsForProperty({
                    id: ann.logement.id,
                    name: ann.titre || ann.logement.name,
                    commune: ann.logement.commune,
                    city: ann.logement.city,
                    neighborhood: (ann.logement as any).neighborhood,
                    rentAmount: Number(ann.loyerDemande)
                }).catch(() => {});
            }
        } catch {}

        revalidatePath("/dashboard/marketplace")
        revalidatePath("/mon-espace-locataire/marketplace")
        return { success: true }"""

assert old_publish in c, "publishAnnonce block not found"
c = c.replace(old_publish, new_publish)

# Enhance getPublicMarketplaceAnnonces
old_get_annonces = """export async function getPublicMarketplaceAnnonces(filters?: { commune?: string, minPrice?: number, maxPrice?: number }) {
    try {
        const whereClause: any = {
            statut: { in: ["ACTIVE", "LOUE"] }
        }

        if (filters?.commune && filters.commune !== "Toutes") {
            whereClause.logement = { ...whereClause.logement, commune: { contains: filters.commune } }
        }

        if (filters?.minPrice || filters?.maxPrice) {
            whereClause.loyerDemande = {}
            if (filters.minPrice) whereClause.loyerDemande.gte = filters.minPrice
            if (filters.maxPrice) whereClause.loyerDemande.lte = filters.maxPrice
        }

        const data = await prisma.annonce.findMany({
            where: whereClause,
            include: { 
                logement: {
                    include: {
                        images: true,
                        leases: {
                            where: {
                                status: { in: ['ACTIVE', 'PENDING_SIGNATURE', 'PENDING_CONFIRMATION'] }
                            },
                            select: { status: true }
                        }
                    }
                },
                agence: {
                    select: { firstName: true, lastName: true, phone: true, email: true }
                }
            },
            orderBy: { publieeAt: 'desc' }
        })

        return data"""

new_get_annonces = """export async function getPublicMarketplaceAnnonces(filters?: { 
    commune?: string, 
    minPrice?: number, 
    maxPrice?: number,
    sortBy?: 'price_asc' | 'price_desc' | 'recent'
}) {
    try {
        const whereClause: any = {
            statut: { in: ["ACTIVE", "LOUE"] }
        }

        if (filters?.commune && filters.commune !== "Toutes" && filters.commune !== "Toutes les localisations") {
            whereClause.logement = { 
                OR: [
                    { commune: { contains: filters.commune, mode: 'insensitive' } },
                    { city: { contains: filters.commune, mode: 'insensitive' } },
                    { address: { contains: filters.commune, mode: 'insensitive' } }
                ]
            }
        }

        if (filters?.minPrice || filters?.maxPrice) {
            whereClause.loyerDemande = {}
            if (filters.minPrice) whereClause.loyerDemande.gte = filters.minPrice
            if (filters.maxPrice) whereClause.loyerDemande.lte = filters.maxPrice
        }

        let orderByClause: any = { publieeAt: 'desc' }
        if (filters?.sortBy === 'price_asc') {
            orderByClause = { loyerDemande: 'asc' }
        } else if (filters?.sortBy === 'price_desc') {
            orderByClause = { loyerDemande: 'desc' }
        }

        const data = await prisma.annonce.findMany({
            where: whereClause,
            include: { 
                logement: {
                    include: {
                        images: true,
                        leases: {
                            where: {
                                status: { in: ['ACTIVE', 'PENDING_SIGNATURE', 'PENDING_CONFIRMATION'] }
                            },
                            select: { status: true }
                        }
                    }
                },
                agence: {
                    select: { firstName: true, lastName: true, phone: true, email: true }
                }
            },
            orderBy: orderByClause
        })

        return data"""

assert old_get_annonces in c, "old_get_annonces block not found"
c = c.replace(old_get_annonces, new_get_annonces)

with open('src/actions/marketplace-actions.ts', 'w', encoding='utf-8') as f:
    f.write(c)

print("Updated src/actions/marketplace-actions.ts successfully")

