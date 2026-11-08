import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';
import { formatUserFriendlyError } from '@/lib/friendly-error';
import { generateLocalisationCode, deriveSimulatedW3W, validateCaptureCoherence } from '@/lib/geo-maposte';

/**
 * GET  /api/mobile/proprietaire/properties
 * Liste les propriétés du propriétaire
 *
 * POST /api/mobile/proprietaire/properties
 * Créer une nouvelle propriété
 */
export async function GET(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') ?? undefined;

        const where: any = {
            OR: [{ ownerUserId: user.userId }, { managedByUserId: user.userId }],
            ...(status ? { status } : {}),
        };

        const properties = await prisma.property.findMany({
            where,
            include: {
                images: { where: { isMain: true }, take: 1 },
                leases: {
                    where: { status: { in: ['ACTIVE', 'LOYER_IMPAYE', 'ACTIVE_DECLARATIF', 'PENDING_CONFIRMATION', 'PENDING_SIGNATURE', 'PENDING_DEPOSIT', 'MISE_EN_DEMEURE', 'CLEMENCE_EN_COURS'] } },
                    include: { tenant: { select: { firstName: true, lastName: true } } },
                    take: 1,
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const formatted = properties.map(p => {
            const activeLease = p.leases[0] ?? null;
            const isRented = Boolean(
                activeLease ||
                p.status === 'rented' ||
                p.status === 'RENTED'
            );
            return {
                id:               p.id,
                propertyCode:     p.propertyCode,
                name:             p.name ?? 'Bien sans nom',
                address:          p.address ?? '',
                commune:          p.commune ?? '',
                propertyType:     p.propertyType,
                typeStructure:    p.typeStructure,
                leaseType:        p.leaseType,
                status:           p.status,
                declaredRentFcfa: Number(p.declaredRentFcfa ?? 0),
                superficieM2:     p.superficieM2 ? Number(p.superficieM2) : null,
                imageUrl:         p.images[0]?.s3Key ?? null,
                occupancyStatus:  isRented ? 'Loué' : 'Vacant',
                isRented:         isRented,
                tenantName:       activeLease?.tenant
                                    ? `${activeLease.tenant.firstName ?? ''} ${activeLease.tenant.lastName ?? ''}`.trim()
                                    : null,
                currentRent:      activeLease ? Number(activeLease.rentAmount ?? 0) : Number(p.declaredRentFcfa ?? 0),
                gpsLatitude:      p.gpsLatitude,
                gpsLongitude:     p.gpsLongitude,
                precisionM:       p.precisionM,
                statutPosition:   p.statutPosition,
                codeLocalisation: p.codeLocalisation,
                w3w:              p.w3w,
            };
        });

        return NextResponse.json({ properties: formatted, currency: 'XOF' });
    } catch (error: any) {
        console.error('[MOBILE] proprietaire/properties GET error:', error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
        }

        const dbUser = await prisma.user.findUnique({
            where: { id: user.userId },
            select: { id: true, role: true }
        });
        if (!dbUser) {
            return NextResponse.json({ error: 'Compte utilisateur introuvable.' }, { status: 401 });
        }

        const body = await request.json();
        const { 
            name, 
            address, 
            commune, 
            propertyType, 
            leaseType, 
            declaredRentFcfa, 
            superficieM2, 
            typeStructure, 
            parentPropertyId, 
            unitLabel,
            forSale,
            prixVenteFcfa,
            categorie_vente,
            titre_type,
            titre_numero,
            numero_lot,
            numero_ilot,
            est_viabilise,
            gpsLatitude,
            gpsLongitude,
            precisionM
        } = body;

        if (!address || !commune) {
            return NextResponse.json({ error: "L'adresse et la commune sont obligatoires. Veuillez renseigner la localisation exacte du bien." }, { status: 400 });
        }

        const cleanCommune = String(commune).trim();
        const cleanAddress = String(address).trim();

        // Génération d'un code propriété garanti unique (Format QAPRIL HAB-ABJ-XXX-NNNNN)
        const count = await prisma.property.count({ where: { commune: cleanCommune } });
        const communeCode = (cleanCommune || 'ABJ').substring(0, 3).toUpperCase();
        const typePrefix = leaseType === 'commercial' ? 'COM' : 'HAB';
        let seq = count + 1;
        let candidateCode = `${typePrefix}-ABJ-${communeCode}-${String(seq).padStart(5, '0')}`;
        
        // Boucle de sécurité d'unicité
        let exists = await prisma.property.findUnique({ where: { propertyCode: candidateCode } });
        while (exists) {
            seq += 1;
            candidateCode = `${typePrefix}-ABJ-${communeCode}-${String(seq).padStart(5, '0')}`;
            exists = await prisma.property.findUnique({ where: { propertyCode: candidateCode } });
        }

        const finalPropertyCode = parentPropertyId && unitLabel 
            ? `${candidateCode}-${String(unitLabel).replace(/\s+/g, '').toUpperCase()}`
            : candidateCode;

        const effectiveRole = dbUser.role || user.role;
        const isAgencyUser = ['AGENCY', 'AGENCE_AGREE', 'NON_CERTIFIED_AGENT'].includes(effectiveRole);

        // RG-VTE-05 : CONTRÔLE D'UNICITÉ DU TITRE
        if (forSale && titre_numero && titre_type) {
            const titreClean = String(titre_numero).trim().toUpperCase();
            const doublon = await prisma.property.findFirst({
                where: {
                    titreType: titre_type,
                    titreNumero: titreClean,
                    city: { contains: cleanCommune, mode: 'insensitive' }
                }
            });

            if (doublon) {
                return NextResponse.json({
                    error: `RG-VTE-05 : Le titre ${titre_type} N° ${titreClean} est déjà enregistré sur la plateforme pour un bien sur ${cleanCommune}. La double mise en vente est strictement proscrite.`
                }, { status: 409 });
            }
        }

        let niveauVerif = 1;
        if (titre_type === 'ACD' || titre_type === 'TITRE_FONCIER') niveauVerif = 3;
        else if (titre_type) niveauVerif = 2;

        const parsedRent = declaredRentFcfa ? Math.round(Number(declaredRentFcfa)) : 0;
        const parsedSurface = superficieM2 ? parseFloat(String(superficieM2)) : null;
        const parsedPrixVente = prixVenteFcfa ? parseFloat(String(prixVenteFcfa)) : null;

        // ADD-28 : Traitement de la géolocalisation
        const rawLat = gpsLatitude !== undefined && gpsLatitude !== null ? parseFloat(String(gpsLatitude)) : null;
        const rawLng = gpsLongitude !== undefined && gpsLongitude !== null ? parseFloat(String(gpsLongitude)) : null;
        const rawPrecision = precisionM !== undefined && precisionM !== null ? Math.round(Number(precisionM)) : 15;
        const hasGps = rawLat !== null && rawLng !== null && !isNaN(rawLat) && !isNaN(rawLng);

        let codeLocalisation: string | null = null;
        let w3w: string | null = null;
        let statutPosition = 'MANQUANTE';

        if (hasGps) {
            codeLocalisation = generateLocalisationCode(cleanCommune, rawLat, rawLng);
            w3w = deriveSimulatedW3W(cleanCommune, rawLat, rawLng);
            statutPosition = 'DECLAREE';
        }

        const property = await prisma.property.create({
            data: {
                propertyCode:     finalPropertyCode,
                ownerUserId:      dbUser.id,
                managedByUserId:  isAgencyUser ? dbUser.id : null,
                managementMode:   isAgencyUser ? 'AGENCE' : 'DIRECT',
                name:             name ? String(name).trim() : cleanAddress,
                address:          cleanAddress,
                commune:          cleanCommune,
                city:             cleanCommune,
                propertyType:     propertyType ?? 'APARTMENT',
                typeStructure:    typeStructure ?? 'INDEPENDANT',
                leaseType:        leaseType ?? 'residential',
                declaredRentFcfa: parsedRent,
                superficieM2:     parsedSurface,
                parentPropertyId: parentPropertyId ?? null,
                unitLabel:        unitLabel ? String(unitLabel).trim() : null,
                status:           'ACTIVE',
                // ADD-28 : Géolocalisation
                gpsLatitude:      hasGps ? rawLat : null,
                gpsLongitude:     hasGps ? rawLng : null,
                precisionM:       hasGps ? rawPrecision : null,
                statutPosition,
                codeLocalisation,
                w3w,
                // ADD-25 Vente & Terrains (mapping exact Prisma schema)
                enVente:          Boolean(forSale),
                prixVenteFcfa:    parsedPrixVente,
                categorieVente:   categorie_vente ?? (forSale ? propertyType : null),
                titreType:        titre_type ?? null,
                titreNumero:      titre_numero ? String(titre_numero).trim().toUpperCase() : null,
                numeroLot:        numero_lot ? String(numero_lot).trim() : null,
                numeroIlot:       numero_ilot ? String(numero_ilot).trim() : null,
                viabilisationEau:         Boolean(est_viabilise),
                viabilisationElectricite: Boolean(est_viabilise),
                viabilisationVoirie:      Boolean(est_viabilise),
                niveauVerifVente:         forSale ? (niveauVerif || 1) : 0,
            },
        });

        if (hasGps && rawLat !== null && rawLng !== null) {
            try {
                await prisma.capturePosition.create({
                    data: {
                        propertyId: property.id,
                        userId: dbUser.id,
                        role: isAgencyUser ? 'AGENCE' : 'BAILLEUR',
                        lat: rawLat,
                        lng: rawLng,
                        precisionM: rawPrecision,
                        canal: 'APP',
                        resultat: 'ACCEPTEE'
                    }
                });
            } catch (capErr) {
                console.warn("[MOBILE] Avertissement capture position:", capErr);
            }
        }

        return NextResponse.json({
            success:      true,
            message:      'Bien créé avec succès.',
            propertyId:   property.id,
            propertyCode: property.propertyCode,
        }, { status: 201 });
    } catch (error: any) {
        console.error('[MOBILE] proprietaire/properties POST error:', error);
        return NextResponse.json({ error: formatUserFriendlyError(error, "Impossible de créer le bien. Veuillez vérifier les informations saisies.") }, { status: 500 });
    }
}
