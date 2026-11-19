import { obtenirPersonnalisationAction } from "@/actions/quittance-personnalisation.actions";
import PersonnalisationClient from "./personnalisation-client";

export const dynamic = "force-dynamic";

export default async function PersonnalisationQuittancePage() {
  const donnees = await obtenirPersonnalisationAction();
  return <PersonnalisationClient {...donnees} />;
}
