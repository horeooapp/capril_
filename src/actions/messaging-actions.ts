"use server"

import { MessagingService } from "@/lib/messaging-service";
import { revalidatePath } from "next/cache";
import { ensureAuthenticated, ensureLeaseAccess } from "./auth-helpers";
import { writeAuditLog } from "@/lib/audit";

/**
 * Envoyer un message (MSG-01)
 */
export async function sendMessage(data: {
  leaseId: string;
  contenu: string;
  pjUrl?: string;
  pjHashSha256?: string;
}) {
  const session = await ensureAuthenticated();
  const userId = session.user.id;
  const role = session.user.role as any;

  try {
    await ensureLeaseAccess(data.leaseId);

    const message = await MessagingService.envoyerMessage({
      leaseId: data.leaseId,
      expediteurId: userId,
      roleExpediteur: role === "TENANT" ? "LOCATAIRE" : "PROPRIO",
      contenu: data.contenu,
      pjUrl: data.pjUrl,
      pjHashSha256: data.pjHashSha256,
    });

    revalidatePath(`/dashboard/messages/${data.leaseId}`);

    await writeAuditLog({
      userId,
      action: "MSG_BAIL_SENT",
      module: "MESSAGING",
      entityId: message.id,
    });

    return { success: true, messageId: message.id };
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Marquer comme lu (MSG-02)
 */
export async function markMessageRead(msgId: string, leaseId: string) {
  const session = await ensureAuthenticated();
  
  try {
    await MessagingService.marquerCommeLu(msgId);
    revalidatePath(`/dashboard/messages/${leaseId}`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
