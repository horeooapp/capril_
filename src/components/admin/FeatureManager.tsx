"use client";

import { useState } from "react";
import { toggleFeature } from "@/actions/feature-actions";
import { 
  ShieldCheck, ShieldAlert, Cpu, Settings2, Fingerprint, FileText, Wrench, Scale, 
  Banknote, Landmark, ShieldHalf, LifeBuoy, Home, Users, Newspaper, Antenna, 
  Smartphone, UserCheck, Briefcase, Users2, TreePine 
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
      case "M06-M09": return <Wrench className="w-5 h-5" />;
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
      default: return <Cpu className="w-5 h-5" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature) => (
        <div 
          key={feature.id}
          className={`p-6 rounded-3xl border transition-all duration-300 ${
            feature.enabled 
              ? "bg-white/80 border-black/5 shadow-sm" 
              : "bg-gray-50/50 border-gray-100 opacity-60 grayscale"
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-2xl ${feature.enabled ? "bg-black text-white" : "bg-gray-200 text-gray-500"}`}>
              {getIcon(feature.id)}
            </div>
            <button
              onClick={() => handleToggle(feature.id, feature.enabled)}
              disabled={loading === feature.id}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                feature.enabled ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span className="sr-only">Toggle {feature.name}</span>
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  feature.enabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          
          <div className="space-y-1">
            <h4 className="font-bold text-gray-900 flex items-center gap-2">
              {feature.name}
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 uppercase tracking-tighter">
                {feature.id}
              </span>
            </h4>
            <p className="text-sm text-gray-500 leading-relaxed">
              {feature.description}
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <span className={`text-[10px] font-black uppercase tracking-widest ${feature.enabled ? "text-green-600" : "text-gray-400"}`}>
              {feature.enabled ? "Actif" : "Désactivé"}
            </span>
            {feature.enabled ? (
              <ShieldCheck className="w-4 h-4 text-green-500" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
