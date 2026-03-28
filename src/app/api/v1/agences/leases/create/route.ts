import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createLease } from "@/actions/leases";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  try {
    const data = await req.json();
    
    // Ensure the date is correctly parsed
    if (data.startDate) {
        data.startDate = new Date(data.startDate);
    }

    const result = await createLease(data);
    return NextResponse.json({ success: true, lease: result });
  } catch (error: any) {
    console.error('[API LEASE CREATE ERROR]', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
