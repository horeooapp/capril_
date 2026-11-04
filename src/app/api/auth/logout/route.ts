import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Comprehensive base cookie names
const BASE_COOKIE_NAMES = [
    "authjs.session-token",
    "__Secure-authjs.session-token",
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "authjs.csrf-token",
    "__Host-authjs.csrf-token",
    "next-auth.csrf-token",
    "__Host-next-auth.csrf-token",
    "authjs.callback-url",
    "next-auth.callback-url",
    "__Secure-authjs.callback-url",
    "__Secure-next-auth.callback-url",
    "authjs.pkce.code_verifier",
    "__Secure-authjs.pkce.code_verifier",
    "authjs.state",
    "__Secure-authjs.state",
    "authjs.nonce",
    "__Secure-authjs.nonce",
    "qapril_type",
    "userToken",
    "userProfileRole",
    "qapril_selected_profile",
    "qapril_consent_answered",
    "remember_role",
];

// Generate all possible chunk variations (.0 to .9)
function getAllCookieNamesToDelete(incomingNames: string[] = []): Set<string> {
    const set = new Set<string>();

    // Add all incoming cookies from the request
    for (const name of incomingNames) {
        if (name && name.trim()) {
            set.add(name.trim());
        }
    }

    // Add base names and chunk variations
    for (const base of BASE_COOKIE_NAMES) {
        set.add(base);
        for (let i = 0; i < 10; i++) {
            set.add(`${base}.${i}`);
        }
    }

    return set;
}

function purgeCookiesOnResponse(response: NextResponse, req: Request) {
    // 1. En-têtes W3C de purge de session et cache navigateur
    response.headers.set("Clear-Site-Data", '"cache", "cookies", "storage"');
    response.headers.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    // Extract all cookies present in the incoming request header
    const cookieHeader = req.headers.get("cookie") || "";
    const incomingNames = cookieHeader
        .split(";")
        .map((c) => c.trim().split("=")[0])
        .filter(Boolean);

    const allNames = getAllCookieNamesToDelete(incomingNames);
    const url = new URL(req.url);
    const hostname = url.hostname;
    const isHttps = url.protocol === "https:" || req.headers.get("x-forwarded-proto") === "https";

    for (const name of allNames) {
        // Expiration standard (Host-only, requis pour les cookies __Host-)
        response.cookies.set(name, "", {
            path: "/",
            expires: new Date(0),
            maxAge: 0,
            httpOnly: true,
            sameSite: "lax",
            secure: isHttps,
        });

        // Expiration non-secure (au cas où posé sur HTTP)
        if (isHttps) {
            response.cookies.set(name, "", {
                path: "/",
                expires: new Date(0),
                maxAge: 0,
                httpOnly: true,
                sameSite: "lax",
                secure: false,
            });
        }

        // Expiration côté client (non-httpOnly)
        response.cookies.set(name, "", {
            path: "/",
            expires: new Date(0),
            maxAge: 0,
            httpOnly: false,
            sameSite: "lax",
            secure: isHttps,
        });

        // Pour les domaines avec sous-domaines (ex: qapril.net et www.qapril.net)
        if (!name.startsWith("__Host-") && hostname && hostname !== "localhost" && hostname !== "127.0.0.1") {
            const rootDomain = hostname.startsWith("www.") ? hostname.substring(4) : hostname;
            try {
                response.cookies.set(name, "", {
                    path: "/",
                    domain: `.${rootDomain}`,
                    expires: new Date(0),
                    maxAge: 0,
                    httpOnly: true,
                    sameSite: "lax",
                    secure: isHttps,
                });
                response.cookies.set(name, "", {
                    path: "/",
                    domain: rootDomain,
                    expires: new Date(0),
                    maxAge: 0,
                    httpOnly: true,
                    sameSite: "lax",
                    secure: isHttps,
                });
            } catch {}
        }
    }

    return response;
}

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const all = cookieStore.getAll();
        for (const c of all) {
            try {
                cookieStore.delete(c.name);
            } catch {}
        }
    } catch {}

    const response = NextResponse.json(
        { success: true, message: "Déconnexion totale effectuée, cache et session purgés." },
        { status: 200 }
    );

    return purgeCookiesOnResponse(response, req);
}

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const all = cookieStore.getAll();
        for (const c of all) {
            try {
                cookieStore.delete(c.name);
            } catch {}
        }
    } catch {}

    const url = new URL(req.url);
    const callbackUrl = url.searchParams.get("callbackUrl") || "/";
    const redirectTarget = new URL(callbackUrl, req.url);

    // Redirection 303 See Other pour forcer un GET sans cache vers la cible
    const redirectResponse = NextResponse.redirect(redirectTarget, 303);

    return purgeCookiesOnResponse(redirectResponse, req);
}
