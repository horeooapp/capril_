"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
    User, 
    Briefcase, 
    Search, 
    ShieldCheck, 
    Eye, 
    ChevronRight, 
    ChevronLeft,
    CheckCircle2,
    Upload,
    MapPin,
    Wallet,
    Info
} from "lucide-react"
import { toast } from "sonner"
import { completeOnboarding } from "@/actions/locataire-profil-public"

interface TenantOnboardingClientProps {
    session: any
}

const STEPS = [
    { title: "Profil", icon: <User size={20} /> },
    { title: "Situation", icon: <Briefcase size={20} /> },
    { title: "Recherche", icon: <Search size={20} /> },
    { title: "Identité", icon: <ShieldCheck size={20} /> },
    { title: "Visibilité", icon: <Eye size={20} /> }
]

export default function TenantOnboardingClient({ session }: TenantOnboardingClientProps) {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(0)
    const [isPending, startTransition] = useTransition()
    
    // Form State
    const [formData, setFormData] = useState({
        fullName: session.user.fullName || "",
        email: session.user.email || "",
        city: "",
        statutPro: "SALARIE",
        revenuFourchette: "150K-300K",
        employeur: "",
        budgetMaxFcfa: 150000,
        communesSouhaitees: [] as string[],
        typeLogement: [] as string[],
        docType: "CNI",
        file: null as File | null,
        visibilite: "TOUS"
    })

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1)
            window.scrollTo(0, 0)
        }
    }

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }

    const onFinish = () => {
        startTransition(async () => {
            const profilData = {
                statutPro: formData.statutPro,
                revenuFourchette: formData.revenuFourchette,
                budgetMaxFcfa: formData.budgetMaxFcfa,
                city: formData.city,
                communesSouhaitees: formData.communesSouhaitees,
                typeLogement: formData.typeLogement,
                visibilite: formData.visibilite
            }

            const result = await completeOnboarding(session.user.id, {
                fullName: formData.fullName,
                email: formData.email,
                profilData
            })

            if (result.success) {
                toast.success("Bienvenue sur QAPRIL !")
                // Force a hard redirect to ensure session is refreshed and dashboard loads correctly
                window.location.href = "/locataire"
            } else {
                toast.error(result.error || "Erreur lors de la sauvegarde")
            }
        })
    }

    const renderStepContent = () => {
        switch (currentStep) {
            case 0: return <IdentityStep data={formData} update={setFormData} />
            case 1: return <ProfessionalStep data={formData} update={setFormData} />
            case 2: return <SearchCriteriaStep data={formData} update={setFormData} />
            case 3: return <KYCStep data={formData} update={setFormData} />
            case 4: return <VisibilityStep data={formData} update={setFormData} />
            default: return null
        }
    }

    return (
        <div className="w-full max-w-2xl mx-auto space-y-8">
            {/* Header Onboarding */}
            <div className="text-center space-y-2">
                <div className="flex justify-center mb-6">
                    <div className="bg-[#1F4E79] p-3 rounded-2xl shadow-xl rotate-3">
                        <span className="text-white font-black text-xl tracking-tighter">QA</span>
                    </div>
                </div>
                <h1 className="text-3xl font-black text-[#1F4E79] uppercase tracking-tighter italic">Configurez votre Passeport Locatif</h1>
                <p className="text-gray-500 font-medium">Complétez ces 5 étapes pour activer votre matching pro.</p>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center justify-between px-2">
                {STEPS.map((step, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-2 group">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${idx <= currentStep ? 'bg-[#1F4E79] text-white shadow-lg' : 'bg-gray-200 text-gray-400'}`}>
                            {idx < currentStep ? <CheckCircle2 size={20} /> : step.icon}
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${idx <= currentStep ? 'text-[#1F4E79]' : 'text-gray-300'}`}>
                            {step.title}
                        </span>
                    </div>
                ))}
            </div>

            {/* Content Area */}
            <div className="glass-panel p-8 sm:p-12 rounded-[2.5rem] border border-white/40 shadow-2xl bg-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="min-h-[350px]"
                    >
                        {renderStepContent()}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="mt-12 flex gap-4">
                    {currentStep > 0 && (
                        <button
                            onClick={handleBack}
                            className="flex-1 py-4 px-6 rounded-2xl border-2 border-gray-100 font-black uppercase text-[12px] tracking-widest text-gray-400 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                        >
                            <ChevronLeft size={18} />
                            Retour
                        </button>
                    )}
                    
                    {currentStep < STEPS.length - 1 ? (
                        <button
                            onClick={handleNext}
                            className="flex-[2] py-4 px-6 rounded-2xl bg-[#1F4E79] font-black uppercase text-[12px] tracking-widest text-white shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                            Continuer
                            <ChevronRight size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={onFinish}
                            disabled={isPending}
                            className="flex-[2] py-4 px-6 rounded-2xl bg-emerald-600 font-black uppercase text-[12px] tracking-widest text-white shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                        >
                            {isPending ? "Initialisation..." : "Activer mon Profil"}
                            <CheckCircle2 size={18} />
                        </button>
                    )}
                </div>
            </div>
            
            <p className="text-center text-[10px] text-gray-400 uppercase font-black tracking-[0.2em]">Sécurisé par QAPRIL Intelligence • 2024</p>
        </div>
    )
}

// ---- Steps Components ----

function IdentityStep({ data, update }: any) {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-black text-[#1F4E79] uppercase tracking-tighter">Vos Informations</h2>
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest pl-1">Nom Complet</label>
                    <input 
                        type="text" 
                        value={data.fullName}
                        onChange={(e) => update({...data, fullName: e.target.value})}
                        className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-[#1F4E79]"
                        placeholder="Ex: Jean Kouassi"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest pl-1">Ville de résidence actuelle</label>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            value={data.city}
                            onChange={(e) => update({...data, city: e.target.value})}
                            className="w-full p-4 pl-12 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-[#1F4E79]"
                            placeholder="Abidjan, Yamoussoukro..."
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

function ProfessionalStep({ data, update }: any) {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-black text-[#1F4E79] uppercase tracking-tighter italic flex items-center gap-2">
                <Briefcase className="text-primary" />
                Profil Professionnel
            </h2>
            <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest pl-1">Votre Statut</label>
                    <select 
                        value={data.statutPro}
                        onChange={(e) => update({...data, statutPro: e.target.value})}
                        className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-[#1F4E79]"
                    >
                        <option value="SALARIE">Salarié (CDI/CDD)</option>
                        <option value="INDEPENDANT">Entrepreneur / Freelance</option>
                        <option value="FONCTIONNAIRE">Fonctionnaire</option>
                        <option value="INFORMEL">Activité Informelle</option>
                        <option value="ETUDIANT">Étudiant</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest pl-1">Revenu Mensuel (FCFA)</label>
                    <div className="relative">
                        <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <select 
                            value={data.revenuFourchette}
                            onChange={(e) => update({...data, revenuFourchette: e.target.value})}
                            className="w-full p-4 pl-12 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-[#1F4E79]"
                        >
                            <option value="0-100K">Moins de 100k</option>
                            <option value="100K-250K">100k - 250k</option>
                            <option value="250K-500K">250k - 500k</option>
                            <option value="500K-1M">500k - 1M</option>
                            <option value="1M+">Plus de 1M</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    )
}

function SearchCriteriaStep({ data, update }: any) {
    const communes = ["Cocody", "Riviera", "Plateau", "Marcory", "Yopougon", "Abobo", "Bingerville"]
    
    const toggleCommune = (c: string) => {
        const current = data.communesSouhaitees
        if (current.includes(c)) update({...data, communesSouhaitees: current.filter((x:any) => x !== c)})
        else update({...data, communesSouhaitees: [...current, c]})
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-black text-[#1F4E79] uppercase tracking-tighter italic">Quelles zones visez-vous ?</h2>
            <div className="flex flex-wrap gap-2">
                {communes.map(c => (
                    <button
                        key={c}
                        onClick={() => toggleCommune(c)}
                        className={`px-4 py-2 rounded-full text-[12px] font-black uppercase tracking-widest transition-all ${data.communesSouhaitees.includes(c) ? 'bg-[#1F4E79] text-white shadow-md' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                    >
                        {c}
                    </button>
                ))}
            </div>
            <div className="space-y-2 pt-4">
                <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest pl-1">Budget Max Mensuel (FCFA)</label>
                <input 
                    type="range" 
                    min="50000" 
                    max="1000000" 
                    step="25000"
                    value={data.budgetMaxFcfa}
                    onChange={(e) => update({...data, budgetMaxFcfa: parseInt(e.target.value)})}
                    className="w-full accent-[#1F4E79]"
                />
                <div className="text-right font-black text-[#1F4E79] text-xl tracking-tighter">
                    {data.budgetMaxFcfa.toLocaleString()} FCFA
                </div>
            </div>
        </div>
    )
}

