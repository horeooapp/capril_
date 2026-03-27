 
"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { updateProfile } from "@/actions/users"
import { ArrowLeft, ArrowRight } from "lucide-react"

type Step = 'ROLE' | 'PROFILE' | 'KYC' | 'COMPLETE'

const profiles = [
    { id: 'LANDLORD', title: 'Propriétaire', icon: '🏠', desc: 'Gestion de patrimoine propre.' },
    { id: 'CERTIFIED_AGENCY', title: 'Agence Agréée', icon: '🏢', desc: 'Certification & carte professionnelle.' },
    { id: 'NON_CERTIFIED_AGENCY', title: 'Agence Non Agréée', icon: '🏘️', desc: 'Structure en cours de certification.' },
    { id: 'INTERMEDIARY', title: 'Intermédiaire', icon: '🤝', desc: 'Apporteur d\'affaires indépendant.' },
    { id: 'DIASPORA', title: 'Diaspora', icon: '✈️', desc: 'Ivoirien résidant à l\'étranger.' },
]

export default function OnboardingPage() {
    const [step, setStep] = useState<Step>('ROLE')
    const [selectedProfile, setSelectedProfile] = useState<string | null>(null)
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleNext = () => {
        setError(null)
        if (step === 'ROLE' && selectedProfile) {
            setStep('PROFILE')
        } else if (step === 'PROFILE' && fullName && email) {
            startTransition(async () => {
                const result = await updateProfile({ fullName, email, profileType: selectedProfile! })
                if (result.success) {
                    setStep('KYC')
                } else {
                    setError(result.error || "Erreur lors de la mise à jour du profil.")
                }
            })
        }
    }

    const renderProgress = () => {
        const steps = ['Type d\'accès', 'Profil', 'Identité']
        const currentIdx = step === 'ROLE' ? 0 : step === 'PROFILE' ? 1 : 2
        return (
            <div className="flex items-center justify-between mb-12 max-w-sm mx-auto">
                {steps.map((s, i) => (
                    <div key={s} className="flex flex-col items-center relative group">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black transition-all ${i <= currentIdx ? 'bg-[#C55A11] text-white shadow-lg shadow-orange-950/20' : 'bg-white/50 text-gray-400 border border-gray-100'}`}>
                            {i + 1}
                        </div>
                        <span className={`text-[9px] mt-2 font-black uppercase tracking-widest ${i <= currentIdx ? 'text-[#C55A11]' : 'text-gray-400'}`}>{s}</span>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="min-h-screen relative flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans overflow-hidden">
            {/* Mesh Background (Admin Style) */}
            <div className="fixed inset-0 bg-mesh -z-20 opacity-80"></div>
            <div className="fixed inset-0 bg-ivory-pattern opacity-30 -z-10 animate-pulse-slow"></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
                <div className="flex justify-center mb-8">
                    <img src="/logo.png" alt="QAPRIL Logo" className="h-16 w-auto drop-shadow-2xl" />
                </div>
                <div className="text-center space-y-4 mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-md border border-white/50 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-[#C55A11] shadow-sm">
                        Certification État Ivroirien
                    </div>
                    <h2 className="text-5xl lg:text-6xl font-[1000] text-[#1F4E79] tracking-tighter uppercase leading-none">
                        Configuration <br />
                        <span className="italic font-serif normal-case text-gray-900">de votre supervision.</span>
                    </h2>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-4xl relative z-10 px-4">
                <div className="glass-card-premium py-12 px-8 sm:px-16 rounded-[3rem] border border-white/50 shadow-2xl">
                    {renderProgress()}
                    
                    {error && (
                        <div className="bg-red-50/50 backdrop-blur-md border border-red-100 text-red-600 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest mb-10 flex items-center gap-3 animate-shake">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            {error}
                        </div>
                    )}

                    {step === 'ROLE' && (
                        <div className="space-y-10">
                            <div className="text-center border-b border-gray-100 pb-8 mb-8">
                                <h3 className="text-2xl font-black text-[#1F4E79] uppercase tracking-tighter italic">Choisissez votre profil.</h3>
                                <p className="text-[14px] text-gray-400 font-medium">Déterminez votre niveau d'accès à l'infrastructure.</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {profiles.map((p) => (
                                    <div 
                                        key={p.id}
                                        onClick={() => setSelectedProfile(p.id)}
                                        className={`glass-card-premium p-8 cursor-pointer transition-all flex flex-col gap-6 relative group border ${selectedProfile === p.id ? 'border-[#C55A11] bg-orange-50/20' : 'border-white/40 hover:border-gray-200 bg-white/30'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform ${selectedProfile === p.id ? 'bg-[#C55A11] text-white' : 'bg-gray-100'}`}>
                                                {p.icon}
                                            </div>
                                            {selectedProfile === p.id && (
                                                <div className="w-6 h-6 bg-[#C55A11] rounded-xl flex items-center justify-center text-[10px] text-white font-bold shadow-lg shadow-orange-950/20">✓</div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-[1000] text-[16px] text-gray-900 uppercase tracking-tighter italic leading-none mb-2">{p.title}</h4>
                                            <p className="text-[11px] leading-relaxed text-gray-500 font-medium uppercase tracking-widest opacity-60">{p.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 'PROFILE' && (
                        <div className="max-w-md mx-auto space-y-8 py-8 text-center">
                             <div className="mb-12">
                                <h3 className="text-3xl font-black text-[#1F4E79] uppercase tracking-tighter italic">Informations d'identité.</h3>
                                <p className="text-[14px] text-gray-400 font-medium">Saisissez vos informations officielles.</p>
                            </div>
                            
                            <div className="space-y-6 text-left">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nom Complet (État Civil)</label>
                                    <input 
                                        type="text" 
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="block w-full px-6 py-5 bg-white/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-[#C55A11] outline-none transition-all font-bold text-gray-900"
                                        placeholder="Ex: Jean Kouassi"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Adresse E-mail de Supervision</label>
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full px-6 py-5 bg-white/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-[#C55A11] outline-none transition-all font-bold text-gray-900"
                                        placeholder="votre@email.com"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'KYC' && (
                        <KYCStep onComplete={() => {
                            router.push('/dashboard');
                        }} />
                    )}

                    {step !== 'KYC' && (
                        <div className="mt-16 flex justify-center">
                            <button
                                onClick={handleNext}
                                disabled={isPending || (step === 'ROLE' && !selectedProfile) || (step === 'PROFILE' && (!fullName || !email))}
                                className="px-16 py-6 bg-gray-900 hover:bg-black text-white rounded-3xl shadow-2xl shadow-gray-900/20 text-[11px] font-black uppercase tracking-[0.3em] transition-all active:scale-95 disabled:opacity-30 disabled:grayscale flex items-center gap-4"
                            >
                                {isPending ? 'Mise à jour...' : (
                                    <>
                                        {step === 'ROLE' ? 'Confirmer mon choix' : 'Passer à l\'identité'}
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function KYCStep({ onComplete }: { onComplete: () => void }) {
    const [file, setFile] = useState<File | null>(null)
    const [docType, setDocType] = useState('CNI')
    const [mrzLine1, setMrzLine1] = useState('')
    const [mrzLine2, setMrzLine2] = useState('')
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleUpload = async () => {
        if (!file) return
        setIsUploading(true)
        setError(null)
        
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('docType', docType)
            if (docType === 'PASSPORT') {
                formData.append('mrzLine1', mrzLine1)
                formData.append('mrzLine2', mrzLine2)
            }

            const res = await fetch('/api/v1/kyc/upload', {
                method: 'POST',
                body: formData
            })

            if (res.ok) {
                onComplete()
            } else {
                const data = await res.json()
                setError(data.error || "Échec du téléchargement")
            }
        } catch (e) {
            setError("Erreur réseau")
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Vérification d&apos;identité</h3>
            <p className="text-xs text-gray-500">Conformément à la réglementation (Partie 4 du spec), nous devons vérifier votre identité.</p>
            
            <div>
                <label className="block text-sm font-medium text-gray-700">Type de document</label>
                <select 
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#FF8200] focus:border-[#FF8200] sm:text-sm"
                >
                    <option value="CNI">Carte Nationale d&apos;Identité (CNI)</option>
                    <option value="PASSPORT">Passeport</option>
                    <option value="DRIVING_LICENSE">Permis de conduire</option>
                </select>
            </div>

            {docType === 'PASSPORT' && (
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Lignes MRZ (Bas du passeport)</label>
                    <input 
                        type="text" 
                        maxLength={44}
                        placeholder="Ligne 1 (44 caractères)"
                        value={mrzLine1}
                        onChange={(e) => setMrzLine1(e.target.value.toUpperCase())}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#FF8200] focus:border-[#FF8200] sm:text-xs font-mono"
                    />
                    <input 
                        type="text" 
                        maxLength={44}
                        placeholder="Ligne 2 (44 caractères)"
                        value={mrzLine2}
                        onChange={(e) => setMrzLine2(e.target.value.toUpperCase())}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#FF8200] focus:border-[#FF8200] sm:text-xs font-mono"
                    />
                </div>
            )}

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#FF8200] transition-all cursor-pointer relative">
                <input 
                    type="file" 
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    id="doc-upload" 
                />
                <div>
                    {file ? (
                        <div className="text-sm font-medium text-[#FF8200]">{file.name}</div>
                    ) : (
                        <div>
                            <span className="text-2xl text-gray-400">📄</span>
                            <div className="mt-2 text-sm text-gray-600">Cliquez pour scanner ou uploader</div>
                        </div>
                    )}
                </div>
            </div>

            <button
                onClick={handleUpload}
                disabled={!file || isUploading || (docType === 'PASSPORT' && (mrzLine1.length !== 44 || mrzLine2.length !== 44))}
                className="w-full mt-4 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all"
            >
                {isUploading ? 'Téléchargement...' : 'Soumettre mon identité'}
            </button>
            <button
                onClick={onComplete}
                className="w-full text-xs text-gray-400 hover:text-gray-600 py-2"
            >
                Passer pour le moment
            </button>

            {error && <p className="text-xs text-red-500 text-center">{error}</p>}
        </div>
    )
}
