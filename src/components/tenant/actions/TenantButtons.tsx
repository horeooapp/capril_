"use client"
import { toast } from "sonner";
import React from "react";
import { Download } from "lucide-react";

export const DownloadLeaseButton = ({ leaseId }: { leaseId: string }) => {
    return (
        <button 
            className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-black transition-colors shadow-lg shadow-gray-200 uppercase tracking-wider" 
            onClick={(e) => { 
                e.preventDefault(); 
                window.open(`/dashboard/leases/${leaseId}/print`, "_blank");
            }}
        >
            Télécharger le bail
        </button>
    );
};

export const DownloadDocumentButton = ({ label = "Télécharger document", className, documentUrl }: { label?: string, className?: string, documentUrl?: string }) => {
    return (
        <button 
            className={className || "w-full sm:w-auto px-8 py-4 bg-gray-900 text-white rounded-2xl cursor-pointer hover:bg-black transition-colors shadow-xl shadow-gray-200/50 flex flex-col items-center gap-1 active:scale-95 group"} 
            onClick={(e) => { 
                e.preventDefault(); 
                if (documentUrl) {
                    window.open(documentUrl, "_blank");
                } else {
                    window.location.href = "/mon-espace-locataire/leases";
                }
            }}
        >
            <Download className="text-gray-400 group-hover:text-white transition-colors" size={24} />
            <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        </button>
    );
};

export const ContactSupportButton = ({ className }: { className?: string }) => {
    return (
        <button 
            className={className || "mt-4 w-full py-2 text-[10px] font-black uppercase tracking-widest border border-gray-700 rounded-lg hover:border-gray-500 transition-colors"} 
            onClick={(e) => { 
                e.preventDefault(); 
                window.location.href = "/contact";
            }}
        >
            Contacter le Support
        </button>
    );
};

