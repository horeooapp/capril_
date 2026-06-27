import React from "react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Banknote, TrendingUp, Landmark, ArrowRight } from "lucide-react";

export const metadata = {
    title: "Float Engine - QAPRIL",
};

export default async function FloatDashboardPage() {
    // Fetch all pools
    const pools = await prisma.floatPool.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            movements: {
                take: 1,
                orderBy: { createdAt: "desc" }
            }
        }
    });

    const totalFloat = pools.reduce((acc, pool) => acc + pool.soldeTotal, 0);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Float Engine</h1>
                    <p className="text-gray-500 mt-1">Gérez les pools de liquidités et cantonnez les dépôts de sécurité.</p>
                </div>
                {/* We could add a client component button here to Create a new Pool */}
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors">
                    + Nouveau Pool
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <Landmark size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Cantonné (Float)</p>
                        <h2 className="text-2xl font-bold text-gray-900">{totalFloat.toLocaleString("fr-FR")} FCFA</h2>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Rendement Moyen</p>
                        <h2 className="text-2xl font-bold text-gray-900">4.5 %</h2>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                        <Banknote size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Pools Actifs</p>
                        <h2 className="text-2xl font-bold text-gray-900">{pools.length}</h2>
                    </div>
                </div>
            </div>

            {/* Pools Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Pools Bancaires</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-3">Partenaire</th>
                                <th className="px-6 py-3">Référence Compte</th>
                                <th className="px-6 py-3">Taux (%)</th>
                                <th className="px-6 py-3 text-right">Solde Total</th>
                                <th className="px-6 py-3 text-right">Solde Dispo.</th>
                                <th className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {pools.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                                        Aucun pool configuré.
                                    </td>
                                </tr>
                            ) : (
                                pools.map((pool) => (
                                    <tr key={pool.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {pool.partenaireBanque}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs">{pool.compteRef}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                {pool.tauxRendement}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-semibold text-gray-900">
                                            {pool.soldeTotal.toLocaleString("fr-FR")} FCFA
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-500">
                                            {pool.soldeDisponible.toLocaleString("fr-FR")} FCFA
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Link 
                                                href={`/dashboard/float/${pool.id}`}
                                                className="inline-flex items-center justify-center p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                title="Voir les détails"
                                            >
                                                <ArrowRight size={18} />
                                            </Link>
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
