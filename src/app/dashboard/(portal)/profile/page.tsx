import { User, Settings, ShieldCheck, CreditCard, Bell, LogOut, Star, Trash2 } from "lucide-react"
import { DeleteAccountSection } from "@/components/dashboard/profile/DeleteAccountSection"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ProfileUpdateForm } from "@/components/dashboard/ProfileUpdateForm"
import { SubscriptionManager } from "@/components/dashboard/SubscriptionManager"
import { SectionCard } from "@/components/dashboard/ui/SectionCard"
import { StatCard } from "@/components/dashboard/ui/StatCard"

export default async function OwnerProfilePage() {
    const session = await auth()
    if (!session?.user) return null

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { 
            identityDocuments: { orderBy: { createdAt: "desc" } },
            agenceProfile: true
        }
    })

    if (!user) {
        return (
            <div className="flex h-[50vh] items-center justify-center animate-in fade-in duration-500">
                <div className="p-8 text-center max-w-sm rounded-[12px] border border-rose-200 bg-rose-50 shadow-sm">
                    <h2 className="text-lg font-bold text-rose-700 mb-2">Profil introuvable</h2>
                    <p className="text-[13px] text-rose-600 mb-6 font-medium">Impossible de charger vos données. Votre compte a peut-être été supprimé.</p>
                    <Link href="/login" className="px-6 py-2.5 bg-rose-600 text-white rounded-[8px] text-[12px] font-semibold uppercase tracking-wide hover:bg-rose-700 transition">Se Reconnecter</Link>
                </div>
            </div>
        )
    }

    const agencyProfile = (user as any)?.agenceProfile;

    const primaryDoc = user?.identityDocuments?.find(d => !['DFE','RCCM','NIF','AGREMENT'].includes(d.docType)) || user?.identityDocuments?.[0];
    const dfeDoc = user?.identityDocuments?.find(d => d.docType === 'DFE');
    const rccmDoc = user?.identityDocuments?.find(d => d.docType === 'RCCM');
    const nifDoc = user?.identityDocuments?.find(d => d.docType === 'NIF');
    const agrementDoc = user?.identityDocuments?.find(d => d.docType === 'AGREMENT');
    
    const activeRole = (user as any).capaciteActive || (session.user as any)?.chosenRole || session.user.role;
    const isAgencyRole = ['AGENCY', 'NON_CERTIFIED_AGENT', 'AGENCE_AGREE', 'AGENCE_NON_AGREE', 'AGENCY_AGREE', 'AGENCY_NON_AGREE', 'INTERMEDIARY'].includes(activeRole);

    let displayRole = "PROPRIÉTAIRE";
    if (isAgencyRole) displayRole = "AGENCE";
    if (activeRole === "DIASPORA") displayRole = "DIASPORA";
    if (activeRole === "CHAMPION") displayRole = "CHAMPION";

    return (
        <div className="space-y-6 pb-24">
            
            {/* Header / Hero */}
            <div className="p-6 md:p-8 rounded-[12px] border border-slate-200 bg-white shadow-sm flex flex-col md:flex-row items-center gap-6 md:gap-8">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-3xl border border-slate-200 shadow-sm overflow-hidden shrink-0">
                    {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <User size={32} className="text-slate-400" />
                    )}
                </div>
                <div className="text-center md:text-left flex-1">
                    <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-slate-900 mb-1">
                        {isAgencyRole && agencyProfile?.nomAgence 
                            ? agencyProfile.nomAgence 
                            : ((user?.firstName ? user.firstName + " " : "") + (user?.lastName || "") || "Utilisateur QAPRIL")
                        }
                    </h1>
                    <p className="text-slate-500 font-medium text-[13px]">{isAgencyRole && agencyProfile?.adresseLocal ? agencyProfile.adresseLocal : user?.email}</p>
                    
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                        <span className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-[6px] text-[10px] font-bold uppercase tracking-widest text-slate-600">
                            Niveau KYC : {user?.kycLevel || 1}
                        </span>
                        <span className="px-3 py-1 bg-slate-800 rounded-[6px] text-[10px] font-bold uppercase tracking-widest text-white">
                            {displayRole}
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Profile Form */}
                <SectionCard title="Mise à jour du Profil" icon={<Settings size={18} className="text-slate-400"/>}>
                    <ProfileUpdateForm 
                        activeRole={activeRole}
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
                            docNumber: primaryDoc?.docNumber,
                            dfe: agencyProfile?.dfe || dfeDoc?.docNumber,
                            rccm: agencyProfile?.rccm || rccmDoc?.docNumber,
                            nif: agencyProfile?.nif || nifDoc?.docNumber,
                            agrement: agencyProfile?.numeroAgrement || agrementDoc?.docNumber,
                            nomAgence: agencyProfile?.nomAgence || user?.lastName,
                            adresseLocal: agencyProfile?.adresseLocal,
                            garantieFinanciere: agencyProfile?.garantieFinanciere,
                            rcPro: agencyProfile?.rcPro,
                            numEnregistrement: agencyProfile?.numEnregistrement
                        }} 
                    />
                </SectionCard>

                {/* Score & Trust Portfolio */}
                <div className="space-y-6">
                    <SectionCard title="Indice de Confiance" icon={<Star size={18} className="text-sky-500"/>} className="bg-sky-50/50">
                        <div className="p-5 bg-white rounded-[8px] border border-sky-100 shadow-sm flex items-center justify-between mb-4">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Score {displayRole}</p>
                                <p className="text-2xl font-black text-slate-800">890 <span className="text-sm font-semibold text-slate-400">/ 1000</span></p>
                            </div>
                            <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-[6px] font-bold text-[11px] uppercase tracking-widest border border-emerald-100">
                                Excellent
                            </div>
                        </div>
                        <p className="text-[12.5px] text-slate-600 font-medium mb-5 leading-relaxed">
                            Votre score est calculé à partir de la conformité de vos baux et de la promptitude de vos quittances.
                        </p>
                        <Link href="/dashboard/trust" className="block text-center py-2.5 bg-white border border-slate-200 rounded-[8px] text-[11px] font-bold text-slate-600 uppercase tracking-widest hover:bg-slate-50 transition-all">
                            Détails du score
                        </Link>
                    </SectionCard>

                    <SectionCard title="Sécurité & Alertes" icon={<ShieldCheck size={18} className="text-emerald-500"/>}>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-[8px] border border-slate-100">
                                <span className="text-[13px] font-semibold text-slate-700">Notifications SMS</span>
                                <div className="w-8 h-4 bg-emerald-500 rounded-full relative">
                                    <div className="absolute top-0.5 right-0.5 w-3 h-3 bg-white rounded-full shadow-sm"></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-[8px] border border-slate-100">
                                <span className="text-[13px] font-semibold text-slate-700">Alertes WhatsApp</span>
                                <div className="w-8 h-4 bg-emerald-500 rounded-full relative">
                                    <div className="absolute top-0.5 right-0.5 w-3 h-3 bg-white rounded-full shadow-sm"></div>
                                </div>
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard title="Abonnement">
                        {(() => {
                            const tierMap: any = {
                                'LOCATAIRE': 'LOCATAIRE',
                                'ESSENTIEL': 'PROPRIÉTAIRE',
                                'PRO': 'AGENCE INTERMÉDIAIRE',
                                'PREMIUM': 'DIASPORA VIP',
                                'INSTITUTIONNEL': 'DIASPORA VIP'
                            };
                            return <SubscriptionManager currentPlan={tierMap[user?.activePlanTier || 'ESSENTIEL'] || 'PROPRIÉTAIRE'} />;
                        })()}
                    </SectionCard>

                    {/* Zone de Danger */}
                    <div className="pt-2 border-t border-slate-200">
                      <DeleteAccountSection />
                    </div>
                </div>
            </div>

            <div className="text-center py-6">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] mb-3">
                    Membre Certifié QAPRIL • Depuis {new Date().getFullYear()}
                </p>
                <div className="h-[1px] w-12 bg-slate-200 mx-auto"></div>
            </div>
        </div>
    )
}
