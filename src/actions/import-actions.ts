"use server"

import { auth } from "@/auth"
import { logAction } from "./audit"

export async function simulateImportProcess() {
    const session = await auth()
    if (!session?.user?.id) return { error: "Non autorisé" }

    try {
        await logAction({
            action: "SIMULATE_IMPORT",
            module: "DATA_ENGINEERING",
            entityId: session.user.id
        })
        
        await new Promise(resolve => setTimeout(resolve, 3000))
        return { success: true, count: 342 }
    } catch (e) {
        return { error: "Erreur pendant l'import." }
    }
}
