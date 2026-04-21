import { LeaseCreationWizard } from "@/components/dashboard/agency/LeaseCreationWizard";
import { getProperties } from "@/actions/property.actions";

export default async function LeaseWizardPage() {
  const properties = await getProperties();
  
  return <LeaseCreationWizard properties={properties} />;
}
