"use client"
import { useState } from "react"

interface AccordionItemProps {
    title: string;
    content: React.ReactNode;
    isOpen: boolean;
    onClick: () => void;
}

function AccordionItem({ title, content, isOpen, onClick }: AccordionItemProps) {
    return (
        <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
            <button
                className="w-full text-left px-6 py-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors focus:outline-none"
                onClick={onClick}
            >
                <span className="font-semibold text-lg text-gray-900">{title}</span>
                <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </span>
            </button>
            <div
                className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="px-6 py-6 text-gray-600 leading-relaxed bg-white border-t border-gray-100">
                    {content}
                </div>
            </div>
        </div>
    )
}

export default function ContentAccordion() {
    const [openIndex, setOpenIndex] = useState<number | null>(0) // First open by default

    const sections = [
        {
            id: "a-propos",
            title: "À propos de QAPRIL",
            content: (
                <div className="space-y-4">
                    <p>
                        <strong>QAPRIL (Quittance Automatisée pour le Registre Immobilier et Locatif)</strong> est la plateforme numérique pionnière en Côte d'Ivoire dédiée à la structuration et la sécurisation du secteur locatif.
                    </p>
                    <p>
                        Notre mission est de digitaliser l'émission des quittances de loyer et de fournir un registre centralisé, fiable et transparent, profitant aussi bien aux bailleurs, aux locataires qu'aux institutions étatiques.
                    </p>
                </div>
            )
        },
        {
            id: "qui-sommes-nous",
            title: "Qui sommes-nous ?",
            content: (
                <div className="space-y-4">
                    <p>
                        QAPRIL est le fruit d'un partenariat technologique visant à moderniser l'administration ivoirienne. Conçu par des experts en ingénierie logicielle et en droit immobilier Ivoirien, le projet apporte une solution concrète aux litiges locatifs fréquents.
                    </p>
                    <p>
                        Notre équipe travaille en étroite collaboration avec les ministères concernés pour s'assurer que chaque quittance générée ait une valeur juridique authentique et incontestable devant les tribunaux ou les banques.
                    </p>
                </div>
            )
        },
        {
            id: "faq",
            title: "Foire Aux Questions (FAQ)",
            content: (
                <div className="space-y-6">
                    <div>
                        <h4 className="font-medium text-gray-900 mb-1">Q : Le QR Code sur la quittance, à quoi sert-il ?</h4>
                        <p className="text-sm">R : Il permet à n'importe quelle autorité ou institution bancaire de scanner le document pour vérifier son authenticité en temps réel sur nos serveurs. C'est l'arme ultime contre la fraude.</p>
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-900 mb-1">Q : Les locataires ont-ils accès à ces documents ?</h4>
                        <p className="text-sm">R : Absolument. Chaque locataire peut se connecter avec son adresse e-mail ou son numéro de téléphone (via USSD) pour télécharger l'historique de ses paiements validés.</p>
                    </div>
                </div>
            )
        },
        {
            id: "contact",
            title: "Contact & Assistance",
            content: (
                <div className="space-y-4">
                    <p>
                        Une équipe de support dédiée est à votre disposition en Côte d'Ivoire pour toute question relative à l'utilisation de la plateforme.
                    </p>
                    <ul className="list-none space-y-2 mt-4 bg-gray-50 p-4 rounded-md inline-block border border-gray-100">
                        <li className="flex items-center text-sm">
                            <span className="font-semibold mr-2 w-20">E-mail :</span> support@qapril.ci
                        </li>
                        <li className="flex items-center text-sm">
                            <span className="font-semibold mr-2 w-20">Téléphone :</span> +225 00 00 00 00 00
                        </li>
                        <li className="flex items-center text-sm">
                            <span className="font-semibold mr-2 w-20">Assistance :</span> Tapez *123# (Service USSD)
                        </li>
                    </ul>
                </div>
            )
        }
    ]

    return (
        <div className="w-full max-w-4xl mx-auto py-12 px-4" id="content-sections">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                    Informations Centrales
                </h2>
                <p className="mt-4 text-lg text-gray-500">
                    Découvrez tout ce qu'il faut savoir sur la plateforme QAPRIL.
                </p>
            </div>
            <div className="space-y-2">
                {sections.map((section, index) => (
                    <div key={section.id} id={section.id} className="scroll-mt-24">
                        <AccordionItem
                            title={section.title}
                            content={section.content}
                            isOpen={openIndex === index}
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}
