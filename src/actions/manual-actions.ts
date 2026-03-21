"use server"

import { isFeatureEnabled, FEATURES } from "@/lib/features"
import { prisma } from "@/lib/prisma"

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

  // Metadata
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
