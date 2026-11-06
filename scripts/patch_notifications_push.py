with open('src/lib/notifications.ts', 'r', encoding='utf-8') as f:
    text = f.read()

target = """                case 'PUSH':
                    if (user.pushToken) {
                        // Placeholder: integrate with Firebase FCM
                        console.log(`[PUSH] → ${user.pushToken}: ${payload.title || ''} | ${payload.content}`);
                        delivered = true;
                    }
                    break;"""

replacement = """                case 'PUSH':
                    if (user.pushToken) {
                        const { sendExpoPushNotification } = await import("./expo-push");
                        delivered = await sendExpoPushNotification({
                            to: user.pushToken,
                            title: payload.title || 'QAPRIL Notification',
                            body: payload.content,
                            sound: 'default',
                            channelId: 'default',
                        });
                    }
                    break;"""

if target in text:
    text = text.replace(target, replacement, 1)
    with open('src/lib/notifications.ts', 'w', encoding='utf-8') as f:
        f.write(text)
    print("SUCCESS")
else:
    print("TARGET NOT FOUND")

