import React from "react";
import { prisma } from "@/lib/prisma";
import { Database, ShieldCheck, Activity, Key } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const metadata = {
    title: "Data Institutionnelle - QAPRIL",
};

export default async function InstitutionalDashboardPage() {
    const contracts = await prisma.dataLicenseContract.findMany({
        orderBy: { createdAt: "desc" },
        include: { partner: true }
    });

    const activeContracts = contracts.filter(c => c.statut === "ACTIF");
    const totalRevenue = activeContracts.reduce((acc, c) => acc + c.coutAnnuel, 0);
    const totalCalls = contracts.reduce((acc, c) => acc + c.appelsAPIUtilises, 0);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">API & Data Institutionnelle</h1>
                    <p className="text-gray-500 mt-1">Gérez les contrats DaaS (Data as a Service) et les quotas d'API.</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Contrats Actifs</p>
                        <h2 className="text-2xl font-bold text-gray-900">{activeContracts.length}</h2>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                        <Database size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">CA Annuel (Contrats)</p>
                        <h2 className="text-2xl font-bold text-gray-900">{totalRevenue.toLocaleString("fr-FR")} FCFA</h2>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Appels API (Total)</p>
                        <h2 className="text-2xl font-bold text-gray-900">{totalCalls.toLocaleString("fr-FR")}</h2>
                    </div>
                </div>
            </div>

            {/* Contracts Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Licences d'Exploitation Data</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-3">Partenaire</th>
                                <th className="px-6 py-3">Plan</th>
                                <th className="px-6 py-3">Quota API Utilisé</th>
                                <th className="px-6 py-3">Expiration</th>
                                <th className="px-6 py-3 text-right">Statut & Clé</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {contracts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                        Aucun contrat institutionnel.
                                    </td>
                                </tr>
                            ) : (
                                contracts.map((contract) => (
                                    <tr key={contract.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-900">
                                            {contract.partner.nomEntreprise || `${contract.partner.firstName} ${contract.partner.lastName}`}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-indigo-600">
                                            {contract.niveauAcces}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]">
                                                    <div 
                                                        className={`h-2 rounded-full ${contract.appelsAPIUtilises >= contract.quotaMensuel ? 'bg-red-500' : 'bg-blue-500'}`} 
                                                        style={{ width: `${Math.min(100, (contract.appelsAPIUtilises / contract.quotaMensuel) * 100)}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs text-gray-500">{contract.appelsAPIUtilises} / {contract.quotaMensuel}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {format(new Date(contract.dateExpiration), "dd MMM yyyy", { locale: fr })}
                                        </td>
                                        <td className="px-6 py-4 text-right flex flex-col items-end gap-1">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${contract.statut === "ACTIF" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                                {contract.statut}
                                            </span>
                                            <div className="flex items-center gap-1 text-[10px] text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                                <Key size={10} />
                                                <span className="font-mono">{contract.apiKeyClient.substring(0, 8)}...</span>
                                            </div>
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
