import React from "react";
import { getConversations } from "@/actions/messaging-actions";
import MessagesClient from "./MessagesClient";

export const dynamic = "force-dynamic";

export default async function DashboardMessagesPage() {
  const { conversations } = await getConversations();

  return <MessagesClient initialConversations={conversations} />;
}

