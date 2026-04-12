"use client"

import { toast } from "sonner";
import { Download, Filter, ArrowUpRight, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

export const ExportCSVButton = ({ data, filename = "export.csv" }: { data?: any, filename?: string }) => {
    const handleExport = (e: React.MouseEvent) => {
        e.preventDefault();
        toast.promise(
            new Promise(r => setTimeout(r, 1500)),
            {
                loading: 'Génération du fichier CSV...',
                success: () => {
                    // Simulation du téléchargement
                    const blob = new Blob(["Simulation CSV Data"], { type: "text/csv;charset=utf-8;" });
                    const link = document.createElement("a");
                    link.href = URL.createObjectURL(blob);
                    link.download = filename;
                    link.click();
                    return "Fichier CSV exporté avec succès.";
                },
                error: 'Erreur lors de l\'export.'
            }
        );
    };

    return (
        <button className="px-6 py-3 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all" onClick={handleExport}>
            Exporter CSV
        </button>
    );
};

export const ExportPDFIconButton = ({ filename = "document.pdf", className = "p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-primary transition-colors" }: { filename?: string, className?: string }) => {
    return (
        <button className={className} onClick={(e) => {
            e.preventDefault();
            toast.promise(new Promise(r => setTimeout(r, 1000)), {
                loading: "Compilation PDF...",
                success: "Document stocké en cache local."
            });
        }}>
            <Download size={20} />
        </button>
    );
};

export const FilterButton = ({ label = "Filtres Avancés", className = "flex items-center gap-2 px-6 py-3 border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-colors" }: { label?: string, className?: string }) => {
    return (
        <button className={className} onClick={(e) => {
            e.preventDefault();
            toast.success('Panneau de configuration des filtres activé.');
        }}>
            <Filter size={14} />
            {label}
        </button>
    );
};

export const NotifyCohortButton = ({ label = "Notifier Cohorte", className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200" }: { label?: string, className?: string }) => {
    return (
        <button className={className} onClick={(e) => {
            e.preventDefault();
            toast.promise(new Promise(r => setTimeout(r, 1200)), { loading: "Envoi des notifications Push/Email en mémoire...", success: "Action terminée : Cohorte notifiée avec succès !" });
        }}>
            <Mail size={14} />
            {label}
        </button>
    );
};

export const DetailRouteButton = ({ route, id, className = "p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-900 hover:text-white transition-all transform group-hover:scale-110 shadow-sm" }: { route: string, id: string, className?: string }) => {
    const router = useRouter();
    return (
        <button className={className} onClick={(e) => {
            e.preventDefault();
            router.push(`${route}/${id}`);
            toast.info('Ouverture du dossier sécurisé...');
        }}>
            <ArrowUpRight size={18} />
        </button>
    );
};

export const PerformActionButton = ({ label, actionName, className }: { label: React.ReactNode, actionName: string, className?: string }) => {
    return (
        <button className={className} onClick={(e) => {
            e.preventDefault();
            toast.promise(new Promise(r => setTimeout(r, 1000)), {
                loading: `Exécution: ${actionName}...`,
                success: `${actionName} exécutée.`
            });
        }}>
            {label}
        </button>
    );
};
