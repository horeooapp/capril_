import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import DiasporaClient from "./diaspora-client"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function DiasporaPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/dashboard/login");
    }

    
    const profile = await prisma.userDiasporaProfile.findUnique({
        where: { userId: session.user.id }
    });

    const isSubscribed = !!profile?.diasporaAbonnement;

    const diasporaData = {
        isSubscribed: isSubscribed,
        profile: {
            planSubscription: profile?.diasporaAbonnement ? "PREMIUM" : null,
            diasporaContactPerson: "Non renseigné",
            diasporaContactPhone: "Non renseigné",
            diasporaWhatsapp: profile?.diasporaWhatsapp || "Non renseigné",
            paysResidence: profile?.paysResidence || "Inconnu",
            fuseauHoraire: profile?.fuseauHoraire || "Africa/Abidjan",
            emailRapportMensuel: profile?.emailRapportMensuel || session.user.email
        },
        reports: [], // To be implemented with real reports storage
        manager: {
            name: "Service Client QAPRIL",
            role: "Dédié Diaspora",
            phone: "+2250500000001",
            photo: "/images/avatars/manager-diaspora.png"
        }
    };

    return <DiasporaClient data={diasporaData} />
}
