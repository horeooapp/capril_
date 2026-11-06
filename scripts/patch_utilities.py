import re

# 1. Update utilities-client.tsx
with open("src/app/dashboard/(portal)/utilities/utilities-client.tsx", "r", encoding="utf-8") as f:
    u = f.read()

u = u.replace(
    'const [modalOpen, setModalOpen] = useState(false)',
    'const [modalOpen, setModalOpen] = useState(false)\n    const [selectedFacture, setSelectedFacture] = useState<any>(null)'
)

u = u.replace(
    '<button className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-colors">\n                                                Détails\n                                            </button>',
    '<button onClick={() => setSelectedFacture(fac)} className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-colors">\n                                                Détails\n                                            </button>'
)

details_modal = """
            {/* MODAL DETAILS FACTURE */}
            {selectedFacture && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedFacture(null)} />
                    <div className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl p-6 sm:p-8 flex flex-col z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${selectedFacture.type === 'CIE' ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'}`}>
                                    Facture {selectedFacture.type}
                                </span>
                                <h3 className="text-xl font-black text-slate-900 mt-2">{selectedFacture.property?.titre || selectedFacture.propriete?.titre || "Bien immobilier"}</h3>
                                <p className="text-xs text-gray-500">Période : {selectedFacture.mois || "Mois en cours"}</p>
                            </div>
                            <button onClick={() => setSelectedFacture(null)} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center font-bold text-gray-400 hover:text-gray-900">✕</button>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-6 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Montant total</span>
                                <span className="text-lg font-black text-slate-900">{selectedFacture.montantGlobal?.toLocaleString("fr-FR")} XOF</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-gray-500">
                                <span>Mode de calcul</span>
                                <span className="font-bold text-slate-700">{selectedFacture.modeRepartition || "Prorata"}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-gray-500">
                                <span>Statut global</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${selectedFacture.status === 'PAYE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{selectedFacture.status || "En cours"}</span>
                            </div>
                        </div>

                        <div className="space-y-2 mb-6 max-h-48 overflow-y-auto">
                            <p className="text-xs font-black uppercase tracking-wider text-gray-400">Répartition par locataire</p>
                            {selectedFacture.repartitions && selectedFacture.repartitions.length > 0 ? (
                                selectedFacture.repartitions.map((rep: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center p-3 bg-white rounded-xl border border-gray-100 text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2.5 h-2.5 rounded-full ${rep.status === 'PAYEE' ? 'bg-emerald-500' : 'bg-rose-400'}`} />
                                            <span className="font-bold text-slate-800">{rep.locataireName || `Locataire #${idx+1}`}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-black text-slate-900">{rep.montant?.toLocaleString("fr-FR")} XOF</span>
                                            <span className={`block text-[9px] font-bold ${rep.status === 'PAYEE' ? 'text-emerald-600' : 'text-rose-500'}`}>{rep.status}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-gray-400 italic">Aucune sous-répartition enregistrée.</p>
                            )}
                        </div>

                        <button onClick={() => setSelectedFacture(null)} className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest hover:bg-slate-800 transition-colors">
                            Fermer
                        </button>
                    </div>
                </div>
            )}
"""

u = u.replace('{/* MODAL AJOUT FACTURE */}', details_modal + '\n            {/* MODAL AJOUT FACTURE */}')

with open("src/app/dashboard/(portal)/utilities/utilities-client.tsx", "w", encoding="utf-8") as f:
    f.write(u)

print("utilities-client.tsx patched successfully!")

