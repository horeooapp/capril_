import { auth } from "@/auth";
import { getProperties } from "@/actions/property.actions";
import { redirect } from "next/navigation";
import NewTicketClient from "./new-ticket-client";

export default async function NewMaintenanceTicketPage() {
    const session = await auth();
    if (!session?.user) redirect("/login");

    const properties = await getProperties();

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
            <NewTicketClient 
                properties={properties} 
                userId={session.user.id} 
            />
        </div>
    );
}
