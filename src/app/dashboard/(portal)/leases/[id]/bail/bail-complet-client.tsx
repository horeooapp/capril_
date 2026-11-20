"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { enregistrerMentionsBail } from "@/actions/bail-complet.actions";
import { requestSignatureOTP } from "@/actions/lease.actions";
import ActionsBailEnAttente from "@/components/dashboard/ActionsBailEnAttente";

type Etat = NonNullable<Awaited<ReturnType<typeof import("@/actions/bail-complet.actions").etatBailComplet>>>;
const champ = "w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-[#FF8200] focus:outline-none focus:ring-2 focus:ring-[#FF8200]/30";
const etiquette = "mb-1 block text-xs font-bold text-slate-700";

export default function BailCompletClient({ etat: initial }: { etat: Etat }) {
  const [etat, setEtat] = useState(initial);
  const [m, setM] = useState<any>(initial.mentions || {});
  const [enCours, demarrer] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; texte: string } | null>(null);
  const pro = etat.modele.code === "PROFESSIONNEL";
  const set = (groupe: string | null, cle: string) => (e: any) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setM((p: any) => (groupe ? { ...p, [groupe]: { ...(p[groupe] || {}), [cle]: v } } : { ...p, [cle]: v }));
  };
  const T = ({ g, k, l, ph }: { g: string | null; k: string; l: string; ph?: string }) => (
    <div>
      <label className={etiquette}>{l}</label>
      <input className={champ} value={(g ? m[g]?.[k] : m[k]) ?? ""} onChange={set(g, k)} placeholder={ph} disabled={etat.signe} />
    </div>
  );

  const enregistrer = () => demarrer(async () => {
    setMessage(null);
    const r = await enregistrerMentionsBail(etat.leaseId, m);
    if (!r.success) { setMessage({ ok: false, texte: r.error }); return; }
    if (r.etat) setEtat(r.etat);
    setMessage({ ok: true, texte: "Mentions enregistrées." });
  });
  const envoyer = () => demarrer(async () => {
    setMessage(null);
    const e = await enregistrerMentionsBail(etat.leaseId, m);
    if (!e.success) { setMessage({ ok: false, texte: e.error }); return; }
    if (e.etat) setEtat(e.etat);
    const r: any = await requestSignatureOTP(etat.leaseId);
    setMessage(r.success
      ? { ok: true, texte: "Bail figé et envoyé au locataire avec son code de signature (valable 48 heures)." }
      : { ok: false, texte: r.error });
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 pb-24">
      <header>
        <Link href={`/dashboard/leases/${etat.leaseId}`} className="text-sm font-semibold text-slate-600 underline">← Retour au bail</Link>
        <h1 className="mt-2 text-2xl font-black text-slate-900">Bail complet {etat.reference}</h1>
        <p className="mt-1 text-sm text-slate-600">
          {etat.modele.intitule}, modèle version {etat.modele.version}. {etat.pages} pages, soit {etat.timbre.toLocaleString("fr-FR")} F de timbre (500 F par page).
        </p>
        {etat.modele.statut === "PROJET" && (
          <p className="mt-2 rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-900">
            Ce modèle de bail professionnel est un projet rédigé à partir de l’Acte uniforme OHADA. Il n’a pas encore été relu par un juriste.
          </p>
        )}
        {etat.agenceAgreee && (
          <p className="mt-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">
            Agence agréée : votre en-tête figure sur le bail{etat.nbClauses ? `, avec ${etat.nbClauses} condition${etat.nbClauses > 1 ? "s" : ""} particulière${etat.nbClauses > 1 ? "s" : ""}` : ""}.{" "}
            <Link href="/dashboard/quittance-express/personnalisation" className="font-bold underline">Modifier l’en-tête</Link>
            {" · "}
            <Link href={`/dashboard/leases/${etat.leaseId}/edit`} className="font-bold underline">Conditions particulières</Link>
          </p>
        )}
      </header>

      {etat.annule && <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">Ce bail est annulé.</p>}
      {etat.enAttenteDeSignature && <ActionsBailEnAttente leaseId={etat.leaseId} telephone={etat.telephoneLocataire} apresAnnulation="/dashboard/leases" />}

      {etat.manquants.length > 0 ? (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4">
          <p className="font-bold text-amber-900">Avant l’envoi en signature, il manque :</p>
          <ul className="mt-2 list-disc pl-5 text-sm text-amber-900">{etat.manquants.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
      ) : (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-900">Toutes les mentions obligatoires sont renseignées.</p>
      )}

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-black text-slate-900">Le bailleur</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <T g="bailleur" k="piece" l="N° de pièce d’identité ou RCCM" />
          <T g="bailleur" k="domicile" l="Domicile ou siège social" />
          <T g="bailleur" k="bp" l="Boîte postale" />
          <T g="bailleur" k="compteContribuable" l="Compte contribuable" />
          {pro && <T g="bailleur" k="forme" l="Forme juridique et représentant" />}
        </div>
        <h2 className="font-black text-slate-900">Le locataire</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <T g="preneur" k="piece" l="N° de pièce d’identité ou RCCM" />
          {!pro && <T g="preneur" k="profession" l="Profession" />}
          <T g="preneur" k="bp" l="Boîte postale" />
          {pro && <T g="preneur" k="domicile" l="Domicile ou siège social" />}
          {pro && <T g="preneur" k="forme" l="Forme juridique et représentant" />}
          {pro && <T g="preneur" k="qualite" l="Qualité (commerçant, artisan, société…)" />}
          {pro && <T g="preneur" k="compteContribuable" l="Compte contribuable" />}
        </div>

        {pro ? (
          <>
            <h2 className="font-black text-slate-900">Les locaux et l’activité</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <T g={null} k="activite" l="Activité exercée" />
              <T g="locaux" k="consistance" l="Consistance des locaux" />
              <T g="locaux" k="superficie" l="Superficie" ph="120 m²" />
              <T g="locaux" k="references" l="Références foncières" />
              <T g={null} k="periodicite" l="Périodicité du loyer" ph="par mois" />
              <T g={null} k="revision" l="Clause de révision du loyer" />
              <T g={null} k="chargesCommunes" l="Charges communes supportées par" ph="le PRENEUR" />
              <T g={null} k="fraisEnregistrement" l="Enregistrement à la charge de" ph="le PRENEUR" />
            </div>
            <div className="flex flex-col gap-2 text-sm text-slate-800">
              <label className="flex items-center gap-2"><input type="checkbox" checked={!!m.dureeIndeterminee} onChange={set(null, "dureeIndeterminee")} disabled={etat.signe} /> Bail à durée indéterminée</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={!!m.sousLocationAutorisee} onChange={set(null, "sousLocationAutorisee")} disabled={etat.signe} /> Sous-location autorisée</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={!!m.entreprenantDerogation} onChange={set(null, "entreprenantDerogation")} disabled={etat.signe} /> Preneur entreprenant : lui accorder le droit au renouvellement</label>
            </div>
          </>
        ) : (
          <>
            <h2 className="font-black text-slate-900">Options du bail</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className={etiquette}>Charges de copropriété (article 20) à la charge du</label>
                <select className={champ} value={m.chargesCopropriete || "PRENEUR"} onChange={set(null, "chargesCopropriete")} disabled={etat.signe}>
                  <option value="PRENEUR">Locataire</option><option value="BAILLEUR">Bailleur</option>
                </select>
              </div>
              <T g={null} k="modePaiement" l="Mode de paiement du loyer (article 2)" ph="en espèce ou par chèque à l’ordre du BAILLEUR" />
            </div>
          </>
        )}
        <h2 className="font-black text-slate-900">Signature</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <T g={null} k="lieuSignature" l="Fait à" ph="commune du bien par défaut" />
          <T g={null} k="exemplaires" l="Nombre d’exemplaires originaux" ph="2" />
        </div>

        {message && <p role="status" className={`rounded-lg p-3 text-sm font-semibold ${message.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>{message.texte}</p>}

        <div className="flex flex-wrap gap-3 pt-2">
          {!etat.signe && <button onClick={enregistrer} disabled={enCours} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white disabled:opacity-60">Enregistrer</button>}
          <a href={`/api/leases/${etat.leaseId}/bail${etat.signe ? "" : "?apercu=1"}`} target="_blank" className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-800">
            {etat.signe ? "Télécharger le bail signé" : "Aperçu du bail complet (PDF)"}
          </a>
          {!etat.signe && (
            <button onClick={envoyer} disabled={enCours || etat.manquants.length > 0} className="rounded-xl bg-[#FF8200] px-4 py-2.5 text-sm font-black text-white disabled:opacity-50">
              {enCours ? "Envoi…" : "Figer et envoyer à la signature"}
            </button>
          )}
        </div>
        {etat.fige && <p className="text-xs text-slate-500">Dernière version figée : {etat.fige.pages} pages, empreinte {etat.fige.sha256.slice(0, 16)}…</p>}
      </section>
    </div>
  );
}
