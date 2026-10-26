# Guide de Déploiement VPS — QAPRIL (Docker)

Ce guide détaille la mise en production de **QAPRIL** sur un VPS (Ubuntu / Debian / AlmaLinux) avec Docker, Docker Compose, PostgreSQL, Redis et Nginx/Certbot (Reverse Proxy SSL).

---

## 1. Prérequis sur le VPS

Connectez-vous en SSH à votre VPS et installez Docker et Docker Compose :

```bash
# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Installation de Docker et outils de base
sudo apt install -y curl git ufw wget

# Installation de Docker Engine officiel (Ubuntu/Debian)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Activer et démarrer le service Docker
sudo systemctl enable --now docker
```

*(Rebranchez votre session SSH pour appliquer les droits du groupe `docker`)*

---

## 2. Cloner le Projet sur le VPS

```bash
cd /opt
sudo git clone <URL_DU_DEPOT_GIT> qapril
sudo chown -R $USER:$USER /opt/qapril
cd /opt/qapril
```

---

## 3. Configuration des Variables d'Environnement

Copiez ou créez votre fichier [.env.docker](file:///e:/Projets_Cornerstone/site_crnstneros/capril_/.env.docker) sur le serveur :

```bash
cp .env.docker.example .env.docker # ou éditez directement .env.docker
nano .env.docker
```

### Paramètres critiques à configurer :
1. **Base de données** :
   - `POSTGRES_USER`: identifiant DB (ex: `qapril_user`)
   - `POSTGRES_PASSWORD`: mot de passe robuste (généré aléatoirement)
   - `POSTGRES_DB`: nom de la DB (ex: `qapril_prod`)
2. **Redis** :
   - `REDIS_PASSWORD`: mot de passe Redis (recommandé en production)
3. **Sécurité & Auth** :
   - `AUTH_SECRET` & `NEXTAUTH_SECRET`: générer avec `openssl rand -base64 32`
   - `NEXTAUTH_URL`: `https://votre-domaine.com`
   - `NEXT_PUBLIC_APP_URL`: `https://votre-domaine.com`
   - `JWT_PRIVATE_KEY` et `JWT_PUBLIC_KEY`: vos clés RSA RS256
4. **Services Externes** :
   - Wave API (`WAVE_API_KEY`)
   - Resend / SMTP Hostinger (`AUTH_RESEND_KEY`, `EMAIL_SERVER`)
   - OpenWA / SMS Gateway (`OPENWA_API_URL`, etc.)
   - Anthropic (`ANTHROPIC_API_KEY`)

---

## 4. Déploiement avec Docker Compose

Rendez le script de déploiement exécutable et lancez-le :

```bash
chmod +x deploy-docker.sh
./deploy-docker.sh
```

Ou manuellement via Docker Compose :
```bash
docker compose up -d --build
```

### Vérifier l'état :
```bash
# Voir les conteneurs actifs
docker compose ps

# Consulter les logs en temps réel
docker compose logs -f app
docker compose logs -f postgres
docker compose logs -f migrate
```

L'application écoute localement sur le port `3000` du VPS.

---

## 5. Configuration Nginx + HTTPS (Certbot)

Pour sécuriser l'accès avec un domaine et SSL :

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

Créez le fichier de configuration Nginx `/etc/nginx/sites-available/qapril` :

```nginx
server {
    server_name votre-domaine.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts pour requêtes longues / Webhooks
        proxy_read_timeout 90;
        proxy_connect_timeout 90;
    }
}
```

Activez le site et obtenez le certificat SSL :
```bash
sudo ln -s /etc/nginx/sites-available/qapril /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Certificat SSL Let's Encrypt automatique
sudo certbot --nginx -d votre-domaine.com
```

---

## 6. Pare-feu (UFW)

Sécurisez les accès ouverts sur le VPS :
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH (ou votre port SSH personnalisé)
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```
*(Remarque : Le port 3000 de Next.js, 5432 de PostgreSQL et 6379 de Redis ne sont pas exposés sur Internet, ils restent cloisonnés dans le réseau Docker et/ou localhost).*

---

## 7. Mises à Jour Futures

Pour déployer les prochaines mises à jour :
```bash
cd /opt/qapril
./deploy-docker.sh
```
Le script s'occupe de faire le `git pull`, reconstruire l'image, exécuter les migrations Prisma sans coupure prolongée, et vérifier la santé de l'application via `/api/health`.
