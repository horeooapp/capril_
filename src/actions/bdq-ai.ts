"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { BdqConvStatut, BdqStatut, Role } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { createBDQ } from "./bdq"
import { Prisma } from "@prisma/client"
import { sendSMS } from "@/lib/sms"

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const CLAUDE_MODEL = "claude-3-5-sonnet-20240620";

const SYSTEM_PROMPT_QAPRIL = `You are the QAPRIL Intelligent Assistant, a neutral mediator for property management in Côte d'Ivoire.

## YOUR MISSION
- For OWNERS: Help them create a BDQ (Formaliser un bail verbal) by collecting 5 fields.
- For TENANTS: Help them check their payment status or declare a payment (Réclamation/Déclaration).

## ROLE-SPECIFIC GUIDELINES
### 1. AS OWNER ASSISTANT (BDQ)
Extract: nom_locataire, telephone_locataire, description_logement, loyer_mensuel, date_entree_estimee. Call create_bdq when confirmed.

### 2. AS TENANT ASSISTANT (RÉCLAMATION)
- If tenant asks "Où en est mon loyer ?" or "Ai-je payé ?", call get_rent_status.
- If tenant says "J'ai déjà payé" or "Où est ma quittance ?", offer to create a declaration.
- If tenant provides a payment proof/amount, call create_rent_claim.
- IMPORTANT: Never accuse the manager or owner. Stay neutral. "L'information n'est pas encore synchronisée" is better than "Ils n'ont pas validé".

## LANGUAGE RULES
- ALWAYS respond in French.
- Use Ivorian terms (35 mille, un demi, etc.).
- Tone: Conciliatory, simple, supportive.

## TOOLS
- create_bdq: For Owners only.
- get_rent_status: For Tenants. Returns status of recent months.
- create_rent_claim: For Tenants. Initiates a payment declaration.
`;

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

const QAPRIL_TOOLS = [
    ...BDQ_TOOLS,
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
];

export async function processAiBdqMessage(canalRef: string, userMessage: string, forceUserId?: string) {
    let userId = forceUserId;
    
    if (!userId) {
        const session = await auth();
        if (!session?.user?.id) throw new Error("Unauthorized");
        userId = session.user.id;
    }

    // 1. Load or create conversation state
    let conv = await prisma.bdqConversationState.findUnique({
        where: { canalRef }
    });

    if (!conv) {
        conv = await prisma.bdqConversationState.create({
            data: {
                bailleurId: userId,
                canal: "APP_CHAT",
                canalRef,
                statut: BdqConvStatut.EN_COURS,
                messagesHistory: "[]"
            }
        });
    }

    const history = JSON.parse(conv.messagesHistory || "[]") as any[];
    history.push({ role: "user", content: userMessage });

    // 2. Call Claude API 
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
            system: SYSTEM_PROMPT_QAPRIL,
            tools: QAPRIL_TOOLS,
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

    // Tokens & Cost tracking
    const inputTokens = data.usage?.input_tokens || 0;
    const outputTokens = data.usage?.output_tokens || 0;
    const costFcfa = (inputTokens * 0.002 + outputTokens * 0.008);

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
                    data: { statut: BdqConvStatut.COMPLETE, bdqCreeId: res.bdqId, completedAt: new Date() }
                });
            }
        } else if (name === "create_bdq_agent_visit") {
            const bdq = await prisma.bailDeclaratif.create({
                data: {
                    bailleurId: userId,
                    nomLocataireDeclare: input.nom_locataire,
                    telephoneLocataire: "NON_FOURNI",
                    descriptionLogement: input.description_logement,
                    loyerDeclareMensuel: input.loyer_mensuel,
                    dateEntreeEstimee: input.date_entree_estimee ? new Date(input.date_entree_estimee) : null,
                    statut: BdqStatut.PENDING_LOCATAIRE,
                    hashDeclaration: "PENDING_AGENT_VISIT"
                }
            });
            toolResult = { success: true, bdq_id: bdq.id };
            shouldContinue = true;
            await prisma.bdqConversationState.update({
                where: { id: conv.id },
                data: { statut: BdqConvStatut.COMPLETE, bdqCreeId: bdq.id, completedAt: new Date() }
            });
        } else if (name === "get_rent_status") {
            const leases = await prisma.lease.findMany({
                where: { tenantId: userId, status: "ACTIVE" },
                include: { receipts: { orderBy: { periodMonth: "desc" }, take: input.months || 3 } }
            })
            toolResult = { success: true, status: leases.map(l => ({ ref: l.leaseReference, receipts: l.receipts.map(r => ({ month: r.periodMonth, status: r.status })) })) };
            shouldContinue = true;
        } else if (name === "create_rent_claim") {
            const lease = await prisma.lease.findFirst({ where: { tenantId: userId, status: "ACTIVE" } });
            if (lease) {
                const dec = await (prisma as any).smsDeclaration.create({
                    data: { leaseId: lease.id, tenantId: userId, montantDeclare: input.amount, canal: "WHATSAPP", statut: "EN_ATTENTE" }
                });
                toolResult = { success: true, declaration_id: dec.id };
                shouldContinue = true;
            } else {
                toolResult = { success: false, error: "Aucun bail trouvé." };
                shouldContinue = true;
            }
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
            return { message: "Pause enregistrée.", status: "EN_PAUSE" };
        }

        if (shouldContinue) {
            const finalResp = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_API_KEY || "", "anthropic-version": "2023-06-01" },
                body: JSON.stringify({
                    model: CLAUDE_MODEL,
                    max_tokens: 256,
                    system: SYSTEM_PROMPT_QAPRIL,
                    messages: [ ...history, { role: "user", content: [ { type: "tool_result", tool_use_id: toolUseId, content: JSON.stringify(toolResult) } ] } ]
                })
            });
            
            if (finalResp.ok) {
                const finalData = await finalResp.json();
                const finalMsg = finalData.content.find((c: any) => c.type === "text")?.text;
                history.push({ role: "assistant", content: finalData.content });
                await prisma.bdqConversationState.update({
                    where: { id: conv.id },
                    data: {
                        messagesHistory: JSON.stringify(history),
                        tokensEntreeTotal: conv.tokensEntreeTotal + inputTokens + (finalData.usage?.input_tokens || 0),
                        tokensSortieTotal: conv.tokensSortieTotal + outputTokens + (finalData.usage?.output_tokens || 0),
                        coutEstimeFcfa: (conv.coutEstimeFcfa as unknown as number) + costFcfa
                    }
                });
                return { message: finalMsg || "Success", status: "COMPLETE" };
            }
        }
    }

    // Default update
    await prisma.bdqConversationState.update({
        where: { id: conv.id },
        data: {
            messagesHistory: JSON.stringify(history),
            nbEchanges: conv.nbEchanges + 1,
            tokensEntreeTotal: conv.tokensEntreeTotal + inputTokens,
            tokensSortieTotal: conv.tokensSortieTotal + outputTokens,
            coutEstimeFcfa: (conv.coutEstimeFcfa as unknown as number) + costFcfa
        }
    });

    return { message: assistantMessage || "...", status: "EN_COURS" };
}
