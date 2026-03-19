import { prisma } from "@/lib/prisma";
import FeatureManager from "@/components/admin/FeatureManager";
import { Settings2, Info } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Gestion des Modules | QAPRIL Admin",
  description: "Activer ou désactiver les fonctionnalités du système.",
};

export default async function FeaturesPage() {
  const session = await auth();
  
  // Seul le super admin peut gérer les features
  if (session?.user?.role !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  // Récupérer les flags de la DB (avec fallback si vide)
  const features = await (prisma as any).featureFlag.findMany({
    orderBy: { id: "asc" }
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-black/40 text-[10px] font-black uppercase tracking-[0.2em]">
            <Settings2 className="w-3 h-3" />
            <span>Paramètres Système</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900">
            Gestion du <span className="text-black">Cœur</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl font-medium">
            Activez ou désactivez les modules applicatifs en temps réel. Ces changements affectent l'ensemble de la plateforme.
          </p>
        </div>
      </div>

      {/* Alerte Information */}
      <div className="bg-amber-50/50 border border-amber-100 p-6 rounded-3xl flex items-start gap-4">
        <div className="p-2 bg-amber-100 rounded-xl text-amber-600 self-start">
          <Info className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-amber-900">Précaution d'Usage</h4>
          <p className="text-sm text-amber-700/80 leading-relaxed">
            La désactivation d'un module (ex: M04) masquera les interfaces correspondantes pour tous les utilisateurs (Locataires, Propriétaires, Agences) mais ne supprimera pas les données en base.
          </p>
        </div>
      </div>

      {/* Liste des Modules */}
      <FeatureManager initialFeatures={features} />

      {/* Pied de page technique */}
      <div className="pt-8 border-t border-gray-100">
        <div className="flex flex-col md:flex-row justify-between gap-4 text-[10px] items-center text-gray-300 font-black uppercase tracking-widest">
          <span>QAPRIL OS v3.2 Core</span>
          <div className="flex gap-6">
            <span className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Système de Toggle Actif
            </span>
            <span>Ref: QAPRIL/DEB/2026-FT</span>
          </div>
        </div>
      </div>
    </div>
  );
}
