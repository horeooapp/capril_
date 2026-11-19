import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pdfQuittance } from "@/lib/quittance-express-envoi";

/**
 * PDF d'une quittance. Accès par jeton (celui du QR de la quittance) : c'est le
 * lien que reçoit le locataire, qui n'a pas forcément de compte.
 */
export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const jeton = new URL(request.url).searchParams.get("t");
  if (!jeton) return new NextResponse("Lien incomplet", { status: 400 });
  const q = await (prisma as any).receipt.findUnique({ where: { id }, select: { id: true, qrToken: true, receiptRef: true } });
  if (!q || !q.qrToken || q.qrToken !== jeton) return new NextResponse("Quittance introuvable", { status: 404 });
  const { pdf } = await pdfQuittance(id);
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="Quittance-${q.receiptRef}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
