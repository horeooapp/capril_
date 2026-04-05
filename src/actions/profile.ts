"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { writeAuditLog } from "@/lib/audit"

/**
 * Updates the user's personal profile information.
 * If all required fields are provided and the user is below KYC Level 2,
 * it will automatically elevate the user's KYC Level to 2 to unlock platform features.
 */
export async function updateUserProfile(data: {
    firstName: string;
    lastName: string;
    birthDate: Date | null;
    birthPlace: string;
    neighborhood: string;
    profession?: string;
    salary?: number | null;
    phone: string;
    avatarUrl?: string;
    docType?: string;
    docNumber?: string;
    isAgency?: boolean;
    dfe?: string;
    rccm?: string;
    nif?: string;
    agrement?: string;
}) {
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
        throw new Error("Authentification requise.")
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        })

        if (!user) throw new Error("Utilisateur introuvable.")

        let newKycLevel = user.kycLevel || 0;

        // Automatically upgrade to Level 2 if basic info is provided
        const hasAllRequired = data.firstName && data.lastName && data.birthDate && data.birthPlace && data.neighborhood && data.profession && data.phone && data.docType && data.docNumber;
        if (hasAllRequired && newKycLevel < 2) {
            newKycLevel = 2;
        }

        // Security: Check if user is locked (Tenant with a lease)
        const tenantLease = await prisma.lease.findFirst({
            where: { tenantId: session.user.id }
        });
        const isIdentityLocked = !!tenantLease;

        // If locked, we MUST ignore incoming identity fields to prevent tampering
        const finalLastName = isIdentityLocked ? (user as any).lastName : data.lastName;
        let finalFirstName = isIdentityLocked ? (user as any).firstName : data.firstName;
        
        if (data.isAgency) {
            finalFirstName = null; // Les agences n'ont pas de prénoms en général
        }

        const finalBirthDate = isIdentityLocked ? (user as any).birthDate : data.birthDate;
        const finalBirthPlace = isIdentityLocked ? (user as any).birthPlace : data.birthPlace;
        
        const fullName = `${finalFirstName?.trim() || ''} ${finalLastName?.trim() || ''}`.trim() || undefined;

        await prisma.$transaction(async (tx) => {
            // Update User
            await tx.user.update({
                where: { id: session.user.id },
                data: {
                    firstName: finalFirstName,
                    lastName: finalLastName,
                    birthDate: finalBirthDate,
                    birthPlace: finalBirthPlace,
                    neighborhood: data.neighborhood, // Allowed
                    profession: data.profession,     // Allowed
                    salary: data.salary,             // Allowed
                    phone: data.phone,               // Allowed
                    ...(data.avatarUrl && { avatarUrl: data.avatarUrl }), // Allowed
                    kycLevel: newKycLevel
                }
            });

            // Logic pour Documents d'Identité ou d'Entreprise
            if (!isIdentityLocked) {
                if (data.isAgency) {
                    const agencyDocs = [
                        { type: 'DFE', value: data.dfe },
                        { type: 'RCCM', value: data.rccm },
                        { type: 'NIF', value: data.nif },
                        { type: 'AGREMENT', value: data.agrement },
                    ].filter(d => Boolean(d.value));

                    for (const ad of agencyDocs) {
                        const existingDoc = await tx.identityDocument.findFirst({
                            where: { userId: session.user.id, docType: ad.type }
                        });

                        const composedHash = `${session.user.id}_${ad.type}_${ad.value}`;

                        if (existingDoc) {
                            await tx.identityDocument.update({
                                where: { id: existingDoc.id },
                                data: {
                                    docNumber: ad.value!,
                                    docNumberHash: composedHash,
                                    fullName: fullName
                                }
                            });
                        } else {
                            await tx.identityDocument.create({
                                data: {
                                    userId: session.user.id,
                                    docType: ad.type,
                                    docNumber: ad.value!,
                                    docNumberHash: composedHash,
                                    status: "pending",
                                    fullName: fullName
                                }
                            });
                        }
                    }
                } else if (data.docType && data.docNumber) {
                    const existingDoc = await tx.identityDocument.findFirst({
                        where: { 
                            userId: session.user.id,
                            docType: { notIn: ['DFE', 'RCCM', 'NIF', 'AGREMENT'] }
                        }
                    });

                    // For standard documents, maintain previous logic but ensure hash isn't colliding between users
                    const standardHash = `${session.user.id}_${data.docType}_${data.docNumber}`;

                    if (existingDoc) {
                        await tx.identityDocument.update({
                            where: { id: existingDoc.id },
                            data: {
                                docType: data.docType,
                                docNumber: data.docNumber,
                                docNumberHash: standardHash,
                                fullName: fullName,
                                birthDate: data.birthDate
                            }
                        });
                    } else {
                        await tx.identityDocument.create({
                            data: {
                                userId: session.user.id,
                                docType: data.docType,
                                docNumber: data.docNumber,
                                docNumberHash: standardHash,
                                status: "pending",
                                fullName: fullName,
                                birthDate: data.birthDate
                            }
                        });
                    }
                }
            }
        });

        revalidatePath('/dashboard/profile')
        revalidatePath('/locataire/profile')
        revalidatePath('/locataire')

        // Audit Log
        try {
            await writeAuditLog({
                userId: session.user.id,
                action: "PROFILE_UPDATED",
                module: "USER_KYC",
                entityId: session.user.id,
                newValues: { kycLevel: newKycLevel }
            });
        } catch (auditErr) {
            console.error("Audit log error:", auditErr);
        }

        return { success: true, newKycLevel }

    } catch (error: any) {
        console.error("Error updating profile:", error)
        return { error: error.message || "Impossible de mettre à jour le profil." }
    }
}
