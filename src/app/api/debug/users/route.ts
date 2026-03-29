import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            take: 10,
            select: {
                id: true,
                email: true,
                role: true,
                status: true
            }
        });
        return NextResponse.json({ success: true, count: users.length, users });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message, code: e.code, meta: e.meta });
    }
}
