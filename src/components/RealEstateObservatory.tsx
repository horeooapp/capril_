"use client"
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { motion } from "framer-motion"
import TrendChart from "./TrendChart"
import { getObservatoryTrends, downloadObservatoryReport } from "@/actions/observatory-actions";

export default function RealEstateObservatory() {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        async function fetchStats() {
            const result = await getObservatoryTrends();
            if (result.success) {
                setStats(result.data);
            }
        }
        fetchStats();
    }, []);

    const handleDownload = async (e: React.MouseEvent) => {
        e.preventDefault();
        toast.promise(downloadObservatoryReport(), {
            loading: 'Génération du rapport analytique...',
            success: (data) => {
                if (data.success) return data.message;
                throw new Error(data.error);
            },
            error: 'Erreur lors du téléchargement.'
        });
    };

    if (!stats) return null; // or a skeleton

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
                            data={stats.residential} 
                            unit="XOF / Mois"
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
                            data={stats.commercial} 
                            unit="XOF / m²"
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
                            data={stats.land} 
                            unit="XOF / m²"
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
                        <button className="px-10 py-5 bg-primary hover:bg-orange-600 transition-colors rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20 whitespace-nowrap" onClick={handleDownload}>
                            Descendre le Rapport PDF
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}
