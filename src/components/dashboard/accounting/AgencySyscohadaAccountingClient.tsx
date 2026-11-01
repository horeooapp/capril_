"use client";

import React, { useState, useTransition, useMemo } from "react";
import { 
    Calculator, FileText, BookOpen, Scale, ArrowDownRight, ArrowUpRight, 
    Plus, Trash2, Printer, Download, Search, CheckCircle2, AlertTriangle, 
    ShieldCheck, Building2, Landmark, Wallet, DollarSign, RefreshCw, X, Eye
} from "lucide-react";
import { 
    SyscohadaAccountingData, 
    SyscohadaEntryLine, 
    addCustomSyscohadaEntry, 
    deleteCustomSyscohadaEntry 
} from "@/actions/accounting-syscohada";
import { PLAN_COMPTABLE_SYSCOHADA, JOURNAUX_COMPTABLES } from "@/constants/syscohada-plan";

interface Props {
    initialData: SyscohadaAccountingData;
    agencyName?: string;
}

function computeGrandLivreDetails(
    entries: SyscohadaEntryLine[],
    selectedAccountNum: string,
    sensNormal: 'DEBITEUR' | 'CREDITEUR'
) {
    const matching = entries.filter(
        e => e.compteDebit === selectedAccountNum || e.compteCredit === selectedAccountNum
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let accBal = 0;
    let totalD = 0;
    let totalC = 0;
    const list = [];

    for (const e of matching) {
        const isDebit = e.compteDebit === selectedAccountNum;
        const debit = isDebit ? e.montant : 0;
        const credit = !isDebit ? e.montant : 0;
        const contrepartie = isDebit ? e.compteCredit : e.compteDebit;

        totalD += debit;
        totalC += credit;

        if (sensNormal === 'DEBITEUR') {
            accBal += (debit - credit);
        } else {
            accBal += (credit - debit);
        }

        list.push({
            ...e,
            debit,
            credit,
            contrepartie,
            soldeProgressif: accBal
        });
    }

    return {
        computedGLMovements: list,
        totalGLDebit: totalD,
        totalGLCredit: totalC,
        runningBal: accBal
    };
}

export default function AgencySyscohadaAccountingClient({ initialData, agencyName }: Props) {
    const [data, setData] = useState<SyscohadaAccountingData>(initialData);
    const [activeTab, setActiveTab] = useState<'SYNTHESE' | 'JOURNAL' | 'GRAND_LIVRE' | 'BALANCE' | 'RESULTAT_BILAN' | 'PLAN_OHADA'>('SYNTHESE');
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    
    // Filtres Journal
    const [selectedJournal, setSelectedJournal] = useState<string>("ALL");
    const [searchQuery, setSearchQuery] = useState<string>("");

    // Filtres Grand Livre
    const [selectedAccountNum, setSelectedAccountNum] = useState<string>("521200");
    const [grandLivreSearch, setGrandLivreSearch] = useState<string>("");

    // Modal Nouvelle Écriture
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Formulaire d'écriture
    const [formDate, setFormDate] = useState<string>(new Date().toISOString().slice(0, 10));
    const [formJournal, setFormJournal] = useState<string>("BQ_EXPL");
    const [formPiece, setFormPiece] = useState<string>("");
    const [formDebit, setFormDebit] = useState<string>("605100");
    const [formCredit, setFormCredit] = useState<string>("521100");
    const [formLibelle, setFormLibelle] = useState<string>("");
    const [formMontant, setFormMontant] = useState<string>("");

    const fmt = (n: number) => {
        return new Intl.NumberFormat('fr-FR').format(Math.round(n || 0));
    };

    const handleCreateEntry = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        const montantNum = parseFloat(formMontant.replace(/\s/g, ''));
        if (isNaN(montantNum) || montantNum <= 0) {
            setErrorMessage("Veuillez saisir un montant valide supérieur à 0.");
            return;
        }

        if (formDebit === formCredit) {
            setErrorMessage("Le compte au débit doit être différent du compte au crédit.");
            return;
        }

        startTransition(async () => {
            const res = await addCustomSyscohadaEntry({
                date: formDate,
                journalCode: formJournal,
                pieceRef: formPiece || `PIECE-${Date.now().toString().slice(-5)}`,
                compteDebit: formDebit,
                compteCredit: formCredit,
                libelle: formLibelle,
                montant: montantNum
            });

            if (res.success) {
                setIsModalOpen(false);
                setFormLibelle("");
                setFormMontant("");
                setFormPiece("");
                // Recharger la page pour rafraîchir l'agrégat
                window.location.reload();
            } else {
                setErrorMessage(res.error || "Une erreur est survenue.");
            }
        });
    };

    const handleDeleteEntry = (entryId: string) => {
        if (!confirm("Voulez-vous vraiment supprimer cette écriture manuelle ?")) return;

        startTransition(async () => {
            const res = await deleteCustomSyscohadaEntry(entryId);
            if (res.success) {
                window.location.reload();
            } else {
                alert(res.error || "Erreur de suppression");
            }
        });
    };

    // Écritures filtrées pour l'onglet Journal
    const filteredEntries = data.entries.filter(entry => {
        const matchesJournal = selectedJournal === "ALL" || entry.journalCode === selectedJournal;
        const matchesSearch = !searchQuery || 
            entry.libelle.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.pieceRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.compteDebit.includes(searchQuery) ||
            entry.compteCredit.includes(searchQuery);
        return matchesJournal && matchesSearch;
    });

    // Mouvements pour l'onglet Grand Livre
    const grandLivreAccount = PLAN_COMPTABLE_SYSCOHADA.find(c => c.numero === selectedAccountNum) || {
        numero: selectedAccountNum,
        intitule: `Compte ${selectedAccountNum}`,
        sensNormal: 'DEBITEUR' as const,
        description: '',
        classe: parseInt(selectedAccountNum.charAt(0)) || 4,
        categorie: 'ACTIF' as const
    };

    const { computedGLMovements, totalGLDebit, totalGLCredit, runningBal } = useMemo(() => {
        return computeGrandLivreDetails(data.entries, selectedAccountNum, grandLivreAccount.sensNormal);
    }, [data.entries, selectedAccountNum, grandLivreAccount.sensNormal]);

    const exportToCSV = () => {
        const headers = ["ID", "Date", "Journal", "N Piece", "Compte Debit", "Compte Credit", "Libelle", "Montant (FCFA)", "Origine"];
        const rows = data.entries.map(e => [
            e.id,
            e.date,
            e.journalCode,
            `"${e.pieceRef.replace(/"/g, '""')}"`,
            e.compteDebit,
            e.compteCredit,
            `"${e.libelle.replace(/"/g, '""')}"`,
            e.montant,
            e.source
        ]);

        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
            + [headers.join(";"), ...rows.map(r => r.join(";"))].join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `comptabilite_syscohada_${selectedYear}_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="w-full space-y-6 pb-20">
            {/* Header & Global Controls */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-2 border border-emerald-100">
                            <ShieldCheck size={14} className="text-emerald-600" />
                            SYSCOHADA Révisé — Norme OHADA / UEMOA (Côte d'Ivoire)
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <Calculator className="text-emerald-600" size={26} />
                            Comptabilité Générale d'Agence
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            {agencyName ? `Agence : ${agencyName} • ` : ""}Tenue du journal, grand livre, balance 6 colonnes et audit de séquestre mandants.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <select 
                            value={selectedYear} 
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value={2026}>Exercice 2026</option>
                            <option value={2025}>Exercice 2025</option>
                            <option value={2024}>Exercice 2024</option>
                        </select>

                        <button
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
                            title="Imprimer les états comptables"
                        >
                            <Printer size={15} />
                            Imprimer
                        </button>

                        <button
                            onClick={exportToCSV}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
                            title="Exporter en CSV / Excel"
                        >
                            <Download size={15} />
                            Export CSV
                        </button>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition hover:shadow"
                        >
                            <Plus size={16} />
                            Nouvelle Écriture
                        </button>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex items-center gap-1 mt-6 border-b border-slate-200 overflow-x-auto no-scrollbar">
                    {[
                        { id: 'SYNTHESE', label: 'Synthèse & Séquestre', icon: <Landmark size={15} /> },
                        { id: 'JOURNAL', label: 'Journal Général', icon: <FileText size={15} /> },
                        { id: 'GRAND_LIVRE', label: 'Grand Livre', icon: <BookOpen size={15} /> },
                        { id: 'BALANCE', label: 'Balance Générale (6 Col.)', icon: <Scale size={15} /> },
                        { id: 'RESULTAT_BILAN', label: 'Résultat & Bilan OHADA', icon: <DollarSign size={15} /> },
                        { id: 'PLAN_OHADA', label: 'Plan de Comptes SYSCOHADA', icon: <Building2 size={15} /> },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition border-b-2 whitespace-nowrap ${
                                activeTab === tab.id
                                    ? "border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg"
                                    : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                            }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* TAB 1 : SYNTHÈSE & AUDIT SÉQUESTRE MANDANTS */}
            {activeTab === 'SYNTHESE' && (
                <div className="space-y-6">
                    {/* Alerte Audit Séquestre Mandant (Conformité Loi Agences CI) */}
                    <div className={`p-5 rounded-2xl border ${
                        data.rapprochementMandants.conforme
                            ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                            : "bg-rose-50/80 border-rose-200 text-rose-900"
                    }`}>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div className={`p-2.5 rounded-xl ${
                                    data.rapprochementMandants.conforme ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
                                }`}>
                                    {data.rapprochementMandants.conforme ? <ShieldCheck size={24} /> : <AlertTriangle size={24} />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-base">
                                            Rapprochement Séquestre Mandants (Compte 521200 vs 467100)
                                        </h3>
                                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                                            data.rapprochementMandants.conforme ? "bg-emerald-200 text-emerald-900" : "bg-rose-200 text-rose-900"
                                        }`}>
                                            {data.rapprochementMandants.conforme ? "Conforme Décret 2019 CI" : "Alerte Déficit Séquestre"}
                                        </span>
                                    </div>
                                    <p className="text-xs mt-1 text-slate-600">
                                        L'article de loi sur les agences immobilières en Côte d'Ivoire impose la stricte séparation des fonds clients sur un compte séquestre dédié.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 bg-white/70 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-slate-200/60">
                                <div>
                                    <div className="text-[11px] text-slate-500 font-medium">Taux de Couverture</div>
                                    <div className="text-xl font-extrabold text-slate-900">
                                        {data.rapprochementMandants.tauxCouverture}%
                                    </div>
                                </div>
                                <div className="h-8 w-px bg-slate-200" />
                                <div>
                                    <div className="text-[11px] text-slate-500 font-medium">Solde Séquestre Net</div>
                                    <div className={`text-xl font-extrabold ${data.rapprochementMandants.ecartCouverture >= 0 ? "text-emerald-700" : "text-rose-600"}`}>
                                        {fmt(data.rapprochementMandants.ecartCouverture)} FCFA
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-200/60 text-xs">
                            <div className="bg-white p-3 rounded-xl border border-slate-200">
                                <span className="text-slate-500 block">Trésorerie Séquestre (521200 + MoMo) :</span>
                                <strong className="text-sm text-slate-900">{fmt(data.rapprochementMandants.tresorerieMandants)} FCFA</strong>
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-slate-200">
                                <span className="text-slate-500 block">Dettes Bailleurs Loyers (467100) :</span>
                                <strong className="text-sm text-slate-900">{fmt(data.rapprochementMandants.detteBailleurs)} FCFA</strong>
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-slate-200">
                                <span className="text-slate-500 block">Cautions Locatives Détenues (165100) :</span>
                                <strong className="text-sm text-slate-900">{fmt(data.rapprochementMandants.cautionsDetenues)} FCFA</strong>
                            </div>
                        </div>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between text-slate-500 mb-2">
                                <span className="text-xs font-semibold uppercase tracking-wider">Chiffre d'Affaires HT</span>
                                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                                    <DollarSign size={18} />
                                </div>
                            </div>
                            <div className="text-2xl font-black text-slate-900">{fmt(data.kpis.chiffreAffairesHT)} <span className="text-xs font-bold text-slate-400">FCFA</span></div>
                            <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                                <ArrowUpRight size={13} />
                                Honoraires de gestion (Classe 7)
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between text-slate-500 mb-2">
                                <span className="text-xs font-semibold uppercase tracking-wider">Charges d'Exploitation</span>
                                <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                                    <ArrowDownRight size={18} />
                                </div>
                            </div>
                            <div className="text-2xl font-black text-slate-900">{fmt(data.kpis.chargesExploitation)} <span className="text-xs font-bold text-slate-400">FCFA</span></div>
                            <div className="text-[11px] text-slate-500 font-medium mt-1">
                                Dépenses et achats (Classe 6)
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between text-slate-500 mb-2">
                                <span className="text-xs font-semibold uppercase tracking-wider">TVA Facturée (18%)</span>
                                <div className="p-2 bg-sky-50 rounded-xl text-sky-600">
                                    <Landmark size={18} />
                                </div>
                            </div>
                            <div className="text-2xl font-black text-slate-900">{fmt(data.kpis.tvaCollectee)} <span className="text-xs font-bold text-slate-400">FCFA</span></div>
                            <div className="text-[11px] text-slate-500 font-medium mt-1">
                                Compte 443100 — DGI Côte d'Ivoire
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between text-slate-500 mb-2">
                                <span className="text-xs font-semibold uppercase tracking-wider">Résultat Net d'Exploitation</span>
                                <div className={`p-2 rounded-xl ${data.compteResultat.resultatExploitation >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                                    <Scale size={18} />
                                </div>
                            </div>
                            <div className={`text-2xl font-black ${data.compteResultat.resultatExploitation >= 0 ? "text-emerald-700" : "text-rose-600"}`}>
                                {fmt(data.compteResultat.resultatExploitation)} <span className="text-xs font-bold text-slate-400">FCFA</span>
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium mt-1">
                                {data.compteResultat.resultatExploitation >= 0 ? "Bénéfice d'exercice" : "Déficit d'exercice"}
                            </div>
                        </div>
                    </div>

                    {/* Synthèse Trésorerie Actuelle */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Wallet className="text-emerald-600" size={18} />
                            Comptes de Trésorerie et Liquidités Agence
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {[
                                { num: "521100", title: "Banque Exploitation Agence", icon: <Building2 className="text-blue-600" size={18} /> },
                                { num: "521200", title: "Banque Séquestre Mandants", icon: <ShieldCheck className="text-emerald-600" size={18} /> },
                                { num: "531100", title: "Caisse Principale (Guichet)", icon: <Wallet className="text-amber-600" size={18} /> },
                                { num: "571100", title: "Mobile Money (Wave / OM)", icon: <RefreshCw className="text-violet-600" size={18} /> },
                            ].map(acc => {
                                const balanceAcc = data.balance.find(b => b.numero === acc.num);
                                const solde = balanceAcc ? (balanceAcc.totalDebit - balanceAcc.totalCredit) : 0;
                                return (
                                    <div key={acc.num} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 transition">
                                        <div className="flex items-center gap-2 text-slate-600 mb-1">
                                            {acc.icon}
                                            <span className="text-[11px] font-bold">{acc.num}</span>
                                        </div>
                                        <div className="text-xs font-semibold text-slate-700 truncate">{acc.title}</div>
                                        <div className="text-lg font-bold text-slate-900 mt-2">{fmt(solde)} FCFA</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2 : JOURNAL GÉNÉRAL */}
            {activeTab === 'JOURNAL' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                    {/* Filtres du Journal */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                onClick={() => setSelectedJournal("ALL")}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                                    selectedJournal === "ALL" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                            >
                                Tous ({data.entries.length})
                            </button>
                            {JOURNAUX_COMPTABLES.map(j => {
                                const count = data.entries.filter(e => e.journalCode === j.code).length;
                                return (
                                    <button
                                        key={j.code}
                                        onClick={() => setSelectedJournal(j.code)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                                            selectedJournal === j.code ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                        }`}
                                    >
                                        {j.code} ({count})
                                    </button>
                                );
                            })}
                        </div>

                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Rechercher pièce, compte, libellé..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 w-full md:w-64"
                            />
                        </div>
                    </div>

                    {/* Table des Écritures */}
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                                <tr>
                                    <th className="py-3 px-3">Date</th>
                                    <th className="py-3 px-2">Jrn</th>
                                    <th className="py-3 px-3">N° Pièce</th>
                                    <th className="py-3 px-3">Débit</th>
                                    <th className="py-3 px-3">Crédit</th>
                                    <th className="py-3 px-4">Libellé de l'opération</th>
                                    <th className="py-3 px-3 text-right">Débit (FCFA)</th>
                                    <th className="py-3 px-3 text-right">Crédit (FCFA)</th>
                                    <th className="py-3 px-3 text-center">Origine</th>
                                    <th className="py-3 px-2 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredEntries.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="py-8 text-center text-slate-400 italic">
                                            Aucune écriture comptable trouvée pour ces critères.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredEntries.map((e) => (
                                        <tr key={e.id} className="hover:bg-slate-50/70 transition">
                                            <td className="py-2.5 px-3 whitespace-nowrap font-medium text-slate-700">{e.date}</td>
                                            <td className="py-2.5 px-2">
                                                <span className="px-1.5 py-0.5 rounded bg-slate-100 font-bold text-[10px] text-slate-700">
                                                    {e.journalCode}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-3 font-semibold text-slate-900">{e.pieceRef}</td>
                                            <td className="py-2.5 px-3">
                                                <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                                                    {e.compteDebit}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-3">
                                                <span className="font-mono text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded">
                                                    {e.compteCredit}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-4 text-slate-800 max-w-md truncate" title={e.libelle}>
                                                {e.libelle}
                                            </td>
                                            <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">
                                                {fmt(e.montant)}
                                            </td>
                                            <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-800">
                                                {fmt(e.montant)}
                                            </td>
                                            <td className="py-2.5 px-3 text-center">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                    e.source === 'MANUAL' ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"
                                                }`}>
                                                    {e.source === 'MANUAL' ? 'Manuel' : 'Auto'}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-2 text-center">
                                                {e.source === 'MANUAL' && (
                                                    <button
                                                        onClick={() => handleDeleteEntry(e.id)}
                                                        className="text-slate-400 hover:text-rose-600 transition p-1"
                                                        title="Supprimer cette écriture"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                                <tr>
                                    <td colSpan={6} className="py-3 px-4 text-right">TOTAL JOURNAL :</td>
                                    <td className="py-3 px-3 text-right font-mono text-emerald-800">
                                        {fmt(filteredEntries.reduce((acc, e) => acc + e.montant, 0))}
                                    </td>
                                    <td className="py-3 px-3 text-right font-mono text-blue-800">
                                        {fmt(filteredEntries.reduce((acc, e) => acc + e.montant, 0))}
                                    </td>
                                    <td colSpan={2}></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 3 : GRAND LIVRE DES COMPTES */}
            {activeTab === 'GRAND_LIVRE' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                    {/* Sélecteur de Compte */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="w-full md:w-1/2">
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Choisir un compte SYSCOHADA :
                            </label>
                            <select
                                value={selectedAccountNum}
                                onChange={(e) => setSelectedAccountNum(e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                {PLAN_COMPTABLE_SYSCOHADA.map(c => (
                                    <option key={c.numero} value={c.numero}>
                                        {c.numero} — {c.intitule} ({c.categorie})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-4 text-xs">
                            <div className="bg-white px-3 py-2 rounded-xl border border-slate-200">
                                <span className="text-slate-500 block">Sens normal :</span>
                                <strong className="text-slate-900 uppercase">{grandLivreAccount.sensNormal}</strong>
                            </div>
                            <div className="bg-white px-3 py-2 rounded-xl border border-slate-200">
                                <span className="text-slate-500 block">Classe :</span>
                                <strong className="text-slate-900">Classe {grandLivreAccount.classe} ({grandLivreAccount.categorie})</strong>
                            </div>
                        </div>
                    </div>

                    {/* Mouvements du compte sélectionné */}
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                                <tr>
                                    <th className="py-3 px-3">Date</th>
                                    <th className="py-3 px-2">Jrn</th>
                                    <th className="py-3 px-3">N° Pièce</th>
                                    <th className="py-3 px-4">Libellé</th>
                                    <th className="py-3 px-3">Contrepartie</th>
                                    <th className="py-3 px-3 text-right">Débit (FCFA)</th>
                                    <th className="py-3 px-3 text-right">Crédit (FCFA)</th>
                                    <th className="py-3 px-4 text-right">Solde Progressif</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {computedGLMovements.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                                            Aucun mouvement enregistré sur le compte {selectedAccountNum} ({grandLivreAccount.intitule}).
                                        </td>
                                    </tr>
                                ) : (
                                    computedGLMovements.map(m => (
                                        <tr key={m.id} className="hover:bg-slate-50/70 transition">
                                            <td className="py-2.5 px-3 font-medium text-slate-700">{m.date}</td>
                                            <td className="py-2.5 px-2">
                                                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-bold">
                                                    {m.journalCode}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-3 font-semibold text-slate-900">{m.pieceRef}</td>
                                            <td className="py-2.5 px-4 text-slate-800">{m.libelle}</td>
                                            <td className="py-2.5 px-3 font-mono font-bold text-slate-600">{m.contrepartie}</td>
                                            <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                                                {m.debit > 0 ? fmt(m.debit) : "-"}
                                            </td>
                                            <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">
                                                {m.credit > 0 ? fmt(m.credit) : "-"}
                                            </td>
                                            <td className={`py-2.5 px-4 text-right font-mono font-extrabold ${m.soldeProgressif >= 0 ? "text-slate-900" : "text-rose-600"}`}>
                                                {fmt(m.soldeProgressif)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                                <tr>
                                    <td colSpan={5} className="py-3 px-4 text-right">TOTAL COMPTE {selectedAccountNum} :</td>
                                    <td className="py-3 px-3 text-right font-mono text-emerald-800">
                                        {fmt(totalGLDebit)}
                                    </td>
                                    <td className="py-3 px-3 text-right font-mono text-blue-800">
                                        {fmt(totalGLCredit)}
                                    </td>
                                    <td className="py-3 px-4 text-right font-mono font-black text-emerald-900">
                                        {fmt(runningBal)} FCFA
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 4 : BALANCE GÉNÉRALE 6 COLONNES */}
            {activeTab === 'BALANCE' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                    {/* Bannière de Contrôle Débit = Crédit */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 size={20} className="text-emerald-600" />
                            <div>
                                <span className="font-bold text-xs uppercase tracking-wider block">Principe de la Partie Double</span>
                                <span className="text-xs">
                                    Total Débits ({fmt(data.totals.totalDebit)}) = Total Crédits ({fmt(data.totals.totalCredit)}) • Balance parfaitement équilibrée.
                                </span>
                            </div>
                        </div>
                        <span className="text-xs font-bold px-3 py-1 bg-emerald-600 text-white rounded-lg">
                            Équilibrée (Écart: 0)
                        </span>
                    </div>

                    {/* Table de Balance 6 Colonnes */}
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                                <tr>
                                    <th className="py-3 px-3">N° Compte</th>
                                    <th className="py-3 px-4">Intitulé du Compte SYSCOHADA</th>
                                    <th className="py-3 px-3 text-center">Cl.</th>
                                    <th className="py-3 px-3 text-right">Cumul Débit</th>
                                    <th className="py-3 px-3 text-right">Cumul Crédit</th>
                                    <th className="py-3 px-3 text-right">Solde Débiteur</th>
                                    <th className="py-3 px-3 text-right">Solde Créditeur</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data.balance.map(acc => (
                                    <tr key={acc.numero} className="hover:bg-slate-50/70 transition">
                                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{acc.numero}</td>
                                        <td className="py-2.5 px-4 font-medium text-slate-800">{acc.intitule}</td>
                                        <td className="py-2.5 px-3 text-center">
                                            <span className="px-1.5 py-0.5 rounded bg-slate-100 font-bold text-[10px]">
                                                {acc.classe}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-700">
                                            {acc.totalDebit > 0 ? fmt(acc.totalDebit) : "-"}
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-700">
                                            {acc.totalCredit > 0 ? fmt(acc.totalCredit) : "-"}
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">
                                            {acc.soldeDebiteur > 0 ? fmt(acc.soldeDebiteur) : "-"}
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-800">
                                            {acc.soldeCrediteur > 0 ? fmt(acc.soldeCrediteur) : "-"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300">
                                <tr>
                                    <td colSpan={3} className="py-3 px-4 text-right">TOTAUX BALANCE GÉNÉRALE :</td>
                                    <td className="py-3 px-3 text-right font-mono text-emerald-900">{fmt(data.totals.totalDebit)}</td>
                                    <td className="py-3 px-3 text-right font-mono text-blue-900">{fmt(data.totals.totalCredit)}</td>
                                    <td className="py-3 px-3 text-right font-mono text-emerald-900">{fmt(data.totals.totalSoldeDebiteur)}</td>
                                    <td className="py-3 px-3 text-right font-mono text-blue-900">{fmt(data.totals.totalSoldeCrediteur)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 5 : COMPTE DE RÉSULTAT & BILAN SYSCOHADA */}
            {activeTab === 'RESULTAT_BILAN' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Compte de Résultat */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                                <FileText className="text-emerald-600" size={20} />
                                Compte de Résultat SYSCOHADA
                            </h3>
                            <span className="text-xs bg-slate-100 font-bold px-2 py-1 rounded">
                                Exercice {selectedYear}
                            </span>
                        </div>

                        {/* Produits */}
                        <div>
                            <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center justify-between">
                                <span>PRODUITS D'EXPLOITATION (CLASSE 7)</span>
                                <span>{fmt(data.compteResultat.totalProduits)} FCFA</span>
                            </div>
                            <div className="space-y-1.5">
                                {data.compteResultat.produitsDetail.length === 0 ? (
                                    <div className="text-xs text-slate-400 italic">Aucun produit d'exploitation enregistré.</div>
                                ) : (
                                    data.compteResultat.produitsDetail.map(p => (
                                        <div key={p.numero} className="flex items-center justify-between text-xs p-2 rounded-lg bg-emerald-50/40">
                                            <span className="text-slate-700 font-medium">
                                                <strong className="font-mono text-emerald-900">{p.numero}</strong> — {p.intitule}
                                            </span>
                                            <span className="font-mono font-bold text-slate-900">{fmt(p.montant)}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Charges */}
                        <div className="pt-2">
                            <div className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center justify-between">
                                <span>CHARGES D'EXPLOITATION (CLASSE 6)</span>
                                <span>{fmt(data.compteResultat.totalCharges)} FCFA</span>
                            </div>
                            <div className="space-y-1.5">
                                {data.compteResultat.chargesDetail.length === 0 ? (
                                    <div className="text-xs text-slate-400 italic">Aucune charge d'exploitation enregistrée.</div>
                                ) : (
                                    data.compteResultat.chargesDetail.map(c => (
                                        <div key={c.numero} className="flex items-center justify-between text-xs p-2 rounded-lg bg-amber-50/40">
                                            <span className="text-slate-700 font-medium">
                                                <strong className="font-mono text-amber-900">{c.numero}</strong> — {c.intitule}
                                            </span>
                                            <span className="font-mono font-bold text-slate-900">{fmt(c.montant)}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Résultat Net */}
                        <div className={`p-4 rounded-xl border mt-4 flex items-center justify-between ${
                            data.compteResultat.resultatExploitation >= 0
                                ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                                : "bg-rose-50 border-rose-200 text-rose-950"
                        }`}>
                            <div>
                                <span className="text-xs uppercase font-bold block">
                                    {data.compteResultat.resultatExploitation >= 0 ? "Bénéfice Net d'Exploitation (Compte 131)" : "Perte Nette d'Exploitation (Compte 139)"}
                                </span>
                                <span className="text-xs opacity-75">Produits - Charges</span>
                            </div>
                            <span className="text-xl font-black font-mono">
                                {fmt(data.compteResultat.resultatExploitation)} FCFA
                            </span>
                        </div>
                    </div>

                    {/* Bilan Synthétique */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                                <Scale className="text-blue-600" size={20} />
                                Bilan Synthétique SYSCOHADA
                            </h3>
                            <span className="text-xs bg-slate-100 font-bold px-2 py-1 rounded">
                                Actif vs Passif
                            </span>
                        </div>

                        {/* Actif */}
                        <div>
                            <div className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2 flex items-center justify-between">
                                <span>TOTAL ACTIF</span>
                                <span className="font-mono">{fmt(data.bilan.actif.total)} FCFA</span>
                            </div>
                            <div className="space-y-1 text-xs">
                                <div className="flex justify-between p-2 bg-slate-50 rounded">
                                    <span className="text-slate-600">Actif Immobilisé (Cl. 2) :</span>
                                    <span className="font-mono font-bold text-slate-900">{fmt(data.bilan.actif.immobilise)} FCFA</span>
                                </div>
                                <div className="flex justify-between p-2 bg-slate-50 rounded">
                                    <span className="text-slate-600">Actif Circulant (Créances Cl. 4) :</span>
                                    <span className="font-mono font-bold text-slate-900">{fmt(data.bilan.actif.circulant)} FCFA</span>
                                </div>
                                <div className="flex justify-between p-2 bg-slate-50 rounded">
                                    <span className="text-slate-600">Trésorerie Actif (Banques / Caisse Cl. 5) :</span>
                                    <span className="font-mono font-bold text-slate-900">{fmt(data.bilan.actif.tresorerie)} FCFA</span>
                                </div>
                            </div>
                        </div>

                        {/* Passif */}
                        <div className="pt-2">
                            <div className="text-xs font-bold text-purple-900 uppercase tracking-wider mb-2 flex items-center justify-between">
                                <span>TOTAL PASSIF</span>
                                <span className="font-mono">{fmt(data.bilan.passif.total)} FCFA</span>
                            </div>
                            <div className="space-y-1 text-xs">
                                <div className="flex justify-between p-2 bg-slate-50 rounded">
                                    <span className="text-slate-600">Capitaux Propres & Dépôts (Cl. 1) :</span>
                                    <span className="font-mono font-bold text-slate-900">{fmt(data.bilan.passif.capitauxPropres)} FCFA</span>
                                </div>
                                <div className="flex justify-between p-2 bg-slate-50 rounded">
                                    <span className="text-slate-600">Passif Circulant (Dettes Mandants & Tiers Cl. 4) :</span>
                                    <span className="font-mono font-bold text-slate-900">{fmt(data.bilan.passif.passifCirculant)} FCFA</span>
                                </div>
                                <div className="flex justify-between p-2 bg-slate-50 rounded">
                                    <span className="text-slate-600">Trésorerie Passif (Découverts Cl. 5) :</span>
                                    <span className="font-mono font-bold text-slate-900">{fmt(data.bilan.passif.tresoreriePassif)} FCFA</span>
                                </div>
                            </div>
                        </div>

                        {/* Équilibre Bilan */}
                        <div className="p-4 rounded-xl border bg-slate-50 border-slate-200 mt-4 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700">Contrôle Équilibre Actif / Passif</span>
                            <span className="text-xs font-black px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded">
                                Écart : {fmt(data.bilan.equilibre)} FCFA
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 6 : PLAN COMPTABLE SYSCOHADA */}
            {activeTab === 'PLAN_OHADA' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                    <div>
                        <h3 className="font-bold text-base text-slate-900">
                            Nomenclature du Plan Comptable SYSCOHADA Révisé
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Comptes spécifiques aux agences immobilières et administrateurs de biens en zone OHADA.
                        </p>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                                <tr>
                                    <th className="py-3 px-3">N° Compte</th>
                                    <th className="py-3 px-4">Intitulé SYSCOHADA</th>
                                    <th className="py-3 px-2 text-center">Classe</th>
                                    <th className="py-3 px-3">Catégorie</th>
                                    <th className="py-3 px-3">Sens Normal</th>
                                    <th className="py-3 px-4">Application Pratique en Agence</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {PLAN_COMPTABLE_SYSCOHADA.map(c => (
                                    <tr key={c.numero} className="hover:bg-slate-50/70 transition">
                                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-800">{c.numero}</td>
                                        <td className="py-2.5 px-4 font-semibold text-slate-900">{c.intitule}</td>
                                        <td className="py-2.5 px-2 text-center">
                                            <span className="px-1.5 py-0.5 rounded bg-slate-100 font-bold text-[10px]">
                                                {c.classe}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-3">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                                c.categorie === 'PRODUIT' ? 'bg-emerald-100 text-emerald-800' :
                                                c.categorie === 'CHARGE' ? 'bg-amber-100 text-amber-800' :
                                                c.categorie === 'ACTIF' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                            }`}>
                                                {c.categorie}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-3 font-medium text-slate-600">{c.sensNormal}</td>
                                        <td className="py-2.5 px-4 text-slate-600">{c.description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* MODAL NOUVELLE ÉCRITURE */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Nouvelle Écriture Comptable</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Écriture équilibrée selon les normes SYSCOHADA</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {errorMessage && (
                            <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium">
                                {errorMessage}
                            </div>
                        )}

                        <form onSubmit={handleCreateEntry} className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formDate}
                                        onChange={(e) => setFormDate(e.target.value)}
                                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Journal</label>
                                    <select
                                        value={formJournal}
                                        onChange={(e) => setFormJournal(e.target.value)}
                                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                                    >
                                        {JOURNAUX_COMPTABLES.map(j => (
                                            <option key={j.code} value={j.code}>{j.code} - {j.libelle}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">N° Pièce Justificative</label>
                                <input
                                    type="text"
                                    placeholder="Ex: FACT-2026-0042 ou REC-883"
                                    value={formPiece}
                                    onChange={(e) => setFormPiece(e.target.value)}
                                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-emerald-800 mb-1">Compte Débit (+)</label>
                                    <select
                                        value={formDebit}
                                        onChange={(e) => setFormDebit(e.target.value)}
                                        className="w-full text-xs bg-emerald-50/50 border border-emerald-200 rounded-xl px-2.5 py-2 font-mono font-bold text-emerald-900 outline-none focus:ring-2 focus:ring-emerald-500"
                                    >
                                        {PLAN_COMPTABLE_SYSCOHADA.map(c => (
                                            <option key={c.numero} value={c.numero}>{c.numero} - {c.intitule}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-blue-800 mb-1">Compte Crédit (-)</label>
                                    <select
                                        value={formCredit}
                                        onChange={(e) => setFormCredit(e.target.value)}
                                        className="w-full text-xs bg-blue-50/50 border border-blue-200 rounded-xl px-2.5 py-2 font-mono font-bold text-blue-900 outline-none focus:ring-2 focus:ring-emerald-500"
                                    >
                                        {PLAN_COMPTABLE_SYSCOHADA.map(c => (
                                            <option key={c.numero} value={c.numero}>{c.numero} - {c.intitule}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Libellé de l'écriture</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Achat fournitures bureau agence ou Régularisation"
                                    value={formLibelle}
                                    onChange={(e) => setFormLibelle(e.target.value)}
                                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Montant (FCFA)</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    placeholder="Montant en FCFA"
                                    value={formMontant}
                                    onChange={(e) => setFormMontant(e.target.value)}
                                    className="w-full text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                                />
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50"
                                >
                                    {isPending ? "Enregistrement..." : "Valider l'Écriture"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

