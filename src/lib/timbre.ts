/**
 * Timbre fiscal du bail : 500 F CFA par page (CGI, art. 550).
 * Seule source de ce calcul. Fichier sans dépendance serveur : il sert aussi aux écrans.
 */
export const TIMBRE_PAR_PAGE = 500;

/**
 * Nombre de pages du bail complet QAPRIL (les 21 articles de PrintableLeaseContract),
 * mesuré à l'impression A4 avec les marges de l'application : 5 pages.
 * Ne pas confondre avec la fiche de bail (generateLeasePDF), qui tient sur une page,
 * est récapitulative et n'est ni signée ni timbrée.
 * Valeur par défaut : dès que le nombre réel de pages est connu (Lease.nbPagesBail,
 * bail importé), c'est lui qui est utilisé.
 */
export const PAGES_BAIL_QAPRIL = 5;

export function pagesBail(nbPages?: number | null): number {
  const n = Math.round(Number(nbPages));
  return Number.isFinite(n) && n >= 1 ? n : PAGES_BAIL_QAPRIL;
}

export function fraisTimbre(nbPages?: number | null): number {
  return pagesBail(nbPages) * TIMBRE_PAR_PAGE;
}

export function libelleTimbre(nbPages?: number | null): string {
  const n = pagesBail(nbPages);
  return `${n} page${n > 1 ? "s" : ""} × ${TIMBRE_PAR_PAGE} F`;
}
