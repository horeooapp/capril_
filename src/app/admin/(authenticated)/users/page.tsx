import { getAllUsers } from "@/actions/admin-actions"
import { auth } from "@/auth"
import UserActions from "@/components/admin/UserActions"
import CreateUserModal from "@/components/admin/CreateUserModal"
import { Role } from "@prisma/client"
import { UserCheck, ShieldAlert } from "lucide-react"

export default async function AdminUsersPage() {
    const session = await auth()
    const users = await getAllUsers()
    const isSuperAdmin = session?.user?.role === Role.SUPER_ADMIN

    return (
        <div className="space-y-12 pb-16 relative">
            <div className="fixed inset-0 bg-mesh -z-10 opacity-60"></div>

            <div className="page-header">
                <div>
                    <h1 className="page-title">Registre Utilisateurs</h1>
                    <p className="page-sub">Gérez les locataires, bailleurs, agents et statuts KYC.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="date-badge">
                        {users.length} Inscrits
                    </div>
                    {/* The modal trigger button might need its own styling to match dark mode later, but we wrap it here */}
                    <div className="inline-block p-1 rounded-xl bg-white/5 border border-white/10">
                        <CreateUserModal />
                    </div>
                </div>
            </div>

            <div className="panel">
                <div className="panel-header">
                    <h2 className="panel-title">Annuaire QAPRIL Connect</h2>
                    <div className="panel-action">Filtrer / Rechercher</div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="lease-table">
                        <thead>
                            <tr>
                                <th>Utilisateur</th>
                                <th>Rôle Opérationnel</th>
                                <th>Niveau KYC</th>
                                <th>Date Inscription</th>
                                <th><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => {
                                const initials = ((user as any).firstName?.charAt(0) || user.email?.charAt(0) || "?").toUpperCase()
                                const isSuper = user.role === Role.SUPER_ADMIN
                                const isVerified = user.kycStatus === 'verified'

                                return (
                                <tr key={user.id}>
                                    <td>
                                        <div className="tenant-cell">
                                            <div className="t-avatar" style={{ 
                                                backgroundColor: isSuper ? 'var(--ci-orange)' : 'var(--ci-nuit2)', 
                                                color: isSuper ? '#fff' : 'var(--text-muted)' 
                                            }}>
                                                {initials}
                                            </div>
                                            <div>
                                                <div className="t-name">{((user as any).firstName ? `${(user as any).firstName} ${(user as any).lastName || ''}` : "Profil Inconnu")}</div>
                                                <div className="t-loc text-[10px] text-gray-500">{user.email || user.phone}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={`pill ${isSuper ? 'pill-active' : user.role === Role.ADMIN ? 'pill-pending' : 'bg-gray-800 text-gray-400'}`}>
                                            <div className="pill-dot" style={{ backgroundColor: isSuper ? 'var(--ci-vert)' : 'var(--ci-or)' }}></div>
                                            {user.role}
                                        </div>
                                    </td>
                                    <td>
                                        {isVerified ? (
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--ci-vert)] uppercase tracking-widest bg-[rgba(0,154,61,0.1)] px-3 py-1 rounded-full w-max">
                                                <UserCheck size={12} />
                                                Vérifié
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-gray-900 border border-gray-800 px-3 py-1 rounded-full w-max">
                                                <ShieldAlert size={12} />
                                                En attente
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <div className="t-name text-gray-400 font-mono text-[10px]">
                                            {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="action-wrapper bg-white/5 p-1 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                                            <UserActions 
                                                userId={user.id} 
                                                userName={((user as any).firstName ? `${(user as any).firstName} ${(user as any).lastName || ''}` : user.email || user.phone || "")}
                                                currentRole={user.role} 
                                                isSuperAdmin={isSuperAdmin} 
                                                currentUserId={session?.user?.id || ""}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
