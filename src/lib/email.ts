import { Resend } from 'resend';
import nodemailer from 'nodemailer';

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
}): Promise<{ success: boolean; provider?: string; data?: any; error?: any }> {
  console.log(`[Email] Attempting to send to ${to}: ${subject}`);
  
  const from = process.env.EMAIL_FROM || "noreply@qapril.net";
  const resend = getResend();
  const smtpUrl = process.env.EMAIL_SERVER;

  // Helper for timeout
  const withTimeout = (promise: Promise<any>, timeoutMs: number, providerName: string) => {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error(`Timeout: ${providerName} failed to respond after ${timeoutMs}ms`)), timeoutMs))
    ]);
  };

  // 1. Try Resend if configured
  if (resend) {
    try {
      console.log(`[Email] Trying Resend provider (10s timeout)...`);
      const result = await withTimeout(resend.emails.send({
        from,
        to,
        subject,
        html,
        attachments: attachments?.map(att => ({
          filename: att.filename,
          content: att.content,
        })) as any,
      }), 10000, "Resend");

      if (!result.error) {
        console.log("[Email] Resend delivery successful");
        return { success: true, provider: 'resend', data: result.data };
      }
      console.error("[Email] Resend returned error:", JSON.stringify(result.error));
    } catch (error: any) {
      console.error("[Email] Resend attempt failed/timed out:", error.message || error);
    }
  }

  // 2. Fallback to SendGrid if configured
  const sendgridKey = process.env.SENDGRID_API_KEY;
  if (sendgridKey) {
    try {
      console.log(`[Email] Trying SendGrid provider (10s timeout)...`);
      
      const payload = {
        personalizations: [{ to: [{ email: to }] }],
        from: { email: from, name: "QAPRIL" },
        subject: subject,
        content: [{ type: "text/html", value: html }],
        attachments: attachments ? attachments.map(a => ({
          content: a.content.toString('base64'),
          filename: a.filename,
          disposition: "attachment"
        })) : undefined
      };

      const sendgridReq = fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${sendgridKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const response = await withTimeout(sendgridReq, 10000, "SendGrid");
      
      if (response.ok) {
        console.log("[Email] SendGrid delivery successful");
        return { success: true, provider: 'sendgrid' };
      }
      const errorText = await response.text();
      console.error("[Email] SendGrid returned error:", errorText);
    } catch (error: any) {
      console.error("[Email] SendGrid attempt failed/timed out:", error.message || error);
    }
  }

  // 2. Fallback to SMTP if configured
  if (smtpUrl) {
    try {
      console.log(`[Email] Fallback to SMTP provider (10s timeout)...`);
      
      // Explicitly handle Port 465 for SSL/TLS if detected in the URL
      const isSecurePort = smtpUrl.includes(":465");
      
      const transporter = nodemailer.createTransport(isSecurePort ? {
        // Use object config for 465 to ensure secure: true
        ...(() => {
          const url = new URL(smtpUrl);
          return {
            host: url.hostname,
            port: 465,
            secure: true,
            auth: {
              user: decodeURIComponent(url.username),
              pass: decodeURIComponent(url.password),
            }
          };
        })()
      } : smtpUrl);
      
      const info = await withTimeout(transporter.sendMail({
        from,
        to,
        subject,
        html,
        attachments: attachments?.map(att => ({
          filename: att.filename,
          content: att.content,
        })),
      }), 10000, "SMTP");

      console.log("[Email] SMTP delivery successful:", info.messageId);
      return { success: true, provider: 'smtp', data: info };
    } catch (error: any) {
      console.error("[Email] SMTP fallback failed/timed out:", error.message || error);
    }
  }

  // No more fallbacks

  return { success: false, error: "No email provider available or configured" };
}

