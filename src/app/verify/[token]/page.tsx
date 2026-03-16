import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { ShieldCheck, Calendar, MapPin, User, FileText, Hash } from "lucide-react"

export default async function VerifyCertificatePage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params

    const cert = await prisma.certificatFiscal.findUnique({
        where: { qrToken: token },
        include: {
            fiscalDossier: {
                include: {
                    lease: {
                        include: {
                            property: true,
                            landlord: { select: { fullName: true } }
                        }
                    }
                }
            }
        }
    })

    if (!cert) {
        notFound()
    }

    const { fiscalDossier } = cert
    const { lease } = fiscalDossier

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
                {/* Header - Security Vibe */}
                <div className="bg-slate-900 p-8 text-center relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-green-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/20">
                            <ShieldCheck className="w-12 h-12 text-white" />
                        </div>
                        <h1 className="text-xl font-black text-white uppercase tracking-widest">Certificat Vérifié</h1>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Document Officiel QAPRIL · DGI M17</p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-10 space-y-8">
                    {/* Status Badge */}
                    <div className="flex justify-center">
                        <div className="bg-green-100 text-green-700 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-green-200">
                            Status: {cert.status}
                        </div>
                    </div>

                    {/* Main Details */}
                    <div className="space-y-6">
                        <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-100">
                                <FileText className="w-5 h-5 text-slate-400" />
                            </div>
                            <div>
                                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Numéro de Certificat</span>
                                <span className="text-lg font-black text-slate-900">{cert.numeroCertificat}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-100">
                                    <Calendar className="w-5 h-5 text-slate-400" />
                                </div>
                                <div>
                                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Émis le</span>
                                    <span className="text-sm font-black text-slate-900">{new Date(cert.issuedAt).toLocaleDateString('fr-FR')}</span>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-100">
                                    <User className="w-5 h-5 text-slate-400" />
                                </div>
                                <div>
                                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Bailleur</span>
                                    <span className="text-sm font-black text-slate-900 truncate w-full inline-block">{lease.landlord.fullName || "Confidentiel"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-100">
                                <MapPin className="w-5 h-5 text-slate-400" />
                            </div>
                            <div>
                                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Localisation du Logement</span>
                                <span className="text-sm font-bold text-slate-600 line-clamp-2">{lease.property.commune}, {lease.property.address}</span>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100">
                            <div className="flex items-center space-x-3 text-slate-300">
                                <Hash className="w-4 h-4" />
                                <span className="text-[10px] font-mono break-all">{cert.hashSha256}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 bg-slate-50 text-center border-t border-slate-100">
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                        Ce certificat atteste que le bail associé a été enregistré auprès des services de la DGI via QAPRIL Technologies SA sous le régime de l&apos;Article 550 du CGI Côte d&apos;Ivoire.
                    </p>
                </div>
            </div>
        </div>
    )
}
