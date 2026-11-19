"use server";

import { revalidatePath } from "next/cache";
import { PDFDocument } from "pdf-lib";
import { prisma } from "@/lib/prisma";
import { ensureAuthenticated } from "@/actions/auth-helpers";
import { savePhysicalFile, deletePhysicalFile } from "@/lib/storage";
import {
  lirePersonnalisation, nettoyerPersonnalisation, typeImage, LOGO_TAILLE_MAX,
} from "@/lib/quittance-personnalisation";

const ROLES = ["LANDLORD", "LANDLORD_PRO", "AGENCY", "ADMIN", "SUPER_ADMIN"];

export async function obtenirPersonnalisationAction() {
  const session = await ensureAuthenticated();
  const { personnalisation, profilAgence } = await lirePersonnalisation(session.user.id as string);
  return {
    personnalisation: personnalisation || nettoyerPersonnalisation({
      nomAffiche: profilAgence?.nomAgence || "", rccm: profilAgence?.rccm || "", adresse: profilAgence?.adresseLocal || "",
    }),
    dejaEnregistree: !!personnalisation,
    agrement: profilAgence?.numeroAgrement || null,
  };
}

/** Champs : nomAffiche, telephone, email, adresse, rccm, compteContribuable, actif, logo (fichier), retirerLogo. */
export async function enregistrerPersonnalisationAction(form: FormData) {
  try {
    const session = await ensureAuthenticated();
    if (!ROLES.includes((session.user as any).role)) return { success: false as const, error: "Réservé aux bailleurs et aux agences." };
    const userId = session.user.id as string;

    const u = await (prisma as any).user.findUnique({ where: { id: userId }, select: { whiteLabelConfig: true } });
    const config = ((u?.whiteLabelConfig as any) || {}) as Record<string, any>;
    const ancienLogo: string | undefined = config.quittance?.logoUrl;

    const p = nettoyerPersonnalisation({
      actif: form.get("actif") !== "non",
      nomAffiche: form.get("nomAffiche"), telephone: form.get("telephone"), email: form.get("email"),
      adresse: form.get("adresse"), rccm: form.get("rccm"), compteContribuable: form.get("compteContribuable"),
      logoUrl: ancienLogo,
    });
    if (p.nomAffiche.length < 2) return { success: false as const, error: "Indiquez le nom à afficher sur la quittance." };
    if (p.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(p.email)) return { success: false as const, error: "Adresse e-mail invalide." };

    const fichier = form.get("logo");
    if (fichier instanceof File && fichier.size > 0) {
      if (fichier.size > LOGO_TAILLE_MAX) return { success: false as const, error: "Logo trop lourd : 500 Ko au maximum." };
      const octets = new Uint8Array(await fichier.arrayBuffer());
      const mime = typeImage(octets);
      if (!mime) return { success: false as const, error: "Le logo doit être une image PNG ou JPEG." };
      try { // l'image doit pouvoir entrer dans un PDF, sinon on la refuse tout de suite
        const essai = await PDFDocument.create();
        if (mime === "image/png") await essai.embedPng(octets); else await essai.embedJpg(octets);
      } catch {
        return { success: false as const, error: "Cette image n’est pas lisible. Essayez un PNG ou un JPEG classique." };
      }
      const propre = new File([octets], mime === "image/png" ? "logo.png" : "logo.jpg", { type: mime });
      p.logoUrl = await savePhysicalFile(propre, "logos-quittance");
      if (ancienLogo && ancienLogo !== p.logoUrl) await deletePhysicalFile(ancienLogo).catch(() => false);
    } else if (form.get("retirerLogo") === "oui" && ancienLogo) {
      await deletePhysicalFile(ancienLogo).catch(() => false);
      p.logoUrl = undefined;
    }

    await (prisma as any).user.update({ where: { id: userId }, data: { whiteLabelConfig: { ...config, quittance: p } } });
    revalidatePath("/dashboard/quittance-express/personnalisation");
    return { success: true as const, personnalisation: p };
  } catch (e: any) {
    console.error("[QUITTANCE_PERSONNALISATION]", e);
    return { success: false as const, error: e?.message?.startsWith("Format") ? e.message : "La personnalisation n’a pas pu être enregistrée." };
  }
}
