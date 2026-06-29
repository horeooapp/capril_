import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const leaseId = params.id;
    const body = await req.json();
    const referenceDgi = body.referenceDgi || `DGI-${Date.now()}`;

    // Callback simulé de la DGI validant l'enregistrement
    await prisma.lease.update({
      where: { id: leaseId },
      data: { 
        statutDgi: "ENREGISTRE",
        dgiReference: referenceDgi
      }
    });

    return NextResponse.json({ success: true, message: "Enregistrement DGI confirmé" });
  } catch (error) {
    console.error("Erreur Confirmation DGI-04:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
