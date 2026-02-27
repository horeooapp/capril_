import { PrismaClient } from "@prisma/client"
import QRCode from "qrcode"
import { notFound } from "next/navigation"

const prisma = new PrismaClient()

export default async function ReceiptDocumentPage({ params }: { params: { id: string } }) {
    const receipt = await prisma.receipt.findUnique({
        where: { id: params.id },
        include: {
            lease: {
                include: {
                    property: {
                        include: { owner: true }
                    },
                    tenant: true
                }
            }
        }
    })

    if (!receipt) {
        notFound()
    }

    // Si le QR code hash n'existe pas, on le génère
    let qrCodeDataUrl = ""
    if (!receipt.qrCodeHash) {
        const hashData = `${receipt.id}-${Date.now()}`
        await prisma.receipt.update({
            where: { id: receipt.id },
            data: { qrCodeHash: hashData }
        })
        receipt.qrCodeHash = hashData
    }

    // @ts-ignore
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/verify/${receipt.qrCodeHash}`
    try {
        qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, { width: 120, margin: 1, color: { dark: '#009E60', light: '#FFFFFF' } })
    } catch (err) {
        console.error(err)
    }

    return (
        <div className="min-h-screen bg-gray-200 py-8 print:bg-white print:py-0">
            <div className="max-w-3xl mx-auto bg-white shadow-xl min-h-[1056px] relative p-12 print:shadow-none print:p-0 print:m-0">

                {/* En-tête avec Branding */}
                <div className="flex justify-between items-start border-b-4 border-primary pb-6 mb-8 mt-4 print:mt-0">
                    <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                            <div className="w-4 h-12 bg-primary rounded-sm" />
                            <div className="w-4 h-12 bg-gray-200 rounded-sm" />
                            <div className="w-4 h-12 bg-secondary rounded-sm" />
                        </div>
                        <div>
                            <h1 className="font-extrabold text-3xl tracking-tight text-gray-900 leading-none">QAPRIL</h1>
                            <p className="text-xs text-gray-500 font-medium">République de Côte d'Ivoire</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-2xl font-bold text-gray-900 uppercase">Quittance de Loyer</h2>
                        <p className="text-gray-500 font-medium mt-1">N° {receipt.receiptNumber}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-12 mb-12">
                    {/* Bailleur */}
                    <div>
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bailleur / Propriétaire</h3>
                            <div className="text-sm text-gray-900 space-y-1">
                                <p className="font-bold">{receipt.lease.property.owner.name || 'Nom non renseigné'}</p>
                                <p>{receipt.lease.property.owner.email}</p>
                                <p>{receipt.lease.property.owner.phone}</p>
                            </div>
                        </div>
                    </div>

                    {/* Locataire */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Locataire</h3>
                        <div className="text-sm text-gray-900 space-y-1">
                            {/* @ts-ignore */}
                            <p className="font-bold">{receipt.lease.tenant.name || 'Nom non renseigné'}</p>
                            {/* @ts-ignore */}
                            <p>{receipt.lease.tenant.email}</p>
                        </div>
                    </div>
                </div>

                {/* Détails du logement */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-12">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Adresse du Logement concerné</h3>
                    <p className="text-base text-gray-900 font-medium">{receipt.lease.property.name}</p>
                    <p className="text-sm text-gray-600">{receipt.lease.property.address}, {receipt.lease.property.postalCode} {receipt.lease.property.city}</p>
                </div>

                {/* Tableau Financier */}
                <div className="mb-12">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Détails de la Quittance</h3>

                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-gray-300 text-sm">
                                <th className="py-3 text-gray-600 font-semibold">Période</th>
                                <th className="py-3 text-right text-gray-600 font-semibold">Loyer de base</th>
                                <th className="py-3 text-right text-gray-600 font-semibold">Charges</th>
                                <th className="py-3 text-right text-gray-900 font-bold">Total Réglé</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            <tr className="border-b border-gray-100">
                                <td className="py-4 text-gray-900">
                                    Du {new Date(receipt.periodStart).toLocaleDateString('fr-FR')} au {new Date(receipt.periodEnd).toLocaleDateString('fr-FR')}
                                </td>
                                <td className="py-4 text-right text-gray-600">{receipt.lease.rentAmount.toLocaleString('fr-FR')} FCFA</td>
                                <td className="py-4 text-right text-gray-600">{(receipt.lease.charges || 0).toLocaleString('fr-FR')} FCFA</td>
                                <td className="py-4 text-right text-lg font-bold text-primary">{receipt.amountPaid.toLocaleString('fr-FR')} FCFA</td>
                            </tr>
                        </tbody>
                    </table>
                    <p className="mt-4 text-sm text-gray-500 italic">
                        Paiement certifié reçu le {new Date(receipt.paymentDate).toLocaleDateString('fr-FR')} par {receipt.paymentMethod}.
                    </p>
                </div>

                <div className="mt-20 border-t border-gray-200 pt-8 flex justify-between items-end">
                    <div className="w-1/2">
                        <p className="text-xs text-gray-500 mb-2">Signature du bailleur ou mandataire</p>
                        <div className="h-16 border-b border-dashed border-gray-400 w-48"></div>
                    </div>

                    <div className="flex flex-col items-center">
                        {qrCodeDataUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={qrCodeDataUrl} alt="QR Code d'authenticité" className="w-24 h-24 print:w-28 print:h-28" />
                        ) : (
                            <div className="w-24 h-24 bg-gray-100 flex items-center justify-center text-xs">QR</div>
                        )}
                        <p className="text-[10px] text-gray-400 mt-2 text-center max-w-[150px]">
                            Scannez ce QR code pour vérifier l'authenticité de la quittance sur qapril.ci
                        </p>
                    </div>
                </div>

            </div>

            {/* Barre d'outils flottante pour imprimer (masquée à l'impression) */}
            <div className="fixed bottom-8 right-8 print:hidden flex space-x-4">
                <a href="/locataire" className="bg-white text-gray-800 shadow-lg px-6 py-3 rounded-full font-medium hover:bg-gray-50">
                    Retour
                </a>
                <button
                    onClick="window.print()"
                    className="bg-primary text-white shadow-lg px-6 py-3 rounded-full font-bold hover:bg-orange-600 flex items-center"
                    // @ts-ignore
                    dangerouslySetInnerHTML={{ __html: `<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg> Imprimer / PDF` }}
                />
            </div>
        </div>
    )
}
