import docx
from docx.shared import Pt, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH

doc = docx.Document()
section = doc.sections[0]
section.left_margin = Inches(1)
section.right_margin = Inches(1)

RED = (0xC0, 0x39, 0x2B)
ORANGE = (0xE6, 0x7E, 0x22)
GREEN = (0x27, 0xAE, 0x60)
DARK = (0x12, 0x23, 0x45)
GREY = (0x2C, 0x3E, 0x50)

def heading(doc, text, level, color):
    h = doc.add_heading(text, level=level)
    for run in h.runs:
        run.font.color.rgb = RGBColor(*color)
    return h

def finding(doc, num, sev, sev_color, title, detail, fix):
    p = doc.add_paragraph()
    r = p.add_run("[%s] %s: %s" % (sev, num, title))
    r.bold = True
    r.font.color.rgb = RGBColor(*sev_color)
    r.font.size = Pt(11)
    d = doc.add_paragraph(detail)
    d.paragraph_format.left_indent = Inches(0.3)
    f = doc.add_paragraph()
    f.paragraph_format.left_indent = Inches(0.3)
    fr = f.add_run("Correction : ")
    fr.bold = True
    fr.font.color.rgb = RGBColor(*GREEN)
    f.add_run(fix)
    doc.add_paragraph()

# ---- TITLE ----
t = doc.add_heading("RAPPORT D'AUDIT DE SECURITE - QAPRIL", 0)
t.alignment = WD_ALIGN_PARAGRAPH.CENTER
for r in t.runs:
    r.font.color.rgb = RGBColor(*DARK)
    r.font.size = Pt(18)

doc.add_paragraph("Reference : QAPRIL/SEC-AUDIT/001/2026")
doc.add_paragraph("Destinataires : Frederic Soumahoro | futurs Lead Developers")
doc.add_paragraph("Statut : CONFIDENTIEL - Document de travail interne")
doc.add_paragraph("Date : Juin 2026")
doc.add_paragraph()

heading(doc, "Resume Executif", 1, DARK)
doc.add_paragraph(
    "9 failles identifiees : 4 CRITIQUE, 4 IMPORTANT, 1 STANDARD. "
    "Aucune ne permet une exploitation directe sans acces prealable. "
    "Toutefois, plusieurs failles combinees permettent a un utilisateur authentifie malveillant "
    "d'escalader ses privileges, de falsifier des paiements, ou de signer un bail frauduleusement. "
    "Correction des failles CRITIQUE requise avant toute mise en production elargie."
)
doc.add_paragraph()

# ---- SUMMARY TABLE ----
heading(doc, "Tableau des Failles Detectees", 2, GREY)
table = doc.add_table(rows=1, cols=4)
table.style = 'Table Grid'
for i, h in enumerate(["#", "Severite", "Titre", "Fichier(s) concernes"]):
    table.rows[0].cells[i].text = h
    table.rows[0].cells[i].paragraphs[0].runs[0].bold = True

rows_data = [
    ("F-01", "CRITIQUE",  "Escalade de role via le body auth",           "src/app/api/mobile/auth/route.ts"),
    ("F-02", "CRITIQUE",  "Paiement sans verification IDOR",             "src/app/api/mobile/pay-rent/route.ts"),
    ("F-03", "CRITIQUE",  "OTP faible (Math.random non-crypto)",         "auth/route.ts, lease.actions.ts, +6 fichiers"),
    ("F-04", "CRITIQUE",  "OTP signature non expirant, pas de blocage",  "shared/leases/[id]/sign, lease.actions.ts"),
    ("F-05", "IMPORTANT", "Fuite d'erreurs techniques au client",        "route-handlers.ts + 50+ routes API"),
    ("F-06", "IMPORTANT", "Aucun rate-limiting sur les routes",          "Toutes les routes /api/*"),
    ("F-07", "IMPORTANT", "Montant paiement dicte par le client",        "src/app/api/mobile/pay-rent/route.ts"),
    ("F-08", "IMPORTANT", "JWT 30j sans mecanisme de revocation",        "src/lib/mobile-auth.ts"),
    ("F-09", "STANDARD",  "Secrets production exposes au LLM cloud",     ".env (environnement local dev)"),
]
for r in rows_data:
    cells = table.add_row().cells
    for i, v in enumerate(r):
        cells[i].text = v

