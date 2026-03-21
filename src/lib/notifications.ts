import { prisma } from "./prisma";
import { sendSMS } from "./sms";

export type NotificationChannel = 'SMS' | 'PUSH' | 'EMAIL' | 'USSD_PUSH' | 'COURRIER';

export type NotificationPayload = {
    userId: string;
    title?: string;
    content: string;
    channels?: NotificationChannel[];
};

// Default fallback chain for CI context
const DEFAULT_CHAIN: NotificationChannel[] = ['PUSH', 'SMS', 'EMAIL', 'USSD_PUSH'];

/**
 * Part 20.1: Send Notification via Fallback Chain
 */
export async function sendNotification(payload: NotificationPayload): Promise<void> {
    const chain = payload.channels || DEFAULT_CHAIN;

    const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { phone: true, email: true, pushToken: true }
    });

    if (!user) {
        console.error(`[Notifications] User ${payload.userId} not found`);
        return;
    }

    let delivered = false;

    for (const channel of chain) {
        if (delivered) break;

        let channelStatus: 'sent' | 'failed' = 'failed';

        try {
            switch (channel) {
                case 'PUSH':
                    if (user.pushToken) {
                        // Placeholder: integrate with Firebase FCM
                        console.log(`[PUSH] → ${user.pushToken}: ${payload.title || ''} | ${payload.content}`);
                        delivered = true;
                    }
                    break;

                case 'SMS':
                    if (user.phone) {
                        const msg = payload.title ? `${payload.title}: ${payload.content}` : payload.content;
                        delivered = await sendSMS(user.phone, msg);
                    }
                    break;

                case 'EMAIL':
                    if (user.email) {
                        const { sendEmail } = await import("./email");
                        const result = await sendEmail({
                            to: user.email,
                            subject: payload.title || "Notification QAPRIL",
                            html: `<p>${payload.content}</p>`
                        });
                        delivered = result.success;
                    }
                    break;

                case 'USSD_PUSH':
                    if (user.phone) {
                        console.log(`[USSD_PUSH] → ${user.phone}: ${payload.content}`);
                        delivered = true;
                    }
                    break;
            }

            channelStatus = delivered ? 'sent' : 'failed';
        } catch (_err) {
            console.warn(`[Notifications] Channel ${channel} failed, trying next...`);
        }

        // Record attempt to DB
        await prisma.notification.create({
            data: {
                userId: payload.userId,
                channel,
                title: payload.title ?? null,
                content: payload.content,
                status: channelStatus
            }
        });
    }

    if (!delivered) {
        console.error(`[Notifications] All channels failed for user ${payload.userId}`);
    }
}

/**
 * Part 20.2: Broadcast to multiple users
 */
export async function broadcastNotification(
    userIds: string[],
    content: string,
    title?: string,
    channels?: NotificationChannel[]
): Promise<void> {
    await Promise.all(
        userIds.map(userId => sendNotification({ userId, content, title, channels }))
    );
}
