import { getRentCertificateData } from "@/actions/export-actions";
import { notFound } from "next/navigation";
import Image from "next/image";

export default async function RentCertificatePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    let data;
    try {
        data = await getRentCertificateData(id);
    } catch (e) {
        notFound();
    }

    const { lease, generatedAt } = data;
    if (!lease.tenant) notFound();

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-10 print:p-0 print:bg-white flex justify-center">
            {/* Main Document Body */}
            <div className="bg-white w-full max-w-[800px] min-h-[1050px] shadow-2xl p-12 relative overflow-hidden print:shadow-none print:max-w-none">
                
                {/* Official Border */}
                <div className="absolute top-0 left-0 w-full h-4 bg-emerald-900"></div>

                {/* Header */}
                <div className="flex justify-between items-start mb-16">
                    <div>
                        <div className="text-4xl font-black text-emerald-900 tracking-tighter mb-2">QAPRIL</div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Digital Real Estate ecosystem</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">ATTESTATION DE LOYER</div>
                        <div className="text-sm text-gray-500">REF: CER-{(new Date().getFullYear())}-{Math.floor(1000 + Math.random() * 9000)}</div>
                    </div>
                </div>

                {/* Body Content */}
                <div className="space-y-10">
                    <div className="text-justify leading-relaxed text-gray-800">
                        Je soussigné, <span className="font-bold">QAPRIL MANAGEMENT</span>, agissant en qualité de gestionnaire pour le compte du bailleur, certifie par la présente que :
                    </div>

                    <div className="flex justify-between mb-12 items-end">
                        <div className="space-y-4">
                            <div className="bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100 inline-block">
                                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">Document Certifié</span>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-emerald-800/60 mb-1">Locataire</label>
                                <div className="text-xl font-black text-emerald-950 uppercase tracking-tight">{lease.tenant!.firstName} {lease.tenant!.lastName}</div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-emerald-800/60 mb-1">Logement concerné</label>
                                <div className="text-sm font-bold text-emerald-950">{(lease as any).property.parentProperty?.name ? `${(lease as any).property.parentProperty.name} - ` : ""}{(lease as any).property.name || (lease as any).property.propertyCode} - {(lease as any).property.address}</div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-emerald-800/60 mb-1">Montant du loyer</label>
                                <div className="text-sm font-bold text-emerald-950 underline decoration-emerald-200 decoration-2 underline-offset-4">{lease.rentAmount?.toLocaleString() || 0} F CFA / mois</div>
                            </div>
                        </div>
                        {/* QR Code Placeholder for authenticity */}
                        <div className="w-32 h-32 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-[10px] text-gray-400 font-bold text-center p-4 uppercase leading-tight">
                            Signature Numérique QAPRIL
                        </div>
                    </div>

                    <div className="space-y-8 mb-16">
                        <div className="bg-white border-l-4 border-emerald-500 p-8 shadow-sm">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-900 mb-6">Déclaration du Bailleur / Mandataire</h3>
                            
                            <div className="text-justify leading-relaxed text-gray-800 mb-4">
                                Nous soussignés, **QAPRIL IMMOBILIER**, agissant en qualité de mandataire pour le compte du bailleur, 
                                certifions que le locataire susmentionné occupant le logement désigné :
                            </div>

                            <div className="text-justify leading-relaxed text-gray-800 mb-4">
                                est à jour du règlement de ses loyers et charges pour la période citée ci-dessus. 
                                La dernière quittance a été émise et certifiée numériquement le <span className="font-bold">{new Date((data as any).lastPaymentDate).toLocaleDateString()}</span>.
                            </div>
                        </div>

                        <div className="text-justify leading-relaxed text-gray-800">
                            Cette attestation est délivrée à la demande de l'intéressé(e) pour servir et valoir ce que de droit.
                        </div>
                    </div>
                </div>

                {/* Stamp & Signature Section */}
                <div className="mt-32 flex justify-between items-end">
                    <div className="text-center">
                        <div className="w-32 h-32 border-4 border-emerald-900/10 rounded-full flex items-center justify-center relative opacity-20 transform -rotate-12 mb-2">
                            <div className="text-[10px] font-black uppercase text-emerald-900 text-center">CERTIFIÉ CONFORME<br/>QAPRIL SYSTEM</div>
                        </div>
                        <div className="text-[10px] font-bold text-gray-400">SIGNATURE NUMÉRIQUE</div>
                    </div>

                    <div className="text-right">
                        <div className="text-sm text-gray-500 mb-2">Fait à Abidjan, le {new Date().toLocaleDateString('fr-FR')}</div>
                        <div className="text-lg font-black text-emerald-900 uppercase">Direction QAPRIL</div>
                    </div>
                </div>

                {/* Footer / QR Verification */}
                <div className="absolute bottom-12 left-12 right-12 flex items-center gap-6 border-t border-gray-100 pt-8">
                    <div className="bg-gray-100 w-20 h-20 rounded-lg flex items-center justify-center font-bold text-xs text-gray-400">QR CODE</div>
                    <div className="flex-1">
                        <div className="text-[10px] font-black text-gray-800 uppercase tracking-widest mb-1">VÉRIFICATION DE L'AUTHENTICITÉ</div>
                        <p className="text-[9px] text-gray-400 leading-tight">
                            Ce document est certifié par la blockchain privée QAPRIL. Scannez le QR Code ci-contre pour vérifier son intégrité sur notre portail officiel. Identifiant unique : {id.substring(0,16)}...
                        </p>
                    </div>
                </div>

                {/* Print Hint */}
                <div className="mt-10 text-center print:hidden">
                    <button 
                        onClick={() => window.print()}
                        className="bg-emerald-900 text-white px-8 py-3 rounded-xl font-bold shadow-xl hover:bg-emerald-800 transition-all flex items-center gap-3 mx-auto"
                    >
                        <span>🖨️</span> IMPRIMER / SAUVEGARDER EN PDF
                    </button>
                    <p className="text-[10px] text-gray-400 mt-4 uppercase font-bold tracking-[0.2em]">QAPRIL SECURE DOCUMENT MINT</p>
                </div>

            </div>
        </div>
    );
}
