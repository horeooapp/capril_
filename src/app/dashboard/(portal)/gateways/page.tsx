"use client";

import React, { useState } from "react";
import { Send, Smartphone, Mail, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { testSMSGateway, testEmailGateway } from "@/actions/gateway.actions";
import { toast } from "sonner";

export default function GatewaysTestPage() {
    const [smsPhone, setSmsPhone] = useState("");
    const [smsMessage, setSmsMessage] = useState("[QAPRIL] Test de configuration SMS");
    const [smsProvider, setSmsProvider] = useState("");
    const [isTestingSms, setIsTestingSms] = useState(false);

    const [emailAddress, setEmailAddress] = useState("");
    const [emailSubject, setEmailSubject] = useState("Test de Configuration QAPRIL");
    const [emailHtml, setEmailHtml] = useState("<p>Ceci est un test de la passerelle e-mail de <b>QAPRIL</b>.</p>");
    const [isTestingEmail, setIsTestingEmail] = useState(false);

    const handleTestSMS = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsTestingSms(true);
        try {
            const res = await testSMSGateway(smsPhone, smsMessage, smsProvider || undefined);
            if (res.success) {
                toast.success(res.message);
            } else {
                toast.error(res.error || "Échec de l'envoi");
            }
        } finally {
            setIsTestingSms(false);
        }
    };

    const handleTestEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsTestingEmail(true);
        try {
            const res = await testEmailGateway(emailAddress, emailSubject, emailHtml);
            if (res.success) {
                toast.success(`E-mail envoyé via ${res.provider?.toUpperCase()}`);
            } else {
                toast.error(res.error || "Échec de l'envoi");
            }
        } finally {
            setIsTestingEmail(false);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter">
                    Routing & Passerelles
                </h1>
                <p className="text-[13.5px] font-medium text-slate-500 mt-1">
                    Interface de test pour les intégrations SMS (Orange, Africa's Talking, Twilio) et E-mail (Resend, SendGrid, SMTP).
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* TEST SMS */}
                <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-[12px] flex items-center justify-center border border-amber-200">
                            <Smartphone size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900">Test SMS</h2>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Routeur SMS Global</p>
                        </div>
                    </div>

                    <form onSubmit={handleTestSMS} className="space-y-4">
                        <div>
                            <label className="block text-[12px] font-bold text-slate-700 mb-1">Numéro de Téléphone (avec indicatif)</label>
                            <input 
                                type="text" 
                                required
                                placeholder="+22500000000"
                                value={smsPhone}
                                onChange={e => setSmsPhone(e.target.value)}
                                className="w-full border border-slate-200 rounded-[10px] px-4 py-2.5 text-[14px] bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-[12px] font-bold text-slate-700 mb-1">Passerelle Forcée (Optionnel)</label>
                            <select 
                                value={smsProvider}
                                onChange={e => setSmsProvider(e.target.value)}
                                className="w-full border border-slate-200 rounded-[10px] px-4 py-2.5 text-[14px] bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                            >
                                <option value="">Automatique (Fallback)</option>
                                <option value="HSMS">HSMS (Côte d'Ivoire)</option>
                                <option value="ORANGE">Orange CI</option>
                                <option value="AFRICASTALKING">Africa's Talking</option>
                                <option value="TWILIO">Twilio</option>
                            </select>
                            <p className="text-[10px] text-slate-400 mt-1 font-medium">Si vide, le système tentera HSMS, puis Orange, puis Africa's Talking, puis Twilio.</p>
                        </div>
                        <div>
                            <label className="block text-[12px] font-bold text-slate-700 mb-1">Contenu du message</label>
                            <textarea 
                                required
                                value={smsMessage}
                                onChange={e => setSmsMessage(e.target.value)}
                                className="w-full border border-slate-200 rounded-[10px] px-4 py-2.5 text-[14px] bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none transition-all min-h-[100px]"
                            />
                        </div>
                        <button 
                            disabled={isTestingSms}
                            type="submit" 
                            className="w-full bg-slate-900 text-white py-3.5 rounded-[12px] font-bold text-[12px] uppercase tracking-widest hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                        >
                            {isTestingSms ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            Envoyer le SMS
                        </button>
                    </form>
                </div>

                {/* TEST EMAIL */}
                <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-[12px] flex items-center justify-center border border-sky-200">
                            <Mail size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900">Test E-mail</h2>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Routeur E-mail Premium</p>
                        </div>
                    </div>

                    <form onSubmit={handleTestEmail} className="space-y-4">
                        <div>
                            <label className="block text-[12px] font-bold text-slate-700 mb-1">Adresse E-mail de destination</label>
                            <input 
                                type="email" 
                                required
                                placeholder="test@domaine.com"
                                value={emailAddress}
                                onChange={e => setEmailAddress(e.target.value)}
                                className="w-full border border-slate-200 rounded-[10px] px-4 py-2.5 text-[14px] bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-[12px] font-bold text-slate-700 mb-1">Objet de l'e-mail</label>
                            <input 
                                type="text" 
                                required
                                value={emailSubject}
                                onChange={e => setEmailSubject(e.target.value)}
                                className="w-full border border-slate-200 rounded-[10px] px-4 py-2.5 text-[14px] bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-[12px] font-bold text-slate-700 mb-1">Contenu HTML</label>
                            <textarea 
                                required
                                value={emailHtml}
                                onChange={e => setEmailHtml(e.target.value)}
                                className="w-full border border-slate-200 rounded-[10px] px-4 py-2.5 text-[14px] bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none transition-all min-h-[100px] font-mono text-[12px]"
                            />
                            <p className="text-[10px] text-slate-400 mt-1 font-medium">L'envoi tentera Resend, puis SendGrid, puis le relais SMTP.</p>
                        </div>
                        <button 
                            disabled={isTestingEmail}
                            type="submit" 
                            className="w-full bg-sky-600 text-white py-3.5 rounded-[12px] font-bold text-[12px] uppercase tracking-widest hover:bg-sky-700 transition-colors flex items-center justify-center gap-2"
                        >
                            {isTestingEmail ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            Envoyer l'E-mail
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
