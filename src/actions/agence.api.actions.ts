"use server";

import { prisma } from "@/lib/prisma";
import crypto from "crypto";

/**
 * Generate a new API access for an agency
 */
export async function generateApiAccess(agenceId: string, tier: string = "BASIC") {
    try {
        const apiKey = "qak_" + crypto.randomBytes(16).toString("hex");
        const apiSecret = crypto.randomBytes(32).toString("hex");

        let requestsPerDay = 100;
        let montantMensuel = 0;

        if (tier === "PREMIUM") {
            requestsPerDay = 1000;
            montantMensuel = 25000; // 25,000 FCFA
        } else if (tier === "ENTERPRISE") {
            requestsPerDay = 10000;
            montantMensuel = 100000; // 100,000 FCFA
        }

        const access = await prisma.agenceApiAccess.upsert({
            where: { agenceId },
            update: {
                tier,
                requestsPerDay,
                montantMensuel,
                actif: true
            },
            create: {
                agenceId,
                apiKey,
                apiSecret,
                tier,
                requestsPerDay,
                montantMensuel,
                actif: true
            }
        });

        // We return the raw secret only once during generation
        return { success: true, access: { ...access, rawSecret: apiSecret } };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Revokes API access for an agency
 */
export async function revokeApiAccess(accessId: string) {
    try {
        await prisma.agenceApiAccess.update({
            where: { id: accessId },
            data: { actif: false }
        });
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
