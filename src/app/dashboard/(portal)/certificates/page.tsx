import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { FileBadge, ArrowRight, Home, User, Calendar } from "lucide-react"

export const metadata = {
    title: 'Certificats Locatifs | QAPRIL'
}

export default async function CertificatesIndexPage() {
    const session = await auth()
    if (!session?.user) redirect("/api/auth/signin")

    const userId = session.user.id

    // Fetch leases where the user is landlord or manager
    const leases = await prisma.lease.findMany({
        where: {
            OR: [
                { property: { ownerUserId: userId } },
                { property: { managedByUserId: userId } }
            ]
        },
        include: {
            property: true,
            tenant: true
        },
        orderBy: {
            startDate: 'desc'
        }
    })

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl font-black text-qnavy-dark tracking-tight uppercase">Certificats Locatifs</h1>
                    <p className="text-sm text-gray-500 font-medium">Générez et vérifiez les preuves numériques de vos baux et locataires.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {leases.length === 0 ? (
                    <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <FileBadge className="mx-auto text-gray-400 mb-4" size={48} />
                        <p className="text-gray-500 font-medium">Aucun bail actif trouvé pour la génération de certificats.</p>
                    </div>
                ) : (
                    leases.map((lease) => (
                        <div key={lease.id} className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-shadow group flex flex-col justify-between">
                            <div className="mb-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-qnavy/10 rounded-full flex items-center justify-center text-qnavy">
                                        <Home size={18} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 truncate">{lease.property.name || lease.property.propertyCode}</h3>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">{lease.property.city || "Abidjan"}</p>
                                    </div>
                                </div>
                                <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
                                    <div className="flex items-center gap-2 text-sm">
                                        <User size={14} className="text-gray-400" />
                                        <span className="font-medium text-gray-700 truncate">
                                            {lease.tenant ? `${lease.tenant.firstName || ''} ${lease.tenant.lastName || ''}` : 'Locataire inconnu'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                                        <Calendar size={14} className="text-gray-400" />
                                        <span>Bail du {lease.startDate.toLocaleDateString('fr-FR')}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <Link 
                                href={`/dashboard/certificates/${lease.id}`}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-colors"
                            >
                                Générer Certificat <ArrowRight size={14} />
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
