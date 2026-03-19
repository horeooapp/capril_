"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { BdqConvStatut, BdqStatut, Role } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { createBDQ } from "./bdq"
import { Prisma } from "@prisma/client"

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const CLAUDE_MODEL = "claude-3-5-sonnet-20240620"; // Updated to current available model

const SYSTEM_PROMPT_BDQ = `You are the QAPRIL assistant helping a property owner in Côte d'Ivoire create a BDQ (Bail Déclaratif QAPRIL) for their tenant.

## YOUR MISSION
Extract exactly 5 fields through natural conversation in French, then call the create_bdq function when all fields are confirmed.

## REQUIRED FIELDS
1. nom_locataire (string) — tenant full name
2. telephone_locataire (string, 10 digits CI) — tenant phone number
3. description_logement (string) — free text description of the housing unit
4. loyer_mensuel (integer, FCFA) — monthly rent amount
5. date_entree_estimee (YYYY-MM-01 format) — approximate move-in date

## LANGUAGE RULES
- ALWAYS respond in French, never in English.
- Understand and accept Ivorian popular French:
  '35 mille' → 35000 FCFA
  'un demi' → 500000 FCFA
  'depuis les fêtes' → previous December
  'ça fait 2 ans' → current year minus 2, January 1st
  'depuis le ramadan' → calculate from current year's Ramadan
  'au fond', 'la grande chambre', 'numéro 2' → accept as description
- Tone: warm, simple, no jargon. Max 2 sentences per response.

## EXTRACTION RULES
- Names: when ambiguous ('Ibrahim le fils de Bamba'), always clarify first name vs family name before proceeding.
- Phone: validate 10-digit CI format (07/05/01/06 prefix). If invalid format, ask to repeat slowly.
- Amount: if vague ('30 et quelque'), ask for exact number. If still vague after 2 attempts, ask to confirm a rounded amount.
- Date: accept approximate dates, convert to YYYY-MM-01.
- Housing description: accept ANY free text, store verbatim.

## MISSING PHONE NUMBER PROTOCOL
If owner doesn't know tenant phone number:
1. Offer 2 options in a single message:
   Option 1: ask tenant and come back (session kept 48h)
   Option 2: QAPRIL agent visit (in-person confirmation)
2. If they choose option 1: save state, end conversation gracefully.
3. If they choose option 2: call create_bdq_agent_visit function.

## CONFIRMATION STEP (MANDATORY)
Before calling create_bdq, ALWAYS show a summary and ask for OUI.
If owner corrects any field: update it, show new summary, ask again.
Never call create_bdq without explicit confirmation.

## CONVERSATION LIMITS
- Maximum 12 exchanges per session.
- If limit reached: save state, offer to continue later.
- If owner goes off-topic: Answer briefly, then redirect.`;

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
                loyer_mensuel: { type: "integer", minimum: 3000 },
                date_entree_estimee: { type: "string", format: "date" },
                precision_date_entree: { type: "string", enum: ["EXACTE","APPROXIMATIVE","INCONNUE"] },
                identite_incomplete: { type: "boolean" }
            },
            required: ["nom_locataire", "description_logement", "loyer_mensuel", "date_entree_estimee"]
        }
    },
    {
        name: "create_bdq_agent_visit",
        description: "Create BDQ for in-person agent confirmation (no phone).",
        input_schema: {
            type: "object",
            properties: {
                nom_locataire: { type: "string" },
                description_logement: { type: "string" },
                loyer_mensuel: { type: "integer" },
                date_entree_estimee: { type: "string", format: "date" }
            },
            required: ["nom_locataire", "description_logement", "loyer_mensuel"]
        }
    },
    {
        name: "save_partial_state",
        description: "Save conversation progress when owner needs to pause.",
        input_schema: {
            type: "object",
            properties: {
                fields_collected: { type: "object" },
                pending_field: { type: "string" },
                pause_reason: { type: "string" }
            }
        }
    }
];

