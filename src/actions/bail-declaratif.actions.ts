"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { serializeObject } from "@/lib/serialize"

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
  if (!phone) return "";
  const digits = String(phone).replace(/[^0-9]/g, "")
  if (digits.startsWith("225")) return "+" + digits
  if (digits.length === 10) return "+225" + digits
  if (digits.length === 8) return "+225" + "0" + digits
  return "+" + digits
}

function genRef(prefix: string, commune?: string): string {
  const year   = new Date().getFullYear()
  const random = Math.random().toString(36).slice(2, 7).toUpperCase()
  if (commune) {
    const cc = commune.slice(0, 3).toUpperCase()
    return `${prefix}-${cc}-${year}-${random}`
  }
  return `${prefix}-${year}-${random}`
}

export async function creerBailDeclaratif(
  ownerUserId: string,
  data: BailDeclaratifData
) {
  try {
  if (!data.tenantFullName?.trim()) return { error: "Nom du locataire requis" }
  if (!data.tenantPhone)            return { error: "Numéro de téléphone requis" }
  if (!data.commune?.trim())        return { error: "Commune requise" }
  if (!data.address?.trim())        return { error: "Adresse requise" }
  if (!data.rentAmount || data.rentAmount <= 0) return { error: "Montant loyer invalide" }
  if (!data.startDate)              return { error: "Date de début requise" }

  const phoneNorm = normaliserTelephone(data.tenantPhone)
  if (!phoneNorm)                   return { error: "Format du téléphone invalide" }

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
        onboardingComplete: false,
      }
    })
  }

  // 2. Utiliser le bien fourni ou creer un bien declaratif
  let propertyId = data.propertyId

  if (!propertyId) {
    // Generer une reference declarative
    const propertyCode = genRef("IND", data.commune)

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
  const leaseReference = genRef("BDQ")

  // 4. Creer le bail declaratif (Lease)
  const bail = await prisma.lease.create({
    data: {
      leaseReference,
      tenantId:       tenant.id,
      landlordId:     ownerUserId, // Prerequisite for LeaseUncheckedCreateInput
      propertyId:     propertyId,
      typeBail:       "DECLARATIF_BDQ",
      rentAmount:     Number(data.rentAmount) || 0,
      durationMonths: 0,          // Option A: 0 = durée libre
      chargesAmount:  0,
      paymentDay:     Number(data.paymentDay) || 5,
      startDate:      new Date(data.startDate),
      status:         "ACTIVE_DECLARATIF",
      modeCreation:   "DECLARATIF",
    }
  })

  // 4bis. Creer le BailDeclaratif et lier au Lease
  const bdq = await prisma.bailDeclaratif.create({
    data: {
      bailleurId:          ownerUserId,
      propertyId:          propertyId,
      telephoneLocataire:  phoneNorm,
      nomLocataireDeclare: data.tenantFullName,
      loyerDeclareMensuel: Number(data.rentAmount) || 0,
      dateEntreeEstimee:   new Date(data.startDate),
      statut:              "PENDING_LOCATAIRE",
      sourceCreation:      "IA_CHAT",
      descriptionLogement: data.address,
      hashDeclaration:     "GENERATED_FROM_ACTION",
      bailFormelId:        bail.id
    }
  })

  // 5. Envoyer SMS invitation au locataire
  console.log(`[BDQ] Bail cree ${leaseReference} - Inviter ${phoneNorm}`)

  revalidatePath("/dashboard/leases")
  return serializeObject({ success: true, bail, bdq, tenant })
  } catch (err: any) {
    console.error("[BDQ_CREATE_ERROR]", err);
    return { error: err.message || "Erreur interne lors de la création du bail" };
  }
}
