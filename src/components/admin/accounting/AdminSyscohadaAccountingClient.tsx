"use client";

import React, { useState, useTransition, useMemo } from "react";
import { 
    Calculator, FileText, BookOpen, Scale, ArrowDownRight, ArrowUpRight, 
    Plus, Trash2, Printer, Download, Search, CheckCircle2, AlertTriangle, 
    ShieldCheck, Building2, Landmark, Wallet, DollarSign, RefreshCw, X, Eye, Filter
} from "lucide-react";
import { 
    SyscohadaAccountingData, 
    SyscohadaEntryLine, 
    addCustomSyscohadaEntry, 
    deleteCustomSyscohadaEntry,
    getAgencyAccountingData
} from "@/actions/accounting-syscohada";
import { PLAN_COMPTABLE_SYSCOHADA, JOURNAUX_COMPTABLES } from "@/constants/syscohada-plan";
import ManagementReport from "@/components/reports/ManagementReport";

interface AgencyItem {
    id: string;
    name: string;
    email?: string;
}

interface Props {
    initialData: SyscohadaAccountingData;
    agenciesList: AgencyItem[];
    reportData?: any;
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

export default function AdminSyscohadaAccountingClient({ initialData, agenciesList, reportData }: Props) {
    const [data, setData] = useState<SyscohadaAccountingData>(initialData);
    const [activeTab, setActiveTab] = useState<'SYNTHESE' | 'JOURNAL' | 'GRAND_LIVRE' | 'BALANCE' | 'RESULTAT_BILAN' | 'GESTION_BAUX' | 'PLAN_OHADA'>('SYNTHESE');
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedAgencyId, setSelectedAgencyId] = useState<string>("ALL");
    
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

    // Recharger les données quand l'agence ou l'année change
    const reloadData = (year: number, agencyId: string) => {
        startTransition(async () => {
            const res = await getAgencyAccountingData(year, agencyId);
            if (res.success && res.data) {
                setData(res.data);
            }
        });
    };

    const handleAgencyChange = (agencyId: string) => {
        setSelectedAgencyId(agencyId);
        reloadData(selectedYear, agencyId);
    };

