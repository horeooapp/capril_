"use client";

import { signOut } from "next-auth/react";

/**
 * Universal client-side logout handler.
 * Completely clears NextAuth sessions, tokens and cookies, then hard-navigates to callbackUrl.
 */
export async function executeLogout(callbackUrl = "/login") {
    try {
        await signOut({ callbackUrl, redirect: true });
    } catch {
        // Fallback hard navigation if NextAuth client router catches an anomaly
        window.location.href = callbackUrl;
    }
}

