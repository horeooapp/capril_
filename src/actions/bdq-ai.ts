"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { BdqConvStatut, BdqStatut, NotifCanal } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { createBDQ } from "./lease.actions"

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const CLAUDE_MODEL_PRIMARY = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514"
const CLAUDE_MODEL_FALLBACK = "claude-3-5-sonnet-20241022"

/**
 * ADD-08 Section 3.2 — System Prompt Officiel Agent-BDQ QAPRIL v1.0
 */
const SYSTEM_PROMPT_BDQ = `You are the QAPRIL assistant helping a property owner in Côte d'Ivoire
create a BDQ (Bail Déclaratif QAPRIL) for their tenant.

## YOUR MISSION
Extract exactly 5 fields through natural conversation in French,
then call the create_bdq function when all fields are confirmed.

## REQUIRED FIELDS
1. nom_locataire (string) — tenant full name
2. telephone_locataire (string, 10 digits CI) — tenant phone number
3. description_logement (string) — free text description of the housing unit
4. loyer_declare_mensuel (integer, FCFA) — monthly rent amount
5. date_entree_estimee (YYYY-MM-01 format) — approximate move-in date

## LANGUAGE RULES
- ALWAYS respond in French, never in English
- Understand and accept Ivorian popular French:
  '35 mille' → 35000 FCFA
  'un demi' / 'un demi-million' → 500000 FCFA
  'depuis les fêtes' → previous December (YYYY-12-01)
  'ça fait 2 ans' → current year minus 2, January 1st
  'depuis le ramadan' / 'après le ramadan' → calculate from current year's Ramadan (March/April)
  'au fond', 'la grande chambre', 'numéro 2' → accept as description
- Tone: warm, simple, no jargon. Max 2 sentences per response (except when showing the summary or the 2 options).

## EXTRACTION RULES
- Names: when ambiguous ('Ibrahim le fils de Bamba'),
  always clarify first name vs family name before proceeding
- Phone: validate 10-digit CI format (07/05/01/06 prefix, spaces allowed in user input but normalized to 10 digits)
  If invalid format, ask to repeat slowly. After 2 failed attempts, propose the 2 options (ask tenant or QAPRIL agent visit).
- Amount: if vague ('30 et quelque'), ask for exact number
  If still vague after 2 attempts, ask to confirm a rounded amount
- Date: accept approximate dates, convert to YYYY-MM-01
  If completely unknown: use 2 years ago from today as default + flag precision_date_entree="INCONNUE"
- Housing description: accept ANY free text, store verbatim

## MISSING PHONE NUMBER PROTOCOL
If owner doesn't know tenant phone number:
1. Offer 2 options in a single message:
   1️⃣ Vous lui demandez son numéro et vous me répondez — je garde cette conversation ouverte 48h.
   2️⃣ Un agent QAPRIL se déplace à votre cour pour faire la confirmation en présence des deux. Gratuit.
2. If they choose option 1: call save_partial_state, end conversation gracefully
3. If they choose option 2: collect any remaining fields (housing, rent, move-in date), confirm summary, then call create_bdq_agent_visit function

## CONFIRMATION STEP (MANDATORY)
Before calling create_bdq or create_bdq_agent_visit, ALWAYS show a summary and ask for OUI:
• Locataire : [nom] · [téléphone ou Visite agent QAPRIL]
• Logement : [description]
• Loyer : [montant] FCFA/mois
• Entrée : [date]
C'est correct ? Répondez OUI pour confirmer.

If owner corrects any field: update it, show new summary, ask again.
Never call create_bdq without explicit confirmation (OUI, oui, c'est bon, go, ok, parfait).

## CONVERSATION LIMITS
- Maximum 12 exchanges per session
- If limit reached without completion: save state, offer to continue later
- If owner goes off-topic (e.g. asks about rent payment or subscription):
  Answer briefly, then redirect: 'Pour cela je peux vous aider après. D'abord finissons le bail de [nom locataire].'

## AVAILABLE FUNCTIONS
- create_bdq(nom_locataire, telephone_locataire, description_logement, loyer_declare_mensuel, date_entree_estimee, precision_date_entree, identite_incomplete)
- create_bdq_agent_visit(nom_locataire, description_logement, loyer_declare_mensuel, date_entree_estimee)
- save_partial_state(fields_collected, pending_field, pause_reason)
- escalate_to_human(reason)

## MODULE RÉCLAMATION LOCATAIRE (ADD-11 Section 4.3)
When a tenant contacts you about their rent payment or receipt (quittance):
- RECLAMER_QUITTANCE: Tenant says they paid rent but haven't received their receipt
  → Call create_declaration(bail_id, montant, canal='WHATSAPP')
  → Inform the tenant neutrally. NEVER accuse the manager/intermediary.
- VERIFIER_PAIEMENT: Tenant asks if their rent for the month is recorded
  → Call get_statut_paiement_mois(bail_id, mois)
  → If ENREGISTRE: confirm + send PDF link. If NON_ENREGISTRE: offer to create a declaration.
- ANCIENNE_QUITTANCE: Tenant asks for a receipt from a past month (e.g. January)
  → Call get_quittance_by_mois(bail_id, mois, annee)
- RÈGLE CRITIQUE — NEUTRALITÉ ABSOLUE:
  - JAMAIS accuser l'intermédiaire
  - JAMAIS dire 'votre gestionnaire n'a pas enregistré'
  - TOUJOURS dire 'aucun paiement n'est encore enregistré dans le système'
`

/**
 * ADD-08 Section 3.3 — Function Calling Definitions JSON
 */
const BDQ_TOOLS = [
    {
        name: "create_bdq",
        description: "Create a BDQ after owner confirmation. Call ONLY after explicit OUI.",
        input_schema: {
            type: "object",
            properties: {
                nom_locataire: { type: "string" },
                telephone_locataire: { type: "string", pattern: "^\\d{10}$" },
                description_logement: { type: "string" },
                loyer_declare_mensuel: { type: "integer", minimum: 3000 },
                date_entree_estimee: { type: "string", description: "YYYY-MM-01 format" },
                precision_date_entree: {
                    type: "string",
                    enum: ["EXACTE", "APPROXIMATIVE", "INCONNUE"]
                },
                identite_incomplete: { type: "boolean", default: false }
            },
            required: [
                "nom_locataire",
                "description_logement",
                "loyer_declare_mensuel",
                "date_entree_estimee"
            ]
        }
    },
    {
        name: "create_bdq_agent_visit",
        description: "Create BDQ for in-person agent confirmation (no phone). Call after owner confirms summary.",
        input_schema: {
            type: "object",
            properties: {
                nom_locataire: { type: "string" },
                description_logement: { type: "string" },
                loyer_declare_mensuel: { type: "integer" },
                date_entree_estimee: { type: "string", description: "YYYY-MM-01 format" }
            },
            required: ["nom_locataire", "description_logement", "loyer_declare_mensuel"]
        }
    },
    {
        name: "save_partial_state",
        description: "Save conversation progress when owner needs to pause (e.g., going to ask tenant for phone number).",
        input_schema: {
            type: "object",
            properties: {
                fields_collected: {
                    type: "object",
                    properties: {
                        nom_locataire: { type: "string" },
                        telephone_locataire: { type: "string" },
                        description_logement: { type: "string" },
                        loyer_declare_mensuel: { type: "integer" },
                        date_entree_estimee: { type: "string" }
                    }
                },
                pending_field: { type: "string" },
                pause_reason: { type: "string" }
            }
        }
    },
    {
        name: "escalate_to_human",
        description: "Escalate conversation to a human QAPRIL agent only if truly blocked.",
        input_schema: {
            type: "object",
            properties: {
                reason: { type: "string" }
            },
            required: ["reason"]
        }
    },
    {
        name: "create_declaration",
        description: "ADD-11: Create a tenant payment declaration (sms_declaration) and trigger confirmation sequence.",
        input_schema: {
            type: "object",
            properties: {
                bail_id: { type: "string" },
                montant: { type: "integer" },
                canal: { type: "string", enum: ["WHATSAPP", "SMS", "APP"], default: "WHATSAPP" }
            },
            required: ["montant"]
        }
    },
    {
        name: "get_statut_paiement_mois",
        description: "ADD-11: Returns ENREGISTRE | NON_ENREGISTRE | EN_ATTENTE_CONFIRMATION for a tenant's lease.",
        input_schema: {
            type: "object",
            properties: {
                bail_id: { type: "string" },
                mois: { type: "string", description: "YYYY-MM format" }
            }
        }
    },
    {
        name: "get_quittance_by_mois",
        description: "ADD-11: Retrieve receipt PDF URL for a given month and year.",
        input_schema: {
            type: "object",
            properties: {
                bail_id: { type: "string" },
                mois: { type: "integer", minimum: 1, maximum: 12 },
                annee: { type: "integer" }
            },
            required: ["mois", "annee"]
        }
    },
    {
        name: "get_historique_locataire",
        description: "ADD-11: List of receipts for the last N months.",
        input_schema: {
            type: "object",
            properties: {
                bail_id: { type: "string" },
                nb_mois: { type: "integer", default: 6 }
            }
        }
    },
    {
        name: "get_rent_status",
        description: "Check the payment status of recent months for the tenant.",
        input_schema: {
            type: "object",
            properties: {
                months: { type: "integer", default: 3 }
            }
        }
    },
    {
        name: "create_rent_claim",
        description: "Declare a payment initiated by the tenant.",
        input_schema: {
            type: "object",
            properties: {
                amount: { type: "integer" },
                month: { type: "string", description: "YYYY-MM format" }
            },
            required: ["amount", "month"]
        }
    }
]

export interface ChatTurnMessage {
    role: "user" | "assistant"
    content: any
    timestamp?: string
}

