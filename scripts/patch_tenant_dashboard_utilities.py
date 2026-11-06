import sys

path = 'src/app/mon-espace-locataire/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Update lucide imports
if 'Droplets,' not in c:
    c = c.replace('    Sparkles\n} from "lucide-react"', '    Sparkles,\n    Droplets,\n    Smartphone,\n    Wifi\n} from "lucide-react"')

# 2. Add TenantBillsPaymentModal import
if 'TenantBillsPaymentModal' not in c:
    c = c.replace('import PendingLeaseValidationCard from "@/components/tenant/PendingLeaseValidationCard"', 'import PendingLeaseValidationCard from "@/components/tenant/PendingLeaseValidationCard"\nimport TenantBillsPaymentModal from "@/components/dashboard/tenant/TenantBillsPaymentModal"')

# 3. Add modal states in LocataireDashboardPage
if 'utilityModalOpen' not in c:
    c = c.replace('const [isMounted, setIsMounted] = useState(false)', 'const [isMounted, setIsMounted] = useState(false)\n    const [utilityModalOpen, setUtilityModalOpen] = useState(false)\n    const [selectedUtilityCategory, setSelectedUtilityCategory] = useState<any>("EAU")')

# 4. Replace UTILITIES WIDGET
old_widget_start = '{/* UTILITIES WIDGET (4 cols) */}'
old_widget_end = '{/* SMALL ACTION CARD: Receipts (3 cols) */}'
start_idx = c.find(old_widget_start)
end_idx = c.find(old_widget_end)

if start_idx != -1 and end_idx != -1:
    new_widget = '''{/* UTILITIES & FACTURES WIDGET (7 cols) */}
                <BentoItem className="md:col-span-7 p-7 flex flex-col justify-between bg-white border border-slate-200/90" delay={0.3}>
                    <div>
                        <div className="flex items-center justify-between mb-5">
                             <div>
                                 <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                     <Zap size={16} className="text-amber-500" />
                                     <span>Factures & Abonnements · Règlement Express</span>
                                 </h3>
                                 <p className="text-[11px] text-slate-400 mt-0.5">Eau, Électricité, Téléphone et Box Internet</p>
                             </div>
                             <Link 
                                 href="/mon-espace-locataire/factures" 
                                 className="text-[10px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-full transition-colors flex items-center gap-1"
                             >
                                 <span>Voir tout</span>
                                 <ChevronRight size={12} />
                             </Link>
                        </div>

                        {/* 4 Quick Action Buttons */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedUtilityCategory("EAU");
                                    setUtilityModalOpen(true);
                                }}
                                className="p-3 rounded-2xl border border-sky-100 bg-sky-50/60 hover:bg-sky-100/70 transition-all flex flex-col items-center text-center group"
                            >
                                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                                    <Droplets size={18} />
                                </div>
                                <span className="text-[11px] font-black text-slate-800">Eau SODECI</span>
                                <span className="text-[9px] text-slate-400 font-medium">Facture</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedUtilityCategory("ELECTRICITE");
                                    setUtilityModalOpen(true);
                                }}
                                className="p-3 rounded-2xl border border-amber-100 bg-amber-50/60 hover:bg-amber-100/70 transition-all flex flex-col items-center text-center group"
                            >
                                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                                    <Zap size={18} />
                                </div>
                                <span className="text-[11px] font-black text-slate-800">Élec CIE</span>
                                <span className="text-[9px] text-slate-400 font-medium">Carte & Facture</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedUtilityCategory("TELEPHONE");
                                    setUtilityModalOpen(true);
                                }}
                                className="p-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 hover:bg-emerald-100/70 transition-all flex flex-col items-center text-center group"
                            >
                                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                                    <Smartphone size={18} />
                                </div>
                                <span className="text-[11px] font-black text-slate-800">Téléphone</span>
                                <span className="text-[9px] text-slate-400 font-medium">Crédit & Pass</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedUtilityCategory("INTERNET");
                                    setUtilityModalOpen(true);
                                }}
                                className="p-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 hover:bg-indigo-100/70 transition-all flex flex-col items-center text-center group"
                            >
                                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                                    <Wifi size={18} />
                                </div>
                                <span className="text-[11px] font-black text-slate-800">Internet</span>
                                <span className="text-[9px] text-slate-400 font-medium">Box & 4G</span>
                            </button>
                        </div>

                        {/* Recent Payments Preview */}
                        <div className="space-y-2.5">
                            {utilities.length > 0 ? (
                                utilities.slice(0, 2).map((u: any, i: number) => (
                                    <div 
                                        key={i} 
                                        className="flex items-center justify-between p-3 bg-slate-50/80 border border-slate-100 rounded-xl text-xs"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black ${
                                                u.typeUtility === "CIE" ? "bg-amber-100 text-amber-800" : u.typeUtility === "SODECI" ? "bg-sky-100 text-sky-800" : "bg-emerald-100 text-emerald-800"
                                            }`}>
                                                {u.typeUtility?.slice(0, 3)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 font-mono">{u.identifiantCompteur || "Compteur"}</p>
                                                <p className="text-[10px] text-slate-400">{u.moisFacture || "Mois en cours"}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-slate-900 font-mono">{Number(u.montantTotal || 0).toLocaleString()} XOF</p>
                                            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                                {u.statut === "PAYEE" ? "✓ Payée" : "À jour"}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-3 text-center bg-slate-50/60 border border-dashed border-slate-200 rounded-xl">
                                    <p className="text-xs text-slate-400 font-medium">Aucune facture en attente · Vos fluides sont synchronisés</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-5 flex gap-2.5">
                        <button 
                            type="button"
                            onClick={() => {
                                setSelectedUtilityCategory("EAU");
                                setUtilityModalOpen(true);
                            }}
                            className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                        >
                            <span>Régler une facture</span>
                            <ArrowUpRight size={14} />
                        </button>
                        <Link 
                            href="/mon-espace-locataire/factures" 
                            className="py-3 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                        >
                            <span>Historique & Reçus</span>
                        </Link>
                    </div>
                </BentoItem>

                '''
    c = c[:start_idx] + new_widget + c[end_idx:]

# 5. Add TenantBillsPaymentModal at the end
if '<TenantBillsPaymentModal' not in c:
    last_div = '</motion.div>\n    )'
    idx_last = c.rfind(last_div)
    if idx_last != -1:
        modal_tag = '''
            {/* Modal de règlement des factures d'utilités */}
            <TenantBillsPaymentModal
                isOpen={utilityModalOpen}
                onClose={() => setUtilityModalOpen(false)}
                initialCategory={selectedUtilityCategory}
                leaseId={lease?.id}
                defaultPhone={dashboardData.user?.phone || ''}
                onPaymentSuccess={() => window.location.reload()}
            />
        '''
        c = c[:idx_last] + modal_tag + c[idx_last:]

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print('Updated mon-espace-locataire/page.tsx successfully!')

