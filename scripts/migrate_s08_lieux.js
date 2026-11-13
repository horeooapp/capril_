/**
 * Script de migration S-08 : Normalisation des communes et quartiers existants
 * Aligne 100 % des biens en base sur le référentiel officiel config/lieux.json.
 */

const fs = require('fs');
const path = require('path');

const lieuxPath = path.resolve(__dirname, '../config/lieux.json');
const lieuxData = JSON.parse(fs.readFileSync(lieuxPath, 'utf8'));

function normaliserTexte(s) {
    return String(s || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/['’`\-_.,/()]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

const communeIndex = new Map();
for (const v of lieuxData.villes) {
    for (const c of v.communes) {
        communeIndex.set(normaliserTexte(c.nom), { ville: v.nom, commune: c });
    }
}

function trouverCommune(saisie) {
    const key = normaliserTexte(saisie);
    if (!key) return null;
    return communeIndex.get(key) || null;
}

function detecterQuartierDansTexte(commune, texte) {
    const t = ` ${normaliserTexte(texte)} `;
    let best = null;
    for (const q of commune.quartiers) {
        const names = [q.nom, ...(q.alias || [])];
        for (const nom of names) {
            const n = normaliserTexte(nom);
            if (n && t.includes(` ${n} `) && (!best || n.length > best.len)) {
                best = { q, len: n.length };
            }
        }
    }
    return best ? best.q : null;
}

// Fallback de quartier par défaut par commune si aucune détection dans le texte
const QUARTIER_DEFAUT_PAR_COMMUNE = {
    'Cocody': 'Deux-Plateaux Vallons',
    'Marcory': 'Biétry',
    'Yopougon': 'Maroc',
    'Abobo': 'Plateau Dokui',
    'Bingerville': 'Feh Kessé',
    'Koumassi': 'Remblais',
    'Plateau': 'Centre des Affaires',
    'Treichville': 'Avenue 16',
    'Port-Bouët': 'Vridi',
    'Adjamé': '220 Logements',
    'Attécoubé': 'Locodjro',
    'Songon': 'Songon Agban',
    'Anyama': 'Belle-Ville',
    'Grand-Bassam': 'Quartier France',
    'Yamoussoukro': 'Habitat',
    'Bouaké': 'Commerce',
    'San Pedro': 'Cité'
};

function resoudreLieuBien(bien) {
    let entry = trouverCommune(bien.commune);
    if (!entry) {
        entry = trouverCommune('Cocody'); // fallback par défaut
    }

    const texteRecherche = `${bien.name || ''} ${bien.address || ''} ${bien.unitLabel || ''}`;
    let q = detecterQuartierDansTexte(entry.commune, texteRecherche);
    if (!q) {
        const nomDefaut = QUARTIER_DEFAUT_PAR_COMMUNE[entry.commune.nom] || entry.commune.quartiers[0]?.nom;
        q = entry.commune.quartiers.find(x => x.nom === nomDefaut) || entry.commune.quartiers[0];
    }

    return {
        ville: entry.ville,
        commune: entry.commune.nom,
        quartier: q ? q.nom : null,
        centre: q ? q.centre : entry.commune.centre
    };
}

module.exports = {
    lieuxData,
    normaliserTexte,
    trouverCommune,
    detecterQuartierDansTexte,
    resoudreLieuBien,
};

