QAPRIL — Plateforme de gestion immobilière numérique — Côte d’Ivoire
ADDENDUM ADD-26
Canal conversationnel — mode sans application (SMS, WhatsApp, USSD)
Règles RG-CNV-01 à RG-CNV-30

--- TABLE ---
Champ | Valeur
Référence | QAPRIL/SPEC/001/2026 — ADD-26
Version | 1.0 — 7 novembre 2026 — projet soumis à validation
Éditeur | AUXX SAS · Éditeur de QAPRIL
Direction technique | Achille M’Besso
Modules impactés | ADD-02 Locataires · ADD-03 Bailleurs · ADD-04 Quittances · ADD-07 Flux · ADD-13 Notifications (refondu) · ADD-17 Sécurité · ADD-19 Administration · ADD-22 Vérification · ADD-23 Canal DGI · ADD-24 Paiements partiels
Textes | Loi n° 2013-546 (transactions électroniques, preuve et signature électroniques) · Loi n° 2013-450 (protection des données personnelles, ARTCI) · Loi n° 2019-576 (CCH) · Code civil (quittance, reconnaissance de paiement) · Réglementation ARTCI sur les SMS et USSD
Objectif | Permettre à un bailleur ou un locataire d’utiliser QAPRIL sans installer d’application ni créer de compte au préalable, depuis n’importe quel téléphone, en répondant à des messages
--- END TABLE ---

1. Objet et principe
La majorité des bailleurs ivoiriens n’installeront pas d’application et ne créeront pas de compte pour gérer une ou deux locations. Le canal conversationnel renverse l’ordre habituel : QAPRIL vient au bailleur, sur le téléphone qu’il possède, poussé par son locataire ; le compte se construit derrière lui, à partir de ses réponses. Le numéro de téléphone est l’identifiant ; un message est l’interface ; une réponse est un acte.
Le canal expose les mêmes règles métier que l’application (quittances ADD-04, relances RG-QUI-05, paiements partiels ADD-24, bail et enregistrement ADD-23) sur trois transports : SMS, WhatsApp et USSD. Il ne crée aucune règle métier nouvelle sur le fond ; il crée des règles de dialogue, de preuve, de sécurité et de consentement.
2. Principes

--- TABLE ---
RG-CNV-01 Aucun compte préalable | Un bailleur ou un locataire peut agir sur le canal sans avoir créé de compte. Le compte est créé implicitement à la première réponse valide (RG-CNV-10) et rattaché au numéro émetteur. Aucune donnée autre que le numéro n’est exigée à ce stade.
RG-CNV-02 Même moteur, trois transports | Les scénarios conversationnels sont définis une seule fois (intentions, états, messages) et rendus sur SMS, WhatsApp et USSD par des adaptateurs. Une règle métier ne peut jamais différer selon le transport.
RG-CNV-03 Le canal du destinataire | QAPRIL s’adresse à chaque personne par le canal sur lequel elle a répondu la dernière fois ; par défaut WhatsApp si le numéro y est joignable, sinon SMS. L’utilisateur peut changer de canal par le mot-clé CANAL. Le choix est mémorisé.
RG-CNV-04 Lisibilité | Tout message doit être compréhensible par une personne qui n’a jamais entendu parler de QAPRIL : il nomme l’émetteur (QAPRIL), le locataire ou le bailleur concerné, le bien, le montant, le mois, et l’action attendue avec les mots exacts à répondre. SMS : 160 caractères par segment, deux segments maximum. Pas d’abréviations techniques, pas de référence à un addendum.
RG-CNV-05 Jamais de fonds | Le canal ne manipule pas d’argent. Il constate, confirme, émet des documents et renvoie vers les moyens de paiement existants (Mobile Money du bailleur, lien de paiement via l’agrégateur). RG-ADD07-01 s’applique sans exception.
--- END TABLE ---

3. Scénario fondateur : déclaration et confirmation d’un paiement

