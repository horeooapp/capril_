import { getTenantOccupantsAndAttestations } from "@/actions/occupants.actions";
import OccupantsClient from "./OccupantsClient";

export const dynamic = "force-dynamic";

export default async function TenantOccupantsPage() {
    const data = await getTenantOccupantsAndAttestations();
    return <OccupantsClient initialData={data} />;
}

