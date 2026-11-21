import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export type ActiveSpace = 'LOCATAIRE' | 'BAILLEUR';
export type UserProfileRole = 'locataire' | 'proprietaire' | 'agence';

/**
 * Gestion du stockage sécurisé universel du jeton d'authentification
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
        await SecureStore.setItemAsync('userToken', token, {
            keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
        });
    } catch (e) {
        console.warn('[Security] Erreur écriture SecureStore token:', e);
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
 * Gestion de l'espace actif (ADD-33 : RG-IDN-15 à RG-IDN-20)
 * L'espace est étanche et persiste jusqu'à la déconnexion complète.
 */
export async function getStoredSpace(): Promise<ActiveSpace | null> {
    try {
        if (Platform.OS === 'web') {
            if (typeof window !== 'undefined' && window.localStorage) {
                const item = window.localStorage.getItem('activeSpace');
                if (item === 'LOCATAIRE' || item === 'BAILLEUR') return item;
            }
            const item = await AsyncStorage.getItem('activeSpace');
            if (item === 'LOCATAIRE' || item === 'BAILLEUR') return item;
            return null;
        }
        const item = await SecureStore.getItemAsync('activeSpace');
        if (item === 'LOCATAIRE' || item === 'BAILLEUR') return item;
        return null;
    } catch {
        try {
            const item = await AsyncStorage.getItem('activeSpace');
            if (item === 'LOCATAIRE' || item === 'BAILLEUR') return item;
        } catch {}
        return null;
    }
}

export async function setStoredSpace(space: ActiveSpace): Promise<void> {
    try {
        if (Platform.OS === 'web') {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem('activeSpace', space);
            }
            await AsyncStorage.setItem('activeSpace', space);
            return;
        }
        await SecureStore.setItemAsync('activeSpace', space);
    } catch {
        try {
            await AsyncStorage.setItem('activeSpace', space);
        } catch {}
    }
}

export async function removeStoredSpace(): Promise<void> {
    try {
        if (Platform.OS === 'web') {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.removeItem('activeSpace');
            }
            await AsyncStorage.removeItem('activeSpace');
            return;
        }
        await SecureStore.deleteItemAsync('activeSpace');
    } catch {
        try {
            await AsyncStorage.removeItem('activeSpace');
        } catch {}
    }
}

export async function getStoredProfile(): Promise<UserProfileRole | null> {
    try {
        const item = await AsyncStorage.getItem('userProfileRole');
        if (item === 'locataire' || item === 'proprietaire' || item === 'agence') return item;
        return null;
    } catch {
        return null;
    }
}

export async function setStoredProfile(profile: UserProfileRole): Promise<void> {
    try {
        await AsyncStorage.setItem('userProfileRole', profile);
    } catch {}
}

export async function removeStoredProfile(): Promise<void> {
    try {
        await AsyncStorage.removeItem('userProfileRole');
    } catch {}
}

/**
 * Purge intégrale et irréversible de la session mobile (Web & Native)
 * Conforme RG-IDN-19 : déconnexion totale avant bascule d'espace.
 */
export async function clearAppSessionAndCache(): Promise<void> {
    try {
        await removeStoredToken();
        await removeStoredSpace();
        await removeStoredProfile();

        if (Platform.OS === 'web') {
            if (typeof window !== 'undefined') {
                try { window.localStorage.clear(); } catch {}
                try { window.sessionStorage.clear(); } catch {}
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
 * Déconnexion totale et retour immédiat au sélecteur d'espace
 */
export async function logoutAndRedirect(router: any): Promise<void> {
    try {
        await clearAppSessionAndCache();
    } catch (err) {
        console.warn('Erreur clearAppSessionAndCache:', err);
    }
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location) {
        window.location.href = '/select-space';
    } else {
        try {
            if (router.canDismiss && router.canDismiss()) {
                router.dismissAll();
            }
        } catch {}
        router.replace('/select-space' as any);
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

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const token = await getStoredToken();
    const space = await getStoredSpace();
    
    const headers = new Headers(options.headers || {});
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    if (space) {
        headers.set('X-Qapril-Espace', space);
    }
    headers.set('Content-Type', 'application/json');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    let targetUrl = endpoint.startsWith('http')
        ? endpoint
        : endpoint.startsWith('/api/')
            ? `${API_URL.replace(/\/api\/mobile$/, '')}${endpoint}`
            : `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    // Forcer le chiffrement TLS/HTTPS en production
    if (targetUrl.startsWith('http://') && !targetUrl.includes('localhost') && !targetUrl.includes('127.0.0.1')) {
        targetUrl = targetUrl.replace('http://', 'https://');
    }

    try {
        const response = await fetch(targetUrl, {
            ...options,
            signal: controller.signal,
            headers,
        });

        if (response.status === 401) {
            await clearAppSessionAndCache();
            throw new Error('Non autorisé. Veuillez vous reconnecter.');
        }

        return response;
    } finally {
        clearTimeout(timeoutId);
    }
}
