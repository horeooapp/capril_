import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import InspectionsDashboardClient from "./inspections-client";

export default async function InspectionsDashboardPage() {
    const session = await auth();
    let edls: Record<string, any>[] = [];

    if (session?.user?.id) {
        try {
            edls = await (prisma as any).etatsDesLieux.findMany({
                where: { redigeParId: session.user.id },
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
        } catch (err) {
            console.error("[inspections] Erreur chargement EDL:", err);
            edls = [];
        }
    }

    return <InspectionsDashboardClient initialEdls={edls} />;
}
