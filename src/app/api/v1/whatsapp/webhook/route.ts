import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as crypto from "crypto";
import { processWhatsAppMessage } from "@/lib/whatsapp/worker";

const VERIFY_TOKEN = process.env.WA_VERIFY_TOKEN || "QAPRIL_SECRET_TOKEN";
const APP_SECRET = process.env.WA_APP_SECRET || "fallback_secret";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const mode = searchParams.get("hub.mode");
        const token = searchParams.get("hub.verify_token");
        const challenge = searchParams.get("hub.challenge");

        if (mode === "subscribe" && token === VERIFY_TOKEN) {
            return new NextResponse(challenge, { status: 200 }); // RG-WH-01
        }
        return new NextResponse("Forbidden", { status: 403 });
    } catch (error) {
        console.error("Erreur Webhook GET:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

function verifySignature(rawBody: Buffer, header: string | null): boolean {
    if (!header || !header.startsWith("sha256=")) return false;
    const expected = "sha256=" + crypto.createHmac("sha256", APP_SECRET).update(rawBody).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(header));
}

export async function POST(req: Request) {
    try {
        // Obtenir le body brut (RAW) pour la vérification HMAC (RG-WH-02)
        const arrayBuffer = await req.arrayBuffer();
        const rawBody = Buffer.from(arrayBuffer);
        const signature = req.headers.get("X-Hub-Signature-256");

        if (!verifySignature(rawBody, signature)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const bodyText = rawBody.toString('utf-8');
        const body = JSON.parse(bodyText);

        if (body.object === "whatsapp_business_account") {
            for (const entry of body.entry) {
                for (const change of entry.changes) {
                    if (change.value && change.value.messages) {
                        const message = change.value.messages[0];
                        const wamid = message.id;
                        const phoneNumber = message.from;

                        // Vérification idempotence (RG-WH-03)
                        const existingLog = await prisma.waMessageLog.findUnique({ where: { wamid } });
                        if (existingLog) {
                            console.log(`[WA WEBHOOK] Ignoring duplicate message ${wamid}`);
                            continue; // Ignorer les doublons de Meta
                        }
                        
                        await prisma.waMessageLog.create({ data: { wamid } });

                        // Lancement de la tâche en arrière-plan (sans await, ou avec Promise.resolve)
                        // Note: Sous Vercel on utilise waitUntil() de Next.js, mais par défaut ceci ne bloque pas la réponse
                        processWhatsAppMessage(message, phoneNumber).catch(err => {
                            console.error(`[Worker Error] wamid: ${wamid}`, err);
                        });
                    }
                }
            }
            // Retour rapide à Meta
            return NextResponse.json({ status: "OK" });
        }

        return NextResponse.json({ status: "IGNORED" });
    } catch (error) {
        console.error("Erreur Webhook POST:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

