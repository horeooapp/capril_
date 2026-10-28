import React from "react";
import { prisma } from "@/lib/prisma";
import { Users, Calendar, CheckCircle, FileText } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const metadata = {
    title: "Assemblées Générales - QAPRIL",
};

export default async function SyndicAGPage() {
    const ags = await prisma.syndicAG.findMany({
        orderBy: { dateAG: "desc" },
        include: { syndicate: true }
    });

    const plannedCount = ags.filter(a => a.statut === "PLANIFIEE").length;
    const completedCount = ags.filter(a => a.statut === "TERMINEE").length;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Assemblées Générales</h1>
                    <p className="text-gray-500 mt-1">Gérez les réunions des copropriétaires et les procès-verbaux.</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total des Assemblées</p>
                        <h2 className="text-2xl font-bold text-gray-900">{ags.length}</h2>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Planifiées (À venir)</p>
                        <h2 className="text-2xl font-bold text-gray-900">{plannedCount}</h2>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Terminées (PV signés)</p>
                        <h2 className="text-2xl font-bold text-gray-900">{completedCount}</h2>
                    </div>
                </div>
            </div>

            {/* AGs Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Agenda et Procès-Verbaux</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-3">Date Prévue</th>
                                <th className="px-6 py-3">Copropriété</th>
                                <th className="px-6 py-3">Ordre du Jour</th>
                                <th className="px-6 py-3">Devis/Facture liée</th>
                                <th className="px-6 py-3 text-right">Statut & PV</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {ags.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                        Aucune assemblée générale prévue.
                                    </td>
                                </tr>
                            ) : (
                                ags.map((ag) => (
                                    <tr key={ag.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                            {format(new Date(ag.dateAG), "dd MMMM yyyy", { locale: fr })}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-indigo-600">
                                            {ag.syndicate.residenceName}
                                        </td>
                                        <td className="px-6 py-4 max-w-[250px] truncate text-gray-500" title={ag.ordre_du_jour}>
                                            {ag.ordre_du_jour}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {ag.montantFacture > 0 ? (
                                                <span className="font-semibold text-gray-900">{ag.montantFacture.toLocaleString("fr-FR")} XOF</span>
                                            ) : (
                                                "-"
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {ag.statut === "TERMINEE" ? (
                                                <span className="inline-flex items-center text-green-700 bg-green-50 px-3 py-1 rounded-full text-xs font-medium border border-green-200">
                                                    <FileText size={14} className="mr-1" />
                                                    PV Enregistré
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center text-amber-700 bg-amber-50 px-3 py-1 rounded-full text-xs font-medium border border-amber-200">
                                                    <Calendar size={14} className="mr-1" />
                                                    Planifiée
                                                </span>
                                            )}
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
