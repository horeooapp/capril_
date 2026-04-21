import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/jwt";
import { payReceipt } from "@/actions/receipt.actions";

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { receiptId, channel } = await req.json();
    if (!receiptId) return NextResponse.json({ error: "Missing receiptId" }, { status: 400 });

    const result = await payReceipt(receiptId, channel);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });

    return NextResponse.json(result);
  } catch (e: any) {
    console.error("[API WALLET] Pay Error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
