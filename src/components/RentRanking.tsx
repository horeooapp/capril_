"use client"

import { motion } from "framer-motion"
import { Trophy, TrendingUp, MapPin } from "lucide-react"

interface RankingItem {
    label: string
    value: number
    rank: number
}

interface RankingListProps {
    title: string
    items: RankingItem[]
    unit: string
}

function RankingList({ title, items, unit }: RankingListProps) {
    return (
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/50 flex flex-col h-full hover:scale-[1.02] transition-transform">
            <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-primary">
                    <Trophy size={24} />
                </div>
                <div>
                    <h4 className="text-lg font-black text-gray-900 uppercase tracking-tighter italic leading-none">{title}</h4>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Classement QAPRIL 2026</span>
                </div>
            </div>

            <div className="space-y-6">
                {items.map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        viewport={{ once: true }}
                        className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group"
                    >
                        <div className="flex items-center gap-5">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                                i === 0 ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20' : 
                                i === 1 ? 'bg-gray-900 text-white' : 
                                i === 2 ? 'bg-gray-400 text-white' : 'bg-gray-100 text-gray-400'
                            }`}>
                                {item.rank}
                            </span>
                            <div className="flex flex-col">
                                <span className="font-black text-gray-900 uppercase tracking-tighter text-sm italic group-hover:text-primary transition-colors">{item.label}</span>
                                <div className="flex items-center gap-1 opacity-40">
                                    <MapPin size={10} />
                                    <span className="text-[8px] font-black uppercase">Localisation Certifiée</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="block font-black text-gray-900 text-base tabular-nums">{item.value.toLocaleString()}</span>
                            <span className="text-[9px] font-black text-primary uppercase tracking-widest">{unit}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

const rawCommuneData = [
    { label: "Plateau", value: 850000 },
    { label: "Cocody", value: 650000 },
    { label: "Marcory", value: 550000 },
    { label: "Riviera", value: 480000 },
    { label: "Koumassi", value: 300000 }
].map((item, i) => ({ ...item, rank: i + 1 }))

const rawCityData = [
    { label: "Abidjan", value: 450000 },
    { label: "San Pedro", value: 350000 },
    { label: "Yamoussoukro", value: 280000 },
    { label: "Bouaké", value: 220000 },
    { label: "Daloa", value: 180000 }
].map((item, i) => ({ ...item, rank: i + 1 }))

export default function RentRanking() {
    return (
        <section id="rent-ranking" className="py-32 bg-white overflow-hidden relative border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-20 text-center md:text-left">
                    <div className="max-w-xl">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4 block">Indice de Positionnement</span>
                        <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter uppercase italic leading-none">
                            Le <span className="text-primary italic">Palmarès</span> Locatif.
                        </h2>
                        <p className="mt-8 text-xl text-gray-500 font-medium leading-relaxed">
                            Quelles zones dominent le marché ? Découvrez le classement des pôles les plus attractifs par coût du loyer moyen.
                        </p>
                    </div>
                    <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 flex items-center gap-6">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl">
                            <TrendingUp className="text-primary" size={32} />
                        </div>
                        <div>
                            <span className="block text-2xl font-black text-gray-900 leading-none tracking-tighter italic">+12.4%</span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Variation Annuelle Moyenne</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <RankingList 
                        title="Top 5 Communes (Luxe/Affaires)"
                        items={rawCommuneData}
                        unit="FCFA / Mois"
                    />
                    <RankingList 
                        title="Top 5 Villes Nationales"
                        items={rawCityData}
                        unit="FCFA / Mois"
                    />
                </div>
            </div>
        </section>
    )
}
