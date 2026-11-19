/**
 * Montant en toutes lettres, en français.
 *
 * Règles d'accord appliquées (elles comptent : ce texte figure dans le bail signé) :
 *  - « quatre-vingts » ne prend un s que lorsqu'il termine le nombre : quatre-vingts,
 *    mais quatre-vingt-cinq, quatre-vingt mille ;
 *  - « cent » multiplié ne prend un s que lorsqu'il termine le nombre : deux cents,
 *    mais deux cent cinq, trois cent mille ;
 *  - devant « million(s) » et « milliard(s) », qui sont des noms, l'accord est conservé :
 *    quatre-vingts millions, deux cents millions ;
 *  - « mille » est invariable.
 */
const UNITES = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"];
const DIX_A_DIX_NEUF = ["dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
const DIZAINES = ["", "dix", "vingt", "trente", "quarante", "cinquante", "soixante"];

/** n de 1 à 99. `final` : le nombre se termine ici (ou précède million/milliard). */
function moinsDeCent(n: number, final: boolean): string {
    if (n < 10) return UNITES[n];
    if (n < 20) return DIX_A_DIX_NEUF[n - 10];
    const d = Math.floor(n / 10), u = n % 10;
    if (d <= 6) {
        if (u === 0) return DIZAINES[d];
        return u === 1 ? `${DIZAINES[d]} et un` : `${DIZAINES[d]}-${UNITES[u]}`;
    }
    if (d === 7) return n === 71 ? "soixante et onze" : `soixante-${DIX_A_DIX_NEUF[n - 70]}`;
    if (n === 80) return final ? "quatre-vingts" : "quatre-vingt";
    return d === 8 ? `quatre-vingt-${UNITES[u]}` : `quatre-vingt-${DIX_A_DIX_NEUF[n - 90]}`;
}

/** n de 1 à 999. */
function moinsDeMille(n: number, final: boolean): string {
    const c = Math.floor(n / 100), r = n % 100;
    let s = "";
    if (c === 1) s = "cent";
    else if (c > 1) s = `${UNITES[c]} cent${r === 0 && final ? "s" : ""}`;
    if (r > 0) s += (s ? " " : "") + moinsDeCent(r, final);
    return s;
}

export function numberToFrenchWords(num: number): string {
    const n = Math.round(Math.abs(Number(num) || 0));
    if (n === 0) return "zéro";

    const milliards = Math.floor(n / 1_000_000_000);
    const millions = Math.floor((n % 1_000_000_000) / 1_000_000);
    const milliers = Math.floor((n % 1_000_000) / 1000);
    const reste = n % 1000;

    const parts: string[] = [];
    if (milliards > 0) parts.push(`${moinsDeMille(milliards, true)} milliard${milliards > 1 ? "s" : ""}`);
    if (millions > 0) parts.push(`${moinsDeMille(millions, true)} million${millions > 1 ? "s" : ""}`);
    if (milliers === 1) parts.push("mille");
    else if (milliers > 1) parts.push(`${moinsDeMille(milliers, false)} mille`); // invariable devant mille
    if (reste > 0) parts.push(moinsDeMille(reste, true));
    return parts.join(" ");
}
