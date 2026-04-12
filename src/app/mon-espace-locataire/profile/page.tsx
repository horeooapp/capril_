import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ProfileUpdateForm } from "@/components/dashboard/ProfileUpdateForm"
import PreferencesLocataireClient from "@/components/locataire/PreferencesLocataireClient"
import { User, Settings, ShieldCheck, ArrowLeft, Stamp, Bell, Trash2 } from "lucide-react"
import { DeleteAccountSection } from "@/components/dashboard/profile/DeleteAccountSection"

export const dynamic = "force-dynamic"

export default async function TenantProfilePage() {
    const session = await auth()
    
    const activeRole = (session?.user as any)?.chosenRole || session?.user?.role;
    
    if (!session?.user || activeRole !== "TENANT") {
        redirect("/mon-espace-locataire/login")
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { 
            identityDocuments: { orderBy: { createdAt: "desc" }, take: 1 },
            locataireProfile: true
        }
    })

    const primaryDoc = user?.identityDocuments?.[0];

    const hasLease = await prisma.lease.findFirst({
        where: { tenantId: session.user.id }
    })
    const isIdentityLocked = !!hasLease;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
            {/* Header V4 */}
            <div className="flex items-center gap-4 relative z-10">
                <Link href="/mon-espace-locataire" className="w-12 h-12 bg-white rounded-xl border border-qgrey-2 flex items-center justify-center hover:bg-qgrey-1 transition-all shadow-sm">
                    <ArrowLeft size={24} className="text-qnavy" />
                </Link>
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-qnavy-dark uppercase tracking-tighter flex items-center gap-3">
                        Mon Profil
                        <span className="bg-qnavy-dark text-white text-[10px] px-3 py-1 rounded-full not-italic tracking-widest font-black uppercase shadow-md shadow-qnavy/20">LOCATAIRE</span>
                    </h1>
                    <p className="text-[11px] font-black uppercase tracking-widest text-[#C55A11] mt-1">
                        Gestion des données personnelles & Passeport
                    </p>
                </div>
            </div>

             {/* Hero Card */}
             <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-qgrey-2 shadow-[0_12px_40px_rgba(13,43,110,0.04)] relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_top_right,var(--color-qnavy-pale),transparent_70%)] pointer-events-none blur-xl"></div>
                
                <div className="w-32 h-32 bg-qnavy-pale rounded-[2rem] flex items-center justify-center border-4 border-white shadow-xl rotate-3 relative z-10">
                    {user?.avatarUrl ? (
                         <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-[1.8rem]" />
                    ) : (
                         <User size={56} className="text-qnavy" />
                    )}
                </div>
                
                <div className="text-center md:text-left relative z-10 flex-1">
                    <h2 className="text-3xl font-black text-qnavy-dark uppercase leading-none mb-2">
                        {(user?.firstName ? user.firstName + " " : "") + (user?.lastName || "") || "Locataire Non Défini"}
                    </h2>
                    <p className="text-sm font-bold text-qtext-mid tracking-widest uppercase mb-4">{user?.email}</p>
                    
                    <div className="flex flex-wrap justify-center md:justify-start gap-3">
                        <span className="px-4 py-2 bg-qgrey-1 border border-qgrey-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-qtext-mid flex items-center gap-2">
                            <ShieldCheck size={14} className="text-qgreen" />
                            KYC Niveau {user?.kycLevel || 0}
                        </span>
                        {user?.locataireProfile && (
                            <span className="px-4 py-2 bg-qorange-pale border border-qorange/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-qorange-dark flex items-center gap-2">
                                <Stamp size={14} /> Score ICL : {user.locataireProfile.scoreActuel}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Form Area */}
            <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-qgrey-2 shadow-[0_12px_40px_rgba(13,43,110,0.04)]">
                <div className="flex items-center gap-3 border-b-2 border-qgrey-1 pb-6 mb-8">
                    <div className="w-12 h-12 bg-qnavy-pale rounded-xl flex items-center justify-center">
                        <Settings size={22} className="text-qnavy" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-qnavy-dark uppercase tracking-widest">
                            Informations Personnelles
                        </h3>
                        <p className="text-[11px] font-bold text-qtext-light uppercase tracking-widest mt-1">
                            Maintenez votre Passeport Locatif à jour
                        </p>
                    </div>
                </div>

                <ProfileUpdateForm 
                    isIdentityLocked={isIdentityLocked}
                    initialData={{
                        firstName: user?.firstName,
                        lastName: user?.lastName,
                        birthDate: user?.birthDate,
                        birthPlace: user?.birthPlace,
                        neighborhood: user?.neighborhood,
                        phone: user?.phone,
                        avatarUrl: user?.avatarUrl,
                        email: user?.email,
                        profession: user?.profession,
                        salary: user?.salary,
                        docType: primaryDoc?.docType,
                        docNumber: primaryDoc?.docNumber
                    }} 
                />
            </div>

            {/* Préférences des Alertes */}
            {user?.locataireProfile && (
                <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-qgrey-2 shadow-[0_12px_40px_rgba(13,43,110,0.04)] mt-8">
                     <div className="flex items-center gap-3 border-b-2 border-qgrey-1 pb-6 mb-8">
                        <div className="w-12 h-12 bg-[#C55A11]/10 rounded-xl flex items-center justify-center">
                            <Bell size={22} className="text-[#C55A11]" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-qnavy-dark uppercase tracking-widest">
                                Paramètres d'Alertes
                            </h3>
                            <p className="text-[11px] font-bold text-qtext-light uppercase tracking-widest mt-1">
                                Vos rappels de loyer et communications
                            </p>
                        </div>
                    </div>
                    <PreferencesLocataireClient 
                        profile={user.locataireProfile} 
                        userId={user.id} 
                    />
                </div>
            )}

            {/* Alert / Notice */}
            <div className="bg-[linear-gradient(135deg,#FDF6E3_0%,#F5E6BE_100%)] p-8 rounded-[2rem] border border-[#C9A84C]/20 shadow-sm flex items-start gap-4">
                 <div className="w-12 h-12 bg-white/50 rounded-xl flex items-center justify-center backdrop-blur-sm shrink-0 border border-white/50 mt-1">
                     <ShieldCheck className="text-[#97782A]" size={24} />
                 </div>
                 <div>
                     <h4 className="text-sm font-black text-[#97782A] uppercase tracking-widest mb-2">Sécurité et RGPD</h4>
                     <p className="text-xs font-bold text-[#97782A]/80 leading-relaxed max-w-2xl">
                         Vos données personnelles (pièce d'identité, coordonnées) sont chiffrées. Elles ne sont partagées avec un propriétaire ou une agence immobilière <strong>que lorsque vous candidater pour un logement ou signez un bail</strong> via le système de Passeport Locatif QAPRIL.
                     </p>
                 </div>
            </div>
            
            {/* Zone de Danger: Suppression de Compte */}
            <DeleteAccountSection />
        </div>
    )
}