/**
 * ADD-08 Section 8 — Coût Claude Sonnet API: $3/M input + $15/M output (~605 FCFA/USD)
 */
function estimateCostFCFA(usage?: { input_tokens?: number; output_tokens?: number }): number {
    const inputTokens = usage?.input_tokens || 0
    const outputTokens = usage?.output_tokens || 0
    const usdCost = (inputTokens * 3.0 + outputTokens * 15.0) / 1_000_000
    const fcfaCost = usdCost * 605
    return Math.round(fcfaCost * 100) / 100
}

/**
 * Sérialisation / Désérialisation de messages_history (stocké en String[] dans PostgreSQL)
 */
function deserializeHistory(rawHistory: string[] | null | undefined): ChatTurnMessage[] {
    if (!rawHistory || !Array.isArray(rawHistory)) return []
    const parsed: ChatTurnMessage[] = []
    for (const item of rawHistory) {
        if (!item) continue
        if (typeof item === "object") {
            parsed.push(item as ChatTurnMessage)
            continue
        }
        try {
            const obj = JSON.parse(item)
            if (obj && (obj.role === "user" || obj.role === "assistant")) {
                parsed.push(obj)
            }
        } catch {
            parsed.push({ role: "user", content: String(item) })
        }
    }
    return parsed
}

function serializeHistory(history: ChatTurnMessage[]): string[] {
    return history.map((msg) =>
        typeof msg === "string" ? msg : JSON.stringify(msg)
    )
}

/**
 * Normalisation d'un numéro ivoirien à 10 chiffres (07/05/01/06)
 */
function extractIvorianPhone10Digits(text: string): { valid?: string; partialDigits?: string } {
    const cleaned = text.replace(/[\s.\-()]/g, "")
    const matchPlus225 = cleaned.match(/(?:\+?225)?(0[1567]\d{8})\b/)
    if (matchPlus225) {
        return { valid: matchPlus225[1] }
    }
    const allDigits = cleaned.match(/\d{4,13}/)
    if (allDigits) {
        const d = allDigits[0]
        if (d.startsWith("225") && d.length === 13 && /^0[1567]/.test(d.slice(3))) {
            return { valid: d.slice(3) }
        }
        if (d.length === 10 && /^0[1567]/.test(d)) {
            return { valid: d }
        }
        return { partialDigits: d }
    }
    return {}
}

/**
 * Extraction de montant en français populaire ivoirien (ADD-08 Section 2.2 & 3.2)
 */
function parseIvorianAmount(text: string): { amount?: number; isAmbiguous?: boolean } {
    const lower = text.toLowerCase().trim()

    // Ambiguous expressions: "30 et quelque", "environ 30", "dans les 30"
    if (
        /(\d+)\s*(et\s*quelque|et\s* poussi[eè]re|et\s*des)/i.test(lower) ||
        /quelque/i.test(lower)
    ) {
        return { isAmbiguous: true }
    }

    // "un demi-million" or "un demi"
    if (/\bun\s+demi(\s*-?\s*million)?\b/i.test(lower) || /\bdemi\s*million\b/i.test(lower)) {
        return { amount: 500000 }
    }

    // "X mille" (e.g., "35 mille", "38 mille", "150 mille")
    const milleMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*mille\b/i)
    if (milleMatch) {
        const val = parseFloat(milleMatch[1].replace(",", "."))
        return { amount: Math.round(val * 1000) }
    }

    // "Xk" (e.g., "35k")
    const kMatch = lower.match(/\b(\d+)\s*k\b/i)
    if (kMatch) {
        return { amount: parseInt(kMatch[1], 10) * 1000 }
    }

    // Direct numbers (e.g., "32 500", "35000", "500 000")
    // Ignore years like 2023/2024/2025/2026 if they are preceded by a month
    const withoutYears = lower.replace(/\b(janvier|f[eé]vrier|mars|avril|mai|juin|juillet|ao[uû]t|septembre|octobre|novembre|d[eé]cembre)\s+20\d{2}\b/gi, "")
    const numMatch = withoutYears.match(/\b(\d{1,3}(?:[\s.]\d{3})+|\d{4,7})\b/)
    if (numMatch) {
        const num = parseInt(numMatch[1].replace(/[\s.]/g, ""), 10)
        if (num >= 3000 && num <= 10000000) {
            return { amount: num }
        }
    }

    // Small number shorthand like "35" or "40" when answering rent question
    const shortNum = lower.match(/^(\d{2,3})\s*(f|fcfa|francs)?$/i)
    if (shortNum) {
        const n = parseInt(shortNum[1], 10)
        if (n >= 5 && n <= 900) {
            return { amount: n * 1000 }
        }
    }

    return {}
}

/**
 * Conversion de date approximative en YYYY-MM-01 (ADD-08 Section 3.2)
 */
function parseIvorianDate(text: string): { dateStr?: string; label?: string; precision?: "EXACTE" | "APPROXIMATIVE" | "INCONNUE" } {
    const lower = text.toLowerCase().trim()
    const now = new Date()
    const currentYear = now.getFullYear()

    const monthsMap: Record<string, { num: string; label: string }> = {
        janvier: { num: "01", label: "janvier" },
        fevrier: { num: "02", label: "février" },
        février: { num: "02", label: "février" },
        mars: { num: "03", label: "mars" },
        avril: { num: "04", label: "avril" },
        mai: { num: "05", label: "mai" },
        juin: { num: "06", label: "juin" },
        juillet: { num: "07", label: "juillet" },
        aout: { num: "08", label: "août" },
        août: { num: "08", label: "août" },
        septembre: { num: "09", label: "septembre" },
        octobre: { num: "10", label: "octobre" },
        novembre: { num: "11", label: "novembre" },
        decembre: { num: "12", label: "décembre" },
        décembre: { num: "12", label: "décembre" },
    }

    // Explicit month + year (e.g., "décembre 2023")
    for (const [key, m] of Object.entries(monthsMap)) {
        const regex = new RegExp(`\\b${key}\\s*(20\\d{2})?\\b`, "i")
        const match = lower.match(regex)
        if (match) {
            const yr = match[1] ? parseInt(match[1], 10) : (parseInt(m.num, 10) > now.getMonth() + 1 ? currentYear - 1 : currentYear)
            return {
                dateStr: `${yr}-${m.num}-01`,
                label: `${m.label} ${yr}`,
                precision: match[1] ? "EXACTE" : "APPROXIMATIVE"
            }
        }
    }

    // "depuis les fêtes" / "pendant les fêtes"
    if (/f[eê]tes|no[eë]l|fin\s+d'ann[eé]e/i.test(lower)) {
        const yrMatch = lower.match(/\b(20\d{2})\b/)
        const yr = yrMatch ? parseInt(yrMatch[1], 10) : currentYear - 1
        return {
            dateStr: `${yr}-12-01`,
            label: `décembre ${yr}`,
            precision: "APPROXIMATIVE"
        }
    }

    // "ramadan" / "carême" / "tabaski"
    if (/ramadan|car[eê]me/i.test(lower)) {
        const yrMatch = lower.match(/\b(20\d{2})\b/)
        const yr = yrMatch ? parseInt(yrMatch[1], 10) : currentYear
        return {
            dateStr: `${yr}-03-01`,
            label: `mars ${yr} (période du Ramadan)`,
            precision: "APPROXIMATIVE"
        }
    }

    // "ça fait X ans" / "depuis X ans"
    const yearsAgoMatch = lower.match(/(?:[cç]a\s+fait|depuis|il\s+y\s+a)\s+(\d+|deux|trois|quatre|cinq|un)\s+ans?/i)
    if (yearsAgoMatch) {
        const wordToNum: Record<string, number> = { un: 1, deux: 2, trois: 3, quatre: 4, cinq: 5 }
        const n = wordToNum[yearsAgoMatch[1].toLowerCase()] || parseInt(yearsAgoMatch[1], 10) || 2
        const yr = currentYear - n
        return {
            dateStr: `${yr}-01-01`,
            label: `janvier ${yr}`,
            precision: "APPROXIMATIVE"
        }
    }

    // YYYY-MM-DD or DD/MM/YYYY
    const isoMatch = lower.match(/\b(20\d{2})-(\d{2})(?:-\d{2})?\b/)
    if (isoMatch) {
        return {
            dateStr: `${isoMatch[1]}-${isoMatch[2]}-01`,
            label: `${isoMatch[2]}/${isoMatch[1]}`,
            precision: "EXACTE"
        }
    }
    const frDateMatch = lower.match(/\b(\d{1,2})\/(\d{1,2})\/(20\d{2})\b/)
    if (frDateMatch) {
        const mm = frDateMatch[2].padStart(2, "0")
        return {
            dateStr: `${frDateMatch[3]}-${mm}-01`,
            label: `${mm}/${frDateMatch[3]}`,
            precision: "EXACTE"
        }
    }

    // Unknown date ("je sais plus", "je me rappelle plus", "longtemps")
    if (/sais\s+pas|sais\s+plus|rappelle\s+plus|longtemps|aucune\s+id[eé]e/i.test(lower)) {
        const yr = currentYear - 2
        return {
            dateStr: `${yr}-01-01`,
            label: `janvier ${yr} (estimé à 2 ans)`,
            precision: "INCONNUE"
        }
    }

    return {}
}

/**
 * Notification de l'agent terrain pour create_bdq_agent_visit (ADD-08 Section 5)
 */
