"use client"

import { useState, useEffect } from "react"
import { getCommissionConfigs, createCommissionConfig, updateCommissionConfig, deleteCommissionConfig } from "./actions"
import { ProfileType, PaymentCanal } from "@prisma/client"
import { Plus, Trash2, Edit2, Save, X } from "lucide-react"

export default function CommissionsClient() {
  const [configs, setConfigs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form State
  const [formData, setFormData] = useState<{
    profileType: ProfileType;
    paymentCanal: string;
    tauxPourcent: number;
    montantMin: number;
    montantMax: number | null;
    actif: boolean;
  }>({
    profileType: ProfileType.LANDLORD,
    paymentCanal: "",
    tauxPourcent: 0.5,
    montantMin: 0,
    montantMax: null,
    actif: true
  })

  useEffect(() => {
    loadConfigs()
  }, [])

  async function loadConfigs() {
    setLoading(true)
    const data = await getCommissionConfigs()
    setConfigs(data)
    setLoading(false)
  }

  async function handleSave() {
    const dataToSave = {
      ...formData,
      paymentCanal: formData.paymentCanal === "" ? null : formData.paymentCanal as PaymentCanal
    }

    if (editingId) {
      await updateCommissionConfig(editingId, dataToSave)
    } else {
      await createCommissionConfig(dataToSave as any)
    }

    setIsAdding(false)
    setEditingId(null)
    loadConfigs()
  }

  async function handleDelete(id: string) {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette configuration ?")) {
      await deleteCommissionConfig(id)
      loadConfigs()
    }
  }

  function startEdit(config: any) {
    setFormData({
      profileType: config.profileType,
      paymentCanal: config.paymentCanal || "",
      tauxPourcent: config.tauxPourcent,
      montantMin: config.montantMin || 0,
      montantMax: config.montantMax,
      actif: config.actif
    })
    setEditingId(config.id)
    setIsAdding(true)
  }

  return (
    <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <h2 className="text-lg font-bold text-slate-800">Grille de Prélèvements</h2>
        {!isAdding && (
          <button 
            onClick={() => {
              setFormData({
                profileType: ProfileType.LANDLORD,
                paymentCanal: "",
                tauxPourcent: 0.5,
                montantMin: 0,
                montantMax: null,
                actif: true
              })
              setIsAdding(true)
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouvelle Règle
          </button>
        )}
      </div>

      {isAdding && (
        <div className="p-6 border-b border-slate-200 bg-blue-50/50">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Type de Profil</label>
              <select 
                value={formData.profileType} 
                onChange={e => setFormData({...formData, profileType: e.target.value as ProfileType})}
                className="w-full p-2 border border-slate-300 rounded-lg text-sm"
              >
                {Object.values(ProfileType).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Canal de Paiement</label>
              <select 
                value={formData.paymentCanal} 
                onChange={e => setFormData({...formData, paymentCanal: e.target.value})}
                className="w-full p-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="">(Tous les canaux)</option>
                {Object.values(PaymentCanal).map(canal => (
                  <option key={canal} value={canal}>{canal}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Taux (%)</label>
              <input 
                type="number" step="0.1" 
                value={formData.tauxPourcent} 
                onChange={e => setFormData({...formData, tauxPourcent: parseFloat(e.target.value)})}
                className="w-full p-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Plancher (FCFA)</label>
              <input 
                type="number" 
                value={formData.montantMin} 
                onChange={e => setFormData({...formData, montantMin: parseInt(e.target.value)})}
                className="w-full p-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Plafond (FCFA)</label>
              <input 
                type="number" 
                value={formData.montantMax || ''} 
                onChange={e => setFormData({...formData, montantMax: e.target.value ? parseInt(e.target.value) : null})}
                placeholder="Aucun plafond"
                className="w-full p-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm cursor-pointer mb-2">
                <input 
                  type="checkbox" 
                  checked={formData.actif} 
                  onChange={e => setFormData({...formData, actif: e.target.checked})}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="font-medium text-slate-700">Règle active</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button 
              onClick={() => { setIsAdding(false); setEditingId(null); }}
              className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <X className="w-4 h-4" /> Annuler
            </button>
            <button 
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> {editingId ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold">Profil</th>
              <th className="px-6 py-4 font-semibold">Canal</th>
              <th className="px-6 py-4 font-semibold text-right">Taux</th>
              <th className="px-6 py-4 font-semibold text-right">Plancher</th>
              <th className="px-6 py-4 font-semibold text-right">Plafond</th>
              <th className="px-6 py-4 font-semibold text-center">Statut</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-400">Chargement...</td></tr>
            ) : configs.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-400">Aucune règle définie.</td></tr>
            ) : (
              configs.map(config => (
                <tr key={config.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {config.profileType.replace(/_/g, ' ')}
                  </td>
                  <td className="px-6 py-4">
                    {config.paymentCanal ? (
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-semibold">
                        {config.paymentCanal}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Tous les canaux</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-blue-600">
                    {config.tauxPourcent}%
                  </td>
                  <td className="px-6 py-4 text-right">
                    {config.montantMin} FCFA
                  </td>
                  <td className="px-6 py-4 text-right">
                    {config.montantMax ? `${config.montantMax} FCFA` : <span className="text-slate-400">-</span>}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {config.actif ? (
                      <span className="inline-flex w-3 h-3 bg-green-500 rounded-full" title="Actif"></span>
                    ) : (
                      <span className="inline-flex w-3 h-3 bg-red-500 rounded-full" title="Inactif"></span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => startEdit(config)} className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(config.id)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
