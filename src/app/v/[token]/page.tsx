import { verifyQRToken } from "@/actions/verify";
import { notFound, redirect } from "next/navigation";

export default async function ShortTokenPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    
    const result = await verifyQRToken(token);
    
    if (!result || !result.valid) {
        notFound();
    }

    // Si c'est une quittance, on redirige vers la page détaillée des quittances
    // Note: On pourrait aussi afficher une version simplifiée ici, 
    // mais rediriger vers /receipts/[id] est plus cohérent si on a l'ID.
    
    if (result.type === "RECEIPT") {
        // Le verifyQRToken retourne la référence, mais pour la redirection on a besoin du UUID.
        // On va donc chercher l'ID via le token.
        const { prisma } = await import("@/lib/prisma");
        const receipt = await prisma.receipt.findFirst({
            where: { OR: [{ qrToken: token }, { receiptHash: token }] },
            select: { id: true }
        });
        
        if (receipt) {
            redirect(`/receipts/${receipt.id}`);
        }
    }

    // Si c'est un certificat fiscal
    if (result.type === "CERTIFICATE") {
        redirect(`/verify/${token}`);
    }

    notFound();
}
