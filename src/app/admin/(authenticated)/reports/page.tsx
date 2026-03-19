import ManagementReport from "@/components/reports/ManagementReport";
import { getGlobalFinancialReport } from "@/actions/report-actions";

export default async function ReportsAdminPage() {
  const res = await getGlobalFinancialReport();
  
  if (!res.success || !res.data) {
    return (
      <div className="p-20 text-center">
        <h1 className="text-xl font-bold text-red-600">Erreur de chargement des rapports</h1>
        <p className="text-gray-500">{res.error || "Impossible de récupérer les données financières."}</p>
      </div>
    );
  }

  const { financials, performance } = res.data;

  // Adapter les données pour le composant ManagementReport
  const reportData = {
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

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center">
            <div className="space-y-1">
                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Rapports Financiers</h1>
                <p className="text-sm text-gray-500">Synthèse consolidée du parc immobilier</p>
            </div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm">
                Généré le {new Date().toLocaleDateString()}
            </div>
        </div>
        <ManagementReport data={reportData} />
    </div>
  );
}
