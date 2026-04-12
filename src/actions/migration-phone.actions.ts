"use server"

import { prisma } from "@/lib/prisma";
import { normalizePhone, isNormalized } from "@/lib/phone";
import { auth } from "@/auth";

/**
 * QAPRIL Data Maintenance: Normalize all existing phone numbers.
 * This resolves account splits caused by inconsistent formatting (+22507 vs +225 07).
 */
export async function runGlobalPhoneNormalization() {
    const session = await auth();
    // Restriction to Admin only
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
        return { success: false, error: "Non autorisé. Droits d'administration requis." };
    }

    try {
        const users = await prisma.user.findMany({
            where: { phone: { not: null } },
            select: { id: true, phone: true, email: true }
        });

        let updatedCount = 0;
        let mergedCount = 0;

        for (const user of users) {
            const raw = user.phone as string;
            if (!isNormalized(raw)) {
                const normalized = normalizePhone(raw);
                
                // Check if another user already has the normalized version
                const conflict = await prisma.user.findFirst({
                    where: { phone: normalized, id: { not: user.id } }
                });

                if (conflict) {
                    // MERGE CASE
                    // If current user has NO email and conflict user HAS email, 
                    // merge current into conflict.
                    if (!user.email && conflict.email) {
                        await prisma.$transaction([
                            prisma.lease.updateMany({ where: { tenantId: user.id }, data: { tenantId: conflict.id } }),
                            prisma.lease.updateMany({ where: { landlordId: user.id }, data: { landlordId: conflict.id } }),
                            prisma.property.updateMany({ where: { ownerUserId: user.id }, data: { ownerUserId: conflict.id } }),
                            prisma.user.delete({ where: { id: user.id } })
                        ]);
                        mergedCount++;
                    } else if (user.email && !conflict.email) {
                        // Inverse: conflict is a ghost, merge into current
                         await prisma.$transaction([
                            prisma.lease.updateMany({ where: { tenantId: conflict.id }, data: { tenantId: user.id } }),
                            prisma.lease.updateMany({ where: { landlordId: conflict.id }, data: { landlordId: user.id } }),
                            prisma.property.updateMany({ where: { ownerUserId: conflict.id }, data: { ownerUserId: user.id } }),
                            prisma.user.delete({ where: { id: conflict.id } }),
                            prisma.user.update({ where: { id: user.id }, data: { phone: normalized } })
                        ]);
                        mergedCount++;
                        updatedCount++;
                    }
                } else {
                    // SIMPLE UPDATE
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { phone: normalized }
                    });
                    updatedCount++;
                }
            }
        }

        return { success: true, updatedCount, mergedCount, totalChecked: users.length };
    } catch (error: any) {
        console.error("[Migration-Phone] Error:", error);
        return { success: false, error: error.message };
    }
}
