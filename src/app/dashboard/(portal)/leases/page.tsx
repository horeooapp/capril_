import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import LeasesDashboardClient from "./leases-client";

export default async function LeasesDashboardPage() {
    const session = await auth();
    let leases: Record<string, any>[] = [];

    if (session?.user?.id) {
        leases = await prisma.lease.findMany({
            where: {
                OR: [
                    { landlordId: session.user.id },
                    { agentId: session.user.id }
                ],
                status: { not: "ARCHIVED" }
            },
            include: {
                tenant: { select: { firstName: true, lastName: true } }
            },
            take: 20,
            orderBy: { createdAt: "desc" }
        });
    }

    return <LeasesDashboardClient initialLeases={leases} />;
}
