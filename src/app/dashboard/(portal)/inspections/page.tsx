import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import InspectionsDashboardClient from "./inspections-client";

export default async function InspectionsDashboardPage() {
    const session = await auth();
    let edls: Record<string, any>[] = [];

    if (session?.user?.id) {
        edls = await (prisma as any).etatsDesLieux.findMany({
            where: {
                redigeParId: session.user.id
            },
            include: {
                lease: {
                    include: {
                        property: true,
                        tenant: true
                    }
                }
            },
            take: 20,
            orderBy: { createdAt: "desc" }
        });
    }

    return <InspectionsDashboardClient initialEdls={edls} />;
}
