#!/bin/bash

# Script d'installation semi-automatique pour un runner GitHub
# A exécuter sur le serveur cible (VPS)

set -e

# --- Configuration ---
RUNNER_VERSION="2.316.1" # Version stable actuelle
RUNNER_FOLDER="actions-runner"
GITHUB_USER="github"

echo "-------------------------------------------------------"
echo "🚀 Préparation de l'installation du runner GitHub"
echo "-------------------------------------------------------"

# 1. Vérification des dépendances système
echo "📦 Installation des dépendances système..."
sudo apt update
sudo apt install -y curl tar libicu-dev build-essential libssl-dev libkrb5-3 zlib1g

# 2. Création de l'utilisateur github s'il n'existe pas
if ! id "$GITHUB_USER" &>/dev/null; then
    echo "👤 Création de l'utilisateur $GITHUB_USER..."
    sudo useradd -m -s /bin/bash "$GITHUB_USER"
    sudo usermod -aG sudo "$GITHUB_USER"
    echo "$GITHUB_USER ALL=(ALL) NOPASSWD:ALL" | sudo tee /etc/sudoers.d/github
fi

# 3. Préparation du dossier
echo "📁 Configuration du dossier $RUNNER_FOLDER..."
sudo -u "$GITHUB_USER" mkdir -p "/home/$GITHUB_USER/$RUNNER_FOLDER"
cd "/home/$GITHUB_USER/$RUNNER_FOLDER"

# 4. Téléchargement du runner
if [ ! -f "actions-runner-linux-x64-$RUNNER_VERSION.tar.gz" ]; then
    echo "📥 Téléchargement du runner v$RUNNER_VERSION..."
    sudo -u "$GITHUB_USER" curl -o "actions-runner-linux-x64-$RUNNER_VERSION.tar.gz" -L \
        "https://github.com/actions/runner/releases/download/v$RUNNER_VERSION/actions-runner-linux-x64-$RUNNER_VERSION.tar.gz"
fi

# 5. Extraction
echo "📂 Extraction..."
sudo -u "$GITHUB_USER" tar xzf "./actions-runner-linux-x64-$RUNNER_VERSION.tar.gz"

# 6. Configuration finale (Interactive)
echo "-------------------------------------------------------"
echo "⚠️  ACTION REQUISE : RÉCUPÉREZ VOTRE TOKEN SUR GITHUB"
echo "1. Settings > Actions > Runners > New self-hosted runner"
echo "2. Copiez la commande qui commence par './config.sh --url ...'"
echo "-------------------------------------------------------"

echo "Souhaitez-vous lancer la configuration maintenant ? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    sudo -u "$GITHUB_USER" ./config.sh
    
    echo "⚙️  Installation du service pour démarrage automatique..."
    sudo ./svc.sh install
    sudo ./svc.sh start
    echo "✅ Runner installé et démarré comme service !"
else
    echo "ℹ️  Vous pourrez configurer le runner plus tard en lançant : "
    echo "   cd /home/$GITHUB_USER/$RUNNER_FOLDER && sudo -u $GITHUB_USER ./config.sh"
fi

echo "-------------------------------------------------------"
echo "🎉 Terminée !"
echo "-------------------------------------------------------"
