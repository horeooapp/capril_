"use client"

import { motion } from "framer-motion"
import Link from "next/link"

interface Property {
    id: string;
    propertyCategory: string;
    propertyCode: string;
    propertyType: string;
    commune: string;
    addressLine1: string;
    neighborhood?: string;
    city?: string;
    declaredRentFcfa: bigint | number;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function PropertiesClient({ properties }: { properties: Property[] }) {
    return (
        <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-12"
        >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter leading-none mb-4 uppercase">
                        Patrimoine.
                    </h1>
                    <p className="text-gray-500 font-medium tracking-wide">
                        Gestion certifiée de votre parc immobilier et suivi de conformité.
                    </p>
                </div>
                <Link 
                    href="/dashboard/properties/new" 
                    className="px-8 py-4 bg-gray-900 text-white rounded-[1.5rem] font-bold uppercase tracking-widest text-xs hover:bg-orange-600 transition-all shadow-xl shadow-gray-200 flex items-center gap-3 active:scale-95 group"
                >
                    <span>Enregistrer un bien</span>
                    <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                </Link>
            </div>

            {properties.length === 0 ? (
                <motion.div variants={item} className="glass-panel rounded-[3rem] p-20 text-center flex flex-col items-center">
                    <div className="w-24 h-24 bg-orange-50 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner border border-white">
                        <span className="text-4xl grayscale opacity-50">🏢</span>
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-4">Aucun actif détecté</h3>
                    <p className="text-gray-500 max-w-sm font-medium mb-10 leading-relaxed">
                        Digitalisez votre premier bien immobilier pour bénéficier de la gestion automatisée et certifiée QAPRIL.
                    </p>
                    <Link href="/dashboard/properties/new" className="px-10 py-4 bg-orange-500 text-white font-black rounded-2xl shadow-xl shadow-orange-100 hover:bg-orange-600 transition-all uppercase tracking-widest text-xs">
                        Commencer maintenant
                    </Link>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {properties.map((property) => (
                        <motion.div 
                            key={property.id} 
                            variants={item}
                            className="glass-card rounded-[2.5rem] overflow-hidden group hover:border-orange-500/30"
                        >
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-8">
                                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-sm border border-white ${
                                        property.propertyCategory === 'RESIDENTIAL' 
                                        ? 'bg-blue-50 text-blue-600' 
                                        : 'bg-purple-50 text-purple-600'
                                    }`}>
                                        {property.propertyCategory === 'RESIDENTIAL' ? 'Résidentiel' : 'Commercial'}
                                    </div>
                                    <span className="label-tech opacity-40 group-hover:opacity-100 transition-opacity">
                                        {property.propertyCode}
                                    </span>
                                </div>
                                
                                <h3 className="text-2xl font-black text-gray-900 mb-2 leading-tight group-hover:text-orange-600 transition-colors">
                                    {property.propertyType === 'VILLA' ? '🏡 Villa' : property.propertyType === 'APARTMENT' ? '🏢 Appartement' : '🏠 Bien'} {property.commune}
                                </h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] line-clamp-1 mb-10">
                                    📍 {property.addressLine1}
                                </p>

                                <div className="flex items-end justify-between pt-8 border-t border-gray-50">
                                    <div>
                                        <p className="label-tech text-[9px] mb-2">Loyer Mensuel</p>
                                        <p className="text-2xl font-black text-gray-900 tracking-tighter">
                                            {Number(property.declaredRentFcfa).toLocaleString('fr-FR')} <span className="text-[10px] font-medium tracking-normal text-gray-400 ml-1">FCFA</span>
                                        </p>
                                    </div>
                                    <Link 
                                        href={`/dashboard/properties/${property.id}`}
                                        className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center hover:bg-gray-900 hover:text-white transition-all shadow-inner border border-white"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    )
}
