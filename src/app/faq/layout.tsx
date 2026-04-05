import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Foire Aux Questions (FAQ)",
  description: "Réponses aux questions fréquentes sur le Portail National de Normalisation du Marché Locatif, la certification QR Code et l'indice de confiance QAPRIL.",
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
