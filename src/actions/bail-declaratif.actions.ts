"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export interface BailDeclaratifData {
  tenantFullName: string
  tenantPhone:    string
  commune:        string
  address:        string
  rentAmount:     number
  paymentDay:     number
  startDate:      string // YYYY-MM-DD
  propertyId?:    string // Si bien deja cree
}

// Normaliser le numero de telephone CI
function normaliserTelephone(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, "")
  if (digits.startsWith("225")) return "+" + digits
  if (digits.length === 10) return "+225" + digits
  if (digits.length === 8) return "+225" + "0" + digits
  return "+" + digits
}

export async function creerBailDeclaratif(
  ownerUserId: string,
  data: BailDeclaratifData
) {
  const phoneNorm = normaliserTelephone(data.tenantPhone)

  // 1. Trouver ou creer le locataire
  let tenant = await prisma.user.findFirst({
    where: { phone: phoneNorm }
  })

  if (!tenant) {
    tenant = await prisma.user.create({
      data: {
        phone:    phoneNorm,
        firstName: data.tenantFullName.split(' ')[0] || '',
        lastName: data.tenantFullName.split(' ').slice(1).join(' ') || '',
        role:     "TENANT",
        status:   "active",
      }
    })
  }

  // 2. Utiliser le bien fourni ou creer un bien declaratif
  let propertyId = data.propertyId

  if (!propertyId) {
    // Generer une reference declarative
    const count = await prisma.property.count()
    const seq = String(count + 1).padStart(5, "0")
    const year = new Date().getFullYear()
    const communeCode = data.commune.slice(0, 3).toUpperCase()
    const propertyCode = `IND-${communeCode}-${year}-${seq}`

    const property = await prisma.property.create({
      data: {
        propertyCode,
        ownerUserId:   ownerUserId,
        typeStructure: "INDEPENDANT",
        commune:       data.commune,
        address:       data.address,
        propertyType:  "Appartement",
        status:        "active"
      }
    })
    propertyId = property.id
  }

  // 3. Generer la reference du bail
  const count = await prisma.lease.count()
  const seq = String(count + 1).padStart(5, "0")
  const year = new Date().getFullYear()
  const leaseReference = `BDQ-${year}-${seq}`

  // 4. Creer le bail declaratif
  const bail = await prisma.lease.create({
    data: {
      leaseReference,
      tenantId:       tenant.id,
      landlordId:     ownerUserId, // Prerequisite for LeaseUncheckedCreateInput
      propertyId:     propertyId,
      rentAmount:     data.rentAmount,
      durationMonths: 12,          // Prerequisite for LeaseUncheckedCreateInput
      chargesAmount:  0,
      paymentDay:     data.paymentDay,
      startDate:      new Date(data.startDate),
      status:         "ACTIVE_DECLARATIF",
      modeCreation:   "DECLARATIF",
    }
  })

  // 5. Envoyer SMS invitation au locataire
  console.log(`[BDQ] Bail cree ${leaseReference} - Inviter ${phoneNorm}`)

  revalidatePath("/dashboard/leases")
  return { success: true, bail, tenant }
}
