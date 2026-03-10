"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { sendNotification, broadcastNotification } from "@/lib/notifications"
import { Role } from "@prisma/client"

/**
 * Part 20.3: Send Arrears Reminder to a single tenant
 */
export async function sendArrearsReminder(tenantId: string, leaseRef: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Non authentifié.");

    await sendNotification({
        userId: tenantId,
        title: "🔔 Rappel de Loyer",
        content: `Votre loyer pour le bail ${leaseRef} est en attente de paiement. Merci de régulariser rapidement.`,
        channels: ['PUSH', 'SMS', 'EMAIL']
    });
}

/**
 * Part 20.4: Broadcast payment confirmation
 */
export async function notifyPaymentConfirmed(userId: string, amount: number, ref: string) {
    await sendNotification({
        userId,
        title: "✅ Paiement Confirmé",
        content: `Votre paiement de ${amount.toLocaleString()} FCFA (Réf: ${ref}) a été confirmé. Merci !`,
        channels: ['PUSH', 'SMS']
    });
}

/**
 * Part 20.5: Admin broadcast for all active tenants
 */
export async function adminBroadcast(content: string, title?: string) {
    const session = await auth();
    if (!session?.user || (session.user.role as any) !== 'ADMIN') {
        throw new Error("Réservé aux administrateurs.");
    }

    const tenants = await prisma.user.findMany({
        where: { role: Role.TENANT },
        select: { id: true }
    });

    await broadcastNotification(
        tenants.map(t => t.id),
        content,
        title,
        ['PUSH', 'SMS']
    );

    revalidatePath('/dashboard/admin/notifications');
    return { success: true, sentTo: tenants.length };
}
