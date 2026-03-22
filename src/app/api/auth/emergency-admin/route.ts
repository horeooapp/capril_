import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcrypt-ts";

/**
 * ENDPOINT DE SECOURS - CRÉATION D'ADMINISTRATEUR PRODUCTION
 * 
 * Sécurisé par un PIN de sécurité.
 * À SUPPRIMER IMMÉDIATEMENT APRÈS UTILISATION.
 */
export async function GET(request: Request) {
  // Extraction robuste des paramètres (App Router)
  const url = new URL(request.url, process.env.NEXT_PUBLIC_APP_URL || "https://www.qapril.ci");
  const searchParams = url.searchParams;

  const email = searchParams.get("email")?.trim();
  const password = searchParams.get("password");
  const providedPin = searchParams.get("pin")?.trim().toUpperCase();

  // LOG DE DIAGNOSTIC POUR LE DÉVELOPPEUR (Visible dans les logs VPS/PM2)
  console.log(`[EMERGENCY-ADMIN] URL: ${request.url}`);
  console.log(`[EMERGENCY-ADMIN] Keys found: ${Array.from(searchParams.keys()).join(",")}`);
  console.log(`[EMERGENCY-ADMIN] PIN Provided: ${providedPin ? "Yes" : "No"} (${providedPin})`);

  // PIN SIMPLIFIÉ POUR ÉVITER LES ERREURS DE TYPAGE (DASHES/SPACES/CASE)
  const SECURITY_PIN = "QAPRIL2026";

  if (providedPin !== SECURITY_PIN) {
    const keys = Array.from(searchParams.keys());
    console.warn(`[EMERGENCY-ADMIN] Access attempt with invalid PIN: ${providedPin}. Keys: ${keys.join(",")}`);
    return NextResponse.json({ 
      error: "Unauthorized: Invalid Security PIN.", 
      debug: { 
        keysFound: keys,
        expectedFormat: "?email=...&password=...&pin=QAPRIL2026"
      } 
    }, { status: 401 });
  }

  if (!email || !password) {
    return NextResponse.json({ error: "Missing email or password parameters" }, { status: 400 });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await prisma.user.findFirst({
        where: { email }
    });

    if (existingUser) {
        await prisma.user.update({
            where: { id: existingUser.id },
            data: {
                password: hashedPassword,
                role: "SUPER_ADMIN",
                status: "active"
            }
        });
    } else {
        await prisma.user.create({
            data: {
                email,
                phone: `+225_TMP_${Date.now().toString().slice(-8)}`, // Unique temporary phone
                fullName: "Administrateur de Secours",
                password: hashedPassword,
                role: "SUPER_ADMIN",
                status: "active"
            }
        });
    }

    return NextResponse.json({
      success: true,
      message: `User ${email} is now a SUPER_ADMIN.`,
      note: "DELETE THIS FILE IMMEDIATELY AFTER USE."
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
