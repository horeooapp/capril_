import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';
import { analyserPhraseVocale, determinerProchaineEtapePilote } from '@/lib/pilot-vocal';

/**
 * POST /api/v1/pilot/speech
 * Moteur de compréhension vocale et pilotage pas-à-pas de l'application (RG-AST-11 à 18)
 */
export async function POST(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: "Non autorisé. Jeton invalide ou expiré." }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const { text, currentParams = {}, sessionId, module = 'COMMUN' } = body;

        if (!text || typeof text !== 'string') {
            return NextResponse.json({ error: "Aucun texte ou dictée vocale fourni." }, { status: 400 });
        }

        // 1. Analyse de l'intention et extraction des paramètres
        const analysis = analyserPhraseVocale(text);

        if (!analysis.intention) {
            return NextResponse.json({
                success: true,
                compris: false,
                message: analysis.reformulation,
                suggestion: "Exemples : « Créer un bail », « Déclarer un occupant », « Télécharger mon attestation »"
            });
        }

        // 2. Fusion des paramètres déjà saisis avec les nouveaux paramètres extraits
        const mergedParams = { ...currentParams, ...analysis.paramsExtraits };

        // 3. Détermination de la prochaine étape du formulaire (une seule question à la fois RG-AST-13)
        const etape = determinerProchaineEtapePilote(analysis.intention, mergedParams);

        // 4. Journalisation de l'événement dans le journal d'audit (RG-AST-25)
        if (sessionId) {
            await prisma.evenementPiloteVocal.create({
                data: {
                    sessionId,
                    type: etape.estComplete ? 'CONFIRMATION_AFFICHEE' : 'QUESTION',
                    contenu: {
                        texteDicte: text,
                        intention: analysis.intention,
                        params: mergedParams,
                        prochaineQuestion: etape.questionSuivante
                    }
                }
            }).catch(() => null);
        }

        return NextResponse.json({
            success: true,
            compris: true,
            intention: analysis.intention,
            reformulation: analysis.reformulation,
            params: mergedParams,
            estComplete: etape.estComplete,
            questionSuivante: etape.questionSuivante,
            champManquant: etape.champManquant,
            recapitulatif: etape.recapitulatif,
            actionConfirmation: etape.actionConfirmation,
            // Règle RG-AST-01 : la confirmation nécessite un geste tactile ou PIN
            noticeJuridique: "Confirmation requise : appuyez sur le bouton pour valider cette opération (la voix seule ne valide aucun acte)."
        });

    } catch (error: any) {
        console.error("[PILOT SPEECH API] Error:", error);
        return NextResponse.json({ error: "Erreur lors du traitement de l'instruction vocale." }, { status: 500 });
    }
}

