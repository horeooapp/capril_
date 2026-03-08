# Script pour configurer les secrets GitHub via la CLI 'gh'
# Assurez-vous d'avoir installé la CLI GitHub : https://cli.github.com/
# Et d'être connecté : gh auth login

$secrets = @{
    "DATABASE_URL" = "file:/home/u341324010/domains/qapril.net/public_html/dev.db"
    "AUTH_SECRET" = "3d0bc4d35913c364e31a5242fde2489a6a95d9ad4427383b05d228a3c6c4dbef"
    "AUTH_RESEND_KEY" = "re_YRdesQfm_2fN4yLN5uJYYhgWZvX1HxEiz"
    "EMAIL_SERVER" = "smtp://resend:re_YRdesQfm_2fN4yLN5uJYYhgWZvX1HxEiz@smtp.resend.com:465"
    "NEXTAUTH_URL" = "https://qapril.net"
    "HOSTINGER_SSH_HOST" = "vsrv1472050.hstgr.cloud"
    "HOSTINGER_SSH_USER" = "root"
    # IMPORTANT: Mettez ici le contenu de votre CLÉ PRIVÉE (Private Key), pas la clé publique (.pub)
    "HOSTINGER_SSH_KEY"  = @"
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAACmFlczI1Ni1jdHIAAAAGYmNyeXB0AAAAGAAAABCLLzQXZC
bspXuwgU1A9u3WAAAAGAAAAAEAAAAzAAAAC3NzaC1lZDI1NTE5AAAAIAGF98HNcl8aoYPd
CYA6g7mYfNF05M4A9cdZa6cPey4nAAAAoONiyNiYo+tOpsl8FppMBy/ADVmm2RoDalSLaD
zQRHartTsFKyErCUdScUU2w//Ca/Ja5sIYYYibNTaOgZfDMwppl9jTqnYLn9xeaz+DsKZQ
MV+lLxZYAk/CWYtAHXi8KTF9G4X3+71TaDmgWocB4vhe+Q0rGwidPzeAS8BAYOI0SVtL+d
bHTEII/FtB/5fcDSqtQKlIEwYiy6a/zy8u5oU=
-----END OPENSSH PRIVATE KEY-----
"@
}

$variables = @{
    "EMAIL_FROM"  = "noreply@qapril.net"
    "DEPLOY_PATH" = "/var/www/capril"
}

Write-Host "🚀 Configuration des secrets..." -ForegroundColor Cyan
foreach ($key in $secrets.Keys) {
    $val = $secrets[$key]
    if ($val -ne "votre_url_prisma_ici" -and $val -ne "re_...") {
        Write-Host "Set secret: $key"
        echo "$val" | gh secret set "$key"
    }
    else {
        Write-Host "⚠️ Skip secret $key (valeur par défaut)" -ForegroundColor Yellow
    }
}

Write-Host "`n🚀 Configuration des variables..." -ForegroundColor Cyan
foreach ($key in $variables.Keys) {
    Write-Host "Set variable: $key"
    gh variable set "$key" --body "$variables[$key]"
}

Write-Host "`n✅ Terminé ! N'oubliez pas de mettre à jour les valeurs réelles dans le script avant de le lancer." -ForegroundColor Green
