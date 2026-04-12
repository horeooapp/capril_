import { auth } from "@/auth"
import { redirect } from "next/navigation"
import GuardrailsClient from "./GuardrailsClient"

export const metadata = {
    title: "Garde-fous (M-GUARD) | QAPRIL Admin",
}

export default async function AdminGuardrailsPage() {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
        redirect("/admin/login")
    }

    return (
        <div className="max-w-[1400px] mx-auto w-full">
            <GuardrailsClient />
        </div>
    )
}
