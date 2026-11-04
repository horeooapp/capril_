import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Liste des cookies critiques d'authentification Auth.js / NextAuth
const KNOWN_AUTH_COOKIE_PREFIXES = [
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
    "qapril_session",
    "session",
    "token",
];

function getAllCookieNamesToDelete(incomingNames: string[]): string[] {
    const set = new Set<string>();

    for (const prefix of KNOWN_AUTH_COOKIE_PREFIXES) {
        set.add(prefix);
        // NextAuth v5 chunked cookies (chunk 0 à 9)
        for (let i = 0; i <= 9; i++) {
            set.add(`${prefix}.${i}`);
        }
    }

    // Ajouter tous les cookies reçus dans la requête qui correspondent à un motif d'auth
    for (const name of incomingNames) {
        if (
            KNOWN_AUTH_COOKIE_PREFIXES.some(prefix => name.startsWith(prefix)) ||
            name.toLowerCase().includes("session") ||
            name.toLowerCase().includes("auth") ||
            name.toLowerCase().includes("csrf")
        ) {
            set.add(name);
        }
    }

    return Array.from(set);
}

function getPublicBaseUrl(req: Request): { baseUrl: string; hostname: string; isHttps: boolean } {
    const forwardedHost = req.headers.get("x-forwarded-host");
    const rawHost = forwardedHost || req.headers.get("host") || "";
    const cleanHost = rawHost.split(":")[0];
    const forwardedProto = req.headers.get("x-forwarded-proto");
    const url = new URL(req.url);

    // Si l'hôte est une adresse interne de conteneur Docker (ex: 0.0.0.0, 127.0.0.1)
    const isInternal = !cleanHost || cleanHost === "0.0.0.0" || cleanHost === "127.0.0.1" || cleanHost === "localhost";
    
    let hostname = cleanHost;
    let proto = forwardedProto || (url.protocol.startsWith("https") ? "https" : "http");
    let port = "";

    if (isInternal) {
        // En production, utiliser l'URL publique de QAPRIL
        if (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.includes("0.0.0.0")) {
            const parsed = new URL(process.env.NEXTAUTH_URL);
            hostname = parsed.hostname;
            proto = parsed.protocol.replace(":", "");
            port = parsed.port ? `:${parsed.port}` : "";
        } else if (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes("0.0.0.0")) {
            const parsed = new URL(process.env.NEXT_PUBLIC_APP_URL);
            hostname = parsed.hostname;
            proto = parsed.protocol.replace(":", "");
            port = parsed.port ? `:${parsed.port}` : "";
        } else {
            hostname = "www.qapril.net";
            proto = "https";
            port = "";
        }
    } else {
        if (rawHost.includes(":") && !["80", "443"].includes(rawHost.split(":")[1])) {
            port = `:${rawHost.split(":")[1]}`;
        }
    }

    const baseUrl = `${proto}://${hostname}${port}`;
    return { baseUrl, hostname, isHttps: proto === "https" };
}

function purgeCookiesOnResponse(response: NextResponse, req: Request): NextResponse {
    // En-tête officiel W3C pour vider le cache navigateur, le stockage et les cookies
    response.headers.set("Clear-Site-Data", '"cache", "cookies", "storage"');
    response.headers.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0"
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
    const { hostname, isHttps } = getPublicBaseUrl(req);

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
        if (!name.startsWith("__Host-") && hostname && !hostname.includes("0.0.0.0") && hostname !== "localhost" && hostname !== "127.0.0.1") {
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
    const { baseUrl } = getPublicBaseUrl(req);

    // Détermination de l'URL absolue publique pour la redirection (jamais 0.0.0.0)
    const redirectTarget = new URL(callbackUrl, baseUrl);

    // Redirection 303 See Other pour forcer un GET sans cache vers la cible
    const redirectResponse = NextResponse.redirect(redirectTarget, 303);

    return purgeCookiesOnResponse(redirectResponse, req);
}
