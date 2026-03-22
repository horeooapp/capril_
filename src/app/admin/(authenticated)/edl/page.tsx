import { ClipboardCheck, ShieldCheck, FileText, ChevronRight, User, MapPin, Calendar, Fingerprint } from "lucide-react";
import Link from "next/link";
import { getAllEdls } from "@/actions/edl-actions";
import StatCard from "@/components/admin/StatCard";

export const dynamic = "force-dynamic";

export default async function EdlAdminPage() {
    const edls = await getAllEdls();

    const certifiedCount = edls.filter((e: any) => e.statut === "CERTIFIE").length;
    const pendingCount = edls.filter((e: any) => ["EN_COURS", "SOUMIS_LOCATAIRE"].includes(e.statut)).length;

    return (
        <div className="space-y-12 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase mb-2">États des Lieux.</h1>
                    <p className="text-gray-500 font-medium tracking-wide">Surveillance et audit des rapports d&apos;entrée et de sortie certifiés.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-slate-900 text-white rounded-2xl flex items-center gap-2">
                        <Fingerprint size={16} className="text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Protocole SHA-256 Actif</span>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard 
                    title="Total Reports" 
                    value={edls.length.toString()} 
                    icon={<ClipboardCheck size={24} />} 
                    color="slate"
                    trend="Flux Numérique"
                />
                <StatCard 
                    title="Certifiés (Hachés)" 
                    value={certifiedCount.toString()} 
                    icon={<ShieldCheck size={24} />} 
                    color="emerald"
                    trend="Intégrité Garantie"
                />
                <StatCard 
                    title="En Attente" 
                    value={pendingCount.toString()} 
                    icon={<FileText size={24} />} 
                    color="amber"
                    trend="Actions Requises"
                />
            </div>

            {/* EDL Table */}
            <div className="glass-card-premium overflow-hidden rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50">
                <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Registre Global des Constats</h3>
                    <div className="flex gap-2">
                        <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[9px] font-bold uppercase">Entrée</div>
                        <div className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-[9px] font-bold uppercase">Sortie</div>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Réf. Constat</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Bien & Adresse</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Locataire</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Rédacteur</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Certification</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Détails</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {edls.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center text-gray-400 italic font-medium">
                                        Aucun état des lieux n&apos;a encore été initié sur la plateforme.
                                    </td>
                                </tr>
                            ) : (
                                edls.map((edl: any) => (
                                    <tr key={edl.id} className="group hover:bg-slate-50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className={`text-[10px] font-black mb-1 p-1 inline-block rounded ${edl.typeEdl === "ENTREE" ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"}`}>
                                                    {edl.refEdl}
                                                </span>
                                                <span className="text-[9px] text-gray-400 font-bold uppercase">{new Date(edl.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 max-w-[200px]">
                                                <MapPin size={14} className="text-gray-300 shrink-0" />
                                                <span className="text-xs font-bold text-gray-600 truncate">{edl.lease?.property?.address || "Adresse non spécifiée"}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <User size={14} className="text-gray-300" />
                                                <span className="text-xs font-black text-gray-900">{edl.lease?.tenants?.[0]?.fullName || "Locataire Inconnu"}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-medium text-gray-500 italic">via {edl.redigePar?.fullName || "Système"}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            {edl.statut === "CERTIFIE" ? (
                                                <div className="flex items-center gap-2">
                                                    <ShieldCheck size={16} className="text-green-500" />
                                                    <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">SHA-256 VALIDE</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-gray-400">
                                                    <Calendar size={14} />
                                                    <span className="text-[9px] font-bold uppercase tracking-widest">{edl.statut.replace("_", " ")}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <Link 
                                                href={`/admin/edl/${edl.id}`}
                                                className="w-10 h-10 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-slate-900 hover:border-slate-200 hover:shadow-lg transition-all inline-flex items-center justify-center"
                                            >
                                                <ChevronRight size={18} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Audit Log Hint */}
            <div className="p-8 bg-blue-50 border border-blue-100 rounded-[2rem] flex items-center gap-6">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                    <ShieldCheck size={24} />
                </div>
                <div>
                    <h4 className="text-sm font-black text-blue-900 uppercase tracking-tight">Audit d&apos;Intégrité Numérique</h4>
                    <p className="text-xs text-blue-700/70 font-medium">Tous les constats certifiés sont horodatés et protégés contre toute modification ultérieure conformément au protocole de sécurité QAPRIL.</p>
                </div>
            </div>
        </div>
    );
}
