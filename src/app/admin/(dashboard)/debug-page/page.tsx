import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function AdminDebugPage() {
  const session = await auth().catch(() => null);

  return (
    <div className="p-10 bg-black text-white min-h-screen">
      <h1 className="text-4xl font-black italic uppercase">Admin Debug Page</h1>
      <p className="mt-4">Session User: {session?.user ? session.user.email : "No Session"}</p>
      <p className="mt-2">Role: {session?.user?.role || "N/A"}</p>
      <div className="mt-8">
        <p className="text-gray-500">Si vous voyez ce message, le layout Admin fonctionne.</p>
      </div>
    </div>
  );
}
