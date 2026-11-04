import { auth } from "@/auth";
import Link from "next/link";
import { ArrowLeft, ShieldAlert, Wrench, CheckCircle2 } from "lucide-react";

export default async function NewMaintenanceTicketPage() {
    const session = await auth();
    const userRole = (session?.user as any)?.chosenRole || session?.user?.role;

    return (
        <div className="max-w-3xl mx-auto p-4 sm:p-8 space-y-6 animate-in fade-in duration-500">
            <Link
                href="/dashboard/maintenance"
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
            >
                <ArrowLeft size={16} /> Retour aux signalements reçus
            </Link>

            <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm space-y-6">
                <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-200 shadow-sm">
                    <ShieldAlert size={28} />
                </div>

                <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-md">
                        Règle de gestion QAPRIL · RG-MAI-01
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
                        Émission réservée aux locataires
                    </h1>
                    <p className="text-sm font-semibold text-slate-600 leading-relaxed">
                        Le propriétaire ou l’agence gestionnaire <strong>reçoit</strong> les signalements d’incidents et <strong>ne les émet pas</strong>.
                    </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 text-xs text-slate-700 leading-relaxed">
                    <p className="font-bold text-slate-900 flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                        Principe de la preuve contradictoire horodatée (ADD-11) :
                    </p>
                    <p>
                        Seul le locataire en titre peut déclarer une panne, fuite ou dégradation depuis son <strong>Espace Locataire QAPRIL</strong>. 
                        Cette déclaration génère une preuve horodatée avec empreinte cryptographique SHA-256 qui vous est transmise instantanément.
                    </p>
                    <p>
                        Si votre locataire vous a contacté hors plateforme (appel, WhatsApp), demandez-lui d’émettre son signalement depuis son application mobile ou son espace web afin de garantir la traçabilité des travaux.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Link
                        href="/dashboard/maintenance"
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
                    >
                        <Wrench size={14} />
                        Consulter les signalements reçus
                    </Link>
                    <Link
                        href="/dashboard/properties"
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider py-3.5 px-6 rounded-xl flex items-center justify-center transition-colors"
                    >
                        Gestion de mon patrimoine
                    </Link>
                </div>
            </div>
        </div>
    );
}
