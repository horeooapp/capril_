"use client";

import { signOut } from "next-auth/react";

/**
 * Universal client-side logout handler (Web & Mobile Web).
 * Completely purges server-side session cookies (HttpOnly), client storage (localStorage, sessionStorage),
 * CacheStorage (Service Workers & PWA), and forces a clean non-cached reload.
 */
export async function executeLogout(callbackUrl = "/login") {
    try {
        // 1. Invalidation serveur + suppression des cookies de session HttpOnly
        try {
            await fetch("/api/auth/logout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                cache: "no-store",
            });
        } catch (e) {
            console.warn("[AUTH] Server logout error:", e);
        }

        // 2. Client-side NextAuth signOut (sans redirection interne pour laisser la main à la purge)
        try {
            await signOut({ redirect: false });
        } catch (e) {
            console.warn("[AUTH] NextAuth signOut error:", e);
        }

        if (typeof window !== "undefined") {
            // 3. Purge complète de tous les stockages du navigateur
            try {
                window.localStorage.clear();
            } catch {}
            try {
                window.sessionStorage.clear();
            } catch {}

            // 4. Expiration explicite de tous les cookies accessibles côté document
            try {
                const cookies = document.cookie.split(";");
                for (let i = 0; i < cookies.length; i++) {
                    const cookie = cookies[i];
                    const eqPos = cookie.indexOf("=");
                    const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
                    if (name) {
                        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`;
                        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname};`;
                    }
                }
            } catch {}

            // 5. Purge du CacheStorage (Service Worker / PWA / requêtes mises en cache)
            if ("caches" in window) {
                try {
                    const cacheKeys = await window.caches.keys();
                    await Promise.all(cacheKeys.map((key) => window.caches.delete(key)));
                } catch {}
            }

            // 6. Navigation dure pour détruire tout état React / Next.js Router Cache en mémoire
            window.location.replace(callbackUrl);
        }
    } catch {
        if (typeof window !== "undefined") {
            window.location.replace(callbackUrl);
        }
    }
}
