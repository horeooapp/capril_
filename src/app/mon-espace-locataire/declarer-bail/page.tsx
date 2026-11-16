"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Coins, 
  FileText, 
  Navigation, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck,
  Info
} from "lucide-react";
import Link from "next/link";

const COMMUNES_CI = [
  "Abobo", "Adjamé", "Attécoubé", "Cocody", "Koumassi", 
  "Marcory", "Plateau", "Port-Bouët", "Treichville", "Yopougon",
  "Bingerville", "Songon", "Grand-Bassam", "Bouaké", "Yamoussoukro", 
  "San-Pédro", "Korhogo", "Daloa", "Autre commune"
];

const TYPES_BIEN = [
  "Studio",
  "Appartement 2 pièces",
  "Appartement 3 pièces",
  "Appartement 4 pièces et +",
  "Villa basse",
  "Villa duplex",
  "Cour commune",
  "Magasin / Local commercial"
];

export default function DeclarerBailPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  const [destinataireTel, setDestinataireTel] = useState("");
  const [commune, setCommune] = useState("Cocody");
  const [quartier, setQuartier] = useState("");
  const [repere, setRepere] = useState("");
  const [typeBien, setTypeBien] = useState("Appartement 3 pièces");
  const [loyerDeclare, setLoyerDeclare] = useState("");
  const [bailPapierExiste, setBailPapierExiste] = useState(true);
  const [gps, setGps] = useState<{ lat: number; lng: number; precision?: number } | null>(null);
  const [capturingGps, setCapturingGps] = useState(false);

  const handleCaptureGps = () => {
    if (!navigator.geolocation) {
      toast.error("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }
    setCapturingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          precision: pos.coords.accuracy
        });
        setCapturingGps(false);
        toast.success("Position GPS capturée avec succès.");
      },
      (err) => {
        setCapturingGps(false);
        toast.info("Position non capturée. Elle reste facultative selon la règle RG-DCL-08.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!destinataireTel || !loyerDeclare || !commune) {
      toast.error("Veuillez renseigner le numéro du bailleur/gestionnaire, la commune et le montant du loyer.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/v1/declarations-bail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinataireTel,
          commune,
          quartier,
          repere,
          typeBien,
          loyerDeclare: parseFloat(loyerDeclare.replace(/\s+/g, "")),
          bailPapierExiste,
          gps
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la déclaration");
      }

      setSuccessData(data.data);
      toast.success("Votre bail a été déclaré ! Une invitation a été transmise au bailleur.");
    } catch (err: any) {
      toast.error(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-lg w-full rounded-3xl p-8 border border-slate-200/80 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.08)] text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 size={36} />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
              Déclaration active · ADD-28
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Bail Déclaré avec Succès !
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              Nous avons invité votre bailleur ({destinataireTel}) à confirmer votre relation locative par WhatsApp / SMS.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Logement déclaré :</span>
              <span className="font-bold text-slate-800">{typeBien} — {commune}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Loyer mensuel :</span>
              <span className="font-black text-slate-900 font-mono">{parseInt(loyerDeclare).toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Contrat existant :</span>
              <span className="font-bold text-slate-700">{bailPapierExiste ? "Bail papier existant" : "Sans contrat écrit"}</span>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60 text-left flex gap-2.5 items-start text-[11px] text-amber-900">
            <Info size={16} className="shrink-0 text-amber-700 mt-0.5" />
            <p>
              Dès que votre bailleur répondra <strong>« Oui »</strong>, vos quittances seront débloquées et vous pourrez télécharger votre fiche de bail.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/mon-espace-locataire"
              className="flex-1 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all shadow-sm"
            >
              Retour à mon tableau de bord
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Navigation retour */}
        <Link 
          href="/mon-espace-locataire"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={14} /> Retour à mon espace
        </Link>

        {/* En-tête */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] space-y-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-700">
            <Sparkles size={14} />
            <span>Parcours Autonome · ADD-28</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Je déclare mon bail
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">
            Vous occupez déjà un logement ? Indiquez simplement à qui vous payez votre loyer.
            Votre bailleur recevra une invitation pour confirmer en un clic sans friction.
          </p>
        </div>

        {/* Formulaire déclaratif conforme RG-DCL-08 */}
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] space-y-6">
          {/* 1. Contact Bailleur */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Phone size={13} className="text-emerald-600" />
              <span>Numéro de téléphone du bailleur ou de l'agence *</span>
            </label>
            <input
              type="tel"
              required
              value={destinataireTel}
              onChange={(e) => setDestinataireTel(e.target.value)}
              placeholder="Ex: 0708091011 ou +225 0500..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
            <p className="text-[11px] text-slate-400">
              La personne physique ou le gestionnaire à qui vous réglez vos loyers chaque mois.
            </p>
          </div>

          {/* 2. Désignation du Logement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <MapPin size={13} className="text-emerald-600" />
                <span>Commune *</span>
              </label>
              <select
                value={commune}
                onChange={(e) => setCommune(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              >
                {COMMUNES_CI.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                Quartier
              </label>
              <input
                type="text"
                value={quartier}
                onChange={(e) => setQuartier(e.target.value)}
                placeholder="Ex: Angré 8e Tranche, Maroc, Niangon..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Repère géographique & Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                Repère ou précision d'adresse
              </label>
              <input
                type="text"
                value={repere}
                onChange={(e) => setRepere(e.target.value)}
                placeholder="Ex: Face pharmacie, Carrefour Duncan..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Building2 size={13} className="text-emerald-600" />
                <span>Type de logement *</span>
              </label>
              <select
                value={typeBien}
                onChange={(e) => setTypeBien(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              >
                {TYPES_BIEN.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Loyer mensuel */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Coins size={13} className="text-emerald-600" />
              <span>Loyer mensuel hors charges (FCFA) *</span>
            </label>
            <input
              type="number"
              required
              min="5000"
              step="500"
              value={loyerDeclare}
              onChange={(e) => setLoyerDeclare(e.target.value)}
              placeholder="Ex: 80000"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* 4. Existence d'un bail papier (RG-DCL-08 d) */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
            <label className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <FileText size={15} className="text-emerald-700" />
              <span>Disposez-vous d'un contrat de bail papier déjà signé ?</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setBailPapierExiste(true)}
                className={`py-3 px-4 rounded-xl text-xs font-bold transition-all border ${
                  bailPapierExiste
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                Oui, j'ai un bail papier
              </button>
              <button
                type="button"
                onClick={() => setBailPapierExiste(false)}
                className={`py-3 px-4 rounded-xl text-xs font-bold transition-all border ${
                  !bailPapierExiste
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                Non, accord verbal
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              {bailPapierExiste
                ? "Votre bail papier sera conservé comme pièce et générera une Fiche de bail indicative (RG-DCL-17)."
                : "Un projet de bail numérique QAPRIL conforme à la Loi 2019-576 sera automatiquement préparé pour signature électronique."}
            </p>
          </div>

          {/* 5. Position GPS facultative */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Navigation size={14} className={gps ? "text-emerald-600" : "text-slate-400"} />
              <span>
                {gps
                  ? `Position GPS capturée (${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)})`
                  : "Position GPS facultative (si vous êtes dans le logement)"}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCaptureGps}
              disabled={capturingGps}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg transition-all"
            >
              {capturingGps ? "Recherche..." : (gps ? "Actualiser" : "Capturer GPS")}
            </button>
          </div>

          {/* Bouton de soumission */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-wider text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Envoi de la déclaration...</span>
            ) : (
              <>
                <ShieldCheck size={16} />
                <span>Envoyer ma déclaration de bail</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
