import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  declarePaymentByTenant,
  handleIncomingMessage,
  resolveOrCreateContact
} from "@/lib/conversational/conversation-engine";
import { getOrCreateShortCodeForLease } from "@/lib/conversational/code-manager";

export const dynamic = "force-dynamic";

/**
 * Route d'orchestration pour le simulateur interactif ADD-26 ("Fil WhatsApp du bailleur")
 * Permet de faire la démonstration immédiate aux régulateurs, à la DGI et aux partenaires télécoms.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "init_demo") {
      // 1. Chercher ou créer un bail de démonstration pour le simulateur
      let demoLease = await prisma.lease.findFirst({
        where: { status: "ACTIVE" },
        include: {
          property: { include: { landlord: true } },
          tenant: true
        }
      });

      if (!demoLease) {
        // Créer un utilisateur bailleur et locataire de démo si non existant
        let landlord = await prisma.user.findFirst({ where: { role: "LANDLORD" } });
        if (!landlord) {
          landlord = await prisma.user.create({
            data: {
              phone: "+2250700000001",
              firstName: "Koffi",
              lastName: "KOUAME",
              role: "LANDLORD",
              status: "ACTIVE",
              capaciteActive: "PROPRIETAIRE"
            }
          });
        }

        let tenant = await prisma.user.findFirst({ where: { role: "TENANT" } });
        if (!tenant) {
          tenant = await prisma.user.create({
            data: {
              phone: "+2250500000002",
              firstName: "Adjoua",
              lastName: "KOUAME",
              role: "TENANT",
              status: "ACTIVE",
              capaciteActive: "LOCATAIRE"
            }
          });
        }

        let property = await prisma.property.findFirst({ where: { landlordId: landlord.id } });
        if (!property) {
          property = await prisma.property.create({
            data: {
              title: "Appartement A1, Cocody Angré",
              landlordId: landlord.id,
              rentAmount: 150000,
              type: "APPARTEMENT",
              city: "Abidjan"
            }
          });
        }

        demoLease = await prisma.lease.create({
          data: {
            propertyId: property.id,
            tenantId: tenant.id,
            monthlyRent: 150000,
            status: "ACTIVE",
            startDate: new Date()
          },
          include: {
            property: { include: { landlord: true } },
            tenant: true
          }
        });
      }

      // S'assurer que le bailleur a un numéro
      const landlordPhone = demoLease.property?.landlord?.phone || "+2250700000001";
      const shortCode = await getOrCreateShortCodeForLease({
        bailId: demoLease.id,
        bailleurPhone: landlordPhone
      });

      // Récupérer le contact conversationnel
      const contact = await resolveOrCreateContact(landlordPhone, "WHATSAPP");

      // Récupérer l'historique des messages
      const conversation = await prisma.cnvConversation.findFirst({
        where: { contactId: contact.id },
        include: {
          messages: {
            orderBy: { horodatageServeur: "asc" }
          }
        },
        orderBy: { ouverteLe: "desc" }
      });

      return NextResponse.json({
        success: true,
        lease: {
          id: demoLease.id,
          propertyTitle: demoLease.property?.title,
          landlordName: `${demoLease.property?.landlord?.firstName || ''} ${demoLease.property?.landlord?.lastName || ''}`.trim() || "Bailleur",
          landlordPhone,
          tenantName: `${demoLease.tenant?.firstName || ''} ${demoLease.tenant?.lastName || ''}`.trim() || "Adjoua KOUAME",
          monthlyRent: demoLease.monthlyRent,
          codeCourt: shortCode
        },
        contact,
        messages: conversation?.messages || []
      });
    }

    if (action === "declare_payment") {
      const { leaseId, montant, mois, moyen, preuveUrl } = body;
      const lease = await prisma.lease.findUnique({
        where: { id: leaseId },
        include: { tenant: true }
      });

      if (!lease) {
        return NextResponse.json({ error: "Bail introuvable" }, { status: 404 });
      }

      const res = await declarePaymentByTenant({
        bailId: leaseId,
        locataireId: lease.tenantId,
        montant: Number(montant) || 150000,
        mois: mois || "novembre 2026",
        moyen: moyen || "Wave Mobile Money",
        preuveUrl
      });

      return NextResponse.json({ success: true, declaration: res });
    }

    if (action === "landlord_reply") {
      const { phone, text, transport = "WHATSAPP" } = body;
      if (!phone || !text) {
        return NextResponse.json({ error: "Numéro ou texte manquant" }, { status: 400 });
      }

      const res = await handleIncomingMessage({
        numero: phone,
        texteBrut: text,
        transport
      });

      return NextResponse.json({ success: true, result: res });
    }

    return NextResponse.json({ error: "Action non reconnue" }, { status: 400 });
  } catch (error: any) {
    console.error("[SIMULATE_CONVERSATIONAL_ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
