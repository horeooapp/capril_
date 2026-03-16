/* eslint-disable @next/next/no-img-element */
import Link from "next/link"

interface CardProps {
    title: string
    description: string
    image: string
    tag?: string
    link: string
    reverse?: boolean
}

function DepthCard({ title, description, image, tag, link, reverse }: CardProps) {
    return (
        <div className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 py-16 border-b border-gray-100 last:border-0`}>
            <div className="flex-1 space-y-6">
                {tag && (
                    <span className="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-[10px] font-black uppercase tracking-widest">
                        {tag}
                    </span>
                )}
                <h3 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">
                    {title}
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed font-medium">
                    {description}
                </p>
                <Link 
                    href={link}
                    className="inline-flex items-center text-primary font-black uppercase tracking-widest text-sm group"
                >
                    Découvrir l&apos;impact 
                    <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </Link>
            </div>
            <div className="flex-1 w-full relative">
                <div className="absolute inset-0 bg-primary/10 rounded-[2rem] transform rotate-3 -z-10"></div>
                <img 
                    src={image} 
                    alt={title} 
                    className="w-full h-auto rounded-[2rem] shadow-2xl border-4 border-white object-cover"
                />
            </div>
        </div>
    )
}

export default function AppDepthCards() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <DepthCard 
                title="Passeport Numérique du Bâti (PNB)"
                description="Plus qu'un mur, une mémoire. Chaque logement sur QAPRIL possède son propre ADN numérique. Un historique certifié des incidents, travaux et améliorations qui suit le bien à vie, valorisant le patrimoine et rassurant les occupants."
                image="/images/passport_visual.png"
                link="/impact"
            />
            <DepthCard 
                title="Audit & Transparence Publique"
                description="La fin de la fraude documentaire. Chaque quittance ou certificat généré sur la plateforme est authentifié par une signature numérique unique. Un simple scan QR permet à quiconque de vérifier l'exactitude des faits en temps réel."
                image="/images/qr_visual.png"
                link="/impact"
                reverse
            />
            <DepthCard 
                title="Protection des Revenus"
                description="La sécurité institutionnelle au service de l'immobilier. En partenariat avec la Caisse des Dépôts et Consignations, nous automalisons la sécurisation des dépôts de garantie, protégeant les intérêts financiers des deux parties."
                image="/images/cdc_visual.png"
                link="/impact"
            />
        </div>
    )
}
