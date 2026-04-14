"use client"
import { toast } from "sonner";
import { useState, useEffect, useCallback } from "react"
import { 
    getConfigTarifs, updateConfigTarif, 
    getOffresAbonnements, createOffreAbonnement, updateOffreAbonnement,
    getCodesPromo, createCodePromo, toggleCodePromo,
    getTarifsNegocies, createTarifNegocie, deleteTarifNegocie,
    getAuditTarifs 
} from "@/actions/tarifs-admin"
import { Loader2, Settings2, Package, Tag, Handshake, History, Edit2, AlertTriangle, X } from "lucide-react"

enum ActiveTab { GRILLE = "GRILLE", OFFRES = "OFFRES", PROMOS = "PROMOS", NEGOCIES = "NEGOCIES", AUDIT = "AUDIT" }

export default function TarifsClient() {
    const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.GRILLE)
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<{
        grille: any[], offres: any[], promos: any[], negocies: any[], audits: any[]
    }>({ grille: [], offres: [], promos: [], negocies: [], audits: [] })

    const loadData = useCallback(async (tab: ActiveTab) => {
        setLoading(true)
        try {
            if (tab === ActiveTab.GRILLE) setData(d => ({ ...d, grille: [] }))
            const [grilleData, offresData, promosData, negociesData, auditsData] = await Promise.all([
                tab === ActiveTab.GRILLE ? getConfigTarifs() : Promise.resolve(data.grille),
                tab === ActiveTab.OFFRES ? getOffresAbonnements() : Promise.resolve(data.offres),
                tab === ActiveTab.PROMOS ? getCodesPromo() : Promise.resolve(data.promos),
                tab === ActiveTab.NEGOCIES ? getTarifsNegocies() : Promise.resolve(data.negocies),
                tab === ActiveTab.AUDIT ? getAuditTarifs() : Promise.resolve(data.audits),
            ])
            setData({ grille: grilleData || [], offres: offresData || [], promos: promosData || [], negocies: negociesData || [], audits: auditsData || [] })
        } catch (error) { toast.error("Erreur de chargement des données tarifaires") }
        setLoading(false)
    }, [data.grille, data.offres, data.promos, data.negocies, data.audits])

    useEffect(() => { loadData(activeTab) }, [activeTab, loadData])

    return (
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 min-h-[600px] flex flex-col">
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 border-b border-gray-100">
                <TabButton active={activeTab === ActiveTab.GRILLE} onClick={() => setActiveTab(ActiveTab.GRILLE)} icon={<Settings2 size={18} />} label="Grille Globale" />
                <TabButton active={activeTab === ActiveTab.OFFRES} onClick={() => setActiveTab(ActiveTab.OFFRES)} icon={<Package size={18} />} label="Offres Agences" />
                <TabButton active={activeTab === ActiveTab.PROMOS} onClick={() => setActiveTab(ActiveTab.PROMOS)} icon={<Tag size={18} />} label="Codes Promo" />
                <TabButton active={activeTab === ActiveTab.NEGOCIES} onClick={() => setActiveTab(ActiveTab.NEGOCIES)} icon={<Handshake size={18} />} label="Tarifs Négociés" />
                <TabButton active={activeTab === ActiveTab.AUDIT} onClick={() => setActiveTab(ActiveTab.AUDIT)} icon={<History size={18} />} label="Historique (Audit)" />
            </div>

            <div className="flex-1 relative">
                {loading && (
                    <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-sm flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                    </div>
                )}
                {activeTab === ActiveTab.GRILLE && <GrilleView data={data.grille} onRefresh={() => loadData(ActiveTab.GRILLE)} />}
                {activeTab === ActiveTab.OFFRES && <OffresView data={data.offres} onRefresh={() => loadData(ActiveTab.OFFRES)} />}
                {activeTab === ActiveTab.PROMOS && <PromosView data={data.promos} onRefresh={() => loadData(ActiveTab.PROMOS)} />}
                {activeTab === ActiveTab.NEGOCIES && <NegociesView data={data.negocies} onRefresh={() => loadData(ActiveTab.NEGOCIES)} />}
                {activeTab === ActiveTab.AUDIT && <AuditView data={data.audits} />}
            </div>
        </div>
    )
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <button onClick={onClick} className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all whitespace-nowrap ${active ? 'bg-slate-800 text-white shadow-lg' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
            {icon}<span>{label}</span>
        </button>
    )
}

