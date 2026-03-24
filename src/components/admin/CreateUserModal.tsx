"use client"

import { useState } from "react"
import { createUserByAdmin } from "@/actions/admin-actions"
import { useRouter } from "next/navigation"
import { Role } from "@prisma/client"

export default function CreateUserModal() {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        phone: "",
        email: "",
        fullName: "",
        role: "TENANT" as Role,
        password: ""
    })
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        const result = await createUserByAdmin(formData)
        if (result.success) {
            setIsOpen(false)
            setFormData({ phone: "", email: "", fullName: "", role: "TENANT", password: "" })
            router.refresh()
        } else {
            alert(result.error)
        }
        setIsLoading(false)
    }

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm flex items-center"
            >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nouvel Utilisateur
            </button>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-900">Créer un nouvel utilisateur</h3>
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom Complet</label>
                        <input 
                            required
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-gray-900 outline-none"
                            placeholder="Ex: Jean Dupont"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone (Unique)</label>
                        <input 
                            required
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-gray-900 outline-none"
                            placeholder="Ex: 0000000000"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input 
                            required
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-gray-900 outline-none"
                            placeholder="ex@qapril.ci"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rôle initial</label>
                        <select 
                            value={formData.role}
                            onChange={(e) => setFormData({...formData, role: e.target.value as Role})}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-gray-900 outline-none"
                        >
                            <option value="TENANT">Locataire</option>
                            <option value="LANDLORD">Bailleur</option>
                            <option value="AGENCY">Agence</option>
                            <option value="ADMIN">Administrateur</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe (Optionnel)</label>
                        <input 
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-gray-900 outline-none"
                            placeholder="Laissez vide pour configurer plus tard"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">Obligatoire pour une connexion immédiate de l'admin.</p>
                    </div>


                    <div className="pt-4 flex space-x-3">
                        <button 
                            type="button" 
                            onClick={() => setIsOpen(false)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Annuler
                        </button>
                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
                        >
                            {isLoading ? 'Création...' : 'Créer utilisateur'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
