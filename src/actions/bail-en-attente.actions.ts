"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ensureAuthenticated } from "@/actions/auth-helpers";
import { corrigerNumeroLocataire, annulerBailEnAttente, BailEnAttenteError } from "@/lib/bail-en-attente";
import { requestSignatureOTP } from "@/actions/lease.actions";

const rafraichir = (id: string) => { revalidatePath(`/dashboard/leases/${id}`); revalidatePath(`/dashboard/leases/${id}/bail`); revalidatePath("/dashboard/leases"); revalidatePath("/dashboard/quittance-express"); };
const erreur = (e: any) => ({ success: false as const, error: e instanceof BailEnAttenteError ? e.message : "L’opération a échoué." });

/** Renvoie le bail au locataire avec un nouveau code de signature. */
export async function renvoyerCodeSignatureAction(leaseId: string) {
  const r: any = await requestSignatureOTP(leaseId);
  return r.success ? { success: true as const, canaux: r.canaux } : { success: false as const, error: r.error as string };
}

/** Corrige le numéro du locataire puis renvoie le bail à la signature sur le bon numéro. */
export async function corrigerNumeroLocataireAction(leaseId: string, telephone: string, nom?: string) {
  try {
    const session = await ensureAuthenticated();
    const r = await corrigerNumeroLocataire(prisma, { leaseId, demandeurId: session.user.id as string, role: (session.user as any).role, telephone, nom });
    rafraichir(leaseId);
    const envoi: any = await requestSignatureOTP(leaseId);
    return { success: true as const, telephone: r.telephone, codeEnvoye: !!envoi.success, erreurEnvoi: envoi.success ? undefined : (envoi.error as string) };
  } catch (e) { if (!(e instanceof BailEnAttenteError)) console.error("[BAIL_NUMERO]", e); return erreur(e); }
}

export async function annulerBailEnAttenteAction(leaseId: string) {
  try {
    const session = await ensureAuthenticated();
    await annulerBailEnAttente(prisma, { leaseId, demandeurId: session.user.id as string, role: (session.user as any).role });
    rafraichir(leaseId);
    return { success: true as const };
  } catch (e) { if (!(e instanceof BailEnAttenteError)) console.error("[BAIL_ANNULATION]", e); return erreur(e); }
}
