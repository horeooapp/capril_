import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google"; // Removed due to DNS issue during production builds
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.qapril.ci"),
  title: {
    default: "QAPRIL - Registre Locatif Numérique National",
    template: "%s | QAPRIL"
  },
  description: "La plateforme nationale officielle pour la gestion et la certification des quittances de loyer en Côte d'Ivoire. Sécurisation des baux immobiliers et des cautions avec la CDC-CI.",
  keywords: ["registre locatif", "immobilier Côte d'Ivoire", "quittance de loyer numérique", "location Abidjan", "gestion immobilière", "CDC-CI", "QAPRIL", "bail certifié"],
  authors: [{ name: "QAPRIL Infrastructure" }],
  creator: "QAPRIL",
  publisher: "QAPRIL",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "fr_CI",
    url: "https://www.qapril.ci",
    siteName: "QAPRIL",
    title: "QAPRIL - Registre Locatif Numérique National",
    description: "Normalisation et sécurisation du marché locatif en Côte d'Ivoire. Certifiez vos baux et quittances.",
    images: [
      {
        url: "/images/og-main.png",
        width: 1200,
        height: 630,
        alt: "QAPRIL - Infrastructure Nationale",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "QAPRIL - Registre Locatif Numérique",
    description: "Sécurisation intégrale des transactions locatives en Côte d'Ivoire.",
    images: ["/images/og-main.png"],
    creator: "@qapril_ci",
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "QAPRIL",
  },
};

export const viewport = {
  themeColor: "#FCB10F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased font-sans flex flex-col min-h-screen">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "QAPRIL",
              "url": "https://www.qapril.ci",
              "logo": "https://www.qapril.ci/logo.png",
              "sameAs": [
                "https://twitter.com/qapril_ci",
                "https://www.linkedin.com/company/qapril"
              ],
              "description": "Portail National de Normalisation du Marché Locatif en Côte d'Ivoire."
            })
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                  }, function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