async function notifyAgentTerrain(bailleurId: string, bdqId: string, nomLocataire: string, descriptionLogement: string) {
    try {
        const admins = await prisma.user.findMany({
            where: { role: { in: ["ADMIN", "SUPER_ADMIN", "FIELD_AGENT"] as any } },
            select: { id: true }
        })
        if (admins.length > 0) {
            await prisma.notification.createMany({
                data: admins.map((a) => ({
                    userId: a.id,
                    title: "Visite Agent Terrain Requise — BDQ sans numéro",
                    content: `Le bailleur (${bailleurId.slice(0, 8)}) a demandé le passage d'un agent QAPRIL pour confirmer le BDQ de ${nomLocataire} (${descriptionLogement}).`,
                    type: "SYSTEM",
                    link: `/admin/validation`
                }))
            })
        }
    } catch (e) {
        console.error("[AGENT-BDQ] Erreur notification agent terrain:", e)
    }
}

/**
 * Exécution des fonctions Claude (ADD-08 Section 5 — executeTool)
 */
async function executeBdqTool(
    name: string,
    input: any,
    conv: any,
    userId: string
): Promise<{
    toolResult: any
    shouldContinue: boolean
    directReply?: string
    finalStatus?: BdqConvStatut
    bdqId?: string
}> {
    const canalSource =
        conv.canal === NotifCanal.WHATSAPP ? "AGENT_IA_WHATSAPP" : "AGENT_IA_APP"

    if (name === "create_bdq") {
        const loyer = Number(input.loyer_declare_mensuel ?? input.loyer_mensuel ?? conv.loyerExtrait ?? 0)
        const dateStr = input.date_entree_estimee || (conv.dateEntreeExtraite ? new Date(conv.dateEntreeExtraite).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10))
        const tel = input.telephone_locataire || conv.telephoneExtrait || ""
        const nom = input.nom_locataire || conv.nomLocataireExtrait || "Locataire"
        const desc = input.description_logement || conv.descriptionLogementExtrait || "Logement"
        const precision = input.precision_date_entree || conv.precisionDate || "APPROXIMATIVE"

        const res = await createBDQ({
            bailleurId: userId,
            nomLocataire: nom,
            telephoneLocataire: tel,
            descriptionLogement: desc,
            loyerMensuel: loyer,
            dateEntree: new Date(dateStr),
            precisionDateEntree: precision,
            identiteIncomplete: Boolean(input.identite_incomplete),
            sourceCreation: canalSource
        })

        if (res.success && res.bdqId) {
            await prisma.bdqConversationState.update({
                where: { id: conv.id },
                data: {
                    statut: BdqConvStatut.COMPLETE,
                    nomLocataireExtrait: nom,
                    telephoneExtrait: tel,
                    descriptionLogementExtrait: desc,
                    loyerExtrait: loyer,
                    dateEntreeExtraite: new Date(dateStr),
                    precisionDate: precision,
                    bdqCreeId: res.bdqId,
                    completedAt: new Date(),
                    champEnAttente: null
                }
            })
            revalidatePath("/dashboard/bdq")
            revalidatePath("/dashboard/leases")
            return {
                toolResult: {
                    success: true,
                    bdq_id: res.bdqId,
                    qr_token: res.qrToken,
                    statut: "PENDING_LOCATAIRE"
                },
                shouldContinue: true,
                finalStatus: BdqConvStatut.COMPLETE,
                bdqId: res.bdqId
            }
        } else {
            return {
                toolResult: { success: false, error: res.error || "Erreur lors de la création du BDQ" },
                shouldContinue: true
            }
        }
    }

    if (name === "create_bdq_agent_visit") {
        const loyer = Number(input.loyer_declare_mensuel ?? input.loyer_mensuel ?? conv.loyerExtrait ?? 0)
        const dateStr = input.date_entree_estimee || (conv.dateEntreeExtraite ? new Date(conv.dateEntreeExtraite).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10))
        const nom = input.nom_locataire || conv.nomLocataireExtrait || "Locataire"
        const desc = input.description_logement || conv.descriptionLogementExtrait || "Logement"

        const res = await createBDQ({
            bailleurId: userId,
            nomLocataire: nom,
            telephoneLocataire: "NON_FOURNI",
            descriptionLogement: desc,
            loyerMensuel: loyer,
            dateEntree: new Date(dateStr),
            precisionDateEntree: "APPROXIMATIVE",
            agent_visite_requise: true,
            sourceCreation: `${canalSource}_VISITE`
        })

        if (res.success && res.bdqId) {
            await notifyAgentTerrain(userId, res.bdqId, nom, desc)
            await prisma.bdqConversationState.update({
                where: { id: conv.id },
                data: {
                    statut: BdqConvStatut.COMPLETE,
                    nomLocataireExtrait: nom,
                    telephoneManquant: true,
                    descriptionLogementExtrait: desc,
                    loyerExtrait: loyer,
                    dateEntreeExtraite: new Date(dateStr),
                    bdqCreeId: res.bdqId,
                    completedAt: new Date(),
                    champEnAttente: null
                }
            })
            revalidatePath("/dashboard/bdq")
            revalidatePath("/dashboard/leases")
            return {
                toolResult: {
                    success: true,
                    bdq_id: res.bdqId,
                    agent_dispatched: true
                },
                shouldContinue: true,
                finalStatus: BdqConvStatut.COMPLETE,
                bdqId: res.bdqId
            }
        }
    }

    if (name === "save_partial_state") {
        const fc = input.fields_collected || {}
        const expireAt = new Date(Date.now() + 48 * 60 * 60 * 1000) // 48h
        await prisma.bdqConversationState.update({
            where: { id: conv.id },
            data: {
                statut: BdqConvStatut.EN_PAUSE,
                nomLocataireExtrait: fc.nom_locataire ?? conv.nomLocataireExtrait,
                telephoneExtrait: fc.telephone_locataire ?? conv.telephoneExtrait,
                descriptionLogementExtrait: fc.description_logement ?? conv.descriptionLogementExtrait,
                loyerExtrait: fc.loyer_declare_mensuel ?? fc.loyer_mensuel ?? conv.loyerExtrait,
                dateEntreeExtraite: fc.date_entree_estimee ? new Date(fc.date_entree_estimee) : conv.dateEntreeExtraite,
                champEnAttente: input.pending_field || "telephone_locataire",
                pauseReason: input.pause_reason || "Attente information propriétaire (48h)",
                expireAt
            }
        })
        revalidatePath("/dashboard/bdq")
        return {
            toolResult: { success: true, status: "EN_PAUSE", expire_at: expireAt.toISOString() },
            shouldContinue: false,
            directReply:
                "D'accord. Prenez le temps qu'il faut — je garde tout ce que vous avez dit pendant 48h. Revenez quand vous avez le numéro.",
            finalStatus: BdqConvStatut.EN_PAUSE
        }
    }

    if (name === "escalate_to_human") {
        const expireAt = new Date(Date.now() + 48 * 60 * 60 * 1000)
        await prisma.bdqConversationState.update({
            where: { id: conv.id },
            data: {
                statut: BdqConvStatut.EN_PAUSE,
                pauseReason: `ESCALADE_HUMAIN: ${input.reason || "Besoin d'assistance"}`,
                expireAt
            }
        })
        return {
            toolResult: { success: true, escalated: true },
            shouldContinue: false,
            directReply:
                "Un conseiller QAPRIL va prendre le relais pour vous accompagner personnellement. Vos informations sont bien sauvegardées.",
            finalStatus: BdqConvStatut.EN_PAUSE
        }
    }

    if (name === "create_declaration" || name === "create_rent_claim") {
        const lease = await prisma.lease.findFirst({
            where: {
                id: input.bail_id || undefined,
                tenantId: userId,
                status: { in: ["ACTIVE", "ACTIVE_DECLARATIF", "LOYER_IMPAYE"] as any }
            },
            include: {
                property: {
                    include: {
                        owner: true,
                        accessRoles: {
                            where: { role: { in: ["MANAGER", "INTERMEDIAIRE"] as any }, statut: "ACTIF" },
                            include: { user: true }
                        }
                    }
                }
            }
        })
        if (lease) {
            const amount = Number(input.montant || input.amount || lease.rentAmount || 0)
            const dec = await prisma.smsDeclaration.create({
                data: {
                    leaseId: lease.id,
                    tenantId: userId,
                    montantDeclare: amount,
                    canal: "WHATSAPP" as any,
                    statut: "EN_ATTENTE",
                    smsBrut: `Déclaration WhatsApp IA (${amount} FCFA)`,
                    expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
                }
            })
            const managers = lease.property?.accessRoles || []
            const recipients = managers.length > 0 ? managers.map((m) => m.user) : lease.property?.owner ? [lease.property.owner] : []
            const { sendSMS } = await import("@/lib/sms")
            for (const r of recipients) {
                if (r?.phone) {
                    await sendSMS(
                        r.phone,
                        `QAPRIL : Votre locataire déclare avoir payé ${amount.toLocaleString("fr-FR")} FCFA. Confirmez-vous ? Répondez OUI ou NON.`
                    ).catch(() => null)
                }
            }
            return {
                toolResult: {
                    success: true,
                    declaration_id: dec.id,
                    statut: "EN_ATTENTE_CONFIRMATION",
                    montant: amount
                },
                shouldContinue: true
            }
        }
        return {
            toolResult: { success: false, error: "Aucun bail actif trouvé." },
            shouldContinue: true
        }
    }

    if (name === "get_statut_paiement_mois") {
        const period = input.mois || new Date().toISOString().slice(0, 7)
        const lease = await prisma.lease.findFirst({
            where: { tenantId: userId, status: { in: ["ACTIVE", "ACTIVE_DECLARATIF", "LOYER_IMPAYE"] as any } },
            include: {
                receipts: { where: { periodMonth: period } },
                smsDeclarations: { where: { statut: "EN_ATTENTE" }, orderBy: { createdAt: "desc" }, take: 1 }
            }
        })
        if (!lease) {
            return { toolResult: { statut: "AUCUN_BAIL" }, shouldContinue: true }
        }
        const paidReceipt = lease.receipts.find((r) => ["paid", "PAID"].includes(r.status))
        const statut = paidReceipt
            ? "ENREGISTRE"
            : lease.smsDeclarations.length > 0
            ? "EN_ATTENTE_CONFIRMATION"
            : "NON_ENREGISTRE"
        return {
            toolResult: {
                statut,
                periode: period,
                loyer_mensuel: lease.rentAmount,
                quittance_ref: paidReceipt?.receiptRef || null
            },
            shouldContinue: true
        }
    }

    if (name === "get_quittance_by_mois") {
        const period = `${input.annee}-${String(input.mois).padStart(2, "0")}`
        const receipt = await prisma.receipt.findFirst({
            where: { periodMonth: period, lease: { tenantId: userId } }
        })
        return {
            toolResult: receipt
                ? {
                      found: true,
                      reference: receipt.receiptRef,
                      montant: receipt.totalAmount,
                      pdf_url: receipt.pdfUrl || `/api/v1/locataire/quittances/${input.mois}/${input.annee}`
                  }
                : { found: false, periode: period },
            shouldContinue: true
        }
    }

    if (name === "get_historique_locataire" || name === "get_rent_status") {
        const takeCount = input.nb_mois || input.months || 6
        const leases = await prisma.lease.findMany({
            where: { tenantId: userId, status: { in: ["ACTIVE", "ACTIVE_DECLARATIF"] as any } },
            include: { receipts: { orderBy: { periodMonth: "desc" }, take: takeCount } }
        })
        return {
            toolResult: {
                success: true,
                status: leases.map((l) => ({
                    ref: l.leaseReference,
                    receipts: l.receipts.map((r) => ({
                        month: r.periodMonth,
                        amount: r.totalAmount,
                        ref: r.receiptRef,
                        status: r.status
                    }))
                }))
            },
            shouldContinue: true
        }
    }

    return { toolResult: { success: false, error: "Outil inconnu" }, shouldContinue: false }
}

