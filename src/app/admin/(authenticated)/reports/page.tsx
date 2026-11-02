import { getAgencyAccountingData, getAgenciesList } from "@/actions/accounting-syscohada";
import { getGlobalFinancialReport } from "@/actions/report-actions";
import AdminSyscohadaAccountingClient from "@/components/admin/accounting/AdminSyscohadaAccountingClient";

export const metadata = {
  title: "Comptabilité Générale SYSCOHADA & Bilans | Administration QAPRIL",
  description: "Outil comptable général conforme au SYSCOHADA Révisé (OHADA-UEMOA) : balance, grand livre, compte de résultat, bilan et suivi des garanties mandants."
};

export default async function ReportsAdminPage() {
  const [accountingRes, agenciesList, financialRes] = await Promise.all([
    getAgencyAccountingData(undefined, "ALL"),
    getAgenciesList(),
    getGlobalFinancialReport().catch(() => null)
  ]);

  if (!accountingRes.success || !accountingRes.data) {
    return (
      <div className="p-20 text-center">
        <h1 className="text-xl font-bold text-red-600">Erreur de chargement comptable</h1>
        <p className="text-gray-500">{accountingRes.error || "Impossible de charger la comptabilité SYSCOHADA."}</p>
      </div>
    );
  }

  let reportData: any = null;
  if (financialRes?.success && financialRes?.data) {
    const { financials, performance } = financialRes.data;
    reportData = {
      leaseRef: "SYNTHESE-GLOBALE-QAPRIL",
      landlordName: "ADMINISTRATION QAPRIL",
      propertyAddress: "Ensemble du Parc Immobilier Sécurisé",
      period: new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
      financials: {
        rentReceived: financials.rentReceived,
        agencyFees: financials.agencyFees,
        qaprilFees: financials.qaprilFees,
        tva: financials.tva,
        netToLandlord: financials.netToLandlords
      },
      performance: performance
    };
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-2 md:px-6">
      <AdminSyscohadaAccountingClient 
        initialData={accountingRes.data}
        agenciesList={agenciesList}
        reportData={reportData}
      />
    </div>
  );
}
