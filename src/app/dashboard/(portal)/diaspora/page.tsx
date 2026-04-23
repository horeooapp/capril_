import { auth } from "@/auth"
import DiasporaClient from "./diaspora-client"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function DiasporaPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/dashboard/login");
    }

    // Mock UserDiasporaProfile data
    const mockDiasporaData = {
        isSubscribed: false, // Set to false to show the subscription landing page
        profile: {
            planSubscription: null,
            diasporaContactPerson: "Koné Salif (Oncle)",
            diasporaContactPhone: "+2250700000000",
            diasporaWhatsapp: "+33600000000",
            paysResidence: "France",
            fuseauHoraire: "Europe/Paris",
            emailRapportMensuel: session.user.email
        },
        reports: [
            { id: "REP-04-2026", month: "Avril 2026", status: "DISPONIBLE", url: "#" },
            { id: "REP-03-2026", month: "Mars 2026", status: "DISPONIBLE", url: "#" }
        ],
        manager: {
            name: "Marie-Claire Bamba",
            role: "Gestionnaire Senior QAPRIL",
            phone: "+2250500000001",
            photo: "https://i.pravatar.cc/150?u=marie"
        }
    };

    return <DiasporaClient data={mockDiasporaData} />
}
