import { Resend } from 'resend';

let _resend: Resend | null = null;

function getResend() {
  const key = process.env.AUTH_RESEND_KEY;
  if (!key) return null;
  if (!_resend) _resend = new Resend(key);
  return _resend;
}

export async function sendEmail({
  to,
  subject,
  html,
  attachments,
}: {
  to: string;
  subject: string;
  html: string;
  attachments?: any[];
}) {
  console.log(`[Email] Sending to ${to}: ${subject}`);
  
  const resend = getResend();
  if (!resend) {
    console.warn("[Email] AUTH_RESEND_KEY missing. Email not sent, logged to console instead.");
    return { success: true, mock: true };
  }

  try {
    const from = process.env.EMAIL_FROM || "noreply@qapril.net";
    
    const result = await resend.emails.send({
      from,
      to,
      subject,
      html,
      attachments: attachments?.map(att => ({
        filename: att.filename,
        content: att.content,
      })) as any,
    });

    if (result.error) {
        console.error("[Email] Resend error:", result.error);
        return { success: false, error: result.error };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("[Email] Technical error:", error);
    return { success: false, error };
  }
}

export function wrapInPremiumTemplate(content: string, title?: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.qapril.ci";
  
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9fbfd; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(31, 78, 121, 0.08); border: 1px solid #eef2f7; }
        .header { background: linear-gradient(135deg, #1F4E79 0%, #2c6ca7 100%); padding: 40px 40px; text-align: center; }
        .logo { color: #ffffff; font-size: 28px; font-weight: 900; letter-spacing: 5px; text-transform: uppercase; margin: 0; }
        .content { padding: 48px 40px; color: #344054; line-height: 1.6; }
        .title { color: #1F4E79; font-size: 22px; font-weight: 800; margin-bottom: 24px; text-transform: uppercase; letter-spacing: 1px; }
        .footer { background-color: #f9fafb; padding: 32px 40px; text-align: center; border-top: 1px solid #f2f4f7; }
        .button-container { margin: 40px 0; text-align: center; }
        .button { background-color: #C55A11; color: #ffffff !important; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 800; text-transform: uppercase; font-size: 13px; letter-spacing: 1px; box-shadow: 0 10px 20px rgba(197, 90, 17, 0.2); }
        .footer-text { font-size: 11px; color: #667085; margin: 8px 0; font-weight: 500; }
        .footer-tag { font-size: 10px; color: #98a2b3; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; margin-top: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="logo">QAPRIL</h1>
        </div>
        <div class="content">
          ${title ? `<h2 class="title">${title}</h2>` : ""}
          ${content}
        </div>
        <div class="footer">
          <p class="footer-text">© 2024 QAPRIL • Excellence en Administration Centrale</p>
          <p class="footer-text">Infrastructure Numérique Nationale de Confiance</p>
          <div class="footer-tag">Certifié par l'État de Côte d'Ivoire</div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || "https://www.qapril.ci"}/auth/reset-password?token=${token}`;
  
  const content = `
    <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte <strong>QAPRIL</strong>.</p>
    <p>Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe. Ce lien est valable pendant <strong>1 heure</strong>.</p>
    <div class="button-container">
      <a href="${resetLink}" class="button">Réinitialiser le mot de passe</a>
    </div>
    <p style="color: #667085; font-size: 13px; margin-top: 32px;">Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.</p>
  `;

  return sendEmail({
    to: email,
    subject: "Réinitialisation de votre mot de passe - QAPRIL",
    html: wrapInPremiumTemplate(content, "Sécurité de votre compte"),
  });
}
