import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import VaultClient from "./vault-client"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function VaultPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/dashboard/login");
    }

    // Fetch real Vault/CDC data
    const properties = await prisma.property.findMany({
        where: { ownerUserId: session.user.id },
        include: {
            leases: {
                include: {
                    tenant: true,
                    cdcDeposits: true
                }
            }
        }
    });

    const allDeposits = properties.flatMap(p => 
        (p.leases || []).flatMap(l => 
            (l.cdcDeposits || []).map((d: any) => ({
                id: d.id,
                locataire: `${l.tenant?.firstName} ${l.tenant?.lastName}`,
                bien: p.name,
                montant: d.amount,
                status: d.status,
                hash: d.proofHash,
                dateConsignation: d.consignedAt ? d.consignedAt.toISOString() : null
            }))
        )
    );

    const vaultData = {
        totalSecuredFcfa: allDeposits.reduce((sum: number, d: any) => sum + (d.status === 'CONSIGNED' ? d.montant : 0), 0),
        totalPendingFcfa: allDeposits.reduce((sum: number, d: any) => sum + (d.status === 'PENDING' || d.status === 'AWAITING_PAYMENT' ? d.montant : 0), 0),
        cautions: allDeposits
    };

    return <VaultClient data={vaultData} />
}