    const handleYearChange = (year: number) => {
        setSelectedYear(year);
        reloadData(year, selectedAgencyId);
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
                montant: montantNum,
                targetAgencyId: selectedAgencyId
            });

            if (res.success) {
                setIsModalOpen(false);
                setFormLibelle("");
                setFormMontant("");
                setFormPiece("");
                reloadData(selectedYear, selectedAgencyId);
            } else {
                setErrorMessage(res.error || "Une erreur est survenue.");
            }
        });
    };

    const handleDeleteEntry = (entryId: string) => {
        if (!confirm("Voulez-vous vraiment supprimer cette écriture manuelle ?")) return;
        startTransition(async () => {
            const res = await deleteCustomSyscohadaEntry(entryId, selectedAgencyId);
            if (res.success) {
                reloadData(selectedYear, selectedAgencyId);
            } else {
                alert(res.error || "Impossible de supprimer l'écriture.");
            }
        });
    };

    // Filtre des écritures pour le Journal
    const filteredEntries = useMemo(() => {
        return data.entries.filter(e => {
            const matchJournal = selectedJournal === "ALL" || e.journalCode === selectedJournal;
            const matchSearch = !searchQuery.trim() || 
                e.libelle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                e.pieceRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
                e.compteDebit.includes(searchQuery) ||
                e.compteCredit.includes(searchQuery);
            return matchJournal && matchSearch;
        });
    }, [data.entries, selectedJournal, searchQuery]);

    // Calcul du Grand Livre
    const grandLivreData = useMemo(() => {
        const found = PLAN_COMPTABLE_SYSCOHADA.find(c => c.numero === selectedAccountNum);
        const sensNormal = found?.sensNormal || (selectedAccountNum.startsWith("6") || selectedAccountNum.startsWith("2") || selectedAccountNum.startsWith("5") ? 'DEBITEUR' : 'CREDITEUR');
        return computeGrandLivreDetails(data.entries, selectedAccountNum, sensNormal);
    }, [data.entries, selectedAccountNum]);

    // Filtrage des comptes pour le sélecteur du Grand Livre
    const accountsInGrandLivre = useMemo(() => {
        return PLAN_COMPTABLE_SYSCOHADA.filter(c => {
            if (!grandLivreSearch.trim()) return true;
            return c.numero.includes(grandLivreSearch) || c.intitule.toLowerCase().includes(grandLivreSearch.toLowerCase());
        });
    }, [grandLivreSearch]);

    // Nom de l'entité affichée
    const currentEntityName = useMemo(() => {
        if (selectedAgencyId === "ALL") return "Ensemble du Parc QAPRIL (Consolidation Nationale)";
        const agency = agenciesList.find(a => a.id === selectedAgencyId);
        return agency ? agency.name : "Agence Immobilière";
    }, [selectedAgencyId, agenciesList]);

    // Export CSV
    const exportCSV = () => {
        const headers = ["Date", "Journal", "Piece", "Compte Debit", "Compte Credit", "Libelle", "Montant (XOF)", "Source"];
        const rows = data.entries.map(e => [
            `"${e.date}"`,
            `"${e.journalCode}"`,
            `"${e.pieceRef.replace(/"/g, '""')}"`,
            `"${e.compteDebit}"`,
            `"${e.compteCredit}"`,
            `"${e.libelle.replace(/"/g, '""')}"`,
            e.montant,
            `"${e.source}"`
        ]);

        const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map(r => r.join(";"))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `comptabilite_syscohada_${selectedAgencyId}_${selectedYear}_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "20px 24px", fontFamily: "var(--font-body, system-ui)" }}>
            {/* Header avec Sélecteurs d'Agence et d'Année */}
            <div style={{ 
                background: "#FFFFFF", 
                borderRadius: "16px", 
                padding: "24px 28px", 
                border: "1px solid #E2E8F0",
                boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
                marginBottom: "24px"
            }}>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "20px" }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                            <div style={{
                                width: "42px",
                                height: "42px",
                                borderRadius: "10px",
                                background: "#FFF4ED",
                                color: "#FF6600",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: "1px solid #FFD8BE"
                            }}>
                                <Calculator size={22} />
                            </div>
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <h1 style={{ fontSize: "22px", fontWeight: "900", color: "#0F172A", margin: 0, textTransform: "uppercase", letterSpacing: "-0.5px" }}>
                                        Comptabilité Générale SYSCOHADA
                                    </h1>
                                    <span style={{
                                        fontSize: "11px",
                                        fontWeight: "800",
                                        background: "#E0E7FF",
                                        color: "#3730A3",
                                        padding: "3px 8px",
                                        borderRadius: "6px"
                                    }}>
                                        NORMES OHADA-UEMOA
                                    </span>
                                </div>
                                <p style={{ fontSize: "13px", color: "#64748B", margin: 0 }}>
                                    Vue consolidée de l'administration : {currentEntityName}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Sélecteurs et Actions */}
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px" }}>
                        {/* Sélecteur d'Agence */}
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <Building2 size={16} style={{ color: "#64748B" }} />
                            <select
                                value={selectedAgencyId}
                                onChange={(e) => handleAgencyChange(e.target.value)}
                                style={{
                                    padding: "8px 12px",
                                    borderRadius: "8px",
                                    border: "1px solid #CBD5E1",
                                    fontSize: "13px",
                                    fontWeight: "600",
                                    color: "#1E293B",
                                    backgroundColor: "#FFFFFF",
                                    outline: "none",
                                    cursor: "pointer",
                                    minWidth: "220px"
                                }}
                            >
                                <option value="ALL">🏢 Consolidation Nationale (Tout le parc)</option>
                                <optgroup label="Agences Immobilières Agréées">
                                    {agenciesList.map(a => (
                                        <option key={a.id} value={a.id}>
                                            {a.name}
                                        </option>
                                    ))}
                                </optgroup>
                            </select>
                        </div>

                        {/* Sélecteur d'Année */}
                        <select
                            value={selectedYear}
                            onChange={(e) => handleYearChange(parseInt(e.target.value, 10))}
                            style={{
                                padding: "8px 12px",
                                borderRadius: "8px",
                                border: "1px solid #CBD5E1",
                                fontSize: "13px",
                                fontWeight: "700",
                                color: "#1E293B",
                                backgroundColor: "#FFFFFF",
                                outline: "none",
                                cursor: "pointer"
                            }}
                        >
                            {[2026, 2025, 2024].map(y => (
                                <option key={y} value={y}>Exercice {y}</option>
                            ))}
                        </select>

                        {/* Bouton Export CSV */}
                        <button
                            onClick={exportCSV}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "8px 14px",
                                borderRadius: "8px",
                                border: "1px solid #CBD5E1",
                                background: "#FFFFFF",
                                color: "#334155",
                                fontWeight: "600",
                                fontSize: "13px",
                                cursor: "pointer"
                            }}
                        >
                            <Download size={14} /> Export CSV
                        </button>

                        {/* Bouton Print */}
                        <button
                            onClick={() => window.print()}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "8px 14px",
                                borderRadius: "8px",
                                border: "1px solid #CBD5E1",
                                background: "#FFFFFF",
                                color: "#334155",
                                fontWeight: "600",
                                fontSize: "13px",
                                cursor: "pointer"
                            }}
                        >
                            <Printer size={14} /> Imprimer
                        </button>

                        {/* Bouton Nouvelle Écriture */}
                        <button
                            onClick={() => setIsModalOpen(true)}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "8px 16px",
                                borderRadius: "8px",
                                background: "#FF6600",
                                color: "#FFFFFF",
                                fontWeight: "700",
                                fontSize: "13px",
                                border: "none",
                                cursor: "pointer",
                                boxShadow: "0 2px 4px rgba(255,102,0,0.25)"
                            }}
                        >
                            <Plus size={16} /> Écriture Manuelle
                        </button>
                    </div>
                </div>

                {/* Onglets de navigation */}
                <div style={{ 
                    display: "flex", 
                    gap: "8px", 
                    marginTop: "20px", 
                    borderTop: "1px solid #F1F5F9", 
                    paddingTop: "16px",
                    overflowX: "auto"
                }}>
                    {[
                        { id: 'SYNTHESE', label: 'Tableau de Bord & KPIs', icon: <Landmark size={15} /> },
                        { id: 'JOURNAL', label: 'Journal des Écritures', icon: <FileText size={15} /> },
                        { id: 'GRAND_LIVRE', label: 'Grand Livre des Comptes', icon: <BookOpen size={15} /> },
                        { id: 'BALANCE', label: 'Balance Générale (6 colonnes)', icon: <Scale size={15} /> },
                        { id: 'RESULTAT_BILAN', label: 'Compte de Résultat & Bilan', icon: <Calculator size={15} /> },
                        { id: 'GESTION_BAUX', label: 'Synthèse Bailleurs & Baux', icon: <Building2 size={15} /> },
                        { id: 'PLAN_OHADA', label: 'Plan Comptable Révisé', icon: <ShieldCheck size={15} /> },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "10px 16px",
                                borderRadius: "8px",
                                border: "none",
                                background: activeTab === tab.id ? "#0F172A" : "transparent",
                                color: activeTab === tab.id ? "#FFFFFF" : "#64748B",
                                fontWeight: activeTab === tab.id ? "700" : "600",
                                fontSize: "13px",
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                                transition: "all 0.15s ease"
                            }}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* TAB 1 : SYNTHÈSE & KPIS */}
            {activeTab === 'SYNTHESE' && (
                <div>
                    {/* Alerte Garantie Mandants / Séquestre */}
                    <div style={{
                        background: data.rapprochementMandants.conforme ? "#F0FDF4" : "#FEF2F2",
                        border: `1px solid ${data.rapprochementMandants.conforme ? "#BBF7D0" : "#FECACA"}`,
                        borderRadius: "14px",
                        padding: "20px 24px",
                        marginBottom: "24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "16px"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                            {data.rapprochementMandants.conforme ? (
                                <CheckCircle2 size={32} style={{ color: "#16A34A" }} />
                            ) : (
                                <AlertTriangle size={32} style={{ color: "#DC2626" }} />
                            )}
                            <div>
                                <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: "800", color: data.rapprochementMandants.conforme ? "#166534" : "#991B1B" }}>
                                    {data.rapprochementMandants.conforme
                                        ? "Conformité de Garantie Mandants : Validée (Séparation des Fonds Respectée)"
                                        : "Alerte Séquestre : Déficit de Couverture des Fonds Mandants"}
                                </h3>
                                <p style={{ margin: 0, fontSize: "13px", color: data.rapprochementMandants.conforme ? "#15803D" : "#B91C1C" }}>
                                    Trésorerie Séquestre (521200 + 571100) : <strong>{fmt(data.rapprochementMandants.tresorerieMandants)} XOF</strong> • 
                                    Dettes Exigibles Mandants (Bailleurs + Cautions) : <strong>{fmt(data.rapprochementMandants.totalExigibleMandants)} XOF</strong> • 
                                    Taux de couverture : <strong>{data.rapprochementMandants.tauxCouverture}%</strong>
                                </p>
                            </div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "#64748B" }}>
                                Écart Net de Trésorerie
                            </div>
                            <div style={{ fontSize: "20px", fontWeight: "900", color: data.rapprochementMandants.conforme ? "#16A34A" : "#DC2626" }}>
                                {data.rapprochementMandants.ecartCouverture >= 0 ? "+" : ""}{fmt(data.rapprochementMandants.ecartCouverture)} XOF
                            </div>
                        </div>
                    </div>

                    {/* Grille de KPIs */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "18px", marginBottom: "28px" }}>
                        <div style={{ background: "#FFFFFF", padding: "20px", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
                            <div style={{ fontSize: "12px", fontWeight: "700", color: "#64748B", textTransform: "uppercase", marginBottom: "6px" }}>
                                Loyers Bruts Encaissés
                            </div>
                            <div style={{ fontSize: "24px", fontWeight: "900", color: "#0F172A" }}>
                                {fmt(data.kpis.loyersEncaisses)} <span style={{ fontSize: "13px", fontWeight: "600", color: "#64748B" }}>XOF</span>
                            </div>
                            <div style={{ fontSize: "11px", color: "#16A34A", marginTop: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
                                <ArrowUpRight size={13} /> Collectés via quittances validées
                            </div>
                        </div>

                        <div style={{ background: "#FFFFFF", padding: "20px", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
                            <div style={{ fontSize: "12px", fontWeight: "700", color: "#64748B", textTransform: "uppercase", marginBottom: "6px" }}>
                                Honoraires de Gestion HT
                            </div>
                            <div style={{ fontSize: "24px", fontWeight: "900", color: "#FF6600" }}>
                                {fmt(data.kpis.chiffreAffairesHT)} <span style={{ fontSize: "13px", fontWeight: "600", color: "#64748B" }}>XOF</span>
                            </div>
                            <div style={{ fontSize: "11px", color: "#64748B", marginTop: "6px" }}>
                                Chiffre d'Affaires d'exploitation (Cpt 706100)
                            </div>
                        </div>

                        <div style={{ background: "#FFFFFF", padding: "20px", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
                            <div style={{ fontSize: "12px", fontWeight: "700", color: "#64748B", textTransform: "uppercase", marginBottom: "6px" }}>
                                TVA Facturée 18% (État)
                            </div>
                            <div style={{ fontSize: "24px", fontWeight: "900", color: "#2563EB" }}>
                                {fmt(data.kpis.tvaCollectee)} <span style={{ fontSize: "13px", fontWeight: "600", color: "#64748B" }}>XOF</span>
                            </div>
                            <div style={{ fontSize: "11px", color: "#64748B", marginTop: "6px" }}>
                                Compte 443100 (TVA exigible UEMOA)
                            </div>
                        </div>

                        <div style={{ background: "#FFFFFF", padding: "20px", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
                            <div style={{ fontSize: "12px", fontWeight: "700", color: "#64748B", textTransform: "uppercase", marginBottom: "6px" }}>
                                Cautions Séquestrées
                            </div>
                            <div style={{ fontSize: "24px", fontWeight: "900", color: "#7C3AED" }}>
                                {fmt(data.rapprochementMandants.cautionsDetenues)} <span style={{ fontSize: "13px", fontWeight: "600", color: "#64748B" }}>XOF</span>
                            </div>
                            <div style={{ fontSize: "11px", color: "#64748B", marginTop: "6px" }}>
                                Dépôts locataires (Compte 165100 / CDC-CI)
                            </div>
                        </div>
                    </div>

                    {/* Résumé d'Exploitation */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                        <div style={{ background: "#FFFFFF", padding: "24px", borderRadius: "14px", border: "1px solid #E2E8F0" }}>
                            <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0F172A", marginTop: 0, marginBottom: "16px" }}>
                                Performance & Résultat Net
                            </h3>
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F1F5F9" }}>
                                <span style={{ fontSize: "13px", color: "#64748B" }}>Total Produits d'Exploitation (Classe 7)</span>
                                <strong style={{ fontSize: "14px", color: "#16A34A" }}>+{fmt(data.compteResultat.totalProduits)} XOF</strong>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F1F5F9" }}>
                                <span style={{ fontSize: "13px", color: "#64748B" }}>Total Charges d'Exploitation (Classe 6)</span>
                                <strong style={{ fontSize: "14px", color: "#DC2626" }}>-{fmt(data.compteResultat.totalCharges)} XOF</strong>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0 0 0" }}>
                                <span style={{ fontSize: "14px", fontWeight: "800", color: "#0F172A" }}>Résultat d'Exploitation Net</span>
                                <strong style={{ fontSize: "18px", fontWeight: "900", color: data.compteResultat.resultatExploitation >= 0 ? "#16A34A" : "#DC2626" }}>
                                    {data.compteResultat.resultatExploitation >= 0 ? "+" : ""}{fmt(data.compteResultat.resultatExploitation)} XOF
                                </strong>
                            </div>
                        </div>

                        <div style={{ background: "#FFFFFF", padding: "24px", borderRadius: "14px", border: "1px solid #E2E8F0" }}>
                            <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0F172A", marginTop: 0, marginBottom: "16px" }}>
                                Équilibre du Bilan SYSCOHADA
                            </h3>
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F1F5F9" }}>
                                <span style={{ fontSize: "13px", color: "#64748B" }}>Total Actif (Immobilisé + Circulant + Trésorerie)</span>
                                <strong style={{ fontSize: "14px", color: "#0F172A" }}>{fmt(data.bilan.actif.total)} XOF</strong>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F1F5F9" }}>
                                <span style={{ fontSize: "13px", color: "#64748B" }}>Total Passif (Capitaux + Dettes + Trésorerie)</span>
                                <strong style={{ fontSize: "14px", color: "#0F172A" }}>{fmt(data.bilan.passif.total)} XOF</strong>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0 0 0" }}>
                                <span style={{ fontSize: "14px", fontWeight: "800", color: "#0F172A" }}>Statut d'Équilibrage</span>
                                <span style={{
                                    fontSize: "12px",
                                    fontWeight: "800",
                                    padding: "4px 10px",
                                    borderRadius: "8px",
                                    background: data.totals.isEquilibree ? "#DCFCE7" : "#FEE2E2",
                                    color: data.totals.isEquilibree ? "#166534" : "#991B1B"
                                }}>
                                    {data.totals.isEquilibree ? "ÉQUILIBRÉ (Débit = Crédit)" : `Écart : ${fmt(data.bilan.equilibre)} XOF`}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2 : JOURNAL DES ÉCRITURES */}
            {activeTab === 'JOURNAL' && (
                <div style={{ background: "#FFFFFF", borderRadius: "14px", padding: "24px", border: "1px solid #E2E8F0" }}>
                    {/* Filtres du Journal */}
                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
                            <div style={{ position: "relative" }}>
                                <Search size={15} style={{ position: "absolute", left: "10px", top: "10px", color: "#94A3B8" }} />
                                <input
                                    type="text"
                                    placeholder="Rechercher libellé, pièce, compte..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{
                                        padding: "8px 12px 8px 32px",
                                        borderRadius: "8px",
                                        border: "1px solid #CBD5E1",
                                        fontSize: "13px",
                                        width: "280px",
                                        outline: "none"
                                    }}
                                />
                            </div>

                            <select
                                value={selectedJournal}
                                onChange={(e) => setSelectedJournal(e.target.value)}
                                style={{
                                    padding: "8px 12px",
                                    borderRadius: "8px",
                                    border: "1px solid #CBD5E1",
                                    fontSize: "13px",
                                    color: "#334155",
                                    outline: "none"
                                }}
                            >
                                <option value="ALL">Tous les Journaux</option>
                                {JOURNAUX_COMPTABLES.map(j => (
                                    <option key={j.code} value={j.code}>{j.code} - {j.libelle}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ fontSize: "13px", color: "#64748B" }}>
                            {filteredEntries.length} écriture(s) affichée(s)
                        </div>
                    </div>

                    {/* Table du Journal */}
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                            <thead>
                                <tr style={{ background: "#F8FAFC", borderBottom: "2px solid #E2E8F0", textAlign: "left", color: "#475569" }}>
                                    <th style={{ padding: "10px 12px" }}>Date</th>
                                    <th style={{ padding: "10px 12px" }}>Jrn</th>
                                    <th style={{ padding: "10px 12px" }}>N° Pièce</th>
                                    <th style={{ padding: "10px 12px" }}>Débit</th>
                                    <th style={{ padding: "10px 12px" }}>Crédit</th>
                                    <th style={{ padding: "10px 12px" }}>Libellé de l'Écriture</th>
                                    <th style={{ padding: "10px 12px", textAlign: "right" }}>Montant (XOF)</th>
                                    <th style={{ padding: "10px 12px", textAlign: "center" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEntries.map((e, idx) => (
                                    <tr key={e.id} style={{ borderBottom: "1px solid #F1F5F9", background: idx % 2 === 0 ? "#FFFFFF" : "#FAFAFA" }}>
                                        <td style={{ padding: "10px 12px", whiteSpace: "nowrap", color: "#64748B" }}>{e.date}</td>
                                        <td style={{ padding: "10px 12px" }}>
                                            <span style={{ fontSize: "10px", fontWeight: "800", background: "#F1F5F9", padding: "2px 6px", borderRadius: "4px" }}>
                                                {e.journalCode}
                                            </span>
                                        </td>
                                        <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: "12px", color: "#334155" }}>{e.pieceRef}</td>
                                        <td style={{ padding: "10px 12px", fontWeight: "700", color: "#2563EB" }}>{e.compteDebit}</td>
                                        <td style={{ padding: "10px 12px", fontWeight: "700", color: "#7C3AED" }}>{e.compteCredit}</td>
                                        <td style={{ padding: "10px 12px", color: "#1E293B" }}>{e.libelle}</td>
                                        <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: "800", color: "#0F172A" }}>{fmt(e.montant)}</td>
                                        <td style={{ padding: "10px 12px", textAlign: "center" }}>
                                            {e.source === "MANUAL" ? (
                                                <button
                                                    onClick={() => handleDeleteEntry(e.id)}
                                                    title="Supprimer écriture manuelle"
                                                    style={{ border: "none", background: "transparent", color: "#EF4444", cursor: "pointer", padding: "4px" }}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            ) : (
                                                <span style={{ fontSize: "10px", color: "#94A3B8" }}>Auto</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 3 : GRAND LIVRE */}
            {activeTab === 'GRAND_LIVRE' && (
                <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "24px" }}>
                    {/* Liste des comptes */}
                    <div style={{ background: "#FFFFFF", borderRadius: "14px", padding: "20px", border: "1px solid #E2E8F0", height: "fit-content" }}>
                        <div style={{ marginBottom: "14px" }}>
                            <div style={{ position: "relative" }}>
                                <Search size={14} style={{ position: "absolute", left: "8px", top: "9px", color: "#94A3B8" }} />
                                <input
                                    type="text"
                                    placeholder="Chercher compte..."
                                    value={grandLivreSearch}
                                    onChange={(e) => setGrandLivreSearch(e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "7px 10px 7px 28px",
                                        borderRadius: "6px",
                                        border: "1px solid #CBD5E1",
                                        fontSize: "12px",
                                        outline: "none"
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ maxHeight: "600px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "4px" }}>
                            {accountsInGrandLivre.map(acc => {
                                const isSelected = acc.numero === selectedAccountNum;
                                return (
                                    <div
                                        key={acc.numero}
                                        onClick={() => setSelectedAccountNum(acc.numero)}
                                        style={{
                                            padding: "8px 12px",
                                            borderRadius: "8px",
                                            background: isSelected ? "#0F172A" : "transparent",
                                            color: isSelected ? "#FFFFFF" : "#334155",
                                            cursor: "pointer",
                                            fontSize: "12px",
                                            transition: "background 0.15s"
                                        }}
                                    >
                                        <div style={{ fontWeight: "800" }}>{acc.numero}</div>
                                        <div style={{ fontSize: "11px", opacity: isSelected ? 0.8 : 0.6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {acc.intitule}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Mouvements du compte sélectionné */}
                    <div style={{ background: "#FFFFFF", borderRadius: "14px", padding: "24px", border: "1px solid #E2E8F0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", paddingBottom: "16px", borderBottom: "1px solid #F1F5F9" }}>
                            <div>
                                <h2 style={{ fontSize: "18px", fontWeight: "900", color: "#0F172A", margin: "0 0 4px 0" }}>
                                    Compte {selectedAccountNum} - {PLAN_COMPTABLE_SYSCOHADA.find(c => c.numero === selectedAccountNum)?.intitule || "Grand Livre"}
                                </h2>
                                <p style={{ fontSize: "12px", color: "#64748B", margin: 0 }}>
                                    Norme SYSCOHADA • {PLAN_COMPTABLE_SYSCOHADA.find(c => c.numero === selectedAccountNum)?.description || ""}
                                </p>
                            </div>

                            <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748B", textTransform: "uppercase" }}>
                                    Solde Progressif Net
                                </div>
                                <div style={{ fontSize: "20px", fontWeight: "900", color: grandLivreData.runningBal >= 0 ? "#16A34A" : "#DC2626" }}>
                                    {fmt(grandLivreData.runningBal)} XOF
                                </div>
                            </div>
                        </div>

                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                            <thead>
                                <tr style={{ background: "#F8FAFC", borderBottom: "2px solid #E2E8F0", textAlign: "left", color: "#475569" }}>
                                    <th style={{ padding: "8px 10px" }}>Date</th>
                                    <th style={{ padding: "8px 10px" }}>Jrn</th>
                                    <th style={{ padding: "8px 10px" }}>Pièce</th>
                                    <th style={{ padding: "8px 10px" }}>Contrepartie</th>
                                    <th style={{ padding: "8px 10px" }}>Libellé</th>
                                    <th style={{ padding: "8px 10px", textAlign: "right" }}>Débit</th>
                                    <th style={{ padding: "8px 10px", textAlign: "right" }}>Crédit</th>
                                    <th style={{ padding: "8px 10px", textAlign: "right" }}>Solde Progressif</th>
                                </tr>
                            </thead>
                            <tbody>
                                {grandLivreData.computedGLMovements.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} style={{ padding: "32px", textAlign: "center", color: "#94A3B8" }}>
                                            Aucun mouvement enregistré pour ce compte sur l'exercice sélectionné.
                                        </td>
                                    </tr>
                                ) : (
                                    grandLivreData.computedGLMovements.map((m, idx) => (
                                        <tr key={idx} style={{ borderBottom: "1px solid #F1F5F9" }}>
                                            <td style={{ padding: "8px 10px", color: "#64748B" }}>{m.date}</td>
                                            <td style={{ padding: "8px 10px", fontSize: "11px", fontWeight: "700" }}>{m.journalCode}</td>
                                            <td style={{ padding: "8px 10px", fontFamily: "monospace", fontSize: "11px" }}>{m.pieceRef}</td>
                                            <td style={{ padding: "8px 10px", fontWeight: "700", color: "#FF6600" }}>{m.contrepartie}</td>
                                            <td style={{ padding: "8px 10px" }}>{m.libelle}</td>
                                            <td style={{ padding: "8px 10px", textAlign: "right", color: m.debit > 0 ? "#0F172A" : "#CBD5E1" }}>
                                                {m.debit > 0 ? fmt(m.debit) : "-"}
                                            </td>
                                            <td style={{ padding: "8px 10px", textAlign: "right", color: m.credit > 0 ? "#0F172A" : "#CBD5E1" }}>
                                                {m.credit > 0 ? fmt(m.credit) : "-"}
                                            </td>
                                            <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: "700", color: m.soldeProgressif >= 0 ? "#16A34A" : "#DC2626" }}>
                                                {fmt(m.soldeProgressif)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 4 : BALANCE GÉNÉRALE 6 COLONNES */}
            {activeTab === 'BALANCE' && (
                <div style={{ background: "#FFFFFF", borderRadius: "14px", padding: "24px", border: "1px solid #E2E8F0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                        <div>
                            <h2 style={{ fontSize: "18px", fontWeight: "900", color: "#0F172A", margin: "0 0 4px 0" }}>
                                Balance Générale des Comptes (6 Colonnes)
                            </h2>
                            <p style={{ fontSize: "12px", color: "#64748B", margin: 0 }}>
                                Récapitulation ordonnée des mouvements débits/crédits et soldes arrêtés
                            </p>
                        </div>

                        <div style={{ display: "flex", gap: "16px" }}>
                            <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748B" }}>Total Débit Mouvements</div>
                                <div style={{ fontSize: "15px", fontWeight: "900", color: "#0F172A" }}>{fmt(data.totals.totalDebit)} XOF</div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748B" }}>Total Crédit Mouvements</div>
                                <div style={{ fontSize: "15px", fontWeight: "900", color: "#0F172A" }}>{fmt(data.totals.totalCredit)} XOF</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                            <thead>
                                <tr style={{ background: "#0F172A", color: "#FFFFFF", textAlign: "left" }}>
                                    <th style={{ padding: "10px 12px" }}>Compte</th>
                                    <th style={{ padding: "10px 12px" }}>Intitulé du Compte</th>
                                    <th style={{ padding: "10px 12px", textAlign: "right" }}>Mvt Débit</th>
                                    <th style={{ padding: "10px 12px", textAlign: "right" }}>Mvt Crédit</th>
                                    <th style={{ padding: "10px 12px", textAlign: "right" }}>Solde Débiteur</th>
                                    <th style={{ padding: "10px 12px", textAlign: "right" }}>Solde Créditeur</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.balance.map((acc, idx) => (
                                    <tr key={acc.numero} style={{ borderBottom: "1px solid #F1F5F9", background: idx % 2 === 0 ? "#FFFFFF" : "#FAFAFA" }}>
                                        <td style={{ padding: "9px 12px", fontWeight: "800", color: "#2563EB" }}>{acc.numero}</td>
                                        <td style={{ padding: "9px 12px", color: "#1E293B" }}>{acc.intitule}</td>
                                        <td style={{ padding: "9px 12px", textAlign: "right", color: acc.totalDebit > 0 ? "#0F172A" : "#CBD5E1" }}>
                                            {acc.totalDebit > 0 ? fmt(acc.totalDebit) : "-"}
                                        </td>
                                        <td style={{ padding: "9px 12px", textAlign: "right", color: acc.totalCredit > 0 ? "#0F172A" : "#CBD5E1" }}>
                                            {acc.totalCredit > 0 ? fmt(acc.totalCredit) : "-"}
                                        </td>
                                        <td style={{ padding: "9px 12px", textAlign: "right", fontWeight: "700", color: acc.soldeDebiteur > 0 ? "#16A34A" : "#CBD5E1" }}>
                                            {acc.soldeDebiteur > 0 ? fmt(acc.soldeDebiteur) : "-"}
                                        </td>
                                        <td style={{ padding: "9px 12px", textAlign: "right", fontWeight: "700", color: acc.soldeCrediteur > 0 ? "#DC2626" : "#CBD5E1" }}>
                                            {acc.soldeCrediteur > 0 ? fmt(acc.soldeCrediteur) : "-"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr style={{ background: "#F1F5F9", fontWeight: "900", borderTop: "2px solid #CBD5E1" }}>
                                    <td colSpan={2} style={{ padding: "12px" }}>TOTAUX CONSOLIDÉS DE LA BALANCE</td>
                                    <td style={{ padding: "12px", textAlign: "right" }}>{fmt(data.totals.totalDebit)}</td>
                                    <td style={{ padding: "12px", textAlign: "right" }}>{fmt(data.totals.totalCredit)}</td>
                                    <td style={{ padding: "12px", textAlign: "right", color: "#16A34A" }}>{fmt(data.totals.totalSoldeDebiteur)}</td>
                                    <td style={{ padding: "12px", textAlign: "right", color: "#DC2626" }}>{fmt(data.totals.totalSoldeCrediteur)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 5 : BILAN & COMPTE DE RÉSULTAT */}
            {activeTab === 'RESULTAT_BILAN' && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                    {/* Bilan Actif */}
                    <div style={{ background: "#FFFFFF", borderRadius: "14px", padding: "24px", border: "1px solid #E2E8F0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", paddingBottom: "12px", borderBottom: "2px solid #2563EB" }}>
                            <h3 style={{ fontSize: "16px", fontWeight: "900", color: "#0F172A", margin: 0 }}>
                                BILAN ACTIF (Emplois)
                            </h3>
                            <strong style={{ fontSize: "16px", color: "#2563EB" }}>{fmt(data.bilan.actif.total)} XOF</strong>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <div style={{ fontWeight: "800", fontSize: "13px", color: "#475569" }}>Actif Immobilisé (Classe 2) : {fmt(data.bilan.actif.immobilise)} XOF</div>
                            <div style={{ fontWeight: "800", fontSize: "13px", color: "#475569" }}>Actif Circulant (Créances / Bailleurs) : {fmt(data.bilan.actif.circulant)} XOF</div>
                            <div style={{ fontWeight: "800", fontSize: "13px", color: "#475569" }}>Trésorerie Actif (Banques & Caisse) : {fmt(data.bilan.actif.tresorerie)} XOF</div>
                            
                            <div style={{ marginTop: "14px", borderTop: "1px solid #F1F5F9", paddingTop: "12px" }}>
                                <div style={{ fontSize: "12px", fontWeight: "700", color: "#64748B", marginBottom: "8px" }}>Détail des Postes Actifs :</div>
                                {data.bilan.actif.items.map((it, idx) => (
                                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", padding: "4px 0" }}>
                                        <span>{it.numero} - {it.intitule}</span>
                                        <strong>{fmt(it.montant)} XOF</strong>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bilan Passif */}
                    <div style={{ background: "#FFFFFF", borderRadius: "14px", padding: "24px", border: "1px solid #E2E8F0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", paddingBottom: "12px", borderBottom: "2px solid #7C3AED" }}>
                            <h3 style={{ fontSize: "16px", fontWeight: "900", color: "#0F172A", margin: 0 }}>
                                BILAN PASSIF (Ressources)
                            </h3>
                            <strong style={{ fontSize: "16px", color: "#7C3AED" }}>{fmt(data.bilan.passif.total)} XOF</strong>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <div style={{ fontWeight: "800", fontSize: "13px", color: "#475569" }}>Capitaux Propres & Résultat : {fmt(data.bilan.passif.capitauxPropres)} XOF</div>
                            <div style={{ fontWeight: "800", fontSize: "13px", color: "#475569" }}>Passif Circulant (Dettes Bailleurs / Cautions) : {fmt(data.bilan.passif.passifCirculant)} XOF</div>
                            <div style={{ fontWeight: "800", fontSize: "13px", color: "#475569" }}>Trésorerie Passif : {fmt(data.bilan.passif.tresoreriePassif)} XOF</div>

                            <div style={{ marginTop: "14px", borderTop: "1px solid #F1F5F9", paddingTop: "12px" }}>
                                <div style={{ fontSize: "12px", fontWeight: "700", color: "#64748B", marginBottom: "8px" }}>Détail des Postes Passifs :</div>
                                {data.bilan.passif.items.map((it, idx) => (
                                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", padding: "4px 0" }}>
                                        <span>{it.numero} - {it.intitule}</span>
                                        <strong>{fmt(it.montant)} XOF</strong>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 6 : GESTION BAILLEURS & BAUX */}
            {activeTab === 'GESTION_BAUX' && (
                <div>
                    {reportData ? (
                        <ManagementReport data={reportData} />
                    ) : (
                        <div style={{ background: "#FFFFFF", borderRadius: "14px", padding: "32px", textAlign: "center", color: "#64748B" }}>
                            Données de gestion des baux consolidés en cours de chargement...
                        </div>
                    )}
                </div>
            )}

            {/* TAB 7 : PLAN COMPTABLE SYSCOHADA RÉVISÉ */}
            {activeTab === 'PLAN_OHADA' && (
                <div style={{ background: "#FFFFFF", borderRadius: "14px", padding: "24px", border: "1px solid #E2E8F0" }}>
                    <h2 style={{ fontSize: "18px", fontWeight: "900", color: "#0F172A", margin: "0 0 8px 0" }}>
                        Référentiel Plan Comptable SYSCOHADA Révisé (Immobilier & Gestion Mandats)
                    </h2>
                    <p style={{ fontSize: "13px", color: "#64748B", marginBottom: "20px" }}>
                        Nomenclature officielle des comptes conformes au droit comptable OHADA et aux règlements UEMOA.
                    </p>

                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                            <thead>
                                <tr style={{ background: "#F8FAFC", borderBottom: "2px solid #CBD5E1", textAlign: "left" }}>
                                    <th style={{ padding: "8px 12px" }}>N° Compte</th>
                                    <th style={{ padding: "8px 12px" }}>Classe</th>
                                    <th style={{ padding: "8px 12px" }}>Intitulé</th>
                                    <th style={{ padding: "8px 12px" }}>Catégorie</th>
                                    <th style={{ padding: "8px 12px" }}>Sens Normal</th>
                                    <th style={{ padding: "8px 12px" }}>Usage Immobilier</th>
                                </tr>
                            </thead>
                            <tbody>
                                {PLAN_COMPTABLE_SYSCOHADA.map(c => (
                                    <tr key={c.numero} style={{ borderBottom: "1px solid #F1F5F9" }}>
                                        <td style={{ padding: "8px 12px", fontWeight: "800", color: "#FF6600" }}>{c.numero}</td>
                                        <td style={{ padding: "8px 12px" }}>Classe {c.classe}</td>
                                        <td style={{ padding: "8px 12px", fontWeight: "600", color: "#0F172A" }}>{c.intitule}</td>
                                        <td style={{ padding: "8px 12px" }}>{c.categorie}</td>
                                        <td style={{ padding: "8px 12px", fontWeight: "700", color: c.sensNormal === "DEBITEUR" ? "#2563EB" : "#7C3AED" }}>
                                            {c.sensNormal}
                                        </td>
                                        <td style={{ padding: "8px 12px", color: "#64748B", fontSize: "12px" }}>{c.description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* MODALE D'AJOUT D'ÉCRITURE MANUELLE */}
            {isModalOpen && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(15, 23, 42, 0.65)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 9999,
                    padding: "20px"
                }}>
                    <div style={{
                        background: "#FFFFFF",
                        borderRadius: "16px",
                        maxWidth: "600px",
                        width: "100%",
                        padding: "28px",
                        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <h3 style={{ fontSize: "18px", fontWeight: "900", color: "#0F172A", margin: 0 }}>
                                Nouvelle Écriture Comptable SYSCOHADA
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                style={{ border: "none", background: "transparent", color: "#64748B", cursor: "pointer" }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {errorMessage && (
                            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#991B1B", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
                                {errorMessage}
                            </div>
                        )}

                        <form onSubmit={handleCreateEntry}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "14px" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Date d'opération</label>
                                    <input
                                        type="date"
                                        required
                                        value={formDate}
                                        onChange={(e) => setFormDate(e.target.value)}
                                        style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Journal Comptable</label>
                                    <select
                                        value={formJournal}
                                        onChange={(e) => setFormJournal(e.target.value)}
                                        style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                                    >
                                        {JOURNAUX_COMPTABLES.map(j => (
                                            <option key={j.code} value={j.code}>{j.code} - {j.libelle}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginBottom: "14px" }}>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>N° Pièce Justificative (Facture, Chèque, Reçu)</label>
                                <input
                                    type="text"
                                    placeholder="Ex: FAC-2026-089"
                                    value={formPiece}
                                    onChange={(e) => setFormPiece(e.target.value)}
                                    style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                                />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "14px" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Compte au DÉBIT</label>
                                    <select
                                        value={formDebit}
                                        onChange={(e) => setFormDebit(e.target.value)}
                                        style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                                    >
                                        {PLAN_COMPTABLE_SYSCOHADA.map(c => (
                                            <option key={c.numero} value={c.numero}>{c.numero} - {c.intitule}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Compte au CRÉDIT</label>
                                    <select
                                        value={formCredit}
                                        onChange={(e) => setFormCredit(e.target.value)}
                                        style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                                    >
                                        {PLAN_COMPTABLE_SYSCOHADA.map(c => (
                                            <option key={c.numero} value={c.numero}>{c.numero} - {c.intitule}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginBottom: "14px" }}>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Libellé de l'Écriture</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Règlement facture électricité agence"
                                    value={formLibelle}
                                    onChange={(e) => setFormLibelle(e.target.value)}
                                    style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                                />
                            </div>

                            <div style={{ marginBottom: "20px" }}>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Montant (XOF)</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    placeholder="Ex: 50000"
                                    value={formMontant}
                                    onChange={(e) => setFormMontant(e.target.value)}
                                    style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "14px", fontWeight: "700" }}
                                />
                            </div>

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid #CBD5E1", background: "#FFFFFF", color: "#475569", fontWeight: "600", fontSize: "13px", cursor: "pointer" }}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    style={{ padding: "10px 20px", borderRadius: "8px", background: "#FF6600", color: "#FFFFFF", fontWeight: "700", fontSize: "13px", border: "none", cursor: "pointer" }}
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

