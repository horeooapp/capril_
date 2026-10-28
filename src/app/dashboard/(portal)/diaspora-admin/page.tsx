import React from "react";
import { prisma } from "@/lib/prisma";
import { Globe, CreditCard, DollarSign, ArrowUpRight } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const metadata = {
    title: "Administration Diaspora - QAPRIL",
};

export default async function DiasporaAdminPage() {
    // Fetch all premium subscribers
    const profiles = await prisma.userDiasporaProfile.findMany({
        where: { diasporaAbonnement: { not: null } },
        include: { user: true }
    });

    // Fetch recent payments
    const payments = await prisma.diasporaPaymentHistory.findMany({
        orderBy: { datePaiement: "desc" },
        include: { user: true },
        take: 50
    });

    const mrr = profiles.length * 25000; // Mock: 25k XOF per month
    const totalPayments = payments.reduce((acc, p) => acc + p.montant, 0);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Diaspora Premium</h1>
                    <p className="text-gray-500 mt-1">Gérez les abonnements et paiements de vos clients internationaux.</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <Globe size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Abonnés Premium</p>
                        <h2 className="text-2xl font-bold text-gray-900">{profiles.length}</h2>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">MRR (Revenu Récurrent)</p>
                        <h2 className="text-2xl font-bold text-gray-900">{mrr.toLocaleString("fr-FR")} XOF</h2>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                        <CreditCard size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Volume Total Encaissé</p>
                        <h2 className="text-2xl font-bold text-gray-900">{totalPayments.toLocaleString("fr-FR")} XOF</h2>
                    </div>
                </div>
            </div>

            {/* Subscriptions Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Membres Actifs</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-3">Client</th>
                                <th className="px-6 py-3">Pays de Résidence</th>
                                <th className="px-6 py-3">Abonnement</th>
                                <th className="px-6 py-3">WhatsApp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {profiles.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                                        Aucun abonné actif.
                                    </td>
                                </tr>
                            ) : (
                                profiles.map((profile) => (
                                    <tr key={profile.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {profile.user.firstName} {profile.user.lastName}
                                        </td>
                                        <td className="px-6 py-4">
                                            {profile.paysResidence || "Non spécifié"}
                                        </td>
                                        <td className="px-6 py-4 font-mono font-bold text-indigo-600">
                                            {profile.diasporaAbonnement}
                                        </td>
                                        <td className="px-6 py-4">
                                            {profile.diasporaWhatsapp || "-"}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payments Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Historique des Transactions (Stripe)</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Client</th>
                                <th className="px-6 py-3">ID Transaction</th>
                                <th className="px-6 py-3">Montant</th>
                                <th className="px-6 py-3 text-right">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {payments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                        Aucun paiement enregistré.
                                    </td>
                                </tr>
                            ) : (
                                payments.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {format(new Date(tx.datePaiement), "dd MMM yyyy", { locale: fr })}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {tx.user.firstName} {tx.user.lastName}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                            {tx.stripeSessionId}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-gray-900">
                                            {tx.montant.toLocaleString("fr-FR")} XOF
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tx.statut === "PAID" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                                {tx.statut}
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
