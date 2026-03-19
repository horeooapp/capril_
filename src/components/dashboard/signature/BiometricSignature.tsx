"use client"

import { useState } from "react";
import { 
  Fingerprint, ShieldCheck, 
  Smartphone, AlertCircle, 
  CheckCircle2, Loader2, Link2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { startRegistration, startAuthentication } from "@simplewebauthn/browser";
import { 
  getRegistrationOptions, 
  verifyRegistration, 
  getAuthenticationOptions, 
  verifySignature 
} from "@/actions/webauthn-actions";

interface BiometricSignatureProps {
  userId: string;
  onSuccess: () => void;
}

export default function BiometricSignature({ userId, onSuccess }: BiometricSignatureProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false); // À charger dynamiquement en vrai

  const handleRegister = async () => {
    setLoading(true);
    setError(null);
    try {
      const options = await getRegistrationOptions(userId);
      const attestation = await startRegistration(options as any);
      
      const result = await verifyRegistration(userId, attestation, options.challenge);
      if (result.success) {
        setIsRegistered(true);
      } else {
        setError("Vérification de l'enrôlement échouée.");
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'enregistrement biométrique.");
    }
    setLoading(false);
  };

  const handleSign = async () => {
    setLoading(true);
    setError(null);
    try {
      const options = await getAuthenticationOptions(userId);
      const assertion = await startAuthentication(options as any);
      
      const result = await verifySignature(userId, assertion, options.challenge);
      if (result.success) {
        onSuccess();
      } else {
        setError("Signature biométrique invalide.");
      }
    } catch (err: any) {
      if (!isRegistered) {
         // Si pas enregistré, on bascule sur l'enrôlement
         handleRegister();
      } else {
         setError("Impossible de vérifier l'identité biométrique.");
      }
    }
    setLoading(false);
  };

  return (
    <div className="p-8 bg-gray-950 border border-gray-800 rounded-[2.5rem] text-center shadow-2xl relative overflow-hidden group">
      {/* Background Pulse */}
      <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative z-10">
        <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 ring-8 ring-gray-900/50">
          <Fingerprint className="w-10 h-10 text-indigo-500" />
        </div>

        <h3 className="text-2xl font-black text-white tracking-tighter uppercase mb-2">Signature Biométrique</h3>
        <p className="text-gray-500 text-sm max-w-[250px] mx-auto mb-8 font-medium">
          Utilisez **FaceID** ou **TouchID** pour signer instantanément.
        </p>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-xs text-left"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p className="font-bold uppercase tracking-tighter leading-tight">{error}</p>
          </motion.div>
        )}

        <button
          onClick={handleSign}
          disabled={loading}
          className="w-full py-5 bg-white text-black hover:bg-gray-200 rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-xl transition-all flex items-center justify-center gap-3 group/btn disabled:opacity-30"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
               Activer le Capteur
               <Smartphone className="w-5 h-5 group-hover/btn:translate-y-[-2px] transition-transform" />
            </>
          )}
        </button>

        <div className="mt-8 flex items-center justify-center gap-6 opacity-30 group-hover:opacity-60 transition-opacity">
           <div className="flex items-center gap-2 text-[9px] font-black text-gray-500 uppercase tracking-widest">
             <ShieldCheck className="w-3 h-3 text-green-500" /> FIDO2 Certified
           </div>
           <div className="flex items-center gap-2 text-[9px] font-black text-gray-500 uppercase tracking-widest">
             <Link2 className="w-3 h-3 text-indigo-500" /> WebAuthn L3
           </div>
        </div>
      </div>
    </div>
  );
}
