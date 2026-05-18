import UnifiedLoginPage from "@/components/auth/UnifiedLoginPage"

export const metadata = {
    title: "Connexion Propriétaire | QAPRIL",
    description: "Accédez à votre console de gestion de patrimoine immobilier et suivez vos baux et rentabilités en temps réel.",
}

export default function LandlordLoginPage() {
    return <UnifiedLoginPage initialTab="landlord" />
}
