import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-gray-900 border-t border-gray-800 print:hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8">

                    {/* Brand and Info */}
                    <div className="md:col-span-1 space-y-4">
                        <div className="flex items-center space-x-4">
                            <img src="/logo.png" alt="QAPRIL Logo" className="h-16 w-auto border border-gray-700 rounded shadow-sm opacity-90" />
                            <span className="font-extrabold text-2xl tracking-tight text-white">QAPRIL</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            La plateforme nationale de gestion des loyers et d'émission de quittances certifiées en République de Côte d'Ivoire.
                        </p>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Plateforme</h3>
                        <ul className="space-y-2">
                            <li><Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">Espace Propriétaire</Link></li>
                            <li><Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">Espace Locataire</Link></li>
                            <li><Link href="/admin" className="text-sm text-gray-400 hover:text-white transition-colors">Observatoire National</Link></li>
                            <li><Link href="/#comment-ca-marche" className="text-sm text-gray-400 hover:text-white transition-colors">Comment ça marche ?</Link></li>
                        </ul>
                    </div>

                    {/* Liens Utiles */}
                    <div>
                        <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">À découvrir</h3>
                        <ul className="space-y-2">
                            <li><Link href="/#a-propos" className="text-sm text-gray-400 hover:text-white transition-colors">À propos</Link></li>
                            <li><Link href="/#qui-sommes-nous" className="text-sm text-gray-400 hover:text-white transition-colors">Qui sommes-nous ?</Link></li>
                            <li><Link href="/#faq" className="text-sm text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
                            <li><Link href="/#contact" className="text-sm text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Légal</h3>
                        <ul className="space-y-2">
                            <li><Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Conditions Générales (CGU)</Link></li>
                            <li><Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Politique de Confidentialité</Link></li>
                            <li><Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Mentions Légales</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Contact & Support</h3>
                        <ul className="space-y-2">
                            <li className="text-sm text-gray-400 flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                support@qapril.ci
                            </li>
                            <li className="text-sm text-gray-400 flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                Assistance USSD
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-sm text-gray-400 mb-4 md:mb-0">
                        &copy; {new Date().getFullYear()} QAPRIL - Registre Locatif. Tous droits réservés.
                    </p>
                    <div className="flex space-x-6">
                        <span className="text-xs text-gray-500">Un service sécurisé pour la République de Côte d'Ivoire</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