/**
 * Moteur conversationnel déterministe local (Fallback haute fidélité ADD-08)
 * Garantit le fonctionnement des 4 scénarios terrain et des 12 UAT même sans clé API externe.
 */
async function runLocalBdqAgentFallback(
    conv: any,
    userMessage: string,
    history: ChatTurnMessage[],
    userId: string
): Promise<{
    replyText: string
    status: BdqConvStatut
    bdqId?: string
    extracted: {
        nom?: string | null
        tel?: string | null
        telManquant?: boolean
        desc?: string | null
        loyer?: number | null
        dateEntree?: Date | null
        precisionDate?: string
        champEnAttente?: string | null
        pauseReason?: string | null
    }
}> {
    const msg = userMessage.trim()
    const lower = msg.toLowerCase()

    let nom = conv.nomLocataireExtrait as string | null
    let tel = conv.telephoneExtrait as string | null
    let telManquant = Boolean(conv.telephoneManquant)
    let desc = conv.descriptionLogementExtrait as string | null
    let loyer = conv.loyerExtrait != null ? Number(conv.loyerExtrait) : null
    let dateEntree = conv.dateEntreeExtraite ? new Date(conv.dateEntreeExtraite) : null
    let precisionDate = (conv.precisionDate as string) || "APPROXIMATIVE"
    let champEnAttente = conv.champEnAttente as string | null

    // ADD-11 Section 4.2 : Détection automatique des requêtes locataires (Réclamation / Vérification / Ancienne quittance)
    if (
        /j'ai\s+pay[eé].*quittance|pas\s+re[cç]u\s+de\s+quittance|r[eé]clamer\s+ma\s+quittance/i.test(lower) ||
        /est-ce\s+que\s+mon\s+loyer.*enregistr[eé]|loyer\s+du\s+mois.*enregistr[eé]/i.test(lower) ||
        /besoin\s+de\s+ma\s+quittance\s+de|m'envoyer\s+ma\s+quittance\s+de/i.test(lower)
    ) {
        const tenantLease = await prisma.lease.findFirst({
            where: { tenantId: userId, status: { in: ["ACTIVE", "ACTIVE_DECLARATIF", "LOYER_IMPAYE"] as any } },
            include: {
                property: true,
                receipts: { orderBy: { periodMonth: "desc" }, take: 12 }
            }
        })

        // Cas 3 : Demande d'ancienne quittance (R11-UAT-08)
        if (/besoin\s+de\s+ma\s+quittance\s+de|m'envoyer\s+ma\s+quittance\s+de/i.test(lower)) {
            const parsedDt = parseIvorianDate(msg)
            const targetPeriod = parsedDt.dateStr ? parsedDt.dateStr.slice(0, 7) : new Date().toISOString().slice(0, 7)
            const foundReceipt = tenantLease?.receipts?.find((r) => r.periodMonth === targetPeriod)
            if (foundReceipt) {
                return {
                    replyText: `Bonjour ! Votre quittance de ${parsedDt.label || targetPeriod} — ${Number(foundReceipt.totalAmount).toLocaleString("fr-FR")} FCFA — est bien enregistrée. Je vous envoie le PDF maintenant. Réf : ${foundReceipt.receiptRef}. Si votre banque a besoin d'autres mois, dites-moi lesquels. 📄`,
                    status: BdqConvStatut.EN_COURS,
                    extracted: { nom, tel, telManquant, desc, loyer, dateEntree, precisionDate, champEnAttente }
                }
            } else {
                return {
                    replyText: `Bonjour ! Aucun paiement n'est encore enregistré dans notre système pour ${parsedDt.label || targetPeriod}. Si vous avez déjà réglé ce mois, dites-moi le montant et j'enverrai une demande de confirmation pour générer votre quittance.`,
                    status: BdqConvStatut.EN_COURS,
                    extracted: { nom, tel, telManquant, desc, loyer, dateEntree, precisionDate, champEnAttente }
                }
            }
        }

        // Cas 1 : Réclamation directe ("J'ai payé mon loyer mais je n'ai pas reçu de quittance" — R11-UAT-07)
        if (/j'ai\s+pay[eé]|pas\s+re[cç]u\s+de\s+quittance/i.test(lower)) {
            const parsedAmt = parseIvorianAmount(msg)
            const declaredAmt = parsedAmt.amount || tenantLease?.rentAmount || 35000
            if (tenantLease) {
                await executeBdqTool("create_declaration", { bail_id: tenantLease.id, montant: declaredAmt, canal: "WHATSAPP" }, conv, userId)
            }
            const unitLabel = tenantLease?.property?.unitLabel || tenantLease?.property?.address || "votre logement"
            return {
                replyText: `Bonjour ! Je vois votre bail actif — ${unitLabel}, ${declaredAmt.toLocaleString("fr-FR")} FCFA/mois. Effectivement aucun paiement n'est encore enregistré dans le système pour ce mois. Je vais envoyer une demande de confirmation à votre gestionnaire. Vous recevrez votre quittance dès validation — généralement dans les 2 heures. Je vous tiens informé. ✅`,
                status: BdqConvStatut.EN_COURS,
                extracted: { nom, tel, telManquant, desc, loyer, dateEntree, precisionDate, champEnAttente }
            }
        }

        // Cas 2 : Vérification de paiement ("Est-ce que mon loyer du mois a été enregistré ?")
        const currentPeriod = new Date().toISOString().slice(0, 7)
        const currentReceipt = tenantLease?.receipts?.find((r) => r.periodMonth === currentPeriod && ["paid", "PAID"].includes(r.status))
        if (currentReceipt) {
            return {
                replyText: `Bonjour ! Oui, votre loyer de ${currentPeriod} (${Number(currentReceipt.totalAmount).toLocaleString("fr-FR")} FCFA) est bien enregistré. Votre quittance Réf ${currentReceipt.receiptRef} est disponible. ✅`,
                status: BdqConvStatut.EN_COURS,
                extracted: { nom, tel, telManquant, desc, loyer, dateEntree, precisionDate, champEnAttente }
            }
        } else {
            return {
                replyText: `Bonjour ! Je vérifie votre situation. Pour ce mois (${currentPeriod}) — aucun paiement n'est encore enregistré dans notre système. Vous avez déjà payé ce mois-ci ?`,
                status: BdqConvStatut.EN_COURS,
                extracted: { nom, tel, telManquant, desc, loyer, dateEntree, precisionDate, champEnAttente }
            }
        }
    }

    // Détection de sujet hors-scope (AGT-UAT-10)
    if (/abonnement|comment\s+payer\s+qapril|tarif\s+qapril|facture\s+cie/i.test(lower) && (!nom || !loyer || !dateEntree)) {
        const redirectTarget = nom ? `le bail de ${nom}` : "votre Bail Déclaratif QAPRIL"
        const nextQ = !nom
            ? "Quel est le nom complet de votre locataire ?"
            : !tel && !telManquant
            ? `Quel est le numéro de téléphone de ${nom} ?`
            : !desc
            ? "Il occupe quelle chambre ou quel logement chez vous ?"
            : !loyer
            ? "Il vous paie combien par mois ?"
            : "Il est chez vous depuis quand à peu près ?"
        return {
            replyText: `Le Bail Déclaratif QAPRIL est 100% gratuit. Pour le reste je peux vous aider juste après — d'abord finissons ${redirectTarget}. ${nextQ}`,
            status: BdqConvStatut.EN_COURS,
            extracted: { nom, tel, telManquant, desc, loyer, dateEntree, precisionDate, champEnAttente }
        }
    }

    // Si on est à l'étape de confirmation du récapitulatif (champEnAttente === "CONFIRMATION")
    if (champEnAttente === "CONFIRMATION" && nom && (tel || telManquant) && desc && loyer && dateEntree) {
        // Vérifier si le propriétaire corrige une info (Scénario 2.4 / AGT-UAT-07)
        const parsedNewAmount = parseIvorianAmount(msg)
        const parsedNewPhone = extractIvorianPhone10Digits(msg)
        const parsedNewDate = parseIvorianDate(msg)

        const isCorrection =
            /attends|non|plut[oô]t|corrige|c'est\s+pas|modifi|erreur|chang/i.test(lower) ||
            (parsedNewAmount.amount && parsedNewAmount.amount !== loyer)

        if (isCorrection) {
            if (parsedNewAmount.amount) {
                loyer = parsedNewAmount.amount
            }
            if (parsedNewPhone.valid) {
                tel = parsedNewPhone.valid
                telManquant = false
            }
            if (parsedNewDate.dateStr && !/depuis\s+janvier/i.test(lower)) {
                dateEntree = new Date(parsedNewDate.dateStr)
                precisionDate = parsedNewDate.precision || precisionDate
            }

            const dateFormatted = dateEntree.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
            const telDisplay = telManquant ? "Confirmation par visite agent QAPRIL" : tel
            return {
                replyText: `Bien vu, je corrige.\n\nRécapitulatif mis à jour :\n• Locataire : ${nom} · ${telDisplay}\n• Logement : ${desc}\n• Loyer : ${loyer.toLocaleString("fr-FR")} FCFA/mois\n• Entrée : ${dateFormatted}\n\nC'est bon maintenant ? Répondez OUI pour confirmer.`,
                status: BdqConvStatut.EN_COURS,
                extracted: { nom, tel, telManquant, desc, loyer, dateEntree, precisionDate, champEnAttente: "CONFIRMATION" }
            }
        }

        // Vérifier si le propriétaire confirme (OUI, oui c'est bon, oui go, ok, parfait, je confirme)
        if (/\b(oui|ok|c'est\s+bon|go|parfait|confirme|exact|d'accord|valide)\b/i.test(lower)) {
            const dateIso = dateEntree.toISOString().slice(0, 10)
            if (telManquant) {
                const exec = await executeBdqTool(
                    "create_bdq_agent_visit",
                    {
                        nom_locataire: nom,
                        description_logement: desc,
                        loyer_declare_mensuel: loyer,
                        date_entree_estimee: dateIso
                    },
                    conv,
                    userId
                )
                return {
                    replyText: `Parfait ! Votre Bail Déclaratif QAPRIL pour ${nom} est enregistré. Un agent QAPRIL se déplacera dans votre cour pour recueillir la confirmation sur place gratuitement. 👍`,
                    status: BdqConvStatut.COMPLETE,
                    bdqId: exec.bdqId,
                    extracted: { nom, tel: null, telManquant: true, desc, loyer, dateEntree, precisionDate, champEnAttente: null }
                }
            } else {
                const exec = await executeBdqTool(
                    "create_bdq",
                    {
                        nom_locataire: nom,
                        telephone_locataire: tel,
                        description_logement: desc,
                        loyer_declare_mensuel: loyer,
                        date_entree_estimee: dateIso,
                        precision_date_entree: precisionDate
                    },
                    conv,
                    userId
                )
                return {
                    replyText: `Parfait ! J'envoie maintenant un SMS à ${nom} au ${tel} pour qu'il confirme. Vous recevrez votre Bail Déclaratif QAPRIL dès sa réponse. C'est gratuit et ça protège vos deux intérêts. 👍`,
                    status: BdqConvStatut.COMPLETE,
                    bdqId: exec.bdqId,
                    extracted: { nom, tel, telManquant: false, desc, loyer, dateEntree, precisionDate, champEnAttente: null }
                }
            }
        }
    }

    // 1. Collecte du NOM DU LOCATAIRE
    if (!nom) {
        // Si message d'ouverture générique ("bonjour", "je souhaite enregistrer...")
        if (/^(bonjour|salut|bonsoir|hello|je\s+souhaite|je\s+veux\s+cr[eé]er|start)\b/i.test(lower) && msg.split(/\s+/).length <= 12) {
            return {
                replyText: "Bonjour ! Je suis l'assistant QAPRIL. Je vais enregistrer votre locataire en 2 minutes et vous donner un Bail QAPRIL officiel. Quel est le nom de votre locataire ?",
                status: BdqConvStatut.EN_COURS,
                extracted: { nom, tel, telManquant, desc, loyer, dateEntree, precisionDate, champEnAttente: "nom_locataire" }
            }
        }

        // Détection d'ambiguïté père/fils (Scénario 2.1 / AGT-UAT-02 : "C'est Ibrahim — le fils de Bamba le mécanicien")
        const pereFilsMatch = msg.match(/([A-ZÀ-Ÿa-zà-ÿ]+)\s*(?:—|-|,)?\s*le\s+(?:fils|fr[eè]re|neveu|petit)\s+de\s+([A-ZÀ-Ÿa-zà-ÿ]+)/i)
        if (pereFilsMatch && champEnAttente !== "nom_locataire_clarification") {
            const prenom = pereFilsMatch[1].trim()
            const parentNom = pereFilsMatch[2].trim()
            return {
                replyText: `Je comprends. Son nom complet de famille et prénom c'est bien ${parentNom} ${prenom}, ou il porte un autre nom de famille ? Je veux être sûr d'écrire le bon nom sur son bail.`,
                status: BdqConvStatut.EN_COURS,
                extracted: { nom: null, tel, telManquant, desc, loyer, dateEntree, precisionDate, champEnAttente: "nom_locataire_clarification" }
            }
        }

        // Nettoyage du nom (ex: "Non Bamba c'est le père. Lui c'est Koné Ibrahim" ou "C'est Kouassi Jean")
        let cleanedName = msg
        const luiCestMatch = msg.match(/(?:lui\s+c'est|il\s+s'appelle|son\s+nom\s+c'est|c'est)\s+([A-ZÀ-Ÿa-zà-ÿ'-]+(?:\s+[A-ZÀ-Ÿa-zà-ÿ'-]+){0,3})\s*$/i)
        if (luiCestMatch) {
            cleanedName = luiCestMatch[1].trim()
        } else {
            cleanedName = msg.replace(/^(c'est|il\s+s'appelle|elle\s+s'appelle|nom\s*:)\s*/i, "").trim()
        }

        // Si un seul prénom donné sans nom de famille et pas encore demandé
        const nameWords = cleanedName.split(/\s+/).filter(Boolean)
        if (nameWords.length === 1 && champEnAttente !== "nom_locataire_clarification") {
            return {
                replyText: `J'ai noté ${cleanedName}. Quel est son nom de famille complet pour le bail ?`,
                status: BdqConvStatut.EN_COURS,
                extracted: { nom: null, tel, telManquant, desc, loyer, dateEntree, precisionDate, champEnAttente: "nom_locataire_clarification" }
            }
        }

        nom = cleanedName
        return {
            replyText: `${nom} — noté. Quel est son numéro de téléphone Orange, MTN, Moov ou Wave (10 chiffres) ?`,
            status: BdqConvStatut.EN_COURS,
            extracted: { nom, tel, telManquant, desc, loyer, dateEntree, precisionDate, champEnAttente: "telephone_locataire" }
        }
    }

    // 2. Collecte du NUMÉRO DE TÉLÉPHONE (Scénario 2.3 / AGT-UAT-05, 06, 08, 09)
    if (!tel && !telManquant) {
        // Si on attendait le choix entre l'option 1 (attendre 48h) et l'option 2 (visite agent)
        if (champEnAttente === "choix_sans_telephone") {
            if (/1|demand|attend|reviens|cherch|apr[eè]s/i.test(lower)) {
                await executeBdqTool(
                    "save_partial_state",
                    {
                        fields_collected: { nom_locataire: nom },
                        pending_field: "telephone_locataire",
                        pause_reason: "Propriétaire demande le numéro au locataire"
                    },
                    conv,
                    userId
                )
                return {
                    replyText: "D'accord. Prenez le temps qu'il faut — je garde tout ce que vous avez dit pendant 48h. Revenez quand vous avez le numéro.",
                    status: BdqConvStatut.EN_PAUSE,
                    extracted: { nom, tel: null, telManquant: false, desc, loyer, dateEntree, precisionDate, champEnAttente: "telephone_locataire", pauseReason: "Attente numéro locataire" }
                }
            }
            if (/2|agent|d[eé]plac|quelqu'un|cour|visite/i.test(lower)) {
                telManquant = true
                return {
                    replyText: "Très bien, un agent QAPRIL passera confirmer sur place. En attendant, il occupe quelle chambre ou quel logement chez vous ?",
                    status: BdqConvStatut.EN_COURS,
                    extracted: { nom, tel: null, telManquant: true, desc, loyer, dateEntree, precisionDate, champEnAttente: "description_logement" }
                }
            }
        }

        // Le propriétaire dit qu'il ne connaît pas le numéro
        if (/connais\s+pas|sais\s+pas|pas\s+son\s+num[eé]ro|ai\s+pas|aucun\s+num[eé]ro/i.test(lower)) {
            return {
                replyText:
                    "Pas de problème, vous avez deux options :\n1️⃣ Vous lui demandez son numéro et vous me répondez — je garde cette conversation ouverte 48h.\n2️⃣ Un agent QAPRIL se déplace à votre cour pour faire la confirmation en présence des deux. Gratuit.\nLaquelle vous préférez ?",
                status: BdqConvStatut.EN_COURS,
                extracted: { nom, tel: null, telManquant: false, desc, loyer, dateEntree, precisionDate, champEnAttente: "choix_sans_telephone" }
            }
        }

        const phoneCheck = extractIvorianPhone10Digits(msg)
        if (phoneCheck.valid) {
            tel = phoneCheck.valid
            const formattedTel = tel.replace(/(\d{2})(?=\d)/g, "$1 ").trim()
            return {
                replyText: `Numéro ${formattedTel} enregistré. Il occupe quelle chambre ou quel logement chez vous ?`,
                status: BdqConvStatut.EN_COURS,
                extracted: { nom, tel, telManquant: false, desc, loyer, dateEntree, precisionDate, champEnAttente: "description_logement" }
            }
        } else {
            // Numéro invalide (AGT-UAT-09)
            if (champEnAttente === "telephone_retry") {
                return {
                    replyText:
                        "Le numéro ne compte toujours pas 10 chiffres (ex: 07 45 32 10 09). Vous préférez :\n1️⃣ Vérifier son numéro et revenir (conversation gardée 48h)\n2️⃣ Qu'un agent QAPRIL passe à votre cour gratuitement ?",
                    status: BdqConvStatut.EN_COURS,
                    extracted: { nom, tel: null, telManquant: false, desc, loyer, dateEntree, precisionDate, champEnAttente: "choix_sans_telephone" }
                }
            }
            return {
                replyText:
                    "Ce numéro semble incomplet. En Côte d'Ivoire il faut 10 chiffres commençant par 07, 05, 01 ou 06 (exemple : 07 45 32 10 09). Pouvez-vous le répéter ?",
                status: BdqConvStatut.EN_COURS,
                extracted: { nom, tel: null, telManquant: false, desc, loyer, dateEntree, precisionDate, champEnAttente: "telephone_retry" }
            }
        }
    }

    // 3. Collecte de la DESCRIPTION DU LOGEMENT
    if (!desc) {
        desc = msg.trim()
        return {
            replyText: `${desc} — je note. Il vous paie combien par mois ?`,
            status: BdqConvStatut.EN_COURS,
            extracted: { nom, tel, telManquant, desc, loyer, dateEntree, precisionDate, champEnAttente: "loyer_declare_mensuel" }
        }
    }

    // 4. Collecte du LOYER MENSUEL (Scénario 2.2 / AGT-UAT-03)
    if (!loyer) {
        const parsedRent = parseIvorianAmount(msg)
        if (parsedRent.isAmbiguous) {
            return {
                replyText: "Je veux noter le montant exact pour votre protection. C'est 30 000 FCFA, 32 000, 35 000 ? Quel chiffre exact ?",
                status: BdqConvStatut.EN_COURS,
                extracted: { nom, tel, telManquant, desc, loyer: null, dateEntree, precisionDate, champEnAttente: "loyer_declare_mensuel" }
            }
        }
        if (parsedRent.amount) {
            loyer = parsedRent.amount
            return {
                replyText: `${loyer.toLocaleString("fr-FR")} FCFA par mois. Il est chez vous depuis quand à peu près ?`,
                status: BdqConvStatut.EN_COURS,
                extracted: { nom, tel, telManquant, desc, loyer, dateEntree, precisionDate, champEnAttente: "date_entree_estimee" }
            }
        }
        return {
            replyText: "Quel est le montant exact du loyer mensuel en FCFA (par exemple : 35 000) ?",
            status: BdqConvStatut.EN_COURS,
            extracted: { nom, tel, telManquant, desc, loyer: null, dateEntree, precisionDate, champEnAttente: "loyer_declare_mensuel" }
        }
    }

    // 5. Collecte de la DATE D'ENTRÉE ESTIMÉE (AGT-UAT-04)
    if (!dateEntree) {
        const parsedDate = parseIvorianDate(msg)
        if (parsedDate.dateStr) {
            dateEntree = new Date(parsedDate.dateStr)
            precisionDate = parsedDate.precision || "APPROXIMATIVE"
            const telFormatted = telManquant
                ? "Confirmation sur place par agent QAPRIL"
                : (tel || "").replace(/(\d{2})(?=\d)/g, "$1 ").trim()

            return {
                replyText: `Très bien. Voici le résumé de votre bail QAPRIL :\n• Locataire : ${nom} · ${telFormatted}\n• Logement : ${desc}\n• Loyer : ${loyer.toLocaleString("fr-FR")} FCFA/mois\n• Entrée : ${parsedDate.label}\n\nC'est correct ? Répondez OUI pour confirmer.`,
                status: BdqConvStatut.EN_COURS,
                extracted: {
                    nom,
                    tel,
                    telManquant,
                    desc,
                    loyer,
                    dateEntree,
                    precisionDate,
                    champEnAttente: "CONFIRMATION"
                }
            }
        }
        return {
            replyText: "Depuis quel mois ou quelle année environ est-il dans le logement (ex: décembre 2023, ça fait 2 ans, depuis les fêtes) ?",
            status: BdqConvStatut.EN_COURS,
            extracted: { nom, tel, telManquant, desc, loyer, dateEntree: null, precisionDate, champEnAttente: "date_entree_estimee" }
        }
    }

    // Tous les champs sont présents -> présenter le récapitulatif pour confirmation
    const dateFormatted = dateEntree.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
    const telFormatted = telManquant
        ? "Confirmation sur place par agent QAPRIL"
        : (tel || "").replace(/(\d{2})(?=\d)/g, "$1 ").trim()

    return {
        replyText: `Voici le résumé de votre bail QAPRIL :\n• Locataire : ${nom} · ${telFormatted}\n• Logement : ${desc}\n• Loyer : ${loyer.toLocaleString("fr-FR")} FCFA/mois\n• Entrée : ${dateFormatted}\n\nC'est correct ? Répondez OUI pour confirmer.`,
        status: BdqConvStatut.EN_COURS,
        extracted: { nom, tel, telManquant, desc, loyer, dateEntree, precisionDate, champEnAttente: "CONFIRMATION" }
    }
}

/**
 * Appel API Anthropic Claude avec fallback modèle automatique
 */
async function callClaudeMessagesApi(messages: any[], maxTokens = 500) {
    if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === "dummy_key_to_prevent_startup_crash") {
        return null
    }

    // Nettoyer les messages pour l'API Anthropic (role user/assistant alternés, premier message = user)
    const sanitized: Array<{ role: "user" | "assistant"; content: any }> = []
    for (const m of messages) {
        if (!m || !m.content) continue
        const role = m.role === "assistant" ? "assistant" : "user"
        if (sanitized.length === 0 && role !== "user") {
            sanitized.push({
                role: "user",
                content: "Bonjour, je souhaite créer un Bail Déclaratif QAPRIL (BDQ) pour mon locataire."
            })
        }
        sanitized.push({ role, content: m.content })
    }

    if (sanitized.length === 0) {
        sanitized.push({
            role: "user",
            content: "Bonjour, je souhaite créer un Bail Déclaratif QAPRIL (BDQ) pour mon locataire."
        })
    }

    for (const model of [CLAUDE_MODEL_PRIMARY, CLAUDE_MODEL_FALLBACK]) {
        try {
            const response = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": ANTHROPIC_API_KEY,
                    "anthropic-version": "2023-06-01"
                },
                body: JSON.stringify({
                    model,
                    max_tokens: maxTokens,
                    system: SYSTEM_PROMPT_BDQ,
                    tools: BDQ_TOOLS,
                    messages: sanitized
                })
            })

            if (response.ok) {
                return await response.json()
            }
            const errText = await response.text()
            console.warn(`[AGENT-BDQ] Claude model ${model} returned ${response.status}:`, errText)
        } catch (err) {
            console.warn(`[AGENT-BDQ] Network error calling Claude (${model}):`, err)
        }
    }

    return null
}

