import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SimulatorClient from "./simulator-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Simulateur Canal Conversationnel (ADD-26) | QAPRIL",
  description: "Démonstration du canal sans application (SMS, WhatsApp, USSD) selon les règles RG-CNV-01 à RG-CNV-30."
};

export default async function SimulateurConversationnelPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/dashboard/login");
  }

  return <SimulatorClient user={session.user} />;
}
