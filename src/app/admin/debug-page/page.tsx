import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function AdminDebugPage() {
  let session = null;
  try {
    session = await auth();
  } catch (e) {
    console.error("[DEBUG-PAGE] Auth failed:", e);
  }

  return (
    <div className="p-20 bg-gray-900 text-white min-h-screen font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-6xl font-black italic uppercase tracking-tighter mb-10">Diagnostic.</h1>
        <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] backdrop-blur-xl">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-primary mb-6">État de la Session :</p>
            <p className="text-2xl font-bold mb-4">
                {session?.user ? `Utilisateur: ${session.user.email}` : "Aucune session détectée"}
            </p>
            <p className="text-sm text-gray-400">Rôle: {session?.user?.role || "N/A"}</p>
        </div>
        <div className="mt-12 flex gap-4">
            <div className="px-6 py-2 bg-green-500/20 text-green-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-500/30">
                Route accessible
            </div>
        </div>
      </div>
    </div>
  );
}
