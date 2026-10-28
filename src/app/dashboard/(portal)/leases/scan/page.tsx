"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { LeaseStatusBadges } from "@/components/patch07/LeaseStatusBadges";

export default function ScanLeasePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<"UPLOAD" | "EXTRACTING" | "VALIDATE" | "DONE">("UPLOAD");
  const [scanId, setScanId] = useState<string | null>(null);
  
  // Champs OCR extraits
  const [champs, setChamps] = useState({
    loyer: 0,
    bailleurNom: "",
    locataireNom: "",
    dureeMois: 12
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setStep("EXTRACTING");
    
    // 1. Upload (ING-01)
    const formData = new FormData();
    formData.append("file", file);

    try {
      const uploadRes = await fetch("/api/v1/baux/scan/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      
      if (!uploadData.success) throw new Error("Erreur upload");
      setScanId(uploadData.scanId);

      // 2. Extraction (ING-02)
      const extractRes = await fetch(`/api/v1/baux/scan/${uploadData.scanId}/extraction`);
      const extractData = await extractRes.json();
      
      if (extractData.success && extractData.champs) {
        setChamps({
          loyer: extractData.champs.loyer || 0,
          bailleurNom: extractData.champs.bailleurNom || "",
          locataireNom: extractData.champs.locataireNom || "",
          dureeMois: extractData.champs.dureeMois || 12
        });
      }
      
      setStep("VALIDATE");
    } catch (err) {
      console.error(err);
      alert("Erreur lors du traitement du scan.");
      setStep("UPLOAD");
    }
  };

  const handleValidate = async () => {
    if (!scanId) return;
    try {
      const res = await fetch(`/api/v1/baux/scan/${scanId}/valider`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ champs })
      });
      if (res.ok) {
        setStep("DONE");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la validation.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Importer un bail physique</h1>
        <p className="mt-1 text-sm text-gray-500">
          Uploadez une image ou un PDF. Notre système lira les informations clés pour créer un bail numérisé.
        </p>
      </div>

      {step === "UPLOAD" && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*,application/pdf"
          />
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <div className="mt-4 flex text-sm text-gray-600 justify-center">
            <label
              onClick={() => fileInputRef.current?.click()}
              className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
            >
              <span>Uploadez un fichier</span>
            </label>
            <p className="pl-1">ou glissez-déposez</p>
          </div>
          <p className="text-xs text-gray-500 mt-2">PNG, JPG, PDF jusqu'à 10MB</p>
          
          {file && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md inline-block">
              <p className="text-sm font-medium text-gray-900">{file.name}</p>
              <button 
                onClick={handleUpload}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded shadow text-sm hover:bg-blue-700"
              >
                Lancer l'analyse (OCR)
              </button>
            </div>
          )}
        </div>
      )}

      {step === "EXTRACTING" && (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Lecture optique en cours (OCR)...</p>
        </div>
      )}

      {step === "VALIDATE" && (
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Vérification des champs extraits</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Veuillez corriger les informations si l'OCR a fait une erreur.</p>
            </div>
            
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Loyer Mensuel (XOF)</label>
                <input
                  type="number"
                  value={champs.loyer}
                  onChange={e => setChamps({...champs, loyer: parseInt(e.target.value) || 0})}
                  className="mt-1 block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Durée (Mois)</label>
                <input
                  type="number"
                  value={champs.dureeMois}
                  onChange={e => setChamps({...champs, dureeMois: parseInt(e.target.value) || 12})}
                  className="mt-1 block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom du Bailleur</label>
                <input
                  type="text"
                  value={champs.bailleurNom}
                  onChange={e => setChamps({...champs, bailleurNom: e.target.value})}
                  className="mt-1 block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom du Locataire</label>
                <input
                  type="text"
                  value={champs.locataireNom}
                  onChange={e => setChamps({...champs, locataireNom: e.target.value})}
                  className="mt-1 block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleValidate}
                className="bg-green-600 text-white px-4 py-2 rounded shadow text-sm hover:bg-green-700"
              >
                Confirmer et créer le bail scanné
              </button>
            </div>
          </div>
        </div>
      )}

      {step === "DONE" && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Bail numérisé avec succès</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Le bail a été scellé et horodaté (SHA-256).</p>
              </div>
              <div className="mt-4">
                <LeaseStatusBadges origineBail="SCANNE" niveauCertification="NUMERISE_HORODATE" statutDgi="NON_SOUMIS" />
              </div>
              <div className="mt-6">
                <button
                  onClick={() => router.push('/dashboard/leases')}
                  className="bg-white border border-green-400 text-green-800 px-3 py-2 rounded text-sm hover:bg-green-100"
                >
                  Retour aux baux
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
