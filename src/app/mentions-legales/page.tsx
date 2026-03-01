import Link from "next/link";

export default function MentionsLegalesPage() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-4">Mentions Légales</h1>

            <div className="prose prose-orange max-w-none text-gray-700 space-y-8">
                <section>
                    <h2 className="text-xl font-bold text-gray-800">1. Éditeur de la Plateforme</h2>
                    <p>
                        La plateforme QAPRIL (Qualité de l'Administration du Patrimoine et du Registre Immobilier Locatif) est éditée par la société <strong>Polynovagroupe360ci</strong>.
                        <ul className="list-none mt-2 space-y-1">
                            <li><strong>Société :</strong> Polynovagroupe360ci</li>
                            <li><strong>Siège Social :</strong> Cocody, Abidjan, Côte d'Ivoire</li>
                            <li><strong>Email :</strong> contact@qapril.ci</li>
                        </ul>
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-800">2. Directeur de la Publication</h2>
                    <p>
                        Le Directeur de la publication de la plateforme est le Responsable Innovation de Polynovagroupe360ci.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-800">3. Hébergement</h2>
                    <p>
                        La plateforme QAPRIL est hébergée par :
                        <ul className="list-none mt-2 space-y-1">
                            <li><strong>Hébergeur :</strong> LWS / Hostinger (Serveurs sécurisés)</li>
                            <li><strong>Site Web :</strong> www.hostinger.fr / www.lws.fr</li>
                        </ul>
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-800">4. Propriété Intellectuelle</h2>
                    <p>
                        L'ensemble des éléments constituant la plateforme QAPRIL (textes, graphiques, logiciels, photographies, images, vidéos, sons, plans, noms, logos, marques, créations et œuvres protégeables diverses, bases de données, etc.) ainsi que la plateforme elle-même relèvent de la législation ivoirienne et internationale sur le droit d'auteur et la propriété intellectuelle.
                    </p>
                    <p>
                        Ces éléments sont la propriété exclusive de <strong>Polynovagroupe360ci</strong>.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-800">5. Crédits</h2>
                    <p>
                        Conception et développement : QAPRIL Tech Team.
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
