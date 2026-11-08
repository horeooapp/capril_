/**
 * QAPRIL — Infrastructure numérique de confiance (Côte d'Ivoire)
 * ADD-27 : Assistant Intelligent & Pilotage Vocal de l'Application
 * Règles RG-AST-01 à RG-AST-36
 */

export interface IntentParam {
    name: string;
    label: string;
    type: 'string' | 'number' | 'date' | 'phone' | 'choice';
    required: boolean;
    choices?: string[];
    questionPrompt: string;
}

export interface IntentDefinition {
    code: string;
    module: 'BAILLEUR' | 'LOCATAIRE' | 'AGENCE' | 'COMMUN';
    label: string;
    screen: string;
    params: IntentParam[];
    confirmationLabel: string;
    actionType: string;
}

/**
 * Catalogue officiel des intentions de l'application QAPRIL (RG-AST-11)
 */
export const INTENT_CATALOG: Record<string, IntentDefinition> = {
    creer_bail: {
        code: 'creer_bail',
        module: 'BAILLEUR',
        label: 'Créer un contrat de bail d\'habitation',
        screen: '/create-lease',
        params: [
            { name: 'propertyId', label: 'Bien immobilier', type: 'string', required: true, questionPrompt: "Pour quel logement ou appartement souhaitez-vous établir ce bail ?" },
            { name: 'tenantName', label: 'Nom du locataire', type: 'string', required: true, questionPrompt: "Quel est le nom et prénom de votre locataire ?" },
            { name: 'tenantPhone', label: 'Téléphone du locataire', type: 'phone', required: true, questionPrompt: "Quel est son numéro de téléphone pour l'envoi de la quittance et la signature SMS ?" },
            { name: 'rentAmount', label: 'Loyer mensuel', type: 'number', required: true, questionPrompt: "Quel est le montant du loyer mensuel en FCFA ?" },
            { name: 'durationMonths', label: 'Durée du bail', type: 'choice', choices: ['12', '24', '36'], required: false, questionPrompt: "Pour quelle durée ? 12 mois, 24 mois ou 36 mois ?" },
        ],
        confirmationLabel: 'Envoyer pour signature par code SMS',
        actionType: 'SIGNATURE_BAIL'
    },
    creer_bien: {
        code: 'creer_bien',
        module: 'BAILLEUR',
        label: 'Enregistrer un nouveau bien immobilier',
        screen: '/create-property',
        params: [
            { name: 'name', label: 'Nom du bien', type: 'string', required: true, questionPrompt: "Quel nom ou repère souhaitez-vous donner à ce bien ? (ex: Villa Laurier ou Appartement 3B)" },
            { name: 'commune', label: 'Commune', type: 'choice', choices: ['Cocody', 'Yopougon', 'Marcory', 'Plateau', 'Koumassi', 'Bingerville', 'Port-Bouët', 'Attécoubé', 'Adjamé', 'Abobo'], required: true, questionPrompt: "Dans quelle commune d'Abidjan se situe ce bien ?" },
            { name: 'address', label: 'Adresse précise', type: 'string', required: true, questionPrompt: "Quelle est l'adresse ou le quartier précis ?" },
            { name: 'declaredRentFcfa', label: 'Loyer souhaité', type: 'number', required: false, questionPrompt: "Quel est le loyer mensuel prévu en FCFA ?" },
        ],
        confirmationLabel: 'Enregistrer ce bien dans mon patrimoine',
        actionType: 'CREATION_BIEN'
    },
    declarer_occupant: {
        code: 'declarer_occupant',
        module: 'LOCATAIRE',
        label: 'Déclarer un occupant du logement (ADD-29)',
        screen: '/declarer-occupant',
        params: [
            { name: 'nomPrenoms', label: 'Nom et prénoms', type: 'string', required: true, questionPrompt: "Quel est le nom complet de la personne qui réside avec vous ?" },
            { name: 'lien', label: 'Lien de parenté', type: 'choice', choices: ['CONJOINT', 'ENFANT', 'PARENT', 'AUTRE_FAMILLE', 'HEBERGE', 'COLOCATAIRE'], required: true, questionPrompt: "Quel est votre lien de parenté ? Conjoint, enfant, parent ou hébergé ?" },
            { name: 'telephone', label: 'Numéro de téléphone', type: 'phone', required: true, questionPrompt: "Quel est son numéro de téléphone pour lui envoyer sa confirmation ?" },
        ],
        confirmationLabel: 'Signer et déclarer cet occupant',
        actionType: 'DECLARATION_OCCUPANT'
    },
    demander_attestation: {
        code: 'demander_attestation',
        module: 'LOCATAIRE',
        label: 'Obtenir mon attestation de résidence',
        screen: '/mes-attestations',
        params: [],
        confirmationLabel: 'Télécharger mon attestation officielle en PDF',
        actionType: 'EMISSION_ATTESTATION'
    },
    relancer_locataire: {
        code: 'relancer_locataire',
        module: 'BAILLEUR',
        label: 'Relancer un impayé de loyer',
        screen: '/relances',
        params: [
            { name: 'locataire', label: 'Locataire concerné', type: 'string', required: true, questionPrompt: "Quel locataire souhaitez-vous relancer ?" },
        ],
        confirmationLabel: 'Transmettre le rappel de loyer',
        actionType: 'RELANCE_IMPAYE'
    }
};

