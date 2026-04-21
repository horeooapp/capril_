import { NextResponse } from "next/server";
import { RclService } from "@/lib/rcl-service";
import { RentProposalService } from "@/lib/rent-proposal-service";

/**
 * [P3] Compliance Cron Job (RCL 144h & MRL J+5)
 * Automatically closes tickets and applies sanctions for silence.
 */
export async function GET(request: Request) {
  try {
    // Security check
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      const vercelCron = request.headers.get('x-vercel-cron');
      if (!vercelCron) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    console.log(`[Cron Compliance] Processing expirations...`);

    // 1. RCL Tickets (144h)
    const closedRcls = await RclService.processExpirations();

    // 2. Rent Proposals (J+5)
    const expiredProps = await RentProposalService.processExpirations();

    return NextResponse.json({ 
        success: true, 
        closedRcls: closedRcls.length,
        expiredProposals: expiredProps.length
    }, { status: 200 });

  } catch (error: any) {
    console.error("[Cron RCL] Critical failure:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
