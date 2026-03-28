import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { payReceipt } from "@/actions/receipts";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { receiptId, channel } = await req.json();
    if (!receiptId) return NextResponse.json({ error: "Missing receiptId" }, { status: 400 });

    const result = await payReceipt(receiptId, channel);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });

    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
