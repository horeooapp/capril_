import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcrypt-ts";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const email = searchParams.get("email")?.trim();
  const password = searchParams.get("password");
  
  // PIN SIMPLIFIÉ
  const SECURITY_PIN = "QAPRIL2026";

  // Fallback diagnostic : check headers too if query is empty
  const headerPin = request.headers.get("x-security-pin")?.trim().toUpperCase();
  const providedPin = (searchParams.get("pin")?.trim().toUpperCase() || headerPin);

  // LOG DE DIAGNOSTIC
  console.log(`[EMERGENCY-ADMIN] Path: ${request.nextUrl.pathname}`);
  console.log(`[EMERGENCY-ADMIN] PIN Provided: ${providedPin ? "Yes" : "No"} (from ${searchParams.has("pin") ? "Query" : "Header"})`);
  console.log(`[EMERGENCY-ADMIN] Params found: ${Array.from(searchParams.keys()).join(",")}`);

  if (providedPin !== SECURITY_PIN) {
    return NextResponse.json({ 
      error: "Unauthorized: Invalid Security PIN.", 
      debug: { 
        keysFound: Array.from(searchParams.keys()),
        headerPinFound: !!headerPin,
        message: "Les paramètres d'URL semblent vides sur votre serveur (Hostinger). Utilisez un Header 'x-security-pin' si le lien échoue."
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
