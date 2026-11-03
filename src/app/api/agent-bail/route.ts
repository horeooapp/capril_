import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { auth } from "@/auth"

const SYSTEM_PROMPT = `Tu es l'assistant QAPRIL, une plateforme de gestion locative en Cote d'Ivoire.
Tu aides les bailleurs a enregistrer leurs locataires existants via un bail declaratif.

TON ROLE :
- Poser des questions simples en francais pour collecter les informations du bail
- Une question a la fois - ne jamais poser plusieurs questions en meme temps
- Etre chaleureux et professionnel - tu parles a des bailleurs ivoiriens
- Accepter les reponses en francs (ex: "150 000 francs" ou "35 mille" = 35000 FCFA)
- Accepter les numeros CI avec ou sans indicatif (+225 ou 07...)
- Quand tu as toutes les infos, generer un JSON de recap

INFORMATIONS A COLLECTER (dans cet ordre) :
1. tenantFullName : Prenom et nom du locataire
2. tenantPhone : Numero de telephone du locataire
3. commune : Commune du bien (Cocody, Abobo, Yopougon, Marcory, Adjame, Treichville, Plateau, Koumassi)
4. address : Quartier et description precise du bien (ex: "Riviera 3, Porte 3")
5. rentAmount : Montant du loyer en FCFA (nombre entier)
6. paymentDay : Jour du mois ou le loyer est du (1, 5, 10, 15, 25, 30)
7. startDate : Date de debut d'occupation (format YYYY-MM-DD)

QUAND TU AS TOUT :
Genere EXACTEMENT ce JSON (sans rien d'autre avant ou apres) :
{"status":"RECAP","data":{"tenantFullName":"...","tenantPhone":"...","commune":"...","address":"...","rentAmount":150000,"paymentDay":5,"startDate":"2023-01-01"},"message":"Voici le recapitulatif de votre bail declaratif :\\n\\nLocataire : ...\\nTelephone : ...\\nCommune : ...\\nAdresse : ...\\nLoyer : ... FCFA\\nEcheance : le ... du mois\\nDebut occupation : ...\\n\\nEst-ce que tout est correct ? Tapez OUI pour confirmer ou indiquez ce que vous souhaitez corriger."}

Si le bailleur confirme (OUI, oui, correct, parfait, confirme...) :
Genere : {"status":"CONFIRMED","data":{"tenantFullName":"...","tenantPhone":"...","commune":"...","address":"...","rentAmount":150000,"paymentDay":5,"startDate":"2023-01-01"},"message":"Parfait ! Votre bail declaratif est en cours de creation..."}

Si le bailleur veut corriger : recommence la collecte pour le champ concerne.

IMPORTANT : Ne jamais inventer de donnees. Toujours demander si tu n'es pas sur.`

const COMMUNES_CI = [
  "Cocody",
  "Abobo",
  "Yopougon",
  "Marcory",
  "Adjamé",
  "Adjame",
  "Treichville",
  "Plateau",
  "Koumassi",
  "Port-Bouët",
  "Anyama",
  "Bingerville",
]

