import React from "react";
import { prisma } from "@/lib/prisma";
import { FileText, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const metadata = {
    title: "Appels de Fonds Syndic - QAPRIL",
};

export default async function SyndicFacturesPage() {
    const factures = await prisma.syndicFacture.findMany({
        orderBy: { createdAt: "desc" },
        include: { syndicate: true }
    });

    const totalExpected = factures.reduce((acc, f) => acc + f.montantTotal, 0);
    const totalPaid = factures.filter(f => f.statut === "PAYEE").reduce((acc, f) => acc + f.montantTotal, 0);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Appels de Fonds (Factures)</h1>
                    <p className="text-gray-500 mt-1">Suivi des recouvrements auprès des copropriétaires.</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <FileText size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Appels Émis</p>
                        <h2 className="text-2xl font-bold text-gray-900">{factures.length}</h2>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Montant Total Appelé</p>
                        <h2 className="text-2xl font-bold text-gray-900">{totalExpected.toLocaleString("fr-FR")} XOF</h2>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Montant Recouvré</p>
                        <h2 className="text-2xl font-bold text-gray-900">{totalPaid.toLocaleString("fr-FR")} XOF</h2>
                    </div>
                </div>
            </div>

            {/* Factures Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Historique des Appels de Fonds</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-3">Période</th>
                                <th className="px-6 py-3">Copropriété</th>
                                <th className="px-6 py-3">Lots Facturés</th>
                                <th className="px-6 py-3">Montant / Lot</th>
                                <th className="px-6 py-3">Total Attendu</th>
                                <th className="px-6 py-3 text-right">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {factures.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                                        Aucun appel de fond émis.
                                    </td>
                                </tr>
                            ) : (
                                factures.map((facture) => (
                                    <tr key={facture.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-indigo-600">
                                            {facture.periode}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {facture.syndicate.residenceName}
                                        </td>
                                        <td className="px-6 py-4">
                                            {facture.nbLots} lots
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {facture.montantParLot.toLocaleString("fr-FR")} XOF
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-gray-900">
                                            {facture.montantTotal.toLocaleString("fr-FR")} XOF
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${facture.statut === "PAYEE" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}`}>
                                                {facture.statut}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
