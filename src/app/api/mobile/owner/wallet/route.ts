import { prisma } from '@/lib/prisma';
import { verifyMobileToken } from '@/lib/mobile-auth';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { token, action, amount, withdrawalMethod, accountDetails } = body;

        if (!token) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const payload = await verifyMobileToken(token);
        if (!payload) {
            return NextResponse.json({ error: "Non autorisé. Jeton invalide ou expiré." }, { status: 401 });
        }

        const userId = payload.userId;

        const wallet = await prisma.userWalletConfig.findUnique({
            where: { userId }
        });

        if (action === 'GET_BALANCE') {
            const history = await prisma.walletTransaction.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 20
            });

            return NextResponse.json({ 
                success: true, 
                balance: wallet?.walletBalance || 0,
                history
            });
        }

        if (action === 'WITHDRAW') {
            if (!wallet || wallet.walletBalance < amount) {
                return NextResponse.json({ error: "Solde insuffisant pour ce retrait." }, { status: 400 });
            }

            // Création de la transaction de retrait (ReversalTransaction dans l'écosystème web)
            const result = await prisma.$transaction(async (tx) => {
                // Débiter le compte
                const updatedWallet = await tx.userWalletConfig.update({
                    where: { userId },
                    data: { walletBalance: { decrement: amount } }
                });

                // Tracer dans WalletTransaction
                await tx.walletTransaction.create({
                    data: {
                        userId,
                        amount: -amount, // Négatif car débit
                        type: 'WITHDRAWAL',
                        status: 'PENDING'
                    }
                });

                return updatedWallet;
            });

            return NextResponse.json({ success: true, balance: result.walletBalance });
        }

        return NextResponse.json({ error: "Action non reconnue" }, { status: 400 });

    } catch (error: any) {
        console.error("Erreur API Wallet Owner:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
