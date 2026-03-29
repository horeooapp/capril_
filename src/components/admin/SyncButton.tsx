"use client"

import { ShieldAlert } from "lucide-react"

export default function SyncButton() {
  return (
    <button 
      onClick={() => window.location.reload()}
      className="px-6 py-3 bg-red-600 text-white font-black rounded-xl text-xs uppercase hover:bg-red-700 transition-colors shadow-lg active:scale-95"
    >
      Démarrer Sync
    </button>
  )
}
