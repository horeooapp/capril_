"use client"

import { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import { creerBien, getMyParentStructures, TypeStructure } from "@/actions/property.actions"

export default function NewPropertyClient() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState("")
    
    // C-09 Hierarchy State
    const [structureCategory, setStructureCategory] = useState<'INDEPENDANT' | 'PARENT' | 'ENFANT'>('INDEPENDANT')
    const [typeStructure, setTypeStructure] = useState<TypeStructure>('INDEPENDANT')
    const [propertyType, setPropertyType] = useState('STUDIO') // "Logement principal" 
    
    // Parent Data
    const [parents, setParents] = useState<any[]>([])
    const [selectedParentId, setSelectedParentId] = useState<string>("")
    const [isLoadingParents, setIsLoadingParents] = useState(false)

    useEffect(() => {
        if (structureCategory === 'ENFANT') {
            setIsLoadingParents(true)
            getMyParentStructures().then(data => {
                setParents(data)
                setIsLoadingParents(false)
            }).catch(() => setIsLoadingParents(false))
        }
    }, [structureCategory])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError("")

        const formData = new FormData(e.currentTarget)
        const name = formData.get("name") as string
        const unitLabel = formData.get("unitLabel") as string
        const parentId = structureCategory === 'ENFANT' ? (formData.get("parentPropertyId") as string) : undefined

        // Determine correct typeStructure
        let finalTypeStructure: TypeStructure = 'INDEPENDANT';
        if (structureCategory === 'PARENT') {
            finalTypeStructure = formData.get("parentType") as TypeStructure;
        } else if (structureCategory === 'ENFANT') {
            // Find parent and inherit its typeStructure, or define ENFANT structure
            // Wait, "typeStructure" in creerBien represents the CURRENT property's structure.
            // If it's an infant, the user prompt states the ENFANT ALSO has typeStructure?
            // "Type selectionne : Appartement (enfant imm) -> parentType = IMMEUBLE".
            // Actually, for an enfant, typeStructure in DB is IMMEUBLE, but it has a parent.
            // "TypeStructure: INDEPENDANT | COUR_COMMUNE | IMMEUBLE | RESIDENCE"
            // If I create an Apt in an IMMEUBLE, the apt is also an IMMEUBLE but with parentPropertyId != null.
            const parent = parents.find(p => p.id === parentId);
            finalTypeStructure = parent?.typeStructure || 'INDEPENDANT';
        }

        const data = {
            typeStructure: finalTypeStructure,
            name: structureCategory !== 'ENFANT' ? name : undefined,
            unitLabel: structureCategory === 'ENFANT' ? unitLabel : undefined,
            parentPropertyId: parentId,
            commune: formData.get("commune") as string,
            address: formData.get("addressLine1") as string,
            propertyType: (formData.get("propertyType") as string) || (finalTypeStructure === 'INDEPENDANT' ? 'STUDIO' : 'APARTMENT'),
            declaredRentFcfa: parseInt(formData.get("rent") as string) || undefined,
            superficieM2: parseFloat(formData.get("area") as string) || undefined,

            // Bulk Creation Fields
            nbUnits: structureCategory === 'PARENT' ? (parseInt(formData.get("nbUnits") as string) || 0) : 0,
            unitRent: structureCategory === 'PARENT' ? (parseInt(formData.get("unitRent") as string) || 0) : 0,
        }

        startTransition(async () => {
            const result: any = await creerBien(data as any)
            if (result?.error) {
                setError(result.error)
            } else {
                router.push("/dashboard/properties")
                router.refresh()
            }
        })
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 py-8 px-4">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Ajouter un bien</h1>
                <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 text-sm font-medium">
                    Annuler
                </button>
            </div>

            <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-6 animate-shake">
                                {error}
                            </div>
                        )}

                        <div className="space-y-3 mb-8">
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
                                Architecture du bien
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <button type="button" onClick={() => setStructureCategory('INDEPENDANT')} className={`p-4 border rounded-xl text-left transition-all ${structureCategory === 'INDEPENDANT' ? 'border-[#FF8200] bg-orange-50 ring-2 ring-orange-200' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                                    <div className="text-sm font-bold text-gray-900 mb-1">🏡 Indépendant</div>
                                    <div className="text-xs text-gray-500 leading-snug">Villa seule, studio autonome (sans structure parente)</div>
                                </button>
                                <button type="button" onClick={() => setStructureCategory('PARENT')} className={`p-4 border rounded-xl text-left transition-all ${structureCategory === 'PARENT' ? 'border-sky-500 bg-sky-50 ring-2 ring-sky-200' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                                    <div className="text-sm font-bold text-gray-900 mb-1">🏢 Structure Parente</div>
                                    <div className="text-xs text-gray-500 leading-snug">Créer un immeuble, une résidence ou une cour commune</div>
                                </button>
                                <button type="button" onClick={() => setStructureCategory('ENFANT')} className={`p-4 border rounded-xl text-left transition-all ${structureCategory === 'ENFANT' ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                                    <div className="text-sm font-bold text-gray-900 mb-1">🚪 Unité Enfant</div>
                                    <div className="text-xs text-gray-500 leading-snug">Ajouter un appartement ou une porte dans une structure existante</div>
                                </button>
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            {/* --- INDIVIDUAL LOGIC --- */}
                            {structureCategory === 'INDEPENDANT' && (
                                <>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Nom du bien (Optionnel)</label>
                                        <input name="name" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF8200] focus:bg-white outline-none" placeholder="Ex: Studio du bas, Villa Rose..." />
                                    </div>
                                </>
                            )}

                            {/* --- PARENT LOGIC --- */}
                            {structureCategory === 'PARENT' && (
                                <>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Type de la structure</label>
                                        <select required name="parentType" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none">
                                            <option value="IMMEUBLE">Immeuble (R+)</option>
                                            <option value="COUR_COMMUNE">Cours Commune</option>
                                            <option value="RESIDENCE">Résidence (Cité)</option>
                                        </select>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Nom de la structure (Obligatoire)</label>
                                        <input required name="name" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none" placeholder="Ex: Imm. Les Palmiers, Cour Kone..." />
                                        <p className="text-[10px] text-gray-400 mt-1 italic">Ce nom préfixera tous les baux des unités à l'intérieur.</p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:col-span-2">
                                        <div className="bg-sky-50/30 p-4 rounded-xl border border-sky-100/50">
                                            <label className="block text-[10px] font-black text-sky-700 uppercase tracking-widest mb-2">Nombre d'unités</label>
                                            <input type="number" name="nbUnits" min="0" defaultValue="0" className="w-full px-3 py-2 bg-white border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none text-sm font-bold" />
                                            <p className="text-[9px] text-sky-600/70 mt-1">Génère automatiquement les appartements/portes.</p>
                                        </div>
                                        <div className="bg-sky-50/30 p-4 rounded-xl border border-sky-100/50">
                                            <label className="block text-[10px] font-black text-sky-700 uppercase tracking-widest mb-2">Loyer par unité (FCFA)</label>
                                            <input type="number" name="unitRent" min="0" placeholder="Ex: 150000" className="w-full px-3 py-2 bg-white border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none text-sm font-bold" />
                                            <p className="text-[9px] text-sky-600/70 mt-1">Loyer par défaut de chaque future unité.</p>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* --- ENFANT LOGIC --- */}
                            {structureCategory === 'ENFANT' && (
                                <>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Sélectionner la structure parente</label>
                                        {isLoadingParents ? (
                                            <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-400">Chargement...</div>
                                        ) : parents.length === 0 ? (
                                            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">Aucune structure parente (Immeuble/Cour) n'a été créée ! Veuillez d'abord en créer une.</div>
                                        ) : (
                                            <select 
                                                required 
                                                name="parentPropertyId" 
                                                value={selectedParentId}
                                                onChange={(e) => setSelectedParentId(e.target.value)}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                                            >
                                                <option value="">-- Choisir un Immeuble/Résidence/Cour --</option>
                                                {parents.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name} ({p.commune})</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Nom de l'unité (Ex : Apt 2B, Porte 3)</label>
                                        <input required name="unitLabel" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Ex: Apt 2B, 3ème Gauche, Porte 4..." />
                                        <p className="text-[10px] text-gray-400 mt-1 italic">Nom insensible à la casse. "Apt 1" ne peut pas exister deux fois.</p>
                                    </div>
                                </>
                            )}

                            <hr className="col-span-1 sm:col-span-2 border-gray-100 my-2" />

                            {structureCategory !== 'ENFANT' ? (
                                <>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Adresse Locale</label>
                                        <input required name="addressLine1" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF8200] outline-none" placeholder="Ex: Rue des Jardins, Lot 123" />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Commune</label>
                                        <select required name="commune" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF8200] outline-none">
                                            <option value="Cocody">Cocody</option>
                                            <option value="Abobo">Abobo</option>
                                            <option value="Yopougon">Yopougon</option>
                                            <option value="Treichville">Treichville</option>
                                            <option value="Marcory">Marcory</option>
                                            <option value="Koumassi">Koumassi</option>
                                            <option value="Adjamé">Adjamé</option>
                                            <option value="Plateau">Plateau</option>
                                            <option value="Bingerville">Bingerville</option>
                                            <option value="Autre">Autre...</option>
                                        </select>
                                    </div>
                                </>
                            ) : (
                                selectedParentId && (
                                    <div className="sm:col-span-2 bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6 animate-in fade-in slide-in-from-top-2">
                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            📍 Localisation Héritée du Parent
                                        </p>
                                        {(() => {
                                            const p = parents.find(x => x.id === selectedParentId);
                                            return (
                                                <div className="space-y-1">
                                                    <p className="text-sm font-bold text-gray-900">{p?.address || 'Adresse inconnue'}</p>
                                                    <p className="text-xs font-medium text-emerald-700/70">{p?.commune}</p>
                                                    <input type="hidden" name="addressLine1" value={p?.address || ''} />
                                                    <input type="hidden" name="commune" value={p?.commune || ''} />
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Loyer déclaré (Optionnel, FCFA/mois)</label>
                                <input type="number" name="rent" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF8200] outline-none" placeholder="Ex: 250000" />
                            </div>

                            {structureCategory !== 'PARENT' && (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Caractère de l'espace</label>
                                        <select name="propertyType" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF8200] outline-none">
                                            <option value="APARTMENT">Appartement</option>
                                            <option value="STUDIO">Studio</option>
                                            <option value="ROOM">Chambre (Porte)</option>
                                            <option value="VILLA">Villa / Maison basse</option>
                                            <option value="COMMERCE">Commerce / Boutique</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Superficie estimée (m²)</label>
                                        <input type="number" name="area" step="0.1" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF8200] outline-none" placeholder="Ex: 65.5" />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={isPending || (structureCategory === 'ENFANT' && parents.length === 0)}
                                className={`w-full py-4 px-6 text-white font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-1 ${
                                    structureCategory === 'PARENT' ? 'bg-sky-600 hover:bg-sky-700 shadow-sky-200' :
                                    structureCategory === 'ENFANT' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' :
                                    'bg-[#FF8200] hover:bg-orange-600 shadow-orange-200'
                                } disabled:opacity-50 disabled:hover:translate-y-0`}
                            >
                                {isPending ? "Génération de l'Identifiant Spatial..." : "Enregistrer et Certifier ce Bien"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
