"use client"

import { motion } from "framer-motion"
import TrendChart from "./TrendChart"

const residentialData = [
    { label: "Jan 25", value: 420000 },
    { label: "Feb 25", value: 435000 },
    { label: "Mar 25", value: 450000 },
    { label: "Apr 25", value: 445000 },
    { label: "May 25", value: 460000 },
    { label: "Jun 25", value: 475000 },
    { label: "Jul 25", value: 490000 },
    { label: "Aug 25", value: 510000 },
    { label: "Sep 25", value: 505000 },
    { label: "Oct 25", value: 520000 },
    { label: "Nov 25", value: 535000 },
    { label: "Dec 25", value: 550000 }
]

const commercialData = [
    { label: "Jan 25", value: 15000 },
    { label: "Feb 25", value: 15200 },
    { label: "Mar 25", value: 15500 },
    { label: "Apr 25", value: 15800 },
    { label: "May 25", value: 16000 },
    { label: "Jun 25", value: 16200 },
    { label: "Jul 25", value: 16500 },
    { label: "Aug 25", value: 16800 },
    { label: "Sep 25", value: 17000 },
    { label: "Oct 25", value: 17200 },
    { label: "Nov 25", value: 17500 },
    { label: "Dec 25", value: 18000 }
]

const landData = [
    { label: "Jan 25", value: 85000 },
    { label: "Feb 25", value: 88000 },
    { label: "Mar 25", value: 92000 },
    { label: "Apr 25", value: 95000 },
    { label: "May 25", value: 100000 },
    { label: "Jun 25", value: 105000 },
    { label: "Jul 25", value: 110000 },
    { label: "Aug 25", value: 115000 },
    { label: "Sep 25", value: 120000 },
    { label: "Oct 25", value: 125000 },
    { label: "Nov 25", value: 130000 },
    { label: "Dec 25", value: 140000 }
]

export default function RealEstateObservatory() {
    return (
        <section id="observatory" className="py-32 bg-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-full h-full bg-mesh opacity-30 -z-10"></div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row items-end justify-between gap-8 mb-20">
                    <div className="max-w-2xl">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-600 mb-4 block animate-in slide-in-from-left duration-700">Observatoire QAPRIL 2026</span>
                        <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter uppercase leading-none italic animate-in slide-in-from-bottom duration-700 delay-100">
                             Dynamiques <br />
                             <span className="text-primary italic">Immobilières.</span>
                        </h2>
                        <p className="mt-8 text-xl text-gray-500 font-medium leading-relaxed animate-in fade-in duration-1000 delay-300">
                            Visualisez l&apos;évolution structurelle du marché sur les 12 derniers mois. Des données consolidées pour des décisions éclairées.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <TrendChart 
                            title="Loyer Moyen Résidentiel (Abidjan)"
                            data={residentialData} 
                            unit="FCFA / Mois"
                            color="#C55A11"
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        viewport={{ once: true }}
                    >
                        <TrendChart 
                            title="Bureaux & Commerces (m²)"
                            data={commercialData} 
                            unit="FCFA / m²"
                            color="#1F4E79"
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        viewport={{ once: true }}
                    >
                        <TrendChart 
                            title="Terrains Péri-urbains (Bingerville)"
                            data={landData} 
                            unit="FCFA / m²"
                            color="#375623"
                        />
                    </motion.div>
                </div>

                <div className="mt-20 p-12 bg-gray-900 rounded-[3rem] text-white relative overflow-hidden group">
                    <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary blur-[120px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                        <div>
                            <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter italic">Rapport d&apos;Analyse Trimestriel</h3>
                            <p className="text-gray-400 font-medium max-w-xl">Accédez à l&apos;étude complète des flux migratoires et des variations de prix sectorielles certifiée par le protocole QAPRIL.</p>
                        </div>
                        <button className="px-10 py-5 bg-primary hover:bg-orange-600 transition-colors rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20 whitespace-nowrap">
                            Descendre le Rapport PDF
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}
