import TarifsClient from "./TarifsClient"

export const metadata = {
    title: "Configuration Tarifaire | QAPRIL Admin"
}

export default async function TarifsPage() {
    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-[#1F4E79] uppercase tracking-tighter italic">
                    Configuration Tarifaire
                </h1>
                <p className="text-sm font-semibold text-gray-400 mt-1">
                    Gérez la grille tarifaire globale, les offres agences et les dérogations.
                </p>
            </div>
            
            <TarifsClient />
        </div>
    )
}
