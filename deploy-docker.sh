#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────
# QAPRIL — Script de déploiement automatique sur VPS (Docker)
# Usage: ./deploy-docker.sh
# ──────────────────────────────────────────────────────────────────
set -euo pipefail

echo "=========================================="
echo "🚀 Déploiement QAPRIL sur VPS (Docker)"
echo "=========================================="

# 1. Vérification du fichier d'environnement
if [ ! -f .env.docker ]; then
  echo "❌ ERREUR : Le fichier .env.docker est introuvable."
  echo "Créez .env.docker avec vos variables de production avant de déployer."
  exit 1
fi

# 2. Récupération des dernières modifications (si dépôt git)
if [ -d .git ]; then
  echo "📥 Récupération des modifications Git..."
  git pull origin main || echo "⚠️ Attention : git pull a échoué ou des changements locaux existent."
fi

# 3. Construction des images et démarrage des conteneurs
echo "🏗️ Construction des images et lancement des services..."
docker compose pull || true
docker compose up -d --build --remove-orphans

# 4. Attente et vérification de la santé des conteneurs
echo "⏳ Vérification de l'état des conteneurs..."
sleep 5
docker compose ps

echo "🏥 Test du point de contrôle de santé (/api/health)..."
MAX_RETRIES=12
RETRY_COUNT=0
HEALTH_OK=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if docker compose exec -T app wget -qO- http://127.0.0.1:3000/api/health >/dev/null 2>&1; then
    HEALTH_OK=true
    break
  fi
  echo "En attente du démarrage complet de l'application... ($((RETRY_COUNT+1))/$MAX_RETRIES)"
  sleep 5
  RETRY_COUNT=$((RETRY_COUNT+1))
done

if [ "$HEALTH_OK" = true ]; then
  echo "✅ Application démarrée et opérationnelle avec succès !"
else
  echo "⚠️ L'application met du temps à répondre ou le conteneur a rencontré une erreur."
  echo "Affichage des derniers logs :"
  docker compose logs --tail=50 app
fi

echo "=========================================="
echo "🎉 Fin de la procédure de déploiement."
echo "=========================================="
