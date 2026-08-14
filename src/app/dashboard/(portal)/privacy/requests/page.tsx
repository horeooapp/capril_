"use client";

import { useState, useEffect } from "react";
import { getMyPrivacyRequestsAction, submitPrivacyRequestAction, requestAccountAnonymizationAction, requestDataExportAction } from "@/actions/privacy-actions";
import { AlertTriangle, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function PrivacyRequestsPage() {
  const searchParams = useSearchParams();
  const initialAction = searchParams.get("action");
  
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAnonymizeConfirm, setShowAnonymizeConfirm] = useState(initialAction === "erasure");
  const [confirmText, setConfirmText] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const loadRequests = async () => {
    setIsLoading(true);
    const res = await getMyPrivacyRequestsAction();
    if (res.success && res.data) {
      setRequests(res.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleExport = async () => {
    setActionLoading(true);
    setMessage(null);
    const res = await requestDataExportAction();
    if (res.success) {
      setMessage({ type: 'success', text: "Demande d'export initiée. Vous recevrez une notification lorsque le fichier sera prêt." });
      loadRequests();
    } else {
      setMessage({ type: 'error', text: res.error || "Une erreur est survenue." });
    }
    setActionLoading(false);
  };

  const handleAnonymize = async () => {
    setActionLoading(true);
    setMessage(null);
    const res = await requestAccountAnonymizationAction(confirmText);
    if (res.success) {
      setMessage({ type: 'success', text: "Votre compte a été anonymisé. Vous allez être déconnecté." });
      setShowAnonymizeConfirm(false);
      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
    } else {
      setMessage({ type: 'error', text: res.error || "Une erreur est survenue." });
      setActionLoading(false);
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case "PENDING":
      case "IN_PROGRESS":
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-xs font-medium"><Clock className="w-3 h-3"/> En cours</span>;
      case "COMPLETED":
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs font-medium"><CheckCircle2 className="w-3 h-3"/> Terminé</span>;
      case "REJECTED":
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium"><XCircle className="w-3 h-3"/> Rejeté</span>;
      default:
        return <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium">{status}</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Exercice de vos Droits</h1>
        <p className="text-slate-600">
          Soumettez des demandes liées à vos données personnelles et suivez leur état d'avancement. Le délai légal de traitement est de 30 jours maximum.
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg mb-6 flex items-start gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.type === 'error' ? <AlertTriangle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
          <div>{message.text}</div>
        </div>
      )}

      <div className="flex flex-wrap gap-4 mb-8">
        <button 
          onClick={handleExport}
          disabled={actionLoading}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
        >
          Demander un export (Portabilité)
        </button>
        <button 
          onClick={() => setShowAnonymizeConfirm(true)}
          disabled={actionLoading}
          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 disabled:opacity-50"
        >
          Supprimer mon compte (Oubli)
        </button>
      </div>

      {showAnonymizeConfirm && (
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl mb-8">
          <h3 className="text-lg font-bold text-red-900 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Zone de danger
          </h3>
          <p className="text-red-800 text-sm mb-4">
            L'anonymisation de votre compte est <strong>irréversible</strong>. Toutes vos données personnelles seront supprimées. Les données transactionnelles seront conservées de manière anonyme à des fins légales et statistiques.
          </p>
          <div className="mb-4">
            <label className="block text-sm font-medium text-red-900 mb-1">
              Pour confirmer, veuillez taper "SUPPRIMER MON COMPTE"
            </label>
            <input 
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="SUPPRIMER MON COMPTE"
              className="w-full md:w-1/2 px-3 py-2 border border-red-300 rounded-lg focus:ring-red-500 focus:border-red-500 outline-none"
            />
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowAnonymizeConfirm(false)}
              className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50"
            >
              Annuler
            </button>
            <button 
              onClick={handleAnonymize}
              disabled={confirmText !== "SUPPRIMER MON COMPTE" || actionLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Confirmer la suppression
            </button>
          </div>
        </div>
      )}

      <h2 className="text-lg font-semibold text-slate-900 mb-4">Historique de vos demandes</h2>

      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      ) : requests.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-300 rounded-xl bg-slate-50">
          <div className="text-slate-500">Aucune demande en cours ou passée.</div>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-semibold text-slate-900">{req.type}</span>
                  <StatusBadge status={req.status} />
                </div>
                <div className="text-sm text-slate-500">
                  Demandé le {new Date(req.requestedAt).toLocaleDateString()}
                  {req.status === "PENDING" && ` — Réponse avant le ${new Date(req.dueAt).toLocaleDateString()}`}
                </div>
                {req.rejectionReason && (
                  <div className="text-sm text-red-600 mt-2 bg-red-50 p-2 rounded-md">
                    Motif : {req.rejectionReason}
                  </div>
                )}
              </div>
              
              {req.status === "COMPLETED" && req.exportUrl && (
                <a 
                  href={req.exportUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-medium inline-flex items-center justify-center"
                >
                  Télécharger l'export
                </a>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
