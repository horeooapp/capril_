import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { User, ShieldCheck, MapPin, Calendar, FileText, ArrowLeft } from "lucide-react"
import Link from "next/link"
import ValidationActions from "../ValidationActions"

export default async function DocumentValidationPage({ params }: { params: { id: string } }) {
    const { id } = await params
    
    const doc = await (prisma as any).identityDocument.findUnique({
        where: { id },
        include: { user: true }
    })

    if (!doc) notFound()

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header / Back */}
            <div className="flex items-center justify-between">
                <Link 
                    href="/admin" 
                    className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-[#1F4E79] transition-colors"
                >
                    <ArrowLeft size={16} />
                    Retour au Cockpit
                </Link>
                <div className="px-4 py-2 bg-[#1F4E79]/5 rounded-full border border-[#1F4E79]/10">
                    <span className="text-[10px] font-black text-[#1F4E79] uppercase tracking-widest">Dossier M-GUARD #{doc.id.slice(0, 8)}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left: Document Info */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="glass-card-premium p-10 rounded-[3rem] border border-white/60 shadow-sm">
                        <div className="flex items-start justify-between mb-10">
                            <div className="space-y-1">
                                <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase mb-2">
                                    Vérification.
                                </h1>
                                <p className="text-gray-500 font-medium">Contrôle de validité de la pièce d&apos;identité.</p>
                            </div>
                            <div className="p-4 bg-orange-50 rounded-2xl">
                                <ShieldCheck className="text-orange-600" size={32} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Type de Document</label>
                                    <div className="flex items-center gap-3 text-lg font-bold text-gray-900">
                                        <FileText className="text-primary" size={20} />
                                        {doc.docType}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Numéro</label>
                                    <div className="text-lg font-bold text-gray-900">{doc.docNumber || "•••• •••• ••••"}</div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nationalité / Pays</label>
                                    <div className="flex items-center gap-3 text-lg font-bold text-gray-900">
                                        <MapPin className="text-primary" size={20} />
                                        {doc.nationality || doc.issuingCountry || "CI"}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date d&apos;Expiration</label>
                                    <div className="flex items-center gap-3 text-lg font-bold text-gray-900">
                                        <Calendar className="text-primary" size={20} />
                                        {doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : "Non spécifié"}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nom Complet (Déclaré)</label>
                                    <div className="text-lg font-bold text-gray-900 uppercase tracking-tight">{doc.user?.fullName || "Utilisateur Inconnu"}</div>
                                </div>
                            </div>
                        </div>

                        {/* Document Preview Placeholder */}
                        <div className="mt-12 aspect-[16/10] bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-4 group hover:bg-white hover:border-primary transition-all cursor-pointer">
                            <div className="p-4 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                                <FileText className="text-gray-300 group-hover:text-primary" size={32} />
                            </div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Visualiser le scan haute-définition</p>
                            <p className="text-[10px] text-gray-300 font-bold italic">Stockage sécurisé AES-256</p>
                        </div>
                    </div>
                </div>

                {/* Right: User Context & Actions */}
                <div className="space-y-8">
                    <div className="glass-card-premium p-8 rounded-[3rem] border border-white/60 shadow-sm">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-100 pb-4">Profil Utilisateur</h3>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                <User size={32} />
                            </div>
                            <div>
                                <h4 className="font-black text-gray-900 uppercase tracking-tighter">{doc.user?.fullName}</h4>
                                <p className="text-xs font-bold text-gray-400">{doc.user?.phone}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Score M-GUARD</span>
                                <span className="text-sm font-black text-primary">94/100</span>
                            </div>
                            <div className="flex justify-between items-center bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Niveau KYC</span>
                                <span className="text-sm font-black text-gray-900">{doc.user?.kycLevel} / 4</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card-premium p-8 rounded-[3rem] border border-white/60 shadow-xl shadow-gray-200/50">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Décision Administrative</h3>
                        <ValidationActions docId={doc.id} currentStatus={doc.status} />
                    </div>
                </div>
            </div>
        </div>
    )
}
