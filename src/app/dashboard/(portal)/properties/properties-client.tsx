"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { 
    Building2, 
    Home, 
    MapPin, 
    ArrowRight, 
    Plus,
    Building,
    Compass,
    SearchX
} from "lucide-react"

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
            {/* Header section with refined glass branding */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter leading-none mb-4 uppercase">
                        Patrimoine.
                    </h1>
                    <p className="text-gray-500 font-medium tracking-wide flex items-center gap-2">
                        <Compass size={14} className="text-primary" />
                        Gestion certifiée de votre parc immobilier et suivi de conformité <span className="text-gray-900 font-bold">QAPRIL Secure</span>.
                    </p>
                </div>
                <Link 
                    href="/dashboard/properties/new" 
                    className="px-8 py-4 bg-gray-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-primary transition-all shadow-2xl flex items-center gap-3 active:scale-95 group"
                >
                    <Plus size={16} />
                    <span>Enregistrer un bien</span>
                </Link>
            </div>

            {properties.length === 0 ? (
                <motion.div variants={item} className="glass-panel rounded-[3rem] p-24 text-center border border-white/40 shadow-2xl flex flex-col items-center">
                    <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner border border-white rotate-3 group-hover:rotate-0 transition-transform">
                        <SearchX size={48} className="text-gray-300" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-4 italic">Aucun actif détecté</h3>
                    <p className="text-gray-500 max-w-sm font-medium mb-10 leading-relaxed">
                        Digitalisez votre premier bien immobilier pour bénéficier de la gestion automatisée et certifiée. <br />
                        <span className="text-[10px] uppercase font-black tracking-widest text-primary mt-4 block">Protocole de sécurité activé</span>
                    </p>
                    <Link href="/dashboard/properties/new" className="px-10 py-5 bg-primary text-white font-black rounded-2xl shadow-xl hover:bg-orange-600 transition-all uppercase tracking-widest text-[10px]">
                        Commencer maintenant
                    </Link>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {properties.map((property) => (
                        <motion.div 
                            key={property.id} 
                            variants={item}
                            className="glass-card-premium rounded-[2.8rem] overflow-hidden group hover:border-primary/30 border border-white/40 shadow-2xl hover:scale-[1.02] transition-all relative"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-10 -mt-10 rounded-full group-hover:bg-primary/10 transition-colors"></div>
                            
                            <div className="p-10 relative z-10">
                                <div className="flex justify-between items-start mb-10">
                                    <div className={`px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] shadow-sm border border-white ${
                                        property.propertyCategory === 'RESIDENTIAL' 
                                        ? 'bg-blue-50 text-blue-600' 
                                        : 'bg-violet-50 text-violet-600'
                                    }`}>
                                        {property.propertyCategory === 'RESIDENTIAL' ? 'Résidentiel' : 'Commercial'}
                                    </div>
                                    <span className="text-[10px] font-black text-gray-300 group-hover:text-primary transition-colors tracking-widest uppercase">
                                        #{property.propertyCode}
                                    </span>
                                </div>
                                
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center text-gray-400 group-hover:bg-gray-900 group-hover:text-white transition-all">
                                        {property.propertyType === 'VILLA' ? <Home size={24} /> : <Building2 size={24} />}
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 leading-tight uppercase tracking-tighter italic">
                                        {property.propertyType === 'VILLA' ? 'Villa' : property.propertyType === 'APARTMENT' ? 'Appart' : 'Bien'} {property.commune}
                                    </h3>
                                </div>
                                <div className="flex items-center gap-2 mb-12">
                                    <MapPin size={12} className="text-primary" />
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.1em] line-clamp-1">
                                        {property.addressLine1}
                                    </p>
                                </div>

                                <div className="flex items-end justify-between pt-8 border-t border-gray-100">
                                    <div>
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none">Loyer de Base</p>
                                        <p className="text-3xl font-black text-gray-900 tracking-tighter leading-none">
                                            {Number(property.declaredRentFcfa).toLocaleString('fr-FR')} <span className="text-[10px] font-bold text-gray-300 ml-1">FCFA</span>
                                        </p>
                                    </div>
                                    <Link 
                                        href={`/dashboard/properties/${property.id}`}
                                        className="w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-900 hover:text-white transition-all shadow-xl hover:shadow-gray-200"
                                    >
                                        <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
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
