"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { Map, BarChart2, Globe, TrendingUp, Locate, ArrowRight } from "lucide-react"

interface MarketStats {
    nationalAvg: number;
    cities?: any[];
    regions?: any[];
    lastUpdated?: Date;
}

export default function AdminMarketWidget({ data }: { data: MarketStats }) {
    const [activeTab, setActiveTab] = useState<'national' | 'regions' | 'abidjan'>('national');

    if (!data) return null;

    const safeCities = Array.isArray(data.cities) ? data.cities : [];
    const safeRegions = Array.isArray(data.regions) ? data.regions : [];

    return (
        <div className="panel market-widget mt-8 overflow-hidden relative">
            <div className="panel-header border-b border-white/5 pb-4 mb-6">
                <div>
                    <h2 className="panel-title flex items-center gap-2">
                        <Globe className="text-ci-orange w-5 h-5" />
                        M-INTELLIGENCE : Observatoire National
                    </h2>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Intelligence Immobilière v3.0 • Côte d'Ivoire</p>
                </div>
                <div className="flex bg-ci-nuit border border-white/10 rounded-xl p-1 gap-1">
                    <button 
                        onClick={() => setActiveTab('national')}
                        className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${activeTab === 'national' ? 'bg-ci-orange text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        TERRITOIRE
                    </button>
                    <button 
                        onClick={() => setActiveTab('regions')}
                        className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${activeTab === 'regions' ? 'bg-ci-orange text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        RÉGIONS
                    </button>
                    <button 
                        onClick={() => setActiveTab('abidjan')}
                        className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${activeTab === 'abidjan' ? 'bg-ci-orange text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        ABIDJAN
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Aggregates */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                    <div className="bg-ci-nuit2 border border-white/5 rounded-2xl p-6 relative group overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-ci-orange/10 blur-[50px] -z-10 group-hover:bg-ci-orange/20 transition-all"></div>
                        <span className="text-[9px] font-black text-ci-orange uppercase tracking-widest">LOYER MOYEN NATIONAL (ILI)</span>
                        <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-3xl font-black">{data.nationalAvg.toLocaleString()}</span>
                            <span className="text-xs font-bold text-gray-500">FCFA</span>
                        </div>
                        <div className="flex items-center gap-2 mt-4 text-[10px] text-ci-vert font-bold">
                            <TrendingUp className="w-3 h-3" />
                            <span>+2.4% vs Q4 2025</span>
                        </div>
                    </div>

                    <div className="bg-ci-nuit2 border border-white/5 rounded-2xl p-6">
                        <span className="text-[9px] font-black text-ci-or uppercase tracking-widest">VOLUME DE DONNÉES ANALYSÉES</span>
                        <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-3xl font-black">{data.cities.reduce((acc, c) => acc + c.sampleCount, 0).toLocaleString()}</span>
                            <span className="text-xs font-bold text-gray-500">Baux Certifiés</span>
                        </div>
                        <p className="text-[9px] text-gray-500 mt-4 leading-relaxed">
                            Données consolidées en temps réel par le protocole de certification QAPRIL. Fiabilité à 98.5%.
                        </p>
                    </div>
                </div>

                {/* Right Column: Dynamic View */}
                <div className="lg:col-span-8 bg-ci-nuit2/50 rounded-2xl p-6 border border-white/5">
                    {activeTab === 'national' && (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }} 
                            animate={{ opacity: 1, x: 0 }}
                            className="h-full flex flex-col"
                        >
                            <h3 className="text-xs font-black uppercase mb-6 flex items-center gap-2">
                                <Locate className="w-4 h-4 text-ci-orange" />
                                Comparatif Grandes Villes
                            </h3>
                            <div className="space-y-5 flex-1">
                                {safeCities.slice(0, 5).map((city, idx) => (
                                     <div key={city.name} className="flex flex-col gap-2">
                                         <div className="flex justify-between items-center text-[11px] font-bold">
                                             <span className="uppercase">{city.name}</span>
                                             <span className="text-ci-orange">{city.avgRent?.toLocaleString?.() || city.avgRent} F</span>
                                         </div>
                                         <div className="h-2 bg-ci-nuit rounded-full overflow-hidden">
                                             <motion.div 
                                                 initial={{ width: 0 }} 
                                                 animate={{ width: `${(city.avgRent / 1000000) * 100}%` }} 
                                                 className={`h-full ${idx === 0 ? 'bg-gradient-to-r from-ci-orange to-ci-or' : 'bg-white/20'}`}
                                             ></motion.div>
                                         </div>
                                     </div>
                                 ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'regions' && (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }} 
                            animate={{ opacity: 1, x: 0 }}
                            className="h-full flex flex-col"
                        >
                            <h3 className="text-xs font-black uppercase mb-6 flex items-center gap-2">
                                <Map className="w-4 h-4 text-ci-vert" />
                                Segmentation par Zones Géographiques
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {safeRegions.map((region) => (
                                     <div key={region.name} className="p-4 rounded-xl bg-ci-nuit border border-white/5 flex flex-col justify-between group hover:border-ci-vert/30 transition-all">
                                         <span className="text-[10px] font-black uppercase text-gray-400 group-hover:text-ci-vert">{region.name}</span>
                                         <div className="mt-4 flex justify-between items-end">
                                             <div className="flex flex-col">
                                                 <span className="text-lg font-black">{region.avgRent?.toLocaleString?.() || region.avgRent} F</span>
                                                 <span className="text-[9px] text-gray-500">{region.sampleCount} échantillons</span>
                                             </div>
                                             <button className="p-2 rounded-lg bg-white/5 group-hover:bg-ci-vert group-hover:text-black transition-all">
                                                 <ArrowRight className="w-3 h-3" />
                                             </button>
                                         </div>
                                     </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'abidjan' && (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }} 
                            animate={{ opacity: 1, x: 0 }}
                            className="h-full flex flex-col"
                        >
                            <h3 className="text-xs font-black uppercase mb-6 flex items-center gap-2">
                                <BarChart2 className="w-4 h-4 text-ci-or" />
                                Focus Communes les plus actives (Abidjan)
                            </h3>
                            <div className="flex-1 grid grid-cols-2 gap-6">
                                {safeCities.filter(c => ["Cocody", "Marcory", "Plateau", "Yopougon"].includes(c?.name)).map(commune => (
                                     <div key={commune.name} className="relative p-6 rounded-2xl bg-gradient-to-br from-ci-nuit to-ci-nuit2 border border-white/5">
                                         <div className="absolute top-4 right-4 text-[10px] text-ci-or font-black">TOP</div>
                                         <div className="text-[10px] font-black text-gray-500 uppercase">{commune.name}</div>
                                         <div className="text-2xl font-black mt-2">{commune.avgRent?.toLocaleString?.() || commune.avgRent} F</div>
                                         <div className="mt-4 flex items-center gap-2">
                                             <div className="w-2 h-2 rounded-full bg-ci-vert animate-pulse"></div>
                                             <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Données Certifiées</span>
                                         </div>
                                     </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    )
}
