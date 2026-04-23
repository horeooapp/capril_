"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function getRecentNotifications() {
    const session = await auth();
    if (!session?.user) return [];

    return prisma.notification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 10
    });
}

export async function markAsRead(id: string) {
    const session = await auth();
    if (!session?.user) return;

    await prisma.notification.update({
        where: { id, userId: session.user.id },
        data: { read: true }
    });
    revalidatePath("/admin");
}

export async function markAllAsRead() {
    const session = await auth();
    if (!session?.user) return;

    await prisma.notification.updateMany({
        where: { userId: session.user.id, read: false },
        data: { read: true }
    });
    revalidatePath("/admin");
}

export async function savePushToken(token: string) {
    const session = await auth();
    if (!session?.user) return;

    await prisma.user.update({
        where: { id: session.user.id },
        data: { pushToken: token }
    });
    return { success: true };
}