--- TABLE ---
RG-CNV-06 Déclaration par le locataire | Un locataire inscrit déclare un paiement de loyer effectué hors QAPRIL (Mobile Money direct, espèces, virement) : montant, mois, moyen, date. La déclaration est bornée (RG-CNV-09). Un paiement effectué via un lien QAPRIL est déclaré automatiquement par l’agrégateur et n’a pas besoin de confirmation (RG-CNV-08).
RG-CNV-07 Message de confirmation au bailleur | QAPRIL envoie au bailleur : « [Prénom Nom] déclare vous avoir payé [montant] F pour le loyer de [mois], [bien]. Répondez OUI [code] pour émettre sa quittance, NON [code] pour contester. QAPRIL. » Le code est un identifiant court (2 à 3 caractères) propre au bail, pour lever toute ambiguïté quand un bailleur a plusieurs locataires. Sur WhatsApp, OUI et NON sont des boutons.
RG-CNV-08 Effet du OUI | La réponse OUI depuis le numéro du bailleur vaut reconnaissance du paiement : la quittance du terme est émise (RG-QUI-02, empreinte SHA-256), envoyée aux deux parties (lien PDF, SMS de synthèse), et le terme passe PAYÉE. Si le montant déclaré est inférieur au terme, les règles ADD-24 s’appliquent : reçu d’acompte, solde dû, et le bailleur est invité à choisir entre accepter, accepter avec plan ou refuser, par un second message.
RG-CNV-09 Bornes de la déclaration | Un locataire ne peut déclarer : un montant supérieur au terme  dû  plus le solde dû ; un mois déjà quittancé ; plus de deux déclarations en attente simultanément. Trois NON consécutifs du bailleur suspendent la faculté de déclarer du locataire pour 30 jours et ouvrent une médiation (RG-CNV-24).
RG-CNV-10 Création implicite du compte | Le premier OUI ou NON valide crée le compte bailleur au niveau 0 (RG-CNV-16), rattache le bail déclaré par le locataire, et déclenche l’envoi unique des conditions générales (lien) avec la mention : « En répondant, vous acceptez les conditions QAPRIL. Répondez STOP pour ne plus recevoir de messages. » Les CGU sont réputées acceptées à la seconde réponse.
RG-CNV-11 Effet du NON | Le paiement reste DÉCLARÉ_CONTESTÉ, visible comme tel par le locataire, qui peut joindre une preuve (capture Mobile Money, reçu). Le bailleur reçoit la preuve et peut confirmer. Sans accord sous 15 jours, le dossier est marqué « litige » et exportable ; QAPRIL n’arbitre pas.
RG-CNV-12 Silence | Sans réponse sous 72 h : rappel. Sans réponse sous 10 jours : le paiement reste DÉCLARÉ_NON_CONFIRMÉ, le locataire en est informé, et aucune quittance n’est émise. QAPRIL n’émet jamais une quittance que le bailleur n’a pas confirmée, sauf constat de paiement par l’agrégateur (RG-CNV-08).
--- END TABLE ---

4. Autres scénarios du canal

--- TABLE ---
Scénario | Déclencheur | Messages et réponses | Niveau requis
Rappel d’échéance | J-3 avant l’échéance du bail | Au locataire : montant, date, moyens de paiement, lien de paiement. Au bailleur : « Loyer de [mois] attendu le [date] de [locataire] ». | 0
Relances impayé (RG-QUI-05) | J+3, J+7, J+15 | Au locataire : relance graduée. Au bailleur : « [locataire] n’a pas payé [mois]. Répondez RELANCE [code] pour envoyer un rappel, PLAN [code] pour proposer un échéancier ». | 1
Quittance manquante | Locataire envoie QUIT [mois] | Renvoi du lien PDF de la quittance ; si non émise, déclenche RG-CNV-07 auprès du bailleur. | 0
Attestation de résidence | Locataire envoie ATTEST | Génération et envoi du lien ; vérifiable par QR ; valable 3 mois. | 0 (bail enregistré requis)
Récapitulatif mensuel | Le 1er du mois | Au bailleur : encaissé / attendu, impayés, liens vers les quittances. | 1
Identification | Bailleur envoie ID ou y est invité | Photo de la pièce d’identité sur WhatsApp ; rapprochement avec le nom du compte Mobile Money qui reçoit les loyers (ADD-22). Sur SMS : lien vers une page web mobile. | 0 → 1
Bail | Locataire ou bailleur envoie BAIL | Collecte guidée des éléments essentiels (bien, loyer, échéance, durée, dépôt) ; génération du bail conforme ; signature par code OTP envoyé à chaque partie (loi 2013-546). | 1 → 2
Enregistrement DGI (ADD-23) | Après signature, ou bailleur envoie DGI | Calcul des droits, lien de paiement vers l’agrégateur, reçu électronique renvoyé dans la conversation. | 2
Signalement (ADD-11) | Locataire envoie SIGNAL + photo | Création de l’incident ; le bailleur reçoit la description et répond PRIS [code] ou ARTISAN [code]. | 0
Congé | Locataire envoie CONGE | Génération de la lettre de congé conforme au préavis du bail, horodatée, envoyée au bailleur. | 0
Préférences | CANAL, STOP, AIDE, LANGUE | Changement de canal, arrêt des messages (sauf ceux exigés par un bail en cours : confirmations et relances, sur option), aide, langue (français ; autres langues à l’étude). | 0
--- END TABLE ---

