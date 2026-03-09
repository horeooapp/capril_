import { NextRequest, NextResponse } from "next/server";
import { processUSSDRequest } from "@/lib/ussd";

/**
 * Part 18.2: USSD Gateway API
 * Normalizes requests from Orange CI, MTN, and Moov.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.formData();
        
        // Normalize fields (Operator dependent keys usually: phoneNumber, text, sessionId)
        const phoneNumber = body.get("phoneNumber")?.toString() || body.get("msisdn")?.toString();
        const text = body.get("text")?.toString() || "";
        const sessionId = body.get("sessionId")?.toString() || "default";

        if (!phoneNumber) {
            return new Response("Invalid Request", { status: 400 });
        }

        const response = await processUSSDRequest(phoneNumber, text, sessionId);

        return new Response(response, {
            headers: { "Content-Type": "text/plain" }
        });

    } catch (error) {
        console.error("USSD Error:", error);
        return new Response("END Erreur système USSD.", {
            headers: { "Content-Type": "text/plain" }
        });
    }
}
