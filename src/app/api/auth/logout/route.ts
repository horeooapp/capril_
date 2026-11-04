import { signOut } from "@/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIES_TO_DELETE = [
    // NextAuth / Auth.js standard session tokens (both HTTP & HTTPS prefixes)
    "authjs.session-token",
    "__Secure-authjs.session-token",
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    // CSRF tokens
    "authjs.csrf-token",
    "__Host-authjs.csrf-token",
    "next-auth.csrf-token",
    "__Host-next-auth.csrf-token",
    // Callback & redirect URLs
    "authjs.callback-url",
    "next-auth.callback-url",
    "__Secure-authjs.callback-url",
    "__Secure-next-auth.callback-url",
    // QAPRIL application & session cookies
    "qapril_type",
    "userToken",
    "userProfileRole",
    "qapril_selected_profile",
    "qapril_consent_answered",
];

function applySecurityAndCacheHeaders(response: NextResponse) {
    // Purge totale du cache navigateur et stockage supporté par la directive W3C Clear-Site-Data
    response.headers.set("Clear-Site-Data", '"cache", "cookies", "storage"');
    response.headers.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    // Expiration explicite des cookies pour tous les navigateurs et proxies
    for (const name of COOKIES_TO_DELETE) {
        response.cookies.set(name, "", {
            path: "/",
            expires: new Date(0),
            maxAge: 0,
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        });
    }

    return response;
}

export async function POST(req: Request) {
    try {
        await signOut({ redirect: false });
    } catch {
        // Ignorer les erreurs internes si NextAuth est déjà déconnecté
    }

    const cookieStore = await cookies();
    for (const name of COOKIES_TO_DELETE) {
        try {
            cookieStore.delete(name);
        } catch {}
    }

    const response = NextResponse.json(
        { success: true, message: "Déconnexion totale effectuée, cache et session purgés." },
        { status: 200 }
    );

    return applySecurityAndCacheHeaders(response);
}

export async function GET(req: Request) {
    try {
        await signOut({ redirect: false });
    } catch {}

    const cookieStore = await cookies();
    for (const name of COOKIES_TO_DELETE) {
        try {
            cookieStore.delete(name);
        } catch {}
    }

    const url = new URL(req.url);
    const callbackUrl = url.searchParams.get("callbackUrl") || "/login";
    const redirectResponse = NextResponse.redirect(new URL(callbackUrl, req.url));

    return applySecurityAndCacheHeaders(redirectResponse);
}

