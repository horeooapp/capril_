import React from "react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, RefreshCw, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default async function FloatPoolDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const pool = await prisma.floatPool.findUnique({
        where: { id },
        include: {
            movements: {
                orderBy: { createdAt: "desc" },
                take: 100 // Show latest 100
            }
        }
    });

    if (!pool) {
        notFound();
    }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8">
            <div className="flex items-center space-x-4">
                <Link 
                    href="/dashboard/float" 
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-600"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Détails du Pool: {pool.partenaireBanque}</h1>
                    <p className="text-gray-500 font-mono text-sm mt-1">REF: {pool.compteRef}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Solde Total Cantonné</h3>
                    <div className="text-3xl font-bold text-gray-900">
                        {pool.soldeTotal.toLocaleString("fr-FR")} <span className="text-xl text-gray-500">XOF</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Taux de Rendement</h3>
                        <div className="text-3xl font-bold text-green-600">
                            {pool.tauxRendement}% <span className="text-xl font-normal text-gray-500">/ an</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Movements History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900">Historique des Mouvements</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-white text-gray-400 font-medium border-b">
                            <tr>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Source</th>
                                <th className="px-6 py-3 text-right">Montant</th>
                                <th className="px-6 py-3 text-right">Solde Après</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {pool.movements.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                        Aucun mouvement enregistré.
                                    </td>
                                </tr>
                            ) : (
                                pool.movements.map((movement) => (
                                    <tr key={movement.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {format(new Date(movement.dateValeur), "dd MMM yyyy, HH:mm", { locale: fr })}
                                        </td>
                                        <td className="px-6 py-4">
                                            {movement.type === "ENTREE" && (
                                                <span className="inline-flex items-center text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full text-xs font-medium border border-green-200">
                                                    <ArrowDownRight size={14} className="mr-1" />
                                                    Dépôt
                                                </span>
                                            )}
                                            {movement.type === "SORTIE" && (
                                                <span className="inline-flex items-center text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full text-xs font-medium border border-red-200">
                                                    <ArrowUpRight size={14} className="mr-1" />
                                                    Retrait
                                                </span>
                                            )}
                                            {movement.type === "INTERET" && (
                                                <span className="inline-flex items-center text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full text-xs font-medium border border-blue-200">
                                                    <RefreshCw size={14} className="mr-1" />
                                                    Rendement
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                            {movement.sourceType}
                                        </td>
                                        <td className={`px-6 py-4 text-right font-semibold ${movement.type === "SORTIE" ? "text-red-600" : "text-green-600"}`}>
                                            {movement.type === "SORTIE" ? "-" : "+"}
                                            {movement.montant.toLocaleString("fr-FR")} XOF
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-900 font-medium">
                                            {movement.soldeApres.toLocaleString("fr-FR")} XOF
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
