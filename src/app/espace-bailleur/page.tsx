import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EspaceBailleurRedirect() {
  const session = await auth();

  if (!session?.user) {
    redirect("/dashboard/login");
  }

  redirect("/dashboard");
}
