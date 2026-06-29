"use client";

import React from "react";

interface StatusBadgesProps {
  origineBail: string;
  niveauCertification: string;
  statutDgi: string;
}

export function LeaseStatusBadges({ origineBail, niveauCertification, statutDgi }: StatusBadgesProps) {
  // Origine Badge Color
  const isOrigineGenere = origineBail === "GENERE";
  const origineColor = isOrigineGenere ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800";
  
  // Certification Badge Color
  const isCertifie = niveauCertification === "CERTIFIE_QAPRIL";
  const certColor = isCertifie ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800";

  // DGI Badge Color
  let dgiColor = "bg-gray-100 text-gray-800";
  if (statutDgi === "EN_COURS") dgiColor = "bg-yellow-100 text-yellow-800";
  if (statutDgi === "ENREGISTRE") dgiColor = "bg-green-100 text-green-800";
  if (statutDgi === "REJETE") dgiColor = "bg-red-100 text-red-800";

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${origineColor}`}>
        {isOrigineGenere ? "Généré Nativement" : "Scanné"}
      </span>
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${certColor}`}>
        {isCertifie ? (
          <><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></>
        ) : null}
        {isCertifie ? "Certifié Qapril" : "Numérisé (Horodaté)"}
      </span>
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border border-transparent ${dgiColor} ${statutDgi === 'NON_SOUMIS' ? 'border-gray-300' : ''}`}>
        DGI: {statutDgi.replace("_", " ")}
      </span>
    </div>
  );
}
