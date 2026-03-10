/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "./prisma";
import { createHash } from "node:crypto";

export const DELIVERY_STATUSES = {
    SUBMITTED: "submitted",         // Request sent to MaPoste API
    PROCESSING: "processing",       // MaPoste acknowledged
    IN_TRANSIT: "in_transit",       // Picked up by courier
    ATTEMPTED: "attempted",         // Delivery attempted but failed
    AWAITING_PICKUP: "awaiting_pickup", // Left at post office
    DELIVERED: "delivered",         // Officially signed and received
    RETURNED: "returned",           // Could not deliver, returned to sender
    FAILED: "failed"
};

/**
 * Part 19.1: Generate MaPoste Tracking Number
 * Format: CI-POST-{YYYY}-{MM}-{SEQUENCE}-{DOCTYPE}
 * DOCTYPE: MD (Mise en Demeure), REC (Quittance), GEN (General)
 */
export async function generateTrackingNumber(docType: 'MD' | 'REC' | 'GEN' = 'GEN'): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');

    const count = await prisma.digitalDelivery.count({
        where: {
            createdAt: {
                gte: new Date(`${year}-01-01`),
                lt: new Date(`${year + 1}-01-01`)
            }
        }
    });

    const sequence = (count + 1).toString().padStart(6, '0');
    return `CI-POST-${year}-${month}-${sequence}-${docType}`;
}

/**
 * Part 19.2: Generate SHA-256 Delivery Receipt (ARN)
 * HashKey = trackingNumber|deliveredAt|recipientPhone
 */
export function generateDeliveryReceiptHash(trackingNumber: string, deliveredAt: Date, recipientPhone: string): string {
    return createHash('sha256')
        .update(`${trackingNumber}|${deliveredAt.toISOString()}|${recipientPhone}`)
        .digest('hex');
}

/**
 * Part 19.3: Create a MaPoste Dispatch
 */
export async function createMaPosteDispatch(params: {
    recipientData: Record<string, any>;
    deliveryMode: string;
    docType?: 'MD' | 'REC' | 'GEN';
    receiptId?: string;
}) {
    const trackingNumber = await generateTrackingNumber(params.docType || 'GEN');

    const delivery = await prisma.digitalDelivery.create({
        data: {
            trackingNumber,
            deliveryMode: params.deliveryMode,
            status: DELIVERY_STATUSES.SUBMITTED,
            recipientData: params.recipientData,
            // Link receipt if provided
            ...(params.receiptId ? { receipts: { connect: { id: params.receiptId } } } : {})
        }
    });

    console.log(`[MaPoste] Dispatch created: ${trackingNumber}`);
    return delivery;
}

/**
 * Part 19.4: Process Inbound MaPoste Webhook
 * Normalizes webhook payload and updates delivery status.
 */
export async function processMaPosteWebhook(payload: {
    trackingNumber: string;
    event: string;
    timestamp: string;
    recipientPhone?: string;
}) {
    const { trackingNumber, event, timestamp, recipientPhone } = payload;

    const delivery = await prisma.digitalDelivery.findUnique({
        where: { trackingNumber }
    });

    if (!delivery) {
        console.error(`[MaPoste] Unknown tracking: ${trackingNumber}`);
        return { error: "Tracking number not found" };
    }

    // Map operator event to internal status
    const statusMap: Record<string, string> = {
        "ENREGISTRE": DELIVERY_STATUSES.PROCESSING,
        "ENLEVE": DELIVERY_STATUSES.IN_TRANSIT,
        "TENTATIVE_LIVRAISON": DELIVERY_STATUSES.ATTEMPTED,
        "EN_ATTENTE_RETRAIT": DELIVERY_STATUSES.AWAITING_PICKUP,
        "LIVRE": DELIVERY_STATUSES.DELIVERED,
        "RETOURNE": DELIVERY_STATUSES.RETURNED
    };

    const newStatus = statusMap[event] || DELIVERY_STATUSES.PROCESSING;
    const deliveredAt = newStatus === DELIVERY_STATUSES.DELIVERED ? new Date(timestamp) : null;

    // Generate integrity hash for delivered items
    let arnHash: string | null = null;
    if (deliveredAt && recipientPhone) {
        arnHash = generateDeliveryReceiptHash(trackingNumber, deliveredAt, recipientPhone);
    }

    await prisma.digitalDelivery.update({
        where: { id: delivery.id },
        data: {
            status: newStatus,
            deliveredAt,
            // ARN hash stored in recipientData JSON (extend schema optionally)
            recipientData: {
                ...(delivery.recipientData as object),
                arnHash,
                lastEvent: event,
                eventTimestamp: timestamp
            }
        }
    });

    console.log(`[MaPoste] ${trackingNumber} -> ${newStatus}${arnHash ? ` | ARN: ${arnHash.substring(0, 16)}...` : ''}`);
    return { success: true, trackingNumber, newStatus, arnHash };
}
