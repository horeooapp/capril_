import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import MandatesDashboardClient from "./mandates-client";

export default async function MandatesDashboardPage() {
    const session = await auth();
    let mandates: Record<string, any>[] = [];

    let properties: any[] = [];

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

        properties = await prisma.property.findMany({
            take: 50,
            select: { id: true, name: true, address: true, propertyCode: true }
        });
    }

    return <MandatesDashboardClient initialMandates={mandates} properties={properties} />
}
