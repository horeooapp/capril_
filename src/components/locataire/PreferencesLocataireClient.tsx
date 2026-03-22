"use client"

import { useState } from "react"
import { 
    Bell, 
    MessageSquare, 
    Smartphone, 
    CheckCircle2, 
    ShieldCheck,
    Save,
    PhoneCall
} from "lucide-react"
import { updateAlertesPreferences } from "@/actions/locataire-profile"
import { toast } from "sonner"

export default function PreferencesLocataireClient({ profile, userId }: any) {
    const [loading, setLoading] = useState(false)
    const [settings, setSettings] = useState({
        alerteJ3Active: profile?.alerteJ3Active ?? true,
        alerteJ1Active: profile?.alerteJ1Active ?? true,
        canalAlertePref: profile?.canalAlertePref ?? "SMS"
    })

    const handleSave = async () => {
        setLoading(true)
        try {
            await updateAlertesPreferences(userId, settings)
            toast.success("Préférences enregistrées")
        } catch (err) {
            toast.error("Erreur lors de l'enregistrement")
        } finally {
            setLoading(false)
        }
    }

    const canals = [
        { id: "SMS", label: "SMS Classique", icon: <Smartphone size={20} /> },
        { id: "WHATSAPP", label: "WhatsApp Secure", icon: <MessageSquare size={20} className="text-emerald-500" /> },
        { id: "PUSH", label: "Notifications Push", icon: <Bell size={20} className="text-blue-500" /> },
        { id: "TOUS", label: "Tous les canaux", icon: <ShieldCheck size={20} className="text-[#C55A11]" /> }
    ]

    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
             <div className="text-center">
                <h1 className="text-4xl font-black text-[#1F4E79] tracking-tighter uppercase mb-2">Mes Alertes.</h1>
                <p className="text-gray-500 font-medium">Configurez vos rappels de loyer et vos modes de communication.</p>
            </div>

            <div className="grid gap-8">
                {/* Rappels temporels */}
                <div className="glass-panel p-8 rounded-[3rem] border border-white/40 shadow-xl bg-white space-y-8">
                    <h2 className="text-xl font-black text-[#1F4E79] uppercase tracking-tight flex items-center gap-3">
                        <Bell size={24} className="text-[#C55A11]" />
                        Délais de Rappel
                    </h2>
                    
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors group">
                            <div>
                                <h4 className="font-black text-[#1F4E79] uppercase tracking-tight">Rappel J-3</h4>
                                <p className="text-[13px] text-gray-400 font-medium italic">Anticipation : 3 jours avant l'échéance.</p>
                            </div>
                            <button 
                                onClick={() => setSettings({...settings, alerteJ3Active: !settings.alerteJ3Active})}
                                className={`w-14 h-8 rounded-full relative transition-all shadow-inner ${settings.alerteJ3Active ? 'bg-[#375623]' : 'bg-gray-200'}`}
                            >
                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${settings.alerteJ3Active ? 'right-1' : 'left-1'}`}></div>
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors group">
                            <div>
                                <h4 className="font-black text-[#1F4E79] uppercase tracking-tight">Rappel J-1</h4>
                                <p className="text-[13px] text-gray-400 font-medium italic">Vigilance : 24h avant l'échéance.</p>
                            </div>
                            <button 
                                onClick={() => setSettings({...settings, alerteJ1Active: !settings.alerteJ1Active})}
                                className={`w-14 h-8 rounded-full relative transition-all shadow-inner ${settings.alerteJ1Active ? 'bg-[#375623]' : 'bg-gray-200'}`}
                            >
                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${settings.alerteJ1Active ? 'right-1' : 'left-1'}`}></div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Choix du canal */}
                <div className="glass-panel p-8 rounded-[3rem] border border-white/40 shadow-xl bg-white space-y-8">
                    <h2 className="text-xl font-black text-[#1F4E79] uppercase tracking-tight flex items-center gap-3">
                        <PhoneCall size={24} className="text-[#1F4E79]" />
                        Mode de Réception
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {canals.map((canal) => (
                            <button 
                                key={canal.id}
                                onClick={() => setSettings({...settings, canalAlertePref: canal.id})}
                                className={`p-6 rounded-[2rem] border-2 transition-all flex items-center gap-4 ${
                                    settings.canalAlertePref === canal.id 
                                    ? 'border-[#1F4E79] bg-blue-50/50 shadow-lg' 
                                    : 'border-gray-50 bg-white hover:border-gray-100'
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${settings.canalAlertePref === canal.id ? 'bg-[#1F4E79] text-white' : 'bg-gray-50 text-gray-400'}`}>
                                    {canal.icon}
                                </div>
                                <span className={`font-black uppercase tracking-widest text-[12px] ${settings.canalAlertePref === canal.id ? 'text-[#1F4E79]' : 'text-gray-400'}`}>
                                    {canal.label}
                                </span>
                                {settings.canalAlertePref === canal.id && <CheckCircle2 size={16} className="ml-auto text-[#1F4E79]" />}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex justify-center pt-8">
                    <button 
                        onClick={handleSave}
                        disabled={loading}
                        className="px-12 py-5 bg-[#1F4E79] text-white rounded-[2rem] font-black uppercase tracking-widest text-[14px] hover:bg-black transition-all shadow-2xl active:scale-95 flex items-center gap-3"
                    >
                        <Save size={20} />
                        {loading ? "Enregistrement..." : "Enregistrer les modifications"}
                    </button>
                </div>
            </div>

            <div className="p-8 bg-[#375623]/10 rounded-[2.5rem] border border-[#375623]/20 flex items-start gap-4">
                 <ShieldCheck size={28} className="text-[#375623] mt-1" />
                 <div>
                     <p className="text-[14px] font-bold text-[#375623] mb-1 italic">Engagement Sérénité QAPRIL</p>
                     <p className="text-[13px] text-gray-600 font-medium">Ces alertes ne sont pas des relances de recouvrement mais un service d'accompagnement pour maintenir votre score ICL à son plus haut niveau.</p>
                 </div>
            </div>
        </div>
    )
}