doc.add_page_break()

# ---- DETAILED FINDINGS ----
heading(doc, "Analyse Detaillee par Faille", 1, DARK)

finding(doc, "F-01", "CRITIQUE", RED,
    "Escalade de Privilege (Role Injection)",
    ("Fichier : src/app/api/mobile/auth/route.ts, ligne 109\n\n"
     "Code faillible :\n"
     "    role: role || user.role || 'TENANT'\n\n"
     "La variable 'role' vient du corps de la requete HTTP sans validation. "
     "Un attaquant peut envoyer { email, otp, role: 'ADMIN' } lors d'une connexion OTP normale "
     "et recevoir en retour un JWT signé avec le role ADMIN. "
     "Si ce token est ensuite accepte par les endpoints de gestion, l'attaquant dispose "
     "de privileges administrateurs sans y avoir droit."),
    ("Supprimer entierement le parametre 'role' du body de la requete. "
     "Le role doit toujours etre lu depuis la base de donnees. "
     "Ligne 109 : remplacer par   role: user.role || 'TENANT'")
)

finding(doc, "F-02", "CRITIQUE", RED,
    "Paiement sans Verification d'Appartenance (IDOR)",
    ("Fichier : src/app/api/mobile/pay-rent/route.ts\n\n"
     "Apres verification du JWT, le code recupere le bail par leaseId transmis par le client "
     "mais NE VERIFIE PAS que lease.tenantId === payeurId. "
     "Un locataire authentifie (bail A) peut envoyer l'ID d'un bail (B) qui ne lui appartient pas "
     "et le serveur creera une quittance frauduleuse pour ce bail etranger.\n\n"
     "Consequences concretes :\n"
     "- Marquer n'importe quel loyer comme paye sans payer\n"
     "- Debiter le wallet du bailleur d'un bien qu'on n'occupe pas\n"
     "- Generer des quittances pour n'importe quel bail du systeme"),
    ("Ajouter immediatement apres la recuperation du bail (ligne ~44) :\n"
     "    if (lease.tenantId !== payeurId) { return 403 Access Denied; }\n"
     "Cette verification est absente du code et doit etre prioritaire.")
)

finding(doc, "F-03", "CRITIQUE", RED,
    "Generation d'OTP Cryptographiquement Faible (Math.random)",
    ("8 occurrences dans le code de production :\n"
     "- src/app/api/mobile/auth/route.ts (L.10)\n"
     "- src/app/api/mobile/shared/leases/[id]/otp/route.ts (L.40)\n"
     "- src/actions/lease.actions.ts (L.348, L.365, L.387, L.481)\n"
     "- src/actions/auth.ts (L.12)\n"
     "- src/app/api/v1/auth/otp/request/route.ts (L.6)\n\n"
     "Math.random() est un PRNG non cryptographique dont les sorties sont predictibles. "
     "Pour une signature electronique a valeur legale, l'imprevisibilite de l'OTP est "
     "une exigence fondamentale. Un attaquant qui observe plusieurs OTP successifs peut "
     "predire les suivants."),
    ("Remplacer toutes les occurrences par :\n"
     "    const otp = crypto.randomInt(100000, 999999).toString();\n"
     "crypto.randomInt est disponible nativement en Node.js 18+ sans dependance externe.")
)

