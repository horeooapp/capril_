import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Gestion du stockage sécurisé universel (Web, Android, iOS)
 */
export async function getStoredToken(): Promise<string | null> {
    try {
        if (Platform.OS === 'web') {
            if (typeof window !== 'undefined' && window.localStorage) {
                const item = window.localStorage.getItem('userToken');
                if (item) return item;
            }
            return await AsyncStorage.getItem('userToken');
        }
        return await SecureStore.getItemAsync('userToken');
    } catch {
        try {
            return await AsyncStorage.getItem('userToken');
        } catch {
            return null;
        }
    }
}

export async function setStoredToken(token: string): Promise<void> {
    try {
        if (Platform.OS === 'web') {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem('userToken', token);
            }
            await AsyncStorage.setItem('userToken', token);
            return;
        }
        await SecureStore.setItemAsync('userToken', token);
    } catch {
        try {
            await AsyncStorage.setItem('userToken', token);
        } catch {}
    }
}

export async function removeStoredToken(): Promise<void> {
    try {
        if (Platform.OS === 'web') {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.removeItem('userToken');
            }
            await AsyncStorage.removeItem('userToken');
            return;
        }
        await SecureStore.deleteItemAsync('userToken');
    } catch {
        try {
            await AsyncStorage.removeItem('userToken');
        } catch {}
    }
}

/**
 * Purge intégrale et irréversible de la session mobile locataire et de ses caches (Web & Native)
 */
export async function clearAppSessionAndCache(): Promise<void> {
    try {
        await removeStoredToken();

        if (Platform.OS === 'web') {
            if (typeof window !== 'undefined') {
                try {
                    window.localStorage.clear();
                } catch {}
                try {
                    window.sessionStorage.clear();
                } catch {}
                try {
                    const cookies = document.cookie.split(';');
                    for (let i = 0; i < cookies.length; i++) {
                        const cookie = cookies[i];
                        const eqPos = cookie.indexOf('=');
                        const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
                        if (name) {
                            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`;
                        }
                    }
                } catch {}
                if ('caches' in window) {
                    try {
                        const keys = await window.caches.keys();
                        await Promise.all(keys.map(k => window.caches.delete(k)));
                    } catch {}
                }
            }
        }

        try {
            await AsyncStorage.clear();
        } catch {}
    } catch (e) {
        console.warn("Erreur lors de la purge de session mobile:", e);
    }
}

/**
 * Déconnexion totale et redirection vers l'écran d'authentification /login
 */
export async function logoutAndRedirect(router: any): Promise<void> {
    try {
        await clearAppSessionAndCache();
    } catch (err) {
        console.warn('Erreur clearAppSessionAndCache:', err);
    }
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location) {
        window.location.href = '/login';
    } else {
        try {
            if (router.canDismiss && router.canDismiss()) {
                router.dismissAll();
            }
        } catch {}
        router.replace('/login');
    }
}

// Détection dynamique et sécurisée de l'URL API (Production QAPRIL)
const getApiUrl = () => {
    if (process.env.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL;
    }
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:3000/api/mobile';
        }
        return 'https://qapril.net/api/mobile';
    }
    return 'https://qapril.net/api/mobile';
};

export const API_URL = getApiUrl();

export async function getHasSeenOnboarding(): Promise<boolean> {
    try {
        if (Platform.OS === 'web') {
            if (typeof window !== 'undefined' && window.localStorage) {
                return window.localStorage.getItem('hasSeenOnboarding') === 'true';
            }
            const item = await AsyncStorage.getItem('hasSeenOnboarding');
            return item === 'true';
        }
        const item = await AsyncStorage.getItem('hasSeenOnboarding');
        return item === 'true';
    } catch {
        return false;
    }
}

export async function setHasSeenOnboarding(): Promise<void> {
    try {
        if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem('hasSeenOnboarding', 'true');
        }
        await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    } catch {}
}

/**
 * Wrapper autour de fetch qui injecte automatiquement le token JWT avec gestion de timeout.
 */
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const token = await getStoredToken();
    
    const headers = new Headers(options.headers || {});
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const targetUrl = endpoint.startsWith('http')
        ? endpoint
        : endpoint.startsWith('/api/')
            ? `${API_URL.replace(/\/api\/mobile$/, '')}${endpoint}`
            : `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    try {
        const response = await fetch(targetUrl, {
            ...options,
            signal: controller.signal,
            headers,
        });

        if (response.status === 401) {
            await removeStoredToken();
            throw new Error('Non autorisé. Veuillez vous reconnecter.');
        }

        return response;
    } finally {
        clearTimeout(timeoutId);
    }
}
