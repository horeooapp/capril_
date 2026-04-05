import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { auth } from "@/auth"

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

// Systeme prompt de l'agent QAPRIL
const SYSTEM_PROMPT = `Tu es l'assistant QAPRIL, une plateforme de gestion locative en Cote d'Ivoire.
Tu aides les bailleurs a enregistrer leurs locataires existants via un bail declaratif.

TON ROLE :
- Poser des questions simples en francais pour collecter les informations du bail
- Une question a la fois - ne jamais poser plusieurs questions en meme temps
- Etre chaleureux et professionnel - tu parles a des bailleurs ivoiriens
- Accepter les reponses en francs (ex: "150 000 francs" = 150000 FCFA)
- Accepter les numeros CI avec ou sans indicatif (+225 ou 07...)
- Quand tu as toutes les infos, generer un JSON de recap

INFORMATIONS A COLLECTER (dans cet ordre) :
1. tenantFullName : Prenom et nom du locataire
2. tenantPhone : Numero de telephone du locataire
3. commune : Commune du bien (Cocody, Abobo, Yopougon, Marcory, Adjame, Treichville, Plateau, Koumassi)
4. address : Quartier et description precise du bien (ex: "Riviera 3, derriere le supermarche")
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

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Non autorise" },
      { status: 401 }
    )
  }

  try {
    const { messages } = await req.json()

    const response = await client.messages.create({
      model:      "claude-3-5-sonnet-20241022", // Model updated to standard
      max_tokens: 1024,
      system:     SYSTEM_PROMPT,
      messages:   messages
    })

    const content = response.content[0]
    if (content.type !== "text") {
      return NextResponse.json({ error: "Reponse invalide" }, { status: 500 })
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
      status:  parsed?.status ?? "CHAT",
      data:    parsed?.data ?? null
    })

  } catch (err: any) {
    console.error("[Agent bail] Erreur:", err?.message)
    return NextResponse.json(
      { error: "Erreur technique - " + err?.message },
      { status: 500 }
    )
  }
}
