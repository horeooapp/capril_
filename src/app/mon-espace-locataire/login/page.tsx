import UnifiedLoginPage from "@/components/auth/UnifiedLoginPage"

export const metadata = {
    title: "Connexion Locataire | QAPRIL",
    description: "Accédez à votre espace locataire sécurisé QAPRIL pour payer vos loyers et suivre vos quittances.",
}

export default function TenantLoginPage() {
    return <UnifiedLoginPage initialTab="tenant" />
}