function KYCStep({ data, update }: any) {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-black text-[#1F4E79] uppercase tracking-tighter">Identité Certifiée</h2>
            <p className="text-sm text-gray-400 font-medium">Pour protéger la communauté, QAPRIL vérifie chaque profil.</p>
            
            <div className="space-y-4">
                <select 
                    value={data.docType}
                    onChange={(e) => update({...data, docType: e.target.value})}
                    className="w-full p-4 rounded-2xl bg-gray-50 border-none font-bold text-[#1F4E79]"
                >
                    <option value="CNI">Carte Nationale d&apos;Identité</option>
                    <option value="PASSPORT">Passeport</option>
                    <option value="ATTESTATION">Attestation d&apos;identité</option>
                </select>

                <label className="border-4 border-dashed border-gray-100 rounded-[2rem] p-10 flex flex-col items-center justify-center gap-4 hover:border-blue-100 transition-all cursor-pointer bg-slate-50 relative group">
                    <input 
                        type="file" 
                        onChange={(e) => update({...data, file: e.target.files?.[0] || null})}
                        className="hidden"
                    />
                    <div className="bg-white p-4 rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                        <Upload className="text-blue-500" size={32} />
                    </div>
                    <div className="text-center">
                        <p className="font-black text-[#1F4E79] uppercase text-[12px] tracking-widest">
                            {data.file ? data.file.name : "Scanner mon document"}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">PDF, JPG ou PNG (Max 5Mo)</p>
                    </div>
                </label>
            </div>
        </div>
    )
}

