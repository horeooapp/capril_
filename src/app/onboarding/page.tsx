 
"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { updateProfile } from "@/actions/users"

type Step = 'ROLE' | 'PROFILE' | 'KYC' | 'COMPLETE'

const profiles = [
    { id: 'LANDLORD', title: 'Propriétaire', icon: '🏠', desc: 'Je gère mes propres biens immobiliers.' },
    { id: 'CERTIFIED_AGENCY', title: 'Agence Agréée', icon: '🏢', desc: 'Agence immobilière certifiée avec carte professionnelle.' },
    { id: 'NON_CERTIFIED_AGENCY', title: 'Agence Non Agréée', icon: '🏘️', desc: 'Structure de gestion immobilière en cours de certification.' },
    { id: 'INTERMEDIARY', title: 'Intermédiaire', icon: '🤝', desc: 'Apporteur d\'affaires ou démarcheur indépendant.' },
    { id: 'DIASPORA', title: 'Diaspora', icon: '✈️', desc: 'Ivoirien résidant à l\'étranger gérant des biens au pays.' },
    { id: 'TENANT', title: 'Locataire', icon: '🔑', desc: 'Je cherche ou je loue déjà un logement sur QAPRIL.' },
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
        const steps = ['Rôle', 'Profil', 'Identité']
        const currentIdx = step === 'ROLE' ? 0 : step === 'PROFILE' ? 1 : 2
        return (
            <div className="flex items-center justify-between mb-8 max-w-xs mx-auto">
                {steps.map((s, i) => (
                    <div key={s} className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i <= currentIdx ? 'bg-[#FF8200] text-white' : 'bg-gray-200 text-gray-500'}`}>
                            {i + 1}
                        </div>
                        <span className={`text-[10px] mt-1 font-medium ${i <= currentIdx ? 'text-[#FF8200]' : 'text-gray-400'}`}>{s}</span>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-4">
                    <img src="/logo.png" alt="QAPRIL Logo" className="h-12 w-auto" />
                </div>
                <h2 className="text-center text-3xl font-extrabold text-gray-900">
                    Configuration du compte
                </h2>
                <p className="mt-2 text-center text-sm text-gray-500">
                    Complétez ces étapes pour commencer à utiliser QAPRIL.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {renderProgress()}
                    
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-6">
                            {error}
                        </div>
                    )}

                    {step === 'ROLE' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-black text-slate-800 mb-4 uppercase tracking-tighter">Quel est votre profil ?</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {profiles.map((p) => (
                                    <div 
                                        key={p.id}
                                        onClick={() => setSelectedProfile(p.id)}
                                        className={`border-2 rounded-2xl p-4 cursor-pointer transition-all flex flex-col gap-2 group ${selectedProfile === p.id ? 'border-[#FF8200] bg-orange-50/30' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl group-hover:scale-110 transition-transform">{p.icon}</span>
                                            {selectedProfile === p.id && <div className="w-5 h-5 bg-[#FF8200] rounded-full flex items-center justify-center text-[10px] text-white font-bold">✓</div>}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-[13px] text-slate-900 uppercase tracking-tight">{p.title}</h4>
                                            <p className="text-[10px] leading-tight text-slate-500 mt-1 font-medium italic">{p.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 'PROFILE' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Informations personnelles</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nom complet</label>
                                <input 
                                    type="text" 
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#FF8200] focus:border-[#FF8200] sm:text-sm"
                                    placeholder="Ex: Jean Kouassi"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Adresse e-mail</label>
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#FF8200] focus:border-[#FF8200] sm:text-sm"
                                    placeholder="jean.k@exemple.com"
                                />
                            </div>
                        </div>
                    )}

                    {step === 'KYC' && (
                        <KYCStep onComplete={() => {
                            if (selectedProfile === 'TENANT') router.push('/locataire');
                            else router.push('/dashboard');
                        }} />
                    )}

                    {step !== 'KYC' && (
                        <div className="mt-8">
                            <button
                                onClick={handleNext}
                                disabled={isPending || (step === 'ROLE' && !selectedProfile) || (step === 'PROFILE' && (!fullName || !email))}
                                className="w-full h-14 flex justify-center items-center px-4 border border-transparent rounded-[1.2rem] shadow-xl text-xs font-black uppercase tracking-[0.2em] text-white bg-[#FF8200] hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF8200] disabled:opacity-50 transition-all active:scale-95"
                            >
                                {isPending ? 'Mise à jour du profil...' : 'Suivant : Identité →'}
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
