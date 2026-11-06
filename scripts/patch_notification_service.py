with open('src/lib/notification-service.ts', 'r', encoding='utf-8') as f:
    text = f.read()

target = """      const title = "QAPRIL App";
      const body = data.payload?.smsText || data.payload?.title || "Nouvelle notification importante sur votre espace QAPRIL.";

      // Case 1: Expo Push Token (Mobile)
      if (user.pushToken.startsWith('ExponentPushToken') || user.pushToken.startsWith('token:')) {
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: user.pushToken,
            sound: 'default',
            title: title,
            body: body,
            data: { event, referenceId: data.referenceId },
          }),
        });"""

replacement = """      const title = data.payload?.titre || data.payload?.title || "QAPRIL App";
      const body = data.payload?.message || data.payload?.smsText || data.payload?.title || data.payload?.titre || "Nouvelle notification importante sur votre espace QAPRIL.";

      // Case 1: Expo Push Token (Mobile)
      if (user.pushToken.startsWith('ExponentPushToken') || user.pushToken.startsWith('token:')) {
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: user.pushToken,
            sound: 'default',
            title: title,
            body: body,
            channelId: event === 'NOUVEAU_MESSAGE_BAIL' ? 'messages' : 'default',
            data: { event, referenceId: data.referenceId, ...data.payload },
          }),
        });"""

# Normalise line endings for search
normalized_text = text.replace('\r\n', '\n')
normalized_target = target.replace('\r\n', '\n')
normalized_replacement = replacement.replace('\r\n', '\n')

if normalized_target in normalized_text:
    normalized_text = normalized_text.replace(normalized_target, normalized_replacement, 1)
    with open('src/lib/notification-service.ts', 'w', encoding='utf-8') as f:
        f.write(normalized_text)
    print("SUCCESS")
else:
    print("TARGET NOT FOUND")

