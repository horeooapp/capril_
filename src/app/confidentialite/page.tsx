import Link from "next/link";

export default function PrivacyPolicyPage() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-4">Politique de Confidentialité</h1>

            <div className="prose prose-orange max-w-none text-gray-700 space-y-6">
                <section>
                    <h2 className="text-xl font-bold text-gray-800">1. Collecte des Données</h2>
                    <p>
                        QAPRIL collecte des données personnelles nécessaires à la gestion des baux et à la sécurisation des transactions immobilières. Ces données incluent notamment :
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Nom, prénoms, adresse email et numéro de téléphone.</li>
                            <li>Pièces d&apos;identité et documents justificatifs.</li>
                            <li>Coordonnées bancaires pour le séquestre ou la consignation.</li>
                            <li>Empreintes cryptographiques (hashes) des documents pour la preuve renforcée.</li>
                        </ul>
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-800">2. Utilisation des Données</h2>
                    <p>
                        Les données sont utilisées pour :
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>La création et l&apos;authentification de votre compte.</li>
                            <li>La génération automatique de quittances et de certificats de location.</li>
                            <li>Le calcul de l&apos;indice de fiabilité locative.</li>
                            <li>L&apos;élaboration de statistiques anonymisées pour l&apos;Observatoire National.</li>
                        </ul>
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-800">3. Conservation des Données</h2>
                    <p>
                        Les données relatives aux baux sont conservées pendant toute la durée du contrat de location, augmentée des délais de prescription légale applicables en République de Côte d&apos;Ivoire.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-800">4. Destinataires des Données</h2>
                    <p>
                        Les données sont destinées exclusivement aux parties concernées (bailleur, locataire, agence mandataire) et, dans les limites prévues par la loi, aux autorités administratives ou judiciaires compétentes (ex: Caisse de Dépôt et de Consignations).
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-800">5. Vos Droits</h2>
                    <p>
                        Conformément à la loi sur la protection des données à caractère personnel, vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression et d&apos;opposition. Pour exercer ces droits, vous pouvez contacter notre support à l&apos;adresse : protection@qapril.net.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-800">6. Sécurité</h2>
                    <p>
                        Nous utilisons des protocoles de chiffrement avancés et des mécanismes de preuve renforcée (hashing SHA-256) pour garantir l'intégrité et la confidentialité de vos informations.
                    </p>
                </section>

                <div className="mt-12 text-sm text-gray-500 italic border-t pt-4">
                    Dernière mise à jour : 01 Mars 2026
                </div>
            </div>

            <div className="mt-8">
                <Link href="/" className="text-primary hover:underline font-medium">← Retour à l&apos;accueil</Link>
            </div>
        </div>
    );
}
