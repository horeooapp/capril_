"use client";
// src/app/page.tsx - Landing QAPRIL

import { choisirTypeConnexion } from "@/actions/auth.actions";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#EEF3FB] flex flex-col items-center justify-center p-6">
      <div className="text-3xl font-bold text-[#1B3A6B] tracking-widest mb-2">QAPRIL</div>
      <div className="text-sm text-[#4A6A8A] mb-10 text-center">Plateforme de gestion locative · Côte d'Ivoire</div>

      <div className="flex flex-col gap-4 w-full max-w-xs">

        {/* BAILLEUR */}
        <form action={async () => { await choisirTypeConnexion("BAILLEUR"); }}>
          <button type="submit" className="w-full bg-[#1B3A6B] hover:bg-[#122A50] transition-colors text-white py-4 rounded-xl font-bold text-sm shadow-md">
            Espace Gestionnaire
          </button>
        </form>

        {/* LOCATAIRE */}
        <form action={async () => { await choisirTypeConnexion("LOCATAIRE"); }}>
          <button type="submit" className="w-full bg-white hover:bg-[#F8FAFC] transition-colors border-2 border-[#1B3A6B] text-[#1B3A6B] py-4 rounded-xl font-bold text-sm shadow-sm">
            Espace Locataire
          </button>
        </form>

        {/* ADMIN - discret */}
        <form action={async () => { await choisirTypeConnexion("ADMIN"); }} className="mt-4">
          <button type="submit" className="w-full text-[#8A9AB0] hover:text-[#4A6A8A] py-2 text-xs underline transition-colors">
            Administration sécurisée
          </button>
        </form>

      </div>
    </div>
  );
}
