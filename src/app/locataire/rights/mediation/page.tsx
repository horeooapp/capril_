import Link from "next/link"

export default function RightToMediation() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            <h1 className="text-3xl font-black text-[#C55A11] mb-4 uppercase tracking-tight">Médiation & Conciliation</h1>
            <p className="text-gray-600 mb-8 border-l-4 border-[#C55A11] pl-4">
                Recours amiables et procédures d'arbitrage en cas de litige avec votre propriétaire.
            </p>
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 mb-8">
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-6">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Module en cours de structuration</h2>
                    <p className="text-gray-500 text-center max-w-sm">
                        La procédure de saisine de la Chambre de Médiation sera bientôt directement accessible d'ici.
                    </p>
                </div>
            </div>
            <Link href="/locataire/rights" className="text-sm font-bold text-[#C55A11] hover:underline">
                ← Retour au Cadrage Légal
            </Link>
        </div>
    )
}
