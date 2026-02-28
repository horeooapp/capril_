import Link from "next/link"

export default function VerifyRequestPage() {
    return (
        <div className="min-h-screen bg-white flex">
            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-sm lg:w-96 text-center">

                    <Link href="/" className="flex items-center justify-center space-x-2 mb-8 cursor-pointer">
                        <div className="flex space-x-1 h-8">
                            <div className="w-3 bg-[#FF8200] rounded-sm" />
                            <div className="w-3 bg-gray-100 rounded-sm border border-gray-200" />
                            <div className="w-3 bg-[#009E60] rounded-sm" />
                        </div>
                        <span className="font-extrabold text-2xl tracking-tight text-gray-900">QAPRIL</span>
                    </Link>

                    <div className="mt-8">
                        <div className="rounded-full bg-green-100 p-3 mx-auto w-fit mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                            </svg>
                        </div>
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                            Vérifiez votre boîte mail
                        </h2>
                        <p className="mt-4 text-base text-gray-600 leading-relaxed">
                            Un lien de connexion sécurisé (bouton magique) a été envoyé à votre adresse. Cliquez sur ce lien pour accéder instantanément à votre espace.
                        </p>

                        <div className="mt-8 bg-orange-50 p-4 rounded-md border border-orange-100 text-sm text-orange-800 text-left">
                            <p className="font-semibold mb-1">📝 Note technique :</p>
                            <p>Si vous ne recevez pas l'e-mail dans les 2 minutes, vérifiez vos courriers indésirables (Spams) ou consultez les logs du serveur (lorsque l'application est en test).</p>
                        </div>

                        <div className="mt-10">
                            <Link href="/login" className="text-sm font-medium text-primary hover:text-orange-600">
                                ← Retourner à la page de connexion
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="hidden lg:block relative w-0 flex-1">
                <img
                    className="absolute inset-0 h-full w-full object-cover"
                    src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
                    alt="Façade bâtiment moderne"
                />
                <div className="absolute inset-0 bg-gray-900 bg-opacity-30 mix-blend-multiply"></div>
            </div>
        </div>
    )
}
