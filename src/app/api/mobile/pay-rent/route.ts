import { prisma } from '@/lib/prisma';
import { verifyMobileToken } from '@/lib/mobile-auth';
import { NextResponse } from 'next/server';
import { feexpay } from '@/lib/feexpay';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { token, leaseId, amount, operator, action, paymentId } = body;

        // Support d'une vérification de statut (polling ou bouton retour mobile)
        if (action === 'verify' && paymentId) {
            const existingPayment = await prisma.paymentPgw.findUnique({
                where: { id: paymentId },
                include: { quittance: true }
            });
            if (!existingPayment) {
                return NextResponse.json({ error: "Paiement introuvable" }, { status: 404 });
            }
            return NextResponse.json({
                success: true,
                status: existingPayment.statut,
                isConfirmed: existingPayment.statut === "CONFIRMEE",
                receiptRef: existingPayment.quittance?.receiptRef,
            });
        }

        // Validation de sécurité avec JWT
        if (!token || !leaseId || !amount) {
            return NextResponse.json({ error: "Paramètres manquants (token, leaseId, amount requis)" }, { status: 400 });
        }

        const payload = await verifyMobileToken(token);
        if (!payload) {
            return NextResponse.json({ error: "Non autorisé. Jeton invalide ou expiré." }, { status: 401 });
        }
        
        const payeurId = payload.userId;

        // 1. Récupérer le bail et les infos nécessaires
        const lease = await prisma.lease.findUnique({
            where: { id: leaseId },
            include: { 
                property: true, 
                landlord: {
                    include: { walletConfig: true }
                },
                tenant: true
            }
        });

        if (!lease) {
            return NextResponse.json({ error: "Bail introuvable" }, { status: 404 });
        }

        // Vérification IDOR : l'utilisateur authentifié doit être le locataire du bail
        if (lease.tenantId !== payeurId) {
            console.warn(`[SECURITY] IDOR attempt: user ${payeurId} tried to pay lease ${leaseId} owned by tenant ${lease.tenantId}`);
            return NextResponse.json({ error: "Accès refusé. Vous n'êtes pas le titulaire de ce bail." }, { status: 403 });
        }

        // Validation stricte du montant contre le loyer contractuel
        const totalExpected = lease.rentAmount + (lease.chargesAmount || 0);
        if (Number(amount) < totalExpected) {
            return NextResponse.json({ 
                error: `Montant invalide. Le montant requis pour ce loyer est de ${Math.round(totalExpected).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} XOF.` 
            }, { status: 400 });
        }

        // RG-QUI-02: Vérification Wallet Bailleur
        const walletBalance = lease.landlord?.walletConfig?.walletBalance || 0;
        if (walletBalance < -1500) {
            return NextResponse.json({ 
                error: "Paiement temporairement indisponible : Le compte du bailleur nécessite une régularisation technique. Contactez le support." 
            }, { status: 403 });
        }

        const selectedCanal = operator === 'WAVE' 
            ? 'WAVE' 
            : (operator === 'MTN' 
                ? 'MTN' 
                : (operator === 'MOOV' 
                    ? 'MOOV' 
                    : (operator === 'CINETPAY_M17' ? 'CINETPAY_M17' : 'ORANGE')));

        // 2. Création de la transaction dans PaymentPgw avec statut INITIEE
        const paymentRef = `FP-${selectedCanal}-${Date.now().toString(36).toUpperCase()}`;
        const payment = await prisma.paymentPgw.create({
            data: {
                leaseId,
                moisConcerne: new Date(),
                payeurId: payeurId,
                beneficiaireId: lease.landlordId || payeurId,
                montant: Number(amount),
                canal: selectedCanal as any,
                statut: "INITIEE",
                refInterne: paymentRef,
                refOperateur: "FEEXPAY_PROD",
            }
        });

        // 3. Initialiser le paiement auprès de FeexPay (Agrégateur officiel de production)
        const tenantName = `${lease.tenant?.firstName || ""} ${lease.tenant?.lastName || ""}`.trim() || "Locataire";
        const feexResult = await feexpay.initializePayment({
            transactionId: payment.id,
            amount: Number(amount),
            description: `Loyer ${lease.property?.title || 'QAPRIL'}`,
            payerPhone: lease.tenant?.phone || "",
            customerName: tenantName,
            customerEmail: lease.tenant?.email || "locataire@qapril.ci",
            operator: operator,
            leaseId: lease.id,
            source: "mobile",
            app: "locataire",
        });

        return NextResponse.json({
            success: true,
            paymentUrl: feexResult.payment_url,
            paymentId: payment.id,
            reference: paymentRef,
            message: "Guichet FeexPay initialisé"
        });

    } catch (error: any) {
        console.error("Erreur Paiement Mobile FeexPay:", error);
        return NextResponse.json({ 
            error: "Échec de l'initialisation du paiement : " + (error.message || "Erreur serveur")
        }, { status: 500 });
    }
}