function VisibilityStep({ data, update }: any) {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-black text-[#1F4E79] uppercase tracking-tighter italic">Visibilité & Diffusion</h2>
            
            <div className="grid grid-cols-1 gap-3">
                <button 
                    onClick={() => update({...data, visibilite: 'TOUS'})}
                    className={`p-6 rounded-3xl flex items-center gap-6 border-2 transition-all text-left ${data.visibilite === 'TOUS' ? 'border-[#1F4E79] bg-white shadow-xl' : 'border-gray-50 bg-gray-50/50'}`}
                >
                    <div className={`p-3 rounded-2xl ${data.visibilite === 'TOUS' ? 'bg-[#1F4E79] text-white shadow-lg' : 'bg-gray-200 text-gray-400'}`}>
                        <Eye size={24} />
                    </div>
                    <div>
                        <p className="font-black uppercase text-[13px] tracking-widest text-[#1F4E79]">Profil Public (Reco)</p>
                        <p className="text-[11px] text-gray-400 font-medium">Les agences agréées pourront vous proposer des bais en matching.</p>
                    </div>
                </button>

                <button 
                    onClick={() => update({...data, visibilite: 'INVISIBLE'})}
                    className={`p-6 rounded-3xl flex items-center gap-6 border-2 transition-all text-left ${data.visibilite === 'INVISIBLE' ? 'border-[#1F4E79] bg-white shadow-xl' : 'border-gray-50 bg-gray-50/50'}`}
                >
                    <div className={`p-3 rounded-2xl ${data.visibilite === 'INVISIBLE' ? 'bg-[#1F4E79] text-white shadow-lg' : 'bg-gray-200 text-gray-400'}`}>
                        <Info size={24} />
                    </div>
                    <div>
                        <p className="font-black uppercase text-[13px] tracking-widest text-[#1F4E79]">Profil Privé</p>
                        <p className="text-[11px] text-gray-400 font-medium">Vous restez discret. Seuls les bailleurs que vous scannez vous verront.</p>
                    </div>
                </button>
            </div>

            <div className="bg-emerald-50 p-4 rounded-2xl flex gap-4 items-center">
                <ShieldCheck className="text-emerald-500 shrink-0" />
                <p className="text-[11px] text-emerald-800 font-bold uppercase tracking-widest leading-relaxed">
                    Protection QAPRIL active : Vos données de défaut de paiement ne sont jamais visibles par des tiers.
                </p>
            </div>
        </div>
    )
}
