"use client"

import React, { useEffect, useState } from 'react'
import { getAllNews, createNews, updateNews, deleteNews } from "@/actions/news-actions"
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminNewsPage() {
    const [news, setNews] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [newContent, setNewContent] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function loadNews() {
        setLoading(true)
        const data = await getAllNews()
        setNews(data)
        setLoading(false)
    }

    useEffect(() => {
        loadNews()
    }, [])

    async function handleAdd() {
        if (!newContent.trim()) return
        setIsSubmitting(true)
        const res = await createNews(newContent)
        if (res.success) {
            setNewContent("")
            await loadNews()
        } else {
            alert(res.error || "Une erreur est survenue lors de l'ajout.")
        }
        setIsSubmitting(false)
    }

    async function handleToggle(id: string, current: boolean) {
        await updateNews(id, { isActive: !current })
        await loadNews()
    }

    async function handleDelete(id: string) {
        if (!confirm("Supprimer cette information ?")) return
        await deleteNews(id)
        await loadNews()
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-gray-900 uppercase">Gestion QAPRIL News</h1>
                    <p className="text-sm text-gray-500 font-medium">Gérez les informations défilantes de la page d'accueil</p>
                </div>
            </div>

            {/* Add News Form */}
            <div className="glass-panel p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50">
                <div className="flex flex-col md:flex-row gap-4">
                    <input 
                        type="text" 
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        placeholder="Ex: Le marché immobilier à Abidjan en forte hausse en 2026..."
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                    <button 
                        onClick={handleAdd}
                        disabled={isSubmitting}
                        className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? "Ajout..." : "Ajouter"}
                    </button>
                </div>
            </div>

            {/* News List */}
            <div className="grid gap-4">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        <div className="py-20 text-center">
                            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400">Chargement des actualités...</p>
                        </div>
                    ) : news.length === 0 ? (
                        <div className="glass-panel p-12 rounded-3xl text-center border-2 border-dashed border-gray-200">
                           <p className="text-sm font-bold text-gray-400">Aucune information pour le moment.</p>
                        </div>
                    ) : (
                        news.map((item) => (
                            <motion.div 
                                key={item.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`glass-panel p-6 rounded-3xl border ${item.isActive ? 'border-gray-100' : 'border-gray-200 bg-gray-50/50 opacity-60'} flex items-center justify-between gap-6 transition-all`}
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className={`w-2 h-2 rounded-full ${item.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                            {item.isActive ? 'Actif' : 'Masqué'}
                                        </span>
                                    </div>
                                    <p className="text-sm font-bold text-gray-900 truncate">{item.content}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => handleToggle(item.id, item.isActive)}
                                        className={`p-3 rounded-xl transition-all active:scale-95 ${item.isActive ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                                        title={item.isActive ? "Masquer" : "Afficher"}
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            {item.isActive ? (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                            ) : (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            )}
                                        </svg>
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(item.id)}
                                        className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all active:scale-95"
                                        title="Supprimer"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
