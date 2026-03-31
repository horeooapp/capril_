export default function HelpAuthPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h1 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Aide & Assistance</h1>
                <p className="text-gray-500 mb-8 text-sm leading-relaxed">
                    Notre centre d'aide est en cours de structuration. Si vous rencontrez un problème de connexion, veuillez contacter le support Qapril.
                </p>
                <a href="mailto:support@qapril.ci" className="w-full block py-4 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:bg-gray-800 transition-all">
                    Contacter le support
                </a>
                <a href="/" className="w-full block py-4 text-gray-400 font-bold hover:text-gray-900 transition-all mt-4 text-sm">
                    Retour à l'accueil
                </a>
            </div>
        </div>
    )
}
