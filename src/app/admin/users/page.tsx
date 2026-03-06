import { getAllUsers } from "@/actions/admin-actions"
import Link from "next/link"

export default async function AdminUsersPage() {
    const users = await getAllUsers()

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 border-l-4 border-gray-900 pl-4">Gestion des Utilisateurs</h1>
                <div className="text-sm text-gray-500 bg-white border px-3 py-1 rounded shadow-sm">
                    {users.length} Utilisateurs inscrits
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Utilisateur
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Rôle
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Statut
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Inscription
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold">
                                            {user.name?.charAt(0) || user.email?.charAt(0)}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{user.name || "N/A"}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 
                                          user.role === 'LANDLORD' ? 'bg-blue-100 text-blue-800' : 
                                          user.role === 'TENANT' ? 'bg-green-100 text-green-800' : 
                                          'bg-gray-100 text-gray-800'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {user.isCertified ? (
                                        <span className="text-green-600 flex items-center">
                                            <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                            Certifié
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 font-italic">Non certifié</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {user.createdAt.toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex space-x-3 justify-end">
                                        <button className="text-indigo-600 hover:text-indigo-900">Modifier</button>
                                        <button className="text-red-600 hover:text-red-900">Supprimer</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
