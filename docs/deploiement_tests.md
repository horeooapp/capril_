# QAPRIL - Cadrage Tests et Déploiement

## 1. Tests E2E et Unitaires

Pour assurer la stabilité de la plateforme QAPRIL, une stratégie de test automatisée doit être implémentée avant le passage à l'échelle.

### Outils Recommandés :
- **Jest & React Testing Library** : Pour les composants UI (boutons, formulaires d'authentification).
- **Playwright ou Cypress** : Pour les tests end-to-end (E2E), simulant le parcours complet de :
  1. Connexion en tant que bailleur.
  2. Création d'un contrat locatif.
  3. Génération d'une quittance (avec validation du PDF généré).
  4. Connexion en tant que locataire pour vérifier l'accès au document.

### Plan de couverture prioritaire :
- Processus complet de création et validation d'une quittance (le coeur de la solution).
- Vérification du mécanisme d'authentification sans mot de passe (Magic Links / OTP).

---

## 2. Déploiement en Production

La solution QAPRIL (Next.js + Prisma) est adaptée pour un déploiement cloud moderne. 

### Architecture Recommandée :
1. **Frontend et API Serverless** : Déploiement sur **Vercel** (optimisé pour Next.js) ou sur **Render/Railway** avec Docker.
2. **Base de données** : Le fichier SQLite local doit être remplacé par **PostgreSQL** hébergé (ex: Supabase, Neon, ou AWS RDS) afin de résister à la charge et aux accès concurrents.
3. **Mails (SMTP)** : Continuer avec un fournisseur robuste et certifié contre le SPAM en CI (ex: Postmark, SendGrid ou Amazon SES) au lieu de GMail/Yahoo basique pour que les quittances arrivent toujours.

### Variables d'Environnement de Production requises :
```env
NEXT_PUBLIC_APP_URL="https://www.qapril.ci"    # URL finale de prod
DATABASE_URL="postgresql://user:pass@host/db"  # Base Postgres (très important)
AUTH_SECRET="un_nouveau_secret_long_et_securise" # Généré avec 'openssl rand -base64 32'
EMAIL_SERVER="smtp://user:pass@smtp.provider.com:587"
EMAIL_FROM="noreply@qapril.ci"
```

## 3. Mise en conformité légale et RGPD / Loi locale de protection
Avant lancement public, intégrer les documents de gestion de cookies, conditions d'utilisation, et le consentement de collecte de données pour le compte du Ministère ou de la faîtière régulatoire.
