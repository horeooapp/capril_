import "../admin-v2.css"
import Link from "next/link"
export const dynamic = "force-dynamic"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { logout } from "@/actions/auth"
import AdminHeader from "@/components/admin/AdminHeader"
import AdminSidebar from "@/components/admin/AdminSidebar"
import { unstable_noStore as noStore } from 'next/cache';
import { isRoleGloballyActive } from "@/lib/role-lock"
import PushRegistration from "@/components/admin/PushRegistration"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    noStore();
    const session = await auth();

    if (!session?.user) {
        redirect("/admin/login")
    }

    const activeRole = (session.user as any).chosenRole || session.user.role;

    // CRITICAL: Verify Global Role Concurrency Lock
    const isGloballyActive = await isRoleGloballyActive(session.user.id, activeRole);
    if (!isGloballyActive) {
        // This browser has a stale role, force logout
        redirect("/api/auth/signout")
    }

    if (activeRole !== "ADMIN" && activeRole !== "SUPER_ADMIN") {
        redirect("/dashboard")
    }

    const sessionUser = session ? {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
        fullName: ((session.user as any).firstName ? (session.user as any).firstName + " " : "") + ((session.user as any).lastName || "")
    } : null;

    return (
        <div className="admin-v2" style={{ display: 'flex', minHeight: '100vh', width: '100%', backgroundColor: 'var(--ci-nuit)' }}>
            <AdminSidebar onLogout={logout} sessionUser={sessionUser} />

            <div className="main-content" style={{ flex: 1 }}>
                <AdminHeader 
                    session={{ user: sessionUser }} 
                    onLogout={logout} 
                />

                <div className="content">
                    {children}
                </div>
            </div>
            
            <PushRegistration />

            <style dangerouslySetInnerHTML={{__html: `
              body {
                background: var(--ci-nuit) !important;
              }
            `}} />
        </div>
    )
}
