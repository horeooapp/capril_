import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const session = await auth();
        if (!session || session.user?.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const logs = await prisma.auditLog.findMany({
            take: 20,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { fullName: true } } }
        });

        return NextResponse.json(logs);
    } catch (error) {
        console.error("Audit logs error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
