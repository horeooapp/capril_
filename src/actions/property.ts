"use server"

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generatePropertyCode } from "@/lib/property";
import { revalidatePath } from "next/cache";

/**
 * Part 5: Property Registration (Server Action)
 */
export async function registerProperty(data: {
    category: 'RESIDENTIAL' | 'COMMERCIAL',
    addressLine1: string,
    commune: string,
    declaredRentFcfa: number,
    propertyType?: string,
    totalRooms?: number,
    usefulAreaSqm?: number
}) {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        return { error: "Non autorisé" };
    }

    try {
        const propertyCode = await generatePropertyCode(data.category);

        const property = await prisma.property.create({
            data: {
                propertyCode,
                propertyCategory: data.category,
                ownerUserId: session.user.id,
                addressLine1: data.addressLine1,
                commune: data.commune,
                declaredRentFcfa: BigInt(data.declaredRentFcfa),
                propertyType: data.propertyType,
                totalRooms: data.totalRooms,
                usefulAreaSqm: data.usefulAreaSqm,
                status: 'AVAILABLE'
            }
        });

        revalidatePath("/dashboard");
        return { success: true, propertyCode: property.propertyCode };
    } catch (error) {
        console.error("[SERVER ACTION] Error registering property:", error);
        return { error: "Impossible d'enregistrer la propriété." };
    }
}
