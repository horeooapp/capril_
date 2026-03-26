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
