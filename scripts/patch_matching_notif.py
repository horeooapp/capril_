with open('src/actions/locataire-profil-public.ts', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Update upsertPublicProfile to trigger matching search & notification
old_block = """        // Mettre à jour neighborhood de l'utilisateur avec la localisation principale
        const mainLoc = data.city || (data.communesSouhaitees && data.communesSouhaitees[0]);
        if (mainLoc) {
            await prisma.user.update({
                where: { id: userId },
                data: { neighborhood: mainLoc }
            }).catch(() => {});
        }

        revalidatePath("/mon-espace-locataire/profil-public")"""

new_block = """        // Mettre à jour neighborhood de l'utilisateur avec la localisation principale
        const mainLoc = data.city || (data.communesSouhaitees && data.communesSouhaitees[0]);
        if (mainLoc) {
            await prisma.user.update({
                where: { id: userId },
                data: { neighborhood: mainLoc }
            }).catch(() => {});
        }

        // 🔔 NOTIFICATION AUTOMATIQUE : Vérifier les biens déjà disponibles correspondant aux critères
        try {
            const budget = data.budgetMaxFcfa ? Number(data.budgetMaxFcfa) : null;
            const searchLocation = (mainLoc || '').split('·')[0].trim();

            const matchingCount = await prisma.property.count({
                where: {
                    status: { not: "archived" },
                    ...(budget ? {
                        OR: [
                            { declaredRentFcfa: { lte: budget } },
                            { leases: { some: { rentAmount: { lte: budget } } } }
                        ]
                    } : {}),
                    ...(searchLocation ? {
                        OR: [
                            { commune: { contains: searchLocation, mode: 'insensitive' } },
                            { city: { contains: searchLocation, mode: 'insensitive' } },
                            { address: { contains: searchLocation, mode: 'insensitive' } }
                        ]
                    } : {})
                }
            });

            if (matchingCount > 0) {
                await prisma.notification.create({
                    data: {
                        userId,
                        channel: "PUSH",
                        type: "MATCHING_ALERTE",
                        title: "🏠 Biens disponibles selon vos critères !",
                        content: `${matchingCount} bien(s) à ${mainLoc || 'Abidjan'} correspondent à votre budget (${(budget || 0).toLocaleString('fr-FR')} XOF). Consultez la Marketplace pour postuler.`,
                        link: "/mon-espace-locataire/marketplace",
                        status: "sent"
                    }
                }).catch(() => {});
            } else {
                await prisma.notification.create({
                    data: {
                        userId,
                        channel: "PUSH",
                        type: "MATCHING_ALERTE",
                        title: "🔔 Alerte automatique activée",
                        content: `Vos critères pour ${mainLoc || 'votre zone'} (budget max ${(budget || 0).toLocaleString('fr-FR')} XOF) sont enregistrés. Vous recevrez une notification automatique dès qu'un bien compatible sera publié.`,
                        link: "/mon-espace-locataire/profil-public",
                        status: "sent"
                    }
                }).catch(() => {});
            }
        } catch (notifErr) {
            console.warn("[Matching Notification] Non-fatal notification error:", notifErr);
        }

        revalidatePath("/mon-espace-locataire/profil-public")"""

assert old_block in c, "old_block not found in locataire-profil-public.ts"
c = c.replace(old_block, new_block)

# 2. Add notifyMatchingTenantsForProperty function at the end
notification_func = """
/**
 * Alerte automatique : Notifie tous les locataires en recherche active dès qu'un nouveau bien est publié
 */
export async function notifyMatchingTenantsForProperty(propertyData: {
    id: string;
    name?: string;
    commune?: string;
    city?: string;
    neighborhood?: string;
    rentAmount: number;
}) {
    try {
        if (!propertyData.rentAmount) return;

        // Trouver les profils locataires actifs dont le budget max est >= loyer du bien
        const activeProfiles = await (prisma as any).locataireProfilPublic.findMany({
            where: {
                statutRecherche: "EN_RECHERCHE",
                budgetMaxFcfa: { gte: propertyData.rentAmount }
            },
            include: {
                user: { select: { id: true, email: true, phone: true } }
            }
        });

        if (!activeProfiles || activeProfiles.length === 0) return;

        const propLoc = (propertyData.commune || propertyData.city || propertyData.neighborhood || '').toLowerCase();

        for (const p of activeProfiles) {
            // Vérifier correspondance géographique
            const cityMatch = !p.city || p.city.toLowerCase().includes(propLoc) || propLoc.includes(p.city.toLowerCase());
            const communeMatch = !p.communesSouhaitees || p.communesSouhaitees.length === 0 || p.communesSouhaitees.some((c: string) => {
                const cLower = c.toLowerCase();
                return propLoc.includes(cLower) || cLower.includes(propLoc);
            });

            if (cityMatch || communeMatch) {
                // Création de la notification automatique pour le locataire
                await prisma.notification.create({
                    data: {
                        userId: p.userId,
                        channel: "PUSH",
                        type: "MATCHING_ALERTE",
                        title: `🏠 Nouveau bien disponible à ${propertyData.commune || propertyData.city || 'Abidjan'} !`,
                        content: `Un logement (${propertyData.name || 'Bien vérifié'}) à ${propertyData.rentAmount.toLocaleString('fr-FR')} XOF/mois correspond exactement à vos critères. Soyez parmi les premiers à postuler !`,
                        link: "/mon-espace-locataire/marketplace",
                        status: "sent"
                    }
                }).catch(() => {});
            }
        }
    } catch (err) {
        console.error("[Matching Alert] Error notifying matching tenants:", err);
    }
}
"""

c = c + "\n" + notification_func

with open('src/actions/locataire-profil-public.ts', 'w', encoding='utf-8') as f:
    f.write(c)

print("Successfully updated src/actions/locataire-profil-public.ts")

