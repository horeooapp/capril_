"use client";

import React, { useState } from "react";
import { 
    Home, 
    CreditCard, 
    MessageSquare, 
    CheckCircle2, 
    Clock, 
    XCircle, 
    Search,
    ShieldCheck,
    Calendar,
    Phone,
    MapPin
} from "lucide-react";

interface DeclarationsClientTabsProps {
    bauxDeclaratifs: any[];
    declarationsPaiement: any[];
    smsDeclarations: any[];
}

export default function DeclarationsClientTabs({
    bauxDeclaratifs,
    declarationsPaiement,
    smsDeclarations,
}: DeclarationsClientTabsProps) {
    const [activeTab, setActiveTab] = useState<"logements" | "paiements" | "sms">("logements");
    const [searchQuery, setSearchQuery] = useState("");

    // Filtering
    const filteredBaux = bauxDeclaratifs.filter((b) => {
        const q = searchQuery.toLowerCase();
        return (
            (b.nomLocataireDeclare && b.nomLocataireDeclare.toLowerCase().includes(q)) ||
            (b.prenomLocataireDeclare && b.prenomLocataireDeclare.toLowerCase().includes(q)) ||
            (b.telephoneLocataire && b.telephoneLocataire.includes(q)) ||
            (b.descriptionLogement && b.descriptionLogement.toLowerCase().includes(q)) ||
            (b.adresseLibre && b.adresseLibre.toLowerCase().includes(q))
        );
    });

    const filteredPaiements = declarationsPaiement.filter((p) => {
        const q = searchQuery.toLowerCase();
        const tName = `${p.locataire?.firstName || ""} ${p.locataire?.lastName || ""}`.toLowerCase();
        const tPhone = p.locataire?.phone || "";
        const m = (p.moyen || "").toLowerCase();
        const mois = (p.mois || "").toLowerCase();
        return tName.includes(q) || tPhone.includes(q) || m.includes(q) || mois.includes(q);
    });

    const filteredSms = smsDeclarations.filter((s) => {
        const q = searchQuery.toLowerCase();
        const tName = `${s.tenant?.firstName || ""} ${s.tenant?.lastName || ""}`.toLowerCase();
        const tPhone = s.tenant?.phone || "";
        return tName.includes(q) || tPhone.includes(q);
    });

    return (
        <div className="space-y-6">
            {/* Navigation par Onglets */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-2 bg-slate-100 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                        onClick={() => setActiveTab("logements")}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                            activeTab === "logements"
                                ? "bg-white text-slate-900 shadow-sm border border-slate-200/80"
                                : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                        <Home size={15} className="text-amber-600" />
                        <span>Logements Locataires ({bauxDeclaratifs.length})</span>
                    </button>

                    <button
                        onClick={() => setActiveTab("paiements")}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                            activeTab === "paiements"
                                ? "bg-white text-slate-900 shadow-sm border border-slate-200/80"
                                : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                        <CreditCard size={15} className="text-emerald-600" />
                        <span>Règlements Hors-Plateforme ({declarationsPaiement.length})</span>
                    </button>

                    <button
                        onClick={() => setActiveTab("sms")}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                            activeTab === "sms"
                                ? "bg-white text-slate-900 shadow-sm border border-slate-200/80"
                                : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                        <MessageSquare size={15} className="text-sky-600" />
                        <span>Déclarations SMS ({smsDeclarations.length})</span>
                    </button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Rechercher nom, téléphone, commune..."
                        className="w-full sm:w-72 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                    />
                </div>
            </div>

            {/* TAB 1 : LOGEMENTS DÉCLARÉS (BailDeclaratif) */}
            {activeTab === "logements" && (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">
                                Déclarations spontanées de logement (Locataire ➔ Bailleur)
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Logements déclarés par les locataires via l'application avec notification immédiate au propriétaire.
                            </p>
                        </div>
                        <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md">
                            Moteur Adoption IC-01
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                                    <th className="p-4 first:pl-6">Locataire Déclarant</th>
                                    <th className="p-4">Logement & Adresse</th>
                                    <th className="p-4">Loyer Déclaré</th>
                                    <th className="p-4">Statut Bailleur</th>
                                    <th className="p-4 text-right last:pr-6">Date Déclaration</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredBaux.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-slate-400 font-medium">
                                            Aucune déclaration de logement trouvée.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredBaux.map((b) => (
                                        <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="p-4 first:pl-6">
                                                <div className="font-bold text-slate-900">
                                                    {b.prenomLocataireDeclare} {b.nomLocataireDeclare}
                                                </div>
                                                <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
                                                    <Phone size={11} className="text-slate-400" />
                                                    {b.telephoneLocataire}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-semibold text-slate-800 line-clamp-1">
                                                    {b.descriptionLogement}
                                                </div>
                                                <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 line-clamp-1">
                                                    <MapPin size={11} className="text-amber-500 shrink-0" />
                                                    {b.adresseLibre || "Non spécifiée"}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-bold text-slate-900 font-mono text-sm">
                                                    {Number(b.loyerDeclareMensuel || 0).toLocaleString()} F
                                                </div>
                                                <div className="text-[10px] text-slate-400">/ mois</div>
                                            </td>
                                            <td className="p-4">
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                                    b.statut === "CONFIRME"
                                                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                                        : b.statut === "CONTESTE"
                                                        ? "bg-rose-50 text-rose-800 border border-rose-200"
                                                        : "bg-amber-50 text-amber-800 border border-amber-200"
                                                }`}>
                                                    {b.statut === "CONFIRME" && <CheckCircle2 size={12} className="text-emerald-600" />}
                                                    {b.statut === "CONTESTE" && <XCircle size={12} className="text-rose-600" />}
                                                    {b.statut === "PENDING_LOCATAIRE" && <Clock size={12} className="text-amber-600" />}
                                                    <span>
                                                        {b.statut === "CONFIRME" ? "Bail Confirmé" :
                                                         b.statut === "CONTESTE" ? "Contesté" :
                                                         "Attente Bailleur"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right last:pr-6 text-slate-500 font-mono text-[11px]">
                                                {new Date(b.createdAt).toLocaleDateString("fr-FR")}
                                                <br />
                                                <span className="text-[10px] text-slate-400">
                                                    {new Date(b.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 2 : RÈGLEMENTS HORS-PLATEFORME (DeclarationPaiement) */}
            {activeTab === "paiements" && (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">
                                Déclarations de Paiements Hors-Plateforme (« J'ai payé autrement »)
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Règlements déclarés via Wave, Orange Money, MTN, Moov, Espèces ou Virement avec quittance immédiate.
                            </p>
                        </div>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                            Quittance Horodatée
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                                    <th className="p-4 first:pl-6">Locataire</th>
                                    <th className="p-4">Bien & Commune</th>
                                    <th className="p-4">Montant & Période</th>
                                    <th className="p-4">Moyen de Règlement</th>
                                    <th className="p-4">Statut Quittance</th>
                                    <th className="p-4 text-right last:pr-6">Date Règlement</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredPaiements.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center text-slate-400 font-medium">
                                            Aucune déclaration de paiement trouvée.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPaiements.map((p) => {
                                        const tName = p.locataire?.firstName ? `${p.locataire.firstName} ${p.locataire.lastName || ""}` : p.locataire?.phone || "Locataire";
                                        return (
                                            <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                                                <td className="p-4 first:pl-6">
                                                    <div className="font-bold text-slate-900">{tName}</div>
                                                    <div className="text-[11px] text-slate-500 font-mono">{p.locataire?.phone}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-semibold text-slate-800">
                                                        {p.bail?.property?.propertyCode || "Bail actif"}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                                                        <MapPin size={11} className="text-emerald-500" />
                                                        {p.bail?.property?.commune || p.bail?.property?.address || "Commune"}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-bold text-slate-900 font-mono text-sm text-emerald-700">
                                                        {Number(p.montant || 0).toLocaleString()} F
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 capitalize">{p.mois}</div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="inline-flex px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">
                                                        {p.moyen}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                                        p.statut === "CONFIRME"
                                                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                                            : p.statut === "CONTESTE"
                                                            ? "bg-rose-50 text-rose-800 border border-rose-200"
                                                            : "bg-amber-50 text-amber-800 border border-amber-200"
                                                    }`}>
                                                        {p.statut === "CONFIRME" && <CheckCircle2 size={12} className="text-emerald-600" />}
                                                        {p.statut === "CONTESTE" && <XCircle size={12} className="text-rose-600" />}
                                                        {p.statut === "DECLARE" && <Clock size={12} className="text-amber-600" />}
                                                        <span>
                                                            {p.statut === "CONFIRME" ? "Quittance Émise" :
                                                             p.statut === "CONTESTE" ? "Contesté" :
                                                             "À Confirmer"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right last:pr-6 text-slate-500 font-mono text-[11px]">
                                                    {new Date(p.datePaiement || p.createdAt).toLocaleDateString("fr-FR")}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 3 : DÉCLARATIONS SMS */}
            {activeTab === "sms" && (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">
                                Flux Déclaratifs SMS & Messagerie
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Déclarations de loyers transmises par message texte ou canal automatisé.
                            </p>
                        </div>
                        <span className="text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-md">
                            Flux SMS
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                                    <th className="p-4 first:pl-6">Locataire</th>
                                    <th className="p-4">Bien</th>
                                    <th className="p-4">Montant Déclaré</th>
                                    <th className="p-4">Canal</th>
                                    <th className="p-4">Statut</th>
                                    <th className="p-4 text-right last:pr-6">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredSms.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center text-slate-400 font-medium">
                                            Aucune déclaration SMS enregistrée.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSms.map((s) => (
                                        <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="p-4 first:pl-6">
                                                <div className="font-bold text-slate-900">
                                                    {(s.tenant?.firstName ? s.tenant.firstName + " " : "") + (s.tenant?.lastName || "")}
                                                </div>
                                                <div className="text-[11px] text-slate-500 font-mono">{s.tenant?.phone}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-semibold text-slate-800">{s.lease?.property?.propertyCode}</div>
                                                <div className="text-[11px] text-slate-500">{s.lease?.property?.address}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-bold text-slate-900 font-mono text-sm">
                                                    {Number(s.montantDeclare || 0).toLocaleString()} F
                                                </div>
                                            </td>
                                            <td className="p-4 uppercase text-slate-600 font-semibold text-[11px]">{s.canal}</td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                                    s.statut === "CONFIRME"
                                                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                                        : s.statut === "CONTESTE"
                                                        ? "bg-rose-50 text-rose-800 border border-rose-200"
                                                        : "bg-amber-50 text-amber-800 border border-amber-200"
                                                }`}>
                                                    {s.statut}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right last:pr-6 text-slate-500 font-mono text-[11px]">
                                                {new Date(s.createdAt).toLocaleDateString("fr-FR")}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
