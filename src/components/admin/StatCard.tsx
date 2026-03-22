"use client"

import { motion } from "framer-motion"
import { ArrowUpRight, LucideIcon } from "lucide-react"
import Link from "next/link"

interface StatCardProps {
    title: string
    value: string
    icon: React.ReactNode
    color: string
    trend?: string
    delay?: number
    href?: string
}

export default function StatCard({ title, value, icon: Icon, color, trend, delay = 0, href }: StatCardProps) {
    const colors: Record<string, string> = {
        orange: "bg-orange-500/10 text-orange-600 border-orange-200/30",
        blue: "bg-blue-500/10 text-blue-600 border-blue-200/30",
        red: "bg-red-500/10 text-red-600 border-red-200/30",
        purple: "bg-purple-500/10 text-purple-600 border-purple-200/30",
        slate: "bg-slate-500/10 text-slate-600 border-slate-200/30",
        emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-200/30",
        amber: "bg-amber-500/10 text-amber-600 border-amber-200/30",
        indigo: "bg-indigo-500/10 text-indigo-600 border-indigo-200/30"
    }

    const cardContent = (
        <>
            <div className="absolute top-0 right-0 w-32 h-32 bg-current opacity-[0.03] -mr-16 -mt-16 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
            
            <motion.div 
                whileHover={{ rotate: 12, scale: 1.1 }}
                className={`w-14 h-14 rounded-2xl ${colors[color] || colors.orange} border flex items-center justify-center mb-8 shadow-inner transition-transform`}
            >
                {Icon}
            </motion.div>
            
            <div className="space-y-1 relative z-10 transition-transform group-hover:translate-x-1 duration-300">
                <p className="label-tech mb-2">{title}</p>
                <h3 className="text-4xl font-black text-gray-900 tracking-tighter leading-none">{value}</h3>
            </div>
            
            {trend && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: delay + 0.3 }}
                    className="mt-8 pt-6 border-t border-gray-100/50 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#1F4E79]/60"
                >
                    <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ArrowUpRight size={10} />
                    </div>
                    {trend}
                </motion.div>
            )}
        </>
    );

    const containerProps = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, delay },
        whileHover: { y: -5 },
        className: "glass-card-premium p-8 rounded-[2.5rem] relative overflow-hidden group transition-all duration-300 block"
    };

    if (href) {
        return (
            <Link href={href}>
                <motion.div {...containerProps}>
                    {cardContent}
                </motion.div>
            </Link>
        )
    }

    return (
        <motion.div {...containerProps}>
            {cardContent}
        </motion.div>
    )
}