/**
 * Mise à jour incrémentale des champs extraits à partir du message utilisateur
 */
function inferIncrementalFields(conv: any, userMessage: string) {
    const updates: Record<string, any> = {}
    const phone = extractIvorianPhone10Digits(userMessage)
    if (phone.valid && !conv.telephoneExtrait) {
        updates.telephoneExtrait = phone.valid
    }
    const rent = parseIvorianAmount(userMessage)
    if (rent.amount) {
        updates.loyerExtrait = rent.amount
    }
    const dt = parseIvorianDate(userMessage)
    if (dt.dateStr && !conv.dateEntreeExtraite) {
        updates.dateEntreeExtraite = new Date(dt.dateStr)
        updates.precisionDate = dt.precision || "APPROXIMATIVE"
    }
    return updates
}

/**
 * Boucle principale de l'Agent-BDQ (ADD-08 Section 5 — processAgentBDQ)
 */
export async function processAiBdqMessage(
    canalRef: string,
    userMessage: string,
    forceUserId?: string,
    canalType: "WHATSAPP" | "APP_CHAT" = "WHATSAPP"
) {
    let userId = forceUserId

    if (!userId) {
        const session = await auth()
        if (!session?.user?.id) throw new Error("Non autorisé")
        userId = session.user.id
    }

    // 1. Charger ou créer l'état de la conversation (bdq_conversation_states)
    let conv = await prisma.bdqConversationState.findUnique({
        where: { canalRef }
    })

    // Si une conversation EN_PAUSE ou EN_COURS existe mais a dépassé expireAt (48h), la marquer EXPIRE et réinitialiser
    if (conv && conv.expireAt && new Date(conv.expireAt) < new Date() && conv.statut !== BdqConvStatut.COMPLETE) {
        conv = await prisma.bdqConversationState.update({
            where: { id: conv.id },
            data: {
                statut: BdqConvStatut.EN_COURS,
                nomLocataireExtrait: null,
                telephoneExtrait: null,
                descriptionLogementExtrait: null,
                loyerExtrait: null,
                dateEntreeExtraite: null,
                telephoneManquant: false,
                identiteIncomplete: false,
                messagesHistory: [],
                nbEchanges: 0,
                champEnAttente: "nom_locataire",
                pauseReason: null,
                expireAt: new Date(Date.now() + 48 * 60 * 60 * 1000)
            }
        })
    }

    if (!conv) {
        conv = await prisma.bdqConversationState.create({
            data: {
                bailleurId: userId,
                canal: NotifCanal.WHATSAPP,
                canalRef,
                statut: BdqConvStatut.EN_COURS,
                messagesHistory: [],
                nbEchanges: 0,
                champEnAttente: "nom_locataire",
                expireAt: new Date(Date.now() + 48 * 60 * 60 * 1000)
            }
        })
    } else if (conv.statut === BdqConvStatut.EN_PAUSE) {
        // Reprise après pause (AGT-UAT-08)
        conv = await prisma.bdqConversationState.update({
            where: { id: conv.id },
            data: {
                statut: BdqConvStatut.EN_COURS,
                pauseReason: null,
                expireAt: new Date(Date.now() + 48 * 60 * 60 * 1000)
            }
        })
    }

    const history = deserializeHistory(conv.messagesHistory)
    history.push({ role: "user", content: userMessage, timestamp: new Date().toISOString() })
    const nextNbEchanges = (conv.nbEchanges || 0) + 1

    // 2. Vérifier la limite de 12 échanges par session (ADD-08 Section 3.2 & 5 — AGT-UAT-11)
    if (nextNbEchanges > 12) {
        const pauseMsg = "Reprenons demain si vous le souhaitez. Vos informations sont sauvegardées pendant 48h."
        history.push({ role: "assistant", content: pauseMsg, timestamp: new Date().toISOString() })
        const expireAt = new Date(Date.now() + 48 * 60 * 60 * 1000)
        await prisma.bdqConversationState.update({
            where: { id: conv.id },
            data: {
                statut: BdqConvStatut.EN_PAUSE,
                nbEchanges: nextNbEchanges,
                messagesHistory: serializeHistory(history),
                pauseReason: "LIMITE_12_ECHANGES_ATTEINTE",
                expireAt
            }
        })
        revalidatePath("/dashboard/bdq")
        return {
            convId: conv.id,
            message: pauseMsg,
            status: "EN_PAUSE",
            nbEchanges: nextNbEchanges
        }
    }

    // 3. Appel Claude API (ou moteur NLU local haute fidélité si pas de clé API)
    const claudeData = await callClaudeMessagesApi(history, 500)

    if (claudeData && Array.isArray(claudeData.content)) {
        const inputTokens = claudeData.usage?.input_tokens || 0
        const outputTokens = claudeData.usage?.output_tokens || 0
        const costFcfa = estimateCostFCFA(claudeData.usage)

        const textBlocks = claudeData.content
            .filter((b: any) => b.type === "text")
            .map((b: any) => b.text)
            .join("\n")
            .trim()
        const toolUseBlock = claudeData.content.find((b: any) => b.type === "tool_use")

        const incremental = inferIncrementalFields(conv, userMessage)

        if (toolUseBlock) {
            history.push({ role: "assistant", content: claudeData.content, timestamp: new Date().toISOString() })

            const exec = await executeBdqTool(toolUseBlock.name, toolUseBlock.input || {}, conv, userId)

            if (exec.directReply && !exec.shouldContinue) {
                const finalReply = textBlocks || exec.directReply
                history.push({ role: "assistant", content: finalReply, timestamp: new Date().toISOString() })
                await prisma.bdqConversationState.update({
                    where: { id: conv.id },
                    data: {
                        messagesHistory: serializeHistory(history),
                        nbEchanges: nextNbEchanges,
                        tokensEntreeTotal: (conv.tokensEntreeTotal || 0) + inputTokens,
                        tokensSortieTotal: (conv.tokensSortieTotal || 0) + outputTokens,
                        coutEstimeFcfa: Number(conv.coutEstimeFcfa || 0) + costFcfa
                    }
                })
                return {
                    convId: conv.id,
                    message: finalReply,
                    status: exec.finalStatus || "EN_PAUSE",
                    bdqId: exec.bdqId,
                    nbEchanges: nextNbEchanges
                }
            }

            if (exec.shouldContinue) {
                history.push({
                    role: "user",
                    content: [
                        {
                            type: "tool_result",
                            tool_use_id: toolUseBlock.id,
                            content: JSON.stringify(exec.toolResult)
                        }
                    ],
                    timestamp: new Date().toISOString()
                })

                const finalClaude = await callClaudeMessagesApi(history, 250)
                const finalInputTokens = finalClaude?.usage?.input_tokens || 0
                const finalOutputTokens = finalClaude?.usage?.output_tokens || 0
                const finalCostFcfa = estimateCostFCFA(finalClaude?.usage)

                const confirmMsg =
                    finalClaude?.content?.find((b: any) => b.type === "text")?.text ||
                    textBlocks ||
                    "Parfait ! Votre Bail Déclaratif QAPRIL a été créé et un SMS de confirmation a été envoyé au locataire. 👍"

                history.push({ role: "assistant", content: confirmMsg, timestamp: new Date().toISOString() })

                await prisma.bdqConversationState.update({
                    where: { id: conv.id },
                    data: {
                        messagesHistory: serializeHistory(history),
                        nbEchanges: nextNbEchanges,
                        tokensEntreeTotal: (conv.tokensEntreeTotal || 0) + inputTokens + finalInputTokens,
                        tokensSortieTotal: (conv.tokensSortieTotal || 0) + outputTokens + finalOutputTokens,
                        coutEstimeFcfa: Number(conv.coutEstimeFcfa || 0) + costFcfa + finalCostFcfa
                    }
                })

                return {
                    convId: conv.id,
                    message: confirmMsg,
                    status: exec.finalStatus || "COMPLETE",
                    bdqId: exec.bdqId,
                    nbEchanges: nextNbEchanges
                }
            }
        }

        const assistantReply = textBlocks || "Je vous écoute, pouvez-vous préciser ?"
        history.push({ role: "assistant", content: assistantReply, timestamp: new Date().toISOString() })

        await prisma.bdqConversationState.update({
            where: { id: conv.id },
            data: {
                ...incremental,
                messagesHistory: serializeHistory(history),
                nbEchanges: nextNbEchanges,
                tokensEntreeTotal: (conv.tokensEntreeTotal || 0) + inputTokens,
                tokensSortieTotal: (conv.tokensSortieTotal || 0) + outputTokens,
                coutEstimeFcfa: Number(conv.coutEstimeFcfa || 0) + costFcfa
            }
        })
        revalidatePath("/dashboard/bdq")

        return {
            convId: conv.id,
            message: assistantReply,
            status: "EN_COURS",
            nbEchanges: nextNbEchanges
        }
    }

    // 4. Fallback NLU Déterministe ADD-08 (si ANTHROPIC_API_KEY absent ou indisponible)
    const fallbackResult = await runLocalBdqAgentFallback(conv, userMessage, history, userId)
    history.push({ role: "assistant", content: fallbackResult.replyText, timestamp: new Date().toISOString() })

    // Estimation de tokens équivalents pour le monitoring (ADD-08 Section 8)
    const estInputTokens = 320 + Math.ceil(userMessage.length / 4)
    const estOutputTokens = Math.ceil(fallbackResult.replyText.length / 4)
    const estCostFcfa = estimateCostFCFA({ input_tokens: estInputTokens, output_tokens: estOutputTokens })

    await prisma.bdqConversationState.update({
        where: { id: conv.id },
        data: {
            statut: fallbackResult.status,
            nomLocataireExtrait: fallbackResult.extracted.nom ?? conv.nomLocataireExtrait,
            telephoneExtrait: fallbackResult.extracted.tel ?? conv.telephoneExtrait,
            telephoneManquant: fallbackResult.extracted.telManquant ?? conv.telephoneManquant,
            descriptionLogementExtrait: fallbackResult.extracted.desc ?? conv.descriptionLogementExtrait,
            loyerExtrait: fallbackResult.extracted.loyer ?? conv.loyerExtrait,
            dateEntreeExtraite: fallbackResult.extracted.dateEntree ?? conv.dateEntreeExtraite,
            precisionDate: fallbackResult.extracted.precisionDate ?? conv.precisionDate,
            champEnAttente: fallbackResult.extracted.champEnAttente ?? null,
            pauseReason: fallbackResult.extracted.pauseReason ?? conv.pauseReason,
            messagesHistory: serializeHistory(history),
            nbEchanges: nextNbEchanges,
            tokensEntreeTotal: (conv.tokensEntreeTotal || 0) + estInputTokens,
            tokensSortieTotal: (conv.tokensSortieTotal || 0) + estOutputTokens,
            coutEstimeFcfa: Math.round((Number(conv.coutEstimeFcfa || 0) + estCostFcfa) * 100) / 100
        }
    })
    revalidatePath("/dashboard/bdq")

    return {
        convId: conv.id,
        message: fallbackResult.replyText,
        status: fallbackResult.status,
        bdqId: fallbackResult.bdqId,
        extracted: fallbackResult.extracted,
        nbEchanges: nextNbEchanges
    }
}

