import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAgencyAccountingData } from "@/actions/accounting-syscohada";
import AgencySyscohadaAccountingClient from "@/components/dashboard/accounting/AgencySyscohadaAccountingClient";

export const metadata = {
    title: "Comptabilité Générale (SYSCOHADA) | QAPRIL",
    description: "Comptabilité générale d'agence immobilière selon les normes SYSCOHADA Révisé (OHADA / UEMOA)."
};

export default async function AgencyComptabilitePage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/dashboard/login");
    }

    const userId = session.user.id;
    const userRole = (session.user.role || "").toUpperCase();

    // Récupérer le nom de l'agence ou de l'administrateur
    const user = await (prisma as any).user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            agencyConfig: true,
            role: true
        }
    });

    const agencyConfig = (user?.agencyConfig as any) || {};
    const agencyName = agencyConfig.agencyName || 
        (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (session.user.name || undefined));

    const accountingRes = await getAgencyAccountingData();

    if (!accountingRes.success || !accountingRes.data) {
        return (
            <div className="p-8 max-w-4xl mx-auto">
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-2xl">
                    <h2 className="text-lg font-bold mb-2">Erreur de chargement comptable</h2>
                    <p className="text-sm">{accountingRes.error || "Impossible de charger la comptabilité de l'agence."}</p>
                </div>
            </div>
        );
    }

    return (
        <AgencySyscohadaAccountingClient 
            initialData={accountingRes.data}
            agencyName={agencyName}
        />
    );
}

