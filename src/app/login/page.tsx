import { signIn } from "@/auth"

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-white flex">
            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-sm lg:w-96">

                    <div className="flex items-center space-x-2 mb-8 cursor-pointer" onClick={() => window.location.href = '/'}>
                        <div className="flex space-x-1 h-8">
                            <div className="w-3 bg-[#FF8200] rounded-sm" />
                            <div className="w-3 bg-gray-100 rounded-sm border border-gray-200" />
                            <div className="w-3 bg-[#009E60] rounded-sm" />
                        </div>
                        <span className="font-extrabold text-2xl tracking-tight text-gray-900">QAPRIL</span>
                    </div>

                    <div>
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                            Connexion
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            La plateforme nationale du registre locatif Ivoirien
                        </p>
                    </div>

                    <div className="mt-8">
                        <div className="bg-white py-8 shadow-sm sm:rounded-lg">
                            <form
                                className="space-y-6"
                                action={async (formData) => {
                                    "use server"
                                    await signIn("nodemailer", formData)
                                }}
                            >
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Adresse e-mail
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                            placeholder="nom@exemple.ci"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                                    >
                                        Recevoir le lien de connexion
                                    </button>
                                </div>

                                <div className="mt-4 text-center">
                                    <span className="text-xs text-gray-500">
                                        Un code de connexion sécurisé vous sera envoyé par e-mail.
                                    </span>
                                </div>
                            </form>
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
