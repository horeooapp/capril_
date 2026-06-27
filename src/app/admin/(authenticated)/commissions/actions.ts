"use server"

import { prisma } from "@/lib/prisma"
import { PaymentCanal, ProfileType } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function getCommissionConfigs() {
  try {
    return await prisma.commissionConfig.findMany({
      orderBy: { createdAt: 'desc' }
    })
  } catch (error) {
    console.error("[getCommissionConfigs] Error:", error)
    return []
  }
}

export async function createCommissionConfig(data: {
  profileType: ProfileType,
  paymentCanal?: PaymentCanal | null,
  tauxPourcent: number,
  montantMin?: number | null,
  montantMax?: number | null,
  actif?: boolean
}) {
  try {
    const newConfig = await prisma.commissionConfig.create({
      data: {
        profileType: data.profileType,
        paymentCanal: data.paymentCanal || null,
        tauxPourcent: data.tauxPourcent,
        montantMin: data.montantMin || 0,
        montantMax: data.montantMax,
        actif: data.actif ?? true
      }
    })
    revalidatePath("/admin/commissions")
    return { success: true, data: newConfig }
  } catch (error) {
    console.error("[createCommissionConfig] Error:", error)
    return { success: false, error: "Failed to create config" }
  }
}

export async function updateCommissionConfig(id: string, data: Partial<{
  tauxPourcent: number,
  montantMin: number | null,
  montantMax: number | null,
  actif: boolean
}>) {
  try {
    const updated = await prisma.commissionConfig.update({
      where: { id },
      data
    })
    revalidatePath("/admin/commissions")
    return { success: true, data: updated }
  } catch (error) {
    console.error("[updateCommissionConfig] Error:", error)
    return { success: false, error: "Failed to update config" }
  }
}

export async function deleteCommissionConfig(id: string) {
  try {
    await prisma.commissionConfig.delete({ where: { id } })
    revalidatePath("/admin/commissions")
    return { success: true }
  } catch (error) {
    console.error("[deleteCommissionConfig] Error:", error)
    return { success: false, error: "Failed to delete config" }
  }
}
