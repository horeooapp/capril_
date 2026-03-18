import { auth } from "@/auth";
import { getActiveNews } from "@/actions/news-actions";
import { isFeatureEnabled } from "@/lib/features";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  let session = null;
  let dbNews = [];
  let isLandingPageRestricted = true;
  
  try {
    session = await auth();
    dbNews = await getActiveNews();
    isLandingPageRestricted = await isFeatureEnabled("LANDING_PAGE");
  } catch (e: any) {
    console.error("Data fetch error:", e);
  }

  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ADMIN';

  if (isLandingPageRestricted) {
    if (!session?.user) {
      return (
        <main className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-10 text-center">
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">QAPRIL SECURE.</h1>
          <p className="text-gray-400 mt-4">Accès Restreint - Infrastructure Nationale</p>
          <div className="mt-8 flex gap-4">
             <Link href="/dashboard/login" className="px-6 py-2 bg-white text-black font-bold rounded-lg hover:bg-orange-500 hover:text-white transition-colors">Portail Propriétaire</Link>
             <Link href="/locataire/login" className="px-6 py-2 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-500 transition-colors">Portail Locataire</Link>
          </div>
        </main>
      );
    } else if (!isAdmin) {
      redirect("/dashboard");
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white p-10 text-center">
      <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">QAPRIL - FULL ACCESS</h1>
      <p className="text-green-500 mt-4">Vous êtes Administrateur ou le portail est ouvert.</p>
      <div className="mt-4">
         Items found: {dbNews.length}
      </div>
      <p className="mt-8 text-gray-400 text-xs italic">DEBUG STEP: Access Control reintroduced.</p>
    </main>
  );
}
