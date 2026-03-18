export const dynamic = "force-dynamic";

export default async function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white p-10 text-center">
      <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">QAPRIL DEBUG - NO AUTH</h1>
      <p className="text-gray-500 mt-4">Si vous voyez ce message, le rendu de base fonctionne.</p>
    </main>
  );
}
