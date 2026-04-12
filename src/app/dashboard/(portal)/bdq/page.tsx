import React from "react"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import BdqAiCockpitClient from "./bdq-client"

export const dynamic = 'force-dynamic'

export default async function BdqPage() {
    const session = await auth()
    if (!session || !session.user) return null

    // Get real AI loop conversations
    const dbConvs = await prisma.bdqConversationState.findMany({
        where: { bailleurId: session.user.id },
        orderBy: { updatedAt: 'desc' }
    });

    const conversations = dbConvs.map(c => ({
        id: c.id,
        phone: c.canalRef,
        status: c.statut,
        botExtracted: {
            nom: c.nomLocataireExtrait,
            loyer: c.loyerExtrait,
            description: c.descriptionLogementExtrait,
        },
        stats: {
            echanges: c.nbEchanges,
            tokens: (c.tokensEntreeTotal || 0) + (c.tokensSortieTotal || 0),
            cost: Number(c.coutEstimeFcfa || 0)
        }
    }));

    return (
        <BdqAiCockpitClient initialConversations={conversations} />
    )
}
