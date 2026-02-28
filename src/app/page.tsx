import Link from "next/link";
import Footer from "@/components/Footer";
import HeroSlider from "@/components/HeroSlider";
import ContentAccordion from "@/components/ContentAccordion";

export default function Home() {
  return (
    <div className="bg-background min-h-screen text-foreground font-sans">
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 lg:justify-between space-x-4">
            <div className="flex justify-start">
              <Link href="/">
                <span className="sr-only">QAPRIL</span>
                {/* Logo with Ivorian Colors Concept */}
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-3 h-8 bg-primary rounded-sm" />
                    <div className="w-3 h-8 bg-gray-200 rounded-sm" />
                    <div className="w-3 h-8 bg-secondary rounded-sm" />
                  </div>
                  <span className="font-extrabold text-2xl tracking-tight text-gray-900">QAPRIL</span>
                </div>
              </Link>
            </div>

            <nav className="hidden xl:flex space-x-6">
              <Link href="/#a-propos" className="text-sm font-medium text-gray-500 hover:text-gray-900">À propos</Link>
              <Link href="/#qui-sommes-nous" className="text-sm font-medium text-gray-500 hover:text-gray-900">Qui sommes-nous ?</Link>
              <Link href="/#faq" className="text-sm font-medium text-gray-500 hover:text-gray-900">FAQ</Link>
              <Link href="/#contact" className="text-sm font-medium text-gray-500 hover:text-gray-900">Contact</Link>
            </nav>

            <div className="hidden lg:flex items-center justify-end space-x-4">
              <Link href="/login" className="whitespace-nowrap text-base font-medium text-gray-500 hover:text-gray-900">
                Se connecter
              </Link>
              <Link
                href="/login"
                className="whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-secondary hover:bg-green-700"
              >
                Accès Locataire
              </Link>
              <Link
                href="/login"
                className="whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary hover:bg-orange-600"
              >
                Espace Propriétaire
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <div className="relative bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32 pt-10 sm:pt-16 lg:pt-20">
              <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                <div className="sm:text-center lg:text-left">
                  <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                    <span className="block xl:inline">Le registre locatif</span>{' '}
                    <span className="block text-primary">numérique national</span>
                  </h1>
                  <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                    QAPRIL normalise et automatise la gestion locative en Côte d'Ivoire. Générez des quittances électroniques sécurisées par QR Code pour tous vos locataires en quelques clics.
                  </p>
                  <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                    <div className="rounded-md shadow">
                      <Link
                        href="/login"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-orange-600 md:py-4 md:text-lg md:px-10"
                      >
                        Créer mon compte
                      </Link>
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-3">
                      <Link
                        href="#comment-ca-marche"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-orange-100 hover:bg-orange-200 md:py-4 md:text-lg md:px-10"
                      >
                        Comment ça marche ?
                      </Link>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </div>
          <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 bg-gray-50 flex items-center justify-center">
            {/* Contextual Hero Slider */}
            <div className="h-56 w-full sm:h-72 md:h-96 lg:w-full lg:h-full relative">
              <HeroSlider />
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="comment-ca-marche" className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-secondary font-semibold tracking-wide uppercase">Fonctionnalités</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Une solution complète pour la gestion locative
              </p>
            </div>

            <div className="mt-10">
              <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">

                <div className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white font-bold text-xl">
                      1
                    </div>
                    <div className="ml-16 text-lg leading-6 font-medium text-gray-900">Gestion des logements & contrats</div>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    Ajoutez vos propriétés et créez les baux locatifs facilement avec un suivi centralisé pour chaque locataire.
                  </dd>
                </div>

                <div className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-secondary text-white font-bold text-xl">
                      2
                    </div>
                    <div className="ml-16 text-lg leading-6 font-medium text-gray-900">Quittances automatisées (E-quittance)</div>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    Générez des quittances d'un clic. Elles sont automatiquement envoyées par Mail/SMS à vos locataires avec toutes les mentions légales.
                  </dd>
                </div>

                <div className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white font-bold text-xl">
                      3
                    </div>
                    <div className="ml-16 text-lg leading-6 font-medium text-gray-900">Vérification par QR Code (Audit)</div>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    Chaque quittance générée possède un QR Code unique pour lutter contre la fraude et garantir l'authenticité du document.
                  </dd>
                </div>

                <div className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-secondary text-white font-bold text-xl">
                      4
                    </div>
                    <div className="ml-16 text-lg leading-6 font-medium text-gray-900">Espace Locataire dédié</div>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    Les locataires peuvent se connecter en toute sécurité avec leur e-mail pour télécharger l'historique complet de leurs quittances.
                  </dd>
                </div>

              </dl>
            </div>
          </div>
        </div>

        {/* Dynamic Accordion Section */}
        <div className="bg-white py-16">
          <ContentAccordion />
        </div>

      </main>

      <Footer />
    </div>
  );
}
