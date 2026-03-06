import { getReceiptById } from "@/actions/receipts"
import { notFound } from "next/navigation"
import { QRCodeSVG } from "qrcode.react"

export default async function ReceiptVerificationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const receipt = await getReceiptById(id)

    if (!receipt) {
        notFound()
    }

    const { lease } = receipt
    const { property, tenant } = lease
    // @ts-ignore owner is included via custom action
    const owner = property.owner

    // Construction of the verification URL encoded in the QR Code
    // In production, NEXT_PUBLIC_APP_URL ensures the absolute path
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'
    const verificationUrl = `${appUrl}/receipts/${receipt.id}?verify=${receipt.documentHash}`

    return (
        <div className="min-h-screen bg-gray-100 py-10 print:bg-white print:py-0">
            <div className="max-w-3xl mx-auto bg-white shadow-lg print:shadow-none p-10 border border-gray-200 printable-receipt relative">
                
                {/* Filigrane QAPRIL */}
                <div className="absolute inset-0 z-0 flex items-center justify-center opacity-5 pointer-events-none">
                    <img src="/logo.png" alt="Watermark" className="w-96 grayscale transform -rotate-12" />
                </div>

                <div className="relative z-10">
                    {/* En-tête officiel */}
                    <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-8">
                        <div>
                            <img src="/logo.png" alt="QAPRIL Logo" className="h-16 w-auto" />
                            <p className="mt-2 text-xs font-bold text-gray-500 uppercase tracking-widest">Registre Locatif Numérique - RCI</p>
                        </div>
                        <div className="text-right">
                            <h1 className="text-3xl font-extrabold text-gray-900 uppercase tracking-tight">E-Quittance de Loyer</h1>
                            <p className="text-lg font-bold text-red-700 mt-1">N° {receipt.receiptNumber}</p>
                            <p className="text-sm text-gray-500 mt-1">
                                Émise le {new Date(receipt.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    </div>

                    {/* Informations des parties */}
                    <div className="grid grid-cols-2 gap-12 mb-8">
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                            <h3 className="text-sm font-bold text-gray-500 uppercase mb-3 border-b pb-1">Bailleur / Propriétaire</h3>
                            <p className="font-bold text-gray-900 text-lg">{owner.name || owner.email}</p>
                            <p className="text-gray-600 mt-1">Contact: {owner.phone || owner.email}</p>
                        </div>
                        
                        <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                            <h3 className="text-sm font-bold text-blue-800 uppercase mb-3 border-b border-blue-200 pb-1">Locataire</h3>
                            <p className="font-bold text-gray-900 text-lg">{tenant.name || tenant.email}</p>
                            <p className="text-gray-600 mt-1">Contact: {tenant.phone || tenant.email}</p>
                        </div>
                    </div>

                    {/* Détails du Logement */}
                    <div className="mb-8">
                        <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Désignation du Logement</h3>
                        <p className="text-gray-900">{property.name || property.type} - {property.address}</p>
                        <p className="text-gray-600">{property.postalCode} {property.neighborhood}, {property.city}</p>
                        {lease.officialLeaseNumber && (
                            <p className="text-sm text-gray-500 mt-2 italic">Contrat Physique N°: {lease.officialLeaseNumber}</p>
                        )}
                    </div>

                    {/* Détails Financiers */}
                    <div className="bg-orange-50 p-6 rounded-lg mb-8 border border-[#FF8200]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-900 text-xl">Détail du Paiement</h3>
                            <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                Payé
                            </span>
                        </div>
                        <table className="w-full text-left">
                            <tbody>
                                <tr className="border-b border-orange-200">
                                    <td className="py-3 text-gray-600">Période concernée</td>
                                    <td className="py-3 font-medium text-right text-gray-900">
                                        Du {new Date(receipt.periodStart).toLocaleDateString('fr-FR')} au {new Date(receipt.periodEnd).toLocaleDateString('fr-FR')}
                                    </td>
                                </tr>
                                <tr className="border-b border-orange-200">
                                    <td className="py-3 text-gray-600">Date de règlement effectif</td>
                                    <td className="py-3 font-medium text-right text-gray-900">
                                        {new Date(receipt.paymentDate).toLocaleDateString('fr-FR')}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-3 text-gray-600">Moyen de paiement</td>
                                    <td className="py-3 font-medium text-right text-gray-900 border-b border-orange-200">
                                        {receipt.paymentMethod.replace('_', ' ')}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-4 text-lg font-bold text-gray-900">Total Réglé</td>
                                    <td className="py-4 text-2xl font-black text-right text-primary">
                                        {receipt.amountPaid.toLocaleString('fr-FR')} FCFA
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Zone de Certification QR */}
                    <div className="flex items-start justify-between border-t-2 border-gray-800 pt-8 mt-12 page-break-inside-avoid">
                        <div className="w-2/3 pr-8">
                            <h4 className="font-bold text-gray-900 mb-2">Certification & Valeur Légale</h4>
                            <p className="text-xs text-justify text-gray-600 leading-relaxed">
                                Le propriétaire atteste avoir reçu du locataire la somme indiquée ci-dessus au titre du loyer et des charges pour la période désignée. Sous réserve de tous droits.
                                <br/><br/>
                                Ce document est certifié conforme par la plateforme QAPRIL. Son authenticité peut être vérifiée à tout moment en scannant le QR code avec un smartphone ou en visitant le registre numérique.
                            </p>
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-[10px] text-gray-400 font-mono break-all">
                                    Empreinte Cryptographique (SHA-256):<br/>
                                    {receipt.documentHash}
                                </p>
                            </div>
                        </div>
                        <div className="w-1/3 flex flex-col items-center">
                            <div className="p-2 bg-white border-2 border-primary rounded-lg shadow-sm">
                                <QRCodeSVG 
                                    value={verificationUrl}
                                    size={120}
                                    level="Q"
                                    includeMargin={false}
                                />
                            </div>
                            <p className="text-[10px] font-bold text-gray-500 mt-2 uppercase tracking-wider text-center">
                                Scannez pour<br/>vérifier l'authenticité
                            </p>
                        </div>
                    </div>

                    {/* Bouton d'impression (masqué à l'impression) */}
                    <div className="mt-12 text-center print:hidden">
                        <button 
                            onClick={(e) => {
                                // Need 'use client' for this, so we'll wrap it via an inline script or client wrapper in real app.
                                // Simplest way in app router for a purely server component is a simple link back, 
                                // or we can make this entire component a client component later if needed.
                                
                            }} 
                            className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105 print:hidden"
                        >
                            Imprimer ce document
                        </button>
                        <p className="text-sm mt-3 text-gray-500">Utilisez <kbd className="bg-gray-100 px-2 py-1 rounded">Ctrl</kbd> + <kbd className="bg-gray-100 px-2 py-1 rounded">P</kbd> pour imprimer en PDF.</p>
                    </div>

                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    @page { margin: 0; size: A4; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
            `}} />
        </div>
    )
}