/**
 * Analyse et interprétation d'une phrase prononcée en langage naturel (français ou ivoirien)
 */
export function analyserPhraseVocale(text: string): {
    intention: string | null;
    paramsExtraits: Record<string, any>;
    confiance: number;
    reformulation: string;
} {
    const raw = (text || '').trim();
    const lower = raw.toLowerCase();

    // 1. Détection de création de bail
    if (
        lower.includes('bail') || 
        lower.includes('contrat') || 
        lower.includes('louer a') || 
        lower.includes('louer à') ||
        lower.includes('nouveau locataire') ||
        lower.includes('faire entrer')
    ) {
        const params: Record<string, any> = {};
        // Détection de montant (ex: 150000 ou 150 000 ou cent cinquante mille)
        const montantMatch = raw.match(/\b(\d{2,3}[\s.]?\d{3})\b/);
        if (montantMatch) {
            params.rentAmount = parseInt(montantMatch[1].replace(/[\s.]/g, ''), 10);
        }
        return {
            intention: 'creer_bail',
            paramsExtraits: params,
            confiance: 0.92,
            reformulation: "Rédiger un nouveau contrat de bail certifié conforme à la Loi 2019-576"
        };
    }

    // 2. Détection de création de bien
    if (
        lower.includes('bien') || 
        lower.includes('appartement') || 
        lower.includes('maison') || 
        lower.includes('studio') || 
        lower.includes('ajouter un logement') ||
        lower.includes('enregistrer une villa')
    ) {
        return {
            intention: 'creer_bien',
            paramsExtraits: {},
            confiance: 0.88,
            reformulation: "Enregistrer un nouveau logement dans votre patrimoine"
        };
    }

    // 3. Détection déclaration d'occupant
    if (
        lower.includes('occupant') || 
        lower.includes('habite avec moi') || 
        lower.includes('ajouter ma femme') || 
        lower.includes('ajouter mon mari') ||
        lower.includes('mon enfant vit ici') ||
        lower.includes('mon conjoint')
    ) {
        return {
            intention: 'declarer_occupant',
            paramsExtraits: {},
            confiance: 0.89,
            reformulation: "Déclarer un membre de votre foyer comme occupant officiel du logement"
        };
    }

    // 4. Détection attestation de résidence
    if (
        lower.includes('attestation') || 
        lower.includes('certificat de residence') || 
        lower.includes('prouver que j\'habite') || 
        lower.includes('justificatif de domicile')
    ) {
        return {
            intention: 'demander_attestation',
            paramsExtraits: {},
            confiance: 0.95,
            reformulation: "Générer votre attestation officielle de résidence avec QR code certifié"
        };
    }

    // 5. Relance
    if (lower.includes('relancer') || lower.includes('pas paye') || lower.includes('n\'a pas payé') || lower.includes('impaye')) {
        return {
            intention: 'relancer_locataire',
            paramsExtraits: {},
            confiance: 0.85,
            reformulation: "Envoyer un rappel poli de loyer impayé"
        };
    }

    return {
        intention: null,
        paramsExtraits: {},
        confiance: 0.0,
        reformulation: "Désolé, je n'ai pas bien compris votre demande. Vous pouvez dire par exemple : « Je veux créer un bail » ou « Donner mon attestation de résidence »."
    };
}

/**
 * Moteur de questions / étapes du pilote vocal (RG-AST-13)
 * Détermine la prochaine question à poser ou déclenche le récapitulatif
 */
export function determinerProchaineEtapePilote(
    intentionCode: string, 
    paramsActuels: Record<string, any>
): {
    estComplete: boolean;
    questionSuivante?: string;
    champManquant?: string;
    recapitulatif?: string;
    actionConfirmation?: {
        screen: string;
        label: string;
        payload: Record<string, any>;
    };
} {
    const def = INTENT_CATALOG[intentionCode];
    if (!def) {
        return { estComplete: false };
    }

    for (const p of def.params) {
        if (p.required && (paramsActuels[p.name] === undefined || paramsActuels[p.name] === '')) {
            return {
                estComplete: false,
                questionSuivante: p.questionPrompt,
                champManquant: p.name
            };
        }
    }

    // Tous les paramètres requis sont réunis
    let recap = `Récapitulatif pour ${def.label} :\n`;
    for (const p of def.params) {
        if (paramsActuels[p.name]) {
            recap += `• ${p.label} : ${paramsActuels[p.name]}\n`;
        }
    }

    return {
        estComplete: true,
        recapitulatif: recap,
        actionConfirmation: {
            screen: def.screen,
            label: def.confirmationLabel,
            payload: paramsActuels
        }
    };
}
