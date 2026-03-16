"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getActiveNews() {
    try {
        return await prisma.newsTicker.findMany({
            where: { isActive: true },
            orderBy: { priority: 'desc' }
        })
    } catch (error) {
        console.error("[ACTION] getActiveNews error:", error)
        return []
    }
}

export async function getAllNews() {
    try {
        return await prisma.newsTicker.findMany({
            orderBy: { createdAt: 'desc' }
        })
    } catch (error) {
        console.error("[ACTION] getAllNews error:", error)
        return []
    }
}

export async function createNews(content: string, priority: number = 0) {
    try {
        const news = await prisma.newsTicker.create({
            data: { content, priority }
        })
        revalidatePath("/")
        return { success: true, data: news }
    } catch (error) {
        console.error("[ACTION] createNews error:", error)
        return { error: "Erreur lors de la création de l'information." }
    }
}

export async function updateNews(id: string, data: { content?: string, priority?: number, isActive?: boolean }) {
    try {
        const news = await prisma.newsTicker.update({
            where: { id },
            data
        })
        revalidatePath("/")
        return { success: true, data: news }
    } catch (error) {
        console.error("[ACTION] updateNews error:", error)
        return { error: "Erreur lors de la mise à jour." }
    }
}

export async function deleteNews(id: string) {
    try {
        await prisma.newsTicker.delete({
            where: { id }
        })
        revalidatePath("/")
        return { success: true }
    } catch (error) {
        console.error("[ACTION] deleteNews error:", error)
        return { error: "Erreur lors de la suppression." }
    }
}
