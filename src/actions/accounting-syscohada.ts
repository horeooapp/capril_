"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { PLAN_COMPTABLE_SYSCOHADA, CompteSyscohada } from "@/constants/syscohada-plan";

export interface SyscohadaEntryLine {
    id: string;
    date: string; // YYYY-MM-DD
    journalCode: string;
    pieceRef: string;
    compteDebit: string;
    compteCredit: string;
    libelle: string;
    montant: number;
    source: 'AUTO_RECEIPT' | 'AUTO_LEASE' | 'AUTO_COMMISSION' | 'AUTO_REVERSAL' | 'MANUAL';
    metadata?: Record<string, any>;
}

export interface SyscohadaAccountSummary {
    numero: string;
    intitule: string;
    classe: number;
    categorie: 'ACTIF' | 'PASSIF' | 'CHARGE' | 'PRODUIT';
    sensNormal: 'DEBITEUR' | 'CREDITEUR';
    totalDebit: number;
    totalCredit: number;
    soldeDebiteur: number;
    soldeCrediteur: number;
    movementsCount: number;
}

export interface GrandLivreMovement {
    id: string;
    date: string;
    journalCode: string;
    pieceRef: string;
    libelle: string;
    debit: number;
    credit: number;
    soldeProgressif: number;
    contrepartie: string;
}

export interface SyscohadaAccountingData {
    entries: SyscohadaEntryLine[];
    balance: SyscohadaAccountSummary[];
    totals: {
        totalDebit: number;
        totalCredit: number;
        totalSoldeDebiteur: number;
        totalSoldeCrediteur: number;
        isEquilibree: boolean;
    };
    compteResultat: {
        totalProduits: number;
        totalCharges: number;
        resultatExploitation: number;
        produitsDetail: { numero: string; intitule: string; montant: number }[];
        chargesDetail: { numero: string; intitule: string; montant: number }[];
    };
    bilan: {
        actif: {
            immobilise: number;
            circulant: number;
            tresorerie: number;
            total: number;
            items: { numero: string; intitule: string; montant: number }[];
        };
        passif: {
            capitauxPropres: number;
            passifCirculant: number;
            tresoreriePassif: number;
            total: number;
            items: { numero: string; intitule: string; montant: number }[];
        };
        equilibre: number;
    };
    rapprochementMandants: {
        tresorerieMandants: number; // 521200 + 571100
        detteBailleurs: number;     // 467100
        cautionsDetenues: number;   // 165100 + 467200
        totalExigibleMandants: number;
        ecartCouverture: number;
        tauxCouverture: number;
        conforme: boolean;
    };
    kpis: {
        chiffreAffairesHT: number;
        tvaCollectee: number;
        chargesExploitation: number;
        loyersEncaisses: number;
        commissionsGestion: number;
        totalEcritures: number;
        periode: string;
    };
}

const COMPTE_MAP = new Map<string, CompteSyscohada>(
    PLAN_COMPTABLE_SYSCOHADA.map(c => [c.numero, c])
);

function getAccountInfo(numero: string): CompteSyscohada {
    const found = COMPTE_MAP.get(numero);
    if (found) return found;

    const classe = parseInt(numero.charAt(0), 10) || 4;
    let categorie: 'ACTIF' | 'PASSIF' | 'CHARGE' | 'PRODUIT' = 'ACTIF';
    let sensNormal: 'DEBITEUR' | 'CREDITEUR' = 'DEBITEUR';

    if (classe === 1) { categorie = 'PASSIF'; sensNormal = 'CREDITEUR'; }
    else if (classe === 2) { categorie = 'ACTIF'; sensNormal = 'DEBITEUR'; }
    else if (classe === 3) { categorie = 'ACTIF'; sensNormal = 'DEBITEUR'; }
    else if (classe === 4) {
        if (numero.startsWith('40') || numero.startsWith('443') || numero.startsWith('4671') || numero.startsWith('4672') || numero.startsWith('421')) {
            categorie = 'PASSIF'; sensNormal = 'CREDITEUR';
        } else {
            categorie = 'ACTIF'; sensNormal = 'DEBITEUR';
        }
    } else if (classe === 5) {
        categorie = 'ACTIF'; sensNormal = 'DEBITEUR';
    } else if (classe === 6) {
        categorie = 'CHARGE'; sensNormal = 'DEBITEUR';
    } else if (classe === 7) {
        categorie = 'PRODUIT'; sensNormal = 'CREDITEUR';
    }

    return {
        numero,
        intitule: `Compte ${numero}`,
        classe,
        categorie,
        description: `Compte SYSCOHADA personnalisé ${numero}`,
        sensNormal
    };
}

