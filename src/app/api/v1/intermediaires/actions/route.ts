import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { emettreQuittanceIntermediaire, activerClemenceM07 } from "@/actions/intermediaire-actions";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { action, ...params } = await req.json();

  if (action === 'quittance') {
    const result = await emettreQuittanceIntermediaire(params);
    return NextResponse.json(result);
  }

  if (action === 'clemence') {
    const result = await activerClemenceM07(params.propertyId, params.options);
    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "Action non reconnue" }, { status: 400 });
}
