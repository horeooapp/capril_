import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      fullName: true,
      paysResidence: true,
      diasporaDevise: true,
      diasporaWhatsapp: true,
      diasporaAbonnement: true,
      diasporaAbonnementSince: true,
    }
  });

  return NextResponse.json(user);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const data = await req.json();

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      paysResidence: data.paysResidence,
      diasporaDevise: data.devise,
      diasporaWhatsapp: data.whatsapp,
    }
  });

  return NextResponse.json(updated);
}
