#!/bin/bash

echo "🚀 Début du déploiement de QAPRIL..."

# 1. Installation des dépendances
echo "📦 Installation des dépendances..."
npm install

# 2. Génération du client Prisma (CRUCIAL)
echo "🗄️ Génération du client Prisma..."
npx prisma generate

# 3. Build Next.js
echo "🏗️ Compilation du projet Next.js..."
npm run build

# 4. Redémarrage PM2
echo "🔄 Redémarrage de l'application via PM2..."
pm2 startOrRestart ecosystem.config.js --env production

echo "✅ Déploiement terminé avec succès !"
