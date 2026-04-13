"use client"

import { motion, Variants } from "framer-motion"
import Link from "next/link"
import { User, Settings, ShieldCheck, ArrowLeft, Stamp, Bell } from "lucide-react"
import { ProfileUpdateForm } from "@/components/dashboard/ProfileUpdateForm"
import PreferencesLocataireClient from "@/components/locataire/PreferencesLocataireClient"
import { DeleteAccountSection } from "@/components/dashboard/profile/DeleteAccountSection"

export default function ProfileContent({ user, primaryDoc, isIdentityLocked }: any) {
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
        }
    }

    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-4xl mx-auto space-y-8 pb-20 px-1"
        >
            {/* Header V4 */}
            <motion.div variants={itemVariants} className="flex items-center gap-4 relative z-10">
                <Link href="/mon-espace-locataire" className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl border border-qgrey-2 flex items-center justify-center hover:bg-qgrey-1 transition-all shadow-sm shrink-0">
                    <ArrowLeft size={20} className="text-qnavy" />
                </Link>
                <div className="overflow-hidden">
                    <h1 className="text-2xl sm:text-4xl font-black text-qnavy-dark uppercase tracking-tighter flex items-center gap-3">
                        Mon Profil
                        <span className="hidden sm:inline-block bg-qnavy-dark text-white text-[10px] px-3 py-1 rounded-full not-italic tracking-widest font-black uppercase shadow-md shadow-qnavy/20">LOCATAIRE</span>
                    </h1>
                    <p className="text-[9px] sm:text-[11px] font-black uppercase tracking-widest text-[#C55A11] mt-1 truncate">
                        Données personnelles & Sécurité
                    </p>
                </div>
            </motion.div>

             {/* Hero Card */}
             <motion.div variants={itemVariants} className="bg-white p-6 sm:p-10 rounded-[2rem] border border-qgrey-2 shadow-[0_12px_40px_rgba(13,43,110,0.04)] relative overflow-hidden flex flex-col md:flex-row items-center gap-6 sm:gap-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_top_right,var(--color-qnavy-pale),transparent_70%)] pointer-events-none blur-xl"></div>
                
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-qnavy-pale rounded-[1.8rem] sm:rounded-[2rem] flex items-center justify-center border-4 border-white shadow-xl rotate-3 relative z-10 shrink-0">
                    {user?.avatarUrl ? (
                         <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-[1.6rem] sm:rounded-[1.8rem]" />
                    ) : (
                         <User size={48} className="text-qnavy" />
                    )}
                </div>
                
                <div className="text-center md:text-left relative z-10 flex-1 overflow-hidden w-full">
                    <h2 className="text-2xl sm:text-3xl font-black text-qnavy-dark uppercase leading-none mb-2 break-words">
                        {(user?.firstName ? user.firstName + " " : "") + (user?.lastName || "") || "Locataire Non Défini"}
                    </h2>
                    <p className="text-xs sm:text-sm font-bold text-qtext-mid tracking-widest uppercase mb-4 truncate">{user?.email}</p>
                    
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-3">
                        <span className="px-3 sm:px-4 py-2 bg-qgrey-1 border border-qgrey-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-qtext-mid flex items-center gap-2">
                            <ShieldCheck size={14} className="text-qgreen" />
                            KYC L{user?.kycLevel || 0}
                        </span>
                        {user?.locataireProfile && (
                            <span className="px-3 sm:px-4 py-2 bg-qorange-pale border border-qorange/20 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-qorange-dark flex items-center gap-2">
                                <Stamp size={14} /> ICL : {user.locataireProfile.scoreActuel}
                            </span>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Main Form Area */}
            <motion.div variants={itemVariants} className="bg-white p-6 sm:p-10 rounded-[2rem] border border-qgrey-2 shadow-[0_12px_40px_rgba(13,43,110,0.04)]">
                <div className="flex items-center gap-3 border-b-2 border-qgrey-1 pb-6 mb-8">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-qnavy-pale rounded-xl flex items-center justify-center shrink-0">
                        <Settings size={22} className="text-qnavy" />
                    </div>
                    <div>
                        <h3 className="text-lg sm:text-xl font-black text-qnavy-dark uppercase tracking-widest leading-none">
                            Profil
                        </h3>
                        <p className="text-[9px] sm:text-[11px] font-bold text-qtext-light uppercase tracking-widest mt-1">
                            Maintenez vos données à jour
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
            </motion.div>

            {/* Préférences des Alertes */}
            {user?.locataireProfile && (
                <motion.div variants={itemVariants} className="bg-white p-6 sm:p-10 rounded-[2rem] border border-qgrey-2 shadow-[0_12px_40px_rgba(13,43,110,0.04)] mt-8">
                     <div className="flex items-center gap-3 border-b-2 border-qgrey-1 pb-6 mb-8">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#C55A11]/10 rounded-xl flex items-center justify-center shrink-0">
                            <Bell size={22} className="text-[#C55A11]" />
                        </div>
                        <div>
                            <h3 className="text-lg sm:text-xl font-black text-qnavy-dark uppercase tracking-widest leading-none">
                                Alertes
                            </h3>
                            <p className="text-[9px] sm:text-[11px] font-bold text-qtext-light uppercase tracking-widest mt-1">
                                Vos rappels et communications
                            </p>
                        </div>
                    </div>
                    <PreferencesLocataireClient 
                        profile={user.locataireProfile} 
                        userId={user.id} 
                    />
                </motion.div>
            )}

            {/* Alert / Notice */}
            <motion.div variants={itemVariants} className="bg-[linear-gradient(135deg,#FDF6E3_0%,#F5E6BE_100%)] p-6 sm:p-8 rounded-[2rem] border border-[#C9A84C]/20 shadow-sm flex items-start gap-4">
                 <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/50 rounded-xl flex items-center justify-center backdrop-blur-sm shrink-0 border border-white/50 mt-1">
                     <ShieldCheck className="text-[#97782A]" size={22} />
                 </div>
                 <div>
                     <h4 className="text-[11px] sm:text-xs font-black text-[#97782A] uppercase tracking-widest mb-1 sm:mb-2">Sécurité et RGPD</h4>
                     <p className="text-[10px] sm:text-xs font-bold text-[#97782A]/80 leading-relaxed max-w-2xl">
                         Vos données sont chiffrées. Elles ne sont partagées <strong>que lors d'une candidature ou signature</strong> via le Passeport Locatif QAPRIL.
                     </p>
                 </div>
            </motion.div>
            
            {/* Zone de Danger: Suppression de Compte */}
            <motion.div variants={itemVariants}>
                <DeleteAccountSection />
            </motion.div>
        </motion.div>
    )
}
