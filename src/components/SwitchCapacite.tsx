"use client";
// src/components/SwitchCapacite.tsx

import { useState } from "react";
import { useSession } from "next-auth/react";
import { switchCapacite } from "@/actions/capacite.actions";

export default function SwitchCapacite() {
  const { data: session, update } = useSession();
  const [loading, setLoading]     = useState(false);

  // Fallback si pas de donnees NextAuth
  if (!session?.user) return null;

  const user           = session.user as any; 
  const currentRole    = user.role;
  const capacites      = user.capacites || [];
  const capaciteActive = user.capaciteActive;

  // Un pur locataire ou Admin pur n'a pas la capacite de switcher
  if (currentRole === "TENANT" || currentRole === "ADMIN" || currentRole === "SUPER_ADMIN") {
      return null;
  }

  // S'il n'a qu'une (ou zero) capacite cote bailleur, on cache le selecteur
  if (capacites.length <= 1) {
      return null;
  }

  const handleSwitch = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVal = e.target.value;
    if (newVal === capaciteActive) return;

    try {
      setLoading(true);
      await switchCapacite(newVal);
      // Force NextAuth JWT refresh (v5 spec for DB update)
      await update({ capaciteActive: newVal }); 
      
      // Force la redirection racine vers la base dashboard pour charger les bonnes donnees
      window.location.href = "/dashboard";
    } catch (err) {
      setLoading(false);
      console.error(err);
      alert("Erreur basculement capacite");
    }
  };

  return (
    <div className="flex items-center ml-4">
      <div className="relative">
        <select
          disabled={loading}
          value={capaciteActive || ""}
          onChange={handleSwitch}
          className="appearance-none cursor-pointer bg-white text-[#1B3A6B] border border-[#D0DFF5] 
                     text-xs font-bold pl-3 pr-8 py-1.5 rounded-full shadow-sm outline-none 
                     hover:border-[#1B3A6B] transition-all disabled:opacity-50"
        >
          {capacites.map((c: string) => (
            <option key={c} value={c}>
              {c === "PROPRIETAIRE" ? "Propriétaire"
               : c === "AGENCE_AGREE" ? "Agence Agréée"
               : c === "AGENCE_NON_AGREE" ? "Gestion Non Agréée"
               : "Intermédiaire"}
            </option>
          ))}
        </select>
        {/* Petite fleche personnalisee */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
           <svg className="h-3 w-3 text-[#1B3A6B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
           </svg>
        </div>
      </div>
      {loading && (
        <span className="ml-2 w-3 h-3 border-2 border-[#1B3A6B] border-t-transparent rounded-full animate-spin"></span>
      )}
    </div>
  );
}
