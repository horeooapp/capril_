"use client"

import { useState, useEffect } from "react"
import { getNotifications, markAsRead } from "@/actions/notifications"
import Link from "next/link"

export default function NotificationCenter() {
    const [notifications, setNotifications] = useState<any[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)

    const fetchNotifications = async () => {
        const data = await getNotifications()
        setNotifications(data)
        setUnreadCount(data.filter(n => !n.read).length)
    }

    useEffect(() => {
        fetchNotifications()
        // Poll every 30 seconds for new notifications
        const interval = setInterval(fetchNotifications, 30000)
        return () => clearInterval(interval)
    }, [])

    const handleMarkAsRead = async (id: string) => {
        await markAsRead(id)
        await fetchNotifications()
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-white hover:bg-white/10 rounded-full transition-colors"
            >
                <span className="text-xl">🔔</span>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full animate-bounce">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl z-20 overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="bg-orange-500 p-4">
                            <h3 className="text-white font-black uppercase tracking-tight">Notifications</h3>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-400 italic text-sm">
                                    Aucune notification pour le moment.
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {notifications.map((n) => (
                                        <div 
                                            key={n.id} 
                                            className={`p-4 hover:bg-gray-50 transition-colors ${!n.read ? 'bg-orange-50/30' : ''}`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <h4 className={`text-sm font-bold ${!n.read ? 'text-gray-900' : 'text-gray-600'}`}>
                                                    {n.title}
                                                </h4>
                                                {!n.read && (
                                                    <button 
                                                        onClick={() => handleMarkAsRead(n.id)}
                                                        className="text-[10px] text-orange-600 font-bold uppercase hover:underline"
                                                    >
                                                        Lu
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{n.message}</p>
                                            {n.link && (
                                                <Link 
                                                    href={n.link}
                                                    onClick={() => setIsOpen(false)}
                                                    className="inline-block mt-2 text-[10px] font-black uppercase text-orange-500 hover:text-orange-600"
                                                >
                                                    Voir les détails →
                                                </Link>
                                            )}
                                            <p className="text-[9px] text-gray-300 mt-2 font-medium">
                                                {new Date(n.createdAt).toLocaleString('fr-FR')}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
