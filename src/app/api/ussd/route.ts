export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { processUSSDRequest } from "@/lib/ussd";

/**
 * Module 1 : USSD Gateway API (Grand Finale)
 * Normalizes requests from Orange CI, MTN, Moov and Africa's Talking.
 */
export async function POST(req: NextRequest) {
    try {
        const contentType = req.headers.get("content-type") || "";
        let phoneNumber, text, sessionId;

        if (contentType.includes("application/json")) {
            const body = await req.json();
            phoneNumber = body.phoneNumber || body.msisdn;
            text = body.text || "";
            sessionId = body.sessionId || "default";
        } else {
            const body = await req.formData();
            phoneNumber = body.get("phoneNumber")?.toString() || body.get("msisdn")?.toString();
            text = body.get("text")?.toString() || "";
            sessionId = body.get("sessionId")?.toString() || "default";
        }

        if (!phoneNumber) {
            return new Response("END Numéro invalide or manquant.", { 
                status: 400,
                headers: { "Content-Type": "text/plain" }
            });
        }

        const response = await processUSSDRequest(phoneNumber, text, sessionId);

        return new Response(response, {
            status: 200,
            headers: { "Content-Type": "text/plain" }
        });

    } catch (error) {
        console.error("USSD Error:", error);
        return new Response("END Erreur système interne USSD QAPRIL.", {
            status: 500,
            headers: { "Content-Type": "text/plain" }
        });
    }
}
