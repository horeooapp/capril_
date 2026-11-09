"use server"

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { normalizePhone } from "@/lib/phone";

export interface ChatMessage {
  id: string;
  leaseId: string;
  expediteurId: string;
  roleExpediteur: "PROPRIO" | "LOCATAIRE" | "SYSTEME";
  contenu: string;
  statut: "ENVOYE" | "RECU" | "LU";
  dateEnvoi: string;
  dateReception?: string | null;
  dateLecture?: string | null;
  senderName?: string;
  isMe?: boolean;
}

export interface ConversationItem {
  leaseId: string;
  propertyTitle: string;
  propertyAddress: string;
  otherPartyName: string;
  otherPartyRole: "LOCATAIRE" | "PROPRIETAIRE";
  otherPartyPhone?: string;
  lastMessage?: string;
  lastMessageDate?: string;
  lastMessageStatut?: "ENVOYE" | "RECU" | "LU";
  lastMessageIsMe?: boolean;
  unreadCount: number;
}

/**
 * Récupère les conversations actives pour l'utilisateur connecté (Bailleur ou Locataire)
 */
export async function getConversations(): Promise<{ success: boolean; conversations: ConversationItem[] }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, conversations: [] };
    }

    const userId = session.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, phone: true, email: true, role: true }
    });
    const userRole = String((session.user as any)?.chosenRole || user?.role || session.user.role || "").toUpperCase();
    const isTenant = userRole === "TENANT" || userRole === "LOCATAIRE";
    const normalized = user?.phone ? normalizePhone(user.phone) : null;

    // 1. Trouver les baux rattachés à cet utilisateur
    let leases = await (prisma as any).lease.findMany({
      where: isTenant
        ? {
            OR: [
              { tenantId: userId },
              ...(normalized ? [{ tenant: { phone: normalized } }] : []),
              ...(user?.email ? [{ tenant: { email: user.email } }] : [])
            ],
            status: { notIn: ["CANCELLED", "ARCHIVED"] }
          }
        : { landlordId: userId, status: { notIn: ["CANCELLED", "ARCHIVED"] } },
      include: {
        tenant: { select: { id: true, firstName: true, lastName: true, phone: true } },
        landlord: { select: { id: true, firstName: true, lastName: true, phone: true } },
        property: {
          select: {
            id: true,
            name: true,
            address: true,
            owner: { select: { id: true, firstName: true, lastName: true, phone: true } }
          }
        },
        messagesBail: {
          orderBy: { dateEnvoi: "desc" },
          take: 1
        }
      },
      orderBy: { updatedAt: "desc" }
    });

    // Rattacher automatiquement les baux non encore liés à userId
    if (isTenant && leases) {
      for (const l of leases) {
        if (l.tenantId !== userId) {
          try {
            await (prisma as any).lease.update({ where: { id: l.id }, data: { tenantId: userId } });
          } catch {}
        }
      }
    }

    // 2. Si aucun bail avec le rôle présumé, chercher tous les baux où l'utilisateur est soit locataire soit bailleur
    if (!leases || leases.length === 0) {
      leases = await (prisma as any).lease.findMany({
        where: {
          OR: [
            { tenantId: userId },
            { landlordId: userId }
          ],
          status: { notIn: ["CANCELLED", "ARCHIVED"] }
        },
        include: {
          tenant: { select: { id: true, firstName: true, lastName: true, phone: true } },
          landlord: { select: { id: true, firstName: true, lastName: true, phone: true } },
          property: {
            select: {
              id: true,
              name: true,
              address: true,
              owner: { select: { id: true, firstName: true, lastName: true, phone: true } }
            }
          },
          messagesBail: {
            orderBy: { dateEnvoi: "desc" },
            take: 1
          }
        },
        orderBy: { updatedAt: "desc" }
      });
    }

    if (!leases || leases.length === 0) {
      return { success: true, conversations: [] };
    }

    const conversations: ConversationItem[] = leases.map((l: any) => {
      const userIsTenant = l.tenantId === userId || (isTenant && l.landlordId !== userId);
      const otherUser = userIsTenant
        ? (l.landlord || l.property?.owner)
        : l.tenant;

      const otherName = otherUser
        ? `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() || (userIsTenant ? "Bailleur" : "Locataire")
        : (userIsTenant ? "Bailleur" : "Locataire");

      const otherPhone = otherUser?.phone;
      const lastMsg = l.messagesBail?.[0];

      return {
        leaseId: l.id,
        propertyTitle: l.property?.name || "Logement",
        propertyAddress: l.property?.address || "Abidjan, Côte d'Ivoire",
        otherPartyName: otherName,
        otherPartyRole: userIsTenant ? "PROPRIETAIRE" : "LOCATAIRE",
        otherPartyPhone: otherPhone,
        lastMessage: lastMsg?.contenu || "Début de la conversation sécurisée",
        lastMessageDate: lastMsg?.dateEnvoi ? new Date(lastMsg.dateEnvoi).toISOString() : new Date().toISOString(),
        lastMessageStatut: (lastMsg?.statut as any) || "LU",
        lastMessageIsMe: lastMsg?.expediteurId === userId,
        unreadCount: 0
      };
    });

    return { success: true, conversations };
  } catch (error) {
    console.warn("[MESSAGING] Error in getConversations:", error);
    return { success: false, conversations: [] };
  }
}

/**
 * Récupère les messages d'un bail donné et met à jour les statuts de lecture
 */
export async function getBailMessages(leaseId: string): Promise<{ success: boolean; messages: ChatMessage[] }> {
  try {
    const session = await auth();
    const userId = session?.user?.id || "demo-user";

    const dbMessages = await (prisma as any).messagerieBail.findMany({
      where: { leaseId },
      orderBy: { dateEnvoi: "asc" },
      include: {
        expediteur: { select: { firstName: true, lastName: true } }
      }
    });

    if (!dbMessages || dbMessages.length === 0) {
      // Si aucun message en base, vérifier si le bail existe
      const leaseExists = await (prisma as any).lease.findUnique({ where: { id: leaseId } });
      if (leaseExists) {
        return { success: true, messages: [] };
      }
      return { success: true, messages: [] };
    }

    // Marquer les messages entrants comme LUS (dateLecture)
    const incomingUnread = dbMessages.filter((m: any) => m.expediteurId !== userId && m.statut !== "LU");
    if (incomingUnread.length > 0) {
      await (prisma as any).messagerieBail.updateMany({
        where: {
          id: { in: incomingUnread.map((m: any) => m.id) }
        },
        data: {
          statut: "LU",
          dateLecture: new Date()
        }
      });
    }

    const messages: ChatMessage[] = dbMessages.map((m: any) => ({
      id: m.id,
      leaseId: m.leaseId,
      expediteurId: m.expediteurId,
      roleExpediteur: m.roleExpediteur,
      contenu: m.contenu,
      statut: incomingUnread.some((u: any) => u.id === m.id) ? "LU" : (m.statut as any),
      dateEnvoi: new Date(m.dateEnvoi).toISOString(),
      dateReception: m.dateReception ? new Date(m.dateReception).toISOString() : null,
      dateLecture: incomingUnread.some((u: any) => u.id === m.id) ? new Date().toISOString() : (m.dateLecture ? new Date(m.dateLecture).toISOString() : null),
      senderName: m.expediteur ? `${m.expediteur.firstName} ${m.expediteur.lastName}`.trim() : (m.roleExpediteur === "PROPRIO" ? "Bailleur" : "Locataire"),
      isMe: m.expediteurId === userId
    }));

    return { success: true, messages };
  } catch (error) {
    console.warn("[MESSAGING] Error in getBailMessages:", error);
    return { success: false, messages: [] };
  }
}

/**
 * Envoie un message dans le fil de discussion
 */
export async function sendBailMessage(leaseId: string, contenu: string): Promise<{ success: boolean; message?: ChatMessage; error?: string }> {
  if (!contenu || !contenu.trim()) {
    return { success: false, error: "Le contenu du message ne peut pas être vide." };
  }

  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return { success: false, error: "Vous devez être connecté pour envoyer un message." };
    }

    const userRole = String((session?.user as any)?.chosenRole || session?.user?.role || "").toUpperCase();
    const isTenant = userRole === "TENANT" || userRole === "LOCATAIRE";

    // Vérifier si le bail existe en base
    let messageRecord: any = null;
    const lease = await (prisma as any).lease.findUnique({
      where: { id: leaseId },
      select: { id: true, tenantId: true, landlordId: true }
    });

    const isLeaseTenant = lease ? lease.tenantId === userId : isTenant;

    messageRecord = await (prisma as any).messagerieBail.create({
      data: {
        leaseId,
        expediteurId: userId,
        roleExpediteur: isLeaseTenant ? "LOCATAIRE" : "PROPRIO",
        contenu: contenu.trim(),
        statut: "RECU", // Directement distribué au serveur / boîte de réception (2 encoches grises)
        dateReception: new Date()
      },
      include: {
        expediteur: { select: { firstName: true, lastName: true } }
      }
    });

    const senderName = messageRecord.expediteur
      ? `${messageRecord.expediteur.firstName} ${messageRecord.expediteur.lastName}`.trim()
      : (isLeaseTenant ? "Moi (Locataire)" : "Moi (Propriétaire)");

    const formattedMessage: ChatMessage = {
      id: messageRecord.id,
      leaseId,
      expediteurId: userId,
      roleExpediteur: messageRecord.roleExpediteur,
      contenu: messageRecord.contenu,
      statut: "RECU", // 2 encoches grises dès réception serveur
      dateEnvoi: new Date(messageRecord.dateEnvoi).toISOString(),
      dateReception: new Date(messageRecord.dateReception).toISOString(),
      dateLecture: null,
      senderName,
      isMe: true
    };

    revalidatePath("/dashboard/maintenance");
    revalidatePath("/dashboard/messages");
    revalidatePath("/mon-espace-locataire/messages");
    revalidatePath("/mon-espace-locataire");

    return { success: true, message: formattedMessage };
  } catch (error: any) {
    console.error("[MESSAGING] sendBailMessage error:", error);
    return { success: false, error: "Impossible d'envoyer le message." };
  }
}

/**
 * Données de démonstration réalistes pour les conversations
 */
function getDemoConversations(role: "LANDLORD" | "TENANT"): ConversationItem[] {
  if (role === "TENANT") {
    return [
      {
        leaseId: "lease-emeraude-a1",
        propertyTitle: "Appartement 3P · Résidence Émeraude",
        propertyAddress: "Cocody Ambassades, Rue des Jardins",
        otherPartyName: "Koffi N’Guessan (Bailleur)",
        otherPartyRole: "PROPRIETAIRE",
        otherPartyPhone: "+225 07 08 09 10 11",
        lastMessage: "J'ai bien reçu votre signalement. L'artisan plombier passera demain à 10h.",
        lastMessageDate: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        lastMessageStatut: "LU",
        lastMessageIsMe: false,
        unreadCount: 0
      }
    ];
  }

  return [
    {
      leaseId: "lease-emeraude-a1",
      propertyTitle: "Appartement 3P (A1) · Résidence Émeraude",
      propertyAddress: "Cocody Ambassades, Rue des Jardins",
      otherPartyName: "Adjoua Kouamé",
      otherPartyRole: "LOCATAIRE",
      otherPartyPhone: "+225 05 44 22 11 00",
      lastMessage: "Merci pour votre réactivité Monsieur N’Guessan !",
      lastMessageDate: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      lastMessageStatut: "LU",
      lastMessageIsMe: false,
      unreadCount: 0
    },
    {
      leaseId: "lease-emeraude-a3",
      propertyTitle: "Appartement 2P (A3) · Résidence Émeraude",
      propertyAddress: "Cocody Ambassades, Rue des Jardins",
      otherPartyName: "Jean-Marc Konan",
      otherPartyRole: "LOCATAIRE",
      otherPartyPhone: "+225 07 11 33 55 77",
      lastMessage: "Le technicien climatisation a terminé la recharge de gaz.",
      lastMessageDate: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      lastMessageStatut: "LU",
      lastMessageIsMe: true,
      unreadCount: 0
    },
    {
      leaseId: "lease-yopougon-c1",
      propertyTitle: "Chambre Porte 1 · Cour commune",
      propertyAddress: "Yopougon Niangon Sud",
      otherPartyName: "Yao Kouassi",
      otherPartyRole: "LOCATAIRE",
      otherPartyPhone: "+225 01 02 03 04 05",
      lastMessage: "Quittance de loyer bien reçue sur mon téléphone.",
      lastMessageDate: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      lastMessageStatut: "RECU",
      lastMessageIsMe: true,
      unreadCount: 0
    }
  ];
}

/**
 * Données de messages avec encoches réglementaires :
 * - 2 encoches grises : RECU
 * - 2 encoches rouges : LU
 */
function getDemoMessages(leaseId: string, role: "LANDLORD" | "TENANT"): ChatMessage[] {
  const isBailleur = role === "LANDLORD";

  return [
    {
      id: "msg-1",
      leaseId,
      expediteurId: "locataire-1",
      roleExpediteur: "LOCATAIRE",
      contenu: "Bonjour Monsieur le bailleur, j'ai émis un signalement d'incident concernant la fuite d'eau sous le lavabo de la cuisine.",
      statut: "LU",
      dateEnvoi: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      dateReception: new Date(Date.now() - 2 * 3600 * 1000 + 10000).toISOString(),
      dateLecture: new Date(Date.now() - 2 * 3600 * 1000 + 60000).toISOString(),
      senderName: "Adjoua Kouamé (Locataire)",
      isMe: !isBailleur
    },
    {
      id: "msg-2",
      leaseId,
      expediteurId: "bailleur-1",
      roleExpediteur: "PROPRIO",
      contenu: "Bonjour Madame Kouamé. J'ai bien reçu votre signalement avec la photo certifiée horodatée. J'ai mandaté notre artisan plombier agréé.",
      statut: "LU", // 2 encoches rouges car le locataire l'a lu
      dateEnvoi: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
      dateReception: new Date(Date.now() - 1 * 3600 * 1000 + 5000).toISOString(),
      dateLecture: new Date(Date.now() - 1 * 3600 * 1000 + 30000).toISOString(),
      senderName: "Koffi N’Guessan (Propriétaire)",
      isMe: isBailleur
    },
    {
      id: "msg-3",
      leaseId,
      expediteurId: "bailleur-1",
      roleExpediteur: "PROPRIO",
      contenu: "L'artisan peut se présenter demain matin à 10h00. Serez-vous disponible à cette heure ?",
      statut: "LU", // 2 encoches rouges
      dateEnvoi: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      dateReception: new Date(Date.now() - 45 * 60 * 1000 + 2000).toISOString(),
      dateLecture: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      senderName: "Koffi N’Guessan (Propriétaire)",
      isMe: isBailleur
    },
    {
      id: "msg-4",
      leaseId,
      expediteurId: "locataire-1",
      roleExpediteur: "LOCATAIRE",
      contenu: "Oui parfaitement, je serai présente à 10h. Merci pour votre réactivité !",
      statut: "LU",
      dateEnvoi: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      dateReception: new Date(Date.now() - 20 * 60 * 1000 + 3000).toISOString(),
      dateLecture: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      senderName: "Adjoua Kouamé (Locataire)",
      isMe: !isBailleur
    },
    {
      id: "msg-5",
      leaseId,
      expediteurId: "bailleur-1",
      roleExpediteur: "PROPRIO",
      contenu: "Entendu. Dès que l'intervention est réalisée, nous validerons la clôture contradictoire du ticket sur QAPRIL.",
      statut: "RECU", // 2 encoches grises (reçu sur le terminal du locataire, non encore lu)
      dateEnvoi: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      dateReception: new Date(Date.now() - 5 * 60 * 1000 + 2000).toISOString(),
      dateLecture: null,
      senderName: "Koffi N’Guessan (Propriétaire)",
      isMe: isBailleur
    }
  ];
}
