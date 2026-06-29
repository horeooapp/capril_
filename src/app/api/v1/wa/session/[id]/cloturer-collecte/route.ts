import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// WAP-03: Clôturer la collecte et passer à la validation
export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params;
        const session = await prisma.waSession.findUnique({ where: { id: params.id } });
        if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
        
        const pages = JSON.parse((session.pages as string) || "[]");
        if (pages.length === 0) return NextResponse.json({ error: "Aucune page à analyser" }, { status: 400 });

        // On prend la première page pour l'OCR (Simplification pour le POC)
        const imageId = pages[0].id;
        let base64Image = "";

        // Tente de récupérer l'image via l'API Meta si un token est présent
        if (process.env.WHATSAPP_TOKEN) {
            try {
                const mediaUrlRes = await fetch(`https://graph.facebook.com/v19.0/${imageId}`, {
                    headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` }
                });
                if (mediaUrlRes.ok) {
                    const mediaData = await mediaUrlRes.json();
                    const imageRes = await fetch(mediaData.url, {
                        headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` }
                    });
                    const arrayBuffer = await imageRes.arrayBuffer();
                    base64Image = Buffer.from(arrayBuffer).toString('base64');
                }
            } catch (err) {
                console.error("Meta Graph API err", err);
            }
        }

        let loyer_mensuel = { valeur: 0, score: 0.0, statut: "A_CONFIRMER" };
        let duree_bail = { valeur: 12, score: 0.0, statut: "A_CONFIRMER" };
        let nom_locataire = { valeur: "Non identifié", score: 0.0, statut: "A_CONFIRMER" };
        let adresse_bien = { valeur: "Non identifiée", score: 0.0, statut: "A_CONFIRMER" };
        let date_debut = { valeur: new Date().toISOString().split('T')[0], score: 0.0, statut: "A_CONFIRMER" };

        const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

        if (ANTHROPIC_API_KEY && base64Image) {
            try {
                const response = await fetch("https://api.anthropic.com/v1/messages", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-api-key": ANTHROPIC_API_KEY,
                        "anthropic-version": "2023-06-01"
                    },
                    body: JSON.stringify({
                        model: "claude-3-5-sonnet-20240620",
                        max_tokens: 1024,
                        messages: [
                            {
                                role: "user",
                                content: [
                                    {
                                        type: "image",
                                        source: {
                                            type: "base64",
                                            media_type: "image/jpeg",
                                            data: base64Image
                                        }
                                    },
                                    {
                                        type: "text",
                                        text: `Extrais les informations de ce contrat de bail (Côte d'Ivoire). 
                                        Donne moi uniquement un JSON avec : 
                                        - "loyer_mensuel": (nombre entier)
                                        - "duree_bail": en mois (entier)
                                        - "nom_locataire": (chaîne)
                                        - "adresse_bien": l'adresse complète du bien loué (chaîne)
                                        - "date_debut": au format YYYY-MM-DD
                                        - "confidence": ton niveau de certitude global (0 à 1)`
                                    }
                                ]
                            }
                        ]
                    })
                });

                if (response.ok) {
                    const aiData = await response.json();
                    const aiText = aiData.content.find((c: any) => c.type === "text")?.text || "";
                    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const parsed = JSON.parse(jsonMatch[0]);
                        const conf = parsed.confidence || 0.85;
                        loyer_mensuel = { valeur: parsed.loyer_mensuel || 0, score: conf, statut: "A_CONFIRMER" };
                        duree_bail = { valeur: parsed.duree_bail || 12, score: conf, statut: "A_CONFIRMER" };
                        nom_locataire = { valeur: parsed.nom_locataire || "Inconnu", score: conf, statut: "A_CONFIRMER" };
                        adresse_bien = { valeur: parsed.adresse_bien || "Non identifiée", score: conf, statut: "A_CONFIRMER" };
                        date_debut = { valeur: parsed.date_debut || date_debut.valeur, score: conf, statut: "A_CONFIRMER" };
                    }
                }
            } catch (err) {
                console.error("OCR AI err", err);
            }
        } else {
            // Fallback s'il n'y a pas d'image ou pas de clé
            console.log("Fallback OCR...");
        }

        const realChamps = { loyer_mensuel, duree_bail, nom_locataire, adresse_bien, date_debut };
        
        const updated = await prisma.waSession.update({
            where: { id: params.id },
            data: {
                etat: "VALIDATION",
                champs: JSON.stringify(realChamps),
                champCourant: "loyer_mensuel",
                dernierMsgAt: new Date()
            }
        });
        
        return NextResponse.json({ status: "OK", message: "Collecte clôturée. En validation.", session: updated });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