/**
 * Récupère la liste de toutes les agences pour le filtre administrateur.
 */
export async function getAgenciesList(): Promise<{ id: string; name: string; email?: string }[]> {
    try {
        const agencies = await (prisma as any).user.findMany({
            where: {
                OR: [
                    { role: "AGENCY" },
                    { agencyConfig: { not: null } }
                ]
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                agencyConfig: true
            },
            orderBy: { firstName: "asc" }
        });

        return agencies.map((a: any) => {
            const config = (a.agencyConfig as any) || {};
            const name = config.agencyName || 
                (a.firstName ? `${a.firstName} ${a.lastName || ''}`.trim() : a.email);
            return {
                id: a.id,
                name: name || "Agence Immobilière",
                email: a.email
            };
        });
    } catch {
        return [];
    }
}

/**
 * Récupère l'ensemble des données comptables SYSCOHADA (pour une agence ou consolidé national).
 */
export async function getAgencyAccountingData(
    filterYear?: number,
    targetAgencyId?: string
): Promise<{ success: boolean; data?: SyscohadaAccountingData; error?: string }> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Non authentifié" };
        }

        const userRole = (session.user.role || "").toUpperCase();
        const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";

        // Si l'utilisateur est admin et qu'aucune agence n'est ciblée (ou targetAgencyId === "ALL"),
        // alors on effectue une consolidation globale de TOUTE la plateforme !
        const isGlobalAdminConsolidated = isAdmin && (!targetAgencyId || targetAgencyId === "ALL");
        const effectiveAgencyId = isGlobalAdminConsolidated ? null : (isAdmin ? targetAgencyId : session.user.id);
        const currentYear = filterYear || new Date().getFullYear();

        // 1. Récupérer les écritures manuelles et les configurations
        let manualEntries: SyscohadaEntryLine[] = [];
        let defaultCommissionRate = 10;

        if (effectiveAgencyId) {
            const user = await (prisma as any).user.findUnique({
                where: { id: effectiveAgencyId },
                select: { id: true, agencyConfig: true, role: true }
            });
            if (user) {
                const conf = (user.agencyConfig as any) || {};
                manualEntries = Array.isArray(conf.syscohadaEntries) ? conf.syscohadaEntries : [];
                if (conf.defaultCommissionRate) defaultCommissionRate = conf.defaultCommissionRate;
            }
        } else if (isGlobalAdminConsolidated) {
            // Consolidation de toutes les écritures manuelles créées par les agences ou admins
            const agencyUsers = await (prisma as any).user.findMany({
                where: { agencyConfig: { not: null } },
                select: { agencyConfig: true }
            }).catch(() => []);
            for (const u of agencyUsers) {
                const conf = (u.agencyConfig as any) || {};
                if (Array.isArray(conf.syscohadaEntries)) {
                    manualEntries.push(...conf.syscohadaEntries);
                }
            }
        }

        // 2. Récupérer les biens gérés
        let directProperties: any[] = [];
        let accesses: any[] = [];

        if (effectiveAgencyId) {
            directProperties = await (prisma as any).property.findMany({
                where: { OR: [{ ownerUserId: effectiveAgencyId }, { managedByUserId: effectiveAgencyId }] },
                select: { id: true, propertyCode: true, name: true }
            }).catch(() => []);

            accesses = await (prisma as any).propertyAccess.findMany({
                where: { userId: effectiveAgencyId, revokedAt: null, statut: "ACTIF" },
                select: { propertyId: true }
            }).catch(() => []);
        } else {
            // Consolidé global admin : tous les biens
            directProperties = await (prisma as any).property.findMany({
                select: { id: true, propertyCode: true, name: true }
            }).catch(() => []);
        }

        const propertyIds = Array.from(new Set([
            ...directProperties.map((p: any) => p.id),
            ...accesses.map((a: any) => a.propertyId)
        ]));

        // 3. Récupérer les baux associés
        let leases: any[] = [];
        if (effectiveAgencyId) {
            leases = await (prisma as any).lease.findMany({
                where: {
                    OR: [
                        { agentId: effectiveAgencyId },
                        ...(propertyIds.length > 0 ? [{ propertyId: { in: propertyIds } }] : [])
                    ]
                },
                include: {
                    property: { select: { id: true, propertyCode: true, name: true } }
                }
            }).catch(() => []);
        } else {
            // Consolidé global admin : tous les baux du parc
            leases = await (prisma as any).lease.findMany({
                include: {
                    property: { select: { id: true, propertyCode: true, name: true } }
                }
            }).catch(() => []);
        }

        const leaseIds = leases.map((l: any) => l.id);

        // 4. Récupérer les quittances encaissées
        const receipts = leaseIds.length > 0 ? await (prisma as any).receipt.findMany({
            where: {
                leaseId: { in: leaseIds },
                status: { in: ["paid", "PAID", "Paid", "validee", "VALIDEE"] }
            },
            orderBy: { createdAt: "asc" }
        }).catch(() => []) : [];

        // 5. Synthèse automatique des écritures SYSCOHADA
        const generatedEntries: SyscohadaEntryLine[] = [];

        // A. Cautions et dépôts de garantie des baux actifs
        leases.forEach((lease: any) => {
            if (lease.depositAmount && Number(lease.depositAmount) > 0) {
                const leaseDate = lease.startDate ? new Date(lease.startDate).toISOString().slice(0, 10) : `${currentYear}-01-01`;
                const entryYear = parseInt(leaseDate.slice(0, 4), 10);
                
                if (!filterYear || entryYear === currentYear) {
                    generatedEntries.push({
                        id: `auto-dep-${lease.id}`,
                        date: leaseDate,
                        journalCode: "BQ_MAND",
                        pieceRef: `CAUTION-${lease.leaseReference}`,
                        compteDebit: "521200", // Banque Séquestre Mandants
                        compteCredit: "165100", // Dépôts de garantie reçus des locataires
                        libelle: `Dépôt caution séquestre - Bail ${lease.leaseReference} (${lease.property?.name || lease.property?.propertyCode || 'Bien'})`,
                        montant: Math.round(Number(lease.depositAmount)),
                        source: "AUTO_LEASE",
                        metadata: { leaseId: lease.id, leaseRef: lease.leaseReference }
                    });
                }
            }
        });

        // Taux de commission d'agence par défaut (10% TTC standard en CI)
        const commissionRate = defaultCommissionRate / 100;
        const tvaRate = 0.18; // TVA en Côte d'Ivoire / UEMOA (18%)

        // B. Encaissements de loyers et prélèvement d'honoraires
        receipts.forEach((rcp: any) => {
            const rawDate = rcp.paidAt || rcp.dateEncaissement || rcp.createdAt;
            const entryDate = rawDate ? new Date(rawDate).toISOString().slice(0, 10) : `${currentYear}-01-01`;
            const entryYear = parseInt(entryDate.slice(0, 4), 10);

            if (filterYear && entryYear !== currentYear) return;

            const totalAmount = Math.round(Number(rcp.totalAmount || rcp.rentAmount || 0));
            if (totalAmount <= 0) return;

            // Déterminer le compte de trésorerie selon le mode de paiement
            let compteTresorerie = "521200"; // Banque Séquestre
            let journal = "BQ_MAND";
            const method = (rcp.paymentMethod || "").toUpperCase();

            if (method.includes("MOMO") || method.includes("WAVE") || method.includes("ORANGE") || method.includes("MTN")) {
                compteTresorerie = "571100"; // Mobile Money
                journal = "MOMO";
            } else if (method.includes("CASH") || method.includes("ESPECE")) {
                compteTresorerie = "531100"; // Caisse
                journal = "CAISSE";
            }

            // Écriture 1: Encaissement du loyer au compte mandant
            // Débit Trésorerie Séquestre / Crédit 467100 Bailleurs Mandants
            generatedEntries.push({
                id: `auto-rcp-enc-${rcp.id}`,
                date: entryDate,
                journalCode: journal,
                pieceRef: rcp.receiptRef || `QUITT-${rcp.id.slice(0, 8)}`,
                compteDebit: compteTresorerie,
                compteCredit: "467100", // Bailleurs Mandants
                libelle: `Encaissement loyer ${rcp.periodMonth || rcp.moisConcerne || ''} - Quittance ${rcp.receiptRef || ''}`,
                montant: totalAmount,
                source: "AUTO_RECEIPT",
                metadata: { receiptId: rcp.id, leaseId: rcp.leaseId }
            });

            // Écriture 2: Prélèvement des Honoraires de Gestion de l'Agence
            const commissionTTC = Math.round(totalAmount * commissionRate);
            const commissionHT = Math.round(commissionTTC / (1 + tvaRate));
            const tvaCollectee = commissionTTC - commissionHT;

            if (commissionTTC > 0) {
                // Débit 467100 Bailleurs Mandants (prélèvement sur les loyers dus)
                // Crédit 706100 Honoraires de gestion HT
                generatedEntries.push({
                    id: `auto-com-ht-${rcp.id}`,
                    date: entryDate,
                    journalCode: "GESTION",
                    pieceRef: `HON-${rcp.receiptRef || rcp.id.slice(0, 8)}`,
                    compteDebit: "467100", // Bailleurs Mandants
                    compteCredit: "706100", // Honoraires de gestion HT
                    libelle: `Honoraires de gestion HT (${(commissionRate * 100).toFixed(0)}%) - Quittance ${rcp.receiptRef || ''}`,
                    montant: commissionHT,
                    source: "AUTO_COMMISSION",
                    metadata: { receiptId: rcp.id }
                });

                if (tvaCollectee > 0) {
                    generatedEntries.push({
                        id: `auto-com-tva-${rcp.id}`,
                        date: entryDate,
                        journalCode: "GESTION",
                        pieceRef: `TVA-${rcp.receiptRef || rcp.id.slice(0, 8)}`,
                        compteDebit: "467100", // Bailleurs Mandants
                        compteCredit: "443100", // État TVA facturée 18%
                        libelle: `TVA 18% sur honoraires - Quittance ${rcp.receiptRef || ''}`,
                        montant: tvaCollectee,
                        source: "AUTO_COMMISSION",
                        metadata: { receiptId: rcp.id }
                    });
                }

                // Virement interne des honoraires d'agence du compte séquestre vers le compte d'exploitation
                generatedEntries.push({
                    id: `auto-trf-hon-${rcp.id}`,
                    date: entryDate,
                    journalCode: "OD",
                    pieceRef: `VIR-HON-${rcp.receiptRef || rcp.id.slice(0, 8)}`,
                    compteDebit: "521100", // Banque Exploitation Agence
                    compteCredit: compteTresorerie, // Prélèvement sur compte séquestre/caisse
                    libelle: `Prélèvement honoraires agence vers compte d'exploitation - Réf ${rcp.receiptRef || ''}`,
                    montant: commissionTTC,
                    source: "AUTO_COMMISSION",
                    metadata: { receiptId: rcp.id }
                });
            }
        });

        // C. Reversements de loyers aux bailleurs (Disbursements / Reversals)
        const reversals = await (prisma as any).reversalTransaction.findMany({
            where: {
                status: { in: ["SUCCESS", "REVERSED"] }
            },
            include: {
                recipient: { select: { id: true, firstName: true, lastName: true } }
            }
        }).catch(() => []);

        reversals.forEach((rev: any) => {
            const revDate = rev.createdAt ? new Date(rev.createdAt).toISOString().slice(0, 10) : `${currentYear}-01-01`;
            const entryYear = parseInt(revDate.slice(0, 4), 10);
            if (filterYear && entryYear !== currentYear) return;

            const montant = Math.round(Number(rev.amount || 0));
            if (montant <= 0) return;

            generatedEntries.push({
                id: `auto-rev-${rev.id}`,
                date: revDate,
                journalCode: "REV_BAIL",
                pieceRef: rev.referencePgw || `REV-${rev.id.slice(0, 8)}`,
                compteDebit: "467100", // Débit Bailleurs Mandants (apurement de la dette envers le bailleur)
                compteCredit: "521200", // Crédit Banque Séquestre (décaissement des fonds)
                libelle: `Reversement loyer net au bailleur ${rev.recipient?.firstName || ''} ${rev.recipient?.lastName || ''}`.trim(),
                montant: montant,
                source: "AUTO_REVERSAL",
                metadata: { reversalId: rev.id, paymentId: rev.paymentId }
            });
        });

        // 6. Fusionner avec les écritures manuelles
        const filteredManualEntries = filterYear 
            ? manualEntries.filter(e => parseInt(e.date.slice(0, 4), 10) === currentYear)
            : manualEntries;

        const allEntries: SyscohadaEntryLine[] = [...generatedEntries, ...filteredManualEntries].sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        // 7. Calcul de la Balance Générale des Comptes (Balance à 4 et 6 colonnes)
        const accountBalancesMap = new Map<string, { totalDebit: number; totalCredit: number; count: number }>();

        allEntries.forEach(entry => {
            // Compte Débit
            const deb = accountBalancesMap.get(entry.compteDebit) || { totalDebit: 0, totalCredit: 0, count: 0 };
            deb.totalDebit += entry.montant;
            deb.count += 1;
            accountBalancesMap.set(entry.compteDebit, deb);

            // Compte Crédit
            const cred = accountBalancesMap.get(entry.compteCredit) || { totalDebit: 0, totalCredit: 0, count: 0 };
            cred.totalCredit += entry.montant;
            cred.count += 1;
            accountBalancesMap.set(entry.compteCredit, cred);
        });

        const balanceList: SyscohadaAccountSummary[] = [];
        let grandTotalDebit = 0;
        let grandTotalCredit = 0;
        let totalSoldeDebiteur = 0;
        let totalSoldeCrediteur = 0;

        accountBalancesMap.forEach((val, num) => {
            const info = getAccountInfo(num);
            const net = val.totalDebit - val.totalCredit;
            const soldeDebiteur = net > 0 ? net : 0;
            const soldeCrediteur = net < 0 ? Math.abs(net) : 0;

            grandTotalDebit += val.totalDebit;
            grandTotalCredit += val.totalCredit;
            totalSoldeDebiteur += soldeDebiteur;
            totalSoldeCrediteur += soldeCrediteur;

            balanceList.push({
                numero: num,
                intitule: info.intitule,
                classe: info.classe,
                categorie: info.categorie,
                sensNormal: info.sensNormal,
                totalDebit: val.totalDebit,
                totalCredit: val.totalCredit,
                soldeDebiteur,
                soldeCrediteur,
                movementsCount: val.count
            });
        });

        // Trier la balance par numéro de compte croissant
        balanceList.sort((a, b) => a.numero.localeCompare(b.numero));

        // 8. Calcul du Compte de Résultat SYSCOHADA (Produits Classe 7 - Charges Classe 6)
        const produitsDetail: { numero: string; intitule: string; montant: number }[] = [];
        const chargesDetail: { numero: string; intitule: string; montant: number }[] = [];

        let totalProduits = 0;
        let totalCharges = 0;

        balanceList.forEach(acc => {
            if (acc.classe === 7) {
                // Solde créditeur net des comptes de classe 7
                const montant = acc.totalCredit - acc.totalDebit;
                if (montant > 0) {
                    totalProduits += montant;
                    produitsDetail.push({ numero: acc.numero, intitule: acc.intitule, montant });
                }
            } else if (acc.classe === 6) {
                // Solde débiteur net des comptes de classe 6
                const montant = acc.totalDebit - acc.totalCredit;
                if (montant > 0) {
                    totalCharges += montant;
                    chargesDetail.push({ numero: acc.numero, intitule: acc.intitule, montant });
                }
            }
        });

        const resultatExploitation = totalProduits - totalCharges;

        // 9. Calcul du Bilan Synthétique SYSCOHADA
        let actifImmobilise = 0;
        let actifCirculant = 0;
        let actifTresorerie = 0;
        const actifItems: { numero: string; intitule: string; montant: number }[] = [];

        let capitauxPropres = 0;
        let passifCirculant = 0;
        let passifTresorerie = 0;
        const passifItems: { numero: string; intitule: string; montant: number }[] = [];

        balanceList.forEach(acc => {
            const net = acc.totalDebit - acc.totalCredit;

            if (acc.classe === 2) {
                // Actif immobilisé (solde débiteur)
                const val = net > 0 ? net : 0;
                actifImmobilise += val;
                if (val > 0) actifItems.push({ numero: acc.numero, intitule: acc.intitule, montant: val });
            } else if (acc.classe === 3 || (acc.classe === 4 && net > 0)) {
                // Actif circulant
                actifCirculant += net;
                actifItems.push({ numero: acc.numero, intitule: acc.intitule, montant: net });
            } else if (acc.classe === 5 && net > 0) {
                // Trésorerie Actif
                actifTresorerie += net;
                actifItems.push({ numero: acc.numero, intitule: acc.intitule, montant: net });
            } else if (acc.classe === 1) {
                // Capitaux propres & Dettes financières
                const val = acc.totalCredit - acc.totalDebit;
                capitauxPropres += val;
                if (val > 0) passifItems.push({ numero: acc.numero, intitule: acc.intitule, montant: val });
            } else if (acc.classe === 4 && net < 0) {
                // Passif circulant (Dettes d'exploitation, Bailleurs mandants, TVA)
                const val = Math.abs(net);
                passifCirculant += val;
                passifItems.push({ numero: acc.numero, intitule: acc.intitule, montant: val });
            } else if (acc.classe === 5 && net < 0) {
                // Trésorerie Passif (découverts)
                const val = Math.abs(net);
                passifTresorerie += val;
                passifItems.push({ numero: acc.numero, intitule: acc.intitule, montant: val });
            }
        });

        // Ajouter le Résultat Net aux Capitaux Propres au Bilan
        if (resultatExploitation !== 0) {
            capitauxPropres += resultatExploitation;
            passifItems.push({
                numero: resultatExploitation >= 0 ? "131000" : "139000",
                intitule: resultatExploitation >= 0 ? "Résultat net de l'exercice (Bénéfice)" : "Résultat net de l'exercice (Perte)",
                montant: resultatExploitation
            });
        }

        const totalActif = actifImmobilise + actifCirculant + actifTresorerie;
        const totalPassif = capitauxPropres + passifCirculant + passifTresorerie;

        // 10. Rapprochement Fonds Mandants vs Dettes envers Bailleurs (Audit Légal CI / OHADA)
        // Compte 521200 (Banque Séquestre) + 571100 (Mobile Money)
        const soldeBanqueSequestre = (accountBalancesMap.get("521200")?.totalDebit || 0) - (accountBalancesMap.get("521200")?.totalCredit || 0);
        const soldeMobileMoney = (accountBalancesMap.get("571100")?.totalDebit || 0) - (accountBalancesMap.get("571100")?.totalCredit || 0);
        const tresorerieMandants = Math.max(0, soldeBanqueSequestre + soldeMobileMoney);

        // Compte 467100 (Bailleurs Mandants - Loyers nets à reverser)
        const detteBailleursNet = (accountBalancesMap.get("467100")?.totalCredit || 0) - (accountBalancesMap.get("467100")?.totalDebit || 0);
        const detteBailleurs = Math.max(0, detteBailleursNet);

        // Compte 165100 (Dépôts de garantie) + 467200
        const cautions165 = (accountBalancesMap.get("165100")?.totalCredit || 0) - (accountBalancesMap.get("165100")?.totalDebit || 0);
        const cautions4672 = (accountBalancesMap.get("467200")?.totalCredit || 0) - (accountBalancesMap.get("467200")?.totalDebit || 0);
        const cautionsDetenues = Math.max(0, cautions165 + cautions4672);

        const totalExigibleMandants = detteBailleurs + cautionsDetenues;
        const ecartCouverture = tresorerieMandants - totalExigibleMandants;
        const tauxCouverture = totalExigibleMandants > 0 
            ? Math.round((tresorerieMandants / totalExigibleMandants) * 100) 
            : 100;
        const conforme = ecartCouverture >= 0;

        // 11. KPIs généraux
        const loyersEncaisses = receipts.reduce((acc: number, r: any) => acc + Number(r.totalAmount || r.rentAmount || 0), 0);
        const commissionsGestion = Math.round(loyersEncaisses * commissionRate);
        const tvaCollectee = (accountBalancesMap.get("443100")?.totalCredit || 0) - (accountBalancesMap.get("443100")?.totalDebit || 0);

        const accountingData: SyscohadaAccountingData = {
            entries: allEntries,
            balance: balanceList,
            totals: {
                totalDebit: grandTotalDebit,
                totalCredit: grandTotalCredit,
                totalSoldeDebiteur,
                totalSoldeCrediteur,
                isEquilibree: grandTotalDebit === grandTotalCredit
            },
            compteResultat: {
                totalProduits,
                totalCharges,
                resultatExploitation,
                produitsDetail,
                chargesDetail
            },
            bilan: {
                actif: {
                    immobilise: actifImmobilise,
                    circulant: actifCirculant,
                    tresorerie: actifTresorerie,
                    total: totalActif,
                    items: actifItems
                },
                passif: {
                    capitauxPropres,
                    passifCirculant,
                    tresoreriePassif: passifTresorerie,
                    total: totalPassif,
                    items: passifItems
                },
                equilibre: Math.abs(totalActif - totalPassif)
            },
            rapprochementMandants: {
                tresorerieMandants,
                detteBailleurs,
                cautionsDetenues,
                totalExigibleMandants,
                ecartCouverture,
                tauxCouverture,
                conforme
            },
            kpis: {
                chiffreAffairesHT: totalProduits,
                tvaCollectee: Math.max(0, tvaCollectee),
                chargesExploitation: totalCharges,
                loyersEncaisses,
                commissionsGestion,
                totalEcritures: allEntries.length,
                periode: filterYear ? `Exercice ${filterYear}` : `Exercice ${currentYear} (Cumul annuel)`
            }
        };

        return { success: true, data: accountingData };
    } catch (error: any) {
        console.error("Erreur getAgencyAccountingData:", error);
        return { success: false, error: error.message || "Erreur interne comptable" };
    }
}

