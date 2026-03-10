"use client"

import ProtectedLogo from "@/components/ProtectedLogo"

interface LeaseAgreementProps {
    lease: {
        id: string;
        officialLeaseNumber?: string;
        startDate: Date | string;
        rentAmount: number;
        charges: number;
        deposit: number;
        advancePayment: number;
        agencyFee: number;
        ownerSignature?: string;
        tenantSignature?: string;
        property: {
            type: string;
            address: string;
            neighborhood: string;
            city: string;
            lotNumber?: string;
            owner: {
                name: string;
                email: string;
            };
        };
        tenant: {
            name: string;
            email: string;
        };
    }
}

export default function LeaseAgreement({ lease }: LeaseAgreementProps) {
    const formatDate = (date: Date | string | null) => date ? new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'long', year: 'numeric'
    }) : '---';

    return (
        <div className="bg-white border border-gray-200 shadow-2xl p-8 sm:p-12 max-w-4xl mx-auto font-serif text-gray-900 leading-relaxed relative overflow-hidden">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none rotate-45">
                 <span className="text-9xl font-black">QAPRIL</span>
            </div>

            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-primary pb-6 mb-8 relative z-10">
                <div className="flex items-center space-x-4">
                    <ProtectedLogo src="/logo.png" alt="Logo" className="h-20 w-auto" />
                    <div>
                        <h1 className="text-3xl font-black text-primary uppercase tracking-tighter">Contrat de Bail</h1>
                        <p className="text-sm font-sans font-bold text-gray-500 uppercase tracking-widest">Registre Numérique QAPRIL</p>
                    </div>
                </div>
                <div className="text-right font-sans">
                    <p className="text-[10px] font-black uppercase text-gray-400">N° Officiel du Bail</p>
                    <p className="text-lg font-black text-primary">{lease.officialLeaseNumber || "Q-TEMP-" + lease.id.substring(0, 8)}</p>
                </div>
            </div>

            {/* Content */}
            <div className="space-y-8 relative z-10">
                {/* Parties */}
                <section>
                    <h2 className="text-lg font-black uppercase border-b border-gray-100 mb-4 font-sans tracking-tight">I. Les Parties</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <p className="text-[10px] uppercase font-bold text-gray-400 font-sans mb-1">Le Bailleur (Propriétaire)</p>
                            <p className="font-bold underline">{lease.property.owner.name}</p>
                            <p className="text-sm italic">{lease.property.owner.email}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-gray-400 font-sans mb-1">Le Preneur (Locataire)</p>
                            <p className="font-bold underline">{lease.tenant.name}</p>
                            <p className="text-sm italic">{lease.tenant.email}</p>
                        </div>
                    </div>
                </section>

                {/* Designation */}
                <section>
                    <h2 className="text-lg font-black uppercase border-b border-gray-100 mb-4 font-sans tracking-tight">II. Désignation du Bien</h2>
                    <p>Le Bailleur donne à bail au Preneur le bien immobilier suivant :</p>
                    <div className="bg-gray-50 p-4 rounded-lg mt-2 border border-gray-100">
                        <p className="font-bold">{lease.property.type} sis à {lease.property.address}, {lease.property.neighborhood}, {lease.property.city}.</p>
                        <p className="text-sm mt-1">Usage : Habitation | Lot : {lease.property.lotNumber || "Non spécifié"}</p>
                    </div>
                </section>

                {/* Durée et Loyer */}
                <section>
                    <h2 className="text-lg font-black uppercase border-b border-gray-100 mb-4 font-sans tracking-tight">III. Conditions Financières & Durée</h2>
                    <div className="space-y-4">
                        <p>Le présent bail est consenti pour une durée débutant le <strong>{formatDate(lease.startDate)}</strong>.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="border-l-4 border-orange-500 pl-4">
                                <p className="text-[10px] uppercase font-bold text-gray-400 font-sans">Loyer Mensuel</p>
                                <p className="text-xl font-black">{lease.rentAmount.toLocaleString()} FCFA</p>
                            </div>
                            <div className="border-l-4 border-gray-300 pl-4">
                                <p className="text-[10px] uppercase font-bold text-gray-400 font-sans">Charges</p>
                                <p className="text-xl font-black">{lease.charges.toLocaleString()} FCFA</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm font-sans">
                            <div className="bg-blue-50 p-3 rounded border border-blue-100">
                                <p className="font-bold text-blue-800">Caution (CDC)</p>
                                <p>{lease.deposit.toLocaleString()} FCFA</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded border border-gray-100">
                                <p className="font-bold">Avance</p>
                                <p>{lease.advancePayment.toLocaleString()} FCFA</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded border border-gray-100">
                                <p className="font-bold">Frais Agence</p>
                                <p>{lease.agencyFee.toLocaleString()} FCFA</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Clauses QAPRIL */}
                <section className="bg-orange-50/50 p-6 rounded-2xl border border-orange-100 text-sm italic">
                    <h3 className="font-black uppercase text-orange-800 mb-2 font-sans tracking-tight">Clauses Spécifiques QAPRIL</h3>
                    <ul className="list-disc ml-5 space-y-2 text-orange-900">
                        <li>Le dépôt de garantie est consigné auprès du séquestre numérique QAPRIL ou de la CDC.</li>
                        <li>Chaque paiement de loyer donne lieu à une quittance certifiée enregistrée au registre.</li>
                        <li>Les parties acceptent la médiation numérique comme premier recours en cas de litige.</li>
                    </ul>
                </section>

                {/* Signature Area */}
                <div className="pt-12 grid grid-cols-2 gap-12 font-sans">
                    <div className="text-center">
                        <p className="text-[10px] font-black uppercase mb-4">Signature du Bailleur</p>
                        {lease.ownerSignature ? (
                            <div className="h-24 flex flex-col items-center justify-center border-2 border-dashed border-primary/30 rounded-xl bg-primary/5">
                                <span className="text-primary font-black italic text-xl uppercase tracking-tighter">Signé par {lease.property.owner.name}</span>
                                <span className="text-[8px] text-gray-400 mt-1 uppercase font-bold">{lease.ownerSignature}</span>
                            </div>
                        ) : (
                            <div className="h-24 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-300 italic text-xs">
                                En attente de signature
                            </div>
                        )}
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] font-black uppercase mb-4">Signature du Preneur</p>
                        {lease.tenantSignature ? (
                            <div className="h-24 flex flex-col items-center justify-center border-2 border-dashed border-primary/30 rounded-xl bg-primary/5">
                                <span className="text-primary font-black italic text-xl uppercase tracking-tighter">Signé par {lease.tenant.name}</span>
                                <span className="text-[8px] text-gray-400 mt-1 uppercase font-bold">{lease.tenantSignature}</span>
                            </div>
                        ) : (
                            <div className="h-24 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-300 italic text-xs">
                                En attente de signature
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-6 border-t border-gray-100 text-[8px] font-bold text-gray-400 uppercase text-center font-sans tracking-widest relative z-10">
                Document certifié par QAPRIL - Registre National des Baux de Côte d&apos;Ivoire - {new Date().getFullYear()}
            </div>
        </div>
    )
}
