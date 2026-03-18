import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impact & Transformation | QAPRIL",
  description: "Comment QAPRIL redéfinit l'économie locative ivoirienne par la transparence et la sécurité institutionnelle.",
};

export default function ImpactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
