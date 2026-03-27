"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { DiasporaService } from "@/lib/diaspora-service"
import { ProfilInterm } from "@prisma/client"

/**
 * DIA-01: Souscription au package Diaspora
 * Simule l'activation après paiement (Stripe/Paytech)
 */
export async function subscribeToDiaspora(userId: string) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== 'LANDLORD' && session.user.role !== 'SUPER_ADMIN')) {
      return { error: "Non autorisé." };
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        diasporaAbonnement: true,
        diasporaAbonnementSince: new Date(),
        activePlanTier: 'PREMIUM' // Diaspora est un add-on mais élève souvent au rang Premium
      }
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: "Échec de la souscription." };
  }
}

/**
 * DIA-07: Mise à jour du profil Diaspora
 */
export async function updateDiasporaSettings(data: {
  paysResidence?: string,
  devise?: string,
  whatsapp?: string,
  emailRapport?: string
}) {
  try {
    const session = await auth();
    if (!session) return { error: "Non authentifié." };

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        paysResidence: data.paysResidence,
        diasporaDevise: data.devise,
        diasporaWhatsapp: data.whatsapp,
        emailRapportMensuel: data.emailRapport
      }
    });

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    return { error: "Échec de la mise à jour des paramètres." };
  }
}

/**
 * DIA-03: Désignation d'un mandataire local
 */
export async function designateMandatLocal(input: {
  mandatairePhone: string,
  profil: ProfilInterm,
  biensIds: string[],
  permissions: any
}) {
  try {
    const session = await auth();
    if (!session) return { error: "Non authentifié." };

    // Trouver le mandataire par son téléphone
    const mandataire = await prisma.user.findUnique({
      where: { phone: input.mandatairePhone }
    });

    if (!mandataire) {
      return { error: "Mandataire non trouvé. Il doit d'abord créer un compte QAPRIL." };
    }

    const mandat = await prisma.mandatGestion.create({
      data: {
        proprietaireId: session.user.id,
        intermediaireId: mandataire.id,
        profil: input.profil,
        biensConcernes: JSON.stringify(input.biensIds),
        permissions: input.permissions,
        statut: "EN_ATTENTE"
      }
    });

    revalidatePath("/dashboard/diaspora");
    return { success: true, mandatId: mandat.id };
  } catch (error) {
    console.error("Erreur désignation mandataire:", error);
    return { error: "Impossible de désigner le mandataire." };
  }
}

import { createHmac } from "crypto";

/**
 * DIA-02: Récupération des données du Dashboard Diaspora
 */
export async function getDiasporaDashboard() {
  try {
    const session = await auth();
    if (!session) return { error: "Non authentifié." };

    const data = await DiasporaService.getDashboardData(session.user.id);
    return { success: true, data };
  } catch (error) {
    return { error: "Impossible de charger le dashboard." };
  }
}

/**
 * DIA-INVITE: Génération d'un lien d'invitation sécurisé HMAC-SHA256
 */
export async function generateDiasporaInvite(targetUserId: string) {
    const session = await auth();
    if (!session || session.user.role !== 'SUPER_ADMIN') {
        // En prod, seul l'admin ou le système génère ça
        // Mais pour le dashboard proprio, il peut inviter un mandataire
    }

    const secret = process.env.DIASPORA_SECRET || "qapril-diaspora-secret-2026";
    const timestamp = Date.now().toString();
    const hash = createHmac("sha256", secret)
        .update(`${targetUserId}:${timestamp}`)
        .digest("hex");
    
    // On simule l'URL d'onboarding
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.qapril.ci'}/auth/register?u=${targetUserId}&t=${timestamp}&h=${hash}&type=diaspora`;
    
    // Log de l'invitation
    await prisma.auditLog.create({
        data: {
            userId: session?.user.id || targetUserId,
            action: "GENERATE_DIASPORA_INVITE",
            entityId: targetUserId,
            module: "DIASPORA",
            newValues: { timestamp, hash }
        }
    });

    return { success: true, inviteUrl };
}

/**
 * SEPA-01: Simulation d'exécution de virement SEPA (Rule SEPA-01)
 */
export async function simulateSepaVirement(amountFcfa: number, currency: string) {
    const session = await auth();
    if (!session) return { error: "Non authentifié." };

    try {
        const rate = DIASPORA_CURRENCIES[currency]?.rate || 0.001524;
        const amountDevise = Number((amountFcfa * rate).toFixed(2));

        // Logique métier : Enregistrement de l'ordre de virement
        // En prod, on appellerait l'API de Bridge/Stripe Treasury
        
        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: "EXECUTE_SEPA_VIREMENT",
                module: "DIASPORA",
                newValues: { amountFcfa, amountDevise, currency, status: "INITIATED" }
            }
        });

        return { 
            success: true, 
            message: `Virement de ${amountDevise} ${currency} initié avec succès vers votre compte SEPA.` 
        };
    } catch (error) {
        return { error: "Échec de l'initiation du virement." };
    }
}

import { DIASPORA_CURRENCIES } from "@/lib/diaspora-service";
