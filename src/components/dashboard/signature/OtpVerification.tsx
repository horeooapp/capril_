"use client"

import { useState, useRef, useEffect } from "react";
import { ShieldCheck, MessageSquare, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { validateSignature } from "@/actions/signature-actions";

interface OtpVerificationProps {
  signatureId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function OtpVerification({ signatureId, onSuccess, onCancel }: OtpVerificationProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      setError("Veuillez saisir le code complet à 6 chiffres.");
      return;
    }

    setLoading(true);
    setError(null);
    
    // Simulate IP and User Agent for proof
    const meta = {
      ip: "127.0.0.1", // In real world, get from headers/client
      userAgent: window.navigator.userAgent,
    };

    const result = await validateSignature(signatureId, code, meta);
    
    if (result.success) {
      onSuccess();
    } else {
      setError(result.error || "Une erreur est survenue.");
      setOtp(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-gray-900 border border-gray-800 w-full max-w-md rounded-3xl p-8 shadow-2xl text-center"
      >
        <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <MessageSquare className="w-8 h-8 text-indigo-500" />
        </div>

        <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Vérification par SMS</h2>
        <p className="text-sm text-gray-400 mb-8">Un code à 6 chiffres vous a été envoyé pour authentifier votre signature.</p>

        <div className="flex justify-center gap-2 mb-8">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => { inputs.current[idx] = el; }}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-12 h-14 bg-gray-800 border-2 border-gray-700 rounded-xl text-center text-xl font-black text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-inner"
            />
          ))}
        </div>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-xs font-bold"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleVerify}
            disabled={loading || otp.some(d => !d)}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-indigo-600/20 disabled:opacity-30 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
            Vérifier & Finaliser
          </button>
          
          <button
            onClick={onCancel}
            disabled={loading}
            className="w-full py-4 bg-transparent text-gray-500 hover:text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all"
          >
            Annuler
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800">
          <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">
            Sécurité QAPRIL • Valeur Probante Certifiée
          </p>
        </div>
      </motion.div>
    </div>
  );
}
