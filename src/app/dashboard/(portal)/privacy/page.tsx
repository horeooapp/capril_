import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getMyConsentsAction, updatePrivacyPreferencesAction } from "@/actions/privacy-actions";
import { ShieldCheck, Download, Trash2, Eye, FileText } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Centre de Confidentialité | Qapril",
  description: "Gérez vos données personnelles et vos consentements.",
};

export default async function PrivacyCenterPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const result = await getMyConsentsAction();
  const activeConsents = result.success ? (result.data || []) : [];

  const hasAnalytics = activeConsents.some(c => c.typeConsentement === "ANALYTICS");
  const hasMarketing = activeConsents.some(c => c.typeConsentement === "MARKETING");
  const hasDataSharing = activeConsents.some(c => c.typeConsentement === "DATA_SHARING");

  return (
    <div className="max-w-4xl mx-auto p-6">
      
      <div className="mb-8">
        <div className="flex items-center gap-3 text-primary mb-2">
          <ShieldCheck className="w-8 h-8" />
          <h1 className="text-3xl font-bold text-slate-900">Centre de Confidentialité</h1>
        </div>
        <p className="text-slate-600">
          Conformément au RGPD et à la loi n°2013-450 (Côte d'Ivoire), vous avez le contrôle total sur vos données personnelles.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* Exercice des Droits */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-slate-900">Vos Droits (RGPD)</h2>
          
          <div className="space-y-4">
            <Link href="/dashboard/privacy/requests" className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><Download className="w-5 h-5" /></div>
                <div>
                  <div className="font-medium">Exporter mes données</div>
                  <div className="text-xs text-slate-500">Format JSON (Droit à la portabilité)</div>
                </div>
              </div>
            </Link>

            <Link href="/dashboard/privacy/requests?action=erasure" className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 text-red-700 rounded-lg"><Trash2 className="w-5 h-5" /></div>
                <div>
                  <div className="font-medium text-red-700">Supprimer mon compte</div>
                  <div className="text-xs text-slate-500">Droit à l'oubli / Anonymisation</div>
                </div>
              </div>
            </Link>

            <Link href="/dashboard/privacy/requests" className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-lg"><Eye className="w-5 h-5" /></div>
                <div>
                  <div className="font-medium">Suivre mes demandes</div>
                  <div className="text-xs text-slate-500">Historique des demandes soumises</div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Consentements */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-slate-900">Vos Consentements</h2>
          
          <div className="space-y-4">
            <div className="flex items-start justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <div className="font-medium">Essentiels (Requis)</div>
                <div className="text-xs text-slate-500 mt-1">Nécessaires au fonctionnement.</div>
              </div>
              <div className="px-2 py-1 bg-slate-200 text-slate-700 text-xs font-semibold rounded-md">Toujours actif</div>
            </div>

            <div className="flex items-start justify-between p-3 rounded-xl border border-slate-100">
              <div>
                <div className="font-medium">Analyses & Statistiques</div>
                <div className="text-xs text-slate-500 mt-1">Pour améliorer l'application.</div>
              </div>
              <div className={`px-2 py-1 text-xs font-semibold rounded-md ${hasAnalytics ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                {hasAnalytics ? 'Accepté' : 'Refusé'}
              </div>
            </div>

            <div className="flex items-start justify-between p-3 rounded-xl border border-slate-100">
              <div>
                <div className="font-medium">Marketing & Offres</div>
                <div className="text-xs text-slate-500 mt-1">Communications promotionnelles.</div>
              </div>
              <div className={`px-2 py-1 text-xs font-semibold rounded-md ${hasMarketing ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                {hasMarketing ? 'Accepté' : 'Refusé'}
              </div>
            </div>

            <div className="mt-4 text-center">
              <button className="text-sm text-primary font-medium hover:underline">
                Modifier mes préférences
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Politique de confidentialité */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-slate-400" />
          <div>
            <div className="font-semibold text-slate-900">Politique de Confidentialité</div>
            <div className="text-sm text-slate-500">Version 1.0 — Dernière mise à jour : Août 2024</div>
          </div>
        </div>
        <Link href="/confidentialite" className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">
          Lire le document
        </Link>
      </div>

    </div>
  );
}
