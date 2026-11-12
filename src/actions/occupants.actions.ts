"use server";

import { prisma } from "@/lib/prisma";
import { ensureAuthenticated } from "./auth-helpers";
import { normalizePhone } from "@/lib/phone";
import { calculerNiveauResidence, genererPdfAttestationResidence } from "@/lib/occupants-attestation";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export async function getTenantOccupantsAndAttestations() {
    try {
        const session = await ensureAuthenticated();
        const userId = session.user.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { adresseMaPoste: true }
        });
        if (!user) return { success: false, error: "Utilisateur introuvable." };

        const normalized = user.phone ? normalizePhone(user.phone) : null;

        const activeLease = await prisma.lease.findFirst({
            where: {
                OR: [
                    { tenantId: userId },
                    ...(normalized ? [{ tenant: { phone: normalized } }] : []),
                    ...(user.email ? [{ tenant: { email: user.email } }] : [])
                ],
                status: { in: ["ACTIVE", "ACTIVE_DECLARATIF", "LOYER_IMPAYE", "PENDING_SIGNATURE", "PENDING_CONFIRMATION"] }
            },
            orderBy: { createdAt: "desc" },
            include: {
                property: true
            }
        });

        const attestations = await prisma.attestationResidence.findMany({
            where: { beneficiaireId: userId },
            orderBy: { emiseAt: "desc" },
            include: {
                lease: {
                    include: { property: { select: { name: true, commune: true, address: true } } }
                }
            }
        });

        if (!activeLease) {
            return {
                success: true,
                hasLease: false,
                lease: null,
                occupants: [],
                attestations: JSON.parse(JSON.stringify(attestations)),
                evaluation: null
            };
        }

        const occupants = await prisma.occupant.findMany({
            where: { leaseId: activeLease.id },
            orderBy: { createdAt: "desc" }
        });

        const evaluation = await calculerNiveauResidence(userId, activeLease.id).catch(() => ({
            niveau: "C" as const,
            qualite: "TITULAIRE" as const,
            motif: "Évaluation standard (Niveau C).",
            details: {
                isTitulaire: true,
                isDgiEnregistre: false,
                isPositionGelee: false,
                isIdentiteVerifiee: true,
                isPresenceSurPlace: true
            }
        }));

        return {
            success: true,
            hasLease: true,
            lease: JSON.parse(JSON.stringify(activeLease)),
            occupants: JSON.parse(JSON.stringify(occupants)),
            attestations: JSON.parse(JSON.stringify(attestations)),
            evaluation
        };
    } catch (error: any) {
        console.error("[getTenantOccupantsAndAttestations Error]:", error);
        return { success: false, error: error.message || "Erreur lors du chargement des occupants." };
    }
}

export async function declarerOccupantWeb(input: {
    leaseId: string;
    nom: string;
    prenoms: string;
    telephone?: string;
    dateNaissance?: string;
    mineur?: boolean;
    lien: string;
    dateEntree?: string;
    dateSortie?: string;
    nni?: string;
    sexe?: string;
    typeSejour?: string;
    dureeMois?: number;
    motifArrivee?: string;
    motifPrecision?: string;
    espaceOccupe?: string;
    priseEnCharge?: string;
    contactUrgenceNom?: string;
    contactUrgenceTel?: string;
    pieceIdentiteType?: string;
    observations?: string;
}) {
    try {
        const session = await ensureAuthenticated();
        const userId = session.user.id;

        const lease = await prisma.lease.findUnique({
            where: { id: input.leaseId },
            include: { property: true, tenant: true }
        });

        if (!lease) {
            return { success: false, error: "Contrat de bail introuvable." };
        }

        const currentCount = await prisma.occupant.count({
            where: {
                leaseId: input.leaseId,
                statut: { in: ["DECLARE", "CONFIRME"] },
                dateSortie: null
            }
        });

        if (currentCount >= 10) {
            return {
                success: false,
                error: "Plafond légal atteint (maximum 10 occupants simultanés par logement — RG-OCC-04)."
            };
        }

        const cleanNom = String(input.nom || "").trim().toUpperCase();
        const cleanPrenoms = String(input.prenoms || "").trim();
        if (!cleanNom || !cleanPrenoms) {
            return { success: false, error: "Le nom et les prénoms de l'occupant sont obligatoires." };
        }

        const cleanPhone = input.telephone ? String(input.telephone).trim() : null;
        const nniHash = input.nni
            ? crypto.createHash("sha256").update(String(input.nni).trim().toUpperCase()).digest("hex")
            : null;
        const isMinorBool = Boolean(input.mineur);
        const dateEntreeObj = input.dateEntree ? new Date(input.dateEntree) : new Date();
        const dateSortieObj = input.dateSortie ? new Date(input.dateSortie) : null;

        if (!isMinorBool && nniHash) {
            const activeElsewhere = await prisma.occupant.findFirst({
                where: {
                    nniHash,
                    statut: "CONFIRME",
                    mineur: false,
                    dateSortie: null,
                    leaseId: { not: input.leaseId }
                }
            });
            if (activeElsewhere) {
                await prisma.occupant.update({
                    where: { id: activeElsewhere.id },
                    data: {
                        dateSortie: dateEntreeObj,
                        statut: "CLOS"
                    }
                });
            }
        }

        const payloadToSign = `${input.leaseId}:${userId}:${cleanNom}:${cleanPrenoms}:${dateEntreeObj.toISOString()}`;
        const declarationSha256 = crypto.createHash("sha256").update(payloadToSign).digest("hex");

        const detailsMetadata = {
            sexe: input.sexe || null,
            typeSejour: input.typeSejour || (input.dateSortie ? "TEMPORAIRE" : "PERMANENT"),
            dureeMois: input.dureeMois || null,
            motifArrivee: input.motifArrivee || "REMARQUE_GENERALE",
            motifPrecision: input.motifPrecision || "",
            espaceOccupe: input.espaceOccupe || "CHAMBRE_INDIVIDUELLE",
            priseEnCharge: input.priseEnCharge || "CHARGE_TITULAIRE",
            contactUrgenceNom: input.contactUrgenceNom || "",
            contactUrgenceTel: input.contactUrgenceTel || "",
            pieceIdentiteType: input.pieceIdentiteType || "CNI",
            observations: input.observations || "",
            dateSortiePrevue: input.dateSortie || null
        };

        const occupant = await prisma.occupant.create({
            data: {
                leaseId: input.leaseId,
                propertyId: lease.propertyId,
                nom: cleanNom,
                prenoms: cleanPrenoms,
                telephone: cleanPhone,
                dateNaissance: input.dateNaissance ? new Date(input.dateNaissance) : null,
                mineur: isMinorBool,
                lien: String(input.lien || "AUTRE_FAMILLE").toUpperCase(),
                declareParUserId: userId,
                declareRole: "TITULAIRE",
                declarationSha256,
                dateEntree: dateEntreeObj,
                dateSortie: dateSortieObj,
                nniHash,
                statut: "CONFIRME",
                confirmeAt: new Date(),
                niveau: "C",
                motifDesaccord: JSON.stringify(detailsMetadata)
            }
        });

        revalidatePath("/mon-espace-locataire/occupants");
        revalidatePath("/mon-espace-locataire");

        return {
            success: true,
            message: "Occupant déclaré et rattaché au foyer avec succès.",
            occupant: JSON.parse(JSON.stringify(occupant))
        };
    } catch (error: any) {
        console.error("[declarerOccupantWeb Error]:", error);
        return { success: false, error: error.message || "Erreur lors de la déclaration de l'occupant." };
    }
}

