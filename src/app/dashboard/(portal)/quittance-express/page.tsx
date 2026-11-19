import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { listerDossiersExpress } from "@/actions/quittance-express.actions";
import QuittanceExpressClient from "./quittance-express-client";

export const dynamic = "force-dynamic";

export default async function QuittanceExpressPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const dossiers = await listerDossiersExpress();
  return <QuittanceExpressClient dossiers={dossiers} />;
}
