"use client"

import React, { useState, useEffect } from "react"
import { Bell, Check, Trash2, Clock, ShieldAlert } from "lucide-react"
import { getRecentNotifications, markAsRead, markAllAsRead } from "@/actions/notification.actions"

export default function NotificationCenter() {
    const [notifications, setNotifications] = useState<any[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const safeNotifications = Array.isArray(notifications) ? notifications : []
    const unreadCount = safeNotifications.filter(n => !n?.read).length

    async function loadNotifications() {
        setLoading(true)
        const data = await getRecentNotifications()
        setNotifications(Array.isArray(data) ? data : [])
        setLoading(false)
    }

    useEffect(() => {
        loadNotifications()
        // Poll every 60 seconds for new notifications
        const interval = setInterval(loadNotifications, 60000)
        return () => clearInterval(interval)
    }, [])

    const handleMarkAsRead = async (id: string) => {
        await markAsRead(id)
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'READ' } : n))
    }

    const handleMarkAllRead = async () => {
        await markAllAsRead()
        setNotifications(prev => prev.map(n => ({ ...n, status: 'READ' })))
    }

    return (
        <div className="relative">
            <div 
                className="top-btn" 
                title="Notifications" 
                onClick={() => setIsOpen(!isOpen)}
                style={{ cursor: 'pointer', position: 'relative' }}
            >
                {unreadCount > 0 && <div className="notif-dot"></div>}
                <Bell size={18} />
            </div>

            {isOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-[60]" 
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-[320px] bg-white border border-slate-200 rounded-xl shadow-2xl z-[70] overflow-hidden animate-in fade-in slide-in-from-top-2">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <Bell size={14} className="text-orange-500" />
                                Notifications
                            </h3>
                            {unreadCount > 0 && (
                                <button 
                                    onClick={handleMarkAllRead}
                                    className="text-[10px] font-bold text-sky-600 hover:text-sky-700 uppercase tracking-wider"
                                >
                                    Tout lire
                                </button>
                            )}
                        </div>

                        <div className="max-h-[380px] overflow-y-auto">
                            {loading && notifications.length === 0 && (
                                <div className="p-8 text-center text-slate-400 text-xs">
                                    Chargement...
                                </div>
                            )}

                            {!loading && notifications.length === 0 && (
                                <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                                    <Clock size={24} className="opacity-20" />
                                    Aucune notification récente
                                </div>
                            )}

                            {notifications.map((notif) => (
                                <div 
                                    key={notif.id} 
                                    className={`p-4 border-b border-slate-50 last:border-0 transition-colors ${!notif.read ? 'bg-orange-50/30' : 'hover:bg-slate-50'}`}
                                >
                                    <div className="flex gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${!notif.read ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'}`}>
                                            <ShieldAlert size={16} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className={`text-[12px] font-bold truncate ${!notif.read ? 'text-slate-900' : 'text-slate-600'}`}>
                                                    {notif.title}
                                                </h4>
                                                <span className="text-[9px] text-slate-400 whitespace-nowrap">
                                                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 leading-normal line-clamp-2">
                                                {notif.content}
                                            </p>
                                            {!notif.read && (
                                                <button 
                                                    onClick={() => handleMarkAsRead(notif.id)}
                                                    className="mt-2 text-[10px] font-bold text-orange-600 flex items-center gap-1 hover:underline"
                                                >
                                                    <Check size={10} />
                                                    Marquer comme lu
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-3 bg-slate-50 border-top border-slate-100 text-center">
                            <button className="text-[11px] font-bold text-slate-600 hover:text-slate-900 transition-colors">
                                Voir tout l'historique
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
