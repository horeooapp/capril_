import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "QAPRIL_SECRET_TOKEN";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      return new NextResponse(challenge, { status: 200 });
    }

    return new NextResponse("Forbidden", { status: 403 });
  } catch (error) {
    console.error("Erreur Webhook WA-01 GET:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Fonction d'aide pour simuler un envoi WhatsApp
async function sendWhatsAppMessage(to: string, text: string) {
    // TODO: Appeler l'API Meta Graph API avec le token WhatsApp
    console.log(`[WA OUT] To ${to}: ${text}`);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.object === "whatsapp_business_account") {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.value && change.value.messages) {
            const message = change.value.messages[0];
            const phoneNumber = message.from;
            const textBody = message.text?.body?.trim()?.toLowerCase();
            const image = message.image;

            // Chercher une session active
            let session = await prisma.waSession.findFirst({
                where: { numeroWa: phoneNumber, etat: { not: "TERMINE" } },
                orderBy: { createdAt: "desc" }
            });

            // GESTION DES IMAGES
            if (image) {
                const imageId = image.id; // Meta Media ID
                
                if (!session) {
                    session = await prisma.waSession.create({
                        data: {
                            numeroWa: phoneNumber,
                            etat: "COLLECTE",
                            pages: JSON.stringify([{ id: imageId, order: 1, quality: null }]),
                            dernierMsgAt: new Date()
                        }
                    });
                    await sendWhatsAppMessage(phoneNumber, "J'ai reçu la première page de votre bail. Envoyez les suivantes, ou tapez 'fini' quand c'est complet.");
                } else if (session.etat === "COLLECTE") {
                    const pages = JSON.parse((session.pages as string) || "[]");
                    pages.push({ id: imageId, order: pages.length + 1, quality: null });
                    
                    await prisma.waSession.update({
                        where: { id: session.id },
                        data: { pages: JSON.stringify(pages), dernierMsgAt: new Date() }
                    });
                    await sendWhatsAppMessage(phoneNumber, `J'ai reçu ${pages.length} pages. Envoyez les suivantes ou tapez 'fini'.`);
                } else if (session.etat === "RECAPTURE") {
                    // Logique de remplacement d'une page illisible
                    const pages = JSON.parse((session.pages as string) || "[]");
                    pages[pages.length - 1] = { id: imageId, order: pages.length, quality: 0.9 }; // Simulated high quality
                    await prisma.waSession.update({
                        where: { id: session.id },
                        data: { pages: JSON.stringify(pages), etat: "EXTRACTION", dernierMsgAt: new Date() }
                    });
                    await sendWhatsAppMessage(phoneNumber, "Merci, cette page est lisible. Reprise de l'analyse en cours...");
                }
            } 
            // GESTION DU TEXTE
            else if (textBody) {
                if (!session) {
                    await sendWhatsAppMessage(phoneNumber, "Bonjour ! Envoyez-moi les photos de votre bail pour commencer l'analyse.");
                } else {
                    await prisma.waSession.update({
                        where: { id: session.id },
                        data: { dernierMsgAt: new Date() }
                    });

                    if (session.etat === "COLLECTE" && (textBody === "fini" || textBody === "c'est tout" || textBody === "fin")) {
                        await prisma.waSession.update({
                            where: { id: session.id },
                            data: { etat: "NORMALISATION" }
                        });
                        await sendWhatsAppMessage(phoneNumber, "Parfait. Je commence l'analyse de votre bail...");
                        
                    } 
                    else if (session.etat === "VALIDATION") {
                        const champ = session.champCourant;
                        if (!champ) {
                            await sendWhatsAppMessage(phoneNumber, "Je n'attends aucune validation pour l'instant.");
                            return NextResponse.json({ status: "OK" });
                        }

                        let champs = JSON.parse((session.champs as string) || "{}");
                        
                        if (textBody === "oui" || textBody === "ok") {
                            if (champs[champ]) {
                                champs[champ].statut = "CONFIRME";
                            }
                            await prisma.waSession.update({
                                where: { id: session.id },
                                data: { champs: JSON.stringify(champs) }
                            });
                            await sendWhatsAppMessage(phoneNumber, "Enregistré.");
                        } else {
                            if (textBody.startsWith("corriger ")) {
                                const correction = message.text?.body?.substring(9);
                                if (champs[champ]) {
                                    champs[champ].valeur = correction;
                                    champs[champ].statut = "CORRIGE";
                                }
                                await prisma.waSession.update({
                                    where: { id: session.id },
                                    data: { champs: JSON.stringify(champs) }
                                });
                                await sendWhatsAppMessage(phoneNumber, `Corrigé avec: ${correction}`);
                            } else {
                                await sendWhatsAppMessage(phoneNumber, "Répondez 'Oui' pour confirmer, ou 'Corriger [votre valeur]' pour modifier.");
                            }
                        }
                    }
                }
            }
          }
        }
      }
      return NextResponse.json({ status: "OK" });
    }

    return NextResponse.json({ status: "IGNORED" });
  } catch (error) {
    console.error("Erreur Webhook WA-01 POST:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