5. Transports

--- TABLE ---
RG-CNV-13 SMS | Transport universel de secours et de notification : confirmations, rappels, relances, liens. Expéditeur alphanumérique « QAPRIL » enregistré auprès de l’agrégateur SMS et de l’ARTCI. Réponses par mots-clés en majuscules ou minuscules, accents ignorés. Coût unitaire suivi ; le SMS n’est jamais utilisé pour un contenu disponible sur WhatsApp quand l’utilisateur y est joignable.
RG-CNV-14 WhatsApp | Transport principal (API WhatsApp Business via un fournisseur agréé). Menus à boutons, documents PDF dans le fil, photos (identité, état des lieux, signalements), modèles de messages approuvés par Meta pour les messages sortants hors fenêtre de 24 h. Le numéro WhatsApp QAPRIL est unique et vérifié.
RG-CNV-15 USSD | Transport pour téléphones basiques et zones sans data, soumis à un accord opérateur. Menu de cinq entrées maximum par écran, sessions de 180 s, aucune donnée personnelle affichée au-delà du prénom et du code du bail. Le code court USSD est négocié dans le cadre des partenariats Mobile Money.
--- END TABLE ---

6. Niveaux d’engagement

--- TABLE ---
RG-CNV-16 Échelle | Niveau 0 Répondant : confirme des paiements, reçoit rappels et quittances. Niveau 1 Identifié : pièce d’identité rapprochée du compte Mobile Money ; débloque relances automatiques, récapitulatif, signalements. Niveau 2 Contractant : bail signé sur le canal, enregistrement DGI, attestation de résidence pour son locataire. Niveau 3 Application : multi-biens, mandats, vivier, ventes. Nul ne monte de niveau sans y trouver un intérêt explicite ; QAPRIL propose, n’impose pas.
RG-CNV-17 Continuité | Un utilisateur qui installe l’application retrouve l’intégralité de son historique conversationnel (baux, quittances, décisions). Un utilisateur de l’application peut à tout moment revenir au canal. Les deux sont des vues d’un même compte.
RG-CNV-18 Locataire sans smartphone | Les fonctions de base du locataire (quittances, attestation, déclaration de paiement, congé, signalement) sont disponibles sur SMS et USSD. Le passeport locatif et le vivier restent dans l’application, avec un résumé consultable par SMS (PASS).
--- END TABLE ---

7. Preuve, sécurité et identité

