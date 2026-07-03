/**
 * Calcul des tags dynamiques temps réel sur une annonce (RG-PORT-17 / Table 17)
 * Déplacé depuis route.ts pour respecter les règles d'export de Next App Router.
 */
export function calculerTagsDynamiques(a: any): string[] {
  const tags: string[] = [];
  const now = new Date().getTime();
  const pubTime = a.publieeAt ? new Date(a.publieeAt).getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : now);

  // 1. "Ajouté aujourd'hui" (publiee_at dans les dernières 24h à 72h)
  if (now - pubTime < 86400000 * 3) {
    tags.push("NOUVEAU");
  }

  // 2. "Prix baissé" (si coutVacance ou diffusions indique un prix précédent plus élevé)
  let prixPrecedent = null;
  if (a.criteres && typeof a.criteres === "object" && (a.criteres as any).prix_precedent) {
    prixPrecedent = Number((a.criteres as any).prix_precedent);
  } else if (a.diffusions && typeof a.diffusions === "object" && (a.diffusions as any).prix_precedent) {
    prixPrecedent = Number((a.diffusions as any).prix_precedent);
  }
  if (prixPrecedent && prixPrecedent > Number(a.loyerDemande)) {
    tags.push("PRIX_BAISSE");
  }

  // 3. "Agence agréée CPRAIMA-CI" (RG-PORT-03 / RG-PORT-04)
  if (a.agence && (a.agence.companyRegNumber || a.agence.isCertified)) {
    tags.push("AGENCE_AGREEE");
  }

  // 4. "Rare / très demandé" (nb_visites ou nb_contacts élevé)
  if ((a.nbVisites && a.nbVisites >= 15) || (a.nbContacts && a.nbContacts >= 5)) {
    tags.push("TRES_DEMANDE");
  }

  return tags;
}
