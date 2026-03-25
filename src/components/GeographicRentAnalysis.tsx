"use client"

import { motion } from "framer-motion"
import BarChart from "./BarChart"

const communeData = [
    { label: "Cocody", value: 650000 },
    { label: "Marcory", value: 550000 },
    { label: "Plateau", value: 850000 },
    { label: "Yopougon", value: 250000 },
    { label: "Abobo", value: 180000 },
    { label: "Koumassi", value: 300000 }
]

const cityData = [
    { label: "Abidjan", value: 450000 },
    { label: "Yamoussoukro", value: 280000 },
    { label: "Bouaké", value: 220000 },
    { label: "San Pedro", value: 350000 },
    { label: "Korhogo", value: 150000 }
]

const regionData = [
    { label: "Lagunes", value: 420000 },
    { label: "Bawa", value: 250000 },
    { label: "Gbèkè", value: 210000 },
    { label: "Poro", value: 140000 },
    { label: "San Pedro", value: 320000 }
]

export default function GeographicRentAnalysis() {
    return (
        <section id="geo-analysis" className="py-32 bg-gray-50/30 overflow-hidden relative border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4 block">Cartographie des Loyers</span>
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase italic leading-none">
                        Analyse <span className="text-primary italic">Géographique</span>.
                    </h2>
                    <p className="mt-6 text-lg text-gray-500 font-medium max-w-2xl mx-auto">
                        Comparez les niveaux de prix moyens pratiqués sur le territoire national, certifiés par les flux du Registre Locatif.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <BarChart 
                            title="Loyers par Commune (Abidjan)"
                            data={communeData}
                            unit="FCFA"
                            color="#C55A11"
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        viewport={{ once: true }}
                    >
                        <BarChart 
                            title="Loyers par Ville (Moyenne)"
                            data={cityData}
                            unit="FCFA"
                            color="#1F4E79"
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        viewport={{ once: true }}
                    >
                        <BarChart 
                            title="Loyers par Région"
                            data={regionData}
                            unit="FCFA"
                            color="#375623"
                        />
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
