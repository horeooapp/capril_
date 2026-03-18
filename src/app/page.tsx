import { auth } from "@/auth";
import { getActiveNews } from "@/actions/news-actions";

export const dynamic = "force-dynamic";

export default async function Home() {
  let session = null;
  let dbNews = null;
  let prismaError = null;
  
  try {
    session = await auth();
    dbNews = await getActiveNews();
  } catch (e: any) {
    prismaError = e.message || String(e);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white p-10 text-center">
      <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">QAPRIL DEBUG - WITH PRISMA</h1>
      {prismaError ? (
          <p className="text-red-500 mt-4">Prisma Error: {prismaError}</p>
      ) : (
          <p className="text-green-500 mt-4">Prisma Successful: {dbNews ? `${dbNews.length} items found` : "No data"}</p>
      )}
      <p className="text-gray-500 mt-2 text-xs">Si vous voyez ce message, le rendu avec Prisma fonctionne.</p>
    </main>
  );
}