finding(doc, "F-04", "CRITIQUE", RED,
    "OTP de Signature Non Expirant et Sans Compteur d'Echecs",
    ("Fichiers : lease.actions.ts (L.409), /api/mobile/shared/leases/[id]/sign/route.ts (L.50)\n\n"
     "L'OTP est stocke EN CLAIR dans la colonne signingOtp de la table Lease. "
     "Il n'y a ni champ d'expiration ni limite de tentatives.\n\n"
     "Risques identifies :\n"
     "- Brute-force illimite : 899 999 combinaisons testables via script en quelques minutes\n"
     "- OTP indefiniment valide : un bail reste signable des semaines apres l'emission du code\n"
     "- OTP en clair en base : lisible si acces DB compromis (ex: injection SQL, dump)"),
    ("1. Ajouter le champ signingOtpExpiresAt dans Prisma (duree max : 15 min)\n"
     "2. Ajouter otpFailedAttempts, bloquer apres 5 echecs et generer un nouveau code\n"
     "3. Stocker le hash SHA-256 de l'OTP, jamais l'OTP en clair")
)

finding(doc, "F-05", "IMPORTANT", ORANGE,
    "Fuite d'Informations Techniques dans les Reponses d'Erreur",
    ("Plus de 50 routes retournent error.message directement au client HTTP :\n"
     "    return NextResponse.json({ error: error.message }, { status: 500 });\n\n"
     "Les messages d'erreur Prisma contiennent des noms de tables, colonnes, et contraintes. "
     "Ex: 'Foreign key constraint failed on the field: leaseId' revele le nom du champ. "
     "Un attaquant peut provoquer des erreurs controlees pour cartographier la base de donnees. "
     "Fichiers principaux : route-handlers.ts (8 occurrences), +50 routes API diverses."),
    ("Centraliser dans route-handlers.ts un handler d'erreur qui :\n"
     "1. Logue le vrai message cote serveur (console.error)\n"
     "2. Ne retourne au client que : { error: 'Une erreur interne est survenue.' }")
)

finding(doc, "F-06", "IMPORTANT", ORANGE,
    "Absence Totale de Rate-Limiting",
    ("Recherche dans tout le code source : 0 occurrence de 'rateLimit' ou 'rate-limit'.\n\n"
     "Toutes les routes sensibles acceptent un nombre illimite de requetes par secondes :\n"
     "- Brute-force OTP d'authentification : illimite (renforce F-03 et F-04)\n"
     "- Spam SMS : l'attaquant peut declencher des milliers de SMS (cout direct)\n"
     "- Depassement de quotas des API tierces : CinetPay, Anthropic, SMS Gateway"),
    ("Integrer @upstash/ratelimit (compatible Next.js/Edge) ou configurer Nginx/Cloudflare.\n"
     "Minimum : 5 tentatives OTP / 15 min / IP sur les routes /api/mobile/auth et /api/mobile/shared/*/otp")
)

finding(doc, "F-07", "IMPORTANT", ORANGE,
    "Montant du Paiement Dicte par le Client (Price Tampering)",
    ("Fichier : src/app/api/mobile/pay-rent/route.ts, ligne 80\n\n"
     "Le code source lui-meme commente le risque :\n"
     "    const totalAmount = amount; // On suppose que le montant envoye correspond au reglement\n\n"
     "Un client malveillant peut intercepter l'appel avec un proxy (Burp Suite) et modifier "
     "amount: 150000 en amount: 1. La quittance sera generee pour 1 FCFA et le bail marque paye."),
    ("Ne jamais faire confiance au montant du client pour les paiements.\n"
     "Remplacer 'const totalAmount = amount' par :\n"
     "    const totalAmount = lease.rentAmount + (lease.chargesAmount || 0);")
)

finding(doc, "F-08", "IMPORTANT", ORANGE,
    "JWT Mobile de 30 Jours Sans Revocation Possible",
    ("Fichier : src/lib/mobile-auth.ts, ligne 17\n"
     "    .setExpirationTime('30d')\n\n"
     "En cas de vol de telephone ou de session hijacking, le token reste valide 30 jours. "
     "Il n'existe aucun endpoint de deconnexion forcee, aucune blacklist et aucun refresh token. "
     "Il est impossible de revoquer un acces compromis avant expiration naturelle."),
    ("Reduire l'acces token a 7 jours maximum.\n"
     "Implementer : access token 1h + refresh token 30j stocke en base de donnees.\n"
     "Ajouter un endpoint POST /api/mobile/auth/logout qui invalide le refresh token en base.")
)

