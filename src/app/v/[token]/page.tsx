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
        if ((result as any).receiptId) {
            redirect(`/receipts/${(result as any).receiptId}`);
        }

        const { prisma } = await import("@/lib/prisma");
        const receipt = await prisma.receipt.findFirst({
            where: {
                OR: [
                    { qrToken: token },
                    { receiptHash: token },
                    { receiptRef: token },
                    { paymentRef: token },
                    { id: token }
                ]
            },
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
