"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { renvoyerCodeSignatureAction, corrigerNumeroLocataireAction, annulerBailEnAttenteAction } from "@/actions/bail-en-attente.actions";

/** [IC-09] Ce que le bailleur peut faire d'un bail qui attend la signature du locataire. */
export default function ActionsBailEnAttente({ leaseId, telephone, apresAnnulation }: { leaseId: string; telephone?: string | null; apresAnnulation?: string }) {
  const router = useRouter();
  const [enCours, demarrer] = useTransition();
  const [mode, setMode] = useState<null | "numero" | "annuler">(null);
  const [numero, setNumero] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; texte: string } | null>(null);
  const bouton = "rounded-xl px-3 py-2 text-sm font-bold disabled:opacity-60";

  const renvoyer = () => demarrer(async () => {
    const r = await renvoyerCodeSignatureAction(leaseId);
    setMessage(r.success === true
      ? { ok: true, texte: `Code renvoyé${telephone ? ` au ${telephone}` : ""}${r.canaux?.sms ? " par SMS" : r.canaux?.whatsapp ? " par WhatsApp" : ""}. Il est valable 48 heures.` }
      : { ok: false, texte: r.error });
  });
  const corriger = () => demarrer(async () => {
    const r = await corrigerNumeroLocataireAction(leaseId, numero);
    if (r.success !== true) { setMessage({ ok: false, texte: r.error }); return; }
    setMode(null); setNumero("");
    setMessage(r.codeEnvoye
      ? { ok: true, texte: `Numéro corrigé. Le bail et son code sont partis au ${r.telephone}.` }
      : { ok: false, texte: `Numéro corrigé (${r.telephone}), mais le code n’a pas pu partir : ${r.erreurEnvoi}` });
    router.refresh();
  });
  const annuler = () => demarrer(async () => {
    const r = await annulerBailEnAttenteAction(leaseId);
    if (r.success !== true) { setMessage({ ok: false, texte: r.error }); setMode(null); return; }
    if (apresAnnulation) router.push(apresAnnulation); else router.refresh();
  });

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <p className="text-sm font-bold text-amber-900">En attente de la signature du locataire{telephone ? ` (${telephone})` : ""}</p>
      <p className="mt-1 text-xs text-amber-900">Il signe depuis le lien reçu, sur l’application ou sur le site. Sans téléphone connecté, il peut signer sur votre appareil avec les codes reçus sur son propre téléphone.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={renvoyer} disabled={enCours} className={`${bouton} bg-[#FF8200] text-white`}>{enCours && !mode ? "Envoi…" : "Renvoyer le code"}</button>
        <button onClick={() => { setMode(mode === "numero" ? null : "numero"); setMessage(null); }} disabled={enCours} className={`${bouton} border border-slate-300 bg-white text-slate-800`}>Corriger le numéro</button>
        <button onClick={() => { setMode(mode === "annuler" ? null : "annuler"); setMessage(null); }} disabled={enCours} className={`${bouton} border border-red-300 bg-white text-red-700`}>Annuler le bail</button>
      </div>
      {mode === "numero" && (
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <div className="grow">
            <label className="mb-1 block text-xs font-bold text-slate-700" htmlFor={`num-${leaseId}`}>Nouveau numéro du locataire</label>
            <input id={`num-${leaseId}`} value={numero} onChange={(e) => setNumero(e.target.value)} inputMode="tel" placeholder="07 00 00 00 00" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <button onClick={corriger} disabled={enCours || numero.replace(/\D/g, "").length < 10} className={`${bouton} bg-slate-900 text-white`}>{enCours ? "Envoi…" : "Corriger et renvoyer"}</button>
        </div>
      )}
      {mode === "annuler" && (
        <div className="mt-3 rounded-xl bg-white p-3">
          <p className="text-sm text-slate-800">Annuler ce bail ? Le code envoyé au locataire ne fonctionnera plus. Cette action ne peut pas être défaite.</p>
          <div className="mt-2 flex gap-2">
            <button onClick={annuler} disabled={enCours} className={`${bouton} bg-red-600 text-white`}>{enCours ? "Annulation…" : "Oui, annuler le bail"}</button>
            <button onClick={() => setMode(null)} disabled={enCours} className={`${bouton} border border-slate-300 text-slate-800`}>Non, le garder</button>
          </div>
        </div>
      )}
      {message && <p role="status" className={`mt-3 text-sm font-semibold ${message.ok ? "text-emerald-800" : "text-red-700"}`}>{message.texte}</p>}
    </div>
  );
}
