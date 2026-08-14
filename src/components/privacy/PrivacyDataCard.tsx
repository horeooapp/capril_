import React from "react";
import { type DataSensitivity, type DataCategory } from "@/lib/data-classification";

interface PrivacyDataCardProps {
  label: string;
  value: React.ReactNode;
  sensitivity: DataSensitivity;
  category: DataCategory;
  description?: string;
  isMasked?: boolean;
}

/**
 * Composant d'affichage de donnée personnelle avec indicateur visuel de sensibilité.
 * Permet d'informer l'utilisateur sur la classification de la donnée (Transparence).
 */
export function PrivacyDataCard({
  label,
  value,
  sensitivity,
  category,
  description,
  isMasked = false,
}: PrivacyDataCardProps) {
  
  // Couleurs selon la sensibilité (Privacy by Design)
  const sensitivityColors = {
    PUBLIC: "bg-emerald-100 text-emerald-800 border-emerald-200",
    INTERNAL: "bg-blue-100 text-blue-800 border-blue-200",
    CONFIDENTIAL: "bg-orange-100 text-orange-800 border-orange-200",
    RESTRICTED: "bg-red-100 text-red-800 border-red-200",
  };

  const sensitivityLabels = {
    PUBLIC: "Public",
    INTERNAL: "Usage Interne",
    CONFIDENTIAL: "Confidentiel",
    RESTRICTED: "Strictement Confidentiel",
  };

  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <span 
          className={`text-xs px-2 py-1 rounded-full border font-medium ${sensitivityColors[sensitivity]}`}
          title={`Catégorie: ${category}`}
        >
          {sensitivityLabels[sensitivity]}
        </span>
      </div>
      
      <div className="text-lg font-semibold text-slate-900 mt-1">
        {isMasked ? (
          <span className="text-slate-400 italic">••••••••</span>
        ) : (
          value || <span className="text-slate-300 italic">Non renseigné</span>
        )}
      </div>

      {description && (
        <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
          {description}
        </p>
      )}
    </div>
  );
}
