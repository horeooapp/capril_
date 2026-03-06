import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) return NextResponse.json({ error: "No email provided" }, { status: 400 });

    try {
        const tokens = await prisma.verificationToken.findMany({
            where: { identifier: email }
        });

        return NextResponse.json({
            count: tokens.length,
            tokens: tokens.map(t => ({
                identifier: t.identifier,
                expires: t.expires,
                isExpired: new Date() > t.expires,
                tokenStarts: t.token.substring(0, 5) + "..."
            }))
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
