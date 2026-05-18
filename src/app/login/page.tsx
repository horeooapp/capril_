import UnifiedLoginPage from "@/components/auth/UnifiedLoginPage"

export const metadata = {
    title: "Connexion | QAPRIL",
    description: "Portail officiel de connexion aux espaces Locataire, Propriétaire et Administration de QAPRIL.",
}

export default function LoginPage() {
    return <UnifiedLoginPage initialTab="tenant" />
}
