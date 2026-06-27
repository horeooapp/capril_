import React from "react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Search, Activity, UserCheck, AlertOctagon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const metadata = {
    title: "Scoring Locataire - QAPRIL",
};

export default async function ScoringDashboardPage() {
    // Fetch latest scoring histories
    const latestScores = await prisma.tenantScoringHistory.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            tenant: true
        },
        take: 100
    });

    const aaaCount = latestScores.filter(s => s.tranche === "AAA").length;
    const aCount = latestScores.filter(s => s.tranche === "AA" || s.tranche === "A").length;
    const riskCount = latestScores.filter(s => s.tranche === "B" || s.tranche === "C").length;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Scoring Locataires</h1>
                    <p className="text-gray-500 mt-1">Analyse des risques et notation de solvabilité des locataires.</p>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Rechercher un locataire..." 
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                        <UserCheck size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Profils AAA (Excellents)</p>
                        <h2 className="text-2xl font-bold text-gray-900">{aaaCount}</h2>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Profils A / AA (Bons)</p>
                        <h2 className="text-2xl font-bold text-gray-900">{aCount}</h2>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                        <AlertOctagon size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Profils à Risque (B, C)</p>
                        <h2 className="text-2xl font-bold text-gray-900">{riskCount}</h2>
                    </div>
                </div>
            </div>

            {/* Scoring Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Dernières Évaluations</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-3">Date d'Évaluation</th>
                                <th className="px-6 py-3">Locataire</th>
                                <th className="px-6 py-3">Score Brut</th>
                                <th className="px-6 py-3">Tranche</th>
                                <th className="px-6 py-3">Revenus Déclarés</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {latestScores.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                        Aucun score généré.
                                    </td>
                                </tr>
                            ) : (
                                latestScores.map((score) => (
                                    <tr key={score.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {format(new Date(score.createdAt), "dd MMM yyyy, HH:mm", { locale: fr })}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {score.tenant.firstName} {score.tenant.lastName}
                                        </td>
                                        <td className="px-6 py-4 font-mono font-bold text-gray-900">
                                            {score.scoreFinal} <span className="text-xs text-gray-400 font-normal">/ 1000</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold w-12
                                                ${score.tranche === "AAA" ? "bg-green-100 text-green-800" : 
                                                  score.tranche.startsWith("A") ? "bg-blue-100 text-blue-800" : 
                                                  "bg-red-100 text-red-800"}`}
                                            >
                                                {score.tranche}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {score.revenusMoyens.toLocaleString("fr-FR")} FCFA / mois
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
