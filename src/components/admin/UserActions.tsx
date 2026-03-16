"use client"

import { useState } from "react"
import { toggleAdminRole, deleteUser } from "@/actions/admin-actions"
import { useRouter } from "next/navigation"
import ChangePasswordModal from "./ChangePasswordModal"

interface UserActionsProps {
    userId: string
    userName: string
    currentRole: string
    isSuperAdmin: boolean
    currentUserId: string
}

export default function UserActions({ userId, userName, currentRole, isSuperAdmin, currentUserId }: UserActionsProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const router = useRouter()

    const isSelf = userId === currentUserId
    const canChangePassword = isSuperAdmin || isSelf

    const handleToggleAdmin = async () => {
        if (!confirm("Êtes-vous sûr de vouloir changer les droits de cet utilisateur ?")) return
        setIsLoading(true)
        const result = await toggleAdminRole(userId)
        if (result.success) {
            router.refresh()
        } else {
            alert(result.error)
        }
        setIsLoading(false)
    }

    const handleDelete = async () => {
        if (!confirm("ATTENTION: Cette action est irréversible. Supprimer cet utilisateur ?")) return
        setIsLoading(true)
        const result = await deleteUser(userId)
        if (result.success) {
            router.refresh()
        } else {
            alert(result.error)
        }
        setIsLoading(false)
    }

    return (
        <div className="flex space-x-3 justify-end items-center">
            {canChangePassword && (currentRole === 'ADMIN' || currentRole === 'SUPER_ADMIN' || isSuperAdmin) && (
                <button
                    onClick={() => setShowPasswordModal(true)}
                    className="text-gray-600 hover:text-gray-900 text-sm font-medium px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                    Modifier Pass
                </button>
            )}
            {isSuperAdmin && !isSelf && (
                <button 
                    onClick={handleToggleAdmin}
                    disabled={isLoading}
                    className={`text-sm font-medium px-2 py-1 rounded transition-colors ${
                        currentRole === 'ADMIN' 
                        ? 'text-orange-600 hover:bg-orange-50 border border-orange-200' 
                        : 'text-indigo-600 hover:bg-indigo-50 border border-indigo-200'
                    }`}
                >
                    {currentRole === 'ADMIN' ? 'Retirer Admin' : 'Rendre Admin'}
                </button>
            )}
            {!isSelf && (
                <button 
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="text-red-600 hover:text-red-900 text-sm font-medium"
                >
                    Supprimer
                </button>
            )}

            {showPasswordModal && (
                <ChangePasswordModal 
                    userId={userId}
                    userName={userName}
                    onClose={() => setShowPasswordModal(false)}
                />
            )}
        </div>
    )
}
