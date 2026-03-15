import { auth } from "@/auth"
import { getUserTrustData } from "@/actions/users"
import TrustProfileClient from "./TrustProfileClient"

export default async function TrustProfile() {
    try {
        const session = await auth()
        const data = await getUserTrustData()

        if (!data) {
            return (
                <div className="max-w-4xl mx-auto py-20 px-4 text-center glass-panel rounded-[3rem]">
                    <h1 className="text-2xl font-black text-gray-900 uppercase">Profil non détecté</h1>
                    <p className="mt-4 text-gray-500 font-medium">
                        Initialisation de vos données de confiance en cours...
                    </p>
                    <div className="mt-8 label-tech opacity-30">
                        REF: {session?.user?.id || "ANONYMOUS"}
                    </div>
                </div>
            )
        }

        return <TrustProfileClient data={data as any} />
    } catch (error: any) {
        return (
            <div className="max-w-4xl mx-auto py-10 px-4 glass-panel rounded-[3rem] border-rose-100">
                <h1 className="text-xl font-black text-rose-600 uppercase">Erreur de Flux</h1>
                <p className="mt-2 text-rose-800/60 font-medium">{error?.message}</p>
            </div>
        )
    }
}
