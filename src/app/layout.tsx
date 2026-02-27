import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google"; // Removed due to DNS issue during production builds
import "./globals.css";

export const metadata: Metadata = {
  title: "QAPRIL - Registre Locatif Numérique",
  description: "La plateforme nationale officielle pour la gestion de vos quittances de loyer en Côte d'Ivoire.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans flex flex-col min-h-screen">
        {children}
      </body>
    </html>
  );
}
