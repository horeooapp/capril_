import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getConversations } from "@/actions/messaging-actions";
import LocataireMessagesClient from "./LocataireMessagesClient";

export const dynamic = "force-dynamic";

export default async function LocataireMessagesPage() {
  const session = await auth();
  const activeRole = (session?.user as any)?.chosenRole || session?.user?.role;
  if (!session?.user || activeRole !== "TENANT") {
    redirect("/mon-espace-locataire/login");
  }

  const { conversations } = await getConversations();

  return <LocataireMessagesClient conversations={conversations} />;
}

