import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "À Propos | QAPRIL",
  description: "L'institution de confiance pour l'immobilier en Côte d'Ivoire. Notre vision, notre mission et nos engagements.",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