// ==========================================================
// GRILLE VIEW
// ==========================================================
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
        if (!editingCle || !editNote) return setError("La note de modification est obligatoire.")
        setIsSaving(true)
        try {
            await updateConfigTarif(editingCle, editVal, new Date(), editNote)
            toast.success("Tarif mis à jour avec succès"); setEditingCle(null); onRefresh()
        } catch (err: any) { setError(err.message || "Erreur lors de la sauvegarde."); toast.error("Erreur de mise à jour") }
        setIsSaving(false)
    }

    if (data.length === 0) return <div className="text-center py-10 text-gray-400 font-bold">Aucune donnée tarifaire trouvée. (Base non initiée)</div>

    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            <div className="bg-orange-50 border border-amber-600/20 rounded-2xl p-4 flex gap-3 text-amber-600">
                <AlertTriangle className="shrink-0" size={20} />
                <p className="text-xs font-semibold leading-relaxed">Les modifications appliquées ici affectent tous les utilisateurs n'ayant pas de tarif négocié ou d'offre spécifique en cours.</p>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-gray-100">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 uppercase text-[10px] tracking-widest text-slate-800 font-black">
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
                                <td className="p-4 font-medium text-slate-800 max-w-xs">{item.description}</td>
                                <td className="p-4">
                                    {editingCle === item.cle ? (
                                        <input type="number" value={editVal} onChange={e => setEditVal(Number(e.target.value))} className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#1F4E79]" />
                                    ) : (
                                        <span className="font-black text-lg text-amber-600">{Number(item.valeur).toLocaleString()} <span className="text-[10px] uppercase text-gray-400 tracking-widest">FCFA</span></span>
                                    )}
                                </td>
                                <td className="p-4 text-xs font-medium text-gray-400">{new Date(item.modifieAt || item.dateEffet).toLocaleDateString('fr-FR')}</td>
                                <td className="p-4 text-center">
                                    {!item.modifiable ? (
                                        <span className="px-3 py-1 bg-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-full">Verrouillé</span>
                                    ) : editingCle === item.cle ? (
                                        <div className="flex flex-col gap-2">
                                            <input type="text" placeholder="Note (obligatoire)" value={editNote} onChange={e => setEditNote(e.target.value)} className="w-full px-3 py-2 border border-blue-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                                            {error && <span className="text-[10px] text-red-500 font-bold">{error}</span>}
                                            <div className="flex gap-2">
                                                <button onClick={saveEdit} disabled={isSaving} className="flex-1 bg-green-500 text-white text-[10px] font-black uppercase tracking-wider py-2 rounded-lg hover:bg-green-600">Sauver</button>
                                                <button onClick={() => {setEditingCle(null); setError("")}} className="flex-1 bg-gray-200 text-gray-600 text-[10px] font-black uppercase tracking-wider py-2 rounded-lg hover:bg-gray-300">Annuler</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button onClick={() => handleEdit(item)} className="p-2 text-slate-800 hover:bg-blue-50 rounded-xl transition-colors inline-block"><Edit2 size={16} /></button>
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

// ==========================================================
// OFFRES VIEW
// ==========================================================
function OffresView({ data, onRefresh }: { data: any[], onRefresh: () => void }) {
    const [showForm, setShowForm] = useState(false)
    const [editTarget, setEditTarget] = useState<any>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        const payload = {
            code: fd.get("code") as string,
            nomAffichage: fd.get("nomAffichage") as string,
            description: fd.get("description") as string,
            prixBaseTtc: Number(fd.get("prixBaseTtc")),
            quittancesInclus: Number(fd.get("quittancesInclus")),
            prixUniteTtc: Number(fd.get("prixUniteTtc")),
            actif: fd.get("actif") === "on",
            ordreAffichage: Number(fd.get("ordreAffichage"))
        }
        
        try {
            if (editTarget) await updateOffreAbonnement(editTarget.id, payload)
            else await createOffreAbonnement(payload)
            toast.success("Offre enregistrée")
            setShowForm(false); setEditTarget(null); onRefresh()
        } catch(err: any) { toast.error(err.message) }
    }

    return (
        <div className="animate-in fade-in duration-300">
            {showForm ? (
                <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-black text-slate-800 uppercase">{editTarget ? "Modifier" : "Nouvelle"} Offre</h3>
                        <button onClick={() => {setShowForm(false); setEditTarget(null)}} className="text-gray-400 hover:text-red-500"><X size={20}/></button>
                    </div>
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs font-bold text-gray-500">Code (Ex: PRO_STARTER)</label><input name="code" defaultValue={editTarget?.code || ""} className="w-full p-2 border rounded-lg text-sm uppercase" required /></div>
                        <div><label className="text-xs font-bold text-gray-500">Nom Affichage</label><input name="nomAffichage" defaultValue={editTarget?.nomAffichage || ""} className="w-full p-2 border rounded-lg text-sm" required /></div>
                        <div className="col-span-2"><label className="text-xs font-bold text-gray-500">Description</label><input name="description" defaultValue={editTarget?.description || ""} className="w-full p-2 border rounded-lg text-sm" /></div>
                        <div><label className="text-xs font-bold text-gray-500">Prix Base TTC/mois</label><input type="number" name="prixBaseTtc" defaultValue={editTarget?.prixBaseTtc || 0} className="w-full p-2 border rounded-lg text-sm" required /></div>
                        <div><label className="text-xs font-bold text-gray-500">Quittances Incluses (0 = illimité)</label><input type="number" name="quittancesInclus" defaultValue={editTarget?.quittancesInclus || 0} className="w-full p-2 border rounded-lg text-sm" /></div>
                        <div><label className="text-xs font-bold text-gray-500">Prix Unité Dépassé TTC</label><input type="number" name="prixUniteTtc" defaultValue={editTarget?.prixUniteTtc || 0} className="w-full p-2 border rounded-lg text-sm" /></div>
                        <div><label className="text-xs font-bold text-gray-500">Ordre d'affichage</label><input type="number" name="ordreAffichage" defaultValue={editTarget?.ordreAffichage || 1} className="w-full p-2 border rounded-lg text-sm" /></div>
                        <div className="col-span-2 flex items-center gap-2">
                            <input type="checkbox" name="actif" id="actifCb" defaultChecked={editTarget?.actif ?? true} className="w-4 h-4" />
                            <label htmlFor="actifCb" className="text-sm font-bold text-gray-700">Activer l'offre publiquement</label>
                        </div>
                        <div className="col-span-2 flex justify-end">
                            <button type="submit" className="bg-slate-800 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider">Sauvegarder</button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="mb-4 flex justify-end">
                    <button className="bg-slate-800 text-white px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-[#163a5a] shadow-lg" onClick={() => setShowForm(true)}>+ Nouvelle Offre</button>
                </div>
            )}

            {data.length === 0 && !showForm ? <div className="text-center py-10 text-gray-400 font-bold">Aucune offre agence configurée.</div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.map(offre => (
                        <div key={offre.id} className="border-2 border-gray-100 rounded-3xl p-6 relative hover:border-slate-800/30 transition-colors">
                            {!offre.actif && <span className="absolute top-4 right-4 bg-red-100 text-red-600 text-[10px] font-black uppercase px-2 py-1 rounded-full">Inactif</span>}
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic">{offre.nomAffichage}</h3>
                            <p className="font-mono text-[10px] text-gray-400 mb-4">{offre.code}</p>
                            
                            <div className="mb-6">
                                <span className="text-3xl font-black text-amber-600">{Number(offre.prixBaseTtc).toLocaleString()}</span>
                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">FCFA / mois</span>
                            </div>
                            <div className="space-y-3 mb-6 bg-gray-50 rounded-2xl p-4">
                                <div className="flex justify-between items-center text-sm font-bold text-slate-800">
                                    <span>Inclus:</span><span>{offre.quittancesInclus === 0 ? "ILLIMITÉ" : `${offre.quittancesInclus} qtt`}</span>
                                </div>
                                {offre.quittancesInclus > 0 && (
                                    <div className="flex justify-between items-center text-xs font-semibold text-gray-500">
                                        <span>Dépassement:</span><span>{Number(offre.prixUniteTtc)} FCFA/u</span>
                                    </div>
                                )}
                            </div>
                            <button onClick={() => {setEditTarget(offre); setShowForm(true)}} className="w-full py-3 bg-gray-100 text-gray-500 font-black uppercase text-xs tracking-widest rounded-xl hover:bg-gray-200 transition-colors">
                                Modifier
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// ==========================================================
// PROMOS VIEW
// ==========================================================
function PromosView({ data, onRefresh }: { data: any[], onRefresh: () => void }) {
    const [showForm, setShowForm] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        const payload = {
            code: fd.get("code") as string,
            typeRemise: fd.get("typeRemise") as string,
            valeurRemise: Number(fd.get("valeurRemise")),
            maxUtilisations: Number(fd.get("maxUtilisations")) || null,
            dateFin: fd.get("dateFin") ? new Date(fd.get("dateFin") as string) : null,
            actif: true
        }
        try {
            await createCodePromo(payload)
            toast.success("Code promo créé")
            setShowForm(false); onRefresh()
        } catch(err: any) { toast.error(err.message) }
    }

    const toggleStatus = async (id: string, currentActif: boolean) => {
        try {
            await toggleCodePromo(id, !currentActif)
            toast.success("Statut modifié")
            onRefresh()
        } catch(err: any){ toast.error(err.message) }
    }

    return (
        <div className="animate-in fade-in duration-300">
            {showForm ? (
                <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-black text-amber-600 uppercase">Nouveau Code Promo</h3>
                        <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-red-500"><X size={20}/></button>
                    </div>
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs font-bold text-gray-500">Code UNIQUE</label><input name="code" className="w-full p-2 border rounded-lg text-sm uppercase" required /></div>
                        <div>
                            <label className="text-xs font-bold text-gray-500">Type de Remise</label>
                            <select name="typeRemise" className="w-full p-2 border rounded-lg text-sm bg-white" required>
                                <option value="POURCENTAGE">Pourcentage (%)</option><option value="MONTANT_FIXE">Montant Fixe (FCFA)</option>
                            </select>
                        </div>
                        <div><label className="text-xs font-bold text-gray-500">Valeur Remise</label><input type="number" name="valeurRemise" className="w-full p-2 border rounded-lg text-sm" required /></div>
                        <div><label className="text-xs font-bold text-gray-500">Max Utilisations (vide = illimité)</label><input type="number" name="maxUtilisations" className="w-full p-2 border rounded-lg text-sm" /></div>
                        <div className="col-span-2 outline-none"><label className="text-xs font-bold text-gray-500">Date Expiration</label><input type="date" name="dateFin" className="w-full p-2 border rounded-lg text-sm" /></div>
                        <div className="col-span-2 flex justify-end">
                            <button type="submit" className="bg-amber-600 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider">Créer le code</button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="mb-4 flex justify-end">
                    <button className="bg-amber-600 text-white px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-[#A54A0D] shadow-lg" onClick={() => setShowForm(true)}>+ Nouveau Code</button>
                </div>
            )}

            <div className="overflow-x-auto rounded-2xl border border-gray-100">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 uppercase text-[10px] tracking-widest text-slate-800 font-black">
                            <th className="p-4">Code</th>
                            <th className="p-4">Type Remise</th>
                            <th className="p-4">Valeur</th>
                            <th className="p-4">Utilisations</th>
                            <th className="p-4">Validité</th>
                            <th className="p-4 text-right">Statut / Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {data.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="p-4 font-black text-lg text-slate-800 tracking-widest">{item.code}</td>
                                <td className="p-4 font-semibold text-gray-600">{item.typeRemise}</td>
                                <td className="p-4 font-black text-amber-600">{Number(item.valeurRemise)}</td>
                                <td className="p-4 font-medium text-gray-500">{item.nbUtilisations} / {item.maxUtilisations || '∞'}</td>
                                <td className="p-4 text-xs font-semibold text-gray-400">
                                    {new Date(item.dateDebut).toLocaleDateString()} &rarr; {item.dateFin ? new Date(item.dateFin).toLocaleDateString() : 'Illimité'}
                                </td>
                                <td className="p-4 text-right">
                                    <button onClick={() => toggleStatus(item.id, item.actif)} className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full hover:opacity-80 transition-opacity ${item.actif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {item.actif ? "Désactiver" : "Activer"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

// ==========================================================
// NEGOCIES VIEW
// ==========================================================
function NegociesView({ data, onRefresh }: { data: any[], onRefresh: () => void }) {
    const [showForm, setShowForm] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        try {
            await createTarifNegocie(
                fd.get("userId") as string,
                fd.get("type") as string,
                Number(fd.get("prixNegocieTtc")),
                fd.get("note") as string
            )
            toast.success("Tarif négocié appliqué")
            setShowForm(false); onRefresh()
        } catch(err: any) { toast.error(err.message) }
    }

    const disableTarif = async (id: string) => {
        try {
            await deleteTarifNegocie(id)
            toast.success("Dérogation révoquée")
            onRefresh()
        } catch(err: any) { toast.error(err.message) }
    }

    return (
        <div className="animate-in fade-in duration-300">
            {showForm ? (
                <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-black text-slate-800 uppercase">Nouvelle Dérogation</h3>
                        <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-red-500"><X size={20}/></button>
                    </div>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
                        <div><label className="text-xs font-bold text-gray-500">User ID (Cible)</label><input name="userId" className="w-full p-2 border rounded-lg text-sm" required /></div>
                        <div><label className="text-xs font-bold text-gray-500">Type de service</label><input name="type" placeholder="ex: ABONNEMENT_AGENCE, FRAIS_DOSSIER" className="w-full p-2 border rounded-lg text-sm uppercase" required /></div>
                        <div><label className="text-xs font-bold text-gray-500">Nouveau Prix TTC (Fixe)</label><input type="number" name="prixNegocieTtc" className="w-full p-2 border rounded-lg text-sm" required /></div>
                        <div><label className="text-xs font-bold text-gray-500">Raison sociale / Note Justificative</label><input name="note" className="w-full p-2 border rounded-lg text-sm" required /></div>
                        <div className="flex justify-end">
                            <button type="submit" className="bg-slate-800 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider">Forcer le tarif</button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="mb-4 flex justify-end">
                    <button className="bg-slate-800 text-white px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-[#163a5a] shadow-lg" onClick={() => setShowForm(true)}>+ Nouvelle Dérogation</button>
                </div>
            )}
            
            <div className="grid gap-4">
                {data.map(item => (
                    <div key={item.id} className="bg-white border-2 border-gray-100 p-5 rounded-2xl flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="bg-blue-100 text-blue-800 text-[10px] font-black uppercase px-2 py-1 rounded-md">{item.type}</span>
                                <span className="font-bold text-gray-600">Client ID: <span className="font-normal text-gray-400">{item.userId}</span></span>
                            </div>
                            <p className="text-sm font-semibold text-slate-800">Prix Forcé : <span className="text-xl block font-black text-amber-600">{Number(item.prixNegocieTtc).toLocaleString()} FCFA</span></p>
                            <p className="text-xs text-gray-400 mt-2 max-w-lg italic">Raison: "{item.note}"</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-gray-400 mb-2">{new Date(item.dateDebut).toLocaleDateString()}</p>
                            <button className="px-3 py-1 bg-red-50 text-red-600 font-black text-[10px] uppercase tracking-widest hover:bg-red-100 rounded-lg transition-colors" onClick={() => disableTarif(item.id)}>Révoquer la dérogation</button>
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
                        <span className="absolute flex items-center justify-center w-6 h-6 bg-slate-800 rounded-full -start-[0.8rem] ring-4 ring-white text-white"><History size={12} /></span>
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-black text-sm text-slate-800 uppercase tracking-tighter">{log.action} sur {log.tableCible}</h4>
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
