"use client"

import { useState } from "react";
import { 
  FileText, ShieldCheck, Clock, CheckCircle2, 
  ArrowRight, Landmark, User, PenTool
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SignaturePad from "./SignaturePad";
import OtpVerification from "./OtpVerification";
import { initiateSignature } from "@/actions/signature-actions";

interface SignatureFlowProps {
  documentId: string;
  documentType: "BAIL" | "MANDAT" | "COMPROMIS" | "AUTRE";
  documentRef: string;
  signataireId: string;
  onComplete?: () => void;
}

export default function SignatureFlow({ documentId, documentType, documentRef, signataireId, onComplete }: SignatureFlowProps) {
  const [step, setStep] = useState<"REVIEW" | "SIGNING" | "OTP" | "SUCCESS">("REVIEW");
  const [signatureId, setSignatureId] = useState<string | null>(null);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);

  const handleStartSigning = () => setStep("SIGNING");

  const handleSignatureSaved = async (dataUrl: string) => {
    setSignatureImage(dataUrl);
    const result = await initiateSignature({
      documentType,
      documentId,
      signataireId,
    });

    if (result.success) {
      setSignatureId(result.signatureId || null);
      setStep("OTP");
    }
  };

  const handleOtpSuccess = () => {
    setStep("SUCCESS");
    if (onComplete) {
      setTimeout(onComplete, 3000);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        {step === "REVIEW" && (
          <motion.div 
            key="review"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gray-900 border border-gray-800 rounded-3xl p-10 shadow-2xl"
          >
            <div className="flex justify-between items-start mb-10">
              <div>
                <span className="text-[10px] bg-indigo-500 text-white px-3 py-1 rounded-full font-black uppercase tracking-widest mb-4 inline-block">Étape 1/3 : Lecture</span>
                <h2 className="text-4xl font-black text-white tracking-tighter">Vérification du Document</h2>
              </div>
              <FileText className="w-12 h-12 text-gray-700" />
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="p-6 bg-gray-950 border border-gray-800 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-gray-800 rounded-xl"><Landmark className="w-6 h-6 text-gray-400" /></div>
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase">Référence</p>
                  <p className="text-lg font-black text-white">{documentRef}</p>
                </div>
              </div>
              <div className="p-6 bg-gray-950 border border-gray-800 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-gray-800 rounded-xl"><User className="w-6 h-6 text-gray-400" /></div>
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase">Signataire</p>
                  <p className="text-lg font-black text-white">Prêt pour signature</p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl mb-12">
              <h4 className="text-indigo-400 font-bold mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Certification QAPRIL M-SIGN
              </h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                En cliquant sur signer, vous reconnaissez avoir lu l'intégralité du document. 
                Une vérification par SMS (OTP) sera requise pour finaliser la transaction avec valeur juridique probante.
              </p>
            </div>

            <button 
              onClick={handleStartSigning}
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-lg shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3 group"
            >
              Signer le document
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}

        {step === "SIGNING" && (
          <motion.div 
            key="signing"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gray-900 border border-gray-800 rounded-3xl p-10 shadow-2xl"
          >
            <div className="mb-10 text-center">
              <span className="text-[10px] bg-indigo-500 text-white px-3 py-1 rounded-full font-black uppercase tracking-widest mb-4 inline-block">Étape 2/3 : Signature Digitale</span>
              <h2 className="text-3xl font-black text-white tracking-tight">Apposez votre signature</h2>
              <p className="text-gray-500 mt-2">Utilisez votre doigt ou votre souris pour signer ci-dessous.</p>
            </div>

            <SignaturePad onSave={handleSignatureSaved} onClear={() => setSignatureImage(null)} />

            <div className="mt-8 text-center">
              <button 
                onClick={() => setStep("REVIEW")}
                className="text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-[0.2em] transition-all"
              >
                Retour à la lecture
              </button>
            </div>
          </motion.div>
        )}

        {step === "OTP" && (
          <motion.div key="otp-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <OtpVerification 
              signatureId={signatureId!} 
              onSuccess={handleOtpSuccess} 
              onCancel={() => setStep("SIGNING")} 
            />
          </motion.div>
        )}

        {step === "SUCCESS" && (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 border border-gray-800 rounded-3xl p-16 shadow-2xl text-center"
          >
            <div className="w-24 h-24 bg-green-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 relative">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
              <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1.5, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 bg-green-500/20 rounded-3xl" 
              />
            </div>
            <h2 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase">Signature Réussie</h2>
            <p className="text-gray-400 max-w-sm mx-auto mb-10">
              Votre signature a été authentifiée et certifiée. Le document PDF avec valeur probante est en cours de génération.
            </p>
            <div className="flex justify-center gap-4">
               <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 tracking-widest bg-gray-950 px-4 py-2 rounded-xl border border-gray-800">
                 <ShieldCheck className="w-4 h-4 text-green-500" /> VALIDE
               </div>
               <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 tracking-widest bg-gray-950 px-4 py-2 rounded-xl border border-gray-800 uppercase">
                 <Clock className="w-4 h-4 text-indigo-500" /> {new Date().toLocaleTimeString()}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
