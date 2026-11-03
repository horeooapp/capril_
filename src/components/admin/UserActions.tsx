"use client"
import { useState } from "react"
import { toggleAdminRole, deleteUser } from "@/actions/admin-actions"
import { setUserKycLevelAction } from "@/actions/kyc-config-actions"
import { useRouter } from "next/navigation"
import { Eye } from "lucide-react"
import ChangePasswordModal from "./ChangePasswordModal"
import { IdentityDocumentViewerModal, AdminIdentityDocItem } from "./IdentityDocumentViewerModal"

interface UserActionsProps {
    userId: string
    userName: string
    currentRole: string
    isSuperAdmin: boolean
    currentUserId: string
    currentKycLevel?: number
    currentKycStatus?: string
    identityDoc?: AdminIdentityDocItem | null
}

export default function UserActions({ 
    userId, 
    userName, 
    currentRole, 
    isSuperAdmin, 
    currentUserId,
    currentKycLevel = 0,
    currentKycStatus = "unverified",
    identityDoc = null
}: UserActionsProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [showIdentityModal, setShowIdentityModal] = useState(false)
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

    const handleSetKycLevel = async (level: number) => {
        setIsLoading(true);
        const res = await setUserKycLevelAction(userId, level);
        if (res.success) {
            router.refresh();
        } else {
            alert(res.error || "Erreur lors du changement de niveau KYC");
        }
        setIsLoading(false);
    };

    return (
        <div className="flex flex-wrap gap-2 justify-end items-center">
            {/* Bouton Voir la pièce d'identité envoyée */}
            {identityDoc && (
                <button
                    type="button"
                    onClick={() => setShowIdentityModal(true)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border transition-colors ${
                        identityDoc.scanS3Key
                            ? "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                    }`}
                    title="Visualiser la pièce d'identité envoyée avant validation"
                >
                    <Eye size={13} />
                    <span>{identityDoc.scanS3Key ? "Voir la pièce" : "Pièce (sans scan)"}</span>
                </button>
            )}

            {/* Quick KYC Level Switcher */}
            <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 px-2 py-1 rounded-md border border-black/10 dark:border-white/10">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">KYC:</span>
                <select
                    value={currentKycLevel}
                    disabled={isLoading}
                    onChange={(e) => handleSetKycLevel(Number(e.target.value))}
                    className="text-xs font-bold bg-transparent text-slate-800 dark:text-gray-200 border-none rounded cursor-pointer focus:outline-none"
                    title="Changer manuellement le niveau KYC de cet utilisateur"
                >
                    <option value={0} className="text-gray-900">L0 (Non vérifié)</option>
                    <option value={1} className="text-gray-900">L1 (Déclaré)</option>
                    <option value={2} className="text-gray-900">L2 (Complet)</option>
                    <option value={3} className="text-gray-900">L3 (Vérifié ANAH)</option>
                    <option value={4} className="text-gray-900">L4 (Certifié PRO)</option>
                </select>
            </div>

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

            {showIdentityModal && identityDoc && (
                <IdentityDocumentViewerModal
                    doc={identityDoc}
                    onClose={() => setShowIdentityModal(false)}
                />
            )}
        </div>
    )
}