/**
 * AGT-04 — Liste des conversations du propriétaire
 */
export async function getOwnerConversations(userId?: string) {
    let targetUserId = userId
    if (!targetUserId) {
        const session = await auth()
        if (!session?.user?.id) throw new Error("Non autorisé")
        targetUserId = session.user.id
    }

    const convs = await prisma.bdqConversationState.findMany({
        where: { bailleurId: targetUserId },
        include: {
            bdqCree: {
                select: {
                    id: true,
                    statut: true,
                    qrToken: true,
                    nomLocataireDeclare: true,
                    loyerDeclareMensuel: true
                }
            }
        },
        orderBy: { updatedAt: "desc" }
    })

    return convs.map((c) => ({
        conv_id: c.id,
        bailleur_id: c.bailleurId,
        canal: c.canalRef?.startsWith("app_") || c.canalRef?.startsWith("chat-") ? "APP_CHAT" : c.canal,
        canal_ref: c.canalRef,
        statut: c.statut,
        nom_locataire_extrait: c.nomLocataireExtrait,
        telephone_extrait: c.telephoneExtrait,
        description_logement_extrait: c.descriptionLogementExtrait,
        loyer_extrait: c.loyerExtrait,
        date_entree_extraite: c.dateEntreeExtraite,
        precision_date: c.precisionDate,
        telephone_manquant: c.telephoneManquant,
        nb_echanges: c.nbEchanges,
        champ_en_attente: c.champEnAttente,
        pause_reason: c.pauseReason,
        bdq_cree_id: c.bdqCreeId,
        bdq_cree: c.bdqCree,
        tokens_entree_total: c.tokensEntreeTotal,
        tokens_sortie_total: c.tokensSortieTotal,
        cout_estime_fcfa: Number(c.coutEstimeFcfa || 0),
        created_at: c.createdAt,
        updated_at: c.updatedAt,
        expire_at: c.expireAt,
        completed_at: c.completedAt,
        messages_history: deserializeHistory(c.messagesHistory)
    }))
}