export async function cloturerOccupantWeb(occupantId: string) {
    try {
        const session = await ensureAuthenticated();
        const occupant = await prisma.occupant.findUnique({
            where: { id: occupantId },
            include: { lease: true }
        });

        if (!occupant) {
            return { success: false, error: "Occupant introuvable." };
        }

        if (occupant.declareParUserId !== session.user.id && occupant.lease.tenantId !== session.user.id) {
            return { success: false, error: "Action non autorisée." };
        }

        await prisma.occupant.update({
            where: { id: occupantId },
            data: {
                dateSortie: new Date(),
                statut: "CLOS"
            }
        });

        revalidatePath("/mon-espace-locataire/occupants");
        return { success: true, message: "Sortie de l'occupant enregistrée." };
    } catch (error: any) {
        return { success: false, error: error.message || "Erreur lors de la clôture." };
    }
}

export async function genererAttestationResidenceWeb(leaseId: string) {
    try {
        const session = await ensureAuthenticated();
        const userId = session.user.id;

        const lease = await prisma.lease.findUnique({
            where: { id: leaseId },
            include: { property: true, tenant: true }
        });
        if (!lease) {
            return { success: false, error: "Contrat de bail introuvable." };
        }

        const dbUser = await prisma.user.findUnique({
            where: { id: userId },
            include: { adresseMaPoste: true }
        });
        if (!dbUser) {
            return { success: false, error: "Profil utilisateur introuvable." };
        }

        const evaluation = await calculerNiveauResidence(userId, leaseId);

        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, "0");
        const count = await prisma.attestationResidence.count();
        const numero = `ATT-${year}-${month}-${String(count + 1).padStart(6, "0")}`;

        const emiseAt = new Date();
        const valideJusque = new Date();
        valideJusque.setMonth(valideJusque.getMonth() + 3);

        const tokenVerif = crypto.randomBytes(16).toString("hex");
        const beneficiaireNom =
            `${dbUser.firstName || ""} ${dbUser.lastName || ""}`.trim() || dbUser.email || "Résident";

        const pdfResult = await genererPdfAttestationResidence({
            attestationNumero: numero,
            beneficiaireNom,
            beneficiaireTelephone: dbUser.phone || undefined,
            qualite: evaluation.qualite,
            niveau: evaluation.niveau,
            mentionLegaleNiveau: evaluation.motif,
            structureNom: lease.property.name || "Logement",
            commune: lease.property.commune,
            adresse: lease.property.address,
            etagePorte: lease.property.unitLabel || undefined,
            codeLocalisation: lease.property.codeLocalisation || undefined,
            w3w: lease.property.w3w || undefined,
            dateEntree: lease.startDate,
            dateEmission: emiseAt,
            dateExpiration: valideJusque,
            leaseRef: lease.leaseReference,
            isDgiEnregistre: evaluation.details.isDgiEnregistre,
            tokenVerif,
            identifiantMaPoste: dbUser.adresseMaPoste?.identifiantBoite || undefined
        });

        const attestation = await prisma.attestationResidence.create({
            data: {
                beneficiaireId: userId,
                qualite: evaluation.qualite,
                leaseId,
                niveau: evaluation.niveau,
                numero,
                emiseAt,
                valideJusque,
                statut: "VALIDE",
                sha256: pdfResult.sha256,
                tokenVerif,
                pdfUrl: pdfResult.publicUrl
            }
        });

        revalidatePath("/mon-espace-locataire/occupants");

        return {
            success: true,
            message: `Attestation officielle ${numero} (Niveau ${evaluation.niveau}) générée avec succès.`,
            attestation: JSON.parse(JSON.stringify(attestation))
        };
    } catch (error: any) {
        console.error("[genererAttestationResidenceWeb Error]:", error);
        return { success: false, error: error.message || "Erreur lors de la génération de l'attestation." };
    }
}

