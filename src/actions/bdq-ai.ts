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
- Understand and accept Ivorian popular French (e.g., '35 mille' -> 35000, 'un demi' -> 500000, 'depuis les fêtes' -> previous December).
- Tone: warm, simple, no jargon. Max 2 sentences per response.

## MISSING PHONE NUMBER PROTOCOL
If owner doesn't know tenant phone number:
1. Offer 2 options: Option 1 (ask and return), Option 2 (QAPRIL agent visit).
2. If choice is visit: call create_bdq_agent_visit.

## CONFIRMATION STEP (MANDATORY)
Before calling create_bdq, ALWAYS show a summary and ask for OUI.`;

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
                date_entree_estimee: { type: "string", format: "date" }
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
    const assistantMessage = data.content.find((c: any) => c.type === "text")?.text || "Je n'ai pas pu générer de réponse.";
    const toolUse = data.content.find((c: any) => c.type === "tool_use");

    history.push({ role: "assistant", content: data.content });

    let finalResponse = assistantMessage;

    // 3. Handle Tool Calls
    if (toolUse) {
        const { name, input, id: toolUseId } = toolUse;
        
        if (name === "create_bdq") {
            const res = await createBDQ({
                nomLocataire: input.nom_locataire,
                telephoneLocataire: input.telephone_locataire,
                descriptionLogement: input.description_logement,
                loyerMensuel: input.loyer_mensuel,
                dateEntree: new Date(input.date_entree_estimee)
            });

            if (res.success) {
                const toolResult = { success: true, bdq_id: res.bdqId };
                // Update conv with results
                await prisma.bdqConversationState.update({
                    where: { id: conv.id },
                    data: {
                        statut: BdqConvStatut.COMPLETE,
                        bdqCreeId: res.bdqId,
                        messagesHistory: history,
                        nbEchanges: conv.nbEchanges + 1
                    }
                });
                return { 
                    message: "Parfait ! Votre bailleur a bien été enregistré. Un SMS de confirmation a été envoyé au locataire.",
                    status: "COMPLETE" 
                };
            }
        }

        if (name === "create_bdq_agent_visit") {
            // Logic for Situation C - No phone number
            const bdq = await prisma.bailDeclaratif.create({
                data: {
                    bailleurId,
                    nomLocataireDeclare: input.nom_locataire,
                    telephoneLocataire: "NON_FOURNI",
                    descriptionLogement: input.description_logement,
                    loyerDeclareMensuel: new Prisma.Decimal(input.loyer_mensuel),
                    dateEntreeEstimee: new Date(input.date_entree_estimee),
                    statut: BdqStatut.PENDING_LOCATAIRE, // Will need agent physical confirmation
                    hashDeclaration: "PENDING_AGENT_VISIT"
                }
            });
            await prisma.bdqConversationState.update({
                where: { id: conv.id },
                data: {
                    statut: BdqConvStatut.COMPLETE,
                    bdqCreeId: bdq.id,
                    messagesHistory: history
                }
            });
            return {
                message: "D'accord, je note. Un agent QAPRIL vous contactera pour organiser une visite et confirmer le bail sur place avec votre locataire.",
                status: "COMPLETE"
            };
        }
    }

    // Update conversation history
    await prisma.bdqConversationState.update({
        where: { id: conv.id },
        data: {
            messagesHistory: history,
            nbEchanges: conv.nbEchanges + 1
        }
    });

    return { message: finalResponse, status: "EN_COURS" };
}
