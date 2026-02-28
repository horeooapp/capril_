import { prisma } from "@/lib/prisma"
import QRCode from "qrcode"
import { notFound } from "next/navigation"
import PrintButton from "@/components/PrintButton"

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
        <div className="min-h-screen bg-gray-200 py-8 print:bg-white print:py-0 font-sans relative">

            {/* Background Watermark (Visible at Print) */}
            <div className="hidden print:flex fixed inset-0 z-0 items-center justify-center opacity-5 pointer-events-none">
                <div className="transform -rotate-45 text-9xl font-black text-gray-900 tracking-widest text-center leading-none">
                    QAPRIL<br />
                    <span className="text-4xl text-gray-800">REPUBLIQUE DE COTE D'IVOIRE</span>
                </div>
            </div>

            <div className="max-w-4xl mx-auto bg-white shadow-2xl min-h-[1056px] relative p-14 print:shadow-none print:p-8 print:m-0 z-10 border border-gray-100 print:border-none">

                {/* Cadre décoratif officiel */}
                <div className="absolute inset-4 border-2 border-primary opacity-20 pointer-events-none print:inset-0 rounded-sm"></div>
                <div className="absolute inset-5 border border-secondary opacity-30 pointer-events-none print:inset-1 rounded-sm"></div>

                {/* En-tête avec Branding */}
                <div className="flex justify-between items-start border-b-2 border-gray-900 pb-8 mb-10 relative">
                    <div className="flex items-center space-x-4">
                        <div className="flex space-x-1.5 h-16">
                            <div className="w-5 bg-[#FF8200] rounded-sm" /> {/* Orange CI */}
                            <div className="w-5 bg-gray-100 rounded-sm border border-gray-200" /> {/* Blanc CI */}
                            <div className="w-5 bg-[#009E60] rounded-sm" /> {/* Vert CI */}
                        </div>
                        <div>
                            <h1 className="font-extrabold text-4xl tracking-tighter text-gray-900 leading-none">QAPRIL</h1>
                            <p className="text-sm text-gray-600 font-semibold tracking-wide uppercase mt-1">Registre Locatif National</p>
                            <p className="text-xs text-gray-500 font-medium">République de Côte d'Ivoire</p>
                        </div>
                    </div>

                    <div className="text-right">
                        <h2 className="text-3xl font-black text-gray-900 uppercase tracking-widest border-b-2 border-primary inline-block pb-1">Quittance</h2>
                        <p className="text-gray-800 font-bold mt-2 text-lg">N° {receipt.receiptNumber}</p>
                        <p className="text-sm text-gray-500 mt-1">Émise le {new Date(receipt.createdAt).toLocaleDateString('fr-FR')}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-12 mb-10 relative z-10">
                    {/* Bailleur */}
                    <div className="bg-gray-50 p-5 rounded-md border border-gray-200">
                        <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-3 border-b border-gray-300 pb-2">Bailleur / Propriétaire</h3>
                        <div className="text-sm text-gray-900 space-y-1.5">
                            <p className="font-bold text-base uppercase">{receipt.lease.property.owner.name || 'Nom non renseigné'}</p>
                            <p className="text-gray-600 flex items-center"><span className="w-16 inline-block font-semibold">Email:</span> {receipt.lease.property.owner.email}</p>
                            <p className="text-gray-600 flex items-center"><span className="w-16 inline-block font-semibold">Tél:</span> {receipt.lease.property.owner.phone || 'Non renseigné'}</p>
                        </div>
                    </div>

                    {/* Locataire */}
                    <div className="bg-gray-50 p-5 rounded-md border border-gray-200">
                        <h3 className="text-xs font-black text-secondary uppercase tracking-widest mb-3 border-b border-gray-300 pb-2">Locataire</h3>
                        <div className="text-sm text-gray-900 space-y-1.5">
                            {/* @ts-ignore */}
                            <p className="font-bold text-base uppercase">{receipt.lease.tenant.name || 'Nom non renseigné'}</p>
                            {/* @ts-ignore */}
                            <p className="text-gray-600 flex items-center"><span className="w-16 inline-block font-semibold">Email:</span> {receipt.lease.tenant.email}</p>
                            {/* @ts-ignore */}
                            <p className="text-gray-600 flex items-center"><span className="w-16 inline-block font-semibold">Contact:</span> {receipt.lease.tenant.phone || 'Non renseigné'}</p>
                        </div>
                    </div>
                </div>

                {/* Détails du logement */}
                <div className="mb-10 relative z-10">
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Désignation du Logement</h3>
                    <div className="bg-white border-l-4 border-gray-900 p-4 shadow-sm">
                        <p className="text-lg text-gray-900 font-bold uppercase">{receipt.lease.property.name || 'Logement Standard'}</p>
                        <p className="text-base text-gray-700 mt-1">{receipt.lease.property.address}</p>
                        <p className="text-sm text-gray-600 font-medium mt-1">{receipt.lease.property.postalCode} {receipt.lease.property.city}, Côte d'Ivoire</p>
                    </div>
                </div>

                {/* Déclaration et Mentions Légales */}
                <div className="mb-10 text-gray-800 leading-relaxed text-justify text-xs space-y-3">
                    <p>
                        Je soussigné(e), <span className="font-semibold">{receipt.lease.property.owner.name}</span>, agissant en qualité de bailleur / propriétaire, certifie avoir reçu de la part de <span className="font-semibold">{/* @ts-ignore */}{receipt.lease.tenant.name}</span>, locataire, la somme totale indiquée dans le tableau ci-dessous, au titre du paiement du loyer et des charges pour la période spécifiée, concernant le logement désiré.
                    </p>
                    <p className="font-medium">
                        Mentions légales et conditions :
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-600 text-[11px]">
                        <li>Cette quittance annule et remplace tout reçu précédemment délivré pour la même période.</li>
                        <li>Le versement stipulé ne libère le locataire qu'à la condition que le paiement soit effectivement et intégralement encaissé, particulièrement dans le cas de chèques ou virements bancaires non compensés.</li>
                        <li>Dans le cas d'un versement partiel ne couvrant pas la totalité du terme échu, le présent document fait office de simple reçu pour le montant payé et n'a pas valeur de quittance libératoire complète de la période locative.</li>
                        <li>En application des dispositions régissant les baux à usage d'habitation en République de Côte d'Ivoire, l'acceptation de la présente quittance ne constitue pas renonciation de la part du bailleur à d'éventuels arriérés, pénalités de retard ou révisions de loyer dues antérieurement.</li>
                        <li>Le locataire est tenu de conserver cette quittance numériquement ou physiquement pour toute démarche administrative et pendant toute la durée légale de conservation des pièces comptables requises par la législation ivoirienne.</li>
                    </ul>
                </div>

                {/* Tableau Financier */}
                <div className="mb-14 relative z-10">
                    <table className="w-full text-left border-collapse border border-gray-900">
                        <thead>
                            <tr className="bg-gray-100 text-gray-900 border-b-2 border-gray-900 text-sm">
                                <th className="p-3 font-bold border-r border-gray-900">Période de location</th>
                                <th className="p-3 text-right font-bold border-r border-gray-900">Loyer de base</th>
                                <th className="p-3 text-right font-bold border-r border-gray-900">Charges</th>
                                <th className="p-4 text-right font-black w-40">Total Réglé</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            <tr>
                                <td className="p-4 border-r border-gray-900 text-gray-800 font-medium">
                                    Du {new Date(receipt.periodStart).toLocaleDateString('fr-FR')} <br />
                                    au {new Date(receipt.periodEnd).toLocaleDateString('fr-FR')}
                                </td>
                                <td className="p-4 text-right border-r border-gray-900 font-mono text-gray-700">{receipt.lease.rentAmount.toLocaleString('fr-FR')} FCFA</td>
                                <td className="p-4 text-right border-r border-gray-900 font-mono text-gray-700">{(receipt.lease.charges || 0).toLocaleString('fr-FR')} FCFA</td>
                                <td className="p-4 text-right text-xl font-black text-gray-900 bg-gray-50 border-gray-900 font-mono">
                                    {receipt.amountPaid.toLocaleString('fr-FR')} <span className="text-sm">FCFA</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="mt-4 bg-green-50 text-green-800 p-3 rounded text-sm border border-green-200 flex items-center font-medium shadow-sm">
                        <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                        Paiement certifié reçu le {new Date(receipt.paymentDate).toLocaleDateString('fr-FR')} par {receipt.paymentMethod || 'Espèces / Virement'}.
                    </div>
                </div>

                {/* Footer Validation & QR */}
                <div className="flex justify-between items-end pt-8 relative z-10">

                    {/* Authentification par QR Code */}
                    <div className="flex items-center space-x-6 bg-white p-4 border-2 border-gray-900 rounded shadow-sm">
                        <div className="flex-shrink-0">
                            {qrCodeDataUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={qrCodeDataUrl} alt="QR Code d'authenticité" className="w-28 h-28 print:w-32 print:h-32 object-contain" />
                            ) : (
                                <div className="w-28 h-28 bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400 border border-dashed border-gray-300">QR CODE</div>
                            )}
                        </div>
                        <div className="max-w-[200px]">
                            <h4 className="font-black text-gray-900 uppercase text-xs tracking-wider mb-1">Authentification QAPRIL</h4>
                            <p className="text-[10px] text-gray-600 leading-tight">
                                Ce document est cryptographiquement certifié. Scannez le QR Code officiel avec votre smartphone ou composez le service USSD pour vérifier sa validité sur la plateforme d'État.
                            </p>
                            <p className="text-[9px] text-gray-400 mt-2 font-mono break-all">{receipt.qrCodeHash}</p>
                        </div>
                    </div>

                    {/* Signature */}
                    <div className="w-64 text-center">
                        <p className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-8">Signature du bailleur</p>
                        <div className="border-b-2 border-gray-900 w-full mb-2 border-dashed"></div>
                        <p className="text-[10px] text-gray-500 italic">Document numérique valant quitus de paiement</p>
                    </div>

                </div>

            </div>

            {/* Barre d'outils flottante pour imprimer (masquée à l'impression) */}
            <div className="fixed bottom-8 right-8 print:hidden flex space-x-4">
                <a href="/locataire" className="bg-white text-gray-800 shadow-lg px-6 py-3 rounded-full font-medium hover:bg-gray-50">
                    Retour
                </a>
                <PrintButton />
            </div>
        </div>
    )
}
