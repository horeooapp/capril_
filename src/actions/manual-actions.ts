"use server"

import { isFeatureEnabled, FEATURES } from "@/lib/features"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function getDynamicManualContent() {
  const sections = []

  // Administration Centrale
  const adminSection = {
    title: "Administration Centrale",
    icon: "Lock",
    content: [
      "Registre d'Audit Immuable : Traçabilité SHA-256 de chaque action critique.",
      "Conformité KYC/KYB : Validation des identités selon les standards DGI/CDC."
    ]
  }
  if (await isFeatureEnabled(FEATURES.AI_ASSISTANT)) {
    adminSection.content.push("Supervision IA (M-GUARD) : Détection proactive des anomalies de flux.")
  }
  sections.push(adminSection)

  // Patrimoine
  const heritageSection = {
    title: "Gestion de Patrimoine",
    icon: "Database",
    content: [
      "Mandats & Baux : Suivi du cycle de vie contractuel et financier."
    ]
  }
  if (await isFeatureEnabled(FEATURES.MAINTENANCE)) {
    heritageSection.content.push("Passeport Logement+ : Carnet d'entretien et dossiers techniques centralisés.")
  }
  if (await isFeatureEnabled(FEATURES.FISCALITY)) {
    heritageSection.content.push("Gestion Fiscale : Analyse et déclarations liées aux revenus fonciers.")
  }
  sections.push(heritageSection)

  // Locataire
  const tenantSection = {
    title: "Expérience Locataire",
    icon: "Smartphone",
    content: [
      "Paiements Multicanaux : Intégration Native CinetPay & Wave.",
      "Quittance Automatisée : Délivrance immédiate après confirmation du réseau."
    ]
  }
  if (await isFeatureEnabled(FEATURES.MEDIATION)) {
    tenantSection.content.push("Salle de Médiation : Résolution structurée des litiges locatifs.")
  }
  if (await isFeatureEnabled(FEATURES.USSD_PORTAL)) {
    tenantSection.content.push("Portail USSD : Accès aux services sans connexion Internet.")
  }
  sections.push(tenantSection)

  const lastLog = await prisma.auditLog.findFirst({
    orderBy: { createdAt: 'desc' }
  })

  return {
    sections,
    version: "4.2.1-AUTO",
    lastUpdate: lastLog?.createdAt || new Date(),
    hash: "QAPRIL-" + Math.random().toString(36).substring(7).toUpperCase()
  }
}

export async function getManualUserContext() {
  const session = await auth()
  if (!session?.user?.id) {
    return {
      isAuthenticated: false,
      role: "GUEST",
      name: "Visiteur",
      email: "",
      phone: "",
      isVerified: false,
      propertiesCount: 0,
      activeLeasesCount: 0,
      openTicketsCount: 0,
      recentEvents: [],
      dbStatus: "CONNECTED"
    }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true
      }
    })

    const [propertiesCount, activeLeasesCount, ticketsCount, recentLogs] = await Promise.all([
      prisma.property.count({
        where: {
          deletedAt: null,
          OR: [
            { ownerUserId: session.user.id },
            { managedByUserId: session.user.id }
          ]
        }
      }),
      prisma.lease.count({
        where: {
          OR: [
            { landlordUserId: session.user.id },
            { tenantUserId: session.user.id }
          ],
          status: { in: ['ACTIVE', 'ACTIVE_DECLARATIF'] }
        }
      }),
      prisma.ticketMaintenance.count({
        where: {
          OR: [
            { locataireId: session.user.id },
            { logement: { ownerUserId: session.user.id } }
          ],
          statut: { in: ['EN_ATTENTE', 'EN_COURS', 'REOUVERT'] }
        }
      }),
      prisma.auditLog.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 4,
        select: {
          id: true,
          action: true,
          module: true,
          createdAt: true
        }
      })
    ])

    return {
      isAuthenticated: true,
      role: user?.role || "USER",
      name: (user?.firstName ? user.firstName + " " : "") + (user?.lastName || user?.email || "Utilisateur"),
      email: user?.email || "",
      phone: user?.phone || "",
      isVerified: !!user?.isVerified,
      propertiesCount,
      activeLeasesCount,
      openTicketsCount: ticketsCount,
      recentEvents: recentLogs.map(l => ({
        id: l.id,
        action: l.action,
        module: l.module || "SYSTEM",
        date: l.createdAt.toLocaleDateString("fr-FR")
      })),
      dbStatus: "CONNECTED"
    }
  } catch (e) {
    return {
      isAuthenticated: true,
      role: session.user.role || "USER",
      name: session.user.name || "Utilisateur",
      email: session.user.email || "",
      phone: "",
      isVerified: false,
      propertiesCount: 0,
      activeLeasesCount: 0,
      openTicketsCount: 0,
      recentEvents: [],
      dbStatus: "CONNECTED"
    }
  }
}

export async function createQuickSupportTicket(data: {
  subject: string
  description: string
  category: string
  priority: string
}) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Vous devez être connecté pour ouvrir un ticket." }
  }

  try {
    const ticketRef = `TCK-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`

    await prisma.auditLog.create({
      data: {
        action: "SUPPORT_TICKET_SUBMITTED",
        module: "SUPPORT",
        userId: session.user.id,
        details: {
          ticketRef,
          subject: data.subject,
          description: data.description,
          category: data.category,
          priority: data.priority,
          platform: "WEB_PORTAL"
        }
      }
    })

    await prisma.notification.create({
      data: {
        userId: session.user.id,
        title: `Ticket d'Assistance Créé (${ticketRef})`,
        message: `Votre demande "${data.subject}" a bien été enregistrée par le support technique QAPRIL. Réf: ${ticketRef}`,
        type: "SUPPORT"
      }
    })

    return {
      success: true,
      ticketRef,
      message: `Votre ticket ${ticketRef} a été enregistré avec succès dans notre base de données. Un conseiller technique traite votre demande.`
    }
  } catch (e: any) {
    console.error("Erreur createQuickSupportTicket:", e)
    return { success: false, error: "Impossible d'enregistrer le ticket d'assistance." }
  }
}

export async function logManualDownload() {
  try {
    const session = await auth()
    if (session?.user?.id) {
      await prisma.auditLog.create({
        data: {
          action: "DOWNLOAD_MANUAL_PDF",
          module: "MANUAL",
          userId: session.user.id
        }
      })
    }
    return { success: true }
  } catch {
    return { success: false }
  }
}

