import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ChooseRolePage() {
    const session = await auth();
    if (!session?.user) {
        return redirect("/login");
    }

    const role = String((session.user as any)?.chosenRole || session.user.role || '').toUpperCase();
    if (['TENANT', 'LOCATAIRE'].includes(role)) {
        return redirect("/mon-espace-locataire");
    } else if (['ADMIN', 'SUPER_ADMIN'].includes(role)) {
        return redirect("/admin");
    } else {
        return redirect("/dashboard");
    }
}
