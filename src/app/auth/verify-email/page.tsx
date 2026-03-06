import Link from 'next/link';
import { Suspense } from 'react';

function VerifyEmailContent({ searchParams }: { searchParams: { callback_url?: string } }) {
    if (!searchParams.callback_url) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
                <h1 className="text-2xl font-bold mb-4">Lien invalide</h1>
                <p className="text-gray-600 mb-6">Le lien de connexion fourni est incomplet ou invalide.</p>
                <Link href="/login" className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition">
                    Retour à la connexion
                </Link>
            </div>
        );
    }

    const authUrl = decodeURIComponent(searchParams.callback_url);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
            <h1 className="text-2xl font-bold mb-4">Connexion Sécurisée</h1>
            <p className="text-gray-600 mb-6 max-w-md">
                Vous avez demandé à vous connecter via un lien magique (Magic Link). Cliquez sur le bouton ci-dessous pour finaliser votre connexion de manière sécurisée.
            </p>
            <a href={authUrl} className="px-6 py-3 bg-blue-600 font-semibold text-white rounded shadow hover:bg-blue-700 transition">
                Se connecter maintenant
            </a>
        </div>
    );
}

export default function VerifyEmailPage({ searchParams }: { searchParams: { callback_url?: string } }) {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Chargement...</div>}>
            <VerifyEmailContent searchParams={searchParams} />
        </Suspense>
    );
}
