import { redirect } from "next/navigation";

export default async function MonEspaceValiderBailPage({
    searchParams
}: {
    searchParams: Promise<{ code?: string; otp?: string; leaseId?: string }>
}) {
    const params = await searchParams;
    const qs = new URLSearchParams();
    if (params.code) qs.set("code", params.code);
    if (params.otp) qs.set("otp", params.otp);
    if (params.leaseId) qs.set("leaseId", params.leaseId);

    const queryString = qs.toString();
    redirect(`/valider-bail${queryString ? `?${queryString}` : ""}`);
}

