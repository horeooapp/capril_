import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateReceiptPDF } from "@/lib/pdf-generator";
import { chargerMarque } from "@/lib/quittance-personnalisation";
import { MENTION_DECLARATIVE } from "@/lib/quittance-express-envoi";

/** Aperçu d'une quittance fictive avec la personnalisation de l'utilisateur connecté. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Non connecté", { status: 401 });
  const pdf = await generateReceiptPDF({
    receiptRef: "APERCU-0000", leaseRef: "QEX-APERCU", periodMonth: new Date().toISOString().slice(0, 7),
    rentAmount: 85000, chargesAmount: 0, totalAmount: 85000,
    paymentMethod: "Wave - réf. T240000000", paymentNote: "Paiement reçu directement par le bailleur, hors plateforme QAPRIL.",
    paidAt: new Date(), tenantName: "Locataire Exemple", propertyAddress: "Logement - Quartier Exemple",
    landlordName: session.user.name || "Bailleur", receiptHash: "apercu-sans-valeur".padEnd(64, "0"),
    declarative: true, mention: "APERÇU SANS VALEUR. " + MENTION_DECLARATIVE,
    marque: (await chargerMarque(session.user.id)) || undefined,
  });
  return new NextResponse(new Uint8Array(pdf), { headers: { "Content-Type": "application/pdf", "Cache-Control": "private, no-store" } });
}
