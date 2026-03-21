/**
 * WhatsApp Cloud API Integration (Meta)
 * Spécifications ADD-09 - Sprint 2
 */

export interface WATemplateParams {
  type: "text";
  text: string;
}

export interface WATemplateData {
  name: string;
  language: {
    code: string;
  };
  components?: Array<{
    type: "body" | "header" | "button";
    parameters: WATemplateParams[];
  }>;
}

/**
 * Envoie un message basé sur un template pré-approuvé par Meta
 */
export async function sendWhatsAppTemplate(
  to: string,
  templateName: string,
  parameters: string[] = []
): Promise<{ success: boolean; messageId?: string; error?: any }> {
  console.log(`[WhatsApp] Sending template ${templateName} to ${to}`);
  
  const token = process.env.WHATSAPP_CLOUD_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    console.warn("[WhatsApp] Missing WHATSAPP_CLOUD_TOKEN or WHATSAPP_PHONE_NUMBER_ID. Simulating fetch.");
    return { success: true, messageId: "simulated_wa_msg_id" };
  }

  // Formatting parameters for the Body component if elements exist
  const components = parameters.length > 0 ? [
    {
      type: "body" as const,
      parameters: parameters.map(p => ({
        type: "text" as const,
        text: p
      }))
    }
  ] : undefined;

  const payload = {
    messaging_product: "whatsapp",
    to: to.replace("+", ""), // Meta expects without "+"
    type: "template",
    template: {
      name: templateName,
      language: {
        code: "fr"
      },
      // Meta Graph API attend le composant `body` s'il y a des variables
      ...(components ? { components } : {})
    }
  };

  try {
    const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[WhatsApp] Cloud API Error:", data.error || data);
      return { success: false, error: data.error };
    }

    const messageId = data.messages?.[0]?.id;
    return { success: true, messageId };

  } catch (error) {
    console.error("[WhatsApp] Network / Unexpected error:", error);
    return { success: false, error };
  }
}
