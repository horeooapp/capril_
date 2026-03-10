"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getNotifications() {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) return []

    return await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20
    })
}

export async function markAsRead(notificationId: string) {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) throw new Error("Unauthorized")

    await prisma.notification.update({
        where: { id: notificationId, userId },
        data: { read: true }
    })

    revalidatePath("/dashboard")
}

export async function createNotification(data: {
    userId: string,
    title: string,
    message: string,
    type?: "INFO" | "SUCCESS" | "WARNING" | "ERROR",
    link?: string
}) {
    return await prisma.notification.create({
        data: {
            userId: data.userId,
            title: data.title,
            content: data.message,
            type: data.type || "INFO",
            link: data.link
        }
    })
}
