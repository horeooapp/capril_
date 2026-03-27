"use client"

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  UserPlus, 
  Building2, 
  FileText, 
  ShieldCheck, 
  CheckCircle2,
  Calendar,
  Wallet,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from './Badge';

const steps = [
  { id: 1, label: "Locataire", icon: <UserPlus size={20} /> },
  { id: 2, label: "Bien", icon: <Building2 size={20} /> },
  { id: 3, label: "Termes", icon: <FileText size={20} /> },
  { id: 4, label: "Validation", icon: <ShieldCheck size={20} /> },
];

export const LeaseCreationWizard: React.FC<{ properties: any[] }> = ({ properties }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    propertyId: "",
    rent: 250000,
    deposit: 500000,
    startDate: "2026-04-01",
    type: "BDQ" // Bail Digital QAPRIL
  });

  const selectedProperty = properties.find(p => p.id === formData.propertyId);

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 flex items-center gap-6">
          <Link href="/dashboard" className="p-3 bg-white rounded-2xl shadow-sm hover:bg-slate-900 hover:text-white transition-all">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-[#1F4E79] tracking-tighter uppercase italic">M-SIGN Wizard.</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C55A11]">Émission de Bail Digital Certifié QAPRIL</p>
          </div>
        </div>

        {/* Stepper */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 mb-8">
          <div className="flex justify-between relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>
            {steps.map((step) => (
              <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
                <div 
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                    currentStep >= step.id ? "bg-[#1F4E79] text-white shadow-xl shadow-blue-900/20" : "bg-white text-slate-300 border-2 border-slate-100"
                  }`}
                >
                  {currentStep > step.id ? <CheckCircle2 size={24} /> : step.icon}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest ${currentStep >= step.id ? "text-[#1F4E79]" : "text-slate-300"}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 min-h-[500px] flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-grow"
            >
              {currentStep === 1 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-black text-[#1F4E79] tracking-tight uppercase">Identification du Locataire.</h2>
                    <p className="text-slate-400 text-sm font-medium">Saisissez les coordonnées de la partie prenante.</p>
                  </div>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Nom Complet</label>
                        <input 
                          type="text" 
                          placeholder="M. Koné Adama"
                          className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-800 focus:ring-2 focus:ring-[#1F4E79] transition-all"
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Téléphone Mobile</label>
                        <input 
                          type="text" 
                          placeholder="+225 07 ..."
                          className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-800 focus:ring-2 focus:ring-[#1F4E79] transition-all"
                          value={formData.phone}
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Email de Signature</label>
                      <input 
                        type="email" 
                        placeholder="kone.adama@email.com"
                        className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-800 focus:ring-2 focus:ring-[#1F4E79] transition-all"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start gap-4">
                       <ShieldCheck className="text-blue-600 mt-1" size={20} />
                       <p className="text-[12px] font-medium text-blue-800 leading-relaxed">
                          Conformément au protocole M-SIGN, une invitation sécurisée par SMS sera envoyée au locataire dès la validation du projet de bail.
                       </p>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-black text-[#1F4E79] tracking-tight uppercase">Sélection du Bien.</h2>
                    <p className="text-slate-400 text-sm font-medium">Affectez ce bail à une unité de votre portefeuille.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {properties.map(p => (
                      <div 
                        key={p.id}
                        onClick={() => setFormData({...formData, propertyId: p.id})}
                        className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer relative group ${
                          formData.propertyId === p.id ? "border-[#1F4E79] bg-blue-50/20" : "border-slate-100 hover:border-slate-200"
                        }`}
                      >
                        {formData.propertyId === p.id && (
                          <div className="absolute top-4 right-4 text-[#1F4E79]">
                            <CheckCircle2 size={24} />
                          </div>
                        )}
                        <h4 className="font-black text-[#1F4E79] uppercase tracking-tight mb-2">{p.address?.split(',')[0]}</h4>
                        <div className="flex items-center gap-2">
                           <Badge label={p.propertyCode} color="#1F4E79" bg="#F0F4F8" size={9} />
                           <span className="text-[11px] font-bold text-slate-400">{p.propertyType}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-black text-[#1F4E79] tracking-tight uppercase">Termes & Conditions.</h2>
                    <p className="text-slate-400 text-sm font-medium">Définissez les paramètres financiers du contrat.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 flex items-center gap-2">
                           <Wallet size={12} /> Loyer Mensuel (FCFA)
                        </label>
                        <input 
                          type="number" 
                          className="w-full bg-slate-50 border-none rounded-2xl p-4 font-black text-xl text-slate-800"
                          value={formData.rent}
                          onChange={e => setFormData({...formData, rent: Number(e.target.value)})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 flex items-center gap-2">
                           <ShieldCheck size={12} /> Dépôt de Garantie (FCFA)
                        </label>
                        <input 
                          type="number" 
                          className="w-full bg-slate-50 border-none rounded-2xl p-4 font-black text-xl text-[#C55A11]"
                          value={formData.deposit}
                          onChange={e => setFormData({...formData, deposit: Number(e.target.value)})}
                        />
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 flex items-center gap-2">
                           <Calendar size={12} /> Date de Prise d'Effet
                        </label>
                        <input 
                          type="date" 
                          className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-800"
                          value={formData.startDate}
                          onChange={e => setFormData({...formData, startDate: e.target.value})}
                        />
                      </div>
                      <div className="p-6 bg-orange-50 rounded-2xl border border-orange-100">
                         <h4 className="text-[11px] font-black uppercase tracking-widest text-orange-600 mb-2">Note Digitale</h4>
                         <p className="text-[11px] font-medium text-orange-800/80 leading-relaxed italic">
                            Le modèle QAPRIL BDQ inclut une clause de révision annuelle automatique liée à l'Indice des Prix Ivoirien.
                         </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-8 flex flex-col items-center text-center">
                  <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2rem] flex items-center justify-center shadow-inner mb-6">
                    <ShieldCheck size={48} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-[#1F4E79] tracking-tight uppercase italic mb-4">Prêt pour Certification.</h2>
                    <p className="text-slate-400 text-sm font-medium max-w-md mx-auto">
                       Le projet de bail pour <span className="text-[#1F4E79] font-black">{formData.name}</span> à <span className="text-[#1F4E79] font-black">{selectedProperty?.address?.split(',')[0]}</span> est généré. 
                    </p>
                  </div>

                  <div className="w-full grid grid-cols-2 gap-4 mt-8">
                     <div className="p-6 bg-slate-50 rounded-[2rem] text-left border border-slate-100">
                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Fingerprint SHA-256</div>
                        <div className="text-[11px] font-mono text-slate-800 break-all leading-tight">
                           a1c4b9...f2d8e0...7c3a1b...4e9d5f
                        </div>
                     </div>
                     <div className="p-6 bg-slate-50 rounded-[2rem] text-left border border-slate-100">
                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Droits d'Enregistrement</div>
                        <div className="text-xl font-black text-[#1F4E79] font-mono">12,500 FCFA</div>
                        <div className="text-[9px] font-bold text-[#C55A11] uppercase tracking-tighter">Inclus dans les frais QAPRIL</div>
                     </div>
                  </div>

                  <div className="w-full p-6 bg-indigo-900 rounded-[2.5rem] mt-8 text-white relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400 blur-[40px] opacity-10"></div>
                     <div className="flex items-center justify-between">
                        <div className="text-left">
                           <h4 className="text-[13px] font-black uppercase tracking-tighter italic">Lancer l'Invitation M-SIGN</h4>
                           <p className="text-[10px] text-white/60 font-medium">Envoi SMS au {formData.phone || "+225 00 00 00 00"}</p>
                        </div>
                        <button className="p-4 bg-white text-indigo-900 rounded-2xl shadow-lg hover:scale-105 transition-transform active:scale-95">
                           <ArrowRight size={24} />
                        </button>
                     </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="mt-12 flex justify-between items-center pt-8 border-t border-slate-50">
            <button 
              onClick={prevStep}
              className={`px-8 py-4 rounded-2xl font-black uppercase text-[12px] tracking-widest transition-all ${
                currentStep === 1 ? "opacity-0 pointer-events-none" : "text-slate-400 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              Retour
            </button>
            <button 
              onClick={nextStep}
              className={`px-10 py-5 bg-[#C55A11] text-white rounded-2xl font-black uppercase text-[12px] tracking-widest shadow-xl shadow-orange-900/10 hover:bg-[#a64a0e] transition-all flex items-center gap-3 ${
                currentStep === 4 ? "hidden" : ""
              }`}
            >
              {currentStep === 3 ? "Générer le projet" : "Continuer"}
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
