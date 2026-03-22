import { getPropertyById } from "@/actions/properties"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Building2, ShieldCheck, Users, ArrowLeft, Plus } from "lucide-react"
import InviteManagerForm from "@/components/properties/InviteManagerForm"
import ManagersList from "@/components/properties/ManagersList"

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await auth()
    if (!session || !session.user) return null

    const property = await getPropertyById(id)
    if (!property) notFound()

    // Charger les accès existants (Gestionnaires)
    // Note: Utilisation de (prisma as any) pour éviter les erreurs de type tant que le client n'est pas synchro
    const accesses = await (prisma as any).propertyAccess.findMany({
        where: { propertyId: id },
        include: { user: true }
    })

    return (
        <div className="max-w-6xl mx-auto py-10 px-4 space-y-10">
            {/* Nav & Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <Link href="/dashboard/properties" className="flex items-center gap-2 text-gray-400 hover:text-gray-900 mb-4 transition-colors">
                        <ArrowLeft size={16} />
                        <span className="text-xs font-bold uppercase tracking-widest">Retour au patrimoine</span>
                    </Link>
                    <h1 className="text-4xl font-black text-[#1F4E79] tracking-tighter uppercase italic leading-none">
                        {property.propertyCode}
                    </h1>
                    <p className="text-gray-500 font-medium mt-2 flex items-center gap-2">
                        <Building2 size={16} className="text-[#C55A11]" />
                        {property.addressLine1}, {property.commune}
                    </p>
                </div>
                <div className="flex gap-4">
                     <Link 
                        href={`/dashboard/properties/${id}/passport`}
                        className="px-6 py-3 bg-white border border-gray-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
                    >
                        <ShieldCheck size={18} />
                        Passeport Numérique
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left: Stats & Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-panel p-8 rounded-[2rem] border-white/60 shadow-xl">
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Résumé Actif</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-white/50 p-4 rounded-xl">
                                <span className="text-xs font-bold text-gray-500 uppercase">Loyer</span>
                                <span className="font-black text-[#1F4E79]">{Number(property.declaredRentFcfa).toLocaleString()} FCFA</span>
                            </div>
                            <div className="flex justify-between items-center bg-white/50 p-4 rounded-xl">
                                <span className="text-xs font-bold text-gray-500 uppercase">Statut</span>
                                <span className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-black uppercase">Actif</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1F4E79] p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group">
                        <Users className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform" />
                        <h3 className="text-orange-400 font-black text-xs uppercase tracking-widest mb-2">ADD-11 : Multi-Rôles</h3>
                        <p className="text-xs text-blue-100 leading-relaxed font-medium">
                            Partagez la gestion de ce bien avec un intermédiaire ou un agent. Vous gardez la visibilité totale sur les encaissements en temps réel.
                        </p>
                    </div>
                </div>

                {/* Right: Management & Roles */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="glass-panel p-10 rounded-[2.5rem] border-white/40 shadow-2xl">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-[#1F4E79] uppercase tracking-tighter italic">Équipe de Gestion</h2>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Intermédiaires & Agents Terrain</p>
                            </div>
                            <InviteManagerForm propertyId={id} />
                        </div>

                        <ManagersList accesses={accesses} />
                    </section>
                </div>
            </div>
        </div>
    )
}
