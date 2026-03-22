"use client"

import { useState, useEffect } from "react"
import { 
    getConfigTarifs, 
    updateConfigTarif, 
    getOffresAbonnements, 
    getCodesPromo, 
    getTarifsNegocies, 
    getAuditTarifs 
} from "@/actions/tarifs-admin"
import { Loader2, Settings2, Package, Tag, Handshake, History, Edit2, AlertTriangle, Search } from "lucide-react"

enum ActiveTab {
    GRILLE = "GRILLE",
    OFFRES = "OFFRES",
    PROMOS = "PROMOS",
    NEGOCIES = "NEGOCIES",
    AUDIT = "AUDIT"
}

export default function TarifsClient() {
    const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.GRILLE)
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<{
        grille: any[],
        offres: any[],
        promos: any[],
        negocies: any[],
        audits: any[]
    }>({
        grille: [], offres: [], promos: [], negocies: [], audits: []
    })

    const loadData = async (tab: ActiveTab) => {
        setLoading(true)
        try {
            if (tab === ActiveTab.GRILLE) setData(d => ({ ...d, grille: [] }))
            // Simulate fetching all data based on tab (in a real app we fetch only what's needed)
            const [grilleData, offresData, promosData, negociesData, auditsData] = await Promise.all([
                tab === ActiveTab.GRILLE ? getConfigTarifs() : Promise.resolve(data.grille),
                tab === ActiveTab.OFFRES ? getOffresAbonnements() : Promise.resolve(data.offres),
                tab === ActiveTab.PROMOS ? getCodesPromo() : Promise.resolve(data.promos),
                tab === ActiveTab.NEGOCIES ? getTarifsNegocies() : Promise.resolve(data.negocies),
                tab === ActiveTab.AUDIT ? getAuditTarifs() : Promise.resolve(data.audits),
            ])
            setData({
                grille: grilleData || [],
                offres: offresData || [],
                promos: promosData || [],
                negocies: negociesData || [],
                audits: auditsData || []
            })
        } catch (error) {
            console.error("Failed to load tariffs data", error)
        }
        setLoading(false)
    }

    useEffect(() => {
        loadData(activeTab)
    }, [activeTab])

    return (
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 min-h-[600px] flex flex-col">
            
            {/* Tabs Navigation */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 border-b border-gray-100">
                <TabButton 
                    active={activeTab === ActiveTab.GRILLE} 
                    onClick={() => setActiveTab(ActiveTab.GRILLE)} 
                    icon={<Settings2 size={18} />} 
                    label="Grille Globale" 
                />
                <TabButton 
                    active={activeTab === ActiveTab.OFFRES} 
                    onClick={() => setActiveTab(ActiveTab.OFFRES)} 
                    icon={<Package size={18} />} 
                    label="Offres Agences" 
                />
                <TabButton 
                    active={activeTab === ActiveTab.PROMOS} 
                    onClick={() => setActiveTab(ActiveTab.PROMOS)} 
                    icon={<Tag size={18} />} 
                    label="Codes Promo" 
                />
                <TabButton 
                    active={activeTab === ActiveTab.NEGOCIES} 
                    onClick={() => setActiveTab(ActiveTab.NEGOCIES)} 
                    icon={<Handshake size={18} />} 
                    label="Tarifs Négociés" 
                />
                <TabButton 
                    active={activeTab === ActiveTab.AUDIT} 
                    onClick={() => setActiveTab(ActiveTab.AUDIT)} 
                    icon={<History size={18} />} 
                    label="Historique (Audit)" 
                />
            </div>

            {/* Content Area */}
            <div className="flex-1 relative">
                {loading && (
                    <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-sm flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-[#C55A11]" />
                    </div>
                )}
                
                {activeTab === ActiveTab.GRILLE && <GrilleView data={data.grille} onRefresh={() => loadData(ActiveTab.GRILLE)} />}
                {activeTab === ActiveTab.OFFRES && <OffresView data={data.offres} />}
                {activeTab === ActiveTab.PROMOS && <PromosView data={data.promos} />}
                {activeTab === ActiveTab.NEGOCIES && <NegociesView data={data.negocies} />}
                {activeTab === ActiveTab.AUDIT && <AuditView data={data.audits} />}
            </div>

        </div>
    )
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all whitespace-nowrap
                ${active ? 'bg-[#1F4E79] text-white shadow-lg' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
        >
            {icon}
            <span>{label}</span>
        </button>
    )
}

// -------------------------------------------------------------
// VIEWS COMPONENTS
// -------------------------------------------------------------

function GrilleView({ data, onRefresh }: { data: any[], onRefresh: () => void }) {
    const [editingCle, setEditingCle] = useState<string | null>(null)
    const [editVal, setEditVal] = useState<number>(0)
    const [editNote, setEditNote] = useState<string>("")
    const [error, setError] = useState("")
    const [isSaving, setIsSaving] = useState(false)

    const handleEdit = (item: any) => {
        if (!item.modifiable) return
        setEditingCle(item.cle)
        setEditVal(Number(item.valeur))
        setEditNote("")
        setError("")
    }

    const saveEdit = async () => {
        if (!editingCle || !editNote) {
            setError("La note de modification est obligatoire.")
            return
        }
        setIsSaving(true)
        try {
            await updateConfigTarif(editingCle, editVal, new Date(), editNote)
            setEditingCle(null)
            onRefresh()
        } catch (err: any) {
            setError(err.message || "Erreur lors de la sauvegarde.")
        }
        setIsSaving(false)
    }

    if (data.length === 0) return <div className="text-center py-10 text-gray-400 font-bold">Aucune donnée tarifaire trouvée. (Base non initiée)</div>

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-orange-50 border border-[#C55A11]/20 rounded-2xl p-4 flex gap-3 text-[#C55A11]">
                <AlertTriangle className="shrink-0" size={20} />
                <p className="text-xs font-semibold leading-relaxed">
                    Les modifications appliquées ici affectent tous les utilisateurs n'ayant pas de tarif négocié ou d'offre spécifique en cours. 
                    Le BDQ est verrouillé contractuellement à 0 FCFA.
                </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-gray-100">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 uppercase text-[10px] tracking-widest text-[#1F4E79] font-black">
                            <th className="p-4 rounded-tl-2xl">Clé Tarif</th>
                            <th className="p-4">Description</th>
                            <th className="p-4">Valeur Actuelle</th>
                            <th className="p-4">Dernière Modif</th>
                            <th className="p-4 text-center rounded-tr-2xl">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {data.map((item) => (
                            <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${editingCle === item.cle ? 'bg-blue-50/50' : ''}`}>
                                <td className="p-4 font-mono text-xs font-bold text-gray-600">{item.cle}</td>
                                <td className="p-4 font-medium text-[#1F4E79] max-w-xs">{item.description}</td>
                                <td className="p-4">
                                    {editingCle === item.cle ? (
                                        <input 
                                            type="number" 
                                            value={editVal}
                                            onChange={e => setEditVal(Number(e.target.value))}
                                            className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
                                        />
                                    ) : (
                                        <span className="font-black text-lg text-[#C55A11]">{Number(item.valeur).toLocaleString()} <span className="text-[10px] uppercase text-gray-400 tracking-widest">FCFA</span></span>
                                    )}
                                </td>
                                <td className="p-4 text-xs font-medium text-gray-400">
                                    {new Date(item.modifieAt || item.dateEffet).toLocaleDateString('fr-FR')}
                                </td>
                                <td className="p-4 text-center">
                                    {!item.modifiable ? (
                                        <span className="px-3 py-1 bg-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-full">Verrouillé</span>
                                    ) : editingCle === item.cle ? (
                                        <div className="flex flex-col gap-2">
                                            <input 
                                                type="text" 
                                                placeholder="Note (obligatoire)" 
                                                value={editNote}
                                                onChange={e => setEditNote(e.target.value)}
                                                className="w-full px-3 py-2 border border-blue-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                            {error && <span className="text-[10px] text-red-500 font-bold">{error}</span>}
                                            <div className="flex gap-2">
                                                <button onClick={saveEdit} disabled={isSaving} className="flex-1 bg-green-500 text-white text-[10px] font-black uppercase tracking-wider py-2 rounded-lg hover:bg-green-600 disabled:opacity-50">Sauver</button>
                                                <button onClick={() => {setEditingCle(null); setError("")}} className="flex-1 bg-gray-200 text-gray-600 text-[10px] font-black uppercase tracking-wider py-2 rounded-lg hover:bg-gray-300">Annuler</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => handleEdit(item)}
                                            className="p-2 text-[#1F4E79] hover:bg-blue-50 rounded-xl transition-colors inline-block"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function OffresView({ data }: { data: any[] }) {
    if (data.length === 0) return <div className="text-center py-10 text-gray-400 font-bold">Aucune offre agence configurée.</div>
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {data.map(offre => (
                <div key={offre.id} className="border-2 border-gray-100 rounded-3xl p-6 relative hover:border-[#1F4E79]/30 transition-colors">
                    {!offre.actif && <span className="absolute top-4 right-4 bg-red-100 text-red-600 text-[10px] font-black uppercase px-2 py-1 rounded-full">Inactif</span>}
                    <h3 className="text-xl font-black text-[#1F4E79] uppercase tracking-tighter italic">{offre.nomAffichage}</h3>
                    <p className="font-mono text-[10px] text-gray-400 mb-4">{offre.code}</p>
                    
                    <div className="mb-6">
                        <span className="text-3xl font-black text-[#C55A11]">{Number(offre.prixBaseTtc).toLocaleString()}</span>
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">FCFA / mois</span>
                    </div>

                    <div className="space-y-3 mb-6 bg-gray-50 rounded-2xl p-4">
                        <div className="flex justify-between items-center text-sm font-bold text-[#1F4E79]">
                            <span>Inclus:</span>
                            <span>{offre.quittancesInclus === 0 ? "ILLIMITÉ" : `${offre.quittancesInclus} quittances`}</span>
                        </div>
                        {offre.quittancesInclus > 0 && (
                            <div className="flex justify-between items-center text-xs font-semibold text-gray-500">
                                <span>Dépassement:</span>
                                <span>{Number(offre.prixUniteTtc)} FCFA / u</span>
                            </div>
                        )}
                    </div>

                    <button className="w-full py-3 bg-gray-100 text-gray-500 font-black uppercase text-xs tracking-widest rounded-xl hover:bg-gray-200 transition-colors">
                        Modifier l'offre
                    </button>
                </div>
            ))}
        </div>
    )
}

function PromosView({ data }: { data: any[] }) {
    if (data.length === 0) return <div className="text-center py-10 text-gray-400 font-bold">Aucun code promotionnel existant.</div>
    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="mb-4 flex justify-end">
                <button className="bg-[#C55A11] text-white px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-[#A54A0D] shadow-lg">
                    + Nouveau Code
                </button>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-gray-100">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 uppercase text-[10px] tracking-widest text-[#1F4E79] font-black">
                            <th className="p-4">Code</th>
                            <th className="p-4">Type Remise</th>
                            <th className="p-4">Valeur</th>
                            <th className="p-4">Utilisations</th>
                            <th className="p-4">Validité</th>
                            <th className="p-4">Statut</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {data.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="p-4 font-black text-lg text-[#1F4E79] tracking-widest">{item.code}</td>
                                <td className="p-4 font-semibold text-gray-600">{item.typeRemise}</td>
                                <td className="p-4 font-black text-[#C55A11]">{Number(item.valeurRemise)}</td>
                                <td className="p-4 font-medium text-gray-500">
                                    {item.nbUtilisations} / {item.maxUtilisations || '∞'}
                                </td>
                                <td className="p-4 text-xs font-semibold text-gray-400">
                                    {new Date(item.dateDebut).toLocaleDateString()} &rarr; {item.dateFin ? new Date(item.dateFin).toLocaleDateString() : 'Illimité'}
                                </td>
                                <td className="p-4">
                                    {item.actif ? 
                                        <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-full">Actif</span> : 
                                        <span className="px-3 py-1 bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-widest rounded-full">Inactif</span>
                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function NegociesView({ data }: { data: any[] }) {
    if (data.length === 0) return <div className="text-center py-10 text-gray-400 font-bold">Aucun tarif négocié actif.</div>
    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="mb-4 flex justify-end">
                <button className="bg-[#1F4E79] text-white px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-[#163a5a] shadow-lg">
                    + Nouvelle Dérogation
                </button>
            </div>
            <div className="grid gap-4">
                {data.map(item => (
                    <div key={item.id} className="bg-white border-2 border-gray-100 p-5 rounded-2xl flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="bg-blue-100 text-blue-800 text-[10px] font-black uppercase px-2 py-1 rounded-md">{item.type}</span>
                                <span className="font-bold text-gray-600">Client ID : {item.userId}</span>
                            </div>
                            <p className="text-sm font-semibold text-[#1F4E79]">Prix Négocié : <span className="text-xl block font-black text-[#C55A11]">{Number(item.prixNegocieTtc).toLocaleString()} FCFA</span></p>
                            <p className="text-xs text-gray-400 mt-2 max-w-lg italic">"{item.note}"</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-gray-400 mb-1">
                                {new Date(item.dateDebut).toLocaleDateString()} - {item.dateFin ? new Date(item.dateFin).toLocaleDateString() : 'Permanent'}
                            </p>
                            <button className="mt-2 text-red-500 font-black text-[10px] uppercase tracking-widest hover:underline">Révoquer</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function AuditView({ data }: { data: any[] }) {
    if (data.length === 0) return <div className="text-center py-10 text-gray-400 font-bold">Aucun historique d'audit.</div>
    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="relative border-s-2 border-gray-100 ms-6 space-y-6">
                {data.map(log => (
                    <div key={log.id} className="relative ps-8">
                        <span className="absolute flex items-center justify-center w-6 h-6 bg-[#1F4E79] rounded-full -start-[0.8rem] ring-4 ring-white text-white">
                            <History size={12} />
                        </span>
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-black text-sm text-[#1F4E79] uppercase tracking-tighter">{log.action} sur {log.tableCible}</h4>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(log.createdAt).toLocaleString()}</span>
                            </div>
                            <p className="text-xs font-mono text-gray-500 bg-white p-3 rounded-xl border border-gray-100 overflow-x-auto whitespace-pre-wrap">
                                {JSON.stringify({ avant: log.avant, apres: log.apres }, null, 2)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
