"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { enregistrerPersonnalisationAction } from "@/actions/quittance-personnalisation.actions";

const champ = "w-full rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-900 focus:border-[#FF8200] focus:outline-none focus:ring-2 focus:ring-[#FF8200]/30";
const etiquette = "mb-1 block text-sm font-semibold text-slate-700";

export default function PersonnalisationClient({ personnalisation, agrement }: { personnalisation: any; dejaEnregistree: boolean; agrement: string | null }) {
  const [enCours, demarrer] = useTransition();
  const [p, setP] = useState(personnalisation);
  const [message, setMessage] = useState<{ ok: boolean; texte: string } | null>(null);
  const [cle, setCle] = useState(0);

  function enregistrer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setMessage(null);
    demarrer(async () => {
      const r = await enregistrerPersonnalisationAction(form);
      if (!r.success) { setMessage({ ok: false, texte: r.error }); return; }
      setP(r.personnalisation);
      setCle((c) => c + 1);
      setMessage({ ok: true, texte: "Enregistré. Vos prochaines quittances porteront cette identité." });
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 pb-24">
      <header>
        <Link href="/dashboard/quittance-express" className="text-sm font-semibold text-slate-600 underline">← Quittance express</Link>
        <h1 className="mt-2 text-2xl font-black text-slate-900">Vos quittances à vos couleurs</h1>
        <p className="mt-1 text-sm text-slate-600">Votre logo et vos coordonnées en tête de quittance. L’empreinte, le QR de vérification et la mention « certifié par QAPRIL » restent en place.</p>
      </header>

      <form onSubmit={enregistrer} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <label className={etiquette} htmlFor="pq-nom">Nom affiché</label>
          <input id="pq-nom" name="nomAffiche" className={champ} defaultValue={p.nomAffiche} maxLength={60} required />
        </div>
        <div>
          <label className={etiquette} htmlFor="pq-logo">Logo (PNG ou JPEG, 500 Ko au plus)</label>
          <input key={cle} id="pq-logo" name="logo" type="file" accept="image/png,image/jpeg" className="block w-full text-sm" />
          {p.logoUrl && (
            <label className="mt-2 flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" name="retirerLogo" value="oui" /> Retirer le logo actuel
            </label>
          )}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div><label className={etiquette} htmlFor="pq-tel">Téléphone</label><input id="pq-tel" name="telephone" className={champ} defaultValue={p.telephone || ""} maxLength={30} /></div>
          <div><label className={etiquette} htmlFor="pq-mail">E-mail</label><input id="pq-mail" name="email" type="email" className={champ} defaultValue={p.email || ""} maxLength={60} /></div>
          <div><label className={etiquette} htmlFor="pq-rccm">RCCM</label><input id="pq-rccm" name="rccm" className={champ} defaultValue={p.rccm || ""} maxLength={40} /></div>
          <div><label className={etiquette} htmlFor="pq-cc">Compte contribuable</label><input id="pq-cc" name="compteContribuable" className={champ} defaultValue={p.compteContribuable || ""} maxLength={30} /></div>
        </div>
        <div>
          <label className={etiquette} htmlFor="pq-adr">Adresse</label>
          <input id="pq-adr" name="adresse" className={champ} defaultValue={p.adresse || ""} maxLength={80} />
        </div>
        <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
          Agrément : {agrement ? <strong>N° {agrement}</strong> : "aucun numéro enregistré"}. Il provient de votre profil d’agence vérifié et ne se saisit pas ici.
        </p>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="actif" value="non" defaultChecked={p.actif === false} /> Suspendre la personnalisation (revenir à l’en-tête QAPRIL)
        </label>

        {message && <p role="status" className={`rounded-lg p-3 text-sm font-semibold ${message.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>{message.texte}</p>}

        <div className="flex flex-wrap gap-3">
          <button disabled={enCours} className="rounded-xl bg-[#FF8200] px-5 py-3 text-sm font-black text-white disabled:opacity-60">{enCours ? "Enregistrement…" : "Enregistrer"}</button>
          <a href={`/api/quittances/apercu?v=${cle}`} target="_blank" className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-800">Voir un aperçu</a>
        </div>
      </form>
    </div>
  );
}
