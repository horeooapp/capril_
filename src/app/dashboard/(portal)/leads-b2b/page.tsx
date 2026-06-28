import React from "react";
import { prisma } from "@/lib/prisma";
import { Users, Target, Zap, ShoppingCart } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const metadata = {
    title: "Leads B2B Marketplace - QAPRIL",
};

export default async function LeadsB2BPage() {
    // Fetch available leads
    const availableLeads = await prisma.lead.findMany({
        where: { statut: "NOUVEAU" },
        orderBy: { scoreQualite: "desc" },
        take: 50
    });

    // Fetch recent transactions
    const recentTransactions = await prisma.leadTransaction.findMany({
        orderBy: { createdAt: "desc" },
        include: { lead: true },
        take: 10
    });

    const totalLeads = availableLeads.length;
    const hotLeads = availableLeads.filter(l => (l.scoreQualite || 0) >= 70).length;
    const revenue = recentTransactions.reduce((acc, t) => acc + t.montant, 0);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Marché aux Leads (B2B)</h1>
                    <p className="text-gray-500 mt-1">Acquérez des prospects qualifiés pour développer votre agence.</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Leads Disponibles</p>
                        <h2 className="text-2xl font-bold text-gray-900">{totalLeads}</h2>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                        <Zap size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Leads Chauds (Score &gt; 70)</p>
                        <h2 className="text-2xl font-bold text-gray-900">{hotLeads}</h2>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                        <Target size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Revenus Générés (Top 10)</p>
                        <h2 className="text-2xl font-bold text-gray-900">{revenue.toLocaleString("fr-FR")} FCFA</h2>
                    </div>
                </div>
            </div>

            {/* Leads Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Prospects Qualifiés Disponibles</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Localisation</th>
                                <th className="px-6 py-3">Budget (Mensuel)</th>
                                <th className="px-6 py-3">Score Chaleur</th>
                                <th className="px-6 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {availableLeads.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                        Aucun lead disponible pour le moment.
                                    </td>
                                </tr>
                            ) : (
                                availableLeads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {lead.typeRecherche}
                                        </td>
                                        <td className="px-6 py-4">
                                            {lead.commune || "Non spécifié"}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-gray-900">
                                            {lead.budgetMax?.toLocaleString("fr-FR")} FCFA
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-[80px]">
                                                    <div 
                                                        className={`h-2.5 rounded-full ${lead.scoreChaleur >= 70 ? 'bg-orange-500' : lead.scoreChaleur >= 40 ? 'bg-yellow-400' : 'bg-blue-400'}`} 
                                                        style={{ width: `${Math.min(100, Math.max(0, lead.scoreChaleur))}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs font-medium text-gray-500">{lead.scoreChaleur}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">
                                                <ShoppingCart size={16} className="mr-1.5" />
                                                Acheter
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recent Transactions Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Dernières Transactions</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Lead ID</th>
                                <th className="px-6 py-3">Agence ID</th>
                                <th className="px-6 py-3 text-right">Montant</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {recentTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                                        Aucune transaction récente.
                                    </td>
                                </tr>
                            ) : (
                                recentTransactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {format(new Date(tx.dateAchat), "dd MMM yyyy", { locale: fr })}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                            {tx.leadId}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                            {tx.agenceId}
                                        </td>
                                        <td className="px-6 py-4 text-right font-semibold text-green-600">
                                            +{tx.montantPaye.toLocaleString("fr-FR")} FCFA
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