function fallbackDeterministicAgent(messages: Array<{ role: string; content: string }>) {
  const userMsgs = messages.filter((m) => m.role === "user").map((m) => m.content.trim())
  if (userMsgs.length === 0) {
    return {
      status: "CHAT",
      data: null,
      message:
        "Bonjour ! Je vais vous aider à enregistrer votre locataire en 2 minutes. Quel est son prénom et son nom ?",
    }
  }

  let tenantFullName = ""
  let tenantPhone = ""
  let commune = ""
  let address = ""
  let rentAmount = 0
  let paymentDay = 5
  let startDate = ""

  for (const msg of userMsgs) {
    if (/bonjour.*je souhaite enregistrer/i.test(msg)) continue

    // Téléphone CI
    const phoneMatch = msg.replace(/[\s\-\.]/g, "").match(/(?:\+?225)?(0[157]\d{8})/)
    if (phoneMatch && !tenantPhone) {
      tenantPhone = "+225" + phoneMatch[1]
    }

    // Commune
    for (const c of COMMUNES_CI) {
      if (new RegExp(`\\b${c}\\b`, "i").test(msg) && !commune) {
        commune = c === "Adjame" ? "Adjamé" : c
      }
    }

    // Montant (ex: "35 mille", "150 000", "150000")
    const milleMatch = msg.match(/(\d+)\s*mille/i)
    if (milleMatch && !rentAmount) {
      rentAmount = parseInt(milleMatch[1], 10) * 1000
    } else if (!phoneMatch) {
      const numClean = msg.replace(/\s+/g, "")
      const amountMatch = numClean.match(/\b(\d{4,7})\b/)
      if (amountMatch && !rentAmount && Number(amountMatch[1]) >= 5000) {
        rentAmount = Number(amountMatch[1])
      }
    }

    // Jour d'échéance (1 à 28)
    const dayMatch = msg.match(/^\s*(?:le\s*)?(\d{1,2})\s*$/i)
    if (dayMatch && Number(dayMatch[1]) >= 1 && Number(dayMatch[1]) <= 30) {
      paymentDay = Number(dayMatch[1])
    }

    // Date d'entrée
    const yearMatch = msg.match(/\b(20\d{2})\b/)
    if (yearMatch && !startDate) {
      startDate = `${yearMatch[1]}-01-01`
    } else if (/depuis\s+les\s+f[êe]tes/i.test(msg) && !startDate) {
      startDate = `${new Date().getFullYear() - 1}-12-01`
    }

    // Nom du locataire (premier message utilisateur significatif)
    if (
      !tenantFullName &&
      !phoneMatch &&
      msg.length >= 2 &&
      !/^(oui|non|ok|d'accord)$/i.test(msg)
    ) {
      tenantFullName = msg
      continue
    }

    // Adresse / description logement
    if (
      tenantFullName &&
      tenantPhone &&
      commune &&
      !address &&
      !phoneMatch &&
      !milleMatch &&
      msg.toLowerCase() !== commune.toLowerCase()
    ) {
      address = msg
    }
  }

  if (commune && !address) {
    address = `Quartier ${commune}`
  }

  if (!tenantFullName) {
    return {
      status: "CHAT",
      data: null,
      message:
        "Bonjour ! Je vais vous aider à enregistrer votre locataire. Quel est son prénom et son nom ?",
    }
  }
  if (!tenantPhone) {
    return {
      status: "CHAT",
      data: null,
      message: `Quel est le numéro de téléphone ivoirien de ${tenantFullName} ? (ex: 07 08 12 34 56)`,
    }
  }
  if (!commune) {
    return {
      status: "CHAT",
      data: null,
      message:
        "Dans quelle commune se trouve le bien loué ? (Cocody, Abobo, Yopougon, Marcory, Adjamé, Treichville, Plateau, Koumassi...)",
    }
  }
  if (!rentAmount) {
    return {
      status: "CHAT",
      data: null,
      message: "Quel est le montant du loyer mensuel en FCFA ? (ex: 35 000 ou 150 000)",
    }
  }
  if (!startDate) {
    return {
      status: "CHAT",
      data: null,
      message: `Depuis quand ${tenantFullName} occupe le logement ? (ex: Janvier 2024)`,
    }
  }

  const lastUserMsg = userMsgs[userMsgs.length - 1] || ""
  const dataPayload = {
    tenantFullName,
    tenantPhone,
    commune,
    address: address || commune,
    rentAmount,
    paymentDay,
    startDate,
  }

  if (/^(oui|ok|je confirme|confirme|correct|parfait|c'est bon)/i.test(lastUserMsg)) {
    return {
      status: "CONFIRMED",
      data: dataPayload,
      message: "Parfait ! Votre bail déclaratif est en cours de création...",
    }
  }

  return {
    status: "RECAP",
    data: dataPayload,
    message: `Voici le récapitulatif de votre bail déclaratif :\n\nLocataire : ${tenantFullName}\nTéléphone : ${tenantPhone}\nCommune : ${commune}\nAdresse : ${dataPayload.address}\nLoyer : ${rentAmount.toLocaleString("fr-FR")} FCFA\nÉchéance : avant le ${paymentDay} du mois\nDébut occupation : ${startDate}\n\nEst-ce que tout est correct ? Tapez OUI pour confirmer ou indiquez ce que vous souhaitez corriger.`,
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  let messages: Array<{ role: "user" | "assistant"; content: string }> = []
  try {
    const body = await req.json()
    messages = body.messages || []
  } catch {
    messages = []
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey === "dummy_key_to_prevent_startup_crash" || apiKey.startsWith("sk-ant-api03-...")) {
    return NextResponse.json(fallbackDeterministicAgent(messages))
  }

  try {
    const client = new Anthropic({ apiKey })
    const apiMessages =
      messages.length === 0
        ? [{ role: "user" as const, content: "Bonjour, je souhaite enregistrer un nouveau bail déclaratif." }]
        : messages[0].role !== "user"
        ? [{ role: "user" as const, content: "Bonjour, je souhaite enregistrer un nouveau bail déclaratif." }, ...messages]
        : messages

    const response = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: apiMessages,
    })

    const content = response.content[0]
    if (content.type !== "text") {
      return NextResponse.json(fallbackDeterministicAgent(messages))
    }

    const text = content.text
    let parsed = null
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0])
      }
    } catch {
      // Pas de JSON
    }

    return NextResponse.json({
      message: parsed?.message ?? text,
      status: parsed?.status ?? "CHAT",
      data: parsed?.data ?? null,
    })
  } catch (err: any) {
    console.warn("[Agent bail] Fallback local activé:", err?.message)
    return NextResponse.json(fallbackDeterministicAgent(messages))
  }
}
