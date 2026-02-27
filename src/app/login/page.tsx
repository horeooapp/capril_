import { signIn } from "@/auth"

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center space-x-2">
                    {/* Ivorian Colors Logo Representation */}
                    <div className="w-8 h-8 rounded-full bg-primary" />
                    <div className="w-8 h-8 rounded-full bg-primary-foreground border" />
                    <div className="w-8 h-8 rounded-full bg-secondary" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
                    Connexion à QAPRIL
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    La plateforme nationale du registre locatif
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
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
                            <span className="text-xs text-secondary-foreground text-gray-500">
                                Un code de connexion unique (OTP) vous sera envoyé par e-mail.
                            </span>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