export async function processAiBdqMessage(canalRef: string, userMessage: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    const bailleurId = session.user.id;

    // 1. Load or create conversation state
    let conv = await prisma.bdqConversationState.findUnique({
        where: { canalRef }
    });

    if (!conv) {
        conv = await prisma.bdqConversationState.create({
            data: {
                bailleurId,
                canal: "APP_CHAT",
                canalRef,
                statut: BdqConvStatut.EN_COURS,
                messagesHistory: []
            }
        });
    }

    const history = (conv.messagesHistory as any[]) || [];
    history.push({ role: "user", content: userMessage });

    // 2. Call Claude API via fetch
    const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": ANTHROPIC_API_KEY || "",
            "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
            model: CLAUDE_MODEL,
            max_tokens: 1024,
            system: SYSTEM_PROMPT_BDQ,
            tools: BDQ_TOOLS,
            messages: history
        })
    });

    if (!response.ok) {
        const err = await response.text();
        console.error("Claude API Error:", err);
        throw new Error("Désolé, l'assistant est temporairement indisponible.");
    }

    const data = await response.json();
    const assistantMessage = data.content.find((c: any) => c.type === "text")?.text || "";
    const toolUse = data.content.find((c: any) => c.type === "tool_use");

    // Track costs (Sprint 2 monitoring)
    const inputTokens = data.usage?.input_tokens || 0;
    const outputTokens = data.usage?.output_tokens || 0;
    const costFcfa = (inputTokens * 0.002 + outputTokens * 0.008); // Real costs vary, this is an estimate

    history.push({ role: "assistant", content: data.content });

    // 3. Handle Tool Calls
    if (toolUse) {
        const { name, input, id: toolUseId } = toolUse;
        let toolResult: any = { success: false };
        let shouldContinue = false;

        if (name === "create_bdq") {
            const res = await createBDQ({
                nomLocataire: input.nom_locataire,
                telephoneLocataire: input.telephone_locataire,
                descriptionLogement: input.description_logement,
                loyerMensuel: input.loyer_mensuel,
                dateEntree: new Date(input.date_entree_estimee),
                sourceCreation: "AGENT_IA_APP"
            });

            if (res.success) {
                toolResult = { success: true, bdq_id: res.bdqId };
                shouldContinue = true;
                await prisma.bdqConversationState.update({
                    where: { id: conv.id },
                    data: {
                        statut: BdqConvStatut.COMPLETE,
                        bdqCreeId: res.bdqId,
                        completedAt: new Date()
                    }
                });
            }
        } else if (name === "create_bdq_agent_visit") {
            const bdq = await prisma.bailDeclaratif.create({
                data: {
                    bailleurId,
                    nomLocataireDeclare: input.nom_locataire,
                    telephoneLocataire: "NON_FOURNI",
                    descriptionLogement: input.description_logement,
                    loyerDeclareMensuel: new Prisma.Decimal(input.loyer_mensuel),
                    dateEntreeEstimee: input.date_entree_estimee ? new Date(input.date_entree_estimee) : null,
                    statut: BdqStatut.PENDING_LOCATAIRE,
                    hashDeclaration: "PENDING_AGENT_VISIT"
                }
            });
            toolResult = { success: true, bdq_id: bdq.id };
            shouldContinue = true;
            await prisma.bdqConversationState.update({
                where: { id: conv.id },
                data: {
                    statut: BdqConvStatut.COMPLETE,
                    bdqCreeId: bdq.id,
                    completedAt: new Date()
                }
            });
        } else if (name === "save_partial_state") {
            await prisma.bdqConversationState.update({
                where: { id: conv.id },
                data: {
                    statut: BdqConvStatut.EN_PAUSE,
                    nomLocataireExtrait: input.fields_collected?.nom_locataire,
                    loyerExtrait: input.fields_collected?.loyer_mensuel,
                    descriptionLogementExtrait: input.fields_collected?.description_logement,
                    champEnAttente: input.pending_field,
                    pauseReason: input.pause_reason
                }
            });
            return { message: "D'accord, je mets notre conversation en pause. Revenez quand vous le souhaitez !", status: "EN_PAUSE" };
        }

        if (shouldContinue) {
            // Re-call Claude with tool result to get final polite message
            const finalResp = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": ANTHROPIC_API_KEY || "",
                    "anthropic-version": "2023-06-01"
                },
                body: JSON.stringify({
                    model: CLAUDE_MODEL,
                    max_tokens: 256,
                    system: SYSTEM_PROMPT_BDQ,
                    messages: [
                        ...history,
                        {
                            role: "user",
                            content: [
                                {
                                    type: "tool_result",
                                    tool_use_id: toolUseId,
                                    content: JSON.stringify(toolResult)
                                }
                            ]
                        }
                    ]
                })
            });
            
            if (finalResp.ok) {
                const finalData = await finalResp.json();
                const finalMsg = finalData.content.find((c: any) => c.type === "text")?.text;
                history.push({ 
                    role: "assistant", 
                    content: finalData.content 
                });
                
                await prisma.bdqConversationState.update({
                    where: { id: conv.id },
                    data: {
                        messagesHistory: history,
                        tokensEntreeTotal: conv.tokensEntreeTotal + inputTokens + (finalData.usage?.input_tokens || 0),
                        tokensSortieTotal: conv.tokensSortieTotal + outputTokens + (finalData.usage?.output_tokens || 0),
                        coutEstimeFcfa: (conv.coutEstimeFcfa as Prisma.Decimal).add(new Prisma.Decimal(costFcfa))
                    }
                });
                return { message: finalMsg || "Bail créé avec succès !", status: "COMPLETE" };
            }
        }
    }

    // Update conversation state and history
    await prisma.bdqConversationState.update({
        where: { id: conv.id },
        data: {
            messagesHistory: history,
            nbEchanges: conv.nbEchanges + 1,
            tokensEntreeTotal: conv.tokensEntreeTotal + inputTokens,
            tokensSortieTotal: conv.tokensSortieTotal + outputTokens,
            coutEstimeFcfa: (conv.coutEstimeFcfa as Prisma.Decimal).add(new Prisma.Decimal(costFcfa))
        }
    });

    return { message: assistantMessage || "Je n'ai pas pu générer de réponse.", status: "EN_COURS" };
}
