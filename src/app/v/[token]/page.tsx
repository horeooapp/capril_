import { verifyQRToken } from "@/actions/verify";
import { notFound, redirect } from "next/navigation";

export default async function ShortTokenPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    
    const result = await verifyQRToken(token);
    
    if (!result || !result.valid) {
        notFound();
    }

    // Pour toute quittance vérifiée publiquement (QR Code),
    // rediriger vers le portail officiel de vérification d'authenticité (Ticket D-04)
    if (result.type === "RECEIPT") {
        redirect(`/verifier?ref=${encodeURIComponent(token)}`);
    }

    // Si c'est un certificat fiscal
    if (result.type === "CERTIFICATE") {
        redirect(`/verify/${token}`);
    }

    notFound();
}