/**
 * AGT-05 — Détail d'une conversation avec historique complet
 */
export async function getConversationDetail(convId: string, userId?: string, isAdmin = false) {
    const conv = await prisma.bdqConversationState.findUnique({
        where: { id: convId },
        include: {
            bdqCree: true,
            bailleur: {
                select: { id: true, firstName: true, lastName: true, phone: true, email: true }
            }
        }
    })
    if (!conv) return null
    if (!isAdmin && userId && conv.bailleurId !== userId) {
        throw new Error("Accès refusé à cette conversation")
    }

    return {
        conv_id: conv.id,
        bailleur_id: conv.bailleurId,
        bailleur: conv.bailleur,
        canal: conv.canalRef?.startsWith("app_") || conv.canalRef?.startsWith("chat-") ? "APP_CHAT" : conv.canal,
        canal_ref: conv.canalRef,
        statut: conv.statut,
        nom_locataire_extrait: conv.nomLocataireExtrait,
        telephone_extrait: conv.telephoneExtrait,
        description_logement_extrait: conv.descriptionLogementExtrait,
        loyer_extrait: conv.loyerExtrait,
        date_entree_extraite: conv.dateEntreeExtraite,
        precision_date: conv.precisionDate,
        telephone_manquant: conv.telephoneManquant,
        identite_incomplete: conv.identiteIncomplete,
        messages_history: deserializeHistory(conv.messagesHistory),
        nb_echanges: conv.nbEchanges,
        champ_en_attente: conv.champEnAttente,
        pause_reason: conv.pauseReason,
        bdq_cree_id: conv.bdqCreeId,
        bdq_cree: conv.bdqCree,
        tokens_entree_total: conv.tokensEntreeTotal,
        tokens_sortie_total: conv.tokensSortieTotal,
        cout_estime_fcfa: Number(conv.coutEstimeFcfa || 0),
        created_at: conv.createdAt,
        updated_at: conv.updatedAt,
        expire_at: conv.expireAt,
        completed_at: conv.completedAt
    }
}

