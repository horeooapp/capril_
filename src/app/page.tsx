import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  let session = null;
  let authError = null;
  
  try {
    session = await auth();
  } catch (e: any) {
    authError = e.message || String(e);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white p-10 text-center">
      <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">QAPRIL DEBUG - WITH AUTH</h1>
      {authError ? (
          <p className="text-red-500 mt-4">Auth Error: {authError}</p>
      ) : (
          <p className="text-green-500 mt-4">Auth Successful: {session ? "Logged In" : "Anonymous"}</p>
      )}
      <p className="text-gray-500 mt-2 text-xs">Si vous voyez ce message, le rendu avec auth() fonctionne.</p>
    </main>
  );
}
