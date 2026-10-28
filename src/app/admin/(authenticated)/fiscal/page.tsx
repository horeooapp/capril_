import { getFiscalStats } from "@/actions/fiscal-actions"
import { Shield, TrendingUp, Users, DollarSign, Clock, Hash, Zap } from "lucide-react"
import FiscalReminderButton from "@/components/admin/FiscalReminderButton"

export default async function DGIDashboardPage() {
    const res = await getFiscalStats()
    if (!res.success) return <div className="p-8 text-red-500 font-bold">Erreur de chargement: {String(res.error)}</div>

    const { stats, recentRegistrations } = res

    return (
        <div className="space-y-8 pb-16 relative">
            <div className="fixed inset-0 bg-mesh -z-10 opacity-60"></div>

            <div className="page-header">
                <div>
                    <h1 className="page-title flex items-center gap-2">
                        <Shield className="w-8 h-8 text-[var(--ci-vert)]" />
                        DGI OBSERVATOIRE
                    </h1>
                    <p className="page-sub">Régulation fiscale et enregistrement des baux immobiliers · Module M17</p>
                </div>

                <div className="hidden lg:flex items-center gap-6">
                    <FiscalReminderButton />
                    <div className="date-badge">
                        Mise à jour: {new Date().toLocaleDateString('fr-FR')}
                    </div>
                </div>
            </div>

            <div className="kpi-grid">
                {[
                    { label: "Baux Déclarés", val: stats.totalDossiers, c: "vert" },
                    { label: "Droits Collectés", val: `${stats.totalCollected.toLocaleString()} F`, c: "orange" },
                    { label: "TVA Collectée (18%)", val: `${(stats.totalCollected * 0.18).toLocaleString()} F`, c: "or" },
                    { label: "Pénalités", val: `${stats.totalPenalties.toLocaleString()} F`, c: "gris" },
                ].map((s, idx) => (
                    <div key={idx} className={`kpi-card ${s.c}`}>
                        <div className="kpi-glow"></div>
                        <span className="kpi-label">{s.label}</span>
                        <span className="kpi-val">{s.val}</span>
                    </div>
                ))}
            </div>

            <div className="dash-grid">
                <div className="panel">
                    <div className="panel-header">
                        <h2 className="panel-title">Derniers Enregistrements</h2>
                        <span className="text-[10px] bg-[var(--ci-vert)]/10 text-[var(--ci-vert-light)] px-3 py-1 rounded-full font-black uppercase tracking-widest border border-[var(--ci-vert)]/20">
                            Temps Réel
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="lease-table">
                            <thead>
                                <tr>
                                    <th>Référence</th>
                                    <th>Commune</th>
                                    <th>Loyer</th>
                                    <th>Droits DGI</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentRegistrations?.map((reg: any, idx: number) => (
                                    <tr key={idx}>
                                        <td>
                                            <span className="font-mono text-[var(--ci-orange)]">{reg.lease.leaseReference}</span>
                                        </td>
                                        <td className="text-gray-400">{reg.lease.property.commune}</td>
                                        <td>{reg.loyerMensuel.toLocaleString()} XOF</td>
                                        <td>
                                            <span className="text-[var(--ci-vert-light)] font-bold">{reg.totalDgi.toLocaleString()} XOF</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="right-col">
                    <div className="panel bg-[var(--ci-nuit3)] border-transparent">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--ci-orange)] mb-6 flex items-center gap-2">
                            <Clock className="w-4 h-4" /> Alertes & Rappels
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-[var(--ci-orange)]/10 border border-[var(--ci-orange)]/20 rounded-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-[var(--ci-orange)] opacity-10 rounded-bl-full"></div>
                                <span className="text-[10px] font-black text-white uppercase tracking-widest block">Dossiers en Retard (J+30)</span>
                                <span className="text-2xl font-black text-[var(--ci-orange)] block mt-1">12</span>
                                <p className="text-[10px] text-gray-500 mt-1 pb-1">Baux signés il y a plus de 30 jours sans paiement fiscal.</p>
                            </div>
                            <div className="p-4 bg-[var(--ci-vert)]/10 border border-[var(--ci-vert)]/20 rounded-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-[var(--ci-vert)] opacity-10 rounded-bl-full"></div>
                                <span className="text-[10px] font-black text-white uppercase tracking-widest block mb-2">Accord DGI Mobile</span>
                                <span className="pill pill-active">ACTIF</span>
                                <p className="text-[10px] text-gray-500 mt-2 pb-1">Canal de reversement CinetPay vers e-impôts opérationnel.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
