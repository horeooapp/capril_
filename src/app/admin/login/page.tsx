/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import AdminLoginForm from "@/components/auth/AdminLoginForm"

export default function AdminLoginPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link href="/" className="flex items-center justify-center space-x-4 mb-6 cursor-pointer">
                    <img src="/logo.png" alt="QAPRIL Logo" className="h-12 w-auto" />
                    <span className="font-extrabold text-2xl tracking-tight text-gray-900">QAPRIL</span>
                </Link>
                <h2 className="text-center text-3xl font-extrabold text-gray-900 uppercase tracking-tight">
                    Console Admin
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Connectez-vous pour superviser le registre locatif national.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
                    <AdminLoginForm />
                </div>
            </div>

            <div className="mt-8 text-center">
                <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900">
                    ← Retour au site public
                </Link>
            </div>
        </div>
    )
}
