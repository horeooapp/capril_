import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Expertise Certifiée | QAPRIL",
  description: "Découvrez nos domaines d'expertise : de l'audit QR Part 21 à la sécurisation des cautions via la CDC-CI.",
};

export default function ExpertiseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
