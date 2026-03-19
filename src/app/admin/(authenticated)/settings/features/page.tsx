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
  
  // Les admins et super admins peuvent gérer les features
  if (session?.user?.role !== "SUPER_ADMIN" && session?.user?.role !== "ADMIN") {
    redirect("/admin");
  }

  // Récupérer les flags de la DB (avec fallback si vide ou table manquante)
  let features = [];
  try {
    if ((prisma as any).featureFlag) {
      features = await (prisma as any).featureFlag.findMany({
        orderBy: { id: "asc" }
      });
    }
  } catch (e) {
    console.error("[FeaturesPage] Impossible d'accéder à la table FeatureFlag :", e);
  }

  return (
    <div className="space-y-10 pb-12">
      {/* Header Premium - Alignement Charte P01/P02 */}
      <div className="flex flex-col gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#C55A11] text-[12px] font-black uppercase tracking-[0.3em]">
            <Settings2 className="w-4 h-4" />
            <span>Paramètres Système</span>
          </div>
          {/* H1 Charte : 24sp / Bleu Nuit #1F4E79 */}
          <h1 className="text-[24sp] md:text-[32px] font-black tracking-tight text-[#1F4E79] uppercase">
            Gestion du <span className="text-[#C55A11]">Cœur</span>
          </h1>
          {/* Body Charte : 16sp */}
          <p className="text-[16px] text-gray-500 max-w-2xl font-medium leading-relaxed">
            Activez ou désactivez les modules applicatifs en temps réel. Ces changements affectent l'ensemble de la plateforme.
          </p>
        </div>
      </div>

      {/* Alerte Information - Couleurs Charte (Bleu Ciel Info #D6E4F0) */}
      <div className="bg-[#D6E4F0]/30 border border-[#D6E4F0] p-8 rounded-[32px] flex items-start gap-5">
        <div className="p-3 bg-[#1F4E79] rounded-2xl text-white self-start shadow-md">
          <Info className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          {/* H2 Charte : 20sp / Orange #C55A11 */}
          <h4 className="text-[20px] font-bold text-[#C55A11]">Précaution d'Usage</h4>
          <p className="text-[16px] text-[#1F4E79]/80 leading-relaxed font-medium">
            La désactivation d'un module masquera les interfaces correspondantes pour tous les utilisateurs (Locataires, Propriétaires, Agences) mais ne supprimera pas les données en base.
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
