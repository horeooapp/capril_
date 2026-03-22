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
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const password = searchParams.get("password");
  const pin = searchParams.get("pin");

  // PIN DE SÉCURITÉ TEMPORAIRE (À changer ou configurer dans .env)
  const SECURITY_PIN = "QAPRIL-2026-EMERGENCY";

  if (pin !== SECURITY_PIN) {
    return NextResponse.json({ error: "Unauthorized: Invalid Security PIN" }, { status: 401 });
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
