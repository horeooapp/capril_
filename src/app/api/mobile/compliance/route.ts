import { NextResponse } from "next/server";
import { RclService } from "@/lib/rcl-service";
import { RentProposalService } from "@/lib/rent-proposal-service";
import { getUserScoreForOwner } from "@/lib/scoring";
import { auth } from "@/auth";

/**
 * [P5.4] MOBILE COMPLIANCE BRIDGE
 * Universal endpoint for P3/P4 features on mobile apps.
 */
export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

    const { action, data } = await request.json();

    try {
        switch (action) {
            case "CREATE_RCL":
                const ticket = await RclService.createTicket({
                    ...data,
                    tenantId: session.user.id
                });
                return NextResponse.json({ success: true, ticket });

            case "TREAT_RENT_PROPOSAL":
                const result = await RentProposalService.handleTenantResponse(
                    data.proposalId,
                    data.accept,
                    data.commentaire
                );
                return NextResponse.json({ success: true, result });

            default:
                return NextResponse.json({ error: "Action non supportée" }, { status: 400 });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const session = await auth();
    if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    try {
        if (action === "GET_ICL_SCORE") {
            const tenantId = searchParams.get("tenantId") || session.user.id;
            const leaseId = searchParams.get("leaseId") || ""; // Required for owner view
            const score = await getUserScoreForOwner(tenantId, leaseId, session.user.id);
            return NextResponse.json({ success: true, score });
        }
        return NextResponse.json({ error: "Action non supportée" }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
