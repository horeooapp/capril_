import { OperateurAdapter } from "./operateur-adapter";
import { OperateurNiveau, OperateurDossierStatus, UtilityType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export class OrangeCiAdapter extends OperateurAdapter {
    private clientId: string;
    private clientSecret: string;
    private smsApiUrl: string = "https://api.orange.com/smsmessaging/v1/outbound/tel%3A%2B22500000000/requests";
    private authUrl: string = "https://api.orange.com/oauth/v3/token";

    constructor() {
        super({
            nom: "Orange CI",
            type: UtilityType.ORANGE,
            niveauSupporte: OperateurNiveau.N1 // N1 par défaut jusqu'à la signature de l'accord B2B
        });

        // Ces variables doivent être configurées dans le .env en production
        this.clientId = process.env.ORANGE_API_CLIENT_ID || "";
        this.clientSecret = process.env.ORANGE_API_CLIENT_SECRET || "";
    }

    /**
     * Authentification OAuth2 Orange Developer
     * Génère le token Bearer en encodant les credentials en Base64
     */
    private async getAccessToken(): Promise<string> {
        if (!this.clientId || !this.clientSecret) {
            throw new Error("[OrangeCiAdapter] Credentials API Orange manquants.");
        }

        const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
        
        try {
            const response = await fetch(this.authUrl, {
                method: "POST",
                headers: {
                    "Authorization": `Basic ${credentials}`,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: "grant_type=client_credentials"
            });

            if (!response.ok) throw new Error("Erreur d'authentification Orange API");

            const data = await response.json();
            return data.access_token;
        } catch (error) {
            console.error("[OrangeCiAdapter] Erreur OAuth2:", error);
            throw error;
        }
    }

    /**
     * NIVEAU 1 : Génération du dossier Fibre/ADSL pré-rempli
     */
    public async genererDossierPdf(dossierId: string): Promise<string> {
        // Appelle la méthode mère pour la validation de base
        const basePdf = await super.genererDossierPdf(dossierId);
        
        console.log(`[OrangeCiAdapter] Structuration du dossier FAI (Fibre/Box) pour le dossier ${dossierId}...`);
        
        // Logique métier spécifique à Orange :
        // 1. Concaténation de la CNI
        // 2. Concaténation de la quittance / contrat de bail
        // 3. Formulaire d'abonnement standard Orange pré-rempli
        
        return basePdf;
    }

    /**
     * NIVEAU 1 : Envoi du SMS guidé via Orange SMS API
     */
    public async envoyerInstructionsSms(dossierId: string, phone: string): Promise<boolean> {
        console.log(`[OrangeCiAdapter] Préparation du SMS pour ${phone}`);
        const token = await this.getAccessToken();

        const message = `QAPRIL : Votre dossier d'abonnement Internet Orange est prêt ! 
Veuillez le télécharger ici : https://qapril.ci/d/${dossierId.substring(0,8)} 
et le déposer dans l'agence Orange la plus proche.`;

        try {
            // Simulation de l'appel réel à l'API SMS Orange
            /*
            const response = await fetch(this.smsApiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    outboundSMSMessageRequest: {
                        address: `tel:+225${phone.replace(/\D/g, '')}`,
                        senderAddress: "tel:+22500000000",
                        outboundSMSTextMessage: { message }
                    }
                })
            });
            */
           
            // Real SMS delivery logic to be finalized.
            return true;
        } catch (error) {
            console.error("[OrangeCiAdapter] Échec de l'envoi du SMS:", error);
            return false;
        }
    }

    /**
     * NIVEAU 2 : Soumission API directe (Orange Business Applications)
     * À activer une fois le partenariat B2B conclu.
     */
    public async soumettreAbonnementApi(dossierId: string): Promise<any> {
        if (this.config.niveauSupporte === OperateurNiveau.N1) {
            console.warn("[OrangeCiAdapter] Tentative d'appel API B2B rejetée : Niveau d'intégration actuel = N1.");
            throw new Error("L'intégration API provisioning Orange n'est pas encore active (Accord N2 requis).");
        }

        const token = await this.getAccessToken();
        
        // Appel hypothétique à l'API de souscription (B2B API Orange CI)
        console.log(`[OrangeCiAdapter] Soumission B2B avec Bearer ${token.substring(0, 5)}...`);
        
        await prisma.abonnementOperateur.update({
            where: { id: dossierId },
            data: { statut: OperateurDossierStatus.SOUMIS_API }
        });

        return { success: true, trackingCode: `ORG-${Date.now()}` };
    }

    /**
     * Vérification asynchrone du statut du raccordement
     */
    public async verifierStatut(referenceDossier: string): Promise<OperateurDossierStatus> {
        console.log(`[OrangeCiAdapter] Vérification du statut pour ${referenceDossier}...`);
        
        // En Niveau 1, cette vérification est manuelle (par exemple via le locataire ou le propriétaire)
        // En Niveau 2, ce serait un GET API
        
        return OperateurDossierStatus.EN_ATTENTE_VALIDATION;
    }
}
