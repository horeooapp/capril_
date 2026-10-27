"use client"

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Edit3, Trash2, Lock, AlertTriangle, CheckCircle, X } from "lucide-react";
import { toast } from "sonner";
import { modifierBien, supprimerBien } from "@/actions/property.actions";

interface PropertyActionsProps {
  property: any;
  isOwner: boolean;
}

export default function PropertyActionsBar({ property, isOwner }: PropertyActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Dialog states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState(property.name || "");
  const [unitLabel, setUnitLabel] = useState(property.unitLabel || "");
  const [address, setAddress] = useState(property.address || property.addressLine1 || "");
  const [commune, setCommune] = useState(property.commune || "Cocody");
  const [rent, setRent] = useState(property.declaredRentFcfa || 0);
  const [area, setArea] = useState(property.superficieM2 || "");
  const [propertyType, setPropertyType] = useState(property.propertyType || "APARTMENT");

  // Vérification si le bien est en location
  const isOccupied = property.isOccupied || 
                     property.status === "rented" || 
                     property.status === "RENTED" ||
                     (property.leases && property.leases.some((l: any) => 
                       ['ACTIVE', 'PENDING_SIGNATURE', 'PENDING_CONFIRMATION'].includes(l.status)
                     ));

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isOccupied) {
      toast.error("Action impossible : Ce bien est actuellement en location active.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("unitLabel", unitLabel);
    formData.append("addressLine1", address);
    formData.append("commune", commune);
    formData.append("rent", rent.toString());
    formData.append("area", area.toString());
    formData.append("propertyType", propertyType);

    startTransition(async () => {
      const res = await modifierBien(property.id, formData);
      if (res?.error) {
        setErrorMsg(res.error);
        toast.error(res.error);
      } else {
        toast.success("Bien immobilier mis à jour avec succès !");
        setShowEditModal(false);
        router.refresh();
      }
    });
  };

  const handleDelete = () => {
    if (isOccupied) {
      toast.error("Action impossible : Ce bien est actuellement en location active.");
      return;
    }

    startTransition(async () => {
      const res = await supprimerBien(property.id);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Le bien a été retiré de votre patrimoine avec succès.");
        setShowDeleteModal(false);
        // Utiliser window.location.href pour vider le cache client et garantir le rechargement immédiat
        window.location.href = "/dashboard/properties";
      }
    });
  };

  if (!isOwner) return null;

  return (
    <>
      <div className="flex items-center gap-3">
        {isOccupied ? (
          <div 
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-2xl text-xs font-black text-slate-500 cursor-not-allowed select-none shadow-inner"
            title="Ce bien est sous contrat de location actif. Il ne peut être ni modifié ni supprimé."
          >
            <Lock size={14} className="text-slate-400" />
            <span>Bien en location (Verrouillé)</span>
          </div>
        ) : (
          <>
            <button
              onClick={() => {
                setErrorMsg(null);
                setShowEditModal(true);
              }}
              className="px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm"
              title="Modifier les informations de ce bien"
            >
              <Edit3 size={15} className="text-slate-600" />
              Modifier
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm"
              title="Supprimer ce bien du patrimoine"
            >
              <Trash2 size={15} />
              Supprimer
            </button>
          </>
        )}
      </div>

      {/* MODAL MODIFICATION */}
      {showEditModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-slate-100 animate-scale-up">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight">Modifier le bien immobilier</h3>
                <p className="text-xs text-slate-400 mt-0.5">{property.propertyCode}</p>
              </div>
              <button 
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {errorMsg && (
              <div className="m-6 mb-0 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold flex items-center gap-2">
                <AlertTriangle size={16} className="flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">Nom / Titre du bien</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-sm font-bold text-slate-800"
                    placeholder="Ex: Villa Karré, Appartement 3B..."
                  />
                </div>

                {property.parentPropertyId && (
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">Label de l'unité (Porte / Appartement)</label>
                    <input
                      type="text"
                      value={unitLabel}
                      onChange={(e) => setUnitLabel(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-sm font-bold text-slate-800"
                      placeholder="Ex: Porte 4, Apt 2B..."
                    />
                  </div>
                )}

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">Adresse</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-sm font-bold text-slate-800"
                    placeholder="Ex: Rue des Jardins, Lot 40"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">Commune</label>
                  <select
                    value={commune}
                    onChange={(e) => setCommune(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-sm font-bold text-slate-800"
                  >
                    <option value="Cocody">Cocody</option>
                    <option value="Marcory">Marcory</option>
                    <option value="Plateau">Plateau</option>
                    <option value="Yopougon">Yopougon</option>
                    <option value="Treichville">Treichville</option>
                    <option value="Koumassi">Koumassi</option>
                    <option value="Abobo">Abobo</option>
                    <option value="Bingerville">Bingerville</option>
                    <option value="Adjamé">Adjamé</option>
                    <option value="Autre">Autre...</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">Type d'espace</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-sm font-bold text-slate-800"
                  >
                    <option value="APARTMENT">Appartement</option>
                    <option value="STUDIO">Studio</option>
                    <option value="ROOM">Chambre (Porte)</option>
                    <option value="VILLA">Villa / Maison basse</option>
                    <option value="COMMERCE">Commerce / Boutique</option>
                    <option value="BUILDING">Immeuble entier</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">Loyer déclaré (FCFA/mois)</label>
                  <input
                    type="number"
                    value={rent || ""}
                    onChange={(e) => setRent(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-sm font-bold text-slate-800"
                    placeholder="Ex: 250000"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">Superficie (m²)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={area || ""}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-sm font-bold text-slate-800"
                    placeholder="Ex: 85"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider disabled:opacity-50 transition-all shadow-md"
                >
                  {isPending ? "Enregistrement..." : "Enregistrer les modifications"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SUPPRESSION */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 animate-scale-up p-6 space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle size={28} />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Supprimer ce bien ?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Êtes-vous sûr de vouloir retirer le bien <strong>{property.name || property.propertyCode}</strong> de votre patrimoine ? Cette action est irréversible.
              </p>
            </div>

            <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200/80 text-[11px] font-semibold text-amber-900">
              ⚠️ Règle de conformité : Seuls les biens <strong>vacants</strong> (sans contrat de location en cours) peuvent être supprimés.
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="py-3 px-4 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleDelete}
                className="py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider rounded-xl disabled:opacity-50 transition-colors shadow-md shadow-rose-200"
              >
                {isPending ? "Suppression..." : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
