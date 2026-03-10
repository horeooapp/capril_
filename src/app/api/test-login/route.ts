import { NextResponse } from "next/server";
import { signIn } from "@/auth";

export async function GET() {
    try {
        console.log("TEST ROUTE HIT");
        const res = await signIn("nodemailer", { email: "test@qapril.net", redirect: false });
        return NextResponse.json({ success: true, res });
    } catch (e: unknown) {
        console.error("TEST ROUTE ERROR", e);
        const err = e as { message?: string; name?: string; stack?: string };
        return NextResponse.json({ error: err.message, name: err.name, stack: err.stack });
    }
}
