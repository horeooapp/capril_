import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { OrangeSMSService, sendSMSWithDetails } from "@/lib/sms";

/**
 * [IC-09] Pourquoi les SMS n'arrivent pas ? Réservé aux administrateurs. N'affiche aucun secret.
 *  GET                      : état de la configuration et du forfait Orange
 *  GET ?test=+2250700000000 : envoie en plus un SMS d'essai et rend le résultat réel
 */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !["ADMIN", "SUPER_ADMIN"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Réservé aux administrateurs" }, { status: 403 });
  }
  const e = process.env;
  const present = (...k: string[]) => k.every((x) => !!e[x]);
  const config = {
    passerelleChoisie: (e.SMS_GATEWAY_PROVIDER || "ORANGE (par défaut, variable absente)").toUpperCase(),
    orange: {
      identifiantsDansLaConfiguration: present("ORANGE_SMS_CLIENT_ID", "ORANGE_SMS_CLIENT_SECRET") || present("ORANGE_CLIENT_ID", "ORANGE_CLIENT_SECRET"),
      numeroEmetteurRenseigne: !!e.ORANGE_SMS_SENDER_NUMBER,
      nomEmetteur: e.ORANGE_SMS_SENDER_NAME || "QAPRIL (par défaut)",
    },
    hsms: present("HSMS_API_KEY"),
    africasTalking: present("AT_API_KEY") && !!e.AT_USERNAME && e.AT_USERNAME !== "sandbox",
    twilio: present("TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_SENDER_NUMBER"),
    whatsappOpenWA: { url: !!e.OPENWA_API_URL, session: !!e.OPENWA_SESSION_ID, modeSimulation: e.ENABLE_OPENWA_MOCK === "true" },
    whatsappMeta: present("WHATSAPP_CLOUD_TOKEN", "WHATSAPP_PHONE_NUMBER_ID"),
  };

  const alertes: string[] = [];
  if (!config.orange.identifiantsDansLaConfiguration) alertes.push("Orange : aucun identifiant dans la configuration du serveur ; le code utilise des identifiants écrits en dur, à remplacer.");
  if (!config.orange.numeroEmetteurRenseigne) alertes.push("Orange : ORANGE_SMS_SENDER_NUMBER absent ; l'envoi part d'un numéro factice et sera refusé.");
  if (config.whatsappOpenWA.modeSimulation) alertes.push("WhatsApp (OpenWA) est en mode simulation : il annonce des envois qui ne partent pas.");
  if (!config.hsms && !config.africasTalking && !config.twilio) alertes.push("Aucune passerelle SMS de secours n'est configurée : tout repose sur Orange.");

  let forfaitOrange: any = null;
  try {
    const f = await new OrangeSMSService().checkBalance();
    forfaitOrange = f.success ? { statut: f.status, unitesDisponibles: f.availableUnits, pays: f.country } : { erreur: f.error };
    if (!f.success) alertes.push(`Orange : connexion ou forfait en échec (${f.error}).`);
    else if (f.status === "AUCUN_CONTRAT" || !f.availableUnits) alertes.push("Orange : aucun forfait SMS actif ou plus aucune unité disponible.");
  } catch (err: any) {
    forfaitOrange = { erreur: err?.message };
  }

  let essai: any = null;
  const numero = new URL(request.url).searchParams.get("test");
  if (numero) {
    const r = await sendSMSWithDetails(numero, "QAPRIL : SMS d'essai. Si vous le recevez, l'envoi fonctionne.");
    essai = r.success ? { envoye: true, passerelle: r.provider } : { envoye: false, erreur: r.error };
  }
  return NextResponse.json({ config, forfaitOrange, alertes, essai }, { headers: { "Cache-Control": "no-store" } });
}
