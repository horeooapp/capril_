import { prisma } from "@/lib/prisma";
import * as crypto from "crypto";

const WA_ACCESS_TOKEN = process.env.WA_ACCESS_TOKEN;
const WA_PHONE_NUMBER_ID = process.env.WA_PHONE_NUMBER_ID;
const MEDIA_ENCRYPTION_KEY = process.env.MEDIA_ENCRYPTION_KEY || "12345678901234567890123456789012"; // 32 bytes fallback for testing

export async function sendWhatsAppMessage(to: string, text: string) {
    if (!WA_ACCESS_TOKEN || !WA_PHONE_NUMBER_ID) {
        console.log(`[WA OUT SIMULATION] To ${to}: ${text}`);
        return;
    }

    try {
        await fetch(`https://graph.facebook.com/v20.0/${WA_PHONE_NUMBER_ID}/messages`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${WA_ACCESS_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                to: to,
                type: "text",
                text: { body: text }
            })
        });
    } catch (e) {
        console.error("Error sending WhatsApp message", e);
    }
}

export async function downloadAndEncryptMedia(mediaId: string): Promise<string | null> {
    if (!WA_ACCESS_TOKEN) return mediaId; // Simulation fallback

    try {
        // 1. Get temporary URL
        const mediaUrlRes = await fetch(`https://graph.facebook.com/v20.0/${mediaId}`, {
            headers: { Authorization: `Bearer ${WA_ACCESS_TOKEN}` }
        });
        if (!mediaUrlRes.ok) return null;
        const mediaData = await mediaUrlRes.json();

        // 2. Download binary
        const imageRes = await fetch(mediaData.url, {
            headers: { Authorization: `Bearer ${WA_ACCESS_TOKEN}` }
        });
        if (!imageRes.ok) return null;
        const arrayBuffer = await imageRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 3. Encrypt AES-256
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(MEDIA_ENCRYPTION_KEY), iv);
        let encrypted = cipher.update(buffer);
        encrypted = Buffer.concat([encrypted, cipher.final()]);

        // Returns a combined string of iv:encryptedData
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (err) {
        console.error("Error downloading media", err);
        return null;
    }
}

export async function processWhatsAppMessage(message: any, phoneNumber: string) {
    const textBody = message.text?.body?.trim()?.toLowerCase();
    const image = message.image;

    // Chercher une session active
    let session = await prisma.waSession.findFirst({
        where: { numeroWa: phoneNumber, etat: { not: "TERMINE" } },
        orderBy: { createdAt: "desc" }
    });

    if (image) {
        const rawMediaId = image.id;
        const encryptedMediaId = await downloadAndEncryptMedia(rawMediaId) || rawMediaId;

        if (!session) {
            session = await prisma.waSession.create({
                data: {
                    numeroWa: phoneNumber,
                    etat: "COLLECTE",
                    pages: JSON.stringify([{ id: encryptedMediaId, order: 1, quality: null }]),
                    dernierMsgAt: new Date()
                }
            });
            await sendWhatsAppMessage(phoneNumber, "J'ai reçu la première page de votre bail. Envoyez les suivantes, ou tapez 'fini' quand c'est complet.");
        } else if (session.etat === "COLLECTE") {
            const pages = JSON.parse((session.pages as string) || "[]");
            pages.push({ id: encryptedMediaId, order: pages.length + 1, quality: null });
            
            await prisma.waSession.update({
                where: { id: session.id },
                data: { pages: JSON.stringify(pages), dernierMsgAt: new Date() }
            });
            await sendWhatsAppMessage(phoneNumber, `J'ai reçu ${pages.length} pages. Envoyez les suivantes ou tapez 'fini'.`);
        } else if (session.etat === "RECAPTURE") {
            const pages = JSON.parse((session.pages as string) || "[]");
            pages[pages.length - 1] = { id: encryptedMediaId, order: pages.length, quality: 0.9 }; 
            await prisma.waSession.update({
                where: { id: session.id },
                data: { pages: JSON.stringify(pages), etat: "EXTRACTION", dernierMsgAt: new Date() }
            });
            await sendWhatsAppMessage(phoneNumber, "Merci, cette page est lisible. Reprise de l'analyse en cours...");
        }
    } else if (textBody) {
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
            } else if (session.etat === "VALIDATION") {
                const champ = session.champCourant;
                if (!champ) {
                    await sendWhatsAppMessage(phoneNumber, "Je n'attends aucune validation pour l'instant.");
                    return;
                }

                const champs = JSON.parse((session.champs as string) || "{}");
                
                if (textBody === "oui" || textBody === "ok") {
                    if (champs[champ]) champs[champ].statut = "CONFIRME";
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
