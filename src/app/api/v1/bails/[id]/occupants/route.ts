import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';
import crypto from 'crypto';

/**
 * POST /api/v1/bails/[id]/occupants
 * Déclarer un occupant du logement (RG-OCC-01 à 07)
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: "Non autorisé. Jeton invalide ou expiré." }, { status: 401 });
        }

        const { id: leaseId } = await params;
        const lease = await prisma.lease.findUnique({
            where: { id: leaseId },
            include: { property: true }
        });

        if (!lease) {
            return NextResponse.json({ error: "Contrat de bail introuvable." }, { status: 404 });
        }

        // Contrôle des autorisations du déclarant (Titulaire ou Bailleur/Mandataire RG-OCC-02)
        const isTitulaire = lease.tenantId === user.userId;
        const isBailleur = lease.landlordId === user.userId || lease.property.ownerUserId === user.userId;
        const isAgent = lease.agentId === user.userId || lease.property.managedByUserId === user.userId;

        if (!isTitulaire && !isBailleur && !isAgent) {
            return NextResponse.json({ error: "Accès refusé. Seul le titulaire du bail ou le bailleur peut déclarer un occupant." }, { status: 403 });
        }

        const body = await request.json().catch(() => ({}));
        const {
            nom,
            prenoms,
            telephone,
            dateNaissance,
            mineur = false,
            lien = 'AUTRE_FAMILLE',
            typeLien,
            dateEntree,
            dateSortie,
            sexe,
            typeSejour,
            dureeMois,
            motifArrivee,
            motifPrecision,
            espaceOccupe,
            priseEnCharge,
            contactUrgenceNom,
            contactUrgenceTel,
            pieceIdentiteType,
            typePiece,
            nni,
            numeroPiece,
            observations
        } = body;

        const effectiveNom = String(nom || '').trim().toUpperCase();
        const effectivePrenoms = String(prenoms || '').trim();
        const effectiveLien = String(lien || typeLien || 'AUTRE_FAMILLE').toUpperCase();
        const effectiveNni = nni || numeroPiece || null;
        const effectivePieceType = pieceIdentiteType || typePiece || 'CNI';

        if (!effectiveNom || !effectivePrenoms) {
            return NextResponse.json({ error: "Le nom et les prénoms de l'occupant ou invité sont obligatoires." }, { status: 400 });
        }

        // 1. Contrôle du plafond légal : max 10 occupants simultanés (RG-OCC-04)
        const currentCount = await prisma.occupant.count({
            where: {
                leaseId,
                statut: { in: ['DECLARE', 'CONFIRME'] },
                dateSortie: null,
            }
        });

        if (currentCount >= 10) {
            return NextResponse.json({
                error: "Plafond légal atteint (maximum 10 occupants par logement selon le standard La Poste CI / RG-OCC-04)."
            }, { status: 400 });
        }

        const cleanNom = effectiveNom;
        const cleanPrenoms = effectivePrenoms;
        const cleanPhone = telephone ? String(telephone).trim() : null;
        const nniHash = effectiveNni ? crypto.createHash('sha256').update(String(effectiveNni).trim().toUpperCase()).digest('hex') : null;
        const isMinorBool = Boolean(mineur);

        // 2. Unicité stricte d'adresse pour les personnes majeures (RG-OCC-05)
        if (!isMinorBool && nniHash) {
            const activeElsewhere = await prisma.occupant.findFirst({
                where: {
                    nniHash,
                    statut: 'CONFIRME',
                    mineur: false,
                    dateSortie: null,
                    leaseId: { not: leaseId }
                }
            });

            if (activeElsewhere) {
                // Clôture automatique de l'ancienne déclaration à la date d'entrée
                await prisma.occupant.update({
                    where: { id: activeElsewhere.id },
                    data: {
                        dateSortie: dateEntree ? new Date(dateEntree) : new Date(),
                        statut: 'CLOS'
                    }
                });
            }
        }

        // 3. Empreinte SHA-256 de la déclaration signée (RG-OCC-07)
        const dateEntreeObj = dateEntree ? new Date(dateEntree) : new Date();
        const dateSortieObj = dateSortie ? new Date(dateSortie) : null;
        const payloadToSign = `${leaseId}:${user.userId}:${cleanNom}:${cleanPrenoms}:${dateEntreeObj.toISOString()}`;
        const declarationSha256 = crypto.createHash('sha256').update(payloadToSign).digest('hex');

        // Métadonnées enrichies d'hébergement ADD-29
        const detailsMetadata = {
            sexe: sexe || null,
            typeSejour: typeSejour || (dateSortie ? 'TEMPORAIRE' : 'PERMANENT'),
            dureeMois: dureeMois || null,
            motifArrivee: motifArrivee || (effectiveLien === 'HEBERGE' ? 'VACANCES_VISITE' : 'REGROUPEMENT_FAMILIAL'),
            motifPrecision: motifPrecision || '',
            espaceOccupe: espaceOccupe || 'CHAMBRE_INDIVIDUELLE',
            priseEnCharge: priseEnCharge || 'CHARGE_TITULAIRE',
            contactUrgenceNom: contactUrgenceNom || '',
            contactUrgenceTel: contactUrgenceTel || '',
            pieceIdentiteType: effectivePieceType,
            observations: observations || '',
            dateSortiePrevue: dateSortie || null,
        };

        // Création de l'occupant / invité
        const declareRole = isTitulaire ? 'TITULAIRE' : isBailleur ? 'BAILLEUR' : 'MANDATAIRE';
        const occupant = await prisma.occupant.create({
            data: {
                leaseId,
                propertyId: lease.propertyId,
                nom: cleanNom,
                prenoms: cleanPrenoms,
                telephone: cleanPhone,
                dateNaissance: dateNaissance ? new Date(dateNaissance) : null,
                mineur: isMinorBool,
                lien: effectiveLien,
                declareParUserId: user.userId,
                declareRole,
                declarationSha256,
                dateEntree: dateEntreeObj,
                dateSortie: dateSortieObj,
                nniHash,
                statut: 'CONFIRME',
                confirmeAt: new Date(),
                niveau: 'C',
                motifDesaccord: JSON.stringify(detailsMetadata)
            }
        });

        const isInvite = effectiveLien === 'HEBERGE' || typeSejour === 'TEMPORAIRE';
        const messageSuccess = isInvite
            ? `Invité(e) ${cleanNom} ${cleanPrenoms} hébergé(e) et enregistré(e) avec succès avec scellé SHA-256.`
            : isMinorBool
                ? "Occupant mineur rattaché avec succès au foyer du titulaire."
                : "Occupant déclaré et rattaché au foyer avec succès.";

        return NextResponse.json({
            success: true,
            message: messageSuccess,
            occupant
        }, { status: 201 });

    } catch (error: any) {
        console.error("[OCCUPANTS POST] Error:", error);
        return NextResponse.json({ error: "Erreur lors de la déclaration de l'occupant." }, { status: 500 });
    }
}

/**
 * GET /api/v1/bails/[id]/occupants
 * Liste des occupants déclarés d'un bail (RG-OCC-02)
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
        }

        const { id: leaseId } = await params;
        const lease = await prisma.lease.findUnique({
            where: { id: leaseId },
            include: { property: true }
        });

        if (!lease) {
            return NextResponse.json({ error: "Contrat de bail introuvable." }, { status: 404 });
        }

        const isTitulaire = lease.tenantId === user.userId;
        const isBailleur = lease.landlordId === user.userId || lease.property.ownerUserId === user.userId;
        const isAgent = lease.agentId === user.userId || lease.property.managedByUserId === user.userId;

        if (!isTitulaire && !isBailleur && !isAgent) {
            return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
        }

        const occupants = await prisma.occupant.findMany({
            where: { leaseId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                nom: true,
                prenoms: true,
                telephone: isTitulaire ? true : false, // Numéro masqué au bailleur pour vie privée
                lien: true,
                mineur: true,
                dateEntree: true,
                dateSortie: true,
                statut: true,
                niveau: true,
                confirmeAt: true,
                declareRole: true,
                motifDesaccord: true,
                createdAt: true,
            }
        });

        return NextResponse.json({
            success: true,
            occupants,
            totalActifs: occupants.filter(o => o.statut === 'CONFIRME' && !o.dateSortie).length
        });
    } catch (error: any) {
        console.error("[OCCUPANTS GET] Error:", error);
        return NextResponse.json({ error: "Erreur lors de la récupération des occupants." }, { status: 500 });
    }
}

