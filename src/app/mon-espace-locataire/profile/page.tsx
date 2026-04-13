import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import ProfileContent from "./ProfileContent"

export const dynamic = "force-dynamic"

export default async function TenantProfilePage() {
    const session = await auth()
    
    const activeRole = (session?.user as any)?.chosenRole || session?.user?.role;
    
    if (!session?.user || activeRole !== "TENANT") {
        redirect("/mon-espace-locataire/login")
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { 
            identityDocuments: { orderBy: { createdAt: "desc" }, take: 1 },
            locataireProfile: true
        }
    })

    const primaryDoc = user?.identityDocuments?.[0];

    const hasLease = await prisma.lease.findFirst({
        where: { tenantId: session.user.id }
    })
    const isIdentityLocked = !!hasLease;

    return (
        <ProfileContent 
            user={user} 
            primaryDoc={primaryDoc} 
            isIdentityLocked={isIdentityLocked} 
        />
    )
}