--- TABLE ---
RG-CNV-19 Valeur probante | Chaque réponse est journalisée avec numéro émetteur, transport, horodatage serveur, contenu brut et contenu interprété, identifiant du message auquel elle répond, et empreinte SHA-256 de l’ensemble. Le journal est joint au dossier du bail et exportable. Les CGU qualifient la réponse OUI de reconnaissance de paiement au sens de l’article 1315 et suivants du Code civil et de la loi 2013-546.
RG-CNV-20 Rattachement du numéro | Le numéro est l’identifiant. Un changement de numéro passe par une procédure assistée (ancien numéro si disponible, pièce d’identité, question sur le bail) et est journalisé. Un numéro ne peut être rattaché qu’à un compte.
RG-CNV-21 Seuils et code PIN | Toute confirmation portant sur plus de 500 000 FCFA ou plus de deux termes à la fois, toute signature de bail, tout enregistrement DGI et tout changement de coordonnées de paiement exigent un code PIN à 4 chiffres défini à la première opération sensible. Trois erreurs bloquent le canal 24 h et notifient par un second canal. Seuils paramétrables (ADD-19).
RG-CNV-22 Risque SIM et téléphone prêté | Un numéro inactif sur le canal depuis 90 jours repasse par une vérification légère avant toute opération sensible. Une confirmation reçue à moins de 60 secondes de l’envoi, de façon répétée, est signalée (automate). Les messages sortants ne contiennent jamais de lien de connexion sans expiration.
RG-CNV-23 Usurpation de l’expéditeur | QAPRIL ne demande jamais de code, de mot de passe, de numéro de carte ni de virement par message. Cette phrase figure dans le premier message et dans l’aide. Les liens pointent exclusivement vers des domaines QAPRIL publiés.
RG-CNV-24 Médiation | En cas de contestation répétée (RG-CNV-09, 11), un conseiller QAPRIL contacte les deux parties par le canal, consigne les positions et propose une issue ; QAPRIL ne tranche pas et le dit explicitement.
--- END TABLE ---

8. Consentement et données personnelles

--- TABLE ---
RG-CNV-25 Premier contact | Le premier message adressé à une personne non inscrite indique : qui l’envoie (QAPRIL), pourquoi (son locataire ou son bailleur l’a demandé, nommément), ce qu’il peut faire (OUI / NON), et comment ne plus rien recevoir (STOP). Aucune relance commerciale ; au plus deux rappels d’un même message.
RG-CNV-26 STOP | STOP arrête tous les messages non liés à une obligation en cours. Les confirmations de paiement et relances relatives à un bail actif continuent uniquement si l’utilisateur répond STOP SAUF BAIL ; sinon, le locataire est informé que son bailleur ne souhaite plus être contacté par QAPRIL et le paiement reste déclaré, non confirmé.
RG-CNV-27 Minimisation | Un message ne contient que ce qui est nécessaire à l’action : jamais de pièce d’identité, jamais de numéro de compte complet, jamais l’identité du bailleur dans un message au locataire (RG-CONF-01). Les conversations sont chiffrées au repos, conservées 10 ans pour la partie probante, 12 mois pour le reste.
RG-CNV-28 Déclaration ARTCI | Le traitement (numéros, contenus, journal probant) est déclaré à l’ARTCI avec le canal conversationnel comme finalité distincte ; les fournisseurs SMS et WhatsApp sont sous-traitants contractuels avec clauses de confidentialité et de localisation des données.
--- END TABLE ---

9. Exploitation et mesure

--- TABLE ---
RG-CNV-29 Coûts et priorité des transports | Le coût par conversation est suivi par transport et par scénario. Règle d’envoi : WhatsApp si joignable, sinon SMS ; USSD à l’initiative de l’utilisateur. Les partenariats opérateurs peuvent prendre en charge SMS et USSD ; l’architecture doit permettre la facturation au partenaire.
RG-CNV-30 Indicateurs | Taux de réponse au premier message (cible > 50 % sous 72 h), délai médian de confirmation, part des paiements confirmés par OUI, part des comptes créés par le canal, progression par niveau, taux de STOP, coût par quittance émise. Revue mensuelle ; un scénario dont le taux de réponse est inférieur à 30 % est réécrit (RG-CNV-04).
--- END TABLE ---

10. Messages de référence
Les textes ci-dessous sont normatifs pour le SMS ; les versions WhatsApp remplacent les mots-clés par des boutons. Les crochets sont remplacés par les valeurs ; les codes sont ceux du bail.

