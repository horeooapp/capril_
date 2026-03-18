import { unstable_noStore as noStore } from 'next/cache';

export const dynamic = "force-dynamic"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    noStore();
    
    /* 
    // Temporairement désactivé pour isolation
    let session = null;
    try {
        session = await auth()
    } catch (e) {
        console.error("[ADMIN LAYOUT] Erreur de session:", e);
    }

    if (!session?.user) {
        redirect("/admin/login")
    }
    */

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <header className="p-6 bg-black text-white">
                <h1 className="font-bold">MODE DEBUG - ADMIN LAYOUT</h1>
            </header>
            <main className="flex-1 p-10">
                {children}
            </main>
        </div>
    )
}
