import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const leaseId = params.id;
    
    // Appel réel à la passerelle DGI
    const dgiUrl = process.env.DGI_API_URL || 'https://api.dgi.gouv.ci/v1/enregistrement';
    const dgiToken = process.env.DGI_API_TOKEN || 'MISSING_TOKEN';
    
    // On prépare le payload selon les spécifications probables de la DGI
    const payload = {
      referenceInterne: leaseId,
      montantLoyer: 150000, // À récupérer de la base
      dureeMois: 12,
      nbPages: 3
    };

    const dgiResponse = await fetch(dgiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${dgiToken}`,
        'X-Client-Id': 'QAPRIL-SYS'
      },
      body: JSON.stringify(payload)
    });

    if (!dgiResponse.ok) {
      throw new Error(`DGI API Erreur: ${dgiResponse.statusText}`);
    }

    const dgiData = await dgiResponse.json();
    // dgiData contient idéalement un numéro de suivi
    
    await prisma.lease.update({
      where: { id: leaseId },
      data: { 
        statutDgi: "EN_COURS",
        dgiReference: dgiData.referenceSuivi || null 
      }
    });

    return NextResponse.json({ success: true, message: "Dossier DGI soumis", statut: "EN_COURS" });
  } catch (error) {
    console.error("Erreur Soumettre DGI-02:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
