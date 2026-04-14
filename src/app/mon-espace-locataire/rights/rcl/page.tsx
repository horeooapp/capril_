import Link from "next/link"

export default function RightToRcl() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            <h1 className="text-3xl font-black text-slate-800 mb-4 uppercase tracking-tight">RCL (Révision de Consistance de Loyer)</h1>
            <p className="text-gray-600 mb-8 border-l-4 border-slate-800 pl-4">
                Découvrez vos droits concernant la révision de votre loyer conformément à la loi M07.
            </p>
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 mb-8">
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Module en cours de structuration</h2>
                    <p className="text-gray-500 text-center max-w-sm">
                        La documentation légale complète sur les procédures de RCL sera bientôt disponible dans cette section.
                    </p>
                </div>
            </div>
            <Link href="/mon-espace-locataire/rights" className="text-sm font-bold text-slate-800 hover:underline">
                ← Retour au Cadrage Légal
            </Link>
        </div>
    )
}
