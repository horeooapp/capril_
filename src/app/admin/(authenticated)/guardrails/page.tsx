import { auth } from "@/auth"
import { redirect } from "next/navigation"
import GuardrailsClient from "./GuardrailsClient"

export const metadata = {
    title: "Garde-fous (M-GUARD) | QAPRIL Admin",
}

export default async function AdminGuardrailsPage() {
    const session = await auth()
    const activeRole = session ? (session.user as any).chosenRole || session.user.role : null;
    if (activeRole !== "ADMIN" && activeRole !== "SUPER_ADMIN") {
        redirect("/admin/login")
    }

    return (
        <div className="max-w-[1400px] mx-auto w-full">
            <GuardrailsClient />
        </div>
    )
}
