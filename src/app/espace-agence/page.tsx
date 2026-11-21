import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EspaceAgenceRedirect() {
  const session = await auth();

  if (!session?.user) {
    redirect("/dashboard/login/agency");
  }

  const role = String(session.user.role || "").toUpperCase();
  const agencyRoles = ["AGENCY", "NON_CERTIFIED_AGENT", "PROPERTY_MANAGER", "AGENCE", "ADMIN", "SUPER_ADMIN"];

  if (agencyRoles.includes(role)) {
    redirect("/dashboard/agency");
  }

  // Utilisateur connecté bailleur ou autre
  redirect("/dashboard");
}
