import CommissionsClient from "./CommissionsClient"

export const metadata = {
    title: "Moteur de Commissions | QAPRIL Admin"
}

export default async function CommissionsPage() {
    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter italic">
                    Commissions (M1)
                </h1>
                <p className="text-sm font-semibold text-gray-400 mt-1">
                    Gérez la politique de prélèvement automatique sur les transactions de paiement.
                </p>
            </div>
            
            <CommissionsClient />
        </div>
    )
}