export function wrapInPremiumTemplate(content: string, title?: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.qapril.net";
  
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #EEF3FB; margin: 0; padding: 40px 10px; -webkit-font-smoothing: antialiased;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(27, 58, 107, 0.1); border: 1px solid #D0DFF5;">
          <!-- Header -->
          <tr>
              <td style="background-color: #1B3A6B; padding: 40px; text-align: center; border-bottom: 4px solid #FF8200;">
                  <img src="${appUrl}/logo.png" alt="QAPRIL" style="height: 60px; width: auto; display: block; margin: 0 auto; margin-bottom: 20px;"/>
                  <p style="color: #8AAABF; font-size: 10px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin: 0;">Quittancement Autonome & Plateforme de Ressource Immobilière Locative</p>
              </td>
          </tr>
          
          <!-- Content -->
          <tr>
              <td style="padding: 40px 30px;">
                  ${title ? `<h2 style="color: #1B3A6B; font-size: 20px; font-weight: 800; margin-top: 0; margin-bottom: 24px; text-transform: uppercase; letter-spacing: 0.5px; border-left: 4px solid #FF8200; padding-left: 12px;">${title}</h2>` : ""}
                  <div style="color: #344054; font-size: 15px; line-height: 1.6;">
                      ${content}
                  </div>
              </td>
          </tr>
          
          <!-- Security Badges -->
          <tr>
              <td style="background-color: #F8FAFC; padding: 24px 30px; border-top: 1px solid #EEF3FB;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                          <td align="center">
                              <p style="margin:0 0 8px 0; font-size: 11px; font-weight: 800; color: #10B981; text-transform: uppercase; letter-spacing: 1px;">✓ Conforme CDC-CI (Caisse des Dépôts et Consignations)</p>
                              <p style="margin:0; font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">🔒 Infrastructure Protégée AES-256</p>
                          </td>
                      </tr>
                  </table>
              </td>
          </tr>
          
          <!-- Footer -->
          <tr>
              <td style="background-color: #0F2342; padding: 30px 40px; text-align: center;">
                  <p style="color: #94A3B8; font-size: 11px; margin: 0 0 8px 0;">Cet email est généré automatiquement par l'Infrastructure de Confiance QAPRIL.</p>
                  <p style="color: #FF8200; font-size: 11px; margin: 0 0 16px 0; font-weight: bold;">Le personnel QAPRIL ne vous demandera jamais ce code par téléphone.</p>
                  <p style="color: #4A90E2; font-size: 10px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin: 0;">© ${new Date().getFullYear()} RÉPUBLIQUE DE CÔTE D'IVOIRE</p>
              </td>
          </tr>
      </table>
    </body>
    </html>
  `;
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || "https://www.qapril.net"}/auth/reset-password?token=${token}`;
  
  const content = `
    <p style="margin: 0 0 20px 0;">Vous avez initié une demande de réinitialisation des accès pour votre compte certifié <strong>QAPRIL</strong>.</p>
    <p style="margin: 0 0 20px 0;">Veuillez cliquer sur le bouton de sécurité ci-dessous pour configurer une nouvelle clé d'accès. Ce lien est chiffré et n'est valable que pendant <strong>1 heure</strong>.</p>
    <div style="margin: 32px 0; text-align: center;">
      <a href="${resetLink}" style="background-color: #1B3A6B; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 800; text-transform: uppercase; font-size: 13px; letter-spacing: 1px; display: inline-block;">Réinitialiser l'accès</a>
    </div>
    <div style="background-color: #FFF4E5; border-left: 4px solid #FF8200; padding: 16px; margin-top: 32px; border-radius: 0 8px 8px 0;">
      <p style="margin: 0; font-size: 13px; color: #5A3A00;"><strong>Alerte :</strong> Si vous n'avez pas demandé cette réinitialisation, votre compte pourrait être ciblé. Veuillez le signaler immédiatement à <em>fraude@qapril.net</em>.</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "Action Requise : Réinitialisation de vos accès - QAPRIL",
    html: wrapInPremiumTemplate(content, "Sécurité de l'Authentification"),
  });
}

export async function sendOTPEmail(email: string, otp: string) {
  const content = `
    <p style="margin: 0 0 16px 0;">Cher(e) utilisateur(trice),</p>
    <p style="margin: 0 0 24px 0;">Suite à votre procédure d'authentification, veuillez utiliser le code de sécurité <strong>à usage unique (OTP)</strong> ci-dessous pour déverrouiller votre session et accéder à votre espace protégé.</p>
    
    <div style="background-color: #F8FAFC; border: 2px dashed #1B3A6B; border-radius: 16px; padding: 32px; text-align: center; margin: 32px 0;">
      <span style="font-size: 44px; font-weight: 900; letter-spacing: 12px; color: #1B3A6B; font-family: 'Courier New', Courier, monospace; display: block; margin-left: 12px;">${otp}</span>
    </div>
    
    <div style="background-color: #FFF4E5; border-left: 4px solid #FF8200; padding: 16px; margin-bottom: 12px; border-radius: 0 8px 8px 0;">
      <p style="margin: 0; font-size: 13px; color: #5A3A00; line-height: 1.5;"><strong>Consigne de sécurité :</strong> Ce code expirera automatiquement dans 10 minutes. Ne le partagez avec <strong>personne</strong>. Nos agents ne vous le réclameront jamais.</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `🔐 [${otp}] Code de validation QAPRIL`,
    html: wrapInPremiumTemplate(content, "Validation d'Accès OTP"),
  });
}

