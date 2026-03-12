import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google"; // Removed due to DNS issue during production builds
import "./globals.css";

export const metadata: Metadata = {
  title: "QAPRIL - Registre Locatif Numérique",
  description: "La plateforme nationale officielle pour la gestion de vos quittances de loyer en Côte d'Ivoire.",
  icons: {
    icon: "/favicon.png",
    apple: "/icon-192.png",
  },
  manifest: "/manifest.webmanifest",
  themeColor: "#FF6B00",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "QAPRIL",
  },
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
