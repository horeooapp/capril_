// ══════════════════════════════════════════════════════════════════════════════
// QAPRIL — Service de Modération & Lutte Anti-Fraude du Portail
// Référence : SPEC/026-C/2026 (ADD-26 §4 — RG-MOD-01, RG-MOD-02)
// ══════════════════════════════════════════════════════════════════════════════

import { prisma } from "@/lib/prisma";

export interface SignalementInput {
  annonceId: string;
  motif: "FAUSSE_ANNONCE" | "PRIX_TROMPEUR" | "DEJA_LOUE" | "PHOTOS_VOLEES" | "AUTRE";
  description?: string;
  signaleParUserId?: string;
}

const SEUIL_SIGNALEMENTS_AUTO_SUSPENSION = 3;

/**
 * RG-MOD-01 : Enregistre un signalement citoyen et déclenche la suspension automatique au-delà du seuil
 */
export async function signalerAnnonce(input: SignalementInput) {
  const annonce = await prisma.annonce.findUnique({
    where: { id: input.annonceId },
    select: { id: true, statut: true, diffusions: true, agenceId: true, titre: true }
  });

  if (!annonce) {
    throw new Error("Annonce introuvable.");
  }

  const diffusions: any = annonce.diffusions || {};
  const currentSignalements: any[] = Array.isArray(diffusions.signalements) ? diffusions.signalements : [];
  
  // Vérifier si cet utilisateur a déjà signalé cette annonce pour éviter le spam
  if (input.signaleParUserId && currentSignalements.some(s => s.userId === input.signaleParUserId)) {
    throw new Error("Vous avez déjà signalé cette annonce. Votre signalement est en cours d'examen par notre équipe.");
  }

  const nouveauSignalement = {
    id: `sig_${Date.now()}`,
    motif: input.motif,
    description: input.description || "",
    userId: input.signaleParUserId || "ANONYME",
    created_at: new Date().toISOString()
  };

  currentSignalements.push(nouveauSignalement);
  const newCount = currentSignalements.length;

  let nouveauStatut = annonce.statut;
  let motifSuspension = undefined;

  // RG-MOD-01 : Au-delà du seuil, bascule automatique en SUSPUNDEE
  if (newCount >= SEUIL_SIGNALEMENTS_AUTO_SUSPENSION && (annonce.statut === "ACTIVE" || annonce.statut === "PUBLIEE")) {
    nouveauStatut = "SUSPUNDEE";
    motifSuspension = `Suspension automatique suite à ${newCount} signalements citoyens (RG-MOD-01).`;
    
    // Log de garde-fous pour traçabilité agence (RG-MOD-02)
    try {
      await prisma.gardeFousLog.create({
        data: {
          declencheur: "SOLDE_BAS" as any, // Utilisation d'un enum existant en fallback
          resultatAction: `SUSPENSION_PORTAIL_ANNONCE_${annonce.id}`,
          soldeAvant: Number(newCount),
          userId: annonce.agenceId,
          details: {
            action: "AUTO_SUSPENSION_RG_MOD_01",
            annonceId: annonce.id,
            titre: annonce.titre,
            signalements: currentSignalements
          }
        }
      });
    } catch (e) {
      console.warn("[MODERATION] Erreur log garde-fous:", e);
    }
  }

  const updatedAnnonce = await prisma.annonce.update({
    where: { id: input.annonceId },
    data: {
      statut: nouveauStatut,
      diffusions: {
        ...diffusions,
        signalements_count: newCount,
        signalements: currentSignalements,
        suspension_automatique: motifSuspension
      }
    }
  });

  return {
    annonce_id: updatedAnnonce.id,
    signalements_total: newCount,
    statut_actuel: updatedAnnonce.statut,
    suspendue_automatiquement: nouveauStatut === "SUSPUNDEE",
    motif_suspension: motifSuspension
  };
}

/**
 * Concurrence de location & RG-MOD-02 : Verrouillage automatique d'une annonce 
 * lors de la signature d'un bail QAPRIL ou réservation
 */
export async function verrouillerAnnonceApresLocation(logementId: string, motif: "BAIL_SIGNE" | "SOUS_OPTION" = "BAIL_SIGNE") {
  const annonceActive = await prisma.annonce.findFirst({
    where: {
      logementId,
      statut: { in: ["ACTIVE", "PUBLIEE", "active", "SOUS_OPTION"] }
    }
  });

  if (!annonceActive) {
    return { verrouille: false, message: "Aucune annonce active sur ce logement." };
  }

  const nouveauStatut = motif === "BAIL_SIGNE" ? "LOUEE" : "SOUS_OPTION";
  const diffusions: any = annonceActive.diffusions || {};

  const updated = await prisma.annonce.update({
    where: { id: annonceActive.id },
    data: {
      statut: nouveauStatut,
      archiveeAt: motif === "BAIL_SIGNE" ? new Date() : null,
      diffusions: {
        ...diffusions,
        verrouillage_auto: {
          date: new Date().toISOString(),
          motif,
          rg_ref: "RG-MOD-02_CONCURRENCE_LOCATION"
        }
      }
    }
  });

  return {
    verrouille: true,
    annonce_id: updated.id,
    ancien_statut: annonceActive.statut,
    nouveau_statut: updated.statut,
    message: motif === "BAIL_SIGNE" 
      ? "Annonce basculée en LOUEE et retirée de la recherche publique (Zéro fausse annonce)."
      : "Annonce basculée en SOUS_OPTION. Les visites sont temporairement suspendues."
  };
}
