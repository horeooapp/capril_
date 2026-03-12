/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import AuthForm from "@/components/auth/AuthForm"

export default function LandlordLoginPage() {
    return (
        <div className="min-h-screen bg-white flex">
            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <Link href="/" className="flex items-center space-x-4 mb-4 cursor-pointer">
                        <img src="/logo.png" alt="QAPRIL Logo" className="h-12 w-auto" />
                        <span className="font-extrabold text-2xl tracking-tight text-gray-900">QAPRIL</span>
                    </Link>

                    <div className="mb-8">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            Espace Propriétaire
                        </span>
                    </div>

                    <AuthForm 
                        role="LANDLORD"
                        redirectPath="/dashboard"
                        title="Gestion Bailleur"
                        subtitle="Gérez votre patrimoine, générez des quittances et suivez vos paiements."
                    />
                </div>
            </div>

            <div className="hidden lg:block relative w-0 flex-1">
                <img
                    className="absolute inset-0 h-full w-full object-cover"
                    src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
                    alt="Façade bâtiment moderne"
                />
                <div className="absolute inset-0 bg-primary/20 mix-blend-multiply"></div>
            </div>
        </div>
    )
}
