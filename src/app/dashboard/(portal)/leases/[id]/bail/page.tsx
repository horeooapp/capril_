import { notFound } from "next/navigation";
import { etatBailComplet } from "@/actions/bail-complet.actions";
import BailCompletClient from "./bail-complet-client";

export const dynamic = "force-dynamic";

export default async function BailCompletPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const etat = await etatBailComplet(id);
  if (!etat) notFound();
  return <BailCompletClient etat={etat} />;
}
