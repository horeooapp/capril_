import React from 'react';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { ShieldCheck, AlertTriangle, XCircle, MapPin, Calendar, FileText, CheckCircle2 } from 'lucide-react';

interface Props {
    params: Promise<{ token: string }>;
}

export default async function VerificationAttestationPage({ params }: Props) {
    const { token } = await params;

    const attestation = await prisma.attestationResidence.findUnique({
        where: { tokenVerif: token },
        include: {
            beneficiaire: { select: { firstName: true, lastName: true } },
            lease: {
                select: {
                    leaseReference: true,
                    property: { select: { commune: true, codeLocalisation: true, name: true } }
                }
            }
        }
    });

    if (!attestation) {
        return (
            <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white border border-slate-200 rounded-lg p-6 text-center shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                        <XCircle size={24} />
                    </div>
                    <h1 className="text-lg font-bold text-slate-900 mb-2">Attestation Introuvable</h1>
                    <p className="text-sm text-slate-600 mb-6">
                        Ce QR code ou ce lien de vérification ne correspond à aucun document officiel enregistré sur la plateforme QAPRIL.
                    </p>
                    <div className="text-xs text-slate-400">
                        Vérification sécurisée · Infrastructure QAPRIL Côte d'Ivoire
                    </div>
                </div>
            </main>
        );
    }

    // Calcul du statut de validité
    const now = new Date();
    const isExpired = now > new Date(attestation.valideJusque);
    const displayStatus = isExpired ? 'EXPIREE' : attestation.statut;

    // Nom du bénéficiaire
    const nomResident = attestation.beneficiaire
        ? `${attestation.beneficiaire.firstName || ''} ${attestation.beneficiaire.lastName || ''}`.trim()
        : 'Résident certifié';

    const niveauLibelle = attestation.niveau === 'A'
        ? "Niveau A — Titulaire d'un bail enregistré à la DGI avec position confirmée"
        : attestation.niveau === 'B'
        ? "Niveau B — Occupant déclaré par le titulaire avec présence confirmée sur place"
        : "Niveau C — Déclaration de résidence à valeur indicative";

    return (
        <main className="min-h-screen bg-slate-50 py-10 px-4 flex justify-center">
            <div className="max-w-xl w-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                {/* En-tête officiel */}
                <div className="bg-[#1B4D3E] p-6 text-white text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold tracking-wider uppercase mb-3">
                        <ShieldCheck size={14} /> Tiers de Confiance Numérique · Côte d'Ivoire
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">Vérification Officielle de Résidence</h1>
                    <p className="text-xs text-emerald-100 mt-1">Conforme à la Loi N° 2013-546 et au CCH Loi N° 2019-576</p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Statut du document */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <div>
                            <span className="text-xs font-medium text-slate-500 block">STATUT DE L'ATTESTATION</span>
                            <span className="text-base font-bold text-slate-900">
                                {displayStatus === 'VALIDE' && (
                                    <span className="inline-flex items-center gap-1.5 text-emerald-700">
                                        <CheckCircle2 size={18} /> Document Valide & Authentique
                                    </span>
                                )}
                                {displayStatus === 'EXPIREE' && (
                                    <span className="inline-flex items-center gap-1.5 text-amber-700">
                                        <AlertTriangle size={18} /> Document Expiré (Valable 3 mois)
                                    </span>
                                )}
                                {displayStatus === 'REVOQUEE' && (
                                    <span className="inline-flex items-center gap-1.5 text-red-700">
                                        <XCircle size={18} /> Document Révoqué (Résidence close)
                                    </span>
                                )}
                            </span>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-medium text-slate-500 block">NIVEAU DE PREUVE</span>
                            <span className={`inline-block px-2.5 py-1 text-xs font-black rounded border ${
                                attestation.niveau === 'A' 
                                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300' 
                                    : attestation.niveau === 'B' 
                                    ? 'bg-blue-50 text-blue-900 border-blue-300' 
                                    : 'bg-amber-50 text-amber-900 border-amber-300'
                            }`}>
                                NIVEAU {attestation.niveau}
                            </span>
                        </div>
                    </div>

                    {/* Données certifiées */}
                    <div className="space-y-4">
                        <div className="border-b border-slate-100 pb-3">
                            <span className="text-xs text-slate-500 block">Bénéficiaire résident</span>
                            <span className="text-base font-bold text-slate-900">{nomResident}</span>
                            <span className="text-xs text-slate-600 block mt-0.5">
                                Qualité : {attestation.qualite === 'TITULAIRE' ? 'Titulaire du contrat de bail' : 'Occupant déclaré du foyer'}
                            </span>
                        </div>

                        <div className="border-b border-slate-100 pb-3">
                            <span className="text-xs text-slate-500 block">Commune & Localisation</span>
                            <span className="text-sm font-semibold text-slate-900 flex items-center gap-1 mt-0.5">
                                <MapPin size={15} className="text-[#1B4D3E]" /> {attestation.lease.property.commune} (District d'Abidjan)
                            </span>
                            {attestation.lease.property.codeLocalisation && (
                                <span className="text-xs text-[#1B4D3E] font-mono font-medium block mt-1">
                                    Code Officiel : {attestation.lease.property.codeLocalisation}
                                </span>
                            )}
                        </div>

                        <div className="border-b border-slate-100 pb-3">
                            <span className="text-xs text-slate-500 block">Période de validité de l'attestation</span>
                            <div className="flex items-center gap-2 text-sm text-slate-800 mt-0.5">
                                <Calendar size={15} className="text-slate-400" />
                                <span>Du {new Date(attestation.emiseAt).toLocaleDateString('fr-FR')} au {new Date(attestation.valideJusque).toLocaleDateString('fr-FR')}</span>
                            </div>
                        </div>

                        <div className="border-b border-slate-100 pb-3">
                            <span className="text-xs text-slate-500 block">Niveau de force probante (RG-OCC-11)</span>
                            <span className="text-xs text-slate-800 block mt-1 leading-relaxed">
                                {niveauLibelle}
                            </span>
                        </div>

                        <div>
                            <span className="text-xs text-slate-500 block">Empreinte cryptographique de scellement (SHA-256)</span>
                            <span className="text-[11px] font-mono text-slate-600 break-all block bg-slate-50 p-2 rounded border border-slate-200 mt-1">
                                {attestation.sha256}
                            </span>
                        </div>
                    </div>

                    {/* Mentions institutionnelles pour banques et commissariats */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 space-y-2">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                            <FileText size={14} className="text-[#1B4D3E]" /> Note aux Établissements Bancaires et Administrations (APBEF-CI) :
                        </div>
                        <p className="leading-relaxed">
                            Ce document certifie la résidence effective de la personne désignée ci-dessus. 
                            Les attestations de <strong>Niveau A</strong> et <strong>Niveau B</strong> sont délivrées sur la base d'un bail juridique enregistré et d'une localisation physique confirmée sur place.
                        </p>
                        <p className="text-[11px] text-slate-500 pt-1">
                            Réf. Unique : {attestation.numero} · {attestation.nbVerifications} vérification(s) enregistrée(s).
                        </p>
                    </div>
                </div>

                <div className="bg-slate-100 p-4 text-center border-t border-slate-200">
                    <p className="text-[11px] text-slate-500">
                        Protection des données assurée selon la Loi N° 2013-450 (ARTCI) · Identité du bailleur masquée sous secret professionnel (RG-CONF-01).
                    </p>
                </div>
            </div>
        </main>
    );
}

