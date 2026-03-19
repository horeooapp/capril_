"use client";

import { useState } from "react";
import { toggleFeature } from "@/actions/feature-actions";
import { 
  ShieldCheck, ShieldAlert, Cpu, Settings2, Fingerprint, FileText, Wrench, Scale, 
  Banknote, Landmark, ShieldHalf, LifeBuoy, Home, Users, Newspaper, Antenna, 
  Smartphone, UserCheck, Briefcase, Users2, TreePine, Camera, PenTool, 
  UserPlus, Calculator, Megaphone, BookOpen, Calendar 
} from "lucide-react";

interface Feature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export default function FeatureManager({ initialFeatures }: { initialFeatures: Feature[] }) {
  const [features, setFeatures] = useState(initialFeatures);
  const [loading, setLoading] = useState<string | null>(null);

  const handleToggle = async (id: string, currentState: boolean) => {
    setLoading(id);
    const result = await toggleFeature(id, !currentState);
    if (result.success) {
      setFeatures(prev => prev.map(f => f.id === id ? { ...f, enabled: !currentState } : f));
    }
    setLoading(null);
  };

  const getIcon = (id: string) => {
    switch (id) {
      case "M01-M03": 
      case "KYC_VERIFICATION": return <UserCheck className="w-5 h-5" />;
      case "M04": return <FileText className="w-5 h-5" />;
      case "M05": 
      case "M_MANDAT": return <Briefcase className="w-5 h-5" />;
      case "M06-M09": 
      case "M-MAINT": return <Wrench className="w-5 h-5" />;
      case "M10-M11": 
      case "MEDIATION_CENTER": return <Scale className="w-5 h-5" />;
      case "M16": 
      case "M17_FISCAL": return <Landmark className="w-5 h-5" />;
      case "M-PGW": return <Banknote className="w-5 h-5" />;
      case "CDC_CONSIGNATION": return <ShieldHalf className="w-5 h-5" />;
      case "ASSURANCE_LOYER": return <LifeBuoy className="w-5 h-5" />;
      case "LANDING_PAGE": return <Home className="w-5 h-5" />;
      case "M16_ANAH": return <ShieldCheck className="w-5 h-5" />;
      case "SMS_NOTIFICATIONS": return <Smartphone className="w-5 h-5" />;
      case "USSD_PORTAL": return <Antenna className="w-5 h-5" />;
      case "NEWS_TICKER": return <Newspaper className="w-5 h-5" />;
      case "M_COLOC": return <Users2 className="w-5 h-5" />;
      case "M_TERRAIN": return <TreePine className="w-5 h-5" />;
      case "M-EDL": return <Camera className="w-5 h-5" />;
      case "M-SIGN": return <PenTool className="w-5 h-5" />;
      case "M-CAND": return <UserPlus className="w-5 h-5" />;
      case "M-CHARGES": return <Calculator className="w-5 h-5" />;
      case "M-ANNONCES": return <Megaphone className="w-5 h-5" />;
      case "M-COMPTA": return <BookOpen className="w-5 h-5" />;
      case "M-AGENDA": return <Calendar className="w-5 h-5" />;
      default: return <Cpu className="w-5 h-5" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {features.map((feature) => (
        <div 
          key={feature.id}
          className={`p-8 rounded-[32px] border transition-all duration-300 ${
            feature.enabled 
              ? "bg-white border-[#1F4E79]/10 shadow-sm" 
              : "bg-[#F2F2F2] border-gray-200 opacity-70 grayscale"
          }`}
        >
          <div className="flex items-start justify-between mb-6">
            <div className={`p-4 rounded-2xl ${feature.enabled ? "bg-[#1F4E79] text-white" : "bg-gray-300 text-gray-600"}`}>
              {getIcon(feature.id)}
            </div>
            {/* Zone de Tap Géreuse P03 (Min 48x48) */}
            <button
              onClick={() => handleToggle(feature.id, feature.enabled)}
              disabled={loading === feature.id}
              className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-4 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                feature.enabled ? "bg-[#375623]" : "bg-gray-400"
              } min-h-[48px] min-w-[64px] items-center px-1`}
            >
              <span className="sr-only">Toggle {feature.name}</span>
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  feature.enabled ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-[20px] font-bold text-[#1F4E79] flex items-wrap items-center gap-2 leading-tight">
              {feature.name}
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[#D6E4F0] text-[#1F4E79] uppercase tracking-tighter">
                {feature.id}
              </span>
            </h4>
            {/* P02 - Taille minimum 16sp */}
            <p className="text-[16px] text-gray-600 leading-relaxed font-medium">
              {feature.description}
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
            <span className={`text-[12px] font-black uppercase tracking-[0.2em] ${feature.enabled ? "text-[#375623]" : "text-gray-400"}`}>
              {feature.enabled ? "Module Actif" : "Désactivé"}
            </span>
            {feature.enabled ? (
              <ShieldCheck className="w-5 h-5 text-[#375623]" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
