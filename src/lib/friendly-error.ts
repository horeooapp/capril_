/**
 * Helper de conversion d'erreurs techniques (Prisma, base de données, validation)
 * en messages clairs et compréhensibles par l'utilisateur final.
 * Garantit qu'aucun code d'erreur système (P20xx, digest, stack trace, noms de colonnes SQL)
 * ne fuite vers l'interface utilisateur.
 */

export function sanitizeErrorMessage(raw: string): string {
    if (!raw) return "";

    // Supprimer les traces de code Prisma, invocations et digests
    let cleaned = raw
        .replace(/Invalid\s+`prisma\.[^`]+`\s+invocation:?/gi, '')
        .replace(/Unique constraint failed on the constraint:?[^.\n]*/gi, '')
        .replace(/Unique constraint failed on the fields?:?[^.\n]*/gi, '')
        .replace(/Foreign key constraint failed on the field:?[^.\n]*/gi, '')
        .replace(/An error occurred in the Server Components render[^.\n]*/gi, '')
        .replace(/Digest Code:?\s*\d+/gi, '')
        .replace(/\b[P][0-9]{4}\b/g, '')
        .replace(/\{[^{}]*\}/g, '') // supprimer les dumps de json techniques { ... }
        .replace(/-->\s+[0-9]+.*$/gm, '')
        .replace(/^\s*at\s+.*$/gm, '')
        .trim();

    return cleaned;
}

export function formatUserFriendlyError(error: any, fallbackMessage: string = "Une erreur est survenue lors de l'enregistrement. Veuillez vérifier les informations saisies."): string {
    if (!error) return fallbackMessage;

    const rawMessage = typeof error === 'string' 
        ? error 
        : String(error?.message || error?.error || '');

    const lower = rawMessage.toLowerCase();

    // 0. Cas prioritaire : Structure parente / Immeuble manquant pour un appartement ou sous-lot
    if (
        lower.includes('structure parente') ||
        lower.includes('parent_property_id') ||
        lower.includes('parentpropertyid') ||
        (lower.includes('parent') && (lower.includes('obligatoire') || lower.includes('manquant') || lower.includes('requis') || lower.includes('introuvable'))) ||
        (lower.includes('appartement') && (lower.includes('immeuble') || lower.includes('parent')))
    ) {
        return "Veuillez créer ou sélectionner un immeuble ou un bloc résidentiel d'abord.";
    }

    // 1. Si le message est déjà un message clair et rédigé en français par nos contrôles métier
    if (
        (rawMessage.startsWith('Veuillez ') || 
        rawMessage.startsWith('Numéro ') || 
        rawMessage.startsWith('Adresse ') || 
        rawMessage.startsWith('Le bien ') ||
        rawMessage.startsWith('Montant ') ||
        rawMessage.startsWith('Accès ') ||
        rawMessage.startsWith('Champ ') ||
        rawMessage.startsWith('RG-')) &&
        !lower.includes('prisma') &&
        !lower.includes('invocation') &&
        !lower.includes('digest')
    ) {
        return sanitizeErrorMessage(rawMessage);
    }

    // 2. Contraintes d'unicité Prisma (P2002)
    if (error?.code === 'P2002' || lower.includes('p2002') || lower.includes('unique constraint')) {
        if (lower.includes('phone') || lower.includes('téléphone') || lower.includes('telephone') || lower.includes('contact')) {
            return "Ce numéro de téléphone est déjà associé à un compte ou un dossier.";
        }
        if (lower.includes('email') || lower.includes('e-mail')) {
            return "Cette adresse email est déjà associée à un compte existant.";
        }
        if (lower.includes('propertycode') || lower.includes('property_code')) {
            return "Un bien avec ce code officiel d'immatriculation existe déjà dans le système.";
        }
        if (lower.includes('unitlabel') || lower.includes('unit_label')) {
            return "Un appartement ou lot avec ce même nom ou numéro existe déjà dans cet ensemble immobilier.";
        }
        return "Un enregistrement avec ces mêmes identifiants existe déjà dans le système.";
    }

    // 3. Contraintes de clé étrangère Prisma (P2003)
    if (error?.code === 'P2003' || lower.includes('p2003') || lower.includes('foreign key constraint')) {
        if (lower.includes('parentpropertyid') || lower.includes('parent_property_id') || lower.includes('parent')) {
            return "Veuillez créer ou sélectionner un immeuble ou un bloc résidentiel d'abord.";
        }
        if (lower.includes('owner') || lower.includes('user')) {
            return "Le compte utilisateur ou le propriétaire associé est introuvable.";
        }
        return "Le bien ou l'élément associé est introuvable ou n'est plus accessible.";
    }

    // 4. Enregistrement introuvable Prisma (P2025)
    if (error?.code === 'P2025' || lower.includes('p2025') || lower.includes('record to update not found')) {
        return "L'élément demandé est introuvable ou a déjà été modifié.";
    }

    // 5. Erreurs d'Enum ou de statut dans le schéma
    if (
        lower.includes('statutposition') || 
        lower.includes('statut_position') ||
        (lower.includes('enum') && (lower.includes('invalid') || lower.includes('expected')))
    ) {
        return "Une valeur sélectionnée ou un statut transmis est non conforme au standard du référentiel.";
    }

    // 6. Détection des erreurs spécifiques sur le numéro de téléphone
    if (
        lower.includes('phone') || 
        lower.includes('téléphone') || 
        lower.includes('telephone')
    ) {
        return "Numéro de téléphone absent ou invalide. Veuillez renseigner un numéro de téléphone valide.";
    }

    // 7. Détection des erreurs sur l'email
    if (lower.includes('email') || lower.includes('e-mail')) {
        return "Adresse email absente ou invalide. Veuillez renseigner une adresse email correcte.";
    }

    // 8. Détection des erreurs STRICTEMENT sur le loyer ou les montants
    const isStrictFinancial = 
        (/argument\s+[`'"]?(rent|declaredRent|rentAmount|caution|deposit|montant)/i.test(rawMessage)) ||
        (/(?:valeur|montant|chiffre)\s+invalide.*?(?:loyer|caution|deposit|montant)/i.test(rawMessage)) ||
        (/(?:loyer|caution|deposit)\s+(?:invalide|manquant|requis|négatif)/i.test(rawMessage));

    const hasOtherSpecificArgError = /(?:argument|unknown argument|invalid value for argument)\s+[`'"]?(?!rent|declaredrent|rentamount|caution|deposit)[a-zA-Z0-9_]+/i.test(rawMessage);

    const isFalsePositiveFinancial = 
        lower.includes('statutposition') ||
        lower.includes('statut_position') ||
        lower.includes('loyer_impaye') || 
        lower.includes('alertes_loyer') ||
        lower.includes('parentpropertyid') ||
        lower.includes('parent_property_id');

    if (isStrictFinancial && !hasOtherSpecificArgError && !isFalsePositiveFinancial) {
        return "Montant financier invalide ou manquant. Veuillez préciser le loyer mensuel ou la caution en FCFA.";
    }

    // 9. Détection des erreurs sur le bien immobilier ou l'adresse
    if (
        lower.includes('propertyid') || 
        lower.includes('property_id')
    ) {
        return "Bien immobilier non sélectionné ou introuvable. Veuillez sélectionner un bien valide.";
    }

    if (
        lower.includes('address') || 
        lower.includes('commune') || 
        lower.includes('adresse')
    ) {
        return "Localisation incomplète. Veuillez renseigner l'adresse précise et la commune du bien.";
    }

    // 10. Détection des erreurs sur le nom ou identité
    if (
        lower.includes('tenantname') || 
        lower.includes('firstname') || 
        lower.includes('lastname')
    ) {
        return "Nom complet absent. Veuillez renseigner le prénom et le nom.";
    }

    // 11. Erreurs de rendu Server Components Next.js / digest
    if (
        lower.includes('server components render') ||
        lower.includes('digest code') ||
        lower.includes('digest property')
    ) {
        return "Une difficulté temporaire est survenue lors de l'affichage. Veuillez actualiser la page ou réessayer dans quelques instants.";
    }

    // 12. Prisma Invocation / Argument manquant général
    if (
        lower.includes('prisma') || 
        lower.includes('invocation') || 
        lower.includes('argument') || 
        lower.includes('validation error')
    ) {
        return "Certaines informations du formulaire sont manquantes ou incorrectes. Veuillez vérifier tous les champs requis.";
    }

    // 13. Erreurs réseau / timeout
    if (lower.includes('timeout') || lower.includes('timed out') || lower.includes('econnrefused')) {
        return "Le serveur n'a pas répondu à temps. Veuillez vérifier votre connexion internet et réessayer.";
    }

    return fallbackMessage;
}


