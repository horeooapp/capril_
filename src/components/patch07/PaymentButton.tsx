"use client";

import React, { useState } from "react";

interface PaymentButtonProps {
  leaseId: string;
  loyerMensuel: number;
}

export function PaymentButton({ leaseId, loyerMensuel }: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);

  // Simulation du calcul côté client (en prod, c'est le serveur qui doit générer le hash/montant)
  const calculateFee = (loyer: number) => {
    if (loyer <= 80000) return 3000;
    if (loyer <= 170000) return 5000;
    if (loyer <= 350000) return 8000;
    return 10000;
  };

  const frais = calculateFee(loyerMensuel);

  const handleGenerateLink = async () => {
    setLoading(true);
    // Dans une vraie intégration, on appellerait une route API `/api/v1/baux/[id]/pay`
    // qui appellerait `cinetpay.initPayment` et nous retournerait le `payment_url`.
    setTimeout(() => {
      alert(`Lien CinetPay généré pour un montant de ${frais} XOF.\nTransaction ID: ENREG_BAIL_${leaseId}\nCe lien peut être envoyé au locataire via WhatsApp.`);
      setLoading(false);
    }, 1000);
  };

  return (
    <button
      onClick={handleGenerateLink}
      disabled={loading}
      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
    >
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
      {loading ? "Génération..." : `Générer le lien de paiement (${frais} XOF)`}
    </button>
  );
}
