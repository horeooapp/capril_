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

    // 1. Détection des erreurs spécifiques sur le numéro de téléphone
    if (
        lower.includes('phone') || 
        lower.includes('téléphone') || 
        lower.includes('telephone') || 
        lower.includes('contact')
    ) {
        if (lower.includes('unique') || lower.includes('already exists') || lower.includes('p2002')) {
            return "Ce numéro de téléphone est déjà associé à un compte ou un dossier.";
        }
        return "Numéro de téléphone absent ou invalide. Veuillez ajouter un numéro de téléphone valide pour le locataire.";
    }

    // 2. Détection des erreurs sur l'email
    if (lower.includes('email') || lower.includes('e-mail')) {
        if (lower.includes('unique') || lower.includes('already exists') || lower.includes('p2002')) {
            return "Cette adresse email est déjà associée à un compte existant.";
        }
        return "Adresse email absente ou invalide. Veuillez renseigner une adresse email correcte.";
    }

    // 3. Détection des erreurs sur le loyer ou les montants
    if (
        lower.includes('rent') || 
        lower.includes('loyer') || 
        lower.includes('declaredrentfcfa') || 
        lower.includes('rentamount') ||
        lower.includes('deposit') ||
        lower.includes('caution') ||
        lower.includes('avance')
    ) {
        return "Montant financier invalide ou manquant. Veuillez préciser le loyer mensuel ou la caution en FCFA.";
    }

    // 4. Détection des erreurs sur le bien immobilier ou l'adresse
    if (
        lower.includes('property') || 
        lower.includes('propertyid') || 
        lower.includes('bien')
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

    // 5. Détection des erreurs sur le nom ou identité
    if (
        lower.includes('tenantname') || 
        lower.includes('firstname') || 
        lower.includes('lastname') ||
        lower.includes('nom')
    ) {
        return "Nom complet absent. Veuillez renseigner le prénom et le nom du locataire.";
    }

    // 6. Contraintes d'unicité Prisma (P2002)
    if (error?.code === 'P2002' || lower.includes('p2002') || lower.includes('unique constraint')) {
        return "Un enregistrement avec ces mêmes identifiants existe déjà dans le système.";
    }

    // 7. Contraintes de clé étrangère Prisma (P2003)
    if (error?.code === 'P2003' || lower.includes('p2003') || lower.includes('foreign key constraint')) {
        return "Le bien ou l'utilisateur associé est introuvable ou n'est plus accessible.";
    }

    // 8. Prisma Invocation / Argument manquant général
    if (
        lower.includes('prisma') || 
        lower.includes('invocation') || 
        lower.includes('argument') || 
        lower.includes('validation error')
    ) {
        return "Certaines informations obligatoires du formulaire sont manquantes ou incorrectes. Veuillez vérifier tous les champs requis.";
    }

    // 9. Erreurs réseau / timeout
    if (lower.includes('timeout') || lower.includes('timed out') || lower.includes('econnrefused')) {
        return "Le serveur n'a pas répondu à temps. Veuillez vérifier votre connexion internet et réessayer.";
    }

    return fallbackMessage;
}
