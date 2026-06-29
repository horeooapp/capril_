"use client";

import React, { useState } from "react";

interface DgiSubmitButtonProps {
  leaseId: string;
  statutDgi: string;
  onSuccess?: () => void;
}

export function DgiSubmitButton({ leaseId, statutDgi, onSuccess }: DgiSubmitButtonProps) {
  const [loading, setLoading] = useState(false);

  if (statutDgi === "EN_COURS" || statutDgi === "ENREGISTRE") {
    return null; // Déjà soumis
  }

  const handleSoumettre = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/baux/${leaseId}/dgi/soumettre`, {
        method: "POST"
      });
      if (res.ok) {
        if (onSuccess) onSuccess();
      } else {
        alert("Erreur lors de la soumission à la DGI");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSoumettre}
      disabled={loading}
      className="inline-flex items-center px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
    >
      {loading ? "Soumission..." : "Soumettre à la DGI (Passerelle)"}
    </button>
  );
}
