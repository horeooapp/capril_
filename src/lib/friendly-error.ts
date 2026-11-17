/**
 * Helper de conversion d'erreurs techniques (Prisma, base de données, validation)
 * en messages clairs et compréhensibles par l'utilisateur final.
 */

export function formatUserFriendlyError(error: any, fallbackMessage: string = "Une erreur est survenue lors de l'enregistrement. Veuillez vérifier les informations saisies."): string {
    if (!error) return fallbackMessage;

    const rawMessage = typeof error === 'string' 
        ? error 
        : String(error?.message || error?.error || '');

    // Si le message est déjà un message clair et rédigé en français par nos contrôles métier
    if (
        rawMessage.startsWith('Veuillez ') || 
        rawMessage.startsWith('Numéro ') || 
        rawMessage.startsWith('Adresse ') || 
        rawMessage.startsWith('Le bien ') ||
        rawMessage.startsWith('Montant ') ||
        rawMessage.startsWith('Accès ') ||
        rawMessage.startsWith('Champ ') ||
        rawMessage.startsWith('RG-')
    ) {
        return rawMessage;
    }

    const lower = rawMessage.toLowerCase();

    // 0. Contraintes d'unicité Prisma (P2002)
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
        return "Un enregistrement avec ces mêmes identifiants existe déjà dans le système.";
    }

    // 1. Contraintes de clé étrangère Prisma (P2003)
    if (error?.code === 'P2003' || lower.includes('p2003') || lower.includes('foreign key constraint')) {
        return "Le bien ou l'utilisateur associé est introuvable ou n'est plus accessible.";
    }

    // 2. Erreurs d'Enum ou de statut dans le schéma
    if (
        lower.includes('statutposition') || 
        lower.includes('statut_position') ||
        (lower.includes('enum') && (lower.includes('invalid') || lower.includes('expected')))
    ) {
        return "Une valeur sélectionnée ou un statut transmis est non conforme au standard du référentiel.";
    }

    // 3. Détection des erreurs spécifiques sur le numéro de téléphone
    if (
        lower.includes('phone') || 
        lower.includes('téléphone') || 
        lower.includes('telephone')
    ) {
        return "Numéro de téléphone absent ou invalide. Veuillez renseigner un numéro de téléphone valide.";
    }

    // 4. Détection des erreurs sur l'email
    if (lower.includes('email') || lower.includes('e-mail')) {
        return "Adresse email absente ou invalide. Veuillez renseigner une adresse email correcte.";
    }

    // 5. Détection des erreurs STRICTEMENT sur le loyer ou les montants
    // IMPORTANT : Ne pas faire `lower.includes('rent')` directement car cela matche
    // 'parentPropertyId', 'different', 'adherent', 'apparent', 'transparent', etc.
    const isStrictFinancial = 
        /\b(loyer|loyers|rentamount|caution|cautions|deposit|avance|avance_loyer|loyer_mensuel)\b/i.test(rawMessage) ||
        (/\brent\b/i.test(rawMessage) && !rawMessage.includes('parentProperty') && !rawMessage.includes('parent'));

    if (isStrictFinancial && !lower.includes('parentpropertyid') && !lower.includes('parent_property_id')) {
        return "Montant financier invalide ou manquant. Veuillez préciser le loyer mensuel ou la caution en FCFA.";
    }

    // 6. Détection des erreurs sur le bien immobilier ou l'adresse
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

    // 7. Détection des erreurs sur le nom ou identité
    if (
        lower.includes('tenantname') || 
        lower.includes('firstname') || 
        lower.includes('lastname')
    ) {
        return "Nom complet absent. Veuillez renseigner le prénom et le nom.";
    }

    // 8. Prisma Invocation / Argument manquant général
    if (
        lower.includes('prisma') || 
        lower.includes('invocation') || 
        lower.includes('argument') || 
        lower.includes('validation error')
    ) {
        return "Certaines informations du formulaire sont manquantes ou incorrectes. Veuillez vérifier tous les champs requis.";
    }

    // 9. Erreurs réseau / timeout
    if (lower.includes('timeout') || lower.includes('timed out') || lower.includes('econnrefused')) {
        return "Le serveur n'a pas répondu à temps. Veuillez vérifier votre connexion internet et réessayer.";
    }

    return fallbackMessage;
}

