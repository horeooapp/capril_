import { NextResponse } from "next/server";
import { signIn } from "@/auth";

export async function GET() {
    try {
        console.log("TEST ROUTE HIT");
        const res = await signIn("nodemailer", { email: "test@qapril.net", redirect: false });
        return NextResponse.json({ success: true, res });
    } catch (e: any) {
        console.error("TEST ROUTE ERROR", e);
        return NextResponse.json({ error: e.message, name: e.name, stack: e.stack });
    }
}
