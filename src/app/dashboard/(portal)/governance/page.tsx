import ManagementReport from "@/components/reports/ManagementReport";
import { getOwnerFinancialReport } from "@/actions/report-actions";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function GovernancePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/dashboard/login");
  }

  const res = await getOwnerFinancialReport(session.user.id);
  
  if (!res.success || !res.data) {
    return (
      <div className="p-20 text-center">
        <h1 className="text-xl font-bold text-red-600">Erreur de chargement</h1>
        <p className="text-gray-500">{res.error || "Impossible de récupérer vos données financières."}</p>
      </div>
    );
  }

  const { financials, performance } = res.data;

  // Adapter les données pour le composant ManagementReport
  const reportData = {
    leaseRef: `GOV-${session.user.id.substring(0, 8).toUpperCase()}`,
    landlordName: session.user.fullName || session.user.email?.split('@')[0] || "Propriétaire QAPRIL",
    propertyAddress: "Ensemble de votre Patrimoine",
    period: new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
    financials: {
      rentReceived: financials.rentReceived,
      agencyFees: financials.agencyFees,
      qaprilFees: financials.qaprilFees,
      tva: financials.tva,
      netToLandlord: financials.netToLandlord
    },
    performance: performance
  };

  return (
    <div className="min-h-screen bg-transparent py-12 px-4">
        <div className="max-w-4xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#1F4E79] rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3">
                        <BarChart3 size={24} />
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-[#1F4E79] tracking-tighter uppercase leading-none italic">Gouvernance.</h1>
                </div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">Analyse consolidée de votre performance immobilière</p>
            </div>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] bg-white/50 backdrop-blur-md px-8 py-4 rounded-[1.5rem] border border-white/40 shadow-2xl shadow-gray-200/20">
                Généré le {new Date().toLocaleDateString('fr-FR')}
            </div>
        </div>
        
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
            <ManagementReport data={reportData} />
        </div>
    </div>
  );
}

import { BarChart3 } from "lucide-react";
