# Script pour configurer les secrets GitHub via la CLI 'gh'
# Assurez-vous d'avoir installé la CLI GitHub : https://cli.github.com/
# Et d'être connecté : gh auth login

$secrets = @{
    "DATABASE_URL" = "votre_url_prisma_ici"
    "AUTH_SECRET" = "$(npx auth secret)"
    "AUTH_RESEND_KEY" = "re_..."
    "EMAIL_SERVER" = "smtp://..."
    "NEXTAUTH_URL" = "https://votre-site.com"
    "HOSTINGER_SSH_HOST" = "votre_ip_vps"
    "HOSTINGER_SSH_USER" = "root"
    "HOSTINGER_SSH_KEY" = "$(Get-Content ~/.ssh/id_rsa -Raw)"
}

$variables = @{
    "EMAIL_FROM" = "noreply@votre-site.com"
    "DEPLOY_PATH" = "/var/www/capril"
}

Write-Host "🚀 Configuration des secrets..." -ForegroundColor Cyan
foreach ($key in $secrets.Keys) {
    $val = $secrets[$key]
    if ($val -ne "votre_url_prisma_ici" -and $val -ne "re_...") {
        Write-Host "Set secret: $key"
        echo "$val" | gh secret set "$key"
    } else {
        Write-Host "⚠️ Skip secret $key (valeur par défaut)" -ForegroundColor Yellow
    }
}

Write-Host "`n🚀 Configuration des variables..." -ForegroundColor Cyan
foreach ($key in $variables.Keys) {
    Write-Host "Set variable: $key"
    gh variable set "$key" --body "$variables[$key]"
}

Write-Host "`n✅ Terminé ! N'oubliez pas de mettre à jour les valeurs réelles dans le script avant de le lancer." -ForegroundColor Green