/**
 * AGT-06 — Abandonner une conversation en cours
 */
export async function abandonConversation(convId: string, userId?: string, isAdmin = false) {
    const conv = await prisma.bdqConversationState.findUnique({
        where: { id: convId }
    })
    if (!conv) throw new Error("Conversation introuvable")
    if (!isAdmin && userId && conv.bailleurId !== userId) {
        throw new Error("Non autorisé")
    }

    const updated = await prisma.bdqConversationState.update({
        where: { id: convId },
        data: {
            statut: BdqConvStatut.ABANDONNE,
            pauseReason: "Abandonné par le propriétaire"
        }
    })
    revalidatePath("/dashboard/bdq")
    return { success: true, conv_id: updated.id, statut: updated.statut }
}

/**
 * AGT-07 — Statistiques Agent-BDQ (Admin)
 */
export async function getAdminAgentStats() {
    const allConvs = await prisma.bdqConversationState.findMany({
        select: {
            id: true,
            statut: true,
            canal: true,
            canalRef: true,
            nbEchanges: true,
            tokensEntreeTotal: true,
            tokensSortieTotal: true,
            coutEstimeFcfa: true,
            createdAt: true,
            completedAt: true,
            bdqCreeId: true
        }
    })

    const total = allConvs.length
    const completed = allConvs.filter((c) => c.statut === BdqConvStatut.COMPLETE).length
    const enCours = allConvs.filter((c) => c.statut === BdqConvStatut.EN_COURS).length
    const enPause = allConvs.filter((c) => c.statut === BdqConvStatut.EN_PAUSE).length
    const abandonne = allConvs.filter((c) => c.statut === BdqConvStatut.ABANDONNE).length
    const expire = allConvs.filter((c) => c.statut === BdqConvStatut.EXPIRE).length

    const tauxCompletion = total > 0 ? Math.round((completed / total) * 1000) / 10 : 0
    const tauxAbandon = total > 0 ? Math.round(((abandonne + expire) / total) * 1000) / 10 : 0

    const totalTokensIn = allConvs.reduce((s, c) => s + (c.tokensEntreeTotal || 0), 0)
    const totalTokensOut = allConvs.reduce((s, c) => s + (c.tokensSortieTotal || 0), 0)
    const totalCostFcfa = Math.round(allConvs.reduce((s, c) => s + Number(c.coutEstimeFcfa || 0), 0) * 100) / 100
    const avgCostPerBdqFcfa = completed > 0 ? Math.round((totalCostFcfa / completed) * 100) / 100 : 12.0

    const avgExchanges =
        total > 0
            ? Math.round((allConvs.reduce((s, c) => s + (c.nbEchanges || 0), 0) / total) * 10) / 10
            : 0

    const completedWithDuration = allConvs.filter((c) => c.completedAt && c.createdAt)
    const avgDurationSeconds =
        completedWithDuration.length > 0
            ? Math.round(
                  completedWithDuration.reduce(
                      (s, c) => s + (new Date(c.completedAt!).getTime() - new Date(c.createdAt).getTime()) / 1000,
                      0
                  ) / completedWithDuration.length
              )
            : 120

    return {
        reference: "QAPRIL/CDC/003/2026-ADD-08",
        model: CLAUDE_MODEL_PRIMARY,
        total_conversations: total,
        repartition_statut: {
            EN_COURS: enCours,
            EN_PAUSE: enPause,
            COMPLETE: completed,
            ABANDONNE: abandonne,
            EXPIRE: expire
        },
        taux_completion_pct: tauxCompletion,
        taux_abandon_pct: tauxAbandon,
        cible_taux_abandon_pct: 15.0,
        nb_echanges_moyen: avgExchanges,
        duree_moyenne_secondes: avgDurationSeconds,
        tokens: {
            entree_total: totalTokensIn,
            sortie_total: totalTokensOut,
            total: totalTokensIn + totalTokensOut
        },
        cout: {
            total_fcfa: totalCostFcfa,
            moyen_par_bdq_fcfa: avgCostPerBdqFcfa
        }
    }
}

/**
 * AGT-08 — Coût mensuel Claude API & Projection fin de mois (Admin)
 */
export async function getAdminAgentMonthlyCost() {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const currentDay = Math.max(1, now.getDate())

    const monthConvs = await prisma.bdqConversationState.findMany({
        where: {
            createdAt: { gte: startOfMonth }
        },
        select: {
            id: true,
            statut: true,
            tokensEntreeTotal: true,
            tokensSortieTotal: true,
            coutEstimeFcfa: true,
            bdqCreeId: true
        }
    })

    const bdqCreesCeMois = monthConvs.filter((c) => c.statut === BdqConvStatut.COMPLETE || c.bdqCreeId).length
    const tokensEntreeMois = monthConvs.reduce((s, c) => s + (c.tokensEntreeTotal || 0), 0)
    const tokensSortieMois = monthConvs.reduce((s, c) => s + (c.tokensSortieTotal || 0), 0)
    const coutActuelFcfa = Math.round(monthConvs.reduce((s, c) => s + Number(c.coutEstimeFcfa || 0), 0) * 100) / 100
    const projectionFinMoisFcfa = Math.round((coutActuelFcfa / currentDay) * daysInMonth * 100) / 100

    // Calcul du nombre de BDQ convertis en bail formel ce mois
    const bdqFormalises = await prisma.bailDeclaratif.count({
        where: {
            createdAt: { gte: startOfMonth },
            OR: [{ statut: BdqStatut.FORMALISE }, { bailFormelId: { not: null } }]
        }
    })

    const revenuBailFormelEstimeFcfa = bdqFormalises * 3000

    return {
        mois: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
        jours_ecoules: currentDay,
        jours_total_mois: daysInMonth,
        conversations_mois: monthConvs.length,
        bdq_crees_mois: bdqCreesCeMois,
        bdq_convertis_bail_formel: bdqFormalises,
        tokens_entree_mois: tokensEntreeMois,
        tokens_sortie_mois: tokensSortieMois,
        cout_actuel_fcfa: coutActuelFcfa,
        projection_fin_mois_fcfa: projectionFinMoisFcfa,
        cout_moyen_par_bdq_fcfa: bdqCreesCeMois > 0 ? Math.round((coutActuelFcfa / bdqCreesCeMois) * 100) / 100 : 12.0,
        revenu_conversion_bail_formel_fcfa: revenuBailFormelEstimeFcfa,
        roi_multiple: coutActuelFcfa > 0 ? Math.round((revenuBailFormelEstimeFcfa / coutActuelFcfa) * 10) / 10 : null
    }
}
