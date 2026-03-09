"use client"

import { useEffect, useState } from "react"
import { getReceiptById } from "@/actions/receipts"
import { notFound } from "next/navigation"
import { QRCodeSVG } from "qrcode.react"

export default function ReceiptVerificationPage({ params }: { params: any }) {
    const [receipt, setReceipt] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        params.then((p: any) => {
            getReceiptById(p.id).then((data) => {
                setReceipt(data)
                setLoading(false)
            })
        })
    }, [params])

    if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-[#FF8200] animate-pulse uppercase tracking-[0.5em]">QAPRIL Certification...</div>
    if (!receipt) notFound()

    const { lease } = receipt
    const { property, tenant, landlord } = lease

    const appUrl = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
    const verificationUrl = `${appUrl}/receipts/${receipt.id}?verify=${receipt.receiptHash}`

    return (
        <div className="min-h-screen bg-neutral-50 py-12 px-4 print:bg-white print:py-0 print:px-0 font-sans">
            <div className="max-w-[210mm] mx-auto bg-white shadow-2xl print:shadow-none p-12 border border-gray-100 printable-receipt relative overflow-hidden rounded-[3rem] print:rounded-none">
                
                {/* Branding Accent */}
                <div className="absolute top-0 left-0 w-full h-4 bg-[#FF8200]"></div>
                
                {/* Official Header */}
                <div className="flex justify-between items-start mb-16 relative z-10">
                    <div>
                        <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-1">QAPRIL</h2>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Digital Property Registry - RCI</p>
                    </div>
                    <div className="text-right">
                        <div className="bg-gray-900 text-white px-6 py-2 rounded-2xl inline-block mb-3">
                            <span className="text-[10px] font-black uppercase tracking-widest">Quittance Officielle</span>
                        </div>
                        <h1 className="text-xl font-black text-gray-900">№ {receipt.receiptRef}</h1>
                        <p className="text-[10px] font-bold text-gray-500 uppercase mt-1 tracking-widest">
                            Émise le {new Date(receipt.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                {/* Parties Information */}
                <div className="grid grid-cols-2 gap-16 mb-16 pb-16 border-b border-gray-50">
                    <div>
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Bailleur / Landlord</h3>
                        <div className="space-y-1">
                            <p className="text-xl font-black text-gray-900 leading-tight">{landlord.fullName || "Identification en cours"}</p>
                            <p className="text-sm font-bold text-[#FF8200]">{landlord.phone}</p>
                            <p className="text-xs text-gray-400 font-medium">Membre Vérifié QAPRIL</p>
                        </div>
                    </div>
                    
                    <div className="text-right">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Locataire / Tenant</h3>
                        <div className="space-y-1">
                            <p className="text-xl font-black text-gray-900 leading-tight">{tenant.fullName || "Saisi par le bailleur"}</p>
                            <p className="text-sm font-bold text-blue-600">{tenant.phone}</p>
                            <p className="text-xs text-gray-400 font-medium tracking-tighter uppercase">Statut: En règle</p>
                        </div>
                    </div>
                </div>

                {/* Property Detail */}
                <div className="mb-16">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Désignation du Bien Immobilier</h3>
                    <div className="bg-gray-50/50 rounded-[2rem] p-8 border border-gray-100">
                        <p className="text-2xl font-black text-gray-900 mb-2">{property.propertyCode}</p>
                        <p className="text-lg font-bold text-gray-600">{property.addressLine1}</p>
                        <p className="text-sm text-gray-500 leading-relaxed uppercase tracking-tighter">
                            {property.neighborhood}, {property.commune} — {property.propertyCategory}
                        </p>
                    </div>
                </div>

                {/* Transaction Summary */}
                <div className="mb-20">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 text-center">Certification financière</h3>
                    <div className="bg-white border-2 border-gray-900 rounded-[2.5rem] p-10 relative">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                            {receipt.receiptType}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-12 text-center items-center">
                            <div className="border-r border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Période certifiée</p>
                                <p className="text-lg font-black text-gray-900 uppercase">
                                    {new Date(receipt.periodStart).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                                </p>
                                <p className="text-[10px] text-gray-500 font-bold mt-1 tracking-tighter italic">
                                    Totalité des charges incluses
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Montant total réglé</p>
                                <p className="text-4xl font-black text-gray-900">
                                    {parseInt(receipt.amountFcfa).toLocaleString()} <span className="text-lg">FCFA</span>
                                </p>
                                <p className="text-[10px] text-[#FF8200] font-black mt-2 uppercase tracking-[0.2em] bg-orange-50 px-3 py-1 rounded-full w-fit mx-auto">
                                    {receipt.paymentChannel?.replace('_', ' ')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Legal & QR Section */}
                <div className="grid grid-cols-3 gap-12 items-end pt-12 border-t-2 border-dashed border-gray-100 page-break-inside-avoid">
                    <div className="col-span-2">
                        <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-4 italic">Mentions Obligatoires & Certificat d'Authenticité</h4>
                        <p className="text-[10px] text-justify text-gray-500 leading-loose">
                            La présente certifie que le locataire susnommé a acquitté les sommes dues au titre de son occupation. 
                            Ce document électronique dispose d'un horodatage immuable et d'une signature cryptographique active. 
                            Le QR-Code ci-contre contient les paramètres de validation du registre national QAPRIL RCI. 
                            Toute falsification est passible de poursuites pénales conformément à la loi sur les transactions électroniques.
                        </p>
                        <div className="mt-8 flex items-center gap-4">
                            <div className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                                <p className="text-[9px] text-gray-400 font-mono leading-none mb-1 uppercase font-bold tracking-tighter">Hash (SHA-256)</p>
                                <p className="text-[10px] text-gray-900 font-mono font-black break-all uppercase">
                                    {receipt.receiptHash}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="p-4 bg-white border-4 border-gray-900 rounded-[2rem] shadow-xl">
                            <QRCodeSVG 
                                value={verificationUrl}
                                size={120}
                                level="H"
                                includeMargin={false}
                            />
                        </div>
                        <p className="text-[9px] font-black text-gray-900 mt-4 uppercase tracking-[0.2em] text-center leading-tight">
                            Scannez pour<br/>Authentifier
                        </p>
                    </div>
                </div>

                {/* Print Controls */}
                <div className="mt-16 pt-16 border-t border-gray-50 text-center print:hidden">
                    <button 
                        onClick={() => window.print()} 
                        className="bg-gray-900 text-white text-xs font-black py-5 px-12 rounded-[2rem] shadow-2xl shadow-gray-300 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
                    >
                        Imprimer le Document Certifié
                    </button>
                    <p className="text-[10px] mt-6 text-gray-400 font-bold uppercase tracking-widest">Format A4 Standard • Rendu Haute Définition</p>
                </div>

            </div>
            
            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    @page { margin: 10mm; size: A4; }
                    body { background: white !important; }
                    .printable-receipt { border: none !important; shadow: none !important; }
                }
            `}} />
        </div>
    )
}
