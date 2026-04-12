import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import MandatesDashboardClient from "./mandates-client";

export default async function MandatesDashboardPage() {
    const session = await auth();
    let mandates: Record<string, any>[] = [];

    if (session?.user?.id) {
        mandates = await prisma.mandate.findMany({
            where: {
                agentUserId: session.user.id
            },
            include: {
                property: true
            },
            take: 20,
            orderBy: { createdAt: "desc" }
        });
    }

    return <MandatesDashboardClient initialMandates={mandates} />;
}
