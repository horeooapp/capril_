import { prisma } from "@/lib/prisma";
import { UtilityType, OperateurNiveau, OperateurDossierStatus } from "@prisma/client";

export interface OperateurConfig {
    nom: string;
    type: UtilityType;
    niveauSupporte: OperateurNiveau;
}

export abstract class OperateurAdapter {
    public readonly config: OperateurConfig;

    constructor(config: OperateurConfig) {
        this.config = config;
    }

    /**
     * NIVEAU N1 : Génération du dossier PDF pré-rempli (CIE / SODECI)
     * Utilise les données du locataire et du bail pour pré-remplir le formulaire.
     */
    public async genererDossierPdf(dossierId: string): Promise<string> {
        const dossier = await prisma.abonnementOperateur.findUnique({
            where: { id: dossierId },
            include: {
                tenant: { include: { locataireProfile: true } },
                lease: { include: { property: true } }
            }
        });

        if (!dossier) throw new Error("Dossier introuvable");

        console.log(`[${this.config.nom}] Génération du dossier PDF pré-rempli pour le bail ${dossier.leaseId}...`);
        
        // Logique de génération PDF à implémenter (via PDF-lib ou HTML-to-PDF)
        const pdfUrl = `https://cdn.qapril.com/dossiers/${dossierId}.pdf`;

        await prisma.abonnementOperateur.update({
            where: { id: dossierId },
            data: { 
                dossierPdfUrl: pdfUrl,
                statut: OperateurDossierStatus.DOSSIER_GENERE
            }
        });

        return pdfUrl;
    }

    /**
     * NIVEAU N1 : Notification SMS au locataire pour la marche à suivre
     */
    public async envoyerInstructionsSms(dossierId: string, phone: string): Promise<boolean> {
        console.log(`[${this.config.nom}] Envoi du SMS d'instructions au locataire ${phone}...`);
        // Intégration de l'API SMS Orange CI
        return true;
    }

    /**
     * NIVEAU N2 / N3 : Soumission directe via API (Si accord commercial)
     * Nécessite l'API Orange Business Applications.
     */
    public async soumettreAbonnementApi(dossierId: string): Promise<any> {
        if (this.config.niveauSupporte === OperateurNiveau.N1) {
            throw new Error(`L'opérateur ${this.config.nom} ne supporte pas la soumission via API (Niveau 1 uniquement).`);
        }

        console.log(`[${this.config.nom}] Soumission de la demande d'abonnement via API B2B...`);
        
        await prisma.abonnementOperateur.update({
            where: { id: dossierId },
            data: { statut: OperateurDossierStatus.SOUMIS_API }
        });

        return { success: true, message: "Soumis avec succès via API B2B." };
    }

    /**
     * Vérification du statut de la demande
     */
    public abstract verifierStatut(referenceDossier: string): Promise<OperateurDossierStatus>;
}
