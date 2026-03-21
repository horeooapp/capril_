import { Resend } from "resend";

const resend = new Resend(process.env.AUTH_RESEND_KEY);

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "noreply@qapril.net",
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error("[Email] Error sending email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("[Email] Unexpected error:", error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || "https://www.qapril.ci"}/auth/reset-password?token=${token}`;
  
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #1F4E79; text-transform: uppercase; letter-spacing: 2px;">Réinitialisation de mot de passe</h2>
      <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte <strong>QAPRIL</strong>.</p>
      <p>Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe. Ce lien est valable pendant 1 heure.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #C55A11; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; text-transform: uppercase; font-size: 14px;">Réinitialiser mon mot de passe</a>
      </div>
      <p style="color: #666; font-size: 12px;">Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 10px; color: #999; text-align: center;">QAPRIL - Infrastructure Nationale de Confiance</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "Réinitialisation de votre mot de passe - QAPRIL",
    html,
  });
}
