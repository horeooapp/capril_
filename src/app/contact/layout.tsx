import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contactez-nous | QAPRIL",
  description: "Nos équipes sont à votre disposition pour vous accompagner dans votre transformation numérique immobilière.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
