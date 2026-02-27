import { PrismaClient } from "@prisma/client"
import Link from "next/link"

const prisma = new PrismaClient()

export default async function VerifyReceiptPage({ params }: { params: { hash: string } }) {
    const receiptHash = params.hash

    const receipt = await prisma.receipt.findUnique({
        where: { qrCodeHash: receiptHash },
        include: {
            lease: {
                include: {
                    property: true,
                    owner: true,
                    tenant: true
                }
            }
        }
    })

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
                <div className="text-center">
                    {/* Logo */}
                    <div className="flex justify-center flex-row space-x-1 mb-4">
                        <div className="w-4 h-10 bg-primary rounded-sm" />
                        <div className="w-4 h-10 bg-gray-200 rounded-sm" />
                        <div className="w-4 h-10 bg-secondary rounded-sm" />
                    </div>
                    <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
                        Audit de Quittance
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Plateforme Nationale QAPRIL
                    </p>
                </div>

                {receipt ? (
                    <div className="mt-8 bordert border-gray-200 pt-6">
                        <div className="rounded-md bg-green-50 p-4 mb-6">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-green-800">Quittance Authentique</h3>
                                    <div className="mt-2 text-sm text-green-700">
                                        <p>Ce document est officiellement enregistré dans le registre national de Côte d'Ivoire.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <dl className="mt-4 space-y-4 divide-y divide-gray-200 text-sm">
                            <div className="pt-4 flex justify-between">
                                <dt className="text-gray-500">N° Quittance</dt>
                                <dd className="font-semibold text-gray-900">{receipt.receiptNumber}</dd>
                            </div>
                            <div className="pt-4 flex justify-between">
                                <dt className="text-gray-500">Locataire</dt>
                                {/* @ts-ignore */}
                                <dd className="font-medium text-gray-900">{receipt.lease.tenant.name || receipt.lease.tenant.email}</dd>
                            </div>
                            <div className="pt-4 flex justify-between">
                                <dt className="text-gray-500">Bailleur</dt>
                                <dd className="font-medium text-gray-900">{receipt.lease.owner.name || receipt.lease.owner.email}</dd>
                            </div>
                            <div className="pt-4 flex justify-between">
                                <dt className="text-gray-500">Période</dt>
                                <dd className="font-medium text-gray-900">{new Date(receipt.periodStart).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</dd>
                            </div>
                            <div className="pt-4 flex justify-between items-center">
                                <dt className="text-gray-500">Montant réglé</dt>
                                <dd className="font-bold text-lg text-primary">{receipt.amountPaid.toLocaleString('fr-FR')} FCFA</dd>
                            </div>
                        </dl>
                    </div>
                ) : (
                    <div className="mt-8">
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">Quittance Invalide ou Introuvable</h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        <p>Le code scanné ne correspond à aucun document certifié QAPRIL. Méfiez-vous des fraudes.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="pt-6">
                    <Link href="/" className="text-sm font-medium text-primary hover:text-orange-600 block text-center">
                        &larr; Retour à l'accueil QAPRIL
                    </Link>
                </div>
            </div>
        </div>
    )
}
