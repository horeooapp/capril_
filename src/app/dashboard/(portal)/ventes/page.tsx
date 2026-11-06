import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAgencyTransactionsData } from "@/actions/transaction-actions";
import VentesClient from "./ventes-client";

export const metadata = {
  title: "Transactions & Ventes de Terrains · ADD-25 | QAPRIL",
  description: "Module de transaction immobilière et foncière certifiée pour agences agréées et propriétaires. Conformité Loi 2019-576 et ACD."
};

export default async function VentesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/dashboard/login");
  }

  const result = await getAgencyTransactionsData();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <VentesClient 
        initialData={result.data} 
        user={session.user} 
      />
    </div>
  );
}
