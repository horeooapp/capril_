import Link from "next/link";

export default function CGUPage() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-4">Conditions Générales d'Utilisation (CGU)</h1>

            <div className="prose prose-orange max-w-none text-gray-700 space-y-6">
                <section>
                    <h2 className="text-xl font-bold text-gray-800">1. Objet de la Plateforme</h2>
                    <p>
                        QAPRIL (Qualité de l'Administration du Patrimoine et du Registre Immobilier Locatif) est une plateforme numérique dédiée à la sécurisation des baux, à la dématérialisation des quittances de loyer et à la transparence du marché locatif en République de Côte d'Ivoire.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-800">2. Acceptation des Conditions</h2>
                    <p>
                        L'utilisation des services de QAPRIL implique l'acceptation pleine et entière des présentes CGU. L'accès aux services est réservé aux personnes physiques ou morales dument identifiées.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-800">3. Services Proposés</h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Saisie et gestion des mandats de gestion immobilière.</li>
                        <li>Création et signature électronique de baux.</li>
                        <li>Émission et archivage de quittances de loyer certifiées.</li>
                        <li>Gestion des cautions via séquestre numérique ou consignation CDC.</li>
                        <li>Audit de fiabilité locative pour bailleurs et locataires.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-800">4. Obligations de l'Utilisateur</h2>
                    <p>
                        L'utilisateur s'engage à fournir des informations exactes et à jour. Toute fraude documentaire ou fausse déclaration pourra entrainer la suspension immédiate du compte et des poursuites judiciaires.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-800">5. Propriété Intellectuelle</h2>
                    <p>
                        Tous les contenus (logos, textes, algorithmes, codes) présents sur la plateforme sont la propriété exclusive de Polynovagroupe360ci. Toute reproduction non autorisée est interdite.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-800">6. Responsabilité</h2>
                    <p>
                        QAPRIL met en œuvre tous les moyens pour assurer la disponibilité du service. Toutefois, elle ne saurait être tenue responsable des interruptions de service dues à des cas de force majeure ou à des opérations de maintenance.
                    </p>
                </section>

                <div className="mt-12 text-sm text-gray-500 italic border-t pt-4">
                    Dernière mise à jour : 01 Mars 2026
                </div>
            </div>

            <div className="mt-8">
                <Link href="/" className="text-primary hover:underline font-medium">← Retour à l'accueil</Link>
            </div>
        </div>
    );
}