--- TABLE ---
Message | Texte (SMS)
Confirmation de paiement | QAPRIL : Adjoua KOUAME déclare vous avoir payé 150 000 F pour le loyer de novembre, Appartement A1. Répondez OUI A1 pour émettre sa quittance, NON A1 pour contester.
Premier contact (ajout) | Votre locataire vous a inscrit sur QAPRIL pour recevoir ses quittances. QAPRIL ne demande jamais de code ni d’argent par message. Répondez STOP pour ne plus recevoir de messages.
Quittance émise (bailleur) | QAPRIL : quittance de novembre émise pour Adjoua KOUAME, 150 000 F, n° QUI-2026-11-0417. Elle lui a été envoyée. Voir : [lien]
Quittance émise (locataire) | QAPRIL : votre quittance de novembre (150 000 F) est disponible : [lien]. Conservez ce SMS, la quittance porte une empreinte numérique.
Paiement partiel | QAPRIL : Yao KOUASSI déclare 100 000 F sur 135 000 F dus (août, sept., oct.), Porte 1. Répondez OUI C1 pour accepter (2 quittances + 1 reçu d’acompte, solde 35 000 F), PLAN C1 pour un échéancier, NON C1 pour refuser.
Relance proposée | QAPRIL : Mariam KONE n’a pas payé octobre (45 000 F), Porte 3, J+7. Un rappel automatique lui a été envoyé. Répondez PLAN C3 pour proposer un échéancier.
Rappel sans réponse | QAPRIL : rappel — Adjoua KOUAME attend la confirmation de son paiement de novembre (150 000 F). Répondez OUI A1 ou NON A1.
Demande d’identification | QAPRIL : pour activer les relances automatiques et le récapitulatif mensuel, envoyez la photo de votre pièce d’identité sur WhatsApp au [numéro] ou ouvrez [lien]. Facultatif.
Code PIN | QAPRIL : cette opération engage plus de 500 000 F. Répondez avec votre code à 4 chiffres. Jamais de code demandé par appel ou par un autre numéro.
--- END TABLE ---

11. Modifications induites

--- TABLE ---
Pièce | Modification
ADD-13 Notifications | Refondu : les notifications deviennent des scénarios conversationnels bidirectionnels ; toute notification sortante doit prévoir les réponses possibles.
ADD-02 / ADD-03 | Compte à création implicite (niveau 0) ; identité et KYC différés ; numéro comme identifiant unique.
ADD-04 Quittances | Nouvel événement d’émission : confirmation conversationnelle du bailleur (RG-CNV-08) ; statut DÉCLARÉ_NON_CONFIRMÉ / DÉCLARÉ_CONTESTÉ.
ADD-17 Sécurité | PIN conversationnel, seuils, journal probant, règles anti-usurpation d’expéditeur.
ADD-19 Administration | Paramètres : seuils, délais de rappel, coûts, transports actifs par opérateur, textes des messages (versionnés).
ADD-22 / ADD-23 / ADD-24 | Exposés sur le canal : identification par photo, enregistrement DGI depuis la conversation, décisions sur paiements partiels par mots-clés.
Prototypes | Écran « Fil WhatsApp du bailleur » simulant les scénarios RG-CNV-07 à 12, pour démonstration à la DGI et aux opérateurs.
--- END TABLE ---

12. Modèle de données

--- TABLE ---
Table | Champs clés
contacts | numero  (unique),  compte_id  ( nullable  au niveau 0),  canal_prefere ,  statut_stop ,  derniere_activite , niveau
conversations | id,  contact_id , transport, scenario,  etat ,  ouverte_le ,  fermee_le
messages | conversation_id , sens (in/out), transport,  texte_brut ,  texte_interprete , intention,  mots_cles ,  reference_message ,  horodatage_serveur , sha256, cout
declarations_paiement | bail_id ,  locataire_id , montant, mois, moyen, date, statut (DECLARE, CONFIRME, CONTESTE, NON_CONFIRME),  preuve_url ,  message_confirmation_id ,  decide_le
codes_bail | bail_id ,  code_court  (2-3 car., unique par bailleur)
pins | contact_id ,  hash_pin ,  defini_le , erreurs,  bloque_jusque
modeles_messages | cle , transport, langue, texte, version,  approuve_par ,  approuve_le  (modèles WhatsApp : identifiant Meta)
--- END TABLE ---

Fin de l’ADD-26.