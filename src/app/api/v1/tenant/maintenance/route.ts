import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createMaintenanceTicket } from "@/actions/maintenance-actions";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "TENANT") {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const category = formData.get("category") as string;
        const leaseId = formData.get("leaseId") as string;
        const propertyId = formData.get("propertyId") as string;
        
        // Handle file upload if any here (e.g. upload to S3)
        // const file = formData.get("file") as File;

        const res = await createMaintenanceTicket({
            leaseId,
            logementId: propertyId,
            declarantId: session.user.id,
            titre: title,
            categorie: category,
            description: `${title}\n\n${description}`
        });

        if (res.error) {
            return NextResponse.json({ error: res.error }, { status: 400 });
        }

        return NextResponse.json({ success: true, data: res });

    } catch (error: any) {
        console.error("Erreur API Maintenance:", error);
        return NextResponse.json({ error: "Impossible de créer le ticket de maintenance." }, { status: 500 });
    }
}