finding(doc, "F-09", "STANDARD", GREEN,
    "Secrets de Production Exposes au LLM Cloud",
    ("Le fichier .env local contient des cles de production actives lues par l'agent "
     "Google Antigravity (mode cloud) pendant le developpement :\n"
     "- Mot de passe PostgreSQL : QaprilSecure2026!\n"
     "- Cle API Resend email : re_YRdesQfm_...\n"
     "- Mot de passe SMTP Hostinger : Anny_jay206\n"
     "- Cle API Anthropic complete et fonctionnelle\n"
     "- Token JWT complet pour le CRM Twenty\n\n"
     "Meme si Google s'engage a ne pas utiliser les donnees IDE pour l'entrainement, "
     "la politique de retention des logs des serveurs cloud constitue un risque residuel."),
    ("ROTATION IMMEDIATE de toutes ces cles.\n"
     "A l'avenir : utiliser un .env.example sans valeurs reelles. "
     "Injecter les vraies valeurs via GitHub Actions Secrets ou un vault (Doppler, HashiCorp Vault).")
)

doc.add_page_break()

# ---- ACTION PLAN ----
heading(doc, "Plan d'Action Prioritise", 1, DARK)
plan = doc.add_table(rows=1, cols=4)
plan.style = 'Table Grid'
for i, h in enumerate(["Priorite", "Action requise", "Delai", "Responsable"]):
    plan.rows[0].cells[i].text = h
    plan.rows[0].cells[i].paragraphs[0].runs[0].bold = True

actions = [
    ("1 - URGENT",   "F-09 : Rotation immediate de tous les secrets",              "< 24h",       "Frederic + Achille"),
    ("2 - URGENT",   "F-01 : Supprimer 'role' du body, lire depuis DB",            "< 48h",       "Lead Dev"),
    ("3 - URGENT",   "F-02 : Ajouter verification IDOR dans pay-rent",             "< 48h",       "Lead Dev"),
    ("4 - URGENT",   "F-03 : Remplacer Math.random par crypto.randomInt",          "< 1 semaine", "Lead Dev"),
    ("5 - URGENT",   "F-04 : Ajouter expiration + compteur echecs OTP",            "< 1 semaine", "Lead Dev"),
    ("6 - IMPORTANT","F-07 : Ne plus accepter le montant du client",               "< 2 semaines","Lead Dev"),
    ("7 - IMPORTANT","F-05 : Masquer erreurs techniques dans les reponses API",    "< 2 semaines","Lead Dev"),
    ("8 - IMPORTANT","F-06 : Rate-limiting sur toutes les routes sensibles",       "< 1 mois",    "Lead Dev + DevOps"),
    ("9 - STANDARD", "F-08 : Reduire JWT a 7j, implementer refresh + revocation",  "< 1 mois",    "Lead Dev"),
]
for a in actions:
    row = plan.add_row().cells
    for i, v in enumerate(a):
        row[i].text = v

doc.add_paragraph()
heading(doc, "Conclusion", 2, GREY)
doc.add_paragraph(
    "La base de code QAPRIL est fonctionnellement solide. L'architecture (Prisma ORM, "
    "Next.js App Router, transactions atomiques, idempotence des webhooks CinetPay) est coherente. "
    "Cependant, la generation agentique a introduit plusieurs raccourcis de securite typiques "
    "qui doivent etre corriges avant un deploiement a grande echelle avec de vraies donnees financieres. "
    "Les 4 failles CRITIQUE (F-01 a F-04) peuvent etre corrigees en une journee de travail par un "
    "developpeur senior. L'investissement en securite est modeste compare aux risques financiers et "
    "legaux qu'elles representent sur une plateforme de gestion locative."
)

doc.save("QAPRIL_Audit_Securite.docx")
print("Rapport genere avec succes")
