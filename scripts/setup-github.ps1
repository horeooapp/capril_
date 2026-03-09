# Script pour configurer les secrets GitHub via la CLI 'gh'
# Assurez-vous d'avoir installé la CLI GitHub : https://cli.github.com/
# Et d'être connecté : gh auth login

$secrets = @{
    "DATABASE_URL"       = "file:/home/u341324010/domains/qapril.net/public_html/dev.db"
    "AUTH_SECRET"        = "3d0bc4d35913c364e31a5242fde2489a6a95d9ad4427383b05d228a3c6c4dbef"
    "AUTH_RESEND_KEY"    = "re_YRdesQfm_2fN4yLN5uJYYhgWZvX1HxEiz"
    "EMAIL_SERVER"       = "smtp://resend:re_YRdesQfm_2fN4yLN5uJYYhgWZvX1HxEiz@smtp.resend.com:465"
    "NEXTAUTH_URL"       = "https://qapril.net"
    "HOSTINGER_SSH_HOST" = "187.77.93.154"
    "HOSTINGER_SSH_USER" = "root"
    "HOSTINGER_SSH_KEY"  = @"
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACBRm28xfExfRKLOEORAR0STQDY51S0WyjWh0nTa0vs0UQAAAJi88RRRvPEU
UQAAAAtzc2gtZWQyNTUxOQAAACBRm28xfExfRKLOEORAR0STQDY51S0WyjWh0nTa0vs0UQ
AAAEAnQGBxxHa5voWRSQgt2g0IwpyUZXnP7oI9Gq+udoizyFGbbzF8TF9Eos4Q5EBHRJNA
NjnVLRbKNaHSdNrS+zRRAAAAFWdpdGh1Yi1hY3Rpb25zLWRlcGxveQ==
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
    Write-Host "Set secret: $key"
    echo "$val" | gh secret set "$key"
}

Write-Host "`n🚀 Configuration des variables..." -ForegroundColor Cyan
foreach ($key in $variables.Keys) {
    Write-Host "Set variable: $key"
    gh variable set "$key" --body "$($variables[$key])"
}

Write-Host "`n✅ Terminé ! Tout est configuré sur GitHub." -ForegroundColor Green
