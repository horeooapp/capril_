import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ShieldCheck, Calendar, MapPin, User, Hash, CheckCircle2, Clock, Key, Gauge } from "lucide-react";

/**
 * Page publique EDL-07 — /public/edl/[ref]/verifier (A15-UAT-12)
 */
export default async function VerifyPublicEdlPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;

  const edl = await prisma.etatsDesLieux.findFirst({
    where: {
      OR: [{ refEdl: ref }, { id: ref }],
    },
    include: {
      lease: {
        include: {
          property: true,
          landlord: { select: { firstName: true, lastName: true } },
          tenant: { select: { firstName: true, lastName: true } },
        },
      },
    },
  });

  if (!edl) {
    notFound();
  }

  const isCertified = edl.statut === "CERTIFIE" || edl.statut === "CONFIRME";
  const proprioName =
    [edl.lease?.landlord?.firstName, edl.lease?.landlord?.lastName].filter(Boolean).join(" ") ||
    "Propriétaire certifié";
  const locataireName =
    [edl.lease?.tenant?.firstName, edl.lease?.tenant?.lastName].filter(Boolean).join(" ") ||
    "Locataire déclaré";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-slate-900 p-8 text-center text-white">
          <div
            className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 shadow-lg ${
              isCertified ? "bg-emerald-500" : "bg-amber-500"
            }`}
          >
            {isCertified ? <CheckCircle2 className="w-10 h-10" /> : <Clock className="w-10 h-10" />}
          </div>
          <h1 className="text-xl font-black uppercase tracking-widest">
            État des Lieux {edl.typeEdl}
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Module M-EDL · Réf {edl.refEdl || edl.id.slice(0, 8)}
          </p>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex justify-center">
            <span
              className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${
                isCertified
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              Statut : {edl.statut}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase block">Propriétaire</span>
              <span className="text-sm font-bold text-slate-900">{proprioName}</span>
            </div>
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase block">Locataire</span>
              <span className="text-sm font-bold text-slate-900">{locataireName}</span>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-700">
                {edl.lease?.property?.address || "Logement QAPRIL"} ({edl.lease?.property?.commune || "CI"})
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-700">
                Date : {new Date(edl.dateEdl).toLocaleDateString("fr-FR")}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Key className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-700">
                Clés remises : {edl.clesRemises} {edl.clesDetail ? `(${edl.clesDetail})` : ""}
              </span>
            </div>
            {(edl.indexEau != null || edl.indexElec != null) && (
              <div className="flex items-center gap-3">
                <Gauge className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-700">
                  Index Eau : {edl.indexEau ?? "—"} · Index Élec : {edl.indexElec ?? "—"} kWh
                </span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-start gap-2 text-slate-400">
              <Hash className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="text-[10px] font-mono break-all">
                Empreinte SHA-256 : {edl.hashSha256 || "En attente de certification finale"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

