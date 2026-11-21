import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EspaceLocataireRedirect() {
  const session = await auth();

  if (!session?.user) {
    redirect("/mon-espace-locataire/login");
  }

  redirect("/mon-espace-locataire");
}
