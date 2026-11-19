import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { apercuBail, chargerBailComplet, lireBailFige } from "@/lib/bail/figer";
import { normalizePhone } from "@/lib/phone";

/**
 * Bail complet en PDF. Sert le document figé (celui qui est signé) s'il existe,
 * sinon un aperçu marqué comme tel. `?apercu=1` force l'aperçu.
 */
export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Non connecté", { status: 401 });
  const { id } = await ctx.params;
  let bail: any;
  try { bail = await chargerBailComplet(id); } catch { return new NextResponse("Bail introuvable", { status: 404 }); }

  const u = session.user as any;
  const memeTel = u.phone && bail.tenant?.phone && normalizePhone(u.phone) === normalizePhone(bail.tenant.phone);
  const partie = [bail.landlordId, bail.agentId, bail.tenantId, bail.property?.ownerUserId, bail.property?.managedByUserId].includes(u.id) || memeTel;
  if (!partie && !["ADMIN", "SUPER_ADMIN"].includes(u.role)) return new NextResponse("Accès refusé", { status: 403 });

  const forcerApercu = new URL(request.url).searchParams.get("apercu") === "1";
  const fige = forcerApercu ? null : await lireBailFige(bail);
  const pdf = fige ? fige.pdf : (await apercuBail(id)).pdf;
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="Bail-${bail.leaseReference}${fige ? "" : "-apercu"}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
