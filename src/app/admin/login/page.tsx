import UnifiedLoginPage from "@/components/auth/UnifiedLoginPage"

export const metadata = {
    title: "Connexion Administration | QAPRIL",
    description: "Console d'administration centrale sécurisée pour la régulation des activités immobilières.",
}

export default function AdminLoginPage() {
    return <UnifiedLoginPage initialTab="admin" />
}
