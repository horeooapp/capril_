$filePath = "e:\Projets_Cornerstone\site_crnstneros\capril_\prisma\schema.prisma"
$content = Get-Content $filePath
$newContent = New-Object System.Collections.Generic.List[string]

foreach ($line in $content) {
    $newContent.Add($line)
    if ($line -match "walletCanalAlertePref") {
        $newContent.Add("  isAgreee              Boolean @default(false) @map(`"is_agreee`") // For AGENCY role (Approved vs Non-Approved)")
    }
    if ($line -match "certEnregistrementDgiUrl") {
        $newContent.Add("")
        $newContent.Add("  // MM-04 Compliance")
        $newContent.Add("  typeGestion            String    @default(`"DIRECTE`") @map(`"type_gestion`") // AGREEEY | NON_AGREEY | DIRECTE")
        $newContent.Add("  bailleurMasque         Boolean   @default(false) @map(`"bailleur_masque`")")
    }
}

$newContent | Set-Content $filePath
