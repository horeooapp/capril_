import ManagementReport from "@/components/reports/ManagementReport";

export default function ReportsAdminPage() {
  // Mock data for demo
  const mockData = {
    leaseRef: "BAIL-2026-R-0892",
    landlordName: "M. Bakary DIALLO",
    propertyAddress: "Résidence Ebony, Appt 4B, Cocody Riviera 3, Abidjan",
    period: "Mars 2026",
    financials: {
      rentReceived: 450000,
      agencyFees: 45000,
      qaprilFees: 9000,
      tva: 1620,
      netToLandlord: 394380,
    },
    performance: [
      { month: "Oct", amount: 450000 },
      { month: "Nov", amount: 450000 },
      { month: "Déc", amount: 450000 },
      { month: "Jan", amount: 420000 },
      { month: "Fév", amount: 450000 },
      { month: "Mar", amount: 450000 },
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center">
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Aperçu du Rapport Billeterie</h1>
            <div className="text-xs font-bold text-gray-400">Généré le {new Date().toLocaleDateString()}</div>
        </div>
        <ManagementReport data={mockData} />
    </div>
  );
}