/**
 * Ajoute une écriture comptable manuelle.
 */
export async function addCustomSyscohadaEntry(entryData: {
    date: string;
    journalCode: string;
    pieceRef: string;
    compteDebit: string;
    compteCredit: string;
    libelle: string;
    montant: number;
    targetAgencyId?: string;
}): Promise<{ success: boolean; error?: string }> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Non authentifié" };
        }

        const targetUserId = (entryData.targetAgencyId && entryData.targetAgencyId !== "ALL")
            ? entryData.targetAgencyId
            : session.user.id;

        const user = await (prisma as any).user.findUnique({
            where: { id: targetUserId },
            select: { id: true, agencyConfig: true }
        });

        if (!user) {
            return { success: false, error: "Utilisateur ou agence introuvable" };
        }

        const agencyConfig = (user.agencyConfig as any) || {};
        const existingEntries: SyscohadaEntryLine[] = Array.isArray(agencyConfig.syscohadaEntries) 
            ? agencyConfig.syscohadaEntries 
            : [];

        const newEntry: SyscohadaEntryLine = {
            id: `manual-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            date: entryData.date,
            journalCode: entryData.journalCode,
            pieceRef: entryData.pieceRef,
            compteDebit: entryData.compteDebit,
            compteCredit: entryData.compteCredit,
            libelle: entryData.libelle,
            montant: Math.round(Number(entryData.montant)),
            source: 'MANUAL'
        };

        const updatedEntries = [newEntry, ...existingEntries];

        await (prisma as any).user.update({
            where: { id: targetUserId },
            data: {
                agencyConfig: {
                    ...agencyConfig,
                    syscohadaEntries: updatedEntries
                }
            }
        });

        revalidatePath("/dashboard/comptabilite");
        revalidatePath("/admin/reports");
        return { success: true };
    } catch (error: any) {
        console.error("Erreur addCustomSyscohadaEntry:", error);
        return { success: false, error: error.message || "Erreur lors de l'enregistrement de l'écriture" };
    }
}

/**
 * Supprime une écriture comptable manuelle.
 */
export async function deleteCustomSyscohadaEntry(
    entryId: string,
    targetAgencyId?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Non authentifié" };
        }

        const targetUserId = (targetAgencyId && targetAgencyId !== "ALL")
            ? targetAgencyId
            : session.user.id;

        const user = await (prisma as any).user.findUnique({
            where: { id: targetUserId },
            select: { id: true, agencyConfig: true }
        });

        if (!user) {
            return { success: false, error: "Utilisateur introuvable" };
        }

        const agencyConfig = (user.agencyConfig as any) || {};
        const existingEntries: SyscohadaEntryLine[] = Array.isArray(agencyConfig.syscohadaEntries) 
            ? agencyConfig.syscohadaEntries 
            : [];

        const updatedEntries = existingEntries.filter(e => e.id !== entryId);

        await (prisma as any).user.update({
            where: { id: targetUserId },
            data: {
                agencyConfig: {
                    ...agencyConfig,
                    syscohadaEntries: updatedEntries
                }
            }
        });

        revalidatePath("/dashboard/comptabilite");
        revalidatePath("/admin/reports");
        return { success: true };
    } catch (error: any) {
        console.error("Erreur deleteCustomSyscohadaEntry:", error);
        return { success: false, error: error.message || "Erreur lors de la suppression" };
    }
}

/**
 * Extrait les mouvements du Grand Livre pour un compte spécifique.
 */
export async function getGrandLivreForAccount(
    accountNumero: string,
    filterYear?: number,
    targetAgencyId?: string
): Promise<{
    account: CompteSyscohada;
    movements: GrandLivreMovement[];
    totalDebit: number;
    totalCredit: number;
    soldeFinal: number;
    sensSolde: 'DEBITEUR' | 'CREDITEUR';
}> {
    const dataRes = await getAgencyAccountingData(filterYear, targetAgencyId);
    const accountInfo = getAccountInfo(accountNumero);

    if (!dataRes.success || !dataRes.data) {
        return {
            account: accountInfo,
            movements: [],
            totalDebit: 0,
            totalCredit: 0,
            soldeFinal: 0,
            sensSolde: accountInfo.sensNormal
        };
    }

    const matchingEntries = dataRes.data.entries.filter(
        e => e.compteDebit === accountNumero || e.compteCredit === accountNumero
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let runningBalance = 0;
    let totalDebit = 0;
    let totalCredit = 0;

    const movements: GrandLivreMovement[] = matchingEntries.map(e => {
        const isDebit = e.compteDebit === accountNumero;
        const debit = isDebit ? e.montant : 0;
        const credit = !isDebit ? e.montant : 0;
        const contrepartie = isDebit ? e.compteCredit : e.compteDebit;

        totalDebit += debit;
        totalCredit += credit;

        if (accountInfo.sensNormal === 'DEBITEUR') {
            runningBalance += (debit - credit);
        } else {
            runningBalance += (credit - debit);
        }

        return {
            id: e.id,
            date: e.date,
            journalCode: e.journalCode,
            pieceRef: e.pieceRef,
            libelle: e.libelle,
            debit,
            credit,
            soldeProgressif: runningBalance,
            contrepartie
        };
    });

    const netDebit = totalDebit - totalCredit;
    const soldeFinal = Math.abs(netDebit);
    const sensSolde = netDebit >= 0 ? 'DEBITEUR' : 'CREDITEUR';

    return {
        account: accountInfo,
        movements,
        totalDebit,
        totalCredit,
        soldeFinal,
        sensSolde
    };
}
