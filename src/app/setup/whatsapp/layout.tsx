import { Suspense } from "react";

export const metadata = {
  title: "Configuration WhatsApp — QAPRIL",
  robots: "noindex, nofollow", // Page interne, ne pas indexer
};

export default function SetupWhatsAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div style={{ background: "#0f172a", minHeight: "100vh" }} />}>
      {children}
    </Suspense>
  );
}
