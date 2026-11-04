"use client";

/**
 * Universal client-side logout handler (Web & Mobile Web).
 * Completely purges server-side session cookies (HttpOnly, chunks .0, .1...), client storage (localStorage, sessionStorage),
 * CacheStorage (Service Workers & PWA), and forces a clean non-cached reload through /api/auth/logout.
 */
export async function executeLogout(callbackUrl = "/login") {
    if (typeof window === "undefined") return;

    try {
        // 1. Purge synchrone de tous les stockages du navigateur
        try {
            window.localStorage.clear();
        } catch {}
        try {
            window.sessionStorage.clear();
        } catch {}

        // 2. Expiration explicite de tous les cookies accessibles côté document
        try {
            const cookies = document.cookie.split(";");
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i];
                const eqPos = cookie.indexOf("=");
                const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
                if (name) {
                    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`;
                    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname};`;
                    const rootHost = window.location.hostname.replace(/^www\./, "");
                    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${rootHost};`;
                }
            }
        } catch {}

        // 3. Purge du CacheStorage (Service Worker / PWA / requêtes Next.js mises en cache)
        if ("caches" in window) {
            try {
                const cacheKeys = await window.caches.keys();
                await Promise.all(cacheKeys.map((key) => window.caches.delete(key)));
            } catch {}
        }

        // 4. Invalidation de l'éventuel Service Worker
        if ("serviceWorker" in navigator) {
            try {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (const registration of registrations) {
                    await registration.unregister();
                }
            } catch {}
        }
    } finally {
        // 5. Navigation dure vers l'endpoint serveur /api/auth/logout
        // Le navigateur envoie tous les cookies HttpOnly, le serveur émet les en-têtes Set-Cookie Max-Age=0
        // et Clear-Site-Data, puis effectue une redirection 303 propre vers callbackUrl.
        const logoutUrl = `/api/auth/logout?callbackUrl=${encodeURIComponent(callbackUrl)}`;
        window.location.replace(logoutUrl);
    }
}
