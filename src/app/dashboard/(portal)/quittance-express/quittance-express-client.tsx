"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  emettreQuittanceExpressAction, completerDossierExpressAction, envoyerBailASignatureAction,
} from "@/actions/quittance-express.actions";
import { MODES_PAIEMENT } from "@/lib/quittance-express-modes";
import ActionsBailEnAttente from "@/components/dashboard/ActionsBailEnAttente";

type Dossier = Awaited<ReturnType<typeof import("@/actions/quittance-express.actions").listerDossiersExpress>>[number];

const moisCourant = () => new Date().toISOString().slice(0, 7);
const fcfa = (n: number) => n.toLocaleString("fr-FR");
const LIBELLE_CANAL: Record<string, string> = { WHATSAPP: "WhatsApp", SMS: "SMS", EMAIL: "E-mail" };
const LIBELLE_STATUT: Record<string, string> = {
  ENVOYE: "envoyé", ECHEC: "échec", NON_CONFIGURE: "non configuré", SANS_ADRESSE: "pas d’adresse",
};

const champ = "w-full rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-900 focus:border-[#FF8200] focus:outline-none focus:ring-2 focus:ring-[#FF8200]/30";
const etiquette = "mb-1 block text-sm font-semibold text-slate-700";

export default function QuittanceExpressClient({ dossiers }: { dossiers: Dossier[] }) {
  const router = useRouter();
  const [enCours, demarrer] = useTransition();
  const [f, setF] = useState({ nomLocataire: "", telephone: "", montant: "", quartier: "", mois: moisCourant(), modePaiement: "", referencePaiement: "", email: "" });
  const [plus, setPlus] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [resultat, setResultat] = useState<any>(null);
  const [ouvert, setOuvert] = useState<string | null>(null);

  const maj = (k: keyof typeof f) => (e: any) => setF({ ...f, [k]: e.target.value });

  function reprendre(d: Dossier) {
    setF({ ...f, nomLocataire: d.locataire, telephone: d.telephone, montant: String(d.loyer), quartier: d.quartier, mois: moisCourant(), modePaiement: "", referencePaiement: "" });
    setResultat(null); setErreur(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function emettre(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    demarrer(async () => {
      const r = await emettreQuittanceExpressAction({ ...f, montant: Number(f.montant.replace(/\s/g, "")) });
      if (!r.success) { setErreur(r.error); return; }
      setResultat(r);
      setF({ nomLocataire: "", telephone: "", montant: "", quartier: "", mois: moisCourant(), modePaiement: "", referencePaiement: "", email: "" });
      router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-4 pb-24">
      <header>
        <h1 className="text-2xl font-black text-slate-900">Quittance express</h1>
        <p className="mt-1 text-sm text-slate-600">Vous venez d’être payé ? Quatre informations, et la quittance part chez votre locataire.</p>
        <Link href="/dashboard/quittance-express/personnalisation" className="mt-2 inline-block text-sm font-bold text-[#FF8200] underline">Mettre mon logo et mes coordonnées sur les quittances</Link>
      </header>

      {resultat && (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-lg font-black text-emerald-900">Quittance {resultat.quittance.reference} émise</p>
          <ul className="mt-3 space-y-1 text-sm">
            {resultat.remise.map((x: any) => (
              <li key={x.canal} className={x.statut === "ENVOYE" ? "text-emerald-800" : "text-slate-600"}>
                {x.statut === "ENVOYE" ? "✓" : "–"} {LIBELLE_CANAL[x.canal]} : {LIBELLE_STATUT[x.statut]}
              </li>
            ))}
          </ul>
          {!resultat.remisAuLocataire && (
            <p className="mt-3 rounded-lg bg-amber-100 p-3 text-sm font-semibold text-amber-900">
              La quittance est enregistrée mais aucun envoi n’a abouti. Transmettez ce lien à votre locataire :
              <span className="mt-1 block break-all font-mono text-xs">{resultat.quittance.lien}</span>
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            <a href={resultat.quittance.lien} target="_blank" className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white">Voir la quittance</a>
            <a
              href={`https://wa.me/?text=${encodeURIComponent("Votre quittance de loyer QAPRIL : " + resultat.quittance.lien)}`}
              target="_blank" className="rounded-xl border border-emerald-700 px-4 py-2 text-sm font-bold text-emerald-800"
            >Partager par WhatsApp</a>
          </div>
          {resultat.dossierCree && (
            <p className="mt-4 text-sm text-slate-700">Un logement et un bail ont été créés à l’état provisoire. Complétez-les quand vous voulez, ci-dessous.</p>
          )}
        </section>
      )}

      <form onSubmit={emettre} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <label className={etiquette} htmlFor="qx-nom">Nom du locataire</label>
          <input id="qx-nom" className={champ} value={f.nomLocataire} onChange={maj("nomLocataire")} autoComplete="off" required />
        </div>
        <div>
          <label className={etiquette} htmlFor="qx-tel">Téléphone du locataire</label>
          <input id="qx-tel" className={champ} value={f.telephone} onChange={maj("telephone")} inputMode="tel" placeholder="07 00 00 00 00" required />
          <p className="mt-1 text-xs text-slate-500">C’est sur ce numéro qu’il reçoit sa quittance.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={etiquette} htmlFor="qx-montant">Montant payé (F CFA)</label>
            <input id="qx-montant" className={champ} value={f.montant} onChange={maj("montant")} inputMode="numeric" required />
          </div>
          <div>
            <label className={etiquette} htmlFor="qx-quartier">Quartier</label>
            <input id="qx-quartier" className={champ} value={f.quartier} onChange={maj("quartier")} placeholder="Angré, Koumassi…" required />
          </div>
        </div>

        <fieldset>
          <legend className={etiquette}>Comment avez-vous été payé ?</legend>
          <div className="flex flex-wrap gap-2">
            {MODES_PAIEMENT.map((m) => (
              <button
                key={m.code} type="button" aria-pressed={f.modePaiement === m.code}
                onClick={() => setF({ ...f, modePaiement: m.code, referencePaiement: m.reference ? f.referencePaiement : "" })}
                className={`rounded-full border px-4 py-2 text-sm font-bold ${f.modePaiement === m.code ? "border-[#FF8200] bg-[#FF8200] text-white" : "border-slate-300 bg-white text-slate-700"}`}
              >{m.libelle}</button>
            ))}
          </div>
          <p className="mt-1 text-xs text-slate-500">Le paiement vous a été fait directement, en dehors de QAPRIL : la quittance le précise.</p>
        </fieldset>
        {MODES_PAIEMENT.find((m) => m.code === f.modePaiement)?.reference && (
          <div>
            <label className={etiquette} htmlFor="qx-ref">Référence de la transaction (facultatif)</label>
            <input id="qx-ref" className={champ} value={f.referencePaiement} onChange={maj("referencePaiement")} maxLength={40} autoComplete="off" />
          </div>
        )}

        <button type="button" onClick={() => setPlus(!plus)} className="text-sm font-semibold text-slate-600 underline">
          {plus ? "Masquer" : `Mois : ${f.mois} — modifier, ajouter un e-mail`}
        </button>
        {plus && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={etiquette} htmlFor="qx-mois">Mois concerné</label>
              <input id="qx-mois" type="month" className={champ} value={f.mois} onChange={maj("mois")} />
            </div>
            <div>
              <label className={etiquette} htmlFor="qx-email">E-mail du locataire (facultatif)</label>
              <input id="qx-email" type="email" className={champ} value={f.email} onChange={maj("email")} />
            </div>
          </div>
        )}

        {erreur && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{erreur}</p>}

        <button type="submit" disabled={enCours} className="w-full rounded-xl bg-[#FF8200] py-4 text-base font-black text-white disabled:opacity-60">
          {enCours ? "Émission…" : "Émettre la quittance"}
        </button>
      </form>

      {dossiers.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-black text-slate-900">Vos locataires</h2>
          {dossiers.map((d) => (
            <article key={d.bailId} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-900">{d.locataire}</p>
                  <p className="text-sm text-slate-600">{d.quartier} · {fcfa(d.loyer)} F · {d.nbQuittances} quittance{d.nbQuittances > 1 ? "s" : ""}</p>
                </div>
                <button onClick={() => reprendre(d)} className="shrink-0 rounded-xl bg-slate-900 px-3 py-2 text-sm font-bold text-white">Quittancer</button>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100" aria-hidden>
                <div className="h-full bg-[#FF8200]" style={{ width: `${d.pourcentage}%` }} />
              </div>
              <p className="mt-2 text-sm text-slate-700">
                Dossier complété à {d.pourcentage} %{d.prochaine ? <> · prochaine étape : <strong>{d.prochaine.action}</strong></> : " · complet"}
              </p>
              {d.prochaine && (d.prochaine.code === "BIEN_COMPLETE" || d.prochaine.code === "BAIL_COMPLETE") && (
                ouvert === d.bailId
                  ? <Completer dossier={d} fini={() => { setOuvert(null); router.refresh(); }} />
                  : <button onClick={() => setOuvert(d.bailId)} className="mt-2 text-sm font-bold text-[#FF8200] underline">Compléter maintenant</button>
              )}
              {d.prochaine?.code === "BAIL_SIGNE" && (d.enAttenteDeSignature
                ? <div className="mt-3"><ActionsBailEnAttente leaseId={d.bailId} telephone={d.telephone} /></div>
                : <EnvoyerSignature bailId={d.bailId} telephone={d.telephone} />)}
              {d.prochaine?.code === "BAIL_ENREGISTRE" && (
                <Link href={`/dashboard/leases/${d.bailId}`} className="mt-2 inline-block text-sm font-bold text-[#FF8200] underline">Ouvrir le bail pour l’enregistrer</Link>
              )}
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

function Completer({ dossier, fini }: { dossier: Dossier; fini: () => void }) {
  const [enCours, demarrer] = useTransition();
  const [erreur, setErreur] = useState<string | null>(null);
  const [c, setC] = useState({ typeBien: "", adresse: "", dateEffet: "", dureeMois: "12", depot: "" });
  const maj = (k: keyof typeof c) => (e: any) => setC({ ...c, [k]: e.target.value });

  function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    demarrer(async () => {
      const r = await completerDossierExpressAction({
        bailId: dossier.bailId, typeBien: c.typeBien, adresse: c.adresse, dateEffet: c.dateEffet,
        dureeMois: Number(c.dureeMois), depot: c.depot === "" ? undefined : Number(c.depot),
      });
      if (!r.success) { setErreur(r.error); return; }
      fini();
    });
  }

  return (
    <form onSubmit={enregistrer} className="mt-3 space-y-3 rounded-xl bg-slate-50 p-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={etiquette}>Type de logement</label>
          <select className={champ} value={c.typeBien} onChange={maj("typeBien")} required>
            <option value="">Choisir…</option>
            <option>Studio</option><option>Appartement</option><option>Villa</option>
            <option>Chambre</option><option>Cour commune</option><option>Local commercial</option>
          </select>
        </div>
        <div>
          <label className={etiquette}>Durée (mois)</label>
          <input className={champ} value={c.dureeMois} onChange={maj("dureeMois")} inputMode="numeric" required />
        </div>
      </div>
      <div>
        <label className={etiquette}>Adresse du logement</label>
        <input className={champ} value={c.adresse} onChange={maj("adresse")} placeholder={`${dossier.quartier}, rue, immeuble, porte`} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={etiquette}>Date d’effet du bail</label>
          <input type="date" className={champ} value={c.dateEffet} onChange={maj("dateEffet")} required />
        </div>
        <div>
          <label className={etiquette}>Dépôt de garantie (F)</label>
          <input className={champ} value={c.depot} onChange={maj("depot")} inputMode="numeric" />
        </div>
      </div>
      {erreur && <p role="alert" className="text-sm font-semibold text-red-700">{erreur}</p>}
      <button disabled={enCours} className="w-full rounded-xl bg-slate-900 py-3 text-sm font-black text-white disabled:opacity-60">
        {enCours ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}

function EnvoyerSignature({ bailId, telephone }: { bailId: string; telephone: string }) {
  const [enCours, demarrer] = useTransition();
  const [etat, setEtat] = useState<{ ok: boolean; texte: string } | null>(null);
  return (
    <div className="mt-2">
      <button
        disabled={enCours}
        onClick={() => demarrer(async () => {
          const r = await envoyerBailASignatureAction(bailId);
          setEtat(r.success
            ? { ok: true, texte: `Bail envoyé au ${telephone} avec un code de signature valable 48 heures. Le locataire signe depuis son espace.` }
            : { ok: false, texte: r.error });
        })}
        className="rounded-xl bg-[#FF8200] px-4 py-2 text-sm font-black text-white disabled:opacity-60"
      >{enCours ? "Envoi…" : etat?.ok ? "Renvoyer le code" : "Envoyer le bail à la signature"}</button>
      {etat && <p role="status" className={`mt-2 text-sm font-semibold ${etat.ok ? "text-emerald-800" : "text-red-700"}`}>{etat.texte}</p>}
      <p className="mt-2 text-sm">
        <Link href={`/dashboard/leases/${bailId}/bail`} className="font-bold text-[#FF8200] underline">Compléter les mentions du bail et voir l’aperçu</Link>
      </p>
    </div>
  );
}
